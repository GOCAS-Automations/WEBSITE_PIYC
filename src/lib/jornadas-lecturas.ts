/**
 * LECTURAS DEL MÓDULO DE JORNADAS — solo servidor
 * ===============================================
 * Todas usan el cliente ligado a la SESIÓN (`getServerSupabase`), así que el
 * alcance lo decide la RLS de la migración 0002: un empleado ve únicamente sus
 * jornadas y un manager las ve todas. Aquí no se filtra por rol a mano; la
 * barrera es la base, y cada página vuelve a exigir el rol con
 * `requireManager()` o `getActiveSession()`.
 *
 * Si Supabase no responde, todo devuelve vacío y la pantalla muestra su estado
 * vacío en lugar de romperse. El módulo de jornadas NUNCA cae a un respaldo
 * estático: mostrar horas que no están en la base sería mentirle a quien las
 * revisa.
 *
 * REGLA 3 de `AGENTS.md`: la RLS de `profiles` solo deja a cada quien leer su
 * propia fila, así que los nombres de los compañeros se completan con
 * `nombresDeCompaneros()` (clave de servicio) y **solo** nombre y cargo.
 */

import { getServerSupabase } from "@/lib/supabase/server";
import { nombresDeCompaneros } from "@/lib/admin/lecturas";
import {
  claveMes,
  normalizarHorarioDias,
  type HorarioDias,
  type MapaHorarios,
} from "@/lib/horarios";
import {
  jornadaConfigDefaults,
  normalizarJornadaConfig,
  obtenerDesglose,
  sumarDesgloses,
  type DesgloseResuelto,
  type JornadaConfig,
  type TotalesJornadas,
} from "@/lib/jornada";
import {
  normalizarEstado,
  type FiltrosJornadas,
  type JornadaConPersona,
  type JornadaRecord,
} from "@/lib/jornada-types";

/* ------------------------------------------------------------------ */
/* Normalizadores                                                      */
/* ------------------------------------------------------------------ */

function texto(valor: unknown): string {
  return typeof valor === "string" ? valor : "";
}

function textoOrNull(valor: unknown): string | null {
  const v = texto(valor).trim();
  return v === "" ? null : v;
}

function filaAJornada(row: Record<string, unknown>): JornadaRecord {
  return {
    id: String(row.id),
    employee_id: texto(row.employee_id),
    work_order: textoOrNull(row.work_order),
    work_date: texto(row.work_date),
    start_at: texto(row.start_at),
    end_at: texto(row.end_at),
    description: texto(row.description),
    observations: textoOrNull(row.observations),
    status: normalizarEstado(row.status),
    review_note: textoOrNull(row.review_note),
    reviewed_by: textoOrNull(row.reviewed_by),
    reviewed_at: textoOrNull(row.reviewed_at),
    desglose: row.desglose ?? null,
    contexto_calculo: row.contexto_calculo ?? null,
    calculado_at: textoOrNull(row.calculado_at),
    created_at: texto(row.created_at),
    updated_at: texto(row.updated_at),
  };
}

/* ------------------------------------------------------------------ */
/* Parámetros del cálculo                                              */
/* ------------------------------------------------------------------ */

/**
 * `site_settings.jornada_config`. Si falta la clave o la consulta falla se usan
 * los valores por defecto: el cálculo nunca depende de que la base responda.
 */
export async function getJornadaConfig(): Promise<JornadaConfig> {
  const supabase = await getServerSupabase();
  if (!supabase) return jornadaConfigDefaults;

  try {
    const { data, error } = await supabase
      .from("site_settings")
      .select("value")
      .eq("key", "jornada_config")
      .maybeSingle();

    if (error || !data) return jornadaConfigDefaults;
    return normalizarJornadaConfig(data.value);
  } catch {
    return jornadaConfigDefaults;
  }
}

/**
 * Todos los horarios cargados, indexados por `"YYYY-MM"`. Es la entrada de
 * `calcularJornada`: con este mapa cada jornada sabe cuál era la jornada
 * ordinaria del mes en que se trabajó.
 */
export async function getMapaHorarios(): Promise<MapaHorarios> {
  const supabase = await getServerSupabase();
  if (!supabase) return {};

  try {
    const { data, error } = await supabase
      .from("horarios_mensuales")
      .select("anio, mes, dias");

    if (error || !data) return {};

    const mapa: MapaHorarios = {};
    for (const fila of data) {
      const anio = Number(fila.anio);
      const mes = Number(fila.mes);
      if (!Number.isInteger(anio) || !Number.isInteger(mes)) continue;
      mapa[claveMes(anio, mes)] = normalizarHorarioDias(fila.dias);
    }
    return mapa;
  } catch {
    return {};
  }
}

/** Config y horarios de una sola vez: lo que necesita cualquier cálculo. */
export async function getContextoJornadas(): Promise<{
  config: JornadaConfig;
  horarios: MapaHorarios;
}> {
  const [config, horarios] = await Promise.all([getJornadaConfig(), getMapaHorarios()]);
  return { config, horarios };
}

/* ------------------------------------------------------------------ */
/* Horarios mensuales                                                  */
/* ------------------------------------------------------------------ */

export interface HorarioMensualRecord {
  id: string | null;
  anio: number;
  mes: number;
  dias: HorarioDias;
  notas: string | null;
  updated_at: string | null;
}

/** Horario de un mes concreto, o `null` si todavía no está guardado. */
export async function getHorarioMensual(
  anio: number,
  mes: number,
): Promise<HorarioMensualRecord | null> {
  const supabase = await getServerSupabase();
  if (!supabase) return null;

  try {
    const { data, error } = await supabase
      .from("horarios_mensuales")
      .select("*")
      .eq("anio", anio)
      .eq("mes", mes)
      .maybeSingle();

    if (error || !data) return null;
    const fila = data as Record<string, unknown>;
    return {
      id: typeof fila.id === "string" ? fila.id : null,
      anio: Number(fila.anio),
      mes: Number(fila.mes),
      dias: normalizarHorarioDias(fila.dias),
      notas: textoOrNull(fila.notas),
      updated_at: textoOrNull(fila.updated_at),
    };
  } catch {
    return null;
  }
}

/** Los meses que ya tienen horario cargado, del más reciente al más antiguo. */
export async function listMesesConHorario(): Promise<
  { anio: number; mes: number; actualizado: string | null }[]
> {
  const supabase = await getServerSupabase();
  if (!supabase) return [];

  try {
    const { data, error } = await supabase
      .from("horarios_mensuales")
      .select("anio, mes, updated_at")
      .order("anio", { ascending: false })
      .order("mes", { ascending: false });

    if (error || !data) return [];
    return data.map((fila) => ({
      anio: Number(fila.anio),
      mes: Number(fila.mes),
      actualizado: textoOrNull(fila.updated_at),
    }));
  } catch {
    return [];
  }
}

/* ------------------------------------------------------------------ */
/* Jornadas                                                            */
/* ------------------------------------------------------------------ */

/** Tope de filas de una consulta. Nadie revisa más de esto de una sentada. */
const LIMITE_LECTURA = 1000;

/**
 * Las jornadas propias, de la más reciente a la más antigua. La RLS ya limita a
 * `employee_id = auth.uid()`, pero el filtro se repite aquí: la barrera nunca
 * debe ser una sola.
 */
export async function listMisJornadas(
  employeeId: string,
  limite = 300,
): Promise<JornadaRecord[]> {
  const supabase = await getServerSupabase();
  if (!supabase) return [];

  try {
    const { data, error } = await supabase
      .from("jornadas")
      .select("*")
      .eq("employee_id", employeeId)
      .order("work_date", { ascending: false })
      .order("start_at", { ascending: false })
      .limit(Math.min(limite, LIMITE_LECTURA));

    if (error || !data) return [];
    return data.map((fila) => filaAJornada(fila as Record<string, unknown>));
  } catch {
    return [];
  }
}

/** Una jornada por `id`. La RLS decide si quien pregunta puede verla. */
export async function getJornada(id: string): Promise<JornadaRecord | null> {
  const supabase = await getServerSupabase();
  if (!supabase || !id) return null;

  try {
    const { data, error } = await supabase
      .from("jornadas")
      .select("*")
      .eq("id", id)
      .maybeSingle();

    if (error || !data) return null;
    return filaAJornada(data as Record<string, unknown>);
  } catch {
    return null;
  }
}

/**
 * Las jornadas que cumplen los filtros, con el nombre de cada persona ya
 * resuelto. Solo tiene sentido para managers: a un empleado la RLS le devuelve
 * únicamente las suyas.
 *
 * El filtro de **orden de trabajo** es una coincidencia parcial sin distinguir
 * mayúsculas (`ilike`), porque en campo nadie escribe «OT-1042» dos veces igual.
 */
export async function listJornadasFiltradas(
  filtros: FiltrosJornadas,
): Promise<JornadaConPersona[]> {
  const supabase = await getServerSupabase();
  if (!supabase) return [];

  try {
    let consulta = supabase.from("jornadas").select("*");

    if (filtros.empleado) consulta = consulta.eq("employee_id", filtros.empleado);
    if (filtros.estado) consulta = consulta.eq("status", filtros.estado);
    if (filtros.desde) consulta = consulta.gte("work_date", filtros.desde);
    if (filtros.hasta) consulta = consulta.lte("work_date", filtros.hasta);
    if (filtros.orden) {
      // `%` y `_` son comodines de `ilike`: se escapan para que una orden que
      // los contenga se busque literalmente.
      const patron = filtros.orden.replace(/[%_\\]/g, (c) => `\\${c}`);
      consulta = consulta.ilike("work_order", `%${patron}%`);
    }

    const { data, error } = await consulta
      .order("work_date", { ascending: false })
      .order("start_at", { ascending: false })
      .limit(LIMITE_LECTURA);

    if (error || !data) return [];

    const jornadas = data.map((fila) => filaAJornada(fila as Record<string, unknown>));
    return await completarPersonas(jornadas);
  } catch {
    return [];
  }
}

/**
 * Completa cada jornada con el nombre de quien la registró y de quien la
 * revisó. Regla 3: se piden con la clave de servicio y solo nombre y cargo.
 */
export async function completarPersonas(
  jornadas: readonly JornadaRecord[],
): Promise<JornadaConPersona[]> {
  const ids = jornadas.flatMap((j) => [j.employee_id, j.reviewed_by ?? ""]);
  const nombres = await nombresDeCompaneros(ids);

  return jornadas.map((j) => {
    const persona = nombres.get(j.employee_id);
    const revisor = j.reviewed_by ? nombres.get(j.reviewed_by) : undefined;
    return {
      ...j,
      empleadoNombre: persona?.nombre ?? "Cuenta eliminada",
      empleadoCargo: persona?.cargo ?? null,
      revisorNombre: revisor?.nombre ?? null,
    };
  });
}

/* ------------------------------------------------------------------ */
/* Desgloses y totales                                                 */
/* ------------------------------------------------------------------ */

/**
 * Resuelve el desglose de una lista de jornadas con la **regla de lectura
 * única**: lo congelado si existe, calculado en vivo si no.
 */
export function resolverDesgloses(
  jornadas: readonly JornadaRecord[],
  config: JornadaConfig,
  horarios: MapaHorarios,
): Map<string, DesgloseResuelto> {
  const mapa = new Map<string, DesgloseResuelto>();
  for (const j of jornadas) {
    mapa.set(j.id, obtenerDesglose(j, config, horarios));
  }
  return mapa;
}

/**
 * Los totales de un conjunto de jornadas. Se suma lo mismo que se pinta: cada
 * desglose pasa por `obtenerDesglose`, así que una jornada aprobada aporta sus
 * cifras congeladas y una pendiente las que se ven ahora en pantalla.
 */
export function totalesDeJornadas(
  jornadas: readonly JornadaRecord[],
  desgloses: Map<string, DesgloseResuelto>,
): TotalesJornadas {
  return sumarDesgloses(
    jornadas.flatMap((j) => {
      const resuelto = desgloses.get(j.id);
      return resuelto ? [resuelto.desglose] : [];
    }),
  );
}

/* ------------------------------------------------------------------ */
/* Contador del dashboard                                              */
/* ------------------------------------------------------------------ */

/**
 * Cuántas jornadas están esperando revisión. Regla 9: quien lo consume no pinta
 * la tarjeta si es `0`; aquí se devuelve el número tal cual, que es lo honesto.
 */
export async function contarJornadasPendientes(): Promise<number> {
  const supabase = await getServerSupabase();
  if (!supabase) return 0;

  try {
    const { count, error } = await supabase
      .from("jornadas")
      .select("id", { count: "exact", head: true })
      .eq("status", "pendiente");
    if (error) return 0;
    return count ?? 0;
  } catch {
    return 0;
  }
}

/**
 * Las cuentas activas a las que un manager le puede registrar una jornada o
 * filtrar por ellas. Se leen con el cliente de sesión: la RLS de `profiles` ya
 * deja a un manager verlas todas.
 */
export async function listPersonasParaJornadas(): Promise<
  { id: string; nombre: string; cargo: string | null; activa: boolean }[]
> {
  const supabase = await getServerSupabase();
  if (!supabase) return [];

  try {
    const { data, error } = await supabase
      .from("profiles")
      .select("id, full_name, cargo, active")
      .order("full_name", { ascending: true });

    if (error || !data) return [];
    return data.map((fila) => ({
      id: String(fila.id),
      nombre: textoOrNull(fila.full_name) ?? "Cuenta sin nombre",
      cargo: textoOrNull(fila.cargo),
      activa: fila.active !== false,
    }));
  } catch {
    return [];
  }
}
