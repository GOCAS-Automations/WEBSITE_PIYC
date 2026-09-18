-- =============================================================================
-- PIYC — Migración 0001: cuentas, roles, contenido del sitio y almacenamiento
-- =============================================================================
--
-- Consolida lo que en GPI fueron las migraciones 0001, 0002, 0003, 0005 y 0007
-- (solo la parte de columnas). Se escribe sobre un esquema `public` vacío.
--
-- ROLES (tres, no más: cada rol es una matriz de RLS que hay que probar)
--   admin        → todo.
--   coordinador  → todo menos crear, modificar o eliminar administradores.
--   empleado     → solo su portal de jornadas (/mi-cuenta).
--
-- CÓMO SE CREAN LAS CUENTAS
--   Siempre desde el panel, con la Auth Admin API (clave service-role):
--     auth.admin.createUser({
--       email: '<usuario>@cuentas.piycsas.com', password, email_confirm: true,
--       app_metadata:  { role: 'empleado' | 'coordinador' | 'admin' },
--       user_metadata: { full_name, username, cargo, phone, cedula, email_contacto },
--     })
--   · El ROL se lee de `app_metadata`, que solo puede escribir la service-role.
--     Nunca de `user_metadata`: esa la controla quien se registra, y tomar el
--     rol de ahí permitiría autopromoverse a admin con un simple signUp().
--   · Una cuenta creada SIN `app_metadata.role` (registro público, o "Add user"
--     desde el Dashboard) nace como 'empleado' y DESACTIVADA. El primer admin se
--     activa a mano desde el SQL Editor:
--       update public.profiles set role = 'admin', active = true
--        where email = '<correo>';
--   · Que un coordinador no cree administradores lo valida la server action
--     (la Auth Admin API no sabe quién la llama). En la base, el trigger
--     `profiles_proteger` impide que un no-admin eleve o toque a un admin.
--
-- Es idempotente: se puede volver a ejecutar sin duplicar datos.
-- =============================================================================

begin;

-- =============================================================================
-- 1. UTILIDADES
-- =============================================================================

create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $fn$
begin
  new.updated_at = now();
  return new;
end;
$fn$;


-- =============================================================================
-- 2. PERFILES (extensión de auth.users)
-- =============================================================================

create table if not exists public.profiles (
  id             uuid primary key references auth.users (id) on delete cascade,
  email          text,
  username       text,
  full_name      text,
  role           text not null default 'empleado'
                 check (role in ('admin', 'coordinador', 'empleado')),
  cargo          text,
  phone          text,
  cedula         text,
  email_contacto text,
  active         boolean not null default true,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

create unique index if not exists profiles_username_key
  on public.profiles (username)
  where username is not null;

comment on table public.profiles is
  'Cuentas del panel y del portal de PIYC. Una fila por usuario de Supabase Auth.';
comment on column public.profiles.email is
  'Correo con el que Auth identifica la cuenta. Casi siempre el sintético <usuario>@cuentas.piycsas.com (ese dominio no recibe correo).';
comment on column public.profiles.username is
  'Usuario con el que la persona ingresa (minúsculas, sin espacios ni tildes).';
comment on column public.profiles.email_contacto is
  'Correo REAL de la persona. Informativo: no se usa para iniciar sesión.';
comment on column public.profiles.active is
  'false = cuenta desactivada: no entra al panel ni al portal, y la RLS la trata como sin permisos.';

drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();


-- 2.1 Helpers de rol ----------------------------------------------------------
-- SECURITY DEFINER: leen `profiles` como su dueño, sin pasar por la RLS de
-- `profiles` (que a su vez los usa) y así no hay recursión.
-- Con tres roles, editor de contenido y manager son el mismo conjunto; se
-- mantienen separados porque responden preguntas distintas.
--
-- Viven en el esquema `private`, que la API REST NO expone: en `public` cualquier
-- cuenta con sesión podría llamarlos por /rest/v1/rpc/... (lo marca el
-- advisor de seguridad de Supabase). Las políticas los usan como
-- `private.is_manager()`; `authenticated` necesita USAGE + EXECUTE para eso.
create schema if not exists private;
revoke all on schema private from public, anon;
grant usage on schema private to authenticated, service_role;

create or replace function private.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $fn$
  select exists (
    select 1 from public.profiles p
     where p.id = auth.uid() and p.role = 'admin' and p.active
  );
$fn$;

create or replace function private.is_content_editor()
returns boolean
language sql
stable
security definer
set search_path = ''
as $fn$
  select exists (
    select 1 from public.profiles p
     where p.id = auth.uid() and p.role in ('admin', 'coordinador') and p.active
  );
$fn$;

create or replace function private.is_manager()
returns boolean
language sql
stable
security definer
set search_path = ''
as $fn$
  select exists (
    select 1 from public.profiles p
     where p.id = auth.uid() and p.role in ('admin', 'coordinador') and p.active
  );
$fn$;

-- La cuenta que hace la petición existe y está activa. SECURITY INVOKER: lee
-- su propia fila a través de la RLS (política de lectura propia).
create or replace function private.cuenta_activa()
returns boolean
language sql
stable
set search_path = ''
as $fn$
  select exists (
    select 1 from public.profiles p
     where p.id = auth.uid() and p.active
  );
$fn$;

-- `anon` no los necesita: ninguna política dirigida a `anon` los llama.
revoke all on function private.is_admin()          from public, anon;
revoke all on function private.is_content_editor() from public, anon;
revoke all on function private.is_manager()        from public, anon;
revoke all on function private.cuenta_activa()     from public, anon;
grant execute on function private.is_admin()          to authenticated, service_role;
grant execute on function private.is_content_editor() to authenticated, service_role;
grant execute on function private.is_manager()        to authenticated, service_role;
grant execute on function private.cuenta_activa()     to authenticated, service_role;


-- 2.2 Alta automática del perfil al crear un usuario de Auth -----------------
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $fn$
declare
  v_role     text := new.raw_app_meta_data ->> 'role';
  v_active   boolean := true;
  v_username text;
begin
  -- Sin rol en app_metadata = la cuenta no la creó el panel → nace desactivada.
  if v_role is null or v_role not in ('admin', 'coordinador', 'empleado') then
    v_role   := 'empleado';
    v_active := false;
  end if;

  v_username := nullif(lower(trim(new.raw_user_meta_data ->> 'username')), '');
  if v_username is null and new.email like '%@cuentas.piycsas.com' then
    v_username := split_part(new.email, '@', 1);
  end if;

  insert into public.profiles (
    id, email, username, full_name, role, cargo, phone, cedula, email_contacto, active
  ) values (
    new.id,
    new.email,
    v_username,
    coalesce(nullif(new.raw_user_meta_data ->> 'full_name', ''), v_username, new.email),
    v_role,
    nullif(new.raw_user_meta_data ->> 'cargo', ''),
    nullif(new.raw_user_meta_data ->> 'phone', ''),
    nullif(new.raw_user_meta_data ->> 'cedula', ''),
    nullif(new.raw_user_meta_data ->> 'email_contacto', ''),
    v_active
  )
  on conflict (id) do nothing;

  return new;
end;
$fn$;

revoke all on function public.handle_new_user() from public, anon, authenticated;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();


-- 2.3 Guardia de roles --------------------------------------------------------
-- Aplica solo a peticiones con sesión (rol `authenticated`). La service-role,
-- el SQL Editor y el trigger de Auth quedan fuera: son el servidor.
--   · Nadie cambia su propio rol ni se desactiva a sí mismo.
--   · Solo un admin crea, eleva, modifica o elimina administradores.
create or replace function public.profiles_proteger()
returns trigger
language plpgsql
set search_path = ''
as $fn$
declare
  v_uid uuid := auth.uid();
begin
  if current_user <> 'authenticated' then
    return coalesce(new, old);
  end if;

  if tg_op = 'DELETE' then
    if old.role = 'admin' and not private.is_admin() then
      raise exception 'Solo un administrador puede eliminar a otro administrador.'
        using errcode = '42501';
    end if;
    return old;
  end if;

  if tg_op = 'UPDATE' then
    if new.id is distinct from old.id then
      raise exception 'El identificador de una cuenta no se puede cambiar.'
        using errcode = '42501';
    end if;
    if old.id = v_uid and new.role is distinct from old.role then
      raise exception 'No puedes cambiar tu propio rol.' using errcode = '42501';
    end if;
    if old.id = v_uid and new.active is distinct from old.active then
      raise exception 'No puedes desactivar ni reactivar tu propia cuenta.'
        using errcode = '42501';
    end if;
    if old.role = 'admin' and not private.is_admin() then
      raise exception 'Solo un administrador puede modificar a otro administrador.'
        using errcode = '42501';
    end if;
  end if;

  if new.role = 'admin' and not private.is_admin() then
    raise exception 'Solo un administrador puede crear o elevar administradores.'
      using errcode = '42501';
  end if;

  return new;
end;
$fn$;

drop trigger if exists profiles_proteger on public.profiles;
create trigger profiles_proteger
  before insert or update or delete on public.profiles
  for each row execute function public.profiles_proteger();


-- =============================================================================
-- 3. CONTENIDO DEL SITIO (prefijo site_)
--    En la base nunca van rutas `/images/...`: todo es una URL del bucket
--    `site-images` o de un host externo permitido (ver src/lib/imagenes.ts).
-- =============================================================================

create table if not exists public.site_services (
  id               uuid primary key default gen_random_uuid(),
  slug             text not null unique,
  title            text not null,
  nav_title        text,
  icon_key         text,
  summary          text,
  description      text,
  items            jsonb not null default '[]'::jsonb,
  images           jsonb not null default '{}'::jsonb,
  video            jsonb,
  meta_title       text,
  meta_description text,
  sort             integer not null default 0,
  published        boolean not null default true,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

comment on column public.site_services.items is
  'Lista de alcances del servicio: ["ítem 1", "ítem 2"].';
comment on column public.site_services.images is
  '{ "cover": "url", "coverAlt": "...", "gallery": [{ "src": "url", "alt": "..." }] }';
comment on column public.site_services.video is
  'Video de YouTube: { "url", "titulo", "descripcion", "visible" }. NULL = sin video. El id se deriva de la URL al leer (src/lib/youtube.ts).';

create table if not exists public.site_projects (
  id          uuid primary key default gen_random_uuid(),
  slug        text not null unique,
  title       text not null,
  client      text,
  description text,
  body        text,
  images      jsonb not null default '{}'::jsonb,
  sort        integer not null default 0,
  published   boolean not null default true,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

comment on column public.site_projects.description is 'Descripción corta (tarjeta).';
comment on column public.site_projects.body is
  'Descripción larga de la página del proyecto. NULL o vacío = se usa la corta.';
comment on column public.site_projects.images is
  '{ "cover": "url", "coverAlt": "...", "gallery": [{ "src": "url", "alt": "..." }] }';

create table if not exists public.site_values (
  id          uuid primary key default gen_random_uuid(),
  title       text not null,
  description text,
  icon_key    text,
  sort        integer not null default 0,
  published   boolean not null default true,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- Claves: home, nosotros, paginas, contact, seo, jornada_config.
create table if not exists public.site_settings (
  key        text primary key,
  value      jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

comment on table public.site_settings is
  'Ajustes clave → JSON. Todos son públicos salvo jornada_config (solo cuentas con sesión).';

do $do$
declare
  t text;
begin
  foreach t in array array['site_services', 'site_projects', 'site_values', 'site_settings']
  loop
    execute format('drop trigger if exists %I on public.%I', t || '_set_updated_at', t);
    execute format(
      'create trigger %I before update on public.%I
         for each row execute function public.set_updated_at()',
      t || '_set_updated_at', t
    );
  end loop;
end;
$do$;


-- =============================================================================
-- 4. ROW LEVEL SECURITY
-- =============================================================================

alter table public.profiles      enable row level security;
alter table public.site_services enable row level security;
alter table public.site_projects enable row level security;
alter table public.site_values   enable row level security;
alter table public.site_settings enable row level security;

-- 4.1 profiles ----------------------------------------------------------------
-- Cada quien lee SOLO su fila; los managers leen todas. Para mostrar nombres de
-- compañeros a un empleado hay que completar con la service-role (y solo
-- nombre y cargo). Sin INSERT ni DELETE para `authenticated`: las cuentas se
-- crean y se borran con la Auth Admin API (el borrado cae en cascada).
drop policy if exists profiles_select on public.profiles;
drop policy if exists profiles_update_manager on public.profiles;

create policy profiles_select on public.profiles
  for select to authenticated
  using (id = (select auth.uid()) or (select private.is_manager()));

create policy profiles_update_manager on public.profiles
  for update to authenticated
  using ((select private.is_manager()))
  with check ((select private.is_manager()));

-- 4.2 Tablas de contenido con `published` ------------------------------------
--   anon          → solo lo publicado.
--   authenticated → lo publicado, o todo si es editor de contenido.
--   escritura     → solo editores de contenido.
do $do$
declare
  t text;
begin
  foreach t in array array['site_services', 'site_projects', 'site_values']
  loop
    execute format('drop policy if exists %I on public.%I', t || '_select_anon', t);
    execute format('drop policy if exists %I on public.%I', t || '_select_auth', t);
    execute format('drop policy if exists %I on public.%I', t || '_insert_editor', t);
    execute format('drop policy if exists %I on public.%I', t || '_update_editor', t);
    execute format('drop policy if exists %I on public.%I', t || '_delete_editor', t);

    execute format(
      'create policy %I on public.%I for select to anon using (published)',
      t || '_select_anon', t);
    execute format(
      'create policy %I on public.%I for select to authenticated
         using (published or (select private.is_content_editor()))',
      t || '_select_auth', t);
    execute format(
      'create policy %I on public.%I for insert to authenticated
         with check ((select private.is_content_editor()))',
      t || '_insert_editor', t);
    execute format(
      'create policy %I on public.%I for update to authenticated
         using ((select private.is_content_editor()))
         with check ((select private.is_content_editor()))',
      t || '_update_editor', t);
    execute format(
      'create policy %I on public.%I for delete to authenticated
         using ((select private.is_content_editor()))',
      t || '_delete_editor', t);
  end loop;
end;
$do$;

-- 4.3 site_settings -----------------------------------------------------------
drop policy if exists site_settings_select_anon    on public.site_settings;
drop policy if exists site_settings_select_auth    on public.site_settings;
drop policy if exists site_settings_insert_editor  on public.site_settings;
drop policy if exists site_settings_update_editor  on public.site_settings;
drop policy if exists site_settings_delete_editor  on public.site_settings;

create policy site_settings_select_anon on public.site_settings
  for select to anon using (key <> 'jornada_config');
create policy site_settings_select_auth on public.site_settings
  for select to authenticated using (true);
create policy site_settings_insert_editor on public.site_settings
  for insert to authenticated with check ((select private.is_content_editor()));
create policy site_settings_update_editor on public.site_settings
  for update to authenticated
  using ((select private.is_content_editor()))
  with check ((select private.is_content_editor()));
create policy site_settings_delete_editor on public.site_settings
  for delete to authenticated using ((select private.is_content_editor()));

-- 4.4 Privilegios de tabla (mínimos; la RLS decide las filas) ----------------
revoke all on public.profiles, public.site_services, public.site_projects,
              public.site_values, public.site_settings
  from anon, authenticated;

grant select on public.site_services, public.site_projects,
                public.site_values, public.site_settings
  to anon;
grant select, insert, update, delete
  on public.site_services, public.site_projects, public.site_values, public.site_settings
  to authenticated;
grant select, update on public.profiles to authenticated;


-- =============================================================================
-- 5. STORAGE — bucket público `site-images`
--    Carpetas por convención: inicio/, nosotros/, servicios/, proyectos/,
--    cabeceras/. Todo se sube ya comprimido (WebP, ≤ 1920 px).
--
--    Lectura pública: la da el bucket público (URL /storage/v1/object/public/…),
--    no hace falta política de SELECT para `anon` — y no ponerla evita que
--    cualquiera pueda LISTAR el bucket. Los editores sí pueden listarlo.
-- =============================================================================

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'site-images', 'site-images', true, 5242880,
  array['image/webp', 'image/jpeg', 'image/png', 'image/avif']
)
on conflict (id) do update
  set public             = excluded.public,
      file_size_limit    = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists site_images_editor_select on storage.objects;
drop policy if exists site_images_editor_insert on storage.objects;
drop policy if exists site_images_editor_update on storage.objects;
drop policy if exists site_images_editor_delete on storage.objects;

create policy site_images_editor_select on storage.objects
  for select to authenticated
  using (bucket_id = 'site-images' and (select private.is_content_editor()));
create policy site_images_editor_insert on storage.objects
  for insert to authenticated
  with check (bucket_id = 'site-images' and (select private.is_content_editor()));
create policy site_images_editor_update on storage.objects
  for update to authenticated
  using (bucket_id = 'site-images' and (select private.is_content_editor()))
  with check (bucket_id = 'site-images' and (select private.is_content_editor()));
create policy site_images_editor_delete on storage.objects
  for delete to authenticated
  using (bucket_id = 'site-images' and (select private.is_content_editor()));


-- =============================================================================
-- 6. SEMILLA — datos de contacto confirmados
--    El destino del formulario (`whatsappFormulario`) sale SIEMPRE de aquí,
--    nunca del payload del formulario.
-- =============================================================================

insert into public.site_settings (key, value) values
(
  'contact',
  '{
    "companyName": "PIYC",
    "legalName": "Programación Industrial y Control S.A.S.",
    "nit": "901.161.923",
    "tagline": "Tu socio confiable en soluciones industriales",
    "address": {
      "street": "Cl. 33 #5-76",
      "area": "Comuna 4",
      "city": "Cali",
      "region": "Valle del Cauca",
      "country": "Colombia",
      "full": "Cl. 33 #5-76, Comuna 4, Cali, Valle del Cauca"
    },
    "phones": [
      { "label": "+57 321 761 7958", "intl": "573217617958" }
    ],
    "whatsapp": [
      { "label": "+57 321 761 7958", "intl": "573217617958", "person": null, "principal": true },
      { "label": "+57 310 637 3483", "intl": "573106373483", "person": "Jorge Castillo", "principal": false }
    ],
    "primaryWhatsApp": "573217617958",
    "whatsappFormulario": "573217617958",
    "emails": [
      { "address": "jorge.castillo@piycsas.com", "person": "Jorge Castillo" }
    ],
    "social": {
      "instagram": "https://www.instagram.com/piyc_sas/"
    },
    "siteUrl": "https://piycsas.com"
  }'::jsonb
)
on conflict (key) do nothing;

commit;
