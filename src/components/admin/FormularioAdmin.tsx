"use client";

import Link from "next/link";
import { useActionState, useState, type ReactNode } from "react";
import { idleState, type ActionState } from "@/lib/admin-types";
import { IconoCheck, IconoPapelera } from "./iconos";
import { botonPrimario, botonPeligro } from "./ui-base";

/* ------------------------------------------------------------------ */
/* Formulario genérico del panel                                       */
/* ------------------------------------------------------------------ */

/**
 * Envuelve una server action con `useActionState`: el botón se deshabilita
 * mientras guarda y el resultado se pinta debajo.
 *
 * ⚠ Importa las clases y los iconos de `./ui-base` y `./iconos`, **nunca de
 * `./ui.tsx`** (regla 1 de `AGENTS.md`): este archivo es de cliente y arrastrar
 * `ui.tsx` al navegador deja colgada la respuesta de la acción en producción.
 */
export function FormularioAdmin({
  action,
  children,
  submitLabel = "Guardar cambios",
  backHref,
  backLabel,
  className = "",
  /** Texto de confirmación antes de enviar. Se usa en lo irreversible. */
  confirmar,
}: {
  action: (state: ActionState, formData: FormData) => Promise<ActionState>;
  children: ReactNode;
  submitLabel?: string;
  backHref?: string;
  backLabel?: string;
  className?: string;
  confirmar?: string;
}) {
  const [state, formAction, pending] = useActionState(action, idleState);

  return (
    <form
      action={formAction}
      onSubmit={(event) => {
        if (confirmar && !window.confirm(confirmar)) event.preventDefault();
      }}
      className={`space-y-5 ${className}`}
    >
      {children}

      {state.status !== "idle" && state.message && (
        <p
          role="status"
          className={`rounded-fino border px-4 py-3 text-sm leading-relaxed ${
            state.status === "success"
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
              {submitLabel}
            </>
          )}
        </button>

        {backHref && (
          <Link
            prefetch={false}
            href={backHref}
            className="inline-flex items-center gap-1.5 rounded-fino border border-acero-300 bg-blanco px-4 py-2.5 text-sm font-semibold text-acero-700 transition-colors hover:border-azul-700 hover:text-azul-700"
          >
            <span aria-hidden="true">←</span>
            {backLabel ?? "Cancelar"}
          </Link>
        )}
      </div>
    </form>
  );
}

/* ------------------------------------------------------------------ */
/* Eliminar con confirmación                                           */
/* ------------------------------------------------------------------ */

/**
 * Botón de eliminar con confirmación del navegador.
 *
 * Regla 6 de `AGENTS.md`: **eliminar lleva doble confirmación** y el mensaje
 * dice siempre que ocultar es la alternativa reversible. La segunda
 * confirmación —escribir un texto exacto— la ponen las pantallas donde el
 * borrado arrastra datos de personas (ver `/admin/equipo`).
 */
export function FormularioEliminar({
  action,
  id,
  label = "Eliminar",
  confirmMessage = "¿Seguro que quieres eliminar este elemento?\n\nEsto es permanente y no se puede deshacer.\n\nSi solo quieres retirarlo del sitio, cancela y ponlo en «Oculto»: así se conserva y puedes volver a mostrarlo cuando quieras.",
}: {
  action: (state: ActionState, formData: FormData) => Promise<ActionState>;
  id: string;
  label?: string;
  confirmMessage?: string;
}) {
  const [state, formAction, pending] = useActionState(action, idleState);

  return (
    <form
      action={formAction}
      onSubmit={(event) => {
        if (!window.confirm(confirmMessage)) event.preventDefault();
      }}
      className="inline-flex flex-col items-start"
    >
      <input type="hidden" name="id" value={id} />
      <button type="submit" disabled={pending} className={botonPeligro}>
        <IconoPapelera className="h-4 w-4" />
        {pending ? "Eliminando…" : label}
      </button>
      {state.status === "error" && state.message && (
        <span className="mt-1 text-xs text-error-500">{state.message}</span>
      )}
    </form>
  );
}

/* ------------------------------------------------------------------ */
/* Acción suelta (activar, desactivar, restablecer…)                    */
/* ------------------------------------------------------------------ */

/**
 * Un botón que dispara una server action con unos campos ocultos. Para las
 * acciones de una sola pulsación que no merecen un formulario entero.
 */
export function BotonAccion({
  action,
  campos,
  label,
  pendingLabel = "Un momento…",
  confirmar,
  className,
  icon,
}: {
  action: (state: ActionState, formData: FormData) => Promise<ActionState>;
  campos: Record<string, string>;
  label: string;
  pendingLabel?: string;
  confirmar?: string;
  className?: string;
  icon?: ReactNode;
}) {
  const [state, formAction, pending] = useActionState(action, idleState);

  return (
    <form
      action={formAction}
      onSubmit={(event) => {
        if (confirmar && !window.confirm(confirmar)) event.preventDefault();
      }}
      className="inline-flex flex-col items-start"
    >
      {Object.entries(campos).map(([name, value]) => (
        <input key={name} type="hidden" name={name} value={value} />
      ))}
      <button
        type="submit"
        disabled={pending}
        className={
          className ??
          "inline-flex items-center gap-1.5 rounded-fino border border-acero-300 bg-blanco px-3 py-2 text-xs font-semibold text-acero-700 transition-colors hover:border-azul-700 hover:text-azul-700 disabled:opacity-60"
        }
      >
        {icon}
        {pending ? pendingLabel : label}
      </button>
      {state.status !== "idle" && state.message && (
        <span
          role="status"
          className={`mt-1 max-w-xs text-xs leading-relaxed ${
            state.status === "success" ? "text-verde-700" : "text-error-500"
          }`}
        >
          {state.message}
        </span>
      )}
    </form>
  );
}

/* ------------------------------------------------------------------ */
/* Confirmación escrita (segunda barrera)                              */
/* ------------------------------------------------------------------ */

/**
 * DOBLE CONFIRMACIÓN PARA ELIMINAR UNA CUENTA
 * -------------------------------------------
 * Primero hay que **escribir el usuario exacto** y después aceptar el aviso del
 * navegador. Borrar una cuenta arrastra sus jornadas (`on delete cascade`), así
 * que no puede ser un clic distraído.
 */
export function EliminarConfirmando({
  action,
  id,
  usuario,
  nombre,
}: {
  action: (state: ActionState, formData: FormData) => Promise<ActionState>;
  id: string;
  usuario: string;
  nombre: string;
}) {
  const [state, formAction, pending] = useActionState(action, idleState);
  const [escrito, setEscrito] = useState("");
  const coincide = escrito.trim().toLowerCase() === usuario.toLowerCase();

  return (
    <form
      action={formAction}
      onSubmit={(event) => {
        if (
          !window.confirm(
            `Vas a eliminar la cuenta de ${nombre} (${usuario}).\n\nSe borran también sus jornadas registradas. Esto es permanente y no se puede deshacer.\n\nSi solo quieres que no pueda entrar, cancela y desactívala: la cuenta y su historial se conservan.`,
          )
        ) {
          event.preventDefault();
        }
      }}
      className="space-y-3"
    >
      <input type="hidden" name="id" value={id} />
      <div>
        <label
          htmlFor="confirmar-usuario"
          className="mb-1.5 block text-sm font-semibold text-azul-950"
        >
          Escribe <span className="font-mono text-error-500">{usuario}</span> para
          confirmar
        </label>
        <input
          id="confirmar-usuario"
          name="confirm_usuario"
          type="text"
          autoComplete="off"
          value={escrito}
          onChange={(e) => setEscrito(e.target.value)}
          className="w-full max-w-xs rounded-fino border border-acero-300 bg-blanco px-3 py-2.5 text-sm text-azul-950 focus:border-error-500 focus:outline-none focus:ring-2 focus:ring-error-500/25"
        />
      </div>
      <button
        type="submit"
        disabled={pending || !coincide}
        className="inline-flex items-center gap-1.5 rounded-fino bg-error-500 px-4 py-2.5 text-sm font-semibold text-blanco transition-colors hover:bg-error-700 disabled:pointer-events-none disabled:opacity-40"
      >
        <IconoPapelera className="h-4 w-4" />
        {pending ? "Eliminando…" : "Eliminar definitivamente"}
      </button>
      {state.status === "error" && state.message && (
        <p role="alert" className="text-sm text-error-500">
          {state.message}
        </p>
      )}
    </form>
  );
}
