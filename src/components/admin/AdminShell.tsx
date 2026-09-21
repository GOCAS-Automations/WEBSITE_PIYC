"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { PuntoDeCarga } from "./PuntoDeCarga";
import {
  IconoCapas,
  IconoEquipo,
  IconoFlecha,
  IconoReloj,
  IconoSalir,
  IconoTablero,
  IconoUsuario,
} from "./iconos";
import { ETIQUETA_ROL, isManagerRole, type UserRole } from "@/lib/supabase/roles";
import { RUTAS_CONTENIDO } from "@/lib/admin-types";

interface SeccionPanel {
  href: string;
  label: string;
  icon: (props: { className?: string }) => ReactNode;
  /** true = solo activo con coincidencia exacta de ruta. */
  exact?: boolean;
  /** true = solo para managers (admin | coordinador). */
  soloManager?: boolean;
  /** Rutas adicionales que dejan esta entrada marcada como activa. */
  matches?: readonly string[];
}

/**
 * MENÚ DEL PANEL — CUATRO ENTRADAS, NO MÁS
 * ========================================
 * Es una decisión del plan (§5.2), no una casualidad: el panel de GPI llegó a
 * doce entradas y se leía como un inventario. Todo lo que edita el contenido
 * del sitio cuelga de «Contenido del sitio»; todo lo que toca a las personas,
 * de «Equipo»; el registro de horas, de «Jornadas».
 *
 * **Antes de añadir una quinta entrada, busca bajo cuál de las cuatro va.**
 */
export const seccionesPanel: SeccionPanel[] = [
  { href: "/admin", label: "Dashboard", icon: IconoTablero, exact: true },
  {
    href: "/admin/contenido",
    label: "Contenido del sitio",
    icon: IconoCapas,
    matches: RUTAS_CONTENIDO,
  },
  { href: "/admin/equipo", label: "Equipo", icon: IconoEquipo, soloManager: true },
  { href: "/admin/jornadas", label: "Jornadas", icon: IconoReloj, soloManager: true },
];

/** Secciones visibles para un rol concreto. */
export function seccionesDelRol(role: UserRole): SeccionPanel[] {
  const manager = isManagerRole(role);
  return seccionesPanel.filter((s) => !s.soloManager || manager);
}

function useEstaActiva() {
  const pathname = usePathname();
  const dentroDe = (href: string) =>
    pathname === href || pathname.startsWith(`${href}/`);

  return (seccion: SeccionPanel) => {
    if (seccion.exact) return pathname === seccion.href;
    if (dentroDe(seccion.href)) return true;
    return (seccion.matches ?? []).some(dentroDe);
  };
}

/**
 * ESTRUCTURA DEL PANEL
 * ====================
 * Barra superior con la sesión y las acciones, menú lateral en escritorio y
 * pestañas desplazables en móvil (el panel tiene que poder usarse desde un
 * teléfono: Jorge y su equipo están en obra, no en un escritorio).
 *
 * `prefetch={false}` EN TODA LA NAVEGACIÓN (regla 2 de `AGENTS.md`)
 * ----------------------------------------------------------------
 * Todas las rutas de `/admin` son `force-dynamic` y pasan por `src/proxy.ts`,
 * que refresca la sesión de Supabase. Con el prefetch por defecto, tener el
 * menú en pantalla dispara media docena de peticiones simultáneas, cada una con
 * su llamada a Supabase y todas compitiendo por canjear el mismo refresh token.
 * Además es la pata que hace falta para que `PuntoDeCarga` funcione:
 * `useLinkStatus` no tiene estado pendiente que mostrar si la ruta ya venía
 * precargada. Las tres piezas van juntas: esta, `PuntoDeCarga` y
 * `src/app/admin/loading.tsx`.
 */
export function AdminShell({
  identificador,
  nombre,
  role,
  signOut,
  children,
}: {
  /** Usuario del portal con el que se ingresó. */
  identificador: string;
  nombre: string;
  role: UserRole;
  signOut: () => Promise<void>;
  children: ReactNode;
}) {
  const estaActiva = useEstaActiva();
  const secciones = seccionesDelRol(role);

  return (
    <div className="fondo-plano min-h-dvh">
      {/* ---------------- Barra superior translúcida ---------------- */}
      <header className="material-fuerte sticky top-0 z-30 border-b border-separador">
        <div className="mx-auto flex max-w-sitio flex-wrap items-center justify-between gap-3 px-4 py-3.5 sm:px-6 lg:px-8">
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-ancho text-azul-700">
              Panel de administración · PIYC
            </p>
            {/* Envuelve en vez de truncar: a 390 px el `truncate` se comía la
                etiqueta del rol, que es justo el dato que hay que ver. */}
            <p className="flex flex-wrap items-center gap-x-1.5 gap-y-1 text-sm text-acero-600">
              <span className="min-w-0 break-words">
                Sesión de <span className="font-semibold text-azul-950">{nombre}</span>{" "}
                <span className="text-acero-600">({identificador})</span>
              </span>
              <span className="whitespace-nowrap rounded-capsula bg-relleno px-2.5 py-1 text-[11px] font-semibold leading-none text-acero-600">
                {ETIQUETA_ROL[role]}
              </span>
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Quien administra también tiene su portal: este es el camino de
                vuelta (cambiar su contraseña, registrar sus horas). */}
            <Link
              href="/mi-cuenta?portal=1"
              prefetch={false}
              className={ACCION_BARRA}
            >
              <IconoUsuario className="h-4 w-4" />
              Mi cuenta
              <PuntoDeCarga className="ml-0.5" />
            </Link>
            <a href="/" target="_blank" rel="noopener noreferrer" className={ACCION_BARRA}>
              Ver sitio
              <IconoFlecha className="h-4 w-4" />
            </a>
            <form action={signOut}>
              <button
                type="submit"
                className="inline-flex items-center gap-1.5 rounded-capsula bg-azul-950 px-3 py-1.5 text-xs font-semibold text-blanco shadow-sutil transition duration-200 ease-ios hover:bg-azul-900 active:scale-[0.97] sm:px-4 sm:py-2 sm:text-sm"
              >
                <IconoSalir className="h-4 w-4" />
                Cerrar sesión
              </button>
            </form>
          </div>
        </div>
      </header>

      <div className="mx-auto flex max-w-sitio gap-7 px-4 py-7 sm:px-6 lg:px-8">
        {/* ---------------- Panel lateral flotante (escritorio) ---------------- */}
        <aside className="hidden w-60 shrink-0 lg:block">
          <nav
            aria-label="Secciones del panel"
            className="material sticky top-24 rounded-panel p-2 shadow-tarjeta"
          >
            <ul className="space-y-1">
              {secciones.map((seccion) => {
                const activa = estaActiva(seccion);
                const Icono = seccion.icon;
                return (
                  <li key={seccion.href}>
                    <Link
                      href={seccion.href}
                      prefetch={false}
                      aria-current={activa ? "page" : undefined}
                      className={`flex items-center gap-2.5 rounded-control px-3.5 py-2.5 text-sm font-semibold transition duration-200 ease-ios ${
                        activa
                          ? "bg-azul-700 text-blanco shadow-sutil"
                          : "text-acero-600 hover:bg-relleno hover:text-azul-950"
                      }`}
                    >
                      <Icono
                        className={`h-[18px] w-[18px] ${activa ? "text-blanco" : "text-acero-500"}`}
                      />
                      {seccion.label}
                      <PuntoDeCarga className="ml-auto" />
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>
        </aside>

        {/* El relleno inferior deja sitio a la barra de pestañas del móvil. */}
        <main className="min-w-0 flex-1 pb-[calc(6.5rem+env(safe-area-inset-bottom))] lg:pb-12">
          {children}
        </main>
      </div>

      {/* ---------------- Barra de pestañas inferior (móvil) ----------------
          Las CUATRO entradas del panel, siempre visibles, al alcance del
          pulgar. Respeta el área segura del iPhone. */}
      <nav
        aria-label="Secciones del panel"
        className="material-fuerte fixed inset-x-0 bottom-0 z-40 border-t border-separador pb-[env(safe-area-inset-bottom)] lg:hidden"
      >
        <ul className="mx-auto flex max-w-md items-stretch">
          {secciones.map((seccion) => {
            const activa = estaActiva(seccion);
            const Icono = seccion.icon;
            return (
              <li key={seccion.href} className="min-w-0 flex-1">
                <Link
                  href={seccion.href}
                  prefetch={false}
                  aria-current={activa ? "page" : undefined}
                  className={`flex flex-col items-center gap-1 px-1 pb-2 pt-2.5 text-[10px] font-semibold leading-tight transition-colors duration-200 ease-ios ${
                    activa ? "text-azul-700" : "text-acero-500"
                  }`}
                >
                  <span
                    className={`relative inline-flex h-8 w-14 items-center justify-center rounded-capsula transition duration-200 ease-ios ${
                      activa ? "bg-azul-100" : ""
                    }`}
                  >
                    <Icono className="h-[22px] w-[22px]" />
                    {/* El punto de carga vive aquí para no ensanchar la
                        pestaña cuando aparece (regla 2). */}
                    <PuntoDeCarga className="absolute -right-0.5 top-0" />
                  </span>
                  <span className="w-full truncate text-center">
                    {ETIQUETA_CORTA[seccion.href] ?? seccion.label}
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </div>
  );
}

/**
 * Cápsula blanca de las acciones de la barra superior. Más pequeña en el
 * teléfono: a 390 px las tres acciones se apilaban en tres renglones y la barra
 * se comía un tercio de la pantalla.
 */
const ACCION_BARRA =
  "inline-flex items-center gap-1.5 rounded-capsula bg-blanco px-3 py-1.5 text-xs font-semibold text-azul-800 shadow-sutil transition duration-200 ease-ios hover:bg-azul-50 active:scale-[0.97] sm:px-3.5 sm:py-2 sm:text-sm";

/**
 * En una pestaña de 90 px «Contenido del sitio» no cabe. El nombre largo sigue
 * siendo el del menú de escritorio y el de las migas; aquí se acorta al
 * sustantivo, que es lo que se lee de un vistazo.
 */
const ETIQUETA_CORTA: Record<string, string> = {
  "/admin/contenido": "Contenido",
};
