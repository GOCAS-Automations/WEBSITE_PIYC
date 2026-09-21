-- =============================================================================
-- PIYC — Migración 0004: nadie se revisa a sí mismo + alta a nombre de otro
-- =============================================================================
--
-- REQUISITO: 0001_contenido.sql (helpers de `private`) y 0002_jornadas.sql.
--
-- Cierra los dos huecos que dejó la pasada de QA (§10 de docs/PLAN_PRUEBAS.md):
--
-- 1. AUTOAPROBACIÓN. `jornadas_update` deja a cualquier manager tocar cualquier
--    fila, incluida la suya: la acción del panel lo impedía, pero la base no, y
--    bastaba una llamada REST con la clave anónima y una sesión de coordinador
--    para congelarse el desglose de los propios recargos. Una política no sirve
--    aquí porque `with check` no distingue columnas: un manager SÍ debe poder
--    corregir la descripción o las horas de su propia jornada; lo que no puede
--    es revisarla. Eso solo lo sabe un trigger que compare fila vieja y nueva.
--
-- 2. ALTA A NOMBRE DE OTRO. La única política de INSERT exigía
--    `employee_id = auth.uid()`, así que el panel insertaba con la clave de
--    servicio saltándose la RLS. `jornadas_insert_manager` lo devuelve al
--    cliente de sesión, con la misma exigencia que ya hacía el servidor: la
--    cuenta destino existe y está activa, y la jornada nace 'pendiente' y sin
--    desglose.
--
-- EL SERVIDOR SIGUE PUDIENDO TODO: el trigger solo actúa sobre peticiones con
-- rol `authenticated` y con `auth.uid()` presente. La clave de servicio, el
-- editor SQL y las acciones referenciales (el `on delete set null` de
-- `reviewed_by`) no se ven afectados; son el servidor, no una sesión.
--
-- Es idempotente: se puede volver a ejecutar sin duplicar nada.
-- =============================================================================

begin;

-- =============================================================================
-- 1. HELPER — ¿esa otra cuenta existe y está activa?
--    En `private` (la API REST no expone ese esquema, lo pide el advisor de
--    seguridad). SECURITY DEFINER porque la RLS de `profiles` solo deja a cada
--    quien leer su propia fila: la política de INSERT no puede depender de que
--    el que inserta alcance a ver la fila del destinatario.
-- =============================================================================

create or replace function private.perfil_activo(p_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $fn$
  select exists (
    select 1 from public.profiles p
     where p.id = p_id and p.active
  );
$fn$;

comment on function private.perfil_activo(uuid) is
  'La cuenta indicada existe y está activa. Para políticas que miran a un tercero, no al solicitante.';

revoke all on function private.perfil_activo(uuid) from public, anon;
grant execute on function private.perfil_activo(uuid) to authenticated, service_role;


-- =============================================================================
-- 2. TRIGGER — nadie revisa su propia jornada, ni siquiera un admin
--    Campos de revisión: status, review_note, reviewed_by, reviewed_at y el
--    congelado (desglose, contexto_calculo, calculado_at). Cambiar cualquiera
--    de ellos en una fila propia es revisarse a sí mismo.
--    También se mira `new.employee_id` para que nadie pase una jornada ajena a
--    su nombre y la revise en el mismo UPDATE.
-- =============================================================================

create or replace function public.jornadas_proteger_revision()
returns trigger
language plpgsql
set search_path = ''
as $fn$
declare
  v_uid uuid := auth.uid();
begin
  -- Sin sesión (service-role, editor SQL) o fuera del rol `authenticated`: es
  -- el servidor haciendo tareas administrativas, no alguien revisándose.
  if v_uid is null or current_user <> 'authenticated' then
    return new;
  end if;

  if old.employee_id = v_uid or new.employee_id = v_uid then
    if new.status           is distinct from old.status
    or new.review_note      is distinct from old.review_note
    or new.reviewed_by      is distinct from old.reviewed_by
    or new.reviewed_at      is distinct from old.reviewed_at
    or new.desglose         is distinct from old.desglose
    or new.contexto_calculo is distinct from old.contexto_calculo
    or new.calculado_at     is distinct from old.calculado_at
    then
      raise exception
        'No puedes revisar tu propia jornada. Pídele la revisión a otro coordinador o al administrador.'
        using errcode = '42501';
    end if;
  end if;

  return new;
end;
$fn$;

comment on function public.jornadas_proteger_revision() is
  'Impide que una sesión apruebe, rechace, reabra o congele el desglose de su propia jornada. La service-role queda fuera.';

revoke all on function public.jornadas_proteger_revision() from public, anon, authenticated;

drop trigger if exists jornadas_proteger_revision on public.jornadas;
create trigger jornadas_proteger_revision
  before update on public.jornadas
  for each row execute function public.jornadas_proteger_revision();


-- =============================================================================
-- 3. POLÍTICA — un manager registra jornadas a nombre de otra cuenta activa
--    Las políticas de INSERT se suman (OR): `jornadas_insert_propia` sigue
--    cubriendo al empleado que registra lo suyo desde el portal.
--    La jornada nace SIEMPRE 'pendiente', sin revisor y sin congelado: quien
--    registra no revisa (el congelado lo pone la aprobación, y la restricción
--    `jornadas_snapshot_solo_aprobada` ya lo exige por su cuenta).
-- =============================================================================

drop policy if exists jornadas_insert_manager on public.jornadas;

create policy jornadas_insert_manager on public.jornadas
  for insert to authenticated
  with check (
    (select private.is_manager())
    and status = 'pendiente'
    and review_note is null
    and reviewed_by is null
    and reviewed_at is null
    and desglose is null
    and contexto_calculo is null
    and calculado_at is null
    -- Sin envolver en `(select …)`: depende de la fila, así que no hay nada que
    -- cachear (a diferencia de `is_manager()`, igual para toda la sentencia).
    and private.perfil_activo(employee_id)
  );

commit;
