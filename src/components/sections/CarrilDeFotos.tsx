"use client";

/**
 * CARRIL DE FOTOS CON SCROLL-SNAP
 * ===============================
 * Sin librería: el desplazamiento lo hace el navegador (`overflow-x-auto` +
 * `scroll-snap`), así que el gesto táctil, el trackpad y la rueda funcionan
 * nativos, con su inercia y su elasticidad. El JavaScript solo añade tres
 * cosas que el navegador no da:
 *
 *  1. **Flechas** anterior/siguiente en cápsula, que desplazan de una foto en
 *     una foto midiendo la posición real del elemento (no un ancho fijo: las
 *     diapositivas cambian de ancho entre puntos de ruptura).
 *  2. **Contador** «3 / 12» en vivo, calculado desde el `scroll` con
 *     `requestAnimationFrame` para no recalcular en cada píxel.
 *  3. **Flechas del teclado** cuando el foco está dentro del carril. El evento
 *     sube desde el botón de cada foto, así que no hace falta un `tabindex`
 *     extra ni un punto de tabulación adicional.
 *
 * El carril tiene **altura fija** y las fotos van con `object-cover`: la
 * galería mezcla apaisadas y verticales, y con alturas variables el carril
 * daría saltos al desplazarse. Las medidas viajan en el `<img>`
 * (`ContentImage`), así que no hay reflujo al cargar ninguna.
 *
 * Los botones no se deshabilitan con `disabled` sino con `aria-disabled`: un
 * botón que pierde el foco al llegar al extremo deja al teclado en la nada.
 *
 * `prefers-reduced-motion` se respeta consultando la media query antes de cada
 * `scrollTo`, porque `scroll-behavior: smooth` no se puede cancelar por
 * elemento desde el bloque global de `globals.css`.
 */

import { useCallback, useEffect, useRef, useState, type KeyboardEvent } from "react";
import type { ImagenContenido } from "@/lib/content-types";
import { ContentImage } from "@/components/ui/ContentImage";
import { IconoFlecha } from "@/components/ui/iconos";

export function CarrilDeFotos({
  imagenes,
  titulo,
  alAbrir,
  anticipadas = 0,
}: {
  imagenes: readonly ImagenContenido[];
  titulo: string;
  /** Abre el visor ampliado que vive en `Galeria`. */
  alAbrir: (indice: number, boton: HTMLButtonElement) => void;
  /**
   * Cuántas diapositivas cargar de entrada (sin prioridad de red). **0 por
   * defecto**: un carrusel que está bajo el pliegue no tiene por qué competir
   * con el LCP de la página — en `/nosotros` adelantar dos fotos costaba casi
   * 200 KB y medio segundo de LCP en Lighthouse móvil. Se sube a 1 o 2 solo
   * cuando el carrusel se ve al abrir la página.
   */
  anticipadas?: number;
}) {
  const carrilRef = useRef<HTMLUListElement>(null);
  const [indice, setIndice] = useState(0);
  const total = imagenes.length;

  // Índice visible: la diapositiva cuyo borde izquierdo está más cerca del
  // borde izquierdo del carril.
  useEffect(() => {
    const carril = carrilRef.current;
    if (!carril) return;

    let pendiente = 0;
    const recalcular = () => {
      pendiente = 0;
      const hijos = Array.from(carril.children) as HTMLElement[];
      if (hijos.length === 0) return;
      const izquierda = carril.scrollLeft;
      let mejor = 0;
      let distanciaMejor = Number.POSITIVE_INFINITY;
      hijos.forEach((hijo, posicion) => {
        const distancia = Math.abs(hijo.offsetLeft - carril.offsetLeft - izquierda);
        if (distancia < distanciaMejor) {
          distanciaMejor = distancia;
          mejor = posicion;
        }
      });
      setIndice(mejor);
    };

    const alDesplazar = () => {
      if (pendiente) return;
      pendiente = window.requestAnimationFrame(recalcular);
    };

    carril.addEventListener("scroll", alDesplazar, { passive: true });
    window.addEventListener("resize", alDesplazar, { passive: true });
    recalcular();

    return () => {
      if (pendiente) window.cancelAnimationFrame(pendiente);
      carril.removeEventListener("scroll", alDesplazar);
      window.removeEventListener("resize", alDesplazar);
    };
  }, [total]);

  const irA = useCallback((destino: number) => {
    const carril = carrilRef.current;
    if (!carril) return;
    const hijos = Array.from(carril.children) as HTMLElement[];
    const acotado = Math.max(0, Math.min(destino, hijos.length - 1));
    const hijo = hijos[acotado];
    if (!hijo) return;

    const sinMovimiento =
      typeof window.matchMedia === "function" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    carril.scrollTo({
      left: hijo.offsetLeft - carril.offsetLeft,
      behavior: sinMovimiento ? "auto" : "smooth",
    });
  }, []);

  const alTeclear = (evento: KeyboardEvent<HTMLUListElement>) => {
    if (evento.key === "ArrowRight") {
      evento.preventDefault();
      irA(indice + 1);
    } else if (evento.key === "ArrowLeft") {
      evento.preventDefault();
      irA(indice - 1);
    } else if (evento.key === "Home") {
      evento.preventDefault();
      irA(0);
    } else if (evento.key === "End") {
      evento.preventDefault();
      irA(total - 1);
    }
  };

  if (total === 0) return null;

  const enElInicio = indice <= 0;
  const enElFinal = indice >= total - 1;
  const clasesControl =
    "pulsable inline-flex size-11 items-center justify-center rounded-capsula text-azul-700 hover:bg-relleno-medio aria-disabled:text-acero-400 aria-disabled:hover:bg-transparent";

  return (
    <section
      // `aria-roledescription` se lee literal, así que va en el idioma de la
      // página (`lang="es-CO"`) y no en inglés.
      aria-roledescription="carrusel"
      aria-label={`${titulo}: ${total} ${total === 1 ? "foto" : "fotos"}`}
      // Red de seguridad: el carril ya recorta por su cuenta (`overflow-x-auto`
      // en el `ul`), pero si algún día pierde esa utilidad, esto evita que las
      // fotos se derramen a lo ancho de la página. Es `clip` y no `hidden` para
      // que las sombras sigan saliendo por arriba y por abajo.
      // (Nota: Chromium sigue reportando el contenido del carril en
      // `documentElement.scrollWidth`; es solo la medida — `window.scrollX` no
      // se mueve y `body.scrollWidth` es igual al ancho de la ventana.)
      className="overflow-x-clip"
    >
      <ul
        ref={carrilRef}
        onKeyDown={alTeclear}
        // Los márgenes negativos dejan respirar la sombra de la primera y la
        // última tarjeta sin que el carril se salga del contenedor.
        className="-mx-1 flex snap-x snap-mandatory gap-3 overflow-x-auto px-1 py-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {imagenes.map((imagen, posicion) => (
          <li
            key={`${imagen.src}-${posicion}`}
            aria-roledescription="diapositiva"
            aria-label={`${posicion + 1} de ${total}`}
            className="w-[min(78vw,20rem)] shrink-0 snap-start sm:w-[21rem] lg:w-[23rem]"
          >
            <button
              type="button"
              onClick={(evento) => alAbrir(posicion, evento.currentTarget)}
              className="pulsable block h-full w-full cursor-zoom-in rounded-tarjeta bg-blanco p-1.5 shadow-tarjeta hover:shadow-elevada"
            >
              {/* `proporcion` no tiene por qué ser una razón de aspecto: aquí
                  es una **altura fija**, que es lo que mantiene el carril
                  parejo con fotos apaisadas y verticales mezcladas. El recuadro
                  queda `relative` y la foto, absoluta y con `object-cover`. */}
              <ContentImage
                src={imagen.src}
                alt={imagen.alt}
                width={imagen.width}
                height={imagen.height}
                srcMovil={imagen.srcMovil}
                sizes="(min-width: 1024px) 23rem, 80vw"
                anticipada={posicion < anticipadas}
                proporcion="h-[13.5rem] sm:h-[14.5rem] lg:h-[16rem]"
                claseContenedor="rounded-chip bg-acero-100"
              />
              <span className="sr-only">Ampliar: {imagen.alt || `foto ${posicion + 1}`}</span>
            </button>
          </li>
        ))}
      </ul>

      {total > 1 ? (
        <div className="mt-4 flex items-center justify-between gap-4">
          <p aria-live="polite" className="text-[13px] font-medium text-acero-600">
            <span aria-hidden="true" className="tabular-nums">
              {indice + 1} / {total}
            </span>
            <span className="sr-only">
              Foto {indice + 1} de {total}
            </span>
          </p>

          <div className="inline-flex items-center gap-1 rounded-capsula bg-blanco p-1 shadow-tarjeta">
            <button
              type="button"
              aria-disabled={enElInicio}
              onClick={() => {
                if (!enElInicio) irA(indice - 1);
              }}
              className={clasesControl}
            >
              <IconoFlecha className="size-5 rotate-180" />
              <span className="sr-only">Foto anterior</span>
            </button>
            <button
              type="button"
              aria-disabled={enElFinal}
              onClick={() => {
                if (!enElFinal) irA(indice + 1);
              }}
              className={clasesControl}
            >
              <IconoFlecha className="size-5" />
              <span className="sr-only">Foto siguiente</span>
            </button>
          </div>
        </div>
      ) : null}
    </section>
  );
}
