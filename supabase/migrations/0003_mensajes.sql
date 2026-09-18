-- =============================================================================
-- PIYC — Migración 0003: registro de leads del formulario de contacto
-- =============================================================================
--
-- REQUISITO: 0001_contenido.sql (helper `is_manager()`).
--
-- CÓMO FUNCIONA EL CONTACTO
-- El contacto es SOLO por WhatsApp (no hay SMTP). Al enviar el formulario:
--   1. El servidor valida (honeypot, 3 s mínimos medidos con el reloj del
--      visitante, longitudes máximas, tope por IP) y guarda la fila aquí con la
--      clave service-role.
--   2. El cliente abre WhatsApp con el mensaje armado hacia el número de
--      `site_settings.contact.whatsappFormulario`. El destino sale SIEMPRE de los
--      ajustes, nunca del payload: tomarlo del formulario lo vuelve un relay.
-- Así, aunque la persona cierre WhatsApp sin enviar, el lead queda registrado.
--
-- SEGURIDAD — LO IMPORTANTE
-- RLS habilitada y UNA sola política: SELECT para managers. Nunca una política
-- de INSERT para `anon` (la clave anon es pública: con ella cualquiera podría
-- llenar la tabla directo contra la API REST, saltándose los filtros). La
-- service-role no pasa por RLS.
--
-- Es idempotente: se puede volver a ejecutar sin duplicar nada.
-- =============================================================================

begin;

create table if not exists public.site_mensajes (
  id         uuid primary key default gen_random_uuid(),
  nombre     text not null check (char_length(nombre)   between 1 and 200),
  empresa    text not null check (char_length(empresa)  between 1 and 200),
  email      text          check (char_length(email)    <= 320),
  telefono   text not null check (char_length(telefono) between 1 and 50),
  servicio   text          check (char_length(servicio) <= 200),
  mensaje    text not null check (char_length(mensaje)  between 1 and 5000),
  canal      text not null default 'whatsapp' check (canal in ('whatsapp')),
  destino    text          check (char_length(destino)  <= 32),
  ip_hash    text          check (char_length(ip_hash)  <= 128),
  created_at timestamptz not null default now()
);

comment on table public.site_mensajes is
  'Leads del formulario de /contacto. Se insertan SOLO desde el servidor con la service-role; la RLS solo permite SELECT a managers.';
comment on column public.site_mensajes.canal is
  'Por dónde siguió la conversación. Hoy solo whatsapp.';
comment on column public.site_mensajes.destino is
  'Número de WhatsApp al que se dirigió el lead (contact.whatsappFormulario en ese momento; es editable desde el panel).';
comment on column public.site_mensajes.ip_hash is
  'Hash (con sal del servidor) de la IP del visitante. Sirve para el tope por IP; nunca se guarda la IP en claro.';

-- Bandeja: de lo más nuevo a lo más viejo.
create index if not exists site_mensajes_created_at_idx
  on public.site_mensajes (created_at desc);

-- Tope por IP: «¿cuántos envíos hizo este hash en los últimos N minutos?».
create index if not exists site_mensajes_ip_hash_idx
  on public.site_mensajes (ip_hash, created_at desc)
  where ip_hash is not null;

alter table public.site_mensajes enable row level security;

drop policy if exists site_mensajes_select_manager on public.site_mensajes;
create policy site_mensajes_select_manager on public.site_mensajes
  for select to authenticated using ((select private.is_manager()));

revoke all on public.site_mensajes from anon, authenticated;
grant select on public.site_mensajes to authenticated;
grant all on public.site_mensajes to service_role;

commit;
