"use client";

import { useActionState } from "react";
import { idleState, PASSWORD_MINIMO, type ActionState } from "@/lib/admin-types";
import {
  ayudaCampo,
  banner,
  botonPrimario,
  etiquetaCampo,
  inputClass,
} from "@/components/admin/ui-base";
import { IconoCandado } from "@/components/admin/iconos";

/**
 * Cambio de la propia contraseña.
 *
 * Client Component: importa `inputClass` de `ui-base` y los iconos de su propio
 * módulo, **nunca de `components/admin/ui.tsx`** (regla 1 de `AGENTS.md`).
 */
export function FormularioClave({
  action,
}: {
  action: (state: ActionState, formData: FormData) => Promise<ActionState>;
}) {
  const [state, formAction, pending] = useActionState(action, idleState);

  return (
    <form action={formAction} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label
            htmlFor="password"
            className={etiquetaCampo}
          >
            Nueva contraseña <span className="text-azul-700">*</span>
          </label>
          <input
            id="password"
            name="password"
            type="password"
            required
            minLength={PASSWORD_MINIMO}
            autoComplete="new-password"
            className={inputClass}
          />
          <p className={ayudaCampo}>
            Mínimo {PASSWORD_MINIMO} caracteres. Una frase corta que recuerdes
            fácil sirve mejor que algo raro que tengas que anotar.
          </p>
        </div>
        <div>
          <label
            htmlFor="password_confirm"
            className={etiquetaCampo}
          >
            Repite la contraseña <span className="text-azul-700">*</span>
          </label>
          <input
            id="password_confirm"
            name="password_confirm"
            type="password"
            required
            minLength={PASSWORD_MINIMO}
            autoComplete="new-password"
            className={inputClass}
          />
        </div>
      </div>

      {state.status !== "idle" && state.message && (
        <p role="status" className={banner(state.status === "success")}>
          {state.message}
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className={botonPrimario}
      >
        <IconoCandado className="h-4 w-4" />
        {pending ? "Guardando…" : "Cambiar contraseña"}
      </button>
    </form>
  );
}
