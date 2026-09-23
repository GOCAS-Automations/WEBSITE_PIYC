/**
 * HERO DE INICIO
 * ==============
 * **Fondo a sangre** —imagen o video— con velo azul noche encima y, sobre él,
 * el `<h1>`, el eslogan, la frase de apoyo y los dos CTA alineados a la
 * izquierda. Debajo, fuera ya del fondo oscuro, la franja de las cuatro líneas
 * de servicio sobre el lienzo.
 *
 * POR QUÉ CAMBIÓ (reunión con PIYC, sep-2026)
 * -------------------------------------------
 * Antes el hero era texto a la izquierda y un widget con el diagrama de
 * escalera (o una foto) a la derecha. A PIYC no le gustaba esa pieza: pidieron
 * «una imagen de fondo, como en las otras páginas del sitio, y que se pueda
 * cambiar por un video desde el panel». El diagrama se eliminó.
 *
 * Es el mismo lenguaje de `CabeceraInterna` —mismo velo, mismo viraje al azul
 * de marca, texto abajo a la izquierda— pero con el peso de una portada: más
 * alto, `h1` más grande y botones. Lo que separa a PIYC de GPI (regla 13) no
 * es ya la ausencia de foto sino el color (azul dominante, verde al 10 %), la
 * retícula (texto a la izquierda, no centrado) y la tipografía.
 *
 * CONTRASTE
 * ---------
 * El velo (`velo-cabecera`) está medido para el peor caso —una foto blanca—:
 * bajo el texto nunca baja de ~75 % de azul noche, lo que da ≥ 7:1 con blanco
 * y ≥ 5:1 con `acero-100`/`acero-200`.
 *
 * LA LCP ES EL PÓSTER, NO EL VIDEO
 * --------------------------------
 * Con imagen, la foto es la LCP: `<img>` real con `fetchpriority="high"`, sin
 * `lazy`, con medidas y `srcset` cuando hay `srcMovil` (`FotoDeFondo`). Con
 * video se pinta **ese mismo `<img>` con el póster** y el `<video>` va encima,
 * con `preload="metadata"`, para que el video no le pelee la red a la LCP.
 * Con `prefers-reduced-motion` el `<video>` se oculta (`motion-reduce:hidden`)
 * y se queda el póster.
 *
 * Todo el texto y el fondo llegan por props desde `site_settings.home`.
 */

import Link from "next/link";
import type { AjustesHome, LineaServicio } from "@/lib/content-types";
import type { FondoDelHero } from "@/lib/content";
import {
  BotonPrimario,
  BotonWhatsApp,
  Contenedor,
  GrupoDeBotones,
  Rotulo,
} from "@/components/sections/primitivas";
import { FotoDeFondo } from "@/components/ui/ContentImage";
import { IconoFlecha } from "@/components/ui/iconos";

export function HeroInicio({
  hero,
  fondo,
  eslogan,
  lineas,
  hrefWhatsApp,
}: {
  hero: AjustesHome["hero"];
  /** Imagen o video de fondo ya resueltos (`fondoDelHero`). `null` = degradado. */
  fondo: FondoDelHero;
  eslogan?: string;
  lineas: readonly LineaServicio[];
  hrefWhatsApp: string;
}) {
  const ctaPrimario = hero?.ctaPrimario;
  const ctaSecundario = hero?.ctaSecundario;
  // Con video, el póster hace de imagen de fondo: es la LCP y lo que queda
  // cuando el visitante pide menos movimiento.
  const imagenDeFondo =
    fondo === null ? null : fondo.tipo === "imagen" ? fondo.imagen : fondo.poster;

  return (
    <>
      <section
        aria-labelledby="titulo-inicio"
        className="sobre-oscuro relative isolate overflow-hidden bg-azul-950"
      >
        {imagenDeFondo ? (
          <>
            <FotoDeFondo imagen={imagenDeFondo} prioritaria className="-z-20" />
            {fondo?.tipo === "video" ? (
              // Sin sonido, sin controles y en bucle: es textura, no un reproductor.
              // `aria-hidden` + el póster ya descrito por el `<img>` de abajo evitan
              // anunciarlo dos veces.
              <video
                aria-hidden="true"
                tabIndex={-1}
                autoPlay
                muted
                loop
                playsInline
                preload="metadata"
                poster={fondo.poster.src}
                className="absolute inset-0 -z-20 size-full object-cover motion-reduce:hidden"
              >
                <source src={fondo.src} />
              </video>
            ) : null}
            {/* Viraje al azul de marca: la capa toma el tono de `azul-700` y deja
                la luminosidad de la foto (`mix-blend-color`). Es lo que hace que
                la portada se lea PIYC —azul— a primera vista (regla 13). */}
            <div
              aria-hidden="true"
              className="absolute inset-0 -z-10 bg-azul-700 opacity-75 mix-blend-color"
            />
          </>
        ) : (
          // Sin fondo definido: degradado de marca con la retícula tenue. Tiene
          // que leerse como una decisión, no como una imagen que no cargó.
          <div
            aria-hidden="true"
            className="fondo-noche reticula-cabecera absolute inset-0 -z-20"
          />
        )}
        <div
          aria-hidden="true"
          className={`absolute inset-0 -z-10 ${imagenDeFondo ? "velo-cabecera" : ""}`}
        />

        <Contenedor className="flex min-h-[30rem] flex-col pb-14 pt-[calc(var(--alto-nav)+2rem)] sm:min-h-[34rem] lg:min-h-[40rem] lg:pb-20 lg:pt-[calc(var(--alto-nav)+3rem)]">
          <div className="animate-aparecer mt-auto max-w-[56rem]">
            {hero?.eyebrow ? <Rotulo tono="oscuro">{hero.eyebrow}</Rotulo> : null}

            <h1
              id="titulo-inicio"
              className={`text-balance text-[2.5rem] font-semibold leading-[1.03] text-blanco sm:text-[3.375rem] lg:text-[4rem] ${
                hero?.eyebrow ? "mt-5" : ""
              }`}
            >
              {hero?.title ?? "Automatización industrial e ingeniería eléctrica"}
            </h1>

            {eslogan ? (
              <p className="mt-5 max-w-[46ch] text-[1.25rem] font-medium leading-snug text-acero-100 sm:text-[1.5rem]">
                {eslogan}
              </p>
            ) : null}

            {hero?.subtitle ? (
              <p className="mt-4 max-w-[58ch] text-[1.0625rem] leading-[1.65] text-acero-200 sm:text-[1.125rem]">
                {hero.subtitle}
              </p>
            ) : null}

            {/* Los dos CTA son un grupo: mismo alto siempre y, apilados en
                móvil, mismo ancho (`GrupoDeBotones`). */}
            <GrupoDeBotones className="mt-9">
              {ctaPrimario ? (
                <BotonPrimario href={ctaPrimario.href} tono="oscuro" tamano="grande">
                  {ctaPrimario.etiqueta}
                </BotonPrimario>
              ) : null}

              {/* `href: "whatsapp"` es el convenio del ajuste para «usa el número
                  de contacto», sin que el panel tenga que escribir la URL. */}
              {ctaSecundario && hrefWhatsApp ? (
                <BotonWhatsApp
                  href={ctaSecundario.href === "whatsapp" ? hrefWhatsApp : ctaSecundario.href}
                  tamano="grande"
                >
                  {ctaSecundario.etiqueta}
                </BotonWhatsApp>
              ) : null}
            </GrupoDeBotones>
          </div>
        </Contenedor>
      </section>

      {/* LÍNEAS DE SERVICIO
          Una sola tarjeta que ocupa exactamente el ancho del contenedor
          partida en celdas por filetes (`gap-px` sobre fondo `separador`). Dos
          columnas desde `lg` y una debajo: así cada frase corta cabe en UNA
          línea en escritorio y tableta (Cesar, sep-2026). Nombre y frase salen
          del panel (`home.lineasServicio`). */}
      {lineas.length > 0 ? (
        <section aria-labelledby="titulo-lineas" className="bg-lienzo">
          <Contenedor className="py-12 lg:py-16">
            <h2 id="titulo-lineas" className="sr-only">
              Líneas de servicio
            </h2>
            <ul
              data-franja-lineas=""
              className="grid gap-px overflow-hidden rounded-tarjeta bg-separador shadow-tarjeta ring-1 ring-separador lg:grid-cols-2"
            >
              {lineas.map((linea, indice) => (
                <li
                  key={linea.id}
                  className="group relative flex items-center gap-4 bg-blanco px-5 py-4 transition-colors duration-300 ease-ios hover:bg-lienzo-alto sm:px-6 sm:py-5"
                >
                  <span className="inline-flex size-9 shrink-0 items-center justify-center rounded-capsula bg-relleno text-[13px] font-semibold tabular-nums text-azul-700 transition-colors duration-300 ease-ios group-hover:bg-azul-700 group-hover:text-blanco">
                    {String(indice + 1).padStart(2, "0")}
                  </span>
                  <div className="min-w-0 flex-1">
                    <h3 className="text-[1.0625rem] font-semibold leading-snug text-azul-950">
                      <Link
                        href={`/servicios#${linea.id}`}
                        className="after:absolute after:inset-0 after:content-['']"
                      >
                        {linea.titulo}
                      </Link>
                    </h3>
                    {linea.resumenCorto ? (
                      <p
                        data-resumen-linea=""
                        className="mt-0.5 text-[14px] leading-snug text-acero-600"
                      >
                        {linea.resumenCorto}
                      </p>
                    ) : null}
                  </div>
                  <IconoFlecha className="hidden size-4.5 shrink-0 text-azul-700 transition-transform duration-300 ease-ios group-hover:translate-x-1 sm:block" />
                </li>
              ))}
            </ul>
          </Contenedor>
        </section>
      ) : null}
    </>
  );
}
