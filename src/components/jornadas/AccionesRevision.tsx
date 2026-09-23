"use client";

/**
 * APROBAR · RECHAZAR · REABRIR
 * ============================
 * Las tres acciones de revisión de una jornada, en un solo bloque para que la
 * diferencia entre ellas esté escrita justo donde se pulsa.
 *
 * **NO SE ELIMINAN JORNADAS DESDE EL PANEL** (decisión de PIYC, reunión de
 * sept-2026). El registro de horas es el soporte de lo que se paga: una vez
 * creado, se aprueba o se rechaza, pero no desaparece. Lo que antes era el
 * bloque «Eliminar el registro» se quitó de aquí; el permiso sigue existiendo en
 * la base (RLS y migraciones intactas), solo que ninguna pantalla lo ofrece.
 *
 * **RECHAZAR ES LA HERRAMIENTA** (regla 6 de `AGENTS.md`): devuelve la jornada
 * al empleado con una nota que él lee en su portal para corregirla, y el
 * registro se conserva siempre.
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
  banner,
  botonOscuro,
  botonPrimario,
  botonSecundario,
  etiquetaCampo,
  inputClass,
} from "@/components/admin/ui-base";
import { IconoCheck } from "@/components/admin/iconos";

type Accion = (state: ActionState, formData: FormData) => Promise<ActionState>;

function Mensaje({ state }: { state: ActionState }) {
  if (state.status === "idle" || !state.message) return null;
  const exito = state.status === "success";
  return (
    <p
      role={exito ? "status" : "alert"}
      className={`mt-2 ${banner(exito)}`}
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
}: {
  id: string;
  estado: EstadoJornada;
  aprobar: Accion;
  rechazar: Accion;
  reabrir: Accion;
}) {
  const [estadoAprobar, accionAprobar, aprobando] = useActionState(aprobar, idleState);
  const [estadoRechazar, accionRechazar, rechazando] = useActionState(rechazar, idleState);
  const [estadoReabrir, accionReabrir, reabriendo] = useActionState(reabrir, idleState);

  const [rechazoAbierto, setRechazoAbierto] = useState(false);

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

          <div className="rounded-control bg-lienzo-alto p-4 ring-1 ring-separador">
            <p className="text-sm font-semibold text-azul-950">
              ¿Hay algo que corregir?
            </p>
            <p className="mt-1 text-xs leading-relaxed text-acero-600">
              <strong>Rechazar no borra nada.</strong> La jornada se conserva y
              vuelve al portal de la persona con tu nota, para que la registre
              bien. Es la única forma de pedir una corrección.
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
                  className={etiquetaCampo}
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
                    className={botonOscuro}
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

      {/*
        AQUÍ ESTABA «Eliminar el registro». Se quitó por decisión de PIYC
        (reunión de sept-2026): una jornada registrada no se borra desde el
        panel; se aprueba o se rechaza. El permiso sigue vivo en la base —RLS y
        migraciones sin tocar—, así que si algún día hace falta limpiar una fila
        de prueba se hace desde Supabase, no desde la interfaz.
      */}
    </div>
  );
}
