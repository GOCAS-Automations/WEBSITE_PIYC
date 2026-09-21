"use client";

import Link from "next/link";
import { useActionState, useState, type ReactNode } from "react";
import { idleCredentialState, type CredentialState } from "@/lib/admin-types";
import { textoCredenciales } from "@/lib/usuarios";
import { IconoCheck, IconoCandado, IconoWhatsApp } from "@/components/admin/iconos";
import { botonPrimario } from "@/components/admin/ui-base";
import { banner, botonSecundario, botonWhatsApp } from "@/components/admin/ui-base";

/**
 * FORMULARIO DE UNA CUENTA
 * ========================
 * Igual que `FormularioAdmin`, pero con `CredentialState`: cuando la acción
 * crea una cuenta o restablece una contraseña, devuelve la contraseña generada
 * y esta pantalla la muestra **una sola vez**.
 *
 * POR QUÉ UNA SOLA VEZ
 * --------------------
 * Porque no se guarda en ninguna parte ni se puede volver a consultar: una
 * contraseña recuperable no es una contraseña. Si se pierde, se restablece otra
 * vez, que cuesta dos clics. De ahí que el recuadro sea grande, diga que hay
 * que copiarla ahora y traiga el botón de copiar y el de mandarla por WhatsApp
 * ya escrita.
 */
export function FormularioCuenta({
  action,
  children,
  submitLabel = "Guardar",
  backHref,
  backLabel = "Cancelar",
}: {
  action: (state: CredentialState, formData: FormData) => Promise<CredentialState>;
  children: ReactNode;
  submitLabel?: string;
  backHref?: string;
  backLabel?: string;
}) {
  const [state, formAction, pending] = useActionState(action, idleCredentialState);

  return (
    <>
      {state.credential && (
        <PanelCredenciales
          usuario={state.credential.usuario}
          password={state.credential.password}
          kind={state.credential.kind}
        />
      )}

      <form action={formAction} className="space-y-5">
        {children}

        {state.status !== "idle" && state.message && !state.credential && (
          <p
            role="status"
            className={banner(state.status === "success")}
          >
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
            <Link
              prefetch={false}
              href={backHref}
              className={botonSecundario}
            >
              <span aria-hidden="true">←</span>
              {backLabel}
            </Link>
          )}
        </div>
      </form>
    </>
  );
}

/* ------------------------------------------------------------------ */
/* Recuadro de credenciales                                            */
/* ------------------------------------------------------------------ */

export function PanelCredenciales({
  usuario,
  password,
  kind,
}: {
  usuario: string;
  password: string;
  kind: "created" | "reset";
}) {
  const [copiado, setCopiado] = useState(false);
  const texto = textoCredenciales(usuario, password);

  async function copiar() {
    try {
      await navigator.clipboard.writeText(texto);
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2500);
    } catch {
      // Sin permiso de portapapeles (o sin HTTPS): el texto está a la vista y
      // se puede seleccionar a mano. No hace falta avisar de nada.
    }
  }

  return (
    <div
      role="status"
      className="mb-6 rounded-tarjeta bg-azul-50 p-5 ring-1 ring-azul-300"
    >
      <div className="flex items-start gap-3">
        <IconoCandado className="mt-0.5 h-5 w-5 shrink-0 text-azul-700" />
        <div className="min-w-0 flex-1">
          <p className="text-lg font-semibold tracking-titulo text-azul-950">
            {kind === "created" ? "Cuenta creada" : "Contraseña restablecida"}
          </p>
          <p className="mt-1 text-sm leading-relaxed text-azul-900">
            <strong>Copia estos datos ahora.</strong> La contraseña no se guarda
            en ninguna parte y no se puede volver a consultar: si la pierdes,
            habrá que restablecerla otra vez. Entrégasela a la persona y dile que
            la cambie al entrar, desde «Mi cuenta».
          </p>

          <dl className="mt-4 grid gap-2 rounded-control bg-blanco p-3 sm:grid-cols-2">
            <div>
              <dt className="text-xs font-semibold uppercase tracking-ancho text-acero-500">
                Usuario
              </dt>
              <dd className="font-mono text-base text-azul-950">{usuario}</dd>
            </div>
            <div>
              <dt className="text-xs font-semibold uppercase tracking-ancho text-acero-500">
                Contraseña
              </dt>
              <dd className="font-mono text-base text-azul-950">{password}</dd>
            </div>
          </dl>

          <div className="mt-4 flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={copiar}
              className={botonPrimario}
            >
              {copiado ? "¡Copiado!" : "Copiar usuario y contraseña"}
            </button>
            <a
              href={`https://wa.me/?text=${encodeURIComponent(
                `Estas son tus credenciales del portal de PIYC.\n\n${texto}\n\nEntra en piycsas.com/mi-cuenta y cambia la contraseña la primera vez.`,
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className={botonWhatsApp}
            >
              <IconoWhatsApp className="h-4 w-4" />
              Enviar por WhatsApp
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
