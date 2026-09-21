"use client";

/**
 * APROBAR · RECHAZAR · REABRIR · ELIMINAR
 * =======================================
 * Las cuatro acciones de revisión de una jornada, en un solo bloque para que la
 * diferencia entre ellas esté escrita justo donde se pulsa.
 *
 * **RECHAZAR NO ES ELIMINAR** (regla 6 de `AGENTS.md`). Rechazar devuelve la
 * jornada al empleado con una nota que él lee en su portal para corregirla; el
 * registro se conserva. Eliminar borra la fila y no se puede deshacer, por eso
 * lleva **doble confirmación**: primero hay que abrir el bloque de eliminación y
 * después aceptar el aviso del navegador.
 *
 * Al **aprobar**, el servidor congela el desglose. Volver a poner la jornada en
 * pendiente («Reabrir») es el único camino legítimo para recalcularla.
 *
 * ⚠ REGLA 1: componente de cliente → importa de `components/admin/ui-base`.
 */

import { useActionState, useState } from "react";
import { idleState, type ActionState } from "@/lib/admin-types";
import { LIMITES_JORNADA, type EstadoJornada } from "@/lib/jornada-types";
import {
  botonPeligro,
  botonPrimario,
  botonSecundario,
  inputClass,
} from "@/components/admin/ui-base";
import { IconoCheck, IconoPapelera } from "@/components/admin/iconos";

type Accion = (state: ActionState, formData: FormData) => Promise<ActionState>;

function Mensaje({ state }: { state: ActionState }) {
  if (state.status === "idle" || !state.message) return null;
  const exito = state.status === "success";
  return (
    <p
      role={exito ? "status" : "alert"}
      className={`mt-2 rounded-fino border px-3.5 py-2.5 text-sm leading-relaxed ${
        exito
          ? "border-verde-300 bg-verde-100 text-verde-700"
          : "border-error-300 bg-error-50 text-error-700"
      }`}
    >
      {state.message}
    </p>
  );
}

export function AccionesRevision({
  id,
  estado,
  aprobar,
  rechazar,
  reabrir,
  eliminar,
}: {
  id: string;
  estado: EstadoJornada;
  aprobar: Accion;
  rechazar: Accion;
  reabrir: Accion;
  eliminar: Accion;
}) {
  const [estadoAprobar, accionAprobar, aprobando] = useActionState(aprobar, idleState);
  const [estadoRechazar, accionRechazar, rechazando] = useActionState(rechazar, idleState);
  const [estadoReabrir, accionReabrir, reabriendo] = useActionState(reabrir, idleState);
  const [estadoEliminar, accionEliminar, eliminando] = useActionState(eliminar, idleState);

  const [rechazoAbierto, setRechazoAbierto] = useState(false);
  const [borradoAbierto, setBorradoAbierto] = useState(false);

  const pendiente = estado === "pendiente";

  return (
    <div className="space-y-4">
      {/*
        Los mensajes van FUERA de los bloques condicionales a propósito: al
        aprobar o rechazar, el estado de la jornada cambia y ese bloque
        desaparece. Si la confirmación viviera dentro, se borraría en el mismo
        instante en que hace falta leerla.
      */}
      <Mensaje state={estadoAprobar} />
      <Mensaje state={estadoRechazar} />
      <Mensaje state={estadoReabrir} />
      <Mensaje state={estadoEliminar} />

      {/* ---------------- Pendiente: aprobar o rechazar ---------------- */}
      {pendiente && (
        <>
          <div>
            <form action={accionAprobar}>
              <input type="hidden" name="id" value={id} />
              <button type="submit" disabled={aprobando} className={botonPrimario}>
                {aprobando ? (
                  "Aprobando…"
                ) : (
                  <>
                    <IconoCheck className="h-4 w-4" />
                    Aprobar jornada
                  </>
                )}
              </button>
            </form>
            <p className="mt-1.5 text-xs leading-relaxed text-acero-600">
              Al aprobarla, su desglose de horas queda <strong>congelado</strong>:
              si más adelante se corrige el horario del mes, esta jornada no
              cambia.
            </p>
          </div>

          <div className="rounded-fino border border-acero-200 bg-acero-50 p-4">
            <p className="text-sm font-semibold text-azul-950">
              ¿Hay algo que corregir?
            </p>
            <p className="mt-1 text-xs leading-relaxed text-acero-600">
              <strong>Rechazar no es eliminar.</strong> La jornada se conserva y
              vuelve al portal de la persona con tu nota, para que la registre
              bien. Eliminar sí borra el registro, y está más abajo.
            </p>

            {!rechazoAbierto ? (
              <button
                type="button"
                onClick={() => setRechazoAbierto(true)}
                className={`${botonSecundario} mt-3`}
              >
                Rechazar con una nota
              </button>
            ) : (
              <form action={accionRechazar} className="mt-3 space-y-2.5">
                <input type="hidden" name="id" value={id} />
                <label
                  htmlFor={`nota-rechazo-${id}`}
                  className="block text-sm font-semibold text-azul-950"
                >
                  Motivo del rechazo <span className="text-azul-700">*</span>
                </label>
                <textarea
                  id={`nota-rechazo-${id}`}
                  name="review_note"
                  rows={3}
                  required
                  maxLength={LIMITES_JORNADA.notaRevision}
                  placeholder="Ej.: la hora de salida no coincide con la minuta de la planta; corrígela y vuelve a registrarla."
                  className={`${inputClass} resize-y`}
                />
                <p className="text-xs leading-relaxed text-acero-600">
                  Esto es lo único que la persona va a leer para saber qué
                  corregir. Escríbelo concreto.
                </p>
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="submit"
                    disabled={rechazando}
                    className="inline-flex items-center gap-1.5 rounded-fino bg-azul-950 px-4 py-2.5 text-sm font-semibold text-blanco transition-colors hover:bg-azul-900 disabled:opacity-60"
                  >
                    {rechazando ? "Rechazando…" : "Rechazar y devolver"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setRechazoAbierto(false)}
                    className={botonSecundario}
                  >
                    Cancelar
                  </button>
                </div>
              </form>
            )}
          </div>
        </>
      )}

      {/* ---------------- Ya revisada: reabrir ---------------- */}
      {!pendiente && (
        <div>
          <form
            action={accionReabrir}
            onSubmit={(event) => {
              if (
                !window.confirm(
                  estado === "aprobada"
                    ? "Vas a devolver esta jornada a «pendiente».\n\nSe borra su desglose congelado y las horas se vuelven a calcular con el horario del mes vigente. Al aprobarla de nuevo se congelan otra vez.\n\n¿Continuamos?"
                    : "Vas a devolver esta jornada a «pendiente» y se borra la nota del rechazo.\n\n¿Continuamos?",
                )
              ) {
                event.preventDefault();
              }
            }}
          >
            <input type="hidden" name="id" value={id} />
            <button type="submit" disabled={reabriendo} className={botonSecundario}>
              {reabriendo ? "Un momento…" : "Volver a dejarla pendiente"}
            </button>
          </form>
          <p className="mt-1.5 text-xs leading-relaxed text-acero-600">
            {estado === "aprobada"
              ? "Es la forma de corregir una aprobación hecha por error y también la única manera de recalcular una jornada: al reabrirla se borra el cálculo congelado."
              : "Deja la jornada otra vez a la espera de revisión y borra la nota del rechazo."}
          </p>
        </div>
      )}

      {/* ---------------- Eliminar (doble confirmación) ---------------- */}
      <div className="rounded-fino border border-acero-300 bg-blanco p-4">
        <p className="text-sm font-semibold text-azul-950">Eliminar el registro</p>
        <p className="mt-1 text-xs leading-relaxed text-acero-600">
          Borra la jornada de la base de datos: desaparece también del portal de
          la persona y <strong>no se puede deshacer</strong>. Úsalo solo para
          registros de prueba o duplicados. Para pedir una corrección, rechaza.
        </p>

        {!borradoAbierto ? (
          <button
            type="button"
            onClick={() => setBorradoAbierto(true)}
            className={`${botonPeligro} mt-3`}
          >
            <IconoPapelera className="h-4 w-4" />
            Quiero eliminarla
          </button>
        ) : (
          <form
            action={accionEliminar}
            onSubmit={(event) => {
              if (
                !window.confirm(
                  "Vas a ELIMINAR esta jornada definitivamente.\n\nEl registro desaparece para todos y no se puede recuperar.\n\nSi lo que quieres es pedir una corrección, cancela y usa «Rechazar con una nota»: así la persona la vuelve a registrar bien.\n\n¿Eliminar de todas formas?",
                )
              ) {
                event.preventDefault();
                setBorradoAbierto(false);
              }
            }}
            className="mt-3 flex flex-wrap items-center gap-2"
          >
            <input type="hidden" name="id" value={id} />
            <button
              type="submit"
              disabled={eliminando}
              className="inline-flex items-center gap-1.5 rounded-fino bg-error-500 px-4 py-2.5 text-sm font-semibold text-blanco transition-colors hover:bg-error-700 disabled:opacity-60"
            >
              <IconoPapelera className="h-4 w-4" />
              {eliminando ? "Eliminando…" : "Sí, eliminar definitivamente"}
            </button>
            <button
              type="button"
              onClick={() => setBorradoAbierto(false)}
              className={botonSecundario}
            >
              Cancelar
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
