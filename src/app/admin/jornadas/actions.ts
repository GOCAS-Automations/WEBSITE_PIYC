"use server";

/**
 * SERVER ACTIONS — Revisión de jornadas (/admin/jornadas)
 * =======================================================
 * Aprobar, rechazar, reabrir, eliminar y registrar una jornada a nombre de otra
 * persona. Todo exige rol de **manager** (admin | coordinador) con la cuenta
 * activa: se comprueba aquí, en el servidor, además de las políticas RLS de las
 * migraciones 0002 y 0004. Desde la 0004 la base también impide que alguien
 * revise su propia jornada (trigger `jornadas_proteger_revision`) y deja que un
 * manager registre jornadas ajenas con su propia sesión, sin clave de servicio.
 *
 * EL DESGLOSE SE CONGELA AL APROBAR
 * ---------------------------------
 * Al aprobar, el servidor calcula el desglose UNA vez —con el horario del mes y
 * los parámetros vigentes en ese momento— y lo guarda junto con el contexto que
 * usó (`contexto_calculo`) y el instante (`calculado_at`). Desde entonces esa
 * jornada muestra siempre lo mismo: corregir después el horario de un mes ya no
 * toca lo revisado.
 *
 * Al rechazar, reabrir o editar se LIMPIA el congelado: una jornada que no está
 * aprobada no es una cifra firme, y reabrirla es justamente el mecanismo para
 * recalcularla. La restricción `jornadas_snapshot_solo_aprobada` de la base lo
 * exige también a ese nivel.
 *
 * RECHAZAR ≠ ELIMINAR (regla 6): rechazar conserva el registro y lo devuelve con
 * una nota; eliminar lo borra. Los mensajes de estas acciones lo repiten.
 */

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getManagerOrNull, type Session } from "@/lib/supabase/auth";
import { getContextoJornadas } from "@/lib/jornadas-lecturas";
import {
  calcularJornada,
  construirContextoCalculo,
  formatearFechaLarga,
  horaColombia,
  formatearHora12,
  instanteColombia,
  MAX_MINUTOS_TURNO,
} from "@/lib/jornada";
import { LIMITES_JORNADA } from "@/lib/jornada-types";
import type { Json } from "@/lib/supabase/database.types";
import { fail, ok, text, textOrNull, SIN_PERMISO } from "@/lib/admin/formulario";
import type { ActionState } from "@/lib/admin-types";

/**
 * Los tipos generados de Supabase declaran las columnas `jsonb` como `Json`, un
 * tipo estructural con firma de índice. Una interfaz nuestra (`DesgloseJornada`,
 * `ContextoCalculo`) no la tiene, aunque su contenido sea JSON puro. Esto lo
 * dice explícitamente en un solo sitio, en vez de repartir `as` por el archivo.
 */
const comoJson = (valor: unknown): Json => valor as Json;

/** Todo lo que cambia cuando una jornada deja de estar aprobada. */
const SIN_CONGELADO = {
  desglose: null,
  contexto_calculo: null,
  calculado_at: null,
} as const;

function revalidar() {
  revalidatePath("/admin/jornadas");
  revalidatePath("/admin");
  revalidatePath("/mi-cuenta");
}

/**
 * Otra jornada de la misma persona que se cruce con este turno. Dos registros
 * solapados no se pueden calcular bien: cada uno recibiría su propia jornada
 * ordinaria y su propio almuerzo, y las horas extra del día se perderían.
 *
 * Dos intervalos [a, b) y [c, d) se cruzan si `a < d` y `c < b`: tocarse en el
 * borde (una termina a las 12:00 y otra empieza a las 12:00) no es cruzarse.
 */
async function jornadaSolapada(
  session: Session,
  employeeId: string,
  startAt: string,
  endAt: string,
  idExcluido: string,
): Promise<{ work_date: string; start_at: string; end_at: string } | null> {
  let consulta = session.supabase
    .from("jornadas")
    .select("id, work_date, start_at, end_at")
    .eq("employee_id", employeeId)
    .neq("status", "rechazada")
    .lt("start_at", endAt)
    .gt("end_at", startAt);
  if (idExcluido) consulta = consulta.neq("id", idExcluido);

  const { data, error } = await consulta.limit(1);
  // Ante un fallo de red, la comprobación no bloquea: es una ayuda, no la RLS.
  if (error || !data || data.length === 0) return null;
  return data[0] as { work_date: string; start_at: string; end_at: string };
}

function textoCruce(otra: { work_date: string; start_at: string; end_at: string }): string {
  return `${formatearFechaLarga(otra.work_date)}, de ${formatearHora12(
    horaColombia(otra.start_at),
  )} a ${formatearHora12(horaColombia(otra.end_at))}`;
}

/* ------------------------------------------------------------------ */
/* Aprobar                                                             */
/* ------------------------------------------------------------------ */

export async function aprobarJornada(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const session = await getManagerOrNull();
  if (!session) return SIN_PERMISO;

  const id = text(formData, "id");
  if (!id) return fail("Falta el identificador de la jornada.");

  // La jornada se relee del servidor, nunca del formulario: se calcula sobre
  // los datos reales del turno.
  const { data: fila, error: errorLectura } = await session.supabase
    .from("jornadas")
    .select("id, employee_id, start_at, end_at, work_date")
    .eq("id", id)
    .maybeSingle();

  if (errorLectura) return fail(errorLectura.message);
  if (!fila)
    return fail(
      "No encontramos esa jornada. Puede que alguien la haya eliminado: recarga la página.",
    );

  // Nadie aprueba sus propias horas. `is_manager()` en la RLS deja actualizar
  // cualquier fila, así que un coordinador podía registrarse una jornada y
  // congelarse el desglose de recargos sin que la viera nadie más.
  if (String(fila.employee_id ?? "") === session.profile.id)
    return fail(
      "No puedes aprobar tu propia jornada. Pídele la revisión a otro coordinador o al administrador.",
    );

  const cruce = await jornadaSolapada(
    session,
    String(fila.employee_id ?? ""),
    String(fila.start_at ?? ""),
    String(fila.end_at ?? ""),
    id,
  );
  if (cruce)
    return fail(
      `No se puede aprobar: se cruza con otra jornada de la misma persona (${textoCruce(
        cruce,
      )}). Rechaza una de las dos con una nota pidiendo registrar una sola jornada, desde la primera entrada hasta la última salida.`,
    );

  const { config, horarios } = await getContextoJornadas();
  const workDate = String(fila.work_date ?? "");

  const desglose = calcularJornada(
    String(fila.start_at ?? ""),
    String(fila.end_at ?? ""),
    workDate,
    config,
    horarios,
  );

  // Congelar cifras inválidas sería peor que no aprobar.
  if (!desglose.valido)
    return fail(
      `No se puede aprobar porque las horas de esta jornada no cuadran. ${
        desglose.error ?? ""
      } Recházala con una nota para que la persona la corrija.`
        .replace(/\s+/g, " ")
        .trim(),
    );

  const ahora = new Date().toISOString();

  const { error } = await session.supabase
    .from("jornadas")
    .update({
      status: "aprobada",
      review_note: textOrNull(formData, "review_note"),
      reviewed_by: session.profile.id,
      reviewed_at: ahora,
      desglose: comoJson(desglose),
      contexto_calculo: comoJson(construirContextoCalculo(workDate, config, horarios)),
      calculado_at: ahora,
    })
    .eq("id", id);

  if (error) return fail(error.message);

  revalidar();
  return ok(
    "Jornada aprobada. Su desglose de horas quedó congelado: cambiar después el horario del mes ya no lo altera.",
  );
}

/* ------------------------------------------------------------------ */
/* Rechazar                                                            */
/* ------------------------------------------------------------------ */

export async function rechazarJornada(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const session = await getManagerOrNull();
  if (!session) return SIN_PERMISO;

  const id = text(formData, "id");
  if (!id) return fail("Falta el identificador de la jornada.");

  // La nota es obligatoria: es lo único que la persona lee para saber qué
  // corregir.
  const nota = text(formData, "review_note");
  if (nota === "")
    return fail(
      "Escribe el motivo del rechazo: es lo que verá la persona para saber qué corregir.",
    );
  if (nota.length > LIMITES_JORNADA.notaRevision)
    return fail(
      `La nota es demasiado larga (máximo ${LIMITES_JORNADA.notaRevision} caracteres).`,
    );

  const { error } = await session.supabase
    .from("jornadas")
    .update({
      status: "rechazada",
      review_note: nota,
      reviewed_by: session.profile.id,
      reviewed_at: new Date().toISOString(),
      ...SIN_CONGELADO,
    })
    .eq("id", id);

  if (error) return fail(error.message);

  revalidar();
  return ok(
    "Jornada rechazada con tu nota. El registro NO se eliminó: la persona lo ve en su portal para corregirlo.",
  );
}

/* ------------------------------------------------------------------ */
/* Reabrir (volver a pendiente)                                        */
/* ------------------------------------------------------------------ */

/**
 * Devuelve una jornada ya revisada al estado 'pendiente'. Sirve para corregir
 * una aprobación o un rechazo hecho por error y es, además, **el único
 * mecanismo para recalcular**: al reabrirla se borra el desglose congelado, así
 * que vuelve a calcularse con el horario vigente y al aprobarla otra vez se
 * congela con esos valores.
 */
export async function reabrirJornada(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const session = await getManagerOrNull();
  if (!session) return SIN_PERMISO;

  const id = text(formData, "id");
  if (!id) return fail("Falta el identificador de la jornada.");

  const { error } = await session.supabase
    .from("jornadas")
    .update({
      status: "pendiente",
      review_note: null,
      reviewed_by: null,
      reviewed_at: null,
      ...SIN_CONGELADO,
    })
    .eq("id", id);

  if (error) return fail(error.message);

  revalidar();
  return ok(
    "La jornada volvió a quedar pendiente y sus horas se recalculan con el horario del mes vigente.",
  );
}

/* ------------------------------------------------------------------ */
/* Eliminar                                                            */
/* ------------------------------------------------------------------ */

/**
 * Elimina una jornada definitivamente, en cualquier estado. Es la herramienta
 * para limpiar registros de prueba o duplicados. NO es lo mismo que rechazar:
 * la interfaz lo advierte y pide doble confirmación (regla 6).
 */
export async function eliminarJornadaComoManager(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const session = await getManagerOrNull();
  if (!session) return SIN_PERMISO;

  const id = text(formData, "id");
  if (!id) return fail("Falta el identificador de la jornada.");

  // `select("id")` distingue «no existe / sin permiso» de un borrado real: sin
  // él, eliminar cero filas se vería como un éxito.
  const { data, error } = await session.supabase
    .from("jornadas")
    .delete()
    .eq("id", id)
    .select("id");

  if (error) return fail(error.message);
  if (!data || data.length === 0)
    return fail(
      "No se pudo eliminar: esa jornada ya no existe o tu cuenta no tiene permiso. Recarga la página.",
    );

  revalidar();
  // La ficha de la que se dispara esta acción deja de existir: quedarse en ella
  // mostraría un 404. Se vuelve al listado, que es donde hay algo que hacer.
  redirect("/admin/jornadas?eliminada=1");
}

/* ------------------------------------------------------------------ */
/* Registrar o editar a nombre de una persona                          */
/* ------------------------------------------------------------------ */

/**
 * Registra una jornada a nombre de un empleado (para quien no la registra desde
 * su celular) o corrige una existente.
 *
 * A diferencia del portal, aquí `employee_id` SÍ viene del formulario: es el
 * sentido de la pantalla. Por eso la acción exige rol de manager antes de nada
 * y comprueba que la persona exista y esté activa.
 */
export async function guardarJornadaComoManager(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const session = await getManagerOrNull();
  if (!session) return SIN_PERMISO;

  const id = text(formData, "id");
  const employeeId = text(formData, "employee_id");
  const workDate = text(formData, "work_date");
  const horaInicio = text(formData, "start_time");
  const horaFin = text(formData, "end_time");
  const description = text(formData, "description");
  const workOrder = textOrNull(formData, "work_order");

  if (!employeeId) return fail("Selecciona a la persona a la que pertenece la jornada.");
  if (!/^\d{4}-\d{2}-\d{2}$/.test(workDate))
    return fail("Selecciona la fecha del día trabajado.");
  if (!/^\d{1,2}:\d{2}$/.test(horaInicio)) return fail("Indica la hora de inicio.");
  if (!/^\d{1,2}:\d{2}$/.test(horaFin)) return fail("Indica la hora de finalización.");
  if (description === "") return fail("Describe brevemente la labor realizada.");
  if (description.length > LIMITES_JORNADA.descripcion)
    return fail(
      `La descripción es demasiado larga (máximo ${LIMITES_JORNADA.descripcion} caracteres).`,
    );

  // La cuenta tiene que existir y estar activa: registrarle horas a una cuenta
  // desactivada casi siempre es un error de selección.
  const { data: persona } = await session.supabase
    .from("profiles")
    .select("id, full_name, active")
    .eq("id", employeeId)
    .maybeSingle();

  if (!persona)
    return fail("Esa cuenta ya no existe. Recarga la página y vuelve a elegir.");
  if (persona.active === false)
    return fail(
      `La cuenta de ${persona.full_name ?? "esa persona"} está desactivada. Reactívala en Equipo antes de registrarle jornadas.`,
    );

  const cruzaMedianoche = formData.getAll("next_day").includes("true") || horaFin <= horaInicio;
  const startAt = instanteColombia(workDate, horaInicio);
  const endAt = instanteColombia(workDate, horaFin, cruzaMedianoche ? 1 : 0);

  if (!startAt || !endAt)
    return fail("No pudimos leer las horas ingresadas. Revísalas, por favor.");

  const duracion = (new Date(endAt).getTime() - new Date(startAt).getTime()) / 60_000;
  if (duracion <= 0)
    return fail(
      "La hora de finalización debe ser posterior a la de inicio. Si el turno terminó después de medianoche, marca «terminé al día siguiente».",
    );
  if (duracion > MAX_MINUTOS_TURNO)
    return fail("Una jornada no puede durar más de 24 horas. Revisa las horas.");

  const cruce = await jornadaSolapada(session, employeeId, startAt, endAt, id);
  if (cruce)
    return fail(
      `Ese horario se cruza con otra jornada de la misma persona (${textoCruce(
        cruce,
      )}). Dos registros no pueden solaparse: si salió y volvió el mismo día, registra UNA sola jornada, desde la primera entrada hasta la última salida.`,
    );

  const payload = {
    employee_id: employeeId,
    work_order: workOrder,
    work_date: workDate,
    start_at: startAt,
    end_at: endAt,
    description,
    observations: textOrNull(formData, "observations"),
  };

  if (id) {
    // Editar invalida el cálculo congelado: las horas cambiaron, así que la
    // jornada vuelve a quedar pendiente de revisión.
    const { data, error } = await session.supabase
      .from("jornadas")
      .update({
        ...payload,
        status: "pendiente",
        review_note: null,
        reviewed_by: null,
        reviewed_at: null,
        ...SIN_CONGELADO,
      })
      .eq("id", id)
      .select("id");

    if (error) return fail(error.message);
    if (!data || data.length === 0)
      return fail("No se pudo editar: esa jornada ya no existe. Recarga la página.");

    revalidar();
    return ok(
      "Jornada corregida. Como cambiaron sus horas, volvió a quedar pendiente de aprobación: apruébala de nuevo para congelar el cálculo.",
    );
  }

  /* --- Insertar a nombre de OTRA persona ---------------------------
     Va con el cliente de SESIÓN, no con la clave de servicio: la política
     `jornadas_insert_manager` de la migración 0004 lo permite y repite en la
     base lo que ya se validó arriba (rol de manager, cuenta destino activa,
     estado 'pendiente' y sin desglose). Las comprobaciones de este archivo se
     quedan porque dan el mensaje en español; la RLS es la red de abajo. */
  const { error } = await session.supabase
    .from("jornadas")
    .insert({ ...payload, status: "pendiente" });

  if (error) return fail(error.message);

  revalidar();
  return ok(
    `Jornada registrada a nombre de ${persona.full_name ?? "la persona"} y pendiente de aprobación.`,
  );
}
