"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { navegacionPrincipal } from "@/data/navegacion";
import { IconoCerrar, IconoMenu, IconoWhatsApp } from "@/components/ui/iconos";

function esActivo(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

/**
 * El teléfono y el correo llegan por props desde el servidor
 * (`site_settings.contact`): así el panel los edita y la navegación —que es
 * Client Component— no tiene que importar la capa de contenido.
 */
export function NavegacionPrincipal({
  hrefWhatsApp,
  telefono,
  correo,
}: {
  hrefWhatsApp: string;
  telefono?: string;
  correo?: string;
}) {
  const pathname = usePathname();
  const [abierto, setAbierto] = useState(false);
  const botonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!abierto) return;

    const alTeclear = (evento: KeyboardEvent) => {
      if (evento.key === "Escape") {
        setAbierto(false);
        botonRef.current?.focus();
      }
    };
    // Si la ventana pasa a escritorio con el menú abierto, se cierra.
    const escritorio = window.matchMedia("(min-width: 64rem)");
    const alCambiar = (evento: MediaQueryListEvent) => {
      if (evento.matches) setAbierto(false);
    };

    document.addEventListener("keydown", alTeclear);
    escritorio.addEventListener("change", alCambiar);
    return () => {
      document.removeEventListener("keydown", alTeclear);
      escritorio.removeEventListener("change", alCambiar);
    };
  }, [abierto]);

  return (
    <>
      <nav aria-label="Principal" className="ml-auto hidden self-stretch lg:block">
        <ul className="flex h-full items-stretch">
          {navegacionPrincipal.map((enlace) => {
            const activo = esActivo(pathname, enlace.href);
            return (
              <li key={enlace.href} className="flex">
                <Link
                  href={enlace.href}
                  aria-current={activo ? "page" : undefined}
                  className="relative flex items-center px-4 text-[15px] font-medium text-acero-700 transition-colors after:absolute after:inset-x-4 after:bottom-[-1px] after:h-[3px] after:scale-x-0 after:bg-azul-700 after:transition-transform hover:text-azul-700 aria-[current=page]:text-azul-950 aria-[current=page]:after:scale-x-100"
                >
                  {enlace.etiqueta}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="flex items-center gap-2 lg:ml-2">
        <a
          href={hrefWhatsApp}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex h-11 items-center gap-2 rounded-fino border border-verde-600 px-3 text-sm font-semibold text-verde-700 transition-colors hover:bg-verde-100 sm:px-4"
        >
          <IconoWhatsApp className="size-5" />
          <span className="sr-only sm:not-sr-only">WhatsApp</span>
        </a>

        <button
          ref={botonRef}
          type="button"
          aria-expanded={abierto}
          aria-controls="menu-movil"
          onClick={() => setAbierto((valor) => !valor)}
          className="inline-flex size-11 items-center justify-center rounded-fino border border-acero-200 text-azul-950 transition-colors hover:border-azul-950 lg:hidden"
        >
          <span className="sr-only">{abierto ? "Cerrar menú" : "Abrir menú"}</span>
          {abierto ? <IconoCerrar className="size-5" /> : <IconoMenu className="size-5" />}
        </button>
      </div>

      <div
        id="menu-movil"
        hidden={!abierto}
        className="absolute inset-x-0 top-full max-h-[calc(100dvh-4rem)] overflow-y-auto border-b border-acero-200 bg-blanco lg:hidden"
      >
        <nav aria-label="Principal (móvil)" className="px-4 pb-6 pt-2">
          <ul>
            {navegacionPrincipal.map((enlace, indice) => {
              const activo = esActivo(pathname, enlace.href);
              return (
                <li key={enlace.href} className="border-b border-acero-100">
                  <Link
                    href={enlace.href}
                    aria-current={activo ? "page" : undefined}
                    onClick={() => setAbierto(false)}
                    className="flex items-baseline gap-4 py-3.5 font-titulo text-2xl font-semibold text-azul-950 aria-[current=page]:text-azul-700"
                  >
                    <span aria-hidden="true" className="w-7 font-sans text-xs font-semibold tabular-nums text-azul-600">
                      {String(indice + 1).padStart(2, "0")}
                    </span>
                    {enlace.etiqueta}
                  </Link>
                </li>
              );
            })}
          </ul>
          {telefono || correo ? (
            <p className="mt-5 text-sm text-acero-600">
              {[telefono, correo].filter(Boolean).join(" · ")}
            </p>
          ) : null}
        </nav>
      </div>
    </>
  );
}
