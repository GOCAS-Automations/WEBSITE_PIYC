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
    <div className="min-h-dvh bg-acero-50">
      {/* Barra superior */}
      <div className="border-b border-acero-200 bg-blanco">
        <div className="mx-auto flex max-w-sitio flex-wrap items-center justify-between gap-3 px-4 py-4 sm:px-6 lg:px-8">
          <div className="min-w-0">
            <p className="font-titulo text-xs font-semibold uppercase tracking-[0.18em] text-azul-700">
              Panel de administración · PIYC
            </p>
            <p className="truncate text-sm text-acero-600">
              Sesión de <span className="font-semibold text-azul-950">{nombre}</span>{" "}
              <span className="text-acero-500">({identificador})</span>{" "}
              <span className="whitespace-nowrap rounded-fino border border-acero-300 bg-acero-50 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wider text-acero-600">
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
              className="inline-flex items-center gap-1.5 rounded-fino border border-acero-300 bg-blanco px-3.5 py-2 text-sm font-semibold text-acero-700 transition-colors hover:border-azul-700 hover:text-azul-700"
            >
              <IconoUsuario className="h-4 w-4" />
              Mi cuenta
              <PuntoDeCarga className="ml-0.5" />
            </Link>
            <a
              href="/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-fino border border-acero-300 bg-blanco px-3.5 py-2 text-sm font-semibold text-acero-700 transition-colors hover:border-azul-700 hover:text-azul-700"
            >
              Ver sitio
              <IconoFlecha className="h-4 w-4" />
            </a>
            <form action={signOut}>
              <button
                type="submit"
                className="inline-flex items-center gap-1.5 rounded-fino bg-azul-950 px-3.5 py-2 text-sm font-semibold text-blanco transition-colors hover:bg-azul-900"
              >
                <IconoSalir className="h-4 w-4" />
                Cerrar sesión
              </button>
            </form>
          </div>
        </div>

        {/* Pestañas móviles */}
        <nav
          aria-label="Secciones del panel (móvil)"
          className="border-t border-acero-200 lg:hidden"
        >
          <ul className="flex gap-1 overflow-x-auto px-4 py-2">
            {secciones.map((seccion) => {
              const activa = estaActiva(seccion);
              const Icono = seccion.icon;
              return (
                <li key={seccion.href} className="shrink-0">
                  <Link
                    href={seccion.href}
                    prefetch={false}
                    aria-current={activa ? "page" : undefined}
                    className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-fino px-3 py-2 text-sm font-semibold transition-colors ${
                      activa
                        ? "bg-azul-700 text-blanco"
                        : "text-acero-700 hover:bg-acero-100"
                    }`}
                  >
                    <Icono className="h-4 w-4" />
                    {seccion.label}
                    <PuntoDeCarga className="ml-0.5" />
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      </div>

      <div className="mx-auto flex max-w-sitio gap-8 px-4 py-8 sm:px-6 lg:px-8">
        {/* Menú lateral en escritorio */}
        <aside className="hidden w-60 shrink-0 lg:block">
          <nav aria-label="Secciones del panel" className="sticky top-8">
            <ul className="space-y-1 border-l border-acero-200">
              {secciones.map((seccion) => {
                const activa = estaActiva(seccion);
                const Icono = seccion.icon;
                return (
                  <li key={seccion.href}>
                    <Link
                      href={seccion.href}
                      prefetch={false}
                      aria-current={activa ? "page" : undefined}
                      className={`-ml-px flex items-center gap-2.5 border-l-2 px-3.5 py-2.5 text-sm font-semibold transition-colors ${
                        activa
                          ? "border-azul-700 bg-blanco text-azul-700"
                          : "border-transparent text-acero-600 hover:border-acero-300 hover:text-azul-950"
                      }`}
                    >
                      <Icono
                        className={`h-4 w-4 ${activa ? "text-azul-700" : "text-acero-500"}`}
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

        <main className="min-w-0 flex-1 pb-12">{children}</main>
      </div>
    </div>
  );
}
