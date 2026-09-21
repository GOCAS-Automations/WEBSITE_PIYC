/**
 * HERO DE INICIO
 * ==============
 * Estructura aprobada: texto a la izquierda, panel del diagrama de escalera a
 * la derecha y las cuatro líneas de servicio abajo.
 *
 * Sistema v3: el panel del PLC pasó de ser un recuadro de plano técnico a un
 * **widget** de esquinas continuas, fondo azul noche con luces difusas y
 * fichas redondeadas en el pie. Sigue siendo lo que separa a PIYC del hero
 * centrado con foto a sangre de GPI (regla 13 de AGENTS.md), pero ahora en
 * clave iOS. El hero **no lleva foto**: las disponibles son pequeñas y
 * estiradas se ven blandas (`docs/CONTENIDO.md` §2.4).
 *
 * Todo el texto llega por props desde `site_settings.home`.
 */

import Link from "next/link";
import type { AjustesHome, LineaServicio } from "@/lib/content-types";
import { IconoFlecha, IconoWhatsApp } from "@/components/ui/iconos";
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
    <section aria-labelledby="titulo-inicio" className="fondo-plano">
      <div className="mx-auto grid max-w-sitio gap-10 px-4 pb-14 pt-[calc(var(--alto-nav)+1rem)] sm:px-6 lg:grid-cols-12 lg:items-center lg:gap-12 lg:px-8 lg:pb-20 lg:pt-[calc(var(--alto-nav)+2.5rem)]">
        {/* Texto */}
        <div className="animate-aparecer lg:col-span-7">
          {hero?.eyebrow ? (
            <p className="inline-flex items-center gap-2 rounded-capsula bg-material px-3.5 py-1.5 text-[13px] font-medium text-azul-800 shadow-sutil ring-1 ring-separador">
              <span aria-hidden="true" className="size-2 shrink-0 rounded-capsula bg-verde-500" />
              <span>{hero.eyebrow}</span>
            </p>
          ) : null}

          <h1
            id="titulo-inicio"
            className="mt-6 text-balance text-[2.5rem] font-bold leading-[1.02] text-azul-950 sm:text-[3.5rem] lg:text-[4rem]"
          >
            {hero?.title ?? "Automatización industrial e ingeniería eléctrica"}
          </h1>

          {eslogan ? (
            <p className="mt-5 text-[1.375rem] font-medium leading-snug text-azul-700 sm:text-[1.5rem]">
              {eslogan}
            </p>
          ) : null}

          {hero?.subtitle ? (
            <p className="mt-5 max-w-[58ch] text-[1.0625rem] leading-[1.65] text-acero-600 sm:text-[1.125rem]">
              {hero.subtitle}
            </p>
          ) : null}

          <div className="mt-9 flex flex-col gap-3 sm:flex-row">
            {ctaPrimario ? (
              <Link
                href={ctaPrimario.href}
                className="pulsable group inline-flex h-13 items-center justify-center gap-2.5 rounded-capsula bg-azul-700 px-7 text-[15px] font-semibold text-blanco shadow-tarjeta hover:bg-azul-600"
              >
                {ctaPrimario.etiqueta}
                <IconoFlecha className="size-4.5 transition-transform duration-300 ease-ios group-hover:translate-x-1" />
              </Link>
            ) : null}

            {/* `href: "whatsapp"` es el convenio del ajuste para «usa el número
                de contacto», sin que el panel tenga que escribir la URL. */}
            {ctaSecundario && hrefWhatsApp ? (
              <a
                href={ctaSecundario.href === "whatsapp" ? hrefWhatsApp : ctaSecundario.href}
                target="_blank"
                rel="noopener noreferrer"
                className="pulsable inline-flex h-13 items-center justify-center gap-2.5 rounded-capsula bg-verde-500 px-7 text-[15px] font-semibold text-azul-950 shadow-tarjeta hover:bg-verde-400"
              >
                <IconoWhatsApp className="size-5" />
                {ctaSecundario.etiqueta}
              </a>
            ) : null}
          </div>
        </div>

        {/* Widget con el diagrama */}
        <figure className="animate-aparecer lg:col-span-5 lg:[animation-delay:120ms]">
          <div className="sobre-oscuro overflow-hidden rounded-panel fondo-noche shadow-elevada ring-1 ring-separador-claro">
            <div className="flex items-center justify-between gap-4 px-5 py-4">
              <span className="text-[13px] font-medium text-acero-300">
                PLC-01 · Lógica de control
              </span>
              <span className="inline-flex items-center gap-2 rounded-capsula bg-relleno-claro px-2.5 py-1 text-[12px] font-semibold text-verde-300">
                <span
                  aria-hidden="true"
                  className="size-1.5 rounded-capsula bg-verde-400 animate-parpadeo"
                />
                En marcha
              </span>
            </div>

            <div className="px-3">
              <div className="rounded-tarjeta bg-azul-950/55 p-4 ring-1 ring-separador-claro">
                <DiagramaEscalera className="block h-auto w-full font-sans" />
              </div>
            </div>

            <figcaption className="px-3 py-3">
              <dl className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                {cartela.map((celda) => (
                  <div
                    key={celda.dato}
                    className="rounded-chip bg-relleno-claro px-3 py-2.5"
                  >
                    <dt className="text-[11px] font-medium text-acero-300">{celda.dato}</dt>
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

      {/* Líneas de trabajo: tarjetas redondeadas */}
      {lineas.length > 0 ? (
        <div className="mx-auto max-w-sitio px-4 pb-16 sm:px-6 lg:px-8 lg:pb-20">
          <h2 className="sr-only">Líneas de servicio</h2>
          <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 lg:gap-5">
            {lineas.map((linea, indice) => (
              <li
                key={linea.id}
                className="group relative rounded-tarjeta bg-blanco p-5 shadow-tarjeta transition-[transform,box-shadow] duration-300 ease-ios hover:-translate-y-1 hover:shadow-elevada"
              >
                <span className="inline-flex size-8 items-center justify-center rounded-capsula bg-relleno text-[13px] font-semibold tabular-nums text-azul-700">
                  {String(indice + 1).padStart(2, "0")}
                </span>
                <h3 className="mt-3.5 text-[1.0625rem] font-semibold leading-snug text-azul-950">
                  <Link
                    href={`/servicios#${linea.id}`}
                    className="after:absolute after:inset-0 after:content-['']"
                  >
                    {linea.titulo}
                  </Link>
                </h3>
                <p className="mt-1.5 text-[14px] leading-snug text-acero-600">{linea.resumen}</p>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </section>
  );
}
