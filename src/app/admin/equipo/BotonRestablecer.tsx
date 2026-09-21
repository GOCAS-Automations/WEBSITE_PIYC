"use client";

import { useActionState } from "react";
import { idleCredentialState, type CredentialState } from "@/lib/admin-types";
import { IconoCandado } from "@/components/admin/iconos";
import { PanelCredenciales } from "./FormularioCuenta";
import { botonSecundario } from "@/components/admin/ui-base";

/**
 * Restablecer la contraseña de otra persona.
 *
 * Es la acción que más se usa de esta pantalla (alguien olvida su contraseña
 * cada semana), así que está a un clic y con su confirmación: restablecer
 * invalida la anterior, y si la persona estaba a punto de acordarse, se queda
 * sin entrar hasta que le pasen la nueva.
 */
export function BotonRestablecer({
  action,
  id,
  nombre,
}: {
  action: (state: CredentialState, formData: FormData) => Promise<CredentialState>;
  id: string;
  nombre: string;
}) {
  const [state, formAction, pending] = useActionState(action, idleCredentialState);

  return (
    <div>
      {state.credential && (
        <PanelCredenciales
          usuario={state.credential.usuario}
          password={state.credential.password}
          kind={state.credential.kind}
        />
      )}

      <form
        action={formAction}
        onSubmit={(event) => {
          if (
            !window.confirm(
              `Se le va a generar una contraseña nueva a ${nombre}.\n\nLa anterior deja de funcionar en ese mismo momento, así que hay que entregarle la nueva para que pueda entrar.\n\n¿Continuamos?`,
            )
          ) {
            event.preventDefault();
          }
        }}
      >
        <input type="hidden" name="id" value={id} />
        <button
          type="submit"
          disabled={pending}
          className={botonSecundario}
        >
          <IconoCandado className="h-4 w-4" />
          {pending ? "Generando…" : "Restablecer contraseña"}
        </button>
      </form>

      {state.status === "error" && state.message && (
        <p role="alert" className="mt-2 text-sm text-error-500">
          {state.message}
        </p>
      )}
    </div>
  );
}
