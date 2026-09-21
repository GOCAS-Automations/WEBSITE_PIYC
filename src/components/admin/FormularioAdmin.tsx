"use client";

import Link from "next/link";
import { useActionState, useState, type ReactNode } from "react";
import { idleState, type ActionState } from "@/lib/admin-types";
import { IconoCheck, IconoPapelera } from "./iconos";
import {
  banner,
  botonChico,
  botonPeligro,
  botonPeligroFuerte,
  botonPrimario,
  botonSecundario,
  etiquetaCampo,
  inputClass,
} from "./ui-base";

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
        <p role="status" className={banner(state.status === "success")}>
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
              {submitLabel}
            </>
          )}
        </button>

        {backHref && (
          <Link prefetch={false} href={backHref} className={botonSecundario}>
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
        className={className ?? `${botonSecundario} ${botonChico}`}
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
        <label htmlFor="confirmar-usuario" className={etiquetaCampo}>
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
          className={`${inputClass} max-w-xs focus:border-error-500 focus:ring-error-500/20`}
        />
      </div>
      <button
        type="submit"
        disabled={pending || !coincide}
        className={botonPeligroFuerte}
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
