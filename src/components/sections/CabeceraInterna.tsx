/**
 * CABECERA DE PÁGINA INTERNA + MIGAS
 * ==================================
 * Todas las páginas menos el inicio abren con esta cabecera: **foto a sangre
 * de fondo**, detrás de la cápsula flotante del nav, con un velo azul noche en
 * degradado encima. Sustituye al recuadro con foto a la derecha del título
 * (pedido de Cesar, sep-2026: «imágenes para los fondos de los heros de cada
 * página, en vez de un cuadro con imagen en cada hero»).
 *
 * Lo que la separa de GPI (regla 13 de AGENTS.md), que usa hero centrado con
 * foto verde-gris: el texto va **alineado a la izquierda y abajo**, el velo es
 * azul de marca, la altura es contenida (no pantalla completa) y arriba van
 * las migas.
 *
 * CONTRASTE
 * ---------
 * El velo (`velo-cabecera`, `globals.css`) está medido para el peor caso —una
 * foto blanca—: bajo el título y la bajada nunca queda por debajo de ~75 % de
 * azul noche, lo que da ≥ 7:1 con blanco y ≥ 5:1 con `acero-100`.
 *
 * LA FOTO ES LA LCP
 * -----------------
 * `<img>` real con `fetchpriority="high"`, sin `lazy`, con medidas y `srcset`
 * cuando la imagen trae su variante de 900 px (`FotoDeFondo`).
 *
 * SIN FOTO
 * --------
 * Cabecera sobre el degradado de marca (`fondo-noche`) con una retícula tenue
 * y, si la página la da, una marca de agua (el icono del servicio). Tiene que
 * leerse como una decisión, no como una foto que no cargó.
 */

import Link from "next/link";
import type { ReactNode } from "react";
import type { CabeceraPagina, ImagenContenido } from "@/lib/content-types";
import type { Miga } from "@/lib/seo";
import { FotoDeFondo } from "@/components/ui/ContentImage";
import { Contenedor, Rotulo } from "./primitivas";

/* ===================================================================== */
/* Migas                                                                  */
/* ===================================================================== */

/**
 * Migas de pan. La última es la página actual: va sin enlace y marcada con
 * `aria-current`. El `BreadcrumbList` equivalente lo emite la página con
 * `jsonLdMigas`.
 */
export function Migas({
  migas,
  tono = "claro",
  className = "",
}: {
  migas: readonly Miga[];
  tono?: "claro" | "oscuro";
  className?: string;
}) {
  if (migas.length === 0) return null;
  const oscuro = tono === "oscuro";

  return (
    <nav aria-label="Ruta de navegación" className={className}>
      <ol
        className={`flex flex-wrap items-center gap-x-1.5 gap-y-1 text-[13px] ${
          oscuro ? "text-acero-200" : "text-acero-600"
        }`}
      >
        {migas.map((miga, indice) => {
          const esUltima = indice === migas.length - 1;
          return (
            <li key={miga.href} className="flex items-center gap-1.5">
              {indice > 0 ? (
                <span aria-hidden="true" className={oscuro ? "text-acero-300" : "text-acero-400"}>
                  ›
                </span>
              ) : null}
              {esUltima ? (
                <span
                  aria-current="page"
                  className={`font-medium ${oscuro ? "text-blanco" : "text-azul-900"}`}
                >
                  {miga.etiqueta}
                </span>
              ) : (
                <Link
                  href={miga.href}
                  className={`rounded-chip px-1 transition-colors ${
                    oscuro ? "hover:text-blanco" : "hover:text-azul-700"
                  }`}
                >
                  {miga.etiqueta}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

/* ===================================================================== */
/* Cabecera                                                               */
/* ===================================================================== */

/** Un dato de la ficha en cápsula: «Línea · Automatización y control». */
export type DatoDeCabecera = {
  etiqueta: string;
  valor: string | null | undefined;
  href?: string;
};

type PropsCabecera = {
  /** Contenido editable desde el panel (`site_settings.paginas`). */
  ajustes?: CabeceraPagina;
  /** Respaldos por si el ajuste no trae el campo. */
  rotulo?: string;
  titulo: string;
  bajada?: string;
  /** Foto de fondo. Manda sobre `ajustes.image`. `null` = sin foto a propósito. */
  imagen?: ImagenContenido | null;
  migas?: readonly Miga[];
  /** Desenfoque leve para capturas de pantalla que no aguantan ampliación. */
  desenfocar?: boolean;
  /** Marca de agua cuando no hay foto (el icono del servicio, por ejemplo). */
  marca?: ReactNode;
  /**
   * Datos de la ficha en cápsulas bajo la bajada. Un dato vacío, `null` o
   * `"0"` no se pinta (regla 9 de AGENTS.md: `0` nunca se muestra como dato).
   */
  datos?: readonly DatoDeCabecera[];
  /** Bloque extra bajo la bajada (botones, por ejemplo). */
  children?: ReactNode;
};

export function CabeceraInterna({
  ajustes,
  rotulo,
  titulo,
  bajada,
  imagen,
  migas = [],
  desenfocar = false,
  marca,
  datos = [],
  children,
}: PropsCabecera) {
  const rotuloFinal = ajustes?.eyebrow ?? rotulo;
  const tituloFinal = ajustes?.title || titulo;
  const bajadaFinal = ajustes?.subtitle ?? bajada;
  // `imagen === null` es «sin foto» explícito; `undefined`, «la del ajuste».
  const candidata = imagen === undefined ? ajustes?.image : imagen;
  // Una foto sin `src` no se pinta; tampoco una sin `alt` (entraría al sitio
  // sin texto alternativo): la cabecera cae al degradado de marca.
  const fondo = candidata?.src && candidata.alt ? candidata : null;
  const datosVisibles = datos.filter(
    (dato): dato is DatoDeCabecera & { valor: string } =>
      dato.valor != null && dato.valor.trim() !== "" && dato.valor.trim() !== "0",
  );

  return (
    <section className="sobre-oscuro relative isolate overflow-hidden bg-azul-950">
      {fondo ? (
        <>
          <FotoDeFondo imagen={fondo} prioritaria desenfocar={desenfocar} className="-z-20" />
          {/* Viraje al azul de marca: la capa toma el tono de `azul-700` y deja
              la luminosidad de la foto (`mix-blend-color`). Es lo que hace que
              la cabecera se lea PIYC —azul— a primera vista y no como la de
              GPI, que usa la foto en su color con un velo neutro (regla 13). */}
          <div aria-hidden="true" className="absolute inset-0 -z-10 bg-azul-700 opacity-75 mix-blend-color" />
        </>
      ) : (
        <div aria-hidden="true" className="fondo-noche reticula-cabecera absolute inset-0 -z-20">
          {marca ? (
            <div className="absolute -right-10 top-1/2 hidden -translate-y-1/2 text-azul-300/25 sm:block lg:right-[6%]">
              {marca}
            </div>
          ) : null}
        </div>
      )}
      <div aria-hidden="true" className={`absolute inset-0 -z-10 ${fondo ? "velo-cabecera" : ""}`} />

      <Contenedor className="flex min-h-[20rem] flex-col pb-9 pt-[calc(var(--alto-nav)+0.75rem)] sm:min-h-[23rem] lg:min-h-[26rem] lg:pb-12 lg:pt-[calc(var(--alto-nav)+1.25rem)]">
        <Migas migas={migas} tono="oscuro" />

        <div className="mt-auto max-w-[52rem] pt-8 lg:pt-10">
          {rotuloFinal ? <Rotulo tono="oscuro">{rotuloFinal}</Rotulo> : null}
          <h1
            className={`text-balance text-[2rem] font-semibold leading-[1.06] text-blanco sm:text-[2.625rem] lg:text-[3rem] ${
              rotuloFinal ? "mt-4" : ""
            }`}
          >
            {tituloFinal}
          </h1>
          {bajadaFinal ? (
            <p className="mt-4 max-w-[60ch] text-[1.0625rem] leading-[1.6] text-acero-100 sm:mt-5 sm:text-[1.125rem]">
              {bajadaFinal}
            </p>
          ) : null}

          {datosVisibles.length > 0 ? (
            <dl className="mt-6 flex flex-wrap gap-2">
              {datosVisibles.map((dato) => (
                <div
                  key={dato.etiqueta}
                  className="inline-flex items-center gap-2 rounded-capsula bg-azul-950/55 px-3.5 py-1.5 text-[13px] ring-1 ring-separador-claro backdrop-blur-material"
                >
                  <dt className="text-acero-300">{dato.etiqueta}</dt>
                  <dd className="font-medium text-blanco">
                    {dato.href ? (
                      <Link
                        href={dato.href}
                        className="underline decoration-acero-400 underline-offset-2 hover:decoration-blanco"
                      >
                        {dato.valor}
                      </Link>
                    ) : (
                      dato.valor
                    )}
                  </dd>
                </div>
              ))}
            </dl>
          ) : null}

          {children}
        </div>
      </Contenedor>
    </section>
  );
}
