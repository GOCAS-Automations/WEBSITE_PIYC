-- =============================================================================
-- PIYC — Migración 0006: gastos reembolsables de una jornada
-- =============================================================================
--
-- REQUISITO: 0002_jornadas.sql (tabla `public.jornadas`).
--
-- POR QUÉ
-- Muchas jornadas de PIYC son en campo y la persona pone de su bolsillo el
-- almuerzo, el transporte o un repuesto de urgencia; la empresa se lo
-- reembolsa aparte. Hasta ahora eso viajaba por WhatsApp o en el campo de
-- observaciones, donde nadie lo puede sumar ni exportar. Estas columnas lo
-- guardan junto al turno al que pertenece, que es el único sitio donde quien
-- aprueba lo tiene delante al decidir.
--
-- NO ES NÓMINA Y NO ENTRA EN NINGÚN CÁLCULO
-- La nómina sigue fuera de alcance (ver `AGENTS.md`). Esto es un REEMBOLSO de
-- lo que alguien ya gastó: se registra, se muestra, se suma y se exporta tal
-- cual. El módulo sigue repartiendo HORAS, el desglose congelado
-- (`desglose` / `contexto_calculo`) no las conoce y ninguna fórmula de
-- recargos las mira. Por eso tampoco se congelan al aprobar: son un dato, no
-- el resultado de un cálculo que pueda cambiar si se corrige un horario.
--
-- QUÉ AÑADE — cuatro columnas, todas anulables:
--   · `gasto_alimentacion` alimentación y viáticos, en pesos.
--   · `gasto_transporte`   transporte (buses, taxis, peajes, gasolina).
--   · `gasto_otros`        cualquier otro gasto del bolsillo.
--   · `gasto_otros_nota`   de qué fue ese «otro» gasto. Un monto suelto sin
--                          explicación no le sirve a quien aprueba.
--
-- POR QUÉ `integer` Y NO `numeric` NI `money`
--   · En Colombia nadie anota centavos en un gasto de obra: la unidad real es
--     el peso entero, y `integer` lo guarda EXACTO (nada de binario flotante,
--     que sí perdería precisión).
--   · `money` depende de la configuración regional del servidor (`lc_monetary`)
--     y la cambia un `set`: guardar plata ahí es guardar un formato, no una
--     cifra.
--   · `numeric` sería igual de exacto, pero abre la puerta a decimales que el
--     formulario no acepta, y PostgREST lo entrega como número JSON de todas
--     formas. `integer` llega hasta 2.147.483.647 pesos: con el tope de
--     5.000.000 por campo sobra de lejos.
--
-- ANULABLES A PROPÓSITO (regla 9 de `AGENTS.md`): `NULL` = «no gastó nada» o
-- «no anotó nada», y es lo que el panel NO pinta. Un `0` sería un dato falso:
-- diría que alguien declaró explícitamente cero. Las jornadas anteriores a
-- esta migración quedan en `NULL`, que es la verdad.
--
-- TOPE DE 5.000.000 POR CAMPO: no es una regla contable, es un cinturón contra
-- el dedo gordo en el celular (sobra un cero y entran 480.000 en vez de
-- 48.000). Está también en `src/lib/jornada-types.ts` (`TOPE_GASTO`): se tocan
-- juntos. Si algún día un gasto legítimo lo supera, se sube en los dos sitios.
--
-- RLS: SIN CAMBIOS, y el trigger `jornadas_proteger_revision` de la 0004
-- TAMPOCO SE TOCA. Quien puede editar la jornada puede editar sus gastos: el
-- empleado mientras está `pendiente` y el manager cuando corrige (y corregir
-- devuelve la jornada a `pendiente`, así que una aprobada no cambia). Los
-- gastos no están en la lista de campos de revisión del trigger porque no son
-- una decisión del revisor, son lo que declaró quien trabajó.
--
-- Es idempotente: se puede volver a ejecutar sin efectos.
-- =============================================================================

begin;

alter table public.jornadas
  add column if not exists gasto_alimentacion integer,
  add column if not exists gasto_transporte   integer,
  add column if not exists gasto_otros        integer,
  add column if not exists gasto_otros_nota   text;

-- Las restricciones se recrean en vez de usar `if not exists` (que `add
-- constraint` no acepta): así la migración se puede volver a correr y así se
-- puede subir el tope sin inventar un nombre nuevo.
alter table public.jornadas
  drop constraint if exists jornadas_gastos_no_negativos;
alter table public.jornadas
  add constraint jornadas_gastos_no_negativos check (
    (gasto_alimentacion is null or (gasto_alimentacion >= 0 and gasto_alimentacion <= 5000000))
    and (gasto_transporte is null or (gasto_transporte >= 0 and gasto_transporte <= 5000000))
    and (gasto_otros      is null or (gasto_otros      >= 0 and gasto_otros      <= 5000000))
  );

alter table public.jornadas
  drop constraint if exists jornadas_gasto_otros_nota_corta;
alter table public.jornadas
  add constraint jornadas_gasto_otros_nota_corta check (
    gasto_otros_nota is null or char_length(gasto_otros_nota) <= 160
  );

comment on column public.jornadas.gasto_alimentacion is
  'Gasto de alimentación y viáticos que la persona puso de su bolsillo, en pesos colombianos ENTEROS. NULL = no gastó o no anotó. Es un reembolso: no entra en el cálculo de horas ni de recargos.';
comment on column public.jornadas.gasto_transporte is
  'Gasto de transporte (buses, taxis, peajes, gasolina) puesto de su bolsillo, en pesos colombianos ENTEROS. NULL = no gastó o no anotó.';
comment on column public.jornadas.gasto_otros is
  'Cualquier otro gasto del bolsillo (materiales, herramienta, parqueadero), en pesos colombianos ENTEROS. NULL = no gastó o no anotó. Va acompañado de gasto_otros_nota.';
comment on column public.jornadas.gasto_otros_nota is
  'De qué fue el gasto registrado en gasto_otros, en una línea. Opcional, máximo 160 caracteres. Un monto suelto sin explicación no le sirve a quien aprueba.';

commit;
