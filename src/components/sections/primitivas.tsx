/**
 * PRIMITIVAS DE SECCIÓN
 * =====================
 * Las piezas que se repiten en todas las páginas: contenedor, rótulo de
 * sección, título, botones y separadores.
 *
 * Lenguaje visual del sitio (regla 13 de AGENTS.md — no puede parecerse a GPI):
 *  - **Filetes, no sombras.** Ninguna tarjeta lleva `box-shadow`; la sombra
 *    está desactivada en el tema (`--shadow-*: initial`).
 *  - **Retícula de plano** (`fondo-plano`) en las superficies claras.
 *  - **Ritmo de fondos**: blanco → retícula acero → azul 950, alternando.
 *  - **Azul dominante, verde al 10 %**: el verde solo en WhatsApp e indicadores.
 *  - Bordes casi rectos (`rounded-fino`, 2 px). Nada redondeado.
 */

import Link from "next/link";
import type { ReactNode } from "react";
import { IconoFlecha, IconoWhatsApp } from "@/components/ui/iconos";

/* ===================================================================== */
/* Contenedor                                                             */
/* ===================================================================== */

/** Ancho máximo del sitio con el gutter de 16 px en móvil. */
export function Contenedor({
  children,
  className = "",
  as: Etiqueta = "div",
}: {
  children: ReactNode;
  className?: string;
  as?: "div" | "section" | "header" | "footer" | "nav";
}) {
  return (
    <Etiqueta className={`mx-auto w-full max-w-sitio px-4 lg:px-8 ${className}`}>
      {children}
    </Etiqueta>
  );
}

/* ===================================================================== */
/* Rótulos y títulos                                                      */
/* ===================================================================== */

/** Rótulo pequeño en versalitas, con el cuadro verde de señal a la izquierda. */
export function Rotulo({
  children,
  tono = "claro",
  className = "",
}: {
  children: ReactNode;
  tono?: "claro" | "oscuro";
  className?: string;
}) {
  return (
    <p
      className={`flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.14em] ${
        tono === "oscuro" ? "text-acero-300" : "text-acero-600"
      } ${className}`}
    >
      <span aria-hidden="true" className="size-2.5 shrink-0 bg-verde-500" />
      <span>{children}</span>
    </p>
  );
}

/** Título de sección: `h2` por defecto, con la escala tipográfica del sitio. */
export function TituloSeccion({
  children,
  id,
  as: Etiqueta = "h2",
  tono = "claro",
  className = "",
}: {
  children: ReactNode;
  id?: string;
  as?: "h1" | "h2" | "h3";
  tono?: "claro" | "oscuro";
  className?: string;
}) {
  return (
    <Etiqueta
      id={id}
      className={`text-balance font-semibold leading-[1.05] tracking-[-0.01em] ${
        Etiqueta === "h1"
          ? "text-[2.375rem] sm:text-5xl lg:text-[3.75rem]"
          : "text-[1.875rem] sm:text-4xl lg:text-[2.75rem]"
      } ${tono === "oscuro" ? "text-blanco" : "text-azul-950"} ${className}`}
    >
      {children}
    </Etiqueta>
  );
}

/** Párrafo de entrada de una sección. */
export function EntradaSeccion({
  children,
  tono = "claro",
  className = "",
}: {
  children: ReactNode;
  tono?: "claro" | "oscuro";
  className?: string;
}) {
  return (
    <p
      className={`max-w-[68ch] text-base leading-relaxed sm:text-[1.0625rem] ${
        tono === "oscuro" ? "text-acero-200" : "text-acero-600"
      } ${className}`}
    >
      {children}
    </p>
  );
}

/** Cuerpo de texto largo: párrafos separados por línea en blanco. */
export function Parrafos({
  textos,
  tono = "claro",
  className = "",
}: {
  textos: readonly string[];
  tono?: "claro" | "oscuro";
  className?: string;
}) {
  if (textos.length === 0) return null;
  return (
    <div
      className={`space-y-4 text-base leading-relaxed sm:text-[1.0625rem] ${
        tono === "oscuro" ? "text-acero-200" : "text-acero-700"
      } ${className}`}
    >
      {textos.map((texto, indice) => (
        <p key={indice} className="max-w-[72ch]">
          {texto}
        </p>
      ))}
    </div>
  );
}

/* ===================================================================== */
/* Botones y enlaces de acción                                            */
/* ===================================================================== */

const CLASES_BOTON =
  "group inline-flex h-12 items-center justify-center gap-3 rounded-fino px-6 text-center font-semibold transition-colors";

/** Botón primario: azul de marca. */
export function BotonPrimario({
  href,
  children,
  className = "",
}: {
  href: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <Link
      href={href}
      className={`${CLASES_BOTON} bg-azul-700 text-blanco hover:bg-azul-800 ${className}`}
    >
      {children}
      <IconoFlecha className="size-5 shrink-0 transition-transform group-hover:translate-x-1" />
    </Link>
  );
}

/**
 * Botón secundario: contorno. Sobre fondo oscuro cambia de contraste.
 * Nunca lleva verde: el verde está reservado para WhatsApp.
 */
export function BotonSecundario({
  href,
  children,
  tono = "claro",
  className = "",
}: {
  href: string;
  children: ReactNode;
  tono?: "claro" | "oscuro";
  className?: string;
}) {
  const clasesTono =
    tono === "oscuro"
      ? "border-azul-300 text-acero-100 hover:bg-azul-900"
      : "border-azul-700 text-azul-700 hover:bg-azul-50";
  return (
    <Link href={href} className={`${CLASES_BOTON} border ${clasesTono} ${className}`}>
      {children}
      <IconoFlecha className="size-5 shrink-0 transition-transform group-hover:translate-x-1" />
    </Link>
  );
}

/**
 * Botón de WhatsApp — el único elemento verde grande del sitio.
 * Texto `azul-950` sobre `verde-500` (6.6:1). Blanco ahí falla (2.9:1).
 */
export function BotonWhatsApp({
  href,
  children = "Escríbenos por WhatsApp",
  className = "",
}: {
  href: string;
  children?: ReactNode;
  className?: string;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={`${CLASES_BOTON} bg-verde-500 text-azul-950 hover:bg-verde-400 ${className}`}
    >
      <IconoWhatsApp className="size-5 shrink-0" />
      {children}
    </a>
  );
}

/** Enlace de texto con flecha, para cierres de sección. */
export function EnlaceConFlecha({
  href,
  children,
  tono = "claro",
  className = "",
}: {
  href: string;
  children: ReactNode;
  tono?: "claro" | "oscuro";
  className?: string;
}) {
  return (
    <Link
      href={href}
      className={`group inline-flex items-center gap-2.5 font-semibold ${
        tono === "oscuro" ? "text-azul-300 hover:text-blanco" : "text-azul-700 hover:text-azul-900"
      } ${className}`}
    >
      {children}
      <IconoFlecha className="size-4 transition-transform group-hover:translate-x-1" />
    </Link>
  );
}

/* ===================================================================== */
/* Listas                                                                 */
/* ===================================================================== */

/** Lista de alcances: filete a la izquierda y marca verde, sin viñeta redonda. */
export function ListaDeAlcances({
  items,
  tono = "claro",
  className = "",
}: {
  items: readonly string[];
  tono?: "claro" | "oscuro";
  className?: string;
}) {
  if (items.length === 0) return null;
  return (
    <ul className={`grid gap-px bg-acero-200 sm:grid-cols-2 ${className}`}>
      {items.map((item) => (
        <li
          key={item}
          className={`flex gap-3 px-4 py-3.5 text-[15px] leading-snug ${
            tono === "oscuro" ? "bg-azul-950 text-acero-200" : "bg-blanco text-azul-900"
          }`}
        >
          <span aria-hidden="true" className="mt-[7px] size-2 shrink-0 bg-verde-500" />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}
