-- =============================================================================
-- PIYC — Migración 0002: jornadas laborales y horarios mensuales
-- =============================================================================
--
-- REQUISITO: 0001_contenido.sql (tabla `profiles` y helpers de rol).
--
-- Consolida lo que en GPI fueron las migraciones 0002 (jornadas), 0003
-- (horarios mensuales), 0004 (desglose congelado) y 0005 (orden de trabajo
-- opcional). Aquí `desglose`, `contexto_calculo` y `calculado_at` existen desde
-- el primer día.
--
-- EL DESGLOSE SE CONGELA AL APROBAR: el servidor calcula una sola vez y guarda
-- el resultado junto con el contexto que usó (horario del día, recargos,
-- topes). Corregir después un horario o un recargo NO altera una jornada ya
-- aprobada. Una jornada que no está aprobada no guarda snapshot (restricción
-- `jornadas_snapshot_solo_aprobada`), así nadie puede inyectar cifras en una
-- pendiente y hacerlas pasar por aprobadas.
--
-- Es idempotente: se puede volver a ejecutar sin duplicar datos.
-- =============================================================================

begin;

-- =============================================================================
-- 1. JORNADAS
--    start_at / end_at son timestamptz: un turno puede cruzar la medianoche
--    (end_at cae en el día siguiente a work_date).
-- =============================================================================

create table if not exists public.jornadas (
  id               uuid primary key default gen_random_uuid(),
  employee_id      uuid not null references public.profiles (id) on delete cascade,
  work_order       text,
  work_date        date not null,
  start_at         timestamptz not null,
  end_at           timestamptz not null,
  description      text not null,
  observations     text,
  status           text not null default 'pendiente'
                   check (status in ('pendiente', 'aprobada', 'rechazada')),
  review_note      text,
  reviewed_by      uuid references public.profiles (id) on delete set null,
  reviewed_at      timestamptz,
  desglose         jsonb,
  contexto_calculo jsonb,
  calculado_at     timestamptz,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now(),
  constraint jornadas_fin_despues_de_inicio check (end_at > start_at),
  constraint jornadas_duracion_maxima check (end_at - start_at <= interval '24 hours'),
  constraint jornadas_snapshot_solo_aprobada check (
    status = 'aprobada'
    or (desglose is null and contexto_calculo is null and calculado_at is null)
  )
);

comment on table public.jornadas is
  'Jornadas laborales registradas por el equipo de PIYC (base del cálculo de horas extra).';
comment on column public.jornadas.work_order is
  'Orden de trabajo. Opcional: NULL = la labor no tenía orden asociada.';
comment on column public.jornadas.desglose is
  'Desglose de horas CONGELADO al aprobar (minutos por categoría y banderas de dominical/festivo). NULL mientras no esté aprobada.';
comment on column public.jornadas.contexto_calculo is
  'Respaldo de auditoría del cálculo congelado: horario del día aplicado, franja nocturna, recargos y topes vigentes al aprobar.';
comment on column public.jornadas.calculado_at is
  'Instante en que se congeló el desglose.';

create index if not exists jornadas_employee_fecha_idx
  on public.jornadas (employee_id, work_date desc);
create index if not exists jornadas_work_date_idx
  on public.jornadas (work_date desc);
create index if not exists jornadas_status_idx
  on public.jornadas (status);
create index if not exists jornadas_reviewed_by_idx
  on public.jornadas (reviewed_by);

drop trigger if exists jornadas_set_updated_at on public.jornadas;
create trigger jornadas_set_updated_at
  before update on public.jornadas
  for each row execute function public.set_updated_at();


-- 1.1 RLS ---------------------------------------------------------------------
--   · Cualquier cuenta activa registra y ve SUS jornadas.
--   · Edita o elimina las suyas solo mientras están 'pendiente'.
--   · Los managers ven, editan, aprueban, rechazan y eliminan todas.
--   · anon: sin acceso.
alter table public.jornadas enable row level security;

drop policy if exists jornadas_select on public.jornadas;
drop policy if exists jornadas_insert_propia on public.jornadas;
drop policy if exists jornadas_update on public.jornadas;
drop policy if exists jornadas_delete on public.jornadas;

create policy jornadas_select on public.jornadas
  for select to authenticated
  using (employee_id = (select auth.uid()) or (select private.is_manager()));

create policy jornadas_insert_propia on public.jornadas
  for insert to authenticated
  with check (
    employee_id = (select auth.uid())
    and status = 'pendiente'
    and (select private.cuenta_activa())
  );

create policy jornadas_update on public.jornadas
  for update to authenticated
  using (
    (select private.is_manager())
    or (employee_id = (select auth.uid()) and status = 'pendiente'
        and (select private.cuenta_activa()))
  )
  with check (
    (select private.is_manager())
    or (employee_id = (select auth.uid()) and status = 'pendiente')
  );

create policy jornadas_delete on public.jornadas
  for delete to authenticated
  using (
    (select private.is_manager())
    or (employee_id = (select auth.uid()) and status = 'pendiente'
        and (select private.cuenta_activa()))
  );

revoke all on public.jornadas from anon, authenticated;
grant select, insert, update, delete on public.jornadas to authenticated;


-- =============================================================================
-- 2. HORARIOS MENSUALES
--    Un registro por mes. `dias` tiene las claves lun..dom; cada una es
--      { "inicio": "08:00", "fin": "17:30", "almuerzoHoras": 1 }
--    o null si ese día NO es laboral. Jornada ordinaria neta del día =
--    (fin − inicio) − almuerzo. Lo que exceda es hora extra.
--    Sin semilla: el mes que no exista usa `jornada_config.horarioSemanal`.
-- =============================================================================

create table if not exists public.horarios_mensuales (
  id         uuid primary key default gen_random_uuid(),
  anio       integer not null check (anio between 2000 and 2200),
  mes        integer not null check (mes between 1 and 12),
  dias       jsonb not null default '{}'::jsonb,
  notas      text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint horarios_mensuales_anio_mes_key unique (anio, mes)
);

comment on table public.horarios_mensuales is
  'Horario laboral de PIYC mes a mes. Define la jornada ordinaria; el exceso es hora extra.';
comment on column public.horarios_mensuales.dias is
  'Claves lun..dom. Cada día: {"inicio":"08:00","fin":"17:30","almuerzoHoras":1} o null si no es laboral.';

drop trigger if exists horarios_mensuales_set_updated_at on public.horarios_mensuales;
create trigger horarios_mensuales_set_updated_at
  before update on public.horarios_mensuales
  for each row execute function public.set_updated_at();

-- 2.1 RLS: lo lee cualquier cuenta con sesión (el portal muestra el cálculo);
--     lo escriben solo los managers. anon: sin acceso.
alter table public.horarios_mensuales enable row level security;

drop policy if exists horarios_mensuales_select_auth      on public.horarios_mensuales;
drop policy if exists horarios_mensuales_insert_manager   on public.horarios_mensuales;
drop policy if exists horarios_mensuales_update_manager   on public.horarios_mensuales;
drop policy if exists horarios_mensuales_delete_manager   on public.horarios_mensuales;

create policy horarios_mensuales_select_auth on public.horarios_mensuales
  for select to authenticated using (true);
create policy horarios_mensuales_insert_manager on public.horarios_mensuales
  for insert to authenticated with check ((select private.is_manager()));
create policy horarios_mensuales_update_manager on public.horarios_mensuales
  for update to authenticated
  using ((select private.is_manager())) with check ((select private.is_manager()));
create policy horarios_mensuales_delete_manager on public.horarios_mensuales
  for delete to authenticated using ((select private.is_manager()));

revoke all on public.horarios_mensuales from anon, authenticated;
grant select, insert, update, delete on public.horarios_mensuales to authenticated;


-- =============================================================================
-- 3. `site_settings.jornada_config` — parámetros del cálculo
--
--    PUNTO DE PARTIDA, PENDIENTE DE CONFIRMAR CON PIYC (se edita desde el panel):
--      · horarioSemanal: horario por defecto para meses sin horario cargado.
--        Copiado del que usaba GPI (42 h netas/semana, dentro del máximo legal
--        de 2026 por la Ley 2101 de 2021). PIYC debe confirmar el suyo.
--      · inicioNocturno 19:00 / finNocturno 06:00 (Ley 2466 de 2025).
--      · Topes de horas extra: 2 h/día y 12 h/semana (Ley 50 de 1990). Solo
--        se usan para AVISAR, no para recortar.
--      · recargos: factores ADICIONALES sobre la hora ordinaria. El dominical y
--        festivo sube por tramos con la Ley 2466 de 2025 (80 % desde julio de
--        2025, 90 % desde julio de 2026, 100 % desde julio de 2027): va en 0,90.
--        Los extra dominicales suman dominical + extra (0,90 + 0,25 / + 0,75).
--      · jornadaOrdinariaInicio/Fin y horasOrdinariasDia: legado informativo;
--        la jornada ordinaria sale de `horarios_mensuales`.
-- =============================================================================

insert into public.site_settings (key, value) values
(
  'jornada_config',
  '{
    "horarioSemanal": {
      "lun": { "inicio": "08:00", "fin": "17:30", "almuerzoHoras": 1 },
      "mar": { "inicio": "08:00", "fin": "17:30", "almuerzoHoras": 1 },
      "mie": { "inicio": "08:00", "fin": "17:30", "almuerzoHoras": 1 },
      "jue": { "inicio": "08:00", "fin": "17:30", "almuerzoHoras": 1 },
      "vie": { "inicio": "08:00", "fin": "17:00", "almuerzoHoras": 1 },
      "sab": null,
      "dom": null
    },
    "jornadaOrdinariaInicio": "08:00",
    "jornadaOrdinariaFin": "17:30",
    "horasOrdinariasDia": 8.5,
    "inicioNocturno": "19:00",
    "finNocturno": "06:00",
    "limiteExtrasDia": 2,
    "limiteExtrasSemana": 12,
    "recargos": {
      "extraDiurna": 0.25,
      "extraNocturna": 0.75,
      "nocturno": 0.35,
      "dominicalFestivo": 0.90,
      "extraDominicalDiurna": 1.15,
      "extraDominicalNocturna": 1.65
    }
  }'::jsonb
)
on conflict (key) do nothing;

commit;
