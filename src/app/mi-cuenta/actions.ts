"use server";

/**
 * SERVER ACTIONS DEL PORTAL DEL EMPLEADO
 * ======================================
 * Hoy solo hay una: cambiar la propia contraseña. El registro y el historial de
 * jornadas los añade el agente del módulo de jornadas **en este mismo archivo**
 * (ver el punto de montaje al final).
 *
 * SEGURIDAD: toda acción exige sesión ACTIVA (`getActiveSession`). Una cuenta
 * desactivada tiene su token todavía válido durante unos minutos; sin esta
 * comprobación podría seguir escribiendo.
 */

import { revalidatePath } from "next/cache";
import { getActiveSession } from "@/lib/supabase/auth";
import { PASSWORD_MINIMO, type ActionState } from "@/lib/admin-types";
import { fail, ok, text } from "@/lib/admin/formulario";

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
/* PUNTO DE MONTAJE — módulo de jornadas                               */
/* ------------------------------------------------------------------ */
/*
 * Aquí van, cuando se construya el módulo:
 *
 *   export async function guardarJornada(prev: ActionState, formData: FormData)
 *   export async function eliminarJornada(prev: ActionState, formData: FormData)
 *
 * Reglas que ya deja puestas este archivo y conviene no romper:
 *   · `getActiveSession()` primero, siempre; `SIN_SESION` si devuelve null.
 *   · `employee_id` se fija SIEMPRE con `session.profile.id`, nunca con lo que
 *     venga en el `FormData`: la RLS de 0002 lo exige, pero la acción no debe
 *     depender de que la base la salve.
 *   · Solo se edita o elimina lo propio y mientras siga en `pendiente`.
 *   · Al terminar: `revalidatePath("/mi-cuenta")` y
 *     `revalidatePath("/admin/jornadas")`.
 *   · Devolver siempre un `ActionState` tipado (`ok()` / `fail()`), nunca
 *     lanzar: el formulario pinta el mensaje.
 */
