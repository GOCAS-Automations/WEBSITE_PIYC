"use client";

/**
 * HISTORIAL DE JORNADAS DEL PORTAL
 * ================================
 * Lo que ve cada persona de lo suyo: estado, horas, filtros por mes y por
 * estado, totales del periodo y —si la devolvieron— la nota de quien revisó.
 *
 * POR QUÉ FILTRA EN EL CLIENTE: una persona tiene decenas de jornadas, no miles,
 * y el portal se usa en obra con mala señal. Filtrar sin recargar la página es
 * instantáneo y no depende de la red. El panel, que sí maneja el histórico de
 * todo el equipo, filtra en la URL y contra la base.
 *
 * Editar y eliminar solo aparecen mientras la jornada está **pendiente**: la
 * acción del servidor y la RLS de la migración 0002 lo vuelven a exigir.
 *
 * ⚠ REGLA 1: componente de cliente → importa de `components/admin/ui-base`.
 */

import { useActionState, useMemo, useState } from "react";
import {
  formatearDuracion,
  formatearFechaLarga,
  obtenerDesglose,
  rangoHorario,
  sumarDesgloses,
  type JornadaConfig,
} from "@/lib/jornada";
import { etiquetaMes, type MapaHorarios } from "@/lib/horarios";
import {
  CLASES_ESTADO,
  ETIQUETA_ESTADO,
  ESTADOS_JORNADA,
  type EstadoJornada,
  type JornadaRecord,
} from "@/lib/jornada-types";
import { idleState, type ActionState } from "@/lib/admin-types";
import {
  Insignia,
  Paginacion,
  botonPeligro,
  botonSecundario,
  inputClass,
  usePaginaLocal,
} from "@/components/admin/ui-base";
import { IconoLapiz, IconoPapelera } from "@/components/admin/iconos";
import { Desglose } from "./Desglose";
import { FormularioJornada } from "./FormularioJornada";

export function MisJornadas({
  jornadas,
  config,
  horarios,
  hoy,
  guardar,
  eliminar,
}: {
  jornadas: JornadaRecord[];
  config: JornadaConfig;
  horarios: MapaHorarios;
  hoy: string;
  guardar: (state: ActionState, formData: FormData) => Promise<ActionState>;
  eliminar: (state: ActionState, formData: FormData) => Promise<ActionState>;
}) {
  const [mes, setMes] = useState("");
  const [estado, setEstado] = useState<EstadoJornada | "">("");
  const [editando, setEditando] = useState<string | null>(null);

  /* --- Meses disponibles, del más reciente al más antiguo ---------- */
  const meses = useMemo(() => {
    const vistos = new Set<string>();
    for (const j of jornadas) {
      const clave = j.work_date.slice(0, 7);
      if (/^\d{4}-\d{2}$/.test(clave)) vistos.add(clave);
    }
    return [...vistos]
      .sort((a, b) => b.localeCompare(a))
      .map((clave) => ({
        clave,
        etiqueta: etiquetaMes(Number(clave.slice(0, 4)), Number(clave.slice(5, 7))),
      }));
  }, [jornadas]);

  const filtradas = useMemo(
    () =>
      jornadas.filter(
        (j) =>
          (mes === "" || j.work_date.startsWith(mes)) &&
          (estado === "" || j.status === estado),
      ),
    [jornadas, mes, estado],
  );

  /* --- Desgloses y totales del periodo filtrado -------------------- */
  const desgloses = useMemo(() => {
    const mapa = new Map<string, ReturnType<typeof obtenerDesglose>>();
    for (const j of filtradas) mapa.set(j.id, obtenerDesglose(j, config, horarios));
    return mapa;
  }, [filtradas, config, horarios]);

  const totales = useMemo(
    () =>
      sumarDesgloses(
        filtradas.flatMap((j) => {
          const d = desgloses.get(j.id);
          return d ? [d.desglose] : [];
        }),
      ),
    [filtradas, desgloses],
  );

  const pagina = usePaginaLocal(filtradas, `${mes}|${estado}`);

  if (jornadas.length === 0) {
    return (
      <div className="rounded-fino border border-dashed border-acero-300 bg-acero-50 p-8 text-center">
        <p className="font-titulo text-lg font-semibold uppercase tracking-wide text-azul-950">
          Todavía no has registrado ninguna jornada
        </p>
        <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-acero-600">
          Usa el formulario de arriba al terminar tu turno. Aquí irá quedando el
          historial con el estado de cada una.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Filtros */}
      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label
            htmlFor="mis-jornadas-mes"
            className="mb-1.5 block text-sm font-semibold text-azul-950"
          >
            Mes
          </label>
          <select
            id="mis-jornadas-mes"
            value={mes}
            onChange={(e) => setMes(e.target.value)}
            className={inputClass}
          >
            <option value="">Todos los meses</option>
            {meses.map((m) => (
              <option key={m.clave} value={m.clave}>
                {m.etiqueta}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label
            htmlFor="mis-jornadas-estado"
            className="mb-1.5 block text-sm font-semibold text-azul-950"
          >
            Estado
          </label>
          <select
            id="mis-jornadas-estado"
            value={estado}
            onChange={(e) => setEstado(e.target.value as EstadoJornada | "")}
            className={inputClass}
          >
            <option value="">Todos los estados</option>
            {ESTADOS_JORNADA.map((e) => (
              <option key={e} value={e}>
                {ETIQUETA_ESTADO[e]}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Totales del periodo. Regla 9: sin jornadas no se pinta. */}
      {totales.jornadas > 0 && (
        <div className="rounded-fino border border-azul-300 bg-azul-50 p-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-azul-700">
            {mes === "" ? "Todo el historial" : "Periodo seleccionado"}
          </p>
          <p className="mt-1 font-titulo text-3xl font-semibold leading-none tabular-nums text-azul-700">
            {formatearDuracion(totales.minutosTrabajados)}
          </p>
          <p className="mt-1.5 text-sm text-azul-900">
            trabajadas en {totales.jornadas}{" "}
            {totales.jornadas === 1 ? "jornada" : "jornadas"}
            {totales.extras > 0 && (
              <> · {formatearDuracion(totales.extras)} de hora extra</>
            )}
            {totales.minutosDominicales > 0 && (
              <>
                {" "}
                · {formatearDuracion(totales.minutosDominicales)} en dominical o
                festivo
              </>
            )}
          </p>
        </div>
      )}

      {filtradas.length === 0 ? (
        <p className="rounded-fino border border-dashed border-acero-300 bg-acero-50 px-4 py-6 text-center text-sm text-acero-600">
          Ninguna jornada coincide con ese filtro.
        </p>
      ) : (
        <>
          <ul id="mis-jornadas" className="scroll-mt-8 space-y-3">
            {pagina.visibles.map((j) => {
              const resuelto = desgloses.get(j.id);
              const editable = j.status === "pendiente";
              const enEdicion = editando === j.id;

              return (
                <li
                  key={j.id}
                  className="rounded-fino border border-acero-200 bg-blanco p-4"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="font-titulo text-lg font-semibold uppercase tracking-wide text-azul-950">
                          {formatearFechaLarga(j.work_date)}
                        </h3>
                        <Insignia className={CLASES_ESTADO[j.status]}>
                          {ETIQUETA_ESTADO[j.status]}
                        </Insignia>
                      </div>
                      <p className="mt-1 text-sm text-acero-700">
                        {rangoHorario(j.start_at, j.end_at)}
                        {resuelto && (
                          <>
                            {" "}
                            ·{" "}
                            <strong className="text-azul-950">
                              {formatearDuracion(resuelto.desglose.minutosTrabajados)}
                            </strong>{" "}
                            trabajadas
                          </>
                        )}
                        {j.work_order && <> · Orden {j.work_order}</>}
                      </p>
                    </div>

                    {editable && !enEdicion && (
                      <div className="flex flex-wrap items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setEditando(j.id)}
                          className={`${botonSecundario} px-3 py-2 text-xs`}
                        >
                          <IconoLapiz className="h-3.5 w-3.5" />
                          Editar
                        </button>
                        <BotonEliminarPropia id={j.id} eliminar={eliminar} />
                      </div>
                    )}
                  </div>

                  <p className="mt-2 text-sm leading-relaxed text-acero-700">
                    {j.description}
                  </p>
                  {j.observations && (
                    <p className="mt-1 text-sm leading-relaxed text-acero-600">
                      <span className="font-semibold text-azul-950">Observaciones:</span>{" "}
                      {j.observations}
                    </p>
                  )}

                  {/* Nota de revisión: lo primero que hay que ver si la devolvieron. */}
                  {j.status === "rechazada" && (
                    <div className="mt-3 rounded-fino border border-error-300 bg-error-50 px-3.5 py-3">
                      <p className="text-sm font-semibold text-error-700">
                        Esta jornada te la devolvieron para corregirla
                      </p>
                      <p className="mt-1 text-sm leading-relaxed text-error-700">
                        {j.review_note ?? "Sin nota."}
                      </p>
                      <p className="mt-1.5 text-xs leading-relaxed text-acero-600">
                        No está eliminada: el registro se conserva. Regístrala de
                        nuevo con la corrección y avísale a tu coordinador.
                      </p>
                    </div>
                  )}
                  {j.status === "aprobada" && j.review_note && (
                    <p className="mt-3 rounded-fino border border-verde-300 bg-verde-100 px-3.5 py-2.5 text-sm leading-relaxed text-verde-700">
                      <span className="font-semibold">Nota de quien revisó:</span>{" "}
                      {j.review_note}
                    </p>
                  )}

                  {/* Desglose, plegado: quien quiera el detalle lo abre. */}
                  {resuelto && (
                    <details className="group mt-3">
                      <summary className="cursor-pointer list-none text-sm font-semibold text-azul-700 transition-colors hover:text-azul-800 [&::-webkit-details-marker]:hidden">
                        Ver el desglose de horas
                        <span className="ml-1 inline-block transition-transform group-open:rotate-90">
                          ›
                        </span>
                      </summary>
                      <div className="mt-3">
                        <Desglose
                          desglose={resuelto.desglose}
                          contexto={resuelto.contexto}
                          congelado={resuelto.congelado}
                          calculadoEn={resuelto.calculadoEn}
                        />
                      </div>
                    </details>
                  )}

                  {/* Edición en el sitio */}
                  {enEdicion && (
                    <div className="mt-4 border-t border-acero-200 pt-4">
                      <p className="mb-3 text-sm font-semibold text-azul-950">
                        Editando esta jornada
                      </p>
                      <FormularioJornada
                        action={guardar}
                        config={config}
                        horarios={horarios}
                        hoy={hoy}
                        jornada={j}
                        onCancel={() => setEditando(null)}
                      />
                    </div>
                  )}
                </li>
              );
            })}
          </ul>

          <Paginacion
            pagina={pagina.pagina}
            total={pagina.total}
            totalPaginas={pagina.totalPaginas}
            onCambiar={pagina.setPagina}
            ancla="mis-jornadas"
            etiqueta="Páginas de mis jornadas"
          />
        </>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Eliminar una jornada propia                                         */
/* ------------------------------------------------------------------ */

/**
 * Regla 6: eliminar lleva **doble confirmación** y el aviso dice qué se pierde.
 * Aquí la segunda barrera es que el botón solo existe mientras la jornada está
 * pendiente; una vez revisada, corregirla es cosa del coordinador.
 */
function BotonEliminarPropia({
  id,
  eliminar,
}: {
  id: string;
  eliminar: (state: ActionState, formData: FormData) => Promise<ActionState>;
}) {
  const [state, formAction, pending] = useActionState(eliminar, idleState);
  const [confirmando, setConfirmando] = useState(false);

  if (!confirmando) {
    return (
      <span className="inline-flex flex-col items-start">
        <button
          type="button"
          onClick={() => setConfirmando(true)}
          className={`${botonPeligro} px-3 py-2`}
        >
          <IconoPapelera className="h-3.5 w-3.5" />
          Eliminar
        </button>
        {state.status === "error" && state.message && (
          <span className="mt-1 max-w-xs text-xs leading-relaxed text-error-500">
            {state.message}
          </span>
        )}
      </span>
    );
  }

  return (
    <form
      action={formAction}
      onSubmit={(event) => {
        // Segunda barrera: primero hay que pedir eliminar y después aceptar.
        if (
          !window.confirm(
            "Vas a eliminar esta jornada.\n\nEl registro desaparece y no se puede deshacer.\n\n¿Continuamos?",
          )
        ) {
          event.preventDefault();
          setConfirmando(false);
        }
      }}
      className="inline-flex items-center gap-2"
    >
      <input type="hidden" name="id" value={id} />
      <button
        type="submit"
        disabled={pending}
        className="inline-flex items-center gap-1.5 rounded-fino bg-error-500 px-3 py-2 text-xs font-semibold text-blanco transition-colors hover:bg-error-700 disabled:opacity-60"
      >
        <IconoPapelera className="h-3.5 w-3.5" />
        {pending ? "Eliminando…" : "Sí, eliminar"}
      </button>
      <button
        type="button"
        onClick={() => setConfirmando(false)}
        className={`${botonSecundario} px-3 py-2 text-xs`}
      >
        No
      </button>
    </form>
  );
}
