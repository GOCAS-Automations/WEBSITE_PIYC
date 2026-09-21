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
import { ETIQUETA_ESTADO, type EstadoJornada } from "@/lib/jornada-types";
import { Insignia } from "@/components/admin/ui-base";
import {
  CHIP_AZUL,
  CHIP_NEUTRO,
  CHIP_ROJO,
  CHIP_VERDE,
  tarjetaClase,
  tituloSeccion,
} from "@/components/admin/clases";

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
      className={`rounded-control p-3.5 ${
        destacada ? "bg-azul-700 shadow-sutil" : "bg-lienzo-alto ring-1 ring-separador"
      }`}
    >
      {/* `whitespace-nowrap` + 1.5rem: «8 h 30 min» partía en dos renglones y
          desalineaba la fila de widgets. */}
      <p
        className={`whitespace-nowrap text-titular-sm font-semibold tracking-display tabular-nums ${
          destacada ? "text-blanco" : "text-azul-950"
        }`}
      >
        {formatearDuracion(minutos)}
      </p>
      <p
        className={`mt-1.5 text-[11px] font-semibold uppercase tracking-ancho ${
          destacada ? "text-azul-200" : "text-acero-500"
        }`}
      >
        {etiqueta}
      </p>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Chip de estado de una jornada                                       */
/* ------------------------------------------------------------------ */

/**
 * PENDIENTE · APROBADA · RECHAZADA, con el tinte suave de cada una.
 *
 * Vive aquí y no en `src/lib/jornada-types.ts` porque es **presentación**: el
 * módulo de tipos es puro y no debe saber de la piel del panel. Que sea un solo
 * componente evita que el listado, la ficha y el portal pinten tres chips
 * distintos para lo mismo.
 */
export function ChipEstado({ estado }: { estado: EstadoJornada }) {
  return <Insignia className={TINTE_ESTADO[estado]}>{ETIQUETA_ESTADO[estado]}</Insignia>;
}

const TINTE_ESTADO: Record<EstadoJornada, string> = {
  pendiente: CHIP_AZUL,
  aprobada: CHIP_VERDE,
  rechazada: CHIP_ROJO,
};

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
      <p className="rounded-tarjeta bg-error-50 px-4 py-3.5 text-sm leading-relaxed text-error-700">
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
            <Insignia className={CHIP_AZUL}>Cruza la medianoche</Insignia>
          )}
          {!desglose.diaLaboral && desglose.festivos.length === 0 && (
            <Insignia className={CHIP_AZUL}>Día no laboral</Insignia>
          )}
          {desglose.festivos.map((festivo) => (
            <Insignia key={festivo} className={CHIP_VERDE}>
              Festivo: {festivo}
            </Insignia>
          ))}
          {desglose.almuerzoMinutos > 0 && (
            <Insignia className={CHIP_NEUTRO}>
              {formatearDuracion(desglose.almuerzoMinutos)} de almuerzo, descontada
            </Insignia>
          )}
        </div>
      )}

      {/* Tabla por categoría */}
      {!compacto && filas.length > 0 && (
        <div className="overflow-hidden rounded-control ring-1 ring-separador">
          <table className="w-full border-collapse text-sm">
            <caption className="sr-only">
              Reparto de las horas de la jornada por categoría.
            </caption>
            <tbody>
              {filas.map((fila) => (
                <tr key={fila.clave} className="border-b border-separador last:border-0">
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
              <tr className="border-t border-separador bg-lienzo-alto">
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
    <section className={`${tarjetaClase} p-5`}>
      <div className="mb-4 border-b border-separador pb-3">
        <h2 className={tituloSeccion}>{titulo}</h2>
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
        <dl className="mt-4 grid gap-x-6 gap-y-1.5 border-t border-separador pt-3 sm:grid-cols-2">
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
