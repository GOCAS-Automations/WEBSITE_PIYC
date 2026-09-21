import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { getSessionProfile, type SessionProfile } from "@/lib/supabase/auth";
import { isContentEditorRole, ETIQUETA_ROL } from "@/lib/supabase/roles";
import { signOutAction } from "@/lib/session-actions";
import { FormularioIngreso } from "./FormularioIngreso";
import { FormularioClave } from "./FormularioClave";
import { IrAlPanel } from "./IrAlPanel";
import { cambiarMiPassword } from "./actions";
import {
  IconoCandado,
  IconoFlecha,
  IconoReloj,
  IconoSalir,
} from "@/components/admin/iconos";

export const metadata: Metadata = {
  title: "Mi cuenta",
  description: "Acceso al portal privado del equipo de PIYC.",
  // Regla: el portal y el panel nunca se indexan.
  robots: { index: false, follow: false },
  alternates: { canonical: "/mi-cuenta" },
};

/** Depende de la sesión: nunca se cachea. */
export const dynamic = "force-dynamic";

/** `?portal=1` = «quiero mi portal aunque tenga panel». */
const PARAM_PORTAL = "portal";

export default async function MiCuentaPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const configurado = isSupabaseConfigured();
  const session = configurado ? await getSessionProfile() : null;
  const params = await searchParams;
  const pidePortal = params[PARAM_PORTAL] !== undefined;

  /* --- Cuenta desactivada: sesión válida, pero sin acceso ------------- */
  if (session && !session.profile.active) {
    return <CuentaDesactivada />;
  }

  /* --- Con sesión activa --------------------------------------------- */
  if (session) {
    if (isContentEditorRole(session.profile.role) && !pidePortal) {
      return (
        <IrAlPanel
          nombre={session.profile.fullName || session.profile.identificador}
        />
      );
    }
    return <Portal profile={session.profile} />;
  }

  /* --- Sin sesión: ingreso ------------------------------------------- */
  return <Ingreso configurado={configurado} />;
}

/* ------------------------------------------------------------------ */
/* Pantalla de ingreso                                                 */
/* ------------------------------------------------------------------ */

function Ingreso({ configurado }: { configurado: boolean }) {
  return (
    <main id="contenido" className="fondo-plano min-h-[70vh] px-4 py-12 sm:py-16">
      <div className="mx-auto w-full max-w-md">
        <div className="rounded-fino border border-acero-200 bg-blanco p-6 sm:p-8">
          <div className="flex flex-col items-center text-center">
            {/* `next/image` directo está permitido aquí: el logo es chrome, no
                contenido editable (regla 14). */}
            <Image
              src="/brand/logo-piyc.png"
              alt="PIYC — Programación Industrial y Control S.A.S."
              width={452}
              height={192}
              priority
              className="h-12 w-auto"
            />
            <p className="mt-5 font-titulo text-xs font-semibold uppercase tracking-[0.18em] text-azul-700">
              Portal del equipo
            </p>
            <h1 className="mt-1 font-titulo text-3xl font-semibold uppercase tracking-wide text-azul-950">
              Iniciar sesión
            </h1>
            <p className="mt-2 text-sm leading-relaxed text-acero-600">
              Este acceso es solo para el personal de PIYC. Si eres cliente y
              quieres contactarnos, escríbenos desde{" "}
              <Link href="/contacto" className="font-semibold text-azul-700 underline">
                la página de contacto
              </Link>
              .
            </p>
          </div>

          <div className="mt-7">
            {configurado ? (
              <FormularioIngreso />
            ) : (
              <p className="rounded-fino border border-azul-300 bg-azul-50 px-4 py-3 text-sm leading-relaxed text-azul-900">
                El portal todavía no está conectado a la base de datos. Faltan
                las variables de entorno del servidor; cárgalas y vuelve a
                desplegar (cargarlas no basta: las páginas deciden en el build).
              </p>
            )}
          </div>
        </div>

        <p className="mt-5 text-center text-xs leading-relaxed text-acero-500">
          PROGRAMACIÓN INDUSTRIAL Y CONTROL S.A.S. · NIT 901.161.923 · Cali,
          Valle del Cauca
        </p>
      </div>
    </main>
  );
}

/* ------------------------------------------------------------------ */
/* Cuenta desactivada                                                  */
/* ------------------------------------------------------------------ */

function CuentaDesactivada() {
  return (
    <main id="contenido" className="fondo-plano min-h-[70vh] px-4 py-16">
      <div className="mx-auto w-full max-w-md rounded-fino border border-azul-300 bg-blanco p-6 text-center sm:p-8">
        <h1 className="font-titulo text-2xl font-semibold uppercase tracking-wide text-azul-950">
          Tu cuenta está desactivada
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-acero-700">
          Un administrador retiró el acceso de esta cuenta. Tus datos y tus
          registros se conservan: comunícate con tu coordinador para que la
          reactive.
        </p>
        <form action={signOutAction} className="mt-6">
          <button
            type="submit"
            className="inline-flex items-center gap-2 rounded-fino bg-azul-950 px-5 py-2.5 text-sm font-semibold text-blanco transition-colors hover:bg-azul-900"
          >
            <IconoSalir className="h-4 w-4" />
            Cerrar sesión
          </button>
        </form>
      </div>
    </main>
  );
}

/* ------------------------------------------------------------------ */
/* Portal del empleado                                                 */
/* ------------------------------------------------------------------ */

/**
 * PORTAL — la pantalla de quien no administra el sitio.
 *
 * Hoy tiene la ficha de la persona y el cambio de contraseña. El **registro de
 * jornada** y el **historial** los monta el agente del módulo de jornadas en
 * los dos huecos marcados más abajo; están dibujados como tarjetas «en
 * preparación» para que la pantalla no se sienta rota mientras tanto.
 */
function Portal({ profile }: { profile: SessionProfile }) {
  const tienePanel = isContentEditorRole(profile.role);

  return (
    <main id="contenido" className="fondo-plano min-h-[70vh] px-4 py-10 sm:py-12">
      <div className="mx-auto w-full max-w-3xl space-y-6">
        {/* Cabecera */}
        <header className="rounded-fino border border-acero-200 bg-blanco p-5 sm:p-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="min-w-0">
              <p className="font-titulo text-xs font-semibold uppercase tracking-[0.18em] text-azul-700">
                Portal del equipo · PIYC
              </p>
              <h1 className="mt-1 font-titulo text-3xl font-semibold uppercase tracking-wide text-azul-950">
                {profile.fullName}
              </h1>
              <p className="mt-1.5 text-sm text-acero-600">
                Usuario{" "}
                <span className="font-semibold text-azul-950">
                  {profile.identificador}
                </span>
                {profile.cargo && <> · {profile.cargo}</>}{" "}
                <span className="whitespace-nowrap rounded-fino border border-acero-300 bg-acero-50 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wider text-acero-600">
                  {ETIQUETA_ROL[profile.role]}
                </span>
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {tienePanel && (
                <Link
                  prefetch={false}
                  href="/admin"
                  className="inline-flex items-center gap-2 rounded-fino bg-azul-700 px-4 py-2.5 text-sm font-semibold text-blanco transition-colors hover:bg-azul-800"
                >
                  Ir al panel
                  <IconoFlecha className="h-4 w-4" />
                </Link>
              )}
              <form action={signOutAction}>
                <button
                  type="submit"
                  className="inline-flex items-center gap-1.5 rounded-fino border border-acero-300 bg-blanco px-4 py-2.5 text-sm font-semibold text-acero-700 transition-colors hover:border-azul-700 hover:text-azul-700"
                >
                  <IconoSalir className="h-4 w-4" />
                  Cerrar sesión
                </button>
              </form>
            </div>
          </div>
        </header>

        {/* ============================================================
            PUNTO DE MONTAJE 1 — «Registrar jornada»
            ------------------------------------------------------------
            El agente de jornadas reemplaza esta tarjeta entera por su
            <FormularioJornada action={guardarJornada} … />, un Client
            Component de esta misma carpeta. La acción va en `./actions.ts`
            (ya tiene el hueco documentado al final del archivo).
            ============================================================ */}
        <section className="rounded-fino border border-dashed border-acero-300 bg-blanco p-5 sm:p-6">
          <div className="flex items-start gap-3">
            <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-fino border border-acero-200 bg-acero-50 text-azul-700">
              <IconoReloj className="h-5 w-5" />
            </span>
            <div>
              <h2 className="font-titulo text-xl font-semibold uppercase tracking-wide text-azul-950">
                Registrar jornada
              </h2>
              <p className="mt-1.5 text-sm leading-relaxed text-acero-600">
                El formulario para registrar tus horas está en preparación.
                Mientras tanto, dile a tu coordinador las horas trabajadas como
                lo vienes haciendo.
              </p>
            </div>
          </div>
        </section>

        {/* ============================================================
            PUNTO DE MONTAJE 2 — «Historial de jornadas»
            ------------------------------------------------------------
            Igual que el anterior: se reemplaza por <MisJornadas … />, que
            lista lo propio (la RLS de 0002 ya limita a `employee_id =
            auth.uid()`) y pagina con `Paginacion` de
            `components/admin/ui-base.tsx`, 10 filas por página.
            ============================================================ */}
        <section className="rounded-fino border border-dashed border-acero-300 bg-blanco p-5 sm:p-6">
          <h2 className="font-titulo text-xl font-semibold uppercase tracking-wide text-azul-950">
            Mis jornadas
          </h2>
          <p className="mt-1.5 text-sm leading-relaxed text-acero-600">
            Aquí verás el historial de lo que registres, con el estado de cada
            jornada (pendiente, aprobada o rechazada).
          </p>
        </section>

        {/* Cambio de contraseña */}
        <section className="rounded-fino border border-acero-200 bg-blanco p-5 sm:p-6">
          <div className="mb-5 flex items-start gap-3 border-b border-acero-200 pb-4">
            <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-fino border border-acero-200 bg-acero-50 text-azul-700">
              <IconoCandado className="h-5 w-5" />
            </span>
            <div>
              <h2 className="font-titulo text-xl font-semibold uppercase tracking-wide text-azul-950">
                Cambiar mi contraseña
              </h2>
              <p className="mt-1 text-sm leading-relaxed text-acero-600">
                Cámbiala la primera vez que entres con la que te entregaron, y
                cada vez que sospeches que alguien más la conoce.
              </p>
            </div>
          </div>
          <FormularioClave action={cambiarMiPassword} />
        </section>
      </div>
    </main>
  );
}
