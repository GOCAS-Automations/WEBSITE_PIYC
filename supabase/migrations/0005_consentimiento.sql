-- =============================================================================
-- PIYC — Migración 0005: constancia de la autorización de tratamiento de datos
-- =============================================================================
--
-- REQUISITO: 0003_mensajes.sql (tabla `public.site_mensajes`).
--
-- POR QUÉ
-- La Ley 1581 de 2012 (art. 9) exige una autorización PREVIA, EXPRESA E
-- INFORMADA del titular para tratar sus datos, y el Decreto 1074 de 2015
-- (art. 2.2.2.25.2.4) obliga al responsable a CONSERVAR PRUEBA de esa
-- autorización. Una casilla marcada en el navegador no prueba nada: la
-- constancia tiene que quedar junto al dato.
--
-- QUÉ AÑADE — dos columnas, las dos anulables:
--   · `autorizacion_at`      cuándo se otorgó (hora del servidor, no del
--                            cliente: la del visitante es manipulable).
--   · `autorizacion_version` qué texto se aceptó — la versión, o la fecha de
--                            vigencia, de la política publicada en ese
--                            momento. Sale de `site_settings.paginas`
--                            (`tratamientoDatos`), nunca del formulario.
--
-- ANULABLES A PROPÓSITO: las filas anteriores a esta migración son leads
-- legítimos recogidos sin la casilla, y ponerles una fecha inventada sería
-- fabricar una prueba. `null` significa «no consta», que es la verdad.
-- Desde que el código valida la autorización en el servidor, toda fila nueva
-- llega con `autorizacion_at`; mientras esta migración no se aplique, el
-- endpoint reintenta la inserción sin estas columnas y deja el aviso en el log.
--
-- RLS: SIN CAMBIOS. Sigue habiendo una sola política (`SELECT` para managers)
-- y los `grant` de la 0003 se conservan. No se toca nada más de la tabla.
--
-- Es idempotente: se puede volver a ejecutar sin efectos.
-- =============================================================================

begin;

alter table public.site_mensajes
  add column if not exists autorizacion_at      timestamptz,
  add column if not exists autorizacion_version text
    check (char_length(autorizacion_version) <= 40);

comment on column public.site_mensajes.autorizacion_at is
  'Fecha y hora (del servidor) en que el titular marcó la casilla de autorización de tratamiento de datos en el formulario público. NULL = fila anterior a la casilla: no consta.';
comment on column public.site_mensajes.autorizacion_version is
  'Versión (o fecha de vigencia) de la política de tratamiento de datos que estaba publicada cuando se otorgó la autorización. Sale de site_settings.paginas -> tratamientoDatos; nunca del payload del formulario.';

commit;
