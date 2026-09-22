/**
 * COLLAGE DE FOTOS — DOS FOTOS QUE SON UNA SOLA PIEZA
 * ===================================================
 * Cesar, sobre el bloque «La empresa» de `/nosotros`: «dejemos solo una imagen,
 * o si dejarás las dos que sean tipo collage, no que queden de diferente tamaño
 * y separadas con un espacio, se ve extraño».
 *
 * Antes eran dos recuadros sueltos, escalonados, de distinto alto y con aire
 * entre ellos: se leían como dos fotos mal alineadas. Ahora comparten **un solo
 * marco** —el mismo paspartú blanco de las tarjetas del carrusel— y se separan
 * con la misma pestaña de 6 px que hay entre la foto y el borde. No hay hueco
 * suelto: lo que se ve es un objeto con dos ventanas.
 *
 * CÓMO SE PARTE EL MARCO
 * ----------------------
 * El reparto sigue la forma del hueco disponible, no el punto de ruptura por
 * el punto de ruptura:
 *  - Hasta `lg` el marco es ancho y bajo (4:3 y luego 16:10) → las dos fotos
 *    van **lado a lado**, 1,4 : 1. Dos ventanas verticales dentro de una caja
 *    apaisada.
 *  - Desde `lg` el marco es una columna estrecha y alta (se estira al alto del
 *    texto) → van **una sobre otra**, 1,45 : 1. Dos ventanas apaisadas dentro
 *    de una caja vertical.
 * En los dos casos las fotos llenan su celda entera (`object-cover`) y
 * comparten borde: ninguna queda «más pequeña y aparte».
 *
 * MENOS FOTOS DE LAS QUE ESPERA
 * -----------------------------
 * Con una sola foto el marco no se parte: la foto ocupa las dos ventanas y el
 * bloque se ve igual de intencional. Con ninguna, el componente no se pinta y
 * la página decide (en `/nosotros`, un `MarcadorDeMarca`).
 */

import type { ImagenContenido } from "@/lib/content-types";
import { ContentImage } from "@/components/ui/ContentImage";

export function Collage({
  fotos,
  /** Medida del marco. Mismo lenguaje que `proporcion` de `ContentImage`. */
  // Marco alto: con dos columnas dentro, cada ventana queda VERTICAL en todos
  // los anchos (decisión de Cesar, 22-sep-2026). Antes el marco era apaisado y
  // desde `lg` las fotos se apilaban, así que salían horizontales.
  proporcion = "aspect-[4/5] sm:aspect-[9/10] lg:aspect-auto lg:h-full lg:min-h-[30rem]",
  /** Clases de la celda de la rejilla que lo contiene: columnas, orden… */
  className = "",
}: {
  /** Candidatas en orden de importancia. Solo entran las que tengan `src` y `alt`. */
  fotos: readonly (ImagenContenido | null | undefined)[];
  proporcion?: string;
  className?: string;
}) {
  // Sin `alt` una foto no entra al sitio; sin `src` no hay nada que pintar.
  // Se descartan repetidas: la misma foto dos veces en un collage se lee como
  // un error de carga (y rompería la regla de no repetir foto en una página).
  const vistas = new Set<string>();
  const usadas = fotos
    .filter((foto): foto is ImagenContenido => Boolean(foto?.src && foto.alt))
    .filter((foto) => !vistas.has(foto.src) && vistas.add(foto.src))
    .slice(0, 2);

  if (usadas.length === 0) return null;
  const dos = usadas.length === 2;

  return (
    <div
      className={`overflow-hidden rounded-panel bg-blanco p-1.5 shadow-elevada ring-1 ring-separador ${proporcion} ${className}`}
    >
      <div
        className={`grid h-full gap-1.5 ${
          dos ? "grid-cols-[1.25fr_1fr]" : ""
        }`}
      >
        {usadas.map((foto, indice) => (
          <ContentImage
            key={foto.src}
            src={foto.src}
            alt={foto.alt}
            width={foto.width}
            height={foto.height}
            srcMovil={foto.srcMovil}
            sizes={
              !dos
                ? "(min-width: 1024px) 40vw, 100vw"
                : indice === 0
                  ? "(min-width: 1024px) 40vw, 58vw"
                  : "(min-width: 1024px) 40vw, 42vw"
            }
            // `h-full`: la celda de la rejilla ya tiene alto definido (el marco
            // lo tiene por proporción o por estirarse a la fila), así que la
            // foto llena su ventana sin proporción propia. Es lo que mantiene
            // las dos del mismo alto —o del mismo ancho— siempre.
            proporcion="h-full w-full"
            claseContenedor="rounded-chip bg-acero-100"
          />
        ))}
      </div>
    </div>
  );
}
