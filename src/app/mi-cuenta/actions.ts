"use server";

/**
 * SERVER ACTIONS DEL PORTAL DEL EMPLEADO
 * ======================================
 * Tres: cambiar la propia contraseña, registrar o corregir una jornada propia y
 * eliminar una jornada propia que todavía esté pendiente.
 *
 * SEGURIDAD: toda acción exige sesión ACTIVA (`getActiveSession`). Una cuenta
 * desactivada tiene su token todavía válido durante unos minutos; sin esta
 * comprobación podría seguir escribiendo.
 */

import { revalidatePath } from "next/cache";
import { getActiveSession } from "@/lib/supabase/auth";
import { PASSWORD_MINIMO, type ActionState } from "@/lib/admin-types";
import { fail, ok, text, textOrNull } from "@/lib/admin/formulario";
import {
  formatearFechaLarga,
  formatearHora12,
  horaColombia,
  instanteColombia,
  MAX_MINUTOS_TURNO,
} from "@/lib/jornada";
import { LIMITES_JORNADA } from "@/lib/jornada-types";

const SIN_SESION: ActionState = {
  status: "error",
  message:
    "Tu sesión expiró o tu cuenta está desactivada. Vuelve a ingresar, por favor.",
};

/* ------------------------------------------------------------------ */
/* Cambiar la propia contraseña                                        */
/* ------------------------------------------------------------------ */

export async function cambiarMiPassword(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const session = await getActiveSession();
  if (!session) return SIN_SESION;

  const nueva = text(formData, "password");
  const repetida = text(formData, "password_confirm");

  if (nueva.length < PASSWORD_MINIMO)
    return fail(
      `La contraseña debe tener al menos ${PASSWORD_MINIMO} caracteres. Una frase corta que recuerdes fácil (por ejemplo, tres palabras seguidas) sirve perfectamente.`,
    );
  if (nueva !== repetida)
    return fail("Las dos contraseñas no coinciden. Vuelve a escribirlas.");

  const { error } = await session.supabase.auth.updateUser({ password: nueva });
  if (error) {
    // Supabase rechaza una contraseña demasiado corta o filtrada con su propio
    // mensaje en inglés: se traduce lo que la persona puede accionar.
    if (/password/i.test(error.message) && /short|length|characters/i.test(error.message))
      return fail(`La contraseña debe tener al menos ${PASSWORD_MINIMO} caracteres.`);
    return fail(
      "No se pudo cambiar la contraseña. Inténtalo de nuevo; si sigue fallando, avisa a tu coordinador.",
    );
  }

  revalidatePath("/mi-cuenta");
  return ok(
    "Tu contraseña se actualizó. Úsala la próxima vez que inicies sesión.",
  );
}

/* ------------------------------------------------------------------ */
/* JORNADAS DEL PORTAL                                                 */
/* ------------------------------------------------------------------ */
/*
 * Reglas que cumplen las dos acciones de abajo:
 *   · `getActiveSession()` primero, siempre; `SIN_SESION` si devuelve null.
 *   · `employee_id` se fija SIEMPRE con `session.profile.id`, nunca con lo que
 *     venga en el `FormData`: la RLS de la 0002 lo exige, pero la acción no
 *     depende de que la base la salve.
 *   · Solo se edita o elimina lo propio y mientras siga en `pendiente`.
 *   · Al terminar, `revalidatePath` de las dos pantallas afectadas.
 *   · Nunca lanzan: devuelven un `ActionState` y el formulario pinta el mensaje.
 */

function revalidarJornadas() {
  revalidatePath("/mi-cuenta");
  revalidatePath("/admin/jornadas");
  revalidatePath("/admin");
}

/** Lo que se le dice a quien registra dos tramos del mismo día. */
const AVISO_UN_REGISTRO =
  "Si saliste y volviste el mismo día, registra UNA sola jornada, desde tu primera entrada hasta tu última salida (edita la que ya tenías y, si hace falta, cuéntalo en observaciones).";

/**
 * Registra una jornada propia o corrige una que sigue pendiente.
 *
 * DOS REGISTROS NO PUEDEN SOLAPARSE: si alguien parte su turno en dos, cada
 * tramo recibiría su propia jornada ordinaria y su propio almuerzo, y las horas
 * extra del día se perderían. Lo que se cruza se rechaza; que haya otra jornada
 * ese mismo día solo se avisa, porque puede ser legítimo.
 */
export async function guardarJornada(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const session = await getActiveSession();
  if (!session) return SIN_SESION;

  const id = text(formData, "id");
  const workDate = text(formData, "work_date");
  const horaInicio = text(formData, "start_time");
  const horaFin = text(formData, "end_time");
  const description = text(formData, "description");
  // Opcional: hay labores sin orden de trabajo. Vacío se guarda como NULL.
  const workOrder = textOrNull(formData, "work_order");

  if (!/^\d{4}-\d{2}-\d{2}$/.test(workDate))
    return fail("Selecciona la fecha del día que trabajaste.");
  if (!/^\d{1,2}:\d{2}$/.test(horaInicio))
    return fail("Indica la hora en que empezaste.");
  if (!/^\d{1,2}:\d{2}$/.test(horaFin))
    return fail("Indica la hora en que terminaste.");
  if (description === "") return fail("Cuéntanos brevemente qué labor realizaste.");
  if (description.length > LIMITES_JORNADA.descripcion)
    return fail(
      `La descripción es demasiado larga (máximo ${LIMITES_JORNADA.descripcion} caracteres).`,
    );

  // El turno cruza la medianoche si lo marcaron o si la hora de fin es menor o
  // igual a la de inicio (22:00 → 02:00).
  const cruzaMedianoche =
    formData.getAll("next_day").includes("true") || horaFin <= horaInicio;

  const startAt = instanteColombia(workDate, horaInicio);
  const endAt = instanteColombia(workDate, horaFin, cruzaMedianoche ? 1 : 0);

  if (!startAt || !endAt)
    return fail("No pudimos leer las horas ingresadas. Revísalas, por favor.");

  const duracion = (new Date(endAt).getTime() - new Date(startAt).getTime()) / 60_000;
  if (duracion <= 0)
    return fail(
      "La hora de finalización debe ser posterior a la de inicio. Si terminaste después de medianoche, marca la casilla «terminé al día siguiente».",
    );
  if (duracion > MAX_MINUTOS_TURNO)
    return fail("Una jornada no puede durar más de 24 horas. Revisa las horas.");

  /* --- Cruces con otras jornadas propias --- */
  const otras = async (filtro: "cruce" | "mismoDia") => {
    let consulta = session.supabase
      .from("jornadas")
      .select("id, work_date, start_at, end_at")
      .eq("employee_id", session.profile.id)
      .neq("status", "rechazada");
    if (id) consulta = consulta.neq("id", id);
    consulta =
      filtro === "cruce"
        ? // [a, b) y [c, d) se cruzan si a < d y c < b: tocarse en el borde no
          // es cruzarse.
          consulta.lt("start_at", endAt).gt("end_at", startAt)
        : consulta.eq("work_date", workDate);
    const { data, error } = await consulta.limit(1);
    // Un fallo de red no puede impedir registrar: la comprobación es ayuda.
    return error || !data ? [] : data;
  };

  const [solapadas, delMismoDia] = await Promise.all([otras("cruce"), otras("mismoDia")]);

  if (solapadas.length > 0) {
    const otra = solapadas[0];
    return fail(
      `Este horario se cruza con otra jornada tuya: la del ${formatearFechaLarga(
        String(otra.work_date),
      )} (de ${formatearHora12(horaColombia(String(otra.start_at)))} a ${formatearHora12(
        horaColombia(String(otra.end_at)),
      )}). Dos registros no pueden solaparse. ${AVISO_UN_REGISTRO}`,
    );
  }

  const avisoMismoDia =
    delMismoDia.length > 0
      ? ` Ojo: ese día ya tenías otra jornada registrada. ${AVISO_UN_REGISTRO}`
      : "";

  const payload = {
    employee_id: session.profile.id, // SIEMPRE el de la sesión
    work_order: workOrder,
    work_date: workDate,
    start_at: startAt,
    end_at: endAt,
    description,
    observations: textOrNull(formData, "observations"),
  };

  if (id) {
    // Editar: solo lo propio y mientras siga pendiente (doble filtro + RLS).
    const { data, error } = await session.supabase
      .from("jornadas")
      .update(payload)
      .eq("id", id)
      .eq("employee_id", session.profile.id)
      .eq("status", "pendiente")
      .select("id");

    if (error) return fail(error.message);
    if (!data || data.length === 0)
      return fail("No se pudo editar: esa jornada ya fue revisada o no te pertenece.");

    revalidarJornadas();
    return ok(`Los cambios de tu jornada quedaron guardados.${avisoMismoDia}`);
  }

  const { error } = await session.supabase
    .from("jornadas")
    .insert({ ...payload, status: "pendiente" });

  if (error) return fail(error.message);

  revalidarJornadas();
  return ok(
    `Tu jornada quedó registrada y está pendiente de aprobación. Te avisaremos aquí mismo cuando la revisen.${avisoMismoDia}`,
  );
}

/** Elimina una jornada propia que todavía no haya sido revisada. */
export async function eliminarJornada(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const session = await getActiveSession();
  if (!session) return SIN_SESION;

  const id = text(formData, "id");
  if (!id) return fail("Falta el identificador de la jornada.");

  const { data, error } = await session.supabase
    .from("jornadas")
    .delete()
    .eq("id", id)
    .eq("employee_id", session.profile.id)
    .eq("status", "pendiente")
    .select("id");

  if (error) return fail(error.message);
  if (!data || data.length === 0)
    return fail("No se pudo eliminar: esa jornada ya fue revisada o no te pertenece.");

  revalidarJornadas();
  return ok("Jornada eliminada.");
}
