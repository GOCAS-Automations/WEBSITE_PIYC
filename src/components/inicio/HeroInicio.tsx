/**
 * HERO DE INICIO
 * ==============
 * Estructura aprobada: texto a la izquierda, panel de diagrama de escalera a
 * la derecha y franja con las cuatro líneas de servicio abajo.
 *
 * El panel del PLC no es decoración: es el elemento que fija la identidad del
 * sitio (retícula de plano, cajetín, señal energizada en verde) y el que lo
 * separa del hero centrado con foto de fondo de GPI (regla 13 de AGENTS.md).
 * Por eso el hero **no lleva foto**: las disponibles son pequeñas y estiradas
 * se ven blandas (`docs/CONTENIDO.md` §2.4).
 *
 * Todo el texto llega por props desde `site_settings.home`.
 */

import Link from "next/link";
import type { AjustesHome, LineaServicio } from "@/lib/content-types";
import { IconoFlecha, IconoWhatsApp } from "@/components/ui/iconos";
import { MarcasDeCorte } from "@/components/ui/ContentImage";
import { DiagramaEscalera } from "./DiagramaEscalera";

const cartela = [
  { dato: "Esquema", valor: "Ilustrativo" },
  { dato: "Norma", valor: "IEC 61131-3" },
  { dato: "Lenguaje", valor: "Escalera (LD)" },
  { dato: "Rev.", valor: "A · 01/01" },
] as const;

export function HeroInicio({
  hero,
  eslogan,
  lineas,
  hrefWhatsApp,
}: {
  hero: AjustesHome["hero"];
  eslogan?: string;
  lineas: readonly LineaServicio[];
  hrefWhatsApp: string;
}) {
  const ctaPrimario = hero?.ctaPrimario;
  const ctaSecundario = hero?.ctaSecundario;

  return (
    <section aria-labelledby="titulo-inicio" className="fondo-plano border-b border-acero-200">
      <div className="mx-auto grid max-w-sitio gap-12 px-4 pb-14 pt-10 sm:pt-14 lg:grid-cols-12 lg:items-center lg:gap-10 lg:px-8 lg:pb-16 lg:pt-14">
        {/* Texto */}
        <div className="lg:col-span-7">
          {hero?.eyebrow ? (
            <p className="flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.12em] text-acero-600 sm:tracking-[0.16em]">
              <span aria-hidden="true" className="size-2.5 shrink-0 bg-verde-500" />
              <span>{hero.eyebrow}</span>
            </p>
          ) : null}

          <h1
            id="titulo-inicio"
            className="mt-5 text-balance text-[2.625rem] font-semibold leading-[0.98] tracking-[-0.01em] text-azul-950 sm:text-6xl lg:text-[4.375rem]"
          >
            {hero?.title ?? "Automatización industrial e ingeniería eléctrica"}
          </h1>

          {eslogan ? (
            <p className="mt-6 border-l-[3px] border-azul-700 pl-4 font-titulo text-2xl font-medium leading-tight text-azul-900 sm:text-[1.75rem]">
              {eslogan}
            </p>
          ) : null}

          {hero?.subtitle ? (
            <p className="mt-5 max-w-[60ch] text-base leading-relaxed text-acero-600 sm:text-[1.0625rem]">
              {hero.subtitle}
            </p>
          ) : null}

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            {ctaPrimario ? (
              <Link
                href={ctaPrimario.href}
                className="group inline-flex h-12 items-center justify-center gap-3 rounded-fino bg-azul-700 px-6 font-semibold text-blanco transition-colors hover:bg-azul-800"
              >
                {ctaPrimario.etiqueta}
                <IconoFlecha className="size-5 transition-transform group-hover:translate-x-1" />
              </Link>
            ) : null}

            {/* `href: "whatsapp"` es el convenio del ajuste para «usa el número
                de contacto», sin que el panel tenga que escribir la URL. */}
            {ctaSecundario && hrefWhatsApp ? (
              <a
                href={ctaSecundario.href === "whatsapp" ? hrefWhatsApp : ctaSecundario.href}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex h-12 items-center justify-center gap-3 rounded-fino bg-verde-500 px-6 font-semibold text-azul-950 transition-colors hover:bg-verde-400"
              >
                <IconoWhatsApp className="size-5" />
                {ctaSecundario.etiqueta}
              </a>
            ) : null}
          </div>
        </div>

        {/* Panel con el diagrama */}
        <figure className="relative mx-2 lg:col-span-5 lg:mx-0">
          <MarcasDeCorte className="size-4" />
          <div className="sobre-oscuro border border-azul-800 bg-azul-950">
            <div className="flex items-center justify-between gap-4 border-b border-azul-800 px-4 py-2.5 text-[11px] font-semibold uppercase tracking-[0.14em]">
              <span className="text-acero-200">PLC-01 · Lógica de control</span>
              <span className="flex items-center gap-2 text-verde-400">
                <span
                  aria-hidden="true"
                  className="size-2 rounded-full bg-verde-400 animate-parpadeo"
                />
                En marcha
              </span>
            </div>
            <div className="px-3 py-4 sm:px-5 sm:py-5">
              <DiagramaEscalera className="block h-auto w-full font-sans" />
            </div>
            <figcaption>
              <dl className="grid grid-cols-2 border-t border-azul-800 sm:grid-cols-4">
                {cartela.map((celda, indice) => (
                  <div
                    key={celda.dato}
                    className={`px-4 py-2.5 ${indice % 2 === 0 ? "border-r" : ""} ${indice < 2 ? "border-b sm:border-b-0" : ""} border-azul-800 sm:border-r sm:last:border-r-0`}
                  >
                    <dt className="text-[10px] font-semibold uppercase tracking-[0.14em] text-acero-400">
                      {celda.dato}
                    </dt>
                    <dd className="mt-0.5 text-[13px] font-medium text-acero-100">
                      {celda.valor}
                    </dd>
                  </div>
                ))}
              </dl>
            </figcaption>
          </div>
        </figure>
      </div>

      {/* Líneas de trabajo: franja con divisiones, sin tarjetas */}
      {lineas.length > 0 ? (
        <div className="border-t border-acero-200 bg-blanco">
          <h2 className="sr-only">Líneas de servicio</h2>
          <ul className="mx-auto grid max-w-sitio sm:grid-cols-2 lg:grid-cols-4 lg:px-8">
            {lineas.map((linea, indice) => (
              <li
                key={linea.id}
                className="flex gap-4 border-b border-acero-200 px-4 py-5 last:border-b-0 sm:odd:border-r sm:[&:nth-last-child(-n+2)]:border-b-0 lg:border-b-0 lg:border-r lg:px-6 lg:py-6 lg:first:pl-0 lg:last:border-r-0"
              >
                <span className="pt-1 font-titulo text-sm font-semibold tabular-nums text-azul-600">
                  {String(indice + 1).padStart(2, "0")}
                </span>
                <div>
                  <h3 className="text-xl font-semibold leading-tight text-azul-950">
                    <Link
                      href={`/servicios#${linea.id}`}
                      className="transition-colors hover:text-azul-700"
                    >
                      {linea.titulo}
                    </Link>
                  </h3>
                  <p className="mt-1.5 text-sm leading-snug text-acero-600">{linea.resumen}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </section>
  );
}
