/**
 * DESGLOSE DE HORAS DE UNA JORNADA
 * ================================
 * La misma pieza la usan la vista previa del formulario (en el navegador), el
 * historial del portal y el detalle de `/admin/jornadas`: si el desglose se
 * pintara distinto en cada sitio, dos pantallas acabarían discrepando.
 *
 * Este archivo NO lleva `"use client"` —lo importan Server Components— pero
 * tampoco importa nada de `components/admin/ui.tsx` (**regla 1**): solo de
 * `ui-base.tsx`, que sí es de cliente, para poder usarse desde el formulario.
 *
 * REGLA 9: una categoría en `0` no se pinta. Una fila que dice «0 min» no
 * informa; ocupa sitio y hace dudar de si el cálculo corrió.
 */

import {
  CATEGORIAS_DESGLOSE,
  ETIQUETA_CATEGORIA,
  formatearDuracion,
  formatearFechaNumerica,
  fechaColombia,
  type ContextoCalculo,
  type DesgloseJornada,
  type TotalesJornadas,
} from "@/lib/jornada";
import { Insignia } from "@/components/admin/ui-base";

/* ------------------------------------------------------------------ */
/* Cifra suelta                                                        */
/* ------------------------------------------------------------------ */

function Cifra({
  etiqueta,
  minutos,
  destacada = false,
}: {
  etiqueta: string;
  minutos: number;
  destacada?: boolean;
}) {
  return (
    <div
      className={`rounded-fino border p-3 ${
        destacada ? "border-azul-300 bg-azul-50" : "border-acero-200 bg-acero-50"
      }`}
    >
      <p
        className={`font-titulo text-2xl font-semibold leading-none tabular-nums ${
          destacada ? "text-azul-700" : "text-azul-950"
        }`}
      >
        {formatearDuracion(minutos)}
      </p>
      <p className="mt-1 text-xs font-semibold uppercase tracking-wider text-acero-600">
        {etiqueta}
      </p>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Desglose de una jornada                                             */
/* ------------------------------------------------------------------ */

export function Desglose({
  desglose,
  contexto,
  congelado = false,
  calculadoEn = null,
  compacto = false,
}: {
  desglose: DesgloseJornada;
  contexto?: ContextoCalculo | null;
  congelado?: boolean;
  calculadoEn?: string | null;
  /** true = solo las cifras gruesas, sin la tabla por categoría. */
  compacto?: boolean;
}) {
  if (!desglose.valido) {
    return (
      <p className="rounded-fino border border-error-300 bg-error-50 px-4 py-3 text-sm leading-relaxed text-error-700">
        {desglose.error ?? "No se pudieron calcular las horas de esta jornada."}
      </p>
    );
  }

  const filas = CATEGORIAS_DESGLOSE.filter((clave) => desglose[clave] > 0).map((clave) => ({
    clave,
    etiqueta: ETIQUETA_CATEGORIA[clave],
    minutos: desglose[clave],
  }));

  return (
    <div className="space-y-3">
      {/* Cifras gruesas */}
      <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
        <Cifra etiqueta="Trabajadas" minutos={desglose.minutosTrabajados} destacada />
        {desglose.ordinarias > 0 && (
          <Cifra etiqueta="Ordinarias" minutos={desglose.ordinarias} />
        )}
        {desglose.extras > 0 && <Cifra etiqueta="Extra" minutos={desglose.extras} />}
        {desglose.minutosNocturnos > 0 && (
          <Cifra etiqueta="Nocturnas" minutos={desglose.minutosNocturnos} />
        )}
        {desglose.minutosDominicales > 0 && (
          <Cifra etiqueta="Dominical / festiva" minutos={desglose.minutosDominicales} />
        )}
      </div>

      {/* Banderas */}
      {(desglose.cruzaMedianoche ||
        desglose.festivos.length > 0 ||
        !desglose.diaLaboral ||
        desglose.almuerzoMinutos > 0) && (
        <div className="flex flex-wrap items-center gap-2">
          {desglose.cruzaMedianoche && (
            <Insignia className="border-azul-300 bg-azul-50 text-azul-800">
              Cruza la medianoche
            </Insignia>
          )}
          {!desglose.diaLaboral && desglose.festivos.length === 0 && (
            <Insignia className="border-azul-300 bg-azul-50 text-azul-800">
              Día no laboral
            </Insignia>
          )}
          {desglose.festivos.map((festivo) => (
            <Insignia
              key={festivo}
              className="border-verde-300 bg-verde-100 text-verde-700"
            >
              Festivo: {festivo}
            </Insignia>
          ))}
          {desglose.almuerzoMinutos > 0 && (
            <Insignia>
              {formatearDuracion(desglose.almuerzoMinutos)} de almuerzo, descontada
            </Insignia>
          )}
        </div>
      )}

      {/* Tabla por categoría */}
      {!compacto && filas.length > 0 && (
        <div className="overflow-hidden rounded-fino border border-acero-200">
          <table className="w-full border-collapse text-sm">
            <caption className="sr-only">
              Reparto de las horas de la jornada por categoría.
            </caption>
            <tbody>
              {filas.map((fila) => (
                <tr key={fila.clave} className="border-b border-acero-200 last:border-0">
                  <th
                    scope="row"
                    className="px-3.5 py-2 text-left font-normal text-acero-700"
                  >
                    {fila.etiqueta}
                  </th>
                  <td className="px-3.5 py-2 text-right font-semibold tabular-nums text-azul-950">
                    {formatearDuracion(fila.minutos)}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="border-t border-acero-300 bg-acero-50">
                <th scope="row" className="px-3.5 py-2 text-left font-semibold text-azul-950">
                  Total trabajado
                </th>
                <td className="px-3.5 py-2 text-right font-semibold tabular-nums text-azul-950">
                  {formatearDuracion(desglose.minutosTrabajados)}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      )}

      {/* Contexto del cálculo */}
      {!compacto && contexto && (
        <p className="text-xs leading-relaxed text-acero-600">
          {congelado ? (
            <>
              <strong className="text-azul-950">Cálculo congelado</strong>
              {calculadoEn && <> el {formatearFechaNumerica(fechaColombia(calculadoEn))}</>}
              {contexto.mesEtiqueta && <> con el horario de {contexto.mesEtiqueta}</>}
              {contexto.horarioSemana && <> ({contexto.horarioSemana})</>}. Cambiar
              después el horario del mes o los recargos ya no altera esta jornada.
            </>
          ) : (
            <>
              Calculado <strong className="text-azul-950">en vivo</strong>
              {contexto.mesEtiqueta && <> con el horario de {contexto.mesEtiqueta}</>}
              {contexto.horarioSemana && <> ({contexto.horarioSemana})</>}. Las cifras
              quedan fijas cuando la jornada se apruebe.
            </>
          )}{" "}
          Franja nocturna {contexto.inicioNocturno}–{contexto.finNocturno}.
        </p>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Totales de un conjunto de jornadas                                  */
/* ------------------------------------------------------------------ */

/**
 * Los totales del periodo o del filtro. Es lo que tiene que cuadrar con la
 * última fila del CSV: las dos cifras salen de `sumarDesgloses`.
 */
export function TotalesDesglose({
  totales,
  titulo = "Totales del filtro",
  descripcion,
}: {
  totales: TotalesJornadas;
  titulo?: string;
  descripcion?: string;
}) {
  if (totales.jornadas === 0) return null;

  const filas = CATEGORIAS_DESGLOSE.filter((clave) => totales[clave] > 0);

  return (
    <section className="rounded-fino border border-acero-200 bg-blanco p-5">
      <div className="mb-4 border-b border-acero-200 pb-3">
        <h2 className="font-titulo text-xl font-semibold uppercase tracking-wide text-azul-950">
          {titulo}
        </h2>
        <p className="mt-1 text-sm leading-relaxed text-acero-600">
          {descripcion ??
            `${totales.jornadas} ${totales.jornadas === 1 ? "jornada" : "jornadas"}. Las aprobadas aportan sus cifras congeladas; las demás, las que se ven ahora en pantalla.`}
        </p>
      </div>

      <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
        <Cifra etiqueta="Trabajadas" minutos={totales.minutosTrabajados} destacada />
        {totales.ordinarias > 0 && (
          <Cifra etiqueta="Ordinarias" minutos={totales.ordinarias} />
        )}
        {totales.extras > 0 && <Cifra etiqueta="Extra" minutos={totales.extras} />}
        {totales.minutosNocturnos > 0 && (
          <Cifra etiqueta="Nocturnas" minutos={totales.minutosNocturnos} />
        )}
        {totales.minutosDominicales > 0 && (
          <Cifra etiqueta="Dominical / festiva" minutos={totales.minutosDominicales} />
        )}
      </div>

      {filas.length > 0 && (
        <dl className="mt-4 grid gap-x-6 gap-y-1.5 border-t border-acero-200 pt-3 sm:grid-cols-2">
          {filas.map((clave) => (
            <div key={clave} className="flex items-baseline justify-between gap-3">
              <dt className="text-sm text-acero-700">{ETIQUETA_CATEGORIA[clave]}</dt>
              <dd className="text-sm font-semibold tabular-nums text-azul-950">
                {formatearDuracion(totales[clave])}
              </dd>
            </div>
          ))}
        </dl>
      )}
    </section>
  );
}
