"use client";

import { useActionState } from "react";
import { idleState, PASSWORD_MINIMO, type ActionState } from "@/lib/admin-types";
import { inputClass } from "@/components/admin/ui-base";
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
            className="mb-1.5 block text-sm font-semibold text-azul-950"
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
          <p className="mt-1 text-xs leading-relaxed text-acero-600">
            Mínimo {PASSWORD_MINIMO} caracteres. Una frase corta que recuerdes
            fácil sirve mejor que algo raro que tengas que anotar.
          </p>
        </div>
        <div>
          <label
            htmlFor="password_confirm"
            className="mb-1.5 block text-sm font-semibold text-azul-950"
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

      <button
        type="submit"
        disabled={pending}
        className="inline-flex items-center gap-2 rounded-fino bg-azul-700 px-5 py-2.5 text-sm font-semibold text-blanco transition-colors hover:bg-azul-800 disabled:pointer-events-none disabled:opacity-60"
      >
        <IconoCandado className="h-4 w-4" />
        {pending ? "Guardando…" : "Cambiar contraseña"}
      </button>
    </form>
  );
}
