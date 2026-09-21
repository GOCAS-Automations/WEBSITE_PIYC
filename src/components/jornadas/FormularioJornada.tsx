"use client";

/**
 * FORMULARIO DE REGISTRO Y EDICIÓN DE UNA JORNADA
 * ===============================================
 * Lo usan el portal del empleado y —con el selector de persona encendido— el
 * panel, para registrar a nombre de quien no tiene celular.
 *
 * PENSADO PARA EL CELULAR, EN CAMPO: una columna hasta `sm`, campos altos,
 * teclados nativos de fecha y hora, y cada campo con su explicación. La vista
 * previa se recalcula sola mientras se escribe, para que nadie tenga que
 * guardar «a ver qué sale».
 *
 * ⚠ REGLA 1 de `AGENTS.md`: este archivo es de cliente, así que importa las
 * clases de `components/admin/ui-base`, **nunca de `ui.tsx`**.
 *
 * SEGURIDAD: el selector de persona solo aparece en el panel y la acción del
 * servidor vuelve a exigir el rol. En el portal, `employee_id` lo fija siempre
 * el servidor con la sesión: nunca viaja en el formulario.
 */

import { useActionState, useMemo, useState } from "react";
import { idleState, type ActionState } from "@/lib/admin-types";
import {
  calcularJornada,
  construirContextoCalculo,
  fechaColombia,
  horaColombia,
  instanteColombia,
  type JornadaConfig,
} from "@/lib/jornada";
import type { MapaHorarios } from "@/lib/horarios";
import { LIMITES_JORNADA, type JornadaRecord } from "@/lib/jornada-types";
import { botonPrimario, botonSecundario, inputClass } from "@/components/admin/ui-base";
import { IconoCheck, IconoInfo } from "@/components/admin/iconos";
import { Desglose } from "./Desglose";

export function FormularioJornada({
  action,
  config,
  horarios,
  hoy,
  jornada,
  empleados,
  submitLabel,
  onCancel,
  cancelHref,
}: {
  action: (state: ActionState, formData: FormData) => Promise<ActionState>;
  config: JornadaConfig;
  /** Horarios por mes: la vista previa cambia al cambiar la fecha del turno. */
  horarios?: MapaHorarios;
  /** Fecha de hoy en Colombia, `YYYY-MM-DD`, calculada en el servidor. */
  hoy: string;
  /** Si viene, el formulario edita esa jornada en vez de crear una nueva. */
  jornada?: JornadaRecord;
  /**
   * Solo en el panel: a nombre de quién se registra. En el portal se omite y el
   * servidor usa la sesión.
   */
  empleados?: { id: string; nombre: string; cargo: string | null }[];
  submitLabel?: string;
  onCancel?: () => void;
  cancelHref?: string;
}) {
  const [state, formAction, pending] = useActionState(action, idleState);

  const inicial = useMemo(() => {
    if (!jornada) {
      return {
        workDate: hoy,
        workOrder: "",
        start: "07:00",
        end: "17:00",
        nextDay: false,
        description: "",
        observations: "",
      };
    }
    return {
      workDate: jornada.work_date,
      workOrder: jornada.work_order ?? "",
      start: horaColombia(jornada.start_at),
      end: horaColombia(jornada.end_at),
      nextDay: fechaColombia(jornada.end_at) !== jornada.work_date,
      description: jornada.description,
      observations: jornada.observations ?? "",
    };
  }, [jornada, hoy]);

  const [workDate, setWorkDate] = useState(inicial.workDate);
  const [start, setStart] = useState(inicial.start);
  const [end, setEnd] = useState(inicial.end);
  const [nextDay, setNextDay] = useState(inicial.nextDay);

  // El turno cruza la medianoche si lo marcaron o si la hora de fin es menor o
  // igual a la de inicio (22:00 → 02:00). Se dice en pantalla: nada de
  // interpretar en silencio.
  const cruzaMedianoche = nextDay || end <= start;

  const previa = useMemo(() => {
    const startAt = instanteColombia(workDate, start);
    const endAt = instanteColombia(workDate, end, cruzaMedianoche ? 1 : 0);
    if (!startAt || !endAt) return null;
    return {
      desglose: calcularJornada(startAt, endAt, workDate, config, horarios),
      contexto: construirContextoCalculo(workDate, config, horarios),
    };
  }, [workDate, start, end, cruzaMedianoche, config, horarios]);

  const exito = state.status === "success";
  const editando = jornada !== undefined;

  return (
    <form action={formAction} className="space-y-5">
      {editando && <input type="hidden" name="id" value={jornada.id} />}

      {/* A nombre de quién — solo en el panel */}
      {empleados && (
        <div>
          <label
            htmlFor="jornada-empleado"
            className="mb-1.5 block text-sm font-semibold text-azul-950"
          >
            ¿De quién es esta jornada? <span className="text-azul-700">*</span>
          </label>
          <select
            id="jornada-empleado"
            name="employee_id"
            required
            defaultValue={jornada?.employee_id ?? ""}
            className={inputClass}
          >
            <option value="">Selecciona a la persona…</option>
            {empleados.map((p) => (
              <option key={p.id} value={p.id}>
                {p.nombre}
                {p.cargo ? ` · ${p.cargo}` : ""}
              </option>
            ))}
          </select>
          <span className="mt-1 block text-xs leading-relaxed text-acero-600">
            Para quien no registra desde su celular. La jornada queda a su
            nombre y aparece en su portal.
          </span>
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label
            htmlFor="jornada-fecha"
            className="mb-1.5 block text-sm font-semibold text-azul-950"
          >
            Fecha del día laboral <span className="text-azul-700">*</span>
          </label>
          <input
            id="jornada-fecha"
            type="date"
            name="work_date"
            required
            aria-required="true"
            value={workDate}
            onChange={(e) => setWorkDate(e.target.value)}
            className={inputClass}
          />
          <span className="mt-1 block text-xs leading-relaxed text-acero-600">
            El día en que <strong>empezaste</strong> el turno.
          </span>
        </div>

        <div>
          <label
            htmlFor="jornada-orden"
            className="mb-1.5 block text-sm font-semibold text-azul-950"
          >
            Orden de trabajo (opcional)
          </label>
          <input
            id="jornada-orden"
            type="text"
            name="work_order"
            maxLength={LIMITES_JORNADA.ordenTrabajo}
            defaultValue={inicial.workOrder}
            placeholder="Ej.: OT-1042"
            className={inputClass}
          />
          <span className="mt-1 block text-xs leading-relaxed text-acero-600">
            Tal como aparece en la orden que te asignaron. Si la labor no tenía
            orden, déjalo vacío.
          </span>
        </div>

        <div>
          <label
            htmlFor="jornada-inicio"
            className="mb-1.5 block text-sm font-semibold text-azul-950"
          >
            Hora de inicio <span className="text-azul-700">*</span>
          </label>
          <input
            id="jornada-inicio"
            type="time"
            name="start_time"
            required
            aria-required="true"
            value={start}
            onChange={(e) => setStart(e.target.value)}
            className={inputClass}
          />
        </div>

        <div>
          <label
            htmlFor="jornada-fin"
            className="mb-1.5 block text-sm font-semibold text-azul-950"
          >
            Hora de finalización <span className="text-azul-700">*</span>
          </label>
          <input
            id="jornada-fin"
            type="time"
            name="end_time"
            required
            aria-required="true"
            value={end}
            onChange={(e) => setEnd(e.target.value)}
            className={inputClass}
          />
        </div>
      </div>

      {/* Cruce de medianoche */}
      <div className="rounded-fino border border-acero-200 bg-acero-50 p-4">
        <label className="flex cursor-pointer items-start gap-3">
          <input type="hidden" name="next_day" value="false" />
          <input
            type="checkbox"
            name="next_day"
            value="true"
            checked={nextDay}
            onChange={(e) => setNextDay(e.target.checked)}
            className="mt-0.5 h-5 w-5 shrink-0 cursor-pointer accent-azul-700"
          />
          <span className="min-w-0">
            <span className="block text-sm font-semibold text-azul-950">
              Terminé al día siguiente
            </span>
            <span className="mt-0.5 block text-xs leading-relaxed text-acero-600">
              Márcalo si el turno pasó de la medianoche (por ejemplo, empezaste a
              las 10:00 p. m. y terminaste a las 2:00 a. m.). La hora de fin se
              registra en el día siguiente a la fecha que elegiste.
            </span>
          </span>
        </label>

        {!nextDay && cruzaMedianoche && (
          <p className="mt-3 flex items-start gap-2 text-xs leading-relaxed text-azul-900">
            <IconoInfo className="mt-0.5 h-3.5 w-3.5 shrink-0 text-azul-700" />
            <span>
              Como la hora de fin es anterior a la de inicio, entendemos que el
              turno terminó al día siguiente y así lo vamos a registrar.
            </span>
          </p>
        )}
      </div>

      <div>
        <label
          htmlFor="jornada-descripcion"
          className="mb-1.5 block text-sm font-semibold text-azul-950"
        >
          Descripción de la labor <span className="text-azul-700">*</span>
        </label>
        <textarea
          id="jornada-descripcion"
          name="description"
          rows={3}
          required
          aria-required="true"
          maxLength={LIMITES_JORNADA.descripcion}
          defaultValue={inicial.description}
          placeholder="Ej.: mantenimiento preventivo del tablero de control de la línea 2."
          className={`${inputClass} resize-y`}
        />
        <span className="mt-1 block text-xs leading-relaxed text-acero-600">
          Con una o dos frases claras es suficiente.
        </span>
      </div>

      <div>
        <label
          htmlFor="jornada-observaciones"
          className="mb-1.5 block text-sm font-semibold text-azul-950"
        >
          Observaciones (opcional)
        </label>
        <textarea
          id="jornada-observaciones"
          name="observations"
          rows={2}
          maxLength={LIMITES_JORNADA.observaciones}
          defaultValue={inicial.observations}
          placeholder="Novedades, materiales usados, algo que deba saber tu coordinador…"
          className={`${inputClass} resize-y`}
        />
      </div>

      {/* Vista previa del cálculo */}
      {previa && (
        <div className="rounded-fino border border-azul-300 bg-azul-50 p-4">
          <p className="mb-1 flex items-center gap-1.5 text-sm font-semibold text-azul-950">
            <IconoInfo className="h-4 w-4 text-azul-700" />
            Así quedarían estas horas
          </p>
          <p className="mb-3 text-xs leading-relaxed text-azul-900">
            Es una <strong>vista previa</strong>: se recalcula sola cada vez que
            cambias la fecha o las horas. Las cifras definitivas quedan fijas
            cuando el coordinador aprueba la jornada.
          </p>
          <Desglose desglose={previa.desglose} contexto={previa.contexto} />
        </div>
      )}

      {state.status !== "idle" && state.message && (
        /* Un error interrumpe al lector de pantalla; una confirmación espera. */
        <p
          role={exito ? "status" : "alert"}
          aria-live={exito ? "polite" : "assertive"}
          className={`rounded-fino border px-4 py-3 text-sm leading-relaxed ${
            exito
              ? "border-verde-300 bg-verde-100 text-verde-700"
              : "border-error-300 bg-error-50 text-error-700"
          }`}
        >
          {state.message}
        </p>
      )}

      <div className="flex flex-wrap items-center gap-3 border-t border-acero-200 pt-5">
        <button type="submit" disabled={pending} className={botonPrimario}>
          {pending ? (
            "Guardando…"
          ) : (
            <>
              <IconoCheck className="h-4 w-4" />
              {submitLabel ?? (editando ? "Guardar cambios" : "Registrar jornada")}
            </>
          )}
        </button>

        {onCancel && (
          <button type="button" onClick={onCancel} className={botonSecundario}>
            Cancelar
          </button>
        )}
        {!onCancel && cancelHref && (
          <a href={cancelHref} className={botonSecundario}>
            Cancelar
          </a>
        )}
      </div>
    </form>
  );
}
