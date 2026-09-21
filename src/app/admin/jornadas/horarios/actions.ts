"use server";

/**
 * SERVER ACTIONS — Horarios mensuales (/admin/jornadas/horarios)
 * ==============================================================
 * PIYC define su jornada mes a mes. Aquí se guarda la plantilla semanal de un
 * mes: por cada día, si es laboral y en qué horario, más las horas de almuerzo
 * (que NO cuentan como trabajo).
 *
 * SEGURIDAD: solo managers (admin | coordinador). Se comprueba en cada acción;
 * las políticas RLS de la migración 0002 exigen `is_manager()` también en la
 * base de datos.
 *
 * Corregir un horario **no altera las jornadas ya aprobadas**: su desglose se
 * congeló al aprobarlas. Sí cambia el cálculo de las pendientes, y eso se dice
 * en el mensaje de éxito.
 */

import { revalidatePath } from "next/cache";
import { getManagerOrNull } from "@/lib/supabase/auth";
import {
  DIAS_ORDEN,
  DIA_LABELS,
  etiquetaMes,
  minutosDesdeHora,
  type HorarioDia,
  type HorarioDias,
} from "@/lib/horarios";
import { fail, ok, text, SIN_PERMISO } from "@/lib/admin/formulario";
import type { ActionState } from "@/lib/admin-types";
import type { Json } from "@/lib/supabase/database.types";

export async function guardarHorarioMensual(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const session = await getManagerOrNull();
  if (!session) return SIN_PERMISO;

  const anio = Number(text(formData, "anio"));
  const mes = Number(text(formData, "mes"));

  if (!Number.isInteger(anio) || anio < 2000 || anio > 2200)
    return fail("El año del horario no es válido.");
  if (!Number.isInteger(mes) || mes < 1 || mes > 12)
    return fail("El mes del horario no es válido.");

  /* --- Un día a la vez, con mensajes que señalan el día concreto --- */
  const dias = {} as HorarioDias;

  for (const clave of DIAS_ORDEN) {
    const laboral = text(formData, `${clave}_laboral`) === "true";
    if (!laboral) {
      dias[clave] = null;
      continue;
    }

    const inicio = text(formData, `${clave}_inicio`);
    const fin = text(formData, `${clave}_fin`);
    const almuerzoBruto = text(formData, `${clave}_almuerzo`);
    const nombre = DIA_LABELS[clave].toLowerCase();

    const minInicio = minutosDesdeHora(inicio);
    const minFin = minutosDesdeHora(fin);

    if (minInicio === null)
      return fail(`Revisa la hora de entrada del ${nombre}: no es una hora válida.`);
    if (minFin === null)
      return fail(`Revisa la hora de salida del ${nombre}: no es una hora válida.`);
    if (minFin <= minInicio)
      return fail(
        `El ${nombre}, la hora de salida debe ser posterior a la de entrada. Si ese día no se trabaja, márcalo como no laboral.`,
      );

    const almuerzo = almuerzoBruto === "" ? 0 : Number(almuerzoBruto);
    if (!Number.isFinite(almuerzo) || almuerzo < 0)
      return fail(`Las horas de almuerzo del ${nombre} no son válidas.`);
    if (Math.round(almuerzo * 60) >= minFin - minInicio)
      return fail(
        `El almuerzo del ${nombre} no puede durar tanto como la jornada. Revisa las horas.`,
      );

    const dia: HorarioDia = {
      inicio,
      fin,
      almuerzoHoras: Math.round(almuerzo * 100) / 100,
    };
    dias[clave] = dia;
  }

  const notas = text(formData, "notas");

  const { error } = await session.supabase.from("horarios_mensuales").upsert(
    // El JSON de `dias` es puro; el tipo generado espera `Json`, que exige una
    // firma de índice que una interfaz nuestra no tiene.
    { anio, mes, dias: dias as unknown as Json, notas: notas === "" ? null : notas },
    { onConflict: "anio,mes" },
  );

  if (error) return fail(error.message);

  // El horario cambia el cálculo de las jornadas pendientes de ese mes, tanto
  // en el portal como en el panel.
  revalidatePath("/admin/jornadas/horarios");
  revalidatePath("/admin/jornadas");
  revalidatePath("/mi-cuenta");

  return ok(
    `Horario de ${etiquetaMes(anio, mes)} guardado. Ya se aplica al cálculo de las jornadas pendientes de ese mes; las que estén aprobadas no cambian, porque su cálculo quedó congelado.`,
  );
}
