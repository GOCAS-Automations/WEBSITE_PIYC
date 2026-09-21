"use client";

/**
 * FLOTANTE DE WHATSAPP — LA PARTE DE CLIENTE
 * ==========================================
 * El botón fijo tapaba contenido real: a 1440 px se comía el texto de la
 * cuarta columna de la franja de líneas del inicio (y el último párrafo de
 * `/servicios` y `/proyectos`), y en móvil se sentaba encima del pie.
 *
 * En vez de moverlo o encogerlo —que solo desplaza el problema— se le ponen
 * dos condiciones para aparecer:
 *
 *  1. **Que el visitante haya bajado** más de `UMBRAL_SCROLL` píxeles. Arriba
 *     del todo, donde está el hero y su franja, el botón no existe; los CTA de
 *     WhatsApp del propio hero ya cubren esa necesidad.
 *  2. **Que el pie no esté a la vista.** Un `IntersectionObserver` sobre el
 *     `<footer>` lo retira antes de que pueda taparlo, en móvil y escritorio.
 *
 * Sale y entra con una transición de opacidad y desplazamiento; el bloque
 * `prefers-reduced-motion` de `globals.css` la anula sin tocar nada aquí.
 *
 * Mientras está oculto lleva `inert` (atributo nativo, soportado como prop en
 * React 19): no queda un objetivo de toque invisible ni un enlace fantasma en
 * el orden de tabulación o en el lector de pantalla. No se usa el atributo
 * `hidden` porque la utilidad `inline-flex` de Tailwind le gana en
 * especificidad al `display:none` del navegador y no ocultaría nada.
 *
 * En `/contacto` no se pinta: ahí tapaba el botón de enviar del formulario en
 * móvil y el visitante ya tiene los números a la vista. Antes se intentaba con
 * `:has()` en `globals.css`, pero esa regla **nunca hizo efecto**: en Tailwind
 * v4 la capa `utilities` va después de `components`, así que `inline-flex` le
 * ganaba al `display:none` pasara lo que pasara. Ahora que el botón ya es
 * Client Component, `usePathname()` lo resuelve sin ambigüedad.
 *
 * Client Component: no importa nada de `components/admin/*` (regla 1 de
 * AGENTS.md). El número sigue resolviéndose en el servidor y llega por prop.
 */

import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { IconoWhatsApp } from "@/components/ui/iconos";

/** Un poco más que el alto del hero en móvil: basta con que se note el scroll. */
const UMBRAL_SCROLL = 360;

/** Rutas donde el flotante estorba más de lo que ayuda. */
const RUTAS_SIN_FLOTANTE = new Set(["/contacto"]);

export function FlotanteWhatsApp({ href }: { href: string }) {
  const ruta = usePathname();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const pie = document.querySelector("footer");
    let pieALaVista = false;

    const actualizar = () => {
      setVisible(window.scrollY > UMBRAL_SCROLL && !pieALaVista);
    };

    // `rootMargin` inferior generoso: el botón se va antes de rozar el pie.
    const observador = pie
      ? new IntersectionObserver(
          ([entrada]) => {
            pieALaVista = entrada.isIntersecting;
            actualizar();
          },
          { rootMargin: "0px 0px 96px 0px" },
        )
      : null;

    if (pie && observador) observador.observe(pie);
    window.addEventListener("scroll", actualizar, { passive: true });
    window.addEventListener("resize", actualizar, { passive: true });
    actualizar();

    return () => {
      observador?.disconnect();
      window.removeEventListener("scroll", actualizar);
      window.removeEventListener("resize", actualizar);
    };
  }, []);

  // Después de los hooks: el orden de los hooks no puede depender de la ruta.
  if (RUTAS_SIN_FLOTANTE.has(ruta)) return null;

  return (
    // El `aside` va aquí y no en el Server Component para que en `/contacto`
    // no quede un landmark vacío colgando de `<body>`.
    <aside aria-label="Escribir a PIYC por WhatsApp">
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        data-whatsapp-flotante=""
        inert={!visible}
        aria-label="Escribirle a PIYC por WhatsApp (se abre en una pestaña nueva)"
        // Solo el ícono, sin etiqueta: el texto «Escríbanos» duplicaba el CTA
        // verde que ya hay en el encabezado y en cada franja de cierre, y en
        // móvil tapaba más contenido del que ayudaba. `size-14` = 56 px, muy
        // por encima del mínimo táctil de 48 px.
        className={`fixed bottom-4 right-4 z-30 inline-flex size-14 items-center justify-center rounded-capsula bg-verde-500 text-azul-950 shadow-flotante transition-[opacity,transform] duration-300 ease-ios hover:bg-verde-400 active:scale-95 sm:bottom-6 sm:right-6 ${
          visible
            ? "translate-y-0 scale-100 opacity-100"
            : "pointer-events-none translate-y-3 scale-95 opacity-0"
        }`}
      >
        <IconoWhatsApp className="size-7 shrink-0" />
      </a>
    </aside>
  );
}
