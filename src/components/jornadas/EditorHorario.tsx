"use client";

/**
 * EDITOR DEL HORARIO DE UN MES
 * ============================
 * Una **plantilla semanal** (lunes → domingo) que se aplica a todo el mes: por
 * cada día, si se trabaja, la entrada, la salida y las horas de almuerzo. Es
 * exactamente la forma del JSON de `horarios_mensuales.dias`, así que lo que se
 * ve es lo que se guarda.
 *
 * Las celdas calculadas —«Horas de jornada» de cada día y el total semanal— se
 * recalculan mientras se edita. Nada se guarda hasta pulsar «Guardar horario».
 *
 * El calendario de abajo muestra el mes ya resuelto, con los **festivos
 * señalados**: un festivo no se puede apagar aquí, lo pone la ley, y en él todo
 * el turno se trata como dominical.
 *
 * ⚠ REGLA 1: componente de cliente → importa de `components/admin/ui-base`.
 */

import { useActionState, useMemo, useState } from "react";
import {
  DIAS_ORDEN,
  DIA_CORTO,
  DIA_LABELS,
  claveDiaSemana,
  clonarHorario,
  diasDelMes,
  diasLaborales,
  diaSemanaDeFecha,
  etiquetaMes,
  formatearHorasDecimales,
  minutosJornadaDia,
  minutosSemanales,
  type DiaClave,
  type HorarioDias,
} from "@/lib/horarios";
import { festivosDelMes } from "@/lib/jornada-festivos";
import { formatearDuracion } from "@/lib/jornada";
import { idleState, type ActionState } from "@/lib/admin-types";
import {
  botonPrimario,
  botonSecundario,
  inputClass,
} from "@/components/admin/ui-base";
import { IconoCheck, IconoInfo } from "@/components/admin/iconos";

const DIA_POR_DEFECTO = { inicio: "08:00", fin: "17:00", almuerzoHoras: 1 };

export function EditorHorario({
  action,
  anio,
  mes,
  diasIniciales,
  notasIniciales,
  horarioPorDefecto,
  diasMesAnterior,
  etiquetaMesAnterior,
}: {
  action: (state: ActionState, formData: FormData) => Promise<ActionState>;
  anio: number;
  mes: number;
  diasIniciales: HorarioDias;
  notasIniciales: string;
  /** Horario semanal de `jornada_config`, para el botón de restablecer. */
  horarioPorDefecto: HorarioDias;
  /** Horario del mes anterior, si está cargado. `null` = no hay de dónde copiar. */
  diasMesAnterior: HorarioDias | null;
  etiquetaMesAnterior: string;
}) {
  const [state, formAction, pending] = useActionState(action, idleState);
  const [dias, setDias] = useState<HorarioDias>(() => clonarHorario(diasIniciales));
  const [aviso, setAviso] = useState<string | null>(null);

  const etiqueta = etiquetaMes(anio, mes);
  const totalSemanal = useMemo(() => minutosSemanales(dias), [dias]);
  const laborales = useMemo(() => diasLaborales(dias), [dias]);
  const festivos = useMemo(() => festivosDelMes(anio, mes), [anio, mes]);

  /** El mes resuelto día por día, para el calendario de abajo. */
  const calendario = useMemo(() => {
    const porFecha = new Map(festivos.map((f) => [f.fecha, f.nombre]));
    const total = diasDelMes(anio, mes);
    const salida: {
      dia: number;
      fecha: string;
      clave: DiaClave;
      laboral: boolean;
      festivo: string | null;
      minutos: number;
    }[] = [];

    for (let d = 1; d <= total; d += 1) {
      const fecha = `${anio}-${String(mes).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
      const clave = claveDiaSemana(diaSemanaDeFecha(fecha));
      const festivo = porFecha.get(fecha) ?? null;
      const configurado = dias[clave];
      salida.push({
        dia: d,
        fecha,
        clave,
        laboral: configurado !== null && festivo === null,
        festivo,
        minutos: festivo === null ? minutosJornadaDia(configurado) : 0,
      });
    }
    return salida;
  }, [anio, mes, dias, festivos]);

  const minutosDelMes = useMemo(
    () => calendario.reduce((suma, d) => suma + d.minutos, 0),
    [calendario],
  );

  function actualizar(
    clave: DiaClave,
    cambios: Partial<NonNullable<HorarioDias[DiaClave]>>,
  ) {
    setDias((previo) => {
      const actual = previo[clave];
      if (!actual) return previo;
      return { ...previo, [clave]: { ...actual, ...cambios } };
    });
    setAviso(null);
  }

  function alternarLaboral(clave: DiaClave, laboral: boolean) {
    setDias((previo) => ({
      ...previo,
      [clave]: laboral
        ? (previo[clave] ?? horarioPorDefecto[clave] ?? { ...DIA_POR_DEFECTO })
        : null,
    }));
    setAviso(null);
  }

  /** Aplica el horario del primer día laboral a todos los días encendidos. */
  function igualarDiasLaborales() {
    const primero = DIAS_ORDEN.map((c) => dias[c]).find((d) => d !== null);
    if (!primero) {
      setAviso("No hay ningún día laboral encendido para tomar como modelo.");
      return;
    }
    setDias((previo) => {
      const salida = {} as HorarioDias;
      for (const clave of DIAS_ORDEN) {
        salida[clave] = previo[clave] ? { ...primero } : null;
      }
      return salida;
    });
    setAviso(
      `Se aplicó el horario de ${primero.inicio}–${primero.fin} a todos los días laborales del mes. Revísalo y pulsa «Guardar horario».`,
    );
  }

  function copiarMesAnterior() {
    if (!diasMesAnterior) return;
    setDias(clonarHorario(diasMesAnterior));
    setAviso(
      `Se cargó el horario de ${etiquetaMesAnterior}. Revísalo y pulsa «Guardar horario» para aplicarlo a ${etiqueta}.`,
    );
  }

  function restablecer() {
    setDias(clonarHorario(horarioPorDefecto));
    setAviso(
      `Se cargó el horario predeterminado. Revísalo y pulsa «Guardar horario» para aplicarlo a ${etiqueta}.`,
    );
  }

  const exito = state.status === "success";

  return (
    <form action={formAction} className="space-y-5">
      <input type="hidden" name="anio" value={anio} />
      <input type="hidden" name="mes" value={mes} />

      {/* ---------------- Plantilla semanal ---------------- */}
      <div className="overflow-x-auto rounded-fino border border-acero-200 bg-blanco">
        <table className="w-full min-w-[44rem] border-collapse text-sm">
          <caption className="sr-only">
            Plantilla semanal del mes: para cada día, si se trabaja, la hora de
            entrada y de salida, las horas de almuerzo y el total de jornada.
          </caption>
          <thead>
            <tr className="border-b border-acero-200 bg-acero-50 text-left">
              <th scope="col" className="px-4 py-3 font-semibold text-azul-950">
                Día
              </th>
              <th scope="col" className="px-4 py-3 font-semibold text-azul-950">
                ¿Se trabaja?
              </th>
              <th scope="col" className="px-4 py-3 font-semibold text-azul-950">
                Entrada
              </th>
              <th scope="col" className="px-4 py-3 font-semibold text-azul-950">
                Salida
              </th>
              <th scope="col" className="px-4 py-3 font-semibold text-azul-950">
                Almuerzo (horas)
              </th>
              <th scope="col" className="px-4 py-3 text-right font-semibold text-azul-950">
                Horas de jornada
              </th>
            </tr>
          </thead>
          <tbody>
            {DIAS_ORDEN.map((clave) => {
              const dia = dias[clave];
              const laboral = dia !== null;
              const minutos = minutosJornadaDia(dia);

              return (
                <tr
                  key={clave}
                  className={`border-b border-acero-200 last:border-0 ${
                    laboral ? "" : "bg-acero-50"
                  }`}
                >
                  {/* Valores que viajan al servidor */}
                  <input
                    type="hidden"
                    name={`${clave}_laboral`}
                    value={laboral ? "true" : "false"}
                  />
                  {laboral && (
                    <>
                      <input type="hidden" name={`${clave}_inicio`} value={dia.inicio} />
                      <input type="hidden" name={`${clave}_fin`} value={dia.fin} />
                      <input
                        type="hidden"
                        name={`${clave}_almuerzo`}
                        value={String(dia.almuerzoHoras)}
                      />
                    </>
                  )}

                  <th scope="row" className="px-4 py-3 text-left font-semibold text-azul-950">
                    {DIA_LABELS[clave]}
                  </th>

                  <td className="px-4 py-3">
                    <label className="inline-flex cursor-pointer items-center gap-2.5">
                      <input
                        type="checkbox"
                        checked={laboral}
                        onChange={(e) => alternarLaboral(clave, e.target.checked)}
                        aria-label={`${DIA_LABELS[clave]}: día laboral`}
                        className="peer relative h-6 w-11 shrink-0 cursor-pointer appearance-none rounded-full bg-acero-300 outline-none transition-colors before:absolute before:left-0.5 before:top-0.5 before:h-5 before:w-5 before:rounded-full before:bg-blanco before:transition-transform before:content-[''] checked:bg-verde-500 checked:before:translate-x-5 focus-visible:ring-2 focus-visible:ring-azul-700/40 focus-visible:ring-offset-2"
                      />
                      <span className="text-xs font-semibold text-acero-600 peer-checked:hidden">
                        No laboral
                      </span>
                      <span className="hidden text-xs font-semibold text-verde-700 peer-checked:inline">
                        Laboral
                      </span>
                    </label>
                  </td>

                  <td className="px-4 py-3">
                    <input
                      type="time"
                      value={dia?.inicio ?? ""}
                      disabled={!laboral}
                      onChange={(e) => actualizar(clave, { inicio: e.target.value })}
                      aria-label={`${DIA_LABELS[clave]}: hora de entrada`}
                      className={`${inputClass} ${laboral ? "" : "cursor-not-allowed bg-acero-100"}`}
                    />
                  </td>

                  <td className="px-4 py-3">
                    <input
                      type="time"
                      value={dia?.fin ?? ""}
                      disabled={!laboral}
                      onChange={(e) => actualizar(clave, { fin: e.target.value })}
                      aria-label={`${DIA_LABELS[clave]}: hora de salida`}
                      className={`${inputClass} ${laboral ? "" : "cursor-not-allowed bg-acero-100"}`}
                    />
                  </td>

                  <td className="px-4 py-3">
                    <input
                      type="number"
                      min={0}
                      max={4}
                      step={0.5}
                      value={dia?.almuerzoHoras ?? 0}
                      disabled={!laboral}
                      onChange={(e) =>
                        actualizar(clave, { almuerzoHoras: Number(e.target.value) || 0 })
                      }
                      aria-label={`${DIA_LABELS[clave]}: horas de almuerzo`}
                      className={`${inputClass} ${laboral ? "" : "cursor-not-allowed bg-acero-100"}`}
                    />
                  </td>

                  <td className="px-4 py-3 text-right">
                    <span
                      className={`inline-flex min-w-[5.5rem] justify-end rounded-fino px-3 py-1.5 text-sm font-semibold tabular-nums ${
                        laboral
                          ? "bg-azul-50 text-azul-800"
                          : "bg-acero-100 text-acero-700"
                      }`}
                      title={laboral ? formatearDuracion(minutos) : "Día no laboral"}
                    >
                      {laboral ? formatearHorasDecimales(minutos) : "—"}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
          <tfoot>
            <tr className="border-t border-acero-300 bg-acero-50">
              <th scope="row" colSpan={5} className="px-4 py-4 text-left font-semibold text-azul-950">
                Total de horas semanales
                <span className="ml-2 font-normal text-acero-600">
                  ({laborales} día{laborales === 1 ? "" : "s"} laboral
                  {laborales === 1 ? "" : "es"})
                </span>
              </th>
              <td className="px-4 py-4 text-right">
                <span className="inline-flex min-w-[5.5rem] justify-end rounded-fino bg-azul-700 px-3 py-2 text-base font-semibold tabular-nums text-blanco">
                  {formatearHorasDecimales(totalSemanal)}
                </span>
              </td>
            </tr>
          </tfoot>
        </table>
      </div>

      {/* ---------------- Atajos ---------------- */}
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={igualarDiasLaborales}
          className={`${botonSecundario} px-3 py-2 text-xs`}
        >
          Igualar todos los días laborales
        </button>
        {diasMesAnterior && (
          <button
            type="button"
            onClick={copiarMesAnterior}
            className={`${botonSecundario} px-3 py-2 text-xs`}
          >
            Copiar el horario de {etiquetaMesAnterior}
          </button>
        )}
        <button
          type="button"
          onClick={restablecer}
          className={`${botonSecundario} px-3 py-2 text-xs`}
        >
          Restablecer al horario predeterminado
        </button>
      </div>

      <p className="flex items-start gap-2 text-xs leading-relaxed text-acero-600">
        <IconoInfo className="mt-0.5 h-4 w-4 shrink-0 text-azul-700" />
        <span>
          Las <strong>horas de jornada</strong> de cada día se calculan solas:
          salida menos entrada, menos el almuerzo (que <strong>no</strong> cuenta
          como trabajo). Esta plantilla se aplica a todas las semanas de{" "}
          {etiqueta}; lo que exceda la jornada de un día se calcula como hora
          extra.
        </span>
      </p>

      {/* ---------------- Calendario del mes ---------------- */}
      <div className="rounded-fino border border-acero-200 bg-blanco p-4">
        <div className="flex flex-wrap items-baseline justify-between gap-2 border-b border-acero-200 pb-3">
          <h3 className="font-titulo text-lg font-semibold uppercase tracking-wide text-azul-950">
            {etiqueta}, día por día
          </h3>
          <p className="text-sm text-acero-600">
            Jornada ordinaria del mes:{" "}
            <strong className="text-azul-950">
              {formatearHorasDecimales(minutosDelMes)}
            </strong>
          </p>
        </div>

        <div className="mt-3 grid grid-cols-7 gap-1 text-center">
          {DIAS_ORDEN.map((clave) => (
            <span
              key={clave}
              className="pb-1 text-[11px] font-semibold uppercase tracking-wider text-acero-600"
            >
              {DIA_CORTO[clave]}
            </span>
          ))}
          {/* Huecos hasta el primer día del mes (la semana empieza el lunes). */}
          {Array.from({
            length: (DIAS_ORDEN.indexOf(calendario[0]?.clave ?? "lun") + 7) % 7,
          }).map((_, i) => (
            <span key={`hueco-${i}`} aria-hidden="true" />
          ))}
          {calendario.map((d) => (
            <span
              key={d.fecha}
              title={
                d.festivo
                  ? `${d.dia}: festivo — ${d.festivo}`
                  : d.laboral
                    ? `${d.dia}: laboral, ${formatearHorasDecimales(d.minutos)}`
                    : `${d.dia}: no laboral`
              }
              className={`rounded-fino border px-1 py-1.5 text-xs font-semibold tabular-nums ${
                d.festivo
                  ? "border-verde-300 bg-verde-100 text-verde-700"
                  : d.laboral
                    ? "border-azul-300 bg-azul-50 text-azul-800"
                    : "border-acero-200 bg-acero-50 text-acero-600"
              }`}
            >
              {d.dia}
            </span>
          ))}
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-acero-600">
          <span className="inline-flex items-center gap-1.5">
            <span className="inline-block h-3 w-3 rounded-fino border border-azul-300 bg-azul-50" />
            Laboral
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="inline-block h-3 w-3 rounded-fino border border-acero-200 bg-acero-50" />
            No laboral
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="inline-block h-3 w-3 rounded-fino border border-verde-300 bg-verde-100" />
            Festivo
          </span>
        </div>

        {festivos.length > 0 && (
          <ul className="mt-3 space-y-1 border-t border-acero-200 pt-3 text-sm text-acero-700">
            {festivos.map((f) => (
              <li key={f.fecha}>
                <strong className="text-azul-950">{f.dia}</strong> — {f.nombre}
              </li>
            ))}
          </ul>
        )}
        <p className="mt-3 text-xs leading-relaxed text-acero-600">
          Los festivos los pone la ley y se calculan solos (incluidos los que se
          trasladan al lunes y los de Semana Santa): no se apagan desde aquí.
          Trabajar en uno se calcula como dominical, aunque el día sea laboral en
          la plantilla.
        </p>
      </div>

      {/* ---------------- Nota del mes ---------------- */}
      <div>
        <label
          htmlFor="horario-notas"
          className="mb-1.5 block text-sm font-semibold text-azul-950"
        >
          Nota del mes (opcional)
        </label>
        <textarea
          id="horario-notas"
          name="notas"
          rows={2}
          defaultValue={notasIniciales}
          placeholder="Ej.: la última semana se sale a las 4:00 p. m. por inventario."
          className={`${inputClass} resize-y`}
        />
        <span className="mt-1 block text-xs leading-relaxed text-acero-600">
          Queda guardada junto al horario, para recordar por qué cambió.
        </span>
      </div>

      {aviso && (
        <p
          role="status"
          className="rounded-fino border border-azul-300 bg-azul-50 px-4 py-3 text-sm leading-relaxed text-azul-900"
        >
          {aviso}
        </p>
      )}

      {state.status !== "idle" && state.message && (
        <p
          role="status"
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
              Guardar horario
            </>
          )}
        </button>
      </div>

      <p className="flex items-start gap-2 text-xs leading-relaxed text-acero-600">
        <IconoInfo className="mt-0.5 h-4 w-4 shrink-0 text-azul-700" />
        <span>
          Corregir este horario <strong>no altera</strong> las jornadas que ya
          estén aprobadas: su cálculo quedó congelado al aprobarlas. Si hace
          falta recalcular una, vuelve a dejarla pendiente desde su ficha y
          apruébala de nuevo.
        </span>
      </p>
    </form>
  );
}
