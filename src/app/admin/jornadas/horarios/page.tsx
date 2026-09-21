import { requireManager } from "@/lib/supabase/auth";
import { AyudaSeccion, CabeceraPanel, EstadoVacio } from "@/components/admin/ui";

export const dynamic = "force-dynamic";

/**
 * HORARIOS MENSUALES — MARCADOR
 * =============================
 * A esta ruta apunta el enlace «Horarios mensuales» de `/admin/equipo`. La
 * pantalla la construye el agente del módulo de jornadas sobre la tabla
 * `horarios_mensuales` (migración 0002): `anio`, `mes`, `dias` (jsonb) y
 * `notas`, con `unique(anio, mes)`.
 *
 * POR QUÉ EL ENLACE ESTÁ EN «EQUIPO» Y LA PANTALLA EN «JORNADAS»
 * --------------------------------------------------------------
 * Porque quien busca los horarios los busca junto a las personas, pero lo que
 * hacen es alimentar el cálculo de las jornadas: el desglose de una jornada se
 * congela al aprobarla, y corregir un horario después NO debe alterar una
 * jornada ya aprobada. Manteniendo la pantalla dentro de `/admin/jornadas`, esa
 * relación queda a la vista de quien la programe.
 */
export default async function HorariosPage() {
  await requireManager();

  return (
    <>
      <CabeceraPanel
        title="Horarios mensuales"
        description="El calendario laboral de cada mes: qué días son hábiles, cuáles festivos y cuál es la jornada esperada."
        backHref="/admin/equipo"
        backLabel="Volver a Equipo"
        breadcrumb={[
          { label: "Panel", href: "/admin" },
          { label: "Jornadas", href: "/admin/jornadas" },
          { label: "Horarios mensuales" },
        ]}
      />

      <AyudaSeccion tono="aviso" title="Sección en construcción" className="mb-6">
        Los horarios mensuales se construyen junto con el módulo de jornadas: es
        con ellos que se calculan los recargos de cada turno.
      </AyudaSeccion>

      <EstadoVacio
        title="Sin horarios cargados"
        description="Aquí se definirá, mes a mes, qué días son laborables y cuál es la jornada esperada. Una vez aprobada una jornada, su cálculo queda congelado: cambiar el horario después no la altera."
      />
    </>
  );
}
