/**
 * CABECERA DE PÁGINA INTERNA + MIGAS
 * ==================================
 * La cabecera es **tipográfica**, no una foto a sangre con el título encima.
 * Dos motivos:
 *  1. Las fotos disponibles están incrustadas ya reducidas — la mayor mide
 *     1229 px y la de `cabeceras/` solo 658×493 (`docs/CONTENIDO.md` §2.4).
 *     Estiradas a pantalla completa se ven blandas.
 *  2. Es justo el recurso que usa GPI (hero centrado con foto de fondo). Aquí
 *     el fondo es la retícula de plano y la foto va en un recuadro medido.
 */

import Link from "next/link";
import type { ReactNode } from "react";
import type { CabeceraPagina, ImagenContenido } from "@/lib/content-types";
import type { Miga } from "@/lib/seo";
import { FotoEnmarcada } from "@/components/ui/ContentImage";
import { Contenedor, EntradaSeccion, Rotulo, TituloSeccion } from "./primitivas";

/* ===================================================================== */
/* Migas                                                                  */
/* ===================================================================== */

/**
 * Migas de pan. La última es la página actual: va sin enlace y marcada con
 * `aria-current`. El `BreadcrumbList` equivalente lo emite la página con
 * `jsonLdMigas`.
 */
export function Migas({ migas, className = "" }: { migas: readonly Miga[]; className?: string }) {
  if (migas.length === 0) return null;

  return (
    <nav aria-label="Ruta de navegación" className={className}>
      <ol className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[13px] text-acero-600">
        {migas.map((miga, indice) => {
          const esUltima = indice === migas.length - 1;
          return (
            <li key={miga.href} className="flex items-center gap-2">
              {indice > 0 ? (
                <span aria-hidden="true" className="text-acero-400">
                  /
                </span>
              ) : null}
              {esUltima ? (
                <span aria-current="page" className="font-medium text-azul-900">
                  {miga.etiqueta}
                </span>
              ) : (
                <Link href={miga.href} className="hover:text-azul-700 hover:underline">
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

type PropsCabecera = {
  /** Contenido editable desde el panel (`site_settings.paginas`). */
  ajustes?: CabeceraPagina;
  /** Respaldos por si el ajuste no trae el campo. */
  rotulo?: string;
  titulo: string;
  bajada?: string;
  imagen?: ImagenContenido | null;
  migas?: readonly Miga[];
  /** Columna derecha a medida (ficha técnica, datos del proyecto…). */
  aside?: ReactNode;
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
  aside,
  children,
}: PropsCabecera) {
  const rotuloFinal = ajustes?.eyebrow ?? rotulo;
  const tituloFinal = ajustes?.title || titulo;
  const bajadaFinal = ajustes?.subtitle ?? bajada;
  const imagenFinal = imagen ?? ajustes?.image ?? null;
  const columnaDerecha = aside ?? (imagenFinal ? <FotoDeCabecera imagen={imagenFinal} /> : null);

  return (
    <section className="fondo-plano border-b border-acero-200">
      <Contenedor className="pb-12 pt-6 sm:pb-14 sm:pt-8 lg:pb-16">
        <Migas migas={migas} className="mb-8" />

        <div
          className={
            columnaDerecha
              ? "grid gap-10 lg:grid-cols-12 lg:items-start lg:gap-12"
              : "max-w-4xl"
          }
        >
          <div className={columnaDerecha ? "lg:col-span-7" : ""}>
            {rotuloFinal ? <Rotulo>{rotuloFinal}</Rotulo> : null}
            <TituloSeccion as="h1" className={rotuloFinal ? "mt-5" : ""}>
              {tituloFinal}
            </TituloSeccion>
            {bajadaFinal ? (
              <EntradaSeccion className="mt-6 border-l-[3px] border-azul-700 pl-4">
                {bajadaFinal}
              </EntradaSeccion>
            ) : null}
            {children}
          </div>

          {columnaDerecha ? (
            <div className="lg:col-span-5 lg:pt-2">{columnaDerecha}</div>
          ) : null}
        </div>
      </Contenedor>
    </section>
  );
}

/** Foto de cabecera dentro de su marco, con tope de ancho para no ampliarla. */
function FotoDeCabecera({ imagen }: { imagen: ImagenContenido }) {
  return (
    <FotoEnmarcada
      src={imagen.src}
      alt={imagen.alt}
      width={imagen.width}
      height={imagen.height}
      prioritaria
      proporcion="aspect-[4/3]"
      className="mx-auto max-w-[min(100%,26rem)] lg:mx-0 lg:ml-auto"
    />
  );
}

/**
 * Ficha técnica: pares dato/valor en rejilla, como el cajetín de un plano.
 * Se usa como columna derecha de la cabecera en las páginas de detalle.
 *
 * Una fila cuyo valor sea vacío, `null` o `"0"` **no se pinta** (regla 9 de
 * AGENTS.md: `0` nunca se muestra como dato).
 */
export function FichaTecnica({
  filas,
  titulo = "Ficha",
}: {
  filas: readonly { dato: string; valor: string | null | undefined }[];
  titulo?: string;
}) {
  const visibles = filas.filter(
    (fila) => fila.valor != null && fila.valor.trim() !== "" && fila.valor.trim() !== "0",
  );
  if (visibles.length === 0) return null;

  return (
    <div className="sobre-oscuro border border-azul-800 bg-azul-950">
      <p className="border-b border-azul-800 px-4 py-2.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-acero-300">
        {titulo}
      </p>
      <dl className="divide-y divide-azul-800">
        {visibles.map((fila) => (
          <div key={fila.dato} className="grid grid-cols-[9rem_1fr] gap-3 px-4 py-3">
            <dt className="text-[11px] font-semibold uppercase tracking-[0.12em] text-acero-400">
              {fila.dato}
            </dt>
            <dd className="text-[14px] leading-snug text-acero-100">{fila.valor}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
