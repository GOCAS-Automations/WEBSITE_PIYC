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
import {
  CAMPOS_GASTO,
  CAMPO_NOTA_GASTO,
  LIMITES_JORNADA,
  TOPE_GASTO,
  agruparMiles,
  formatearPesos,
  valorCampoGasto,
  type CampoGasto,
  type JornadaRecord,
} from "@/lib/jornada-types";
import {
  ayudaCampo,
  banner,
  botonPrimario,
  botonSecundario,
  etiquetaCampo,
  inputClass,
} from "@/components/admin/ui-base";
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
            className={etiquetaCampo}
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
          <span className={ayudaCampo}>
            Para quien no registra desde su celular. La jornada queda a su
            nombre y aparece en su portal.
          </span>
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label
            htmlFor="jornada-fecha"
            className={etiquetaCampo}
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
          <span className={ayudaCampo}>
            El día en que <strong>empezaste</strong> el turno.
          </span>
        </div>

        <div>
          <label
            htmlFor="jornada-orden"
            className={etiquetaCampo}
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
          <span className={ayudaCampo}>
            Tal como aparece en la orden que te asignaron. Si la labor no tenía
            orden, déjalo vacío.
          </span>
        </div>

        <div>
          <label
            htmlFor="jornada-inicio"
            className={etiquetaCampo}
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
            className={etiquetaCampo}
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
      <div className="rounded-control bg-lienzo-alto p-4 ring-1 ring-separador">
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
            <span className={etiquetaCampo}>
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
          className={etiquetaCampo}
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
        <span className={ayudaCampo}>
          Con una o dos frases claras es suficiente.
        </span>
      </div>

      <div>
        <label
          htmlFor="jornada-observaciones"
          className={etiquetaCampo}
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

      {/* Gastos de bolsillo — opcionales y aparte del cálculo de horas */}
      <CamposGastos jornada={jornada} />

      {/* Vista previa del cálculo */}
      {previa && (
        <div className="rounded-tarjeta bg-azul-50 p-4">
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
          className={banner(exito)}
        >
          {state.message}
        </p>
      )}

      <div className="flex flex-wrap items-center gap-3 border-t border-separador pt-5">
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

/* ------------------------------------------------------------------ */
/* Gastos de bolsillo (opcionales)                                     */
/* ------------------------------------------------------------------ */

/**
 * LO QUE LA PERSONA PUSO DE SU BOLSILLO Y LA EMPRESA LE REEMBOLSA.
 *
 * Tres montos y una nota, **todos opcionales**: muchas jornadas de PIYC son en
 * campo y el almuerzo, el bus o un repuesto de urgencia los paga quien va.
 *
 * SON DATOS, NO CÁLCULO: no entran en el desglose ni en ningún recargo, y por
 * eso este bloque vive fuera de la vista previa de horas. Si no se anota nada,
 * no cambia nada.
 *
 * PENSADO PARA EL CELULAR EN OBRA:
 *   · `inputMode="numeric"` abre el teclado de números —no `type="number"`,
 *     que no admite el punto de los miles y en Android regala una ruedita que
 *     cambia la cifra al rozarla—.
 *   · Los miles se agrupan MIENTRAS SE ESCRIBE: «48000» se ve «48.000» en el
 *     momento, que es como se lee un precio en Colombia y es la única forma de
 *     notar al vuelo que sobró un cero.
 *   · El `$` lo pinta el campo; nadie tiene que escribirlo.
 *   · La nota aparece sola cuando hay un monto en «Otros gastos»: es ahí donde
 *     hace falta, y así no estorba el resto del tiempo.
 */
function CamposGastos({ jornada }: { jornada?: JornadaRecord }) {
  const [montos, setMontos] = useState<Record<CampoGasto, string>>(() => ({
    gasto_alimentacion: valorCampoGasto(jornada?.gasto_alimentacion),
    gasto_transporte: valorCampoGasto(jornada?.gasto_transporte),
    gasto_otros: valorCampoGasto(jornada?.gasto_otros),
  }));

  const cambiar = (campo: CampoGasto, bruto: string) => {
    // Se queda solo con los dígitos: el punto que se ve lo pone el formateo, y
    // así da igual si alguien lo teclea, lo pega con «$» o lo copia de una
    // factura.
    const digitos = bruto.replace(/\D/g, "").replace(/^0+(?=\d)/, "").slice(0, 9);
    const valor =
      digitos === "" ? "" : agruparMiles(Math.min(Number(digitos), TOPE_GASTO));
    setMontos((prev) => ({ ...prev, [campo]: valor }));
  };

  const total = CAMPOS_GASTO.reduce(
    (suma, { campo }) => suma + Number(montos[campo].replace(/\./g, "") || 0),
    0,
  );

  return (
    <div className="rounded-control bg-lienzo-alto p-4 ring-1 ring-separador">
      <p className="text-sm font-semibold text-azul-950">
        ¿Gastaste algo de tu bolsillo?{" "}
        <span className="font-normal text-acero-600">(opcional)</span>
      </p>
      <p className="mt-1 text-xs leading-relaxed text-acero-600">
        Anota lo que pagaste tú y la empresa te reembolsa. Si no gastaste nada,
        deja los campos vacíos: <strong>no afecta el cálculo de tus horas</strong>.
      </p>

      <div className="mt-4 grid gap-4 sm:grid-cols-3">
        {CAMPOS_GASTO.map(({ campo, etiqueta, ayuda }) => (
          <div key={campo}>
            <label htmlFor={`jornada-${campo}`} className={etiquetaCampo}>
              {etiqueta}
            </label>
            <div className="relative">
              <span
                aria-hidden="true"
                className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-semibold text-acero-500"
              >
                $
              </span>
              <input
                id={`jornada-${campo}`}
                type="text"
                name={campo}
                value={montos[campo]}
                onChange={(e) => cambiar(campo, e.target.value)}
                inputMode="numeric"
                autoComplete="off"
                // Sin `placeholder="0"`: un cero en gris se lee como un dato y
                // aquí vacío significa «no gastó nada» (regla 9). El `$` de la
                // izquierda ya dice que el campo es plata.
                aria-describedby={`jornada-${campo}-ayuda`}
                className={`${inputClass} pl-8 tabular-nums`}
              />
            </div>
            <span id={`jornada-${campo}-ayuda`} className={ayudaCampo}>
              {ayuda}
            </span>
          </div>
        ))}
      </div>

      {/* La nota solo tiene sentido si hay un «otro» gasto que explicar. */}
      {montos.gasto_otros !== "" && (
        <div className="mt-4">
          <label htmlFor={`jornada-${CAMPO_NOTA_GASTO}`} className={etiquetaCampo}>
            ¿De qué fueron esos otros gastos?
          </label>
          <input
            id={`jornada-${CAMPO_NOTA_GASTO}`}
            type="text"
            name={CAMPO_NOTA_GASTO}
            maxLength={LIMITES_JORNADA.notaGasto}
            defaultValue={jornada?.gasto_otros_nota ?? ""}
            placeholder="Ej.: parqueadero de la camioneta en la planta."
            className={inputClass}
          />
          <span className={ayudaCampo}>
            En una línea. Un monto sin explicación le deja dudas a quien aprueba.
          </span>
        </div>
      )}

      {/* Regla 9: si no hay nada anotado, no se pinta ningún total. */}
      {total > 0 && (
        <p
          aria-live="polite"
          className="mt-4 border-t border-separador pt-3 text-sm text-azul-950"
        >
          Total que anotaste:{" "}
          <strong className="tabular-nums">{formatearPesos(total)}</strong>
          <span className="block text-xs leading-relaxed text-acero-600">
            Queda registrado junto a la jornada para que lo revise tu
            coordinador. Máximo {formatearPesos(TOPE_GASTO)} por campo.
          </span>
        </p>
      )}
    </div>
  );
}
