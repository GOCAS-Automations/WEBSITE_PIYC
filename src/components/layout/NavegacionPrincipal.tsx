"use client";

/**
 * NAVEGACIÓN PRINCIPAL — CÁPSULA FLOTANTE
 * =======================================
 * Sistema v3: el encabezado dejó de ser un rectángulo a todo el ancho pegado
 * al borde. Ahora es una cápsula translúcida centrada, con margen respecto a
 * la ventana y sombra suave, que se compacta levemente al bajar. El contenido
 * pasa por debajo y se ve desenfocado a través del material.
 *
 * La barra de datos que había encima (dirección, teléfono, correo, Instagram)
 * se eliminó: esos datos ya viven en el pie y en `/contacto`.
 *
 * En móvil la cápsula lleva logo + botón de menú, y el menú abre como **hoja**
 * translúcida bajo la cápsula: foco atrapado, Esc, `aria-expanded` y bloqueo
 * del scroll del documento mientras está abierta.
 *
 * El logo llega como `children` desde el Server Component (`Encabezado`), que
 * es quien puede usar `next/image` con los datos del sitio.
 */

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { navegacionPrincipal } from "@/data/navegacion";
import { IconoCerrar, IconoMenu, IconoSobre, IconoUsuario } from "@/components/ui/iconos";

function esActivo(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

/** A partir de cuántos píxeles de scroll la cápsula se compacta. */
const UMBRAL_COMPACTA = 24;

/**
 * El teléfono y el correo llegan por props desde el servidor
 * (`site_settings.contact`): así el panel los edita y la navegación —que es
 * Client Component— no tiene que importar la capa de contenido.
 */
export function NavegacionPrincipal({
  telefono,
  correo,
  children,
}: {
  telefono?: string;
  correo?: string;
  /** El logo, renderizado en el servidor. */
  children: ReactNode;
}) {
  const pathname = usePathname();
  const [abierto, setAbierto] = useState(false);
  const [compacta, setCompacta] = useState(false);
  const botonRef = useRef<HTMLButtonElement>(null);
  const hojaRef = useRef<HTMLDivElement>(null);

  // Compactación al bajar.
  useEffect(() => {
    const alDesplazar = () => setCompacta(window.scrollY > UMBRAL_COMPACTA);
    window.addEventListener("scroll", alDesplazar, { passive: true });
    alDesplazar();
    return () => window.removeEventListener("scroll", alDesplazar);
  }, []);

  // (La hoja se cierra en el `onClick` de cada enlace; no hace falta un efecto
  // sobre `pathname`, que además dispararía un render en cascada.)

  // Esc, foco atrapado, bloqueo de scroll y cierre al pasar a escritorio.
  useEffect(() => {
    if (!abierto) return;

    const hoja = hojaRef.current;
    const enfocables = () =>
      Array.from(
        hoja?.querySelectorAll<HTMLElement>('a[href], button:not([disabled])') ?? [],
      ).filter((elemento) => elemento.offsetParent !== null);

    enfocables()[0]?.focus();

    const alTeclear = (evento: KeyboardEvent) => {
      if (evento.key === "Escape") {
        setAbierto(false);
        botonRef.current?.focus();
        return;
      }
      if (evento.key !== "Tab") return;

      // El foco circula entre la hoja y el botón que la abrió.
      const lista = [...enfocables(), botonRef.current].filter(
        (elemento): elemento is HTMLElement => elemento !== null,
      );
      if (lista.length === 0) return;
      const primero = lista[0];
      const ultimo = lista[lista.length - 1];
      const activo = document.activeElement;

      if (evento.shiftKey && activo === primero) {
        evento.preventDefault();
        ultimo.focus();
      } else if (!evento.shiftKey && activo === ultimo) {
        evento.preventDefault();
        primero.focus();
      }
    };

    // Si la ventana pasa a escritorio con el menú abierto, se cierra.
    const escritorio = window.matchMedia("(min-width: 64rem)");
    const alCambiar = (evento: MediaQueryListEvent) => {
      if (evento.matches) setAbierto(false);
    };

    const overflowPrevio = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    document.addEventListener("keydown", alTeclear);
    escritorio.addEventListener("change", alCambiar);
    return () => {
      document.body.style.overflow = overflowPrevio;
      document.removeEventListener("keydown", alTeclear);
      escritorio.removeEventListener("change", alCambiar);
    };
  }, [abierto]);

  return (
    <header className="pointer-events-none fixed inset-x-0 top-0 z-50">
      {/* Mismos márgenes laterales y mismo ancho máximo que `Contenedor`: la
          cápsula llega justo hasta donde llega el contenido de la página, que
          es lo que pidió Cesar. Antes usaba `max-w-nav` (68.75rem) y se leía
          pequeña al lado de un contenido de 80rem. */}
      <div className="mx-auto flex w-full max-w-sitio flex-col items-stretch px-4 pt-3 sm:px-6 sm:pt-4 lg:px-8">
        {/* Cápsula a todo el ancho del contenedor: logo a la izquierda,
            enlaces centrados en el espacio sobrante y CTA a la derecha. */}
        <div
          data-compacta={compacta ? "si" : "no"}
          className="material pointer-events-auto flex h-16 items-center gap-2 rounded-capsula pl-4 pr-2 shadow-flotante ring-1 ring-separador transition-[height,box-shadow] duration-300 ease-ios data-[compacta=si]:h-14 data-[compacta=si]:shadow-elevada sm:pl-5 sm:pr-2.5 lg:gap-6 lg:pl-7 lg:pr-3"
        >
          <Link
            href="/"
            className="flex shrink-0 items-center transition-transform duration-300 ease-ios"
            aria-label="PIYC — ir al inicio"
          >
            {children}
          </Link>

          {/* `lg:mx-auto` centra el bloque de enlaces en el hueco que dejan el
              logo y el CTA, sin que ninguno de los dos pierda su sitio. */}
          <nav aria-label="Principal" className="hidden lg:block lg:mx-auto">
            <ul className="flex items-center gap-1">
              {navegacionPrincipal.map((enlace) => {
                const activo = esActivo(pathname, enlace.href);
                return (
                  <li key={enlace.href}>
                    <Link
                      href={enlace.href}
                      aria-current={activo ? "page" : undefined}
                      className="pulsable inline-flex h-11 items-center rounded-capsula px-4 text-[15px] font-medium text-acero-600 hover:bg-relleno hover:text-azul-700 aria-[current=page]:bg-relleno-medio aria-[current=page]:text-azul-800"
                    >
                      {enlace.etiqueta}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          {/* Acciones: «Mi cuenta» (portal del equipo) y «Contáctenos» (la
              página de contacto, no WhatsApp: el flotante y los CTA de cada
              franja ya cubren ese canal). Decisión de Cesar, 22-sep-2026. */}
          <div className="ml-auto flex items-center gap-2 lg:ml-0">
            <Link
              href="/mi-cuenta"
              className="pulsable hidden h-10 items-center gap-2 rounded-capsula bg-relleno px-3 text-sm font-semibold text-azul-800 hover:bg-relleno-medio sm:inline-flex sm:px-4"
            >
              <IconoUsuario className="size-4.5" />
              Mi cuenta
            </Link>

            <Link
              href="/contacto"
              className="pulsable inline-flex h-10 items-center gap-2 rounded-capsula bg-verde-500 px-3 text-sm font-semibold text-azul-950 hover:bg-verde-400 sm:px-4"
            >
              <IconoSobre className="size-4.5" />
              <span className="sr-only sm:not-sr-only">Contáctenos</span>
            </Link>

            <button
              ref={botonRef}
              type="button"
              aria-expanded={abierto}
              aria-controls="menu-movil"
              onClick={() => setAbierto((valor) => !valor)}
              className="pulsable inline-flex size-10 items-center justify-center rounded-capsula bg-relleno text-azul-900 hover:bg-relleno-medio lg:hidden"
            >
              <span className="sr-only">{abierto ? "Cerrar menú" : "Abrir menú"}</span>
              {abierto ? <IconoCerrar className="size-5" /> : <IconoMenu className="size-5" />}
            </button>
          </div>
        </div>

        {/* Hoja del menú móvil */}
        {abierto ? (
          <div
            ref={hojaRef}
            id="menu-movil"
            className="material-fuerte pointer-events-auto mt-2 max-h-[calc(100dvh-7rem)] w-full animate-hoja overflow-y-auto rounded-panel p-3 shadow-elevada ring-1 ring-separador lg:hidden"
          >
            <nav aria-label="Principal (móvil)">
              <ul className="space-y-1">
                {navegacionPrincipal.map((enlace) => {
                  const activo = esActivo(pathname, enlace.href);
                  return (
                    <li key={enlace.href}>
                      <Link
                        href={enlace.href}
                        aria-current={activo ? "page" : undefined}
                        onClick={() => setAbierto(false)}
                        className="pulsable flex items-center justify-between rounded-control px-4 py-3.5 text-[17px] font-medium text-azul-950 hover:bg-relleno aria-[current=page]:bg-relleno-medio aria-[current=page]:text-azul-700"
                      >
                        {enlace.etiqueta}
                        {activo ? (
                          <span
                            aria-hidden="true"
                            className="size-2 rounded-capsula bg-verde-500"
                          />
                        ) : null}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </nav>
            {/* En móvil la cápsula solo tiene sitio para «Contáctenos» y el
                menú, así que «Mi cuenta» vive aquí. */}
            <Link
              href="/mi-cuenta"
              onClick={() => setAbierto(false)}
              className="pulsable mt-1 flex items-center gap-2 rounded-control bg-relleno px-4 py-3.5 text-[17px] font-medium text-azul-800 hover:bg-relleno-medio sm:hidden"
            >
              <IconoUsuario className="size-5" />
              Mi cuenta
            </Link>
            {telefono || correo ? (
              <p className="mt-2 rounded-control bg-relleno px-4 py-3 text-[13px] leading-snug text-acero-600">
                {[telefono, correo].filter(Boolean).join(" · ")}
              </p>
            ) : null}
          </div>
        ) : null}
      </div>
    </header>
  );
}
