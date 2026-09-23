/**
 * FRANJA DE LOGOS DE CLIENTES
 * ===========================
 * Cierra la portada, justo antes de la franja de cierre. Es la prueba social:
 * marcas conocidas que ya contrataron a PIYC.
 *
 * LO QUE LA DIFERENCIA DE UNA FRANJA DE LOGOS CUALQUIERA
 * ------------------------------------------------------
 * **Cada logo enlaza al caso de éxito de ese cliente** (`/proyectos/{slug}`),
 * así que no es decoración: es la entrada a la mejor página que tiene el sitio
 * para convencer. Si el slug no corresponde a un proyecto publicado, el logo
 * se pinta **sin enlace** en lugar de mandar a un 404.
 *
 * TRATAMIENTO
 * -----------
 * Escala de grises suave sobre blanco, con el color de vuelta al pasar el
 * puntero o al enfocar con el teclado: los logos ajenos no compiten con el
 * azul de PIYC, pero se reconocen. Cada uno vive en un recuadro de la misma
 * proporción con la marca `contain` y centrada, que es la única forma de que
 * un logo apaisado y uno cuadrado se lean del mismo tamaño óptico.
 *
 * Textos, orden y logos se editan en el panel (`home.clientes`).
 */

import Link from "next/link";
import type { FranjaClientes as Franja } from "@/lib/content-types";
import { ContentImage } from "@/components/ui/ContentImage";
import { Contenedor, EntradaSeccion, Rotulo, TituloSeccion } from "@/components/sections/primitivas";

/** Recuadro común: misma proporción para todos, logo `contain` y centrado. */
function Logo({ src, alt, width, height, srcMovil }: {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  srcMovil?: string;
}) {
  return (
    <ContentImage
      src={src}
      alt={alt}
      width={width}
      height={height}
      srcMovil={srcMovil}
      sizes="184px"
      ajuste="contain"
      proporcion="aspect-[5/2]"
      claseContenedor="w-full"
      className="p-1"
    />
  );
}

export function FranjaClientes({
  clientes,
  slugsPublicados,
}: {
  clientes: Franja | null;
  /** Slugs de proyectos publicados: fuera de esta lista, el logo va sin enlace. */
  slugsPublicados: ReadonlySet<string>;
}) {
  if (!clientes || clientes.logos.length === 0) return null;

  return (
    <section aria-labelledby="titulo-clientes" className="bg-blanco">
      <Contenedor className="py-14 lg:py-20">
        <div className="max-w-2xl">
          {clientes.eyebrow ? <Rotulo>{clientes.eyebrow}</Rotulo> : null}
          {clientes.title ? (
            <TituloSeccion id="titulo-clientes" className={clientes.eyebrow ? "mt-5" : ""}>
              {clientes.title}
            </TituloSeccion>
          ) : (
            <h2 id="titulo-clientes" className="sr-only">
              Clientes
            </h2>
          )}
          {clientes.intro ? (
            <EntradaSeccion className="mt-5">{clientes.intro}</EntradaSeccion>
          ) : null}
        </div>

        {/* Fila que se envuelve, no una rejilla de columnas fijas: con tres
            logos una rejilla de cinco dejaba dos huecos y se leía como si
            faltaran clientes. Cada recuadro mide lo mismo, así que el alto
            óptico queda parejo aunque un logo sea cuadrado y otro apaisado. */}
        <ul className="mt-10 flex flex-wrap items-center justify-center gap-x-6 gap-y-6 sm:gap-x-10 lg:mt-12 lg:gap-x-14">
          {clientes.logos.map((cliente) => {
            const slug = cliente.proyectoSlug;
            const conCaso = Boolean(slug && slugsPublicados.has(slug));

            return (
              <li
                key={`${cliente.nombre}-${cliente.logo.src}`}
                className="w-[9.5rem] sm:w-[10.5rem] lg:w-[12rem]"
              >
                {conCaso ? (
                  <Link
                    href={`/proyectos/${slug}`}
                    // El texto accesible manda sobre el `alt` del logo: quien
                    // navega con lector de pantalla oye a dónde lleva el enlace.
                    aria-label={`Ver el caso de PIYC con ${cliente.nombre}`}
                    // Logos siempre a color (PIYC, 23-sep-2026: el gris los
                    // hacía ver apagados). El puntero solo los agranda un poco.
                    className="flex items-center justify-center rounded-tarjeta px-3 py-2 transition-transform duration-300 ease-ios hover:scale-105 focus-visible:scale-105 motion-reduce:transform-none"
                  >
                    <Logo {...cliente.logo} />
                  </Link>
                ) : (
                  // Sin caso publicado: el logo se pinta igual, sin enlace.
                  <div className="flex items-center justify-center px-3 py-2">
                    <Logo {...cliente.logo} />
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      </Contenedor>
    </section>
  );
}
