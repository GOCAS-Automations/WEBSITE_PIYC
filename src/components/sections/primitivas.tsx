/**
 * PRIMITIVAS DE SECCIÓN
 * =====================
 * Las piezas que se repiten en todas las páginas: contenedor, rótulo de
 * sección, título, botones y listas.
 *
 * Lenguaje visual del sitio — SISTEMA v3 «iOS» (regla 13 de AGENTS.md: no
 * puede parecerse a GPI):
 *  - **Superficies agrupadas.** Fondo `lienzo` gris-azulado y tarjetas blancas
 *    elevadas con sombras en capas de tinte azul. Nada de filetes de 1 px
 *    dibujando retículas.
 *  - **Esquinas continuas y generosas**: `rounded-control` en controles,
 *    `rounded-tarjeta`/`rounded-panel` en tarjetas y paneles, cápsula en
 *    botones y chips.
 *  - **Azul dominante, verde al 10 %**: el verde solo en WhatsApp e indicadores.
 *  - **Antetítulos discretos**: chip pequeño en caja normal, no versalitas
 *    espaciadas en cada bloque.
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
    <Etiqueta className={`mx-auto w-full max-w-sitio px-4 sm:px-6 lg:px-8 ${className}`}>
      {children}
    </Etiqueta>
  );
}

/* ===================================================================== */
/* Rótulos y títulos                                                      */
/* ===================================================================== */

/**
 * Antetítulo: chip pequeño con punto verde, en caja normal. Sustituye a las
 * versalitas espaciadas del sistema anterior, que era lo que más envejecía la
 * página al repetirse en cada bloque.
 */
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
      className={`inline-flex items-center gap-2 rounded-capsula py-1.5 pl-2.5 pr-3.5 text-[13px] font-medium ${
        tono === "oscuro"
          ? "bg-relleno-claro text-acero-200"
          : "bg-relleno text-acero-600"
      } ${className}`}
    >
      <span aria-hidden="true" className="size-2 shrink-0 rounded-capsula bg-verde-500" />
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
      className={`text-balance font-semibold leading-[1.08] ${
        Etiqueta === "h1"
          ? "text-[2.25rem] sm:text-5xl lg:text-[3.5rem]"
          : "text-[1.75rem] sm:text-[2.125rem] lg:text-[2.5rem]"
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
      className={`max-w-[66ch] text-[1.0625rem] leading-[1.65] sm:text-[1.125rem] ${
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
      className={`space-y-4 text-[1.0625rem] leading-[1.7] ${
        tono === "oscuro" ? "text-acero-200" : "text-acero-700"
      } ${className}`}
    >
      {textos.map((texto, indice) => (
        <p key={indice} className="max-w-[70ch]">
          {texto}
        </p>
      ))}
    </div>
  );
}

/* ===================================================================== */
/* Tarjeta                                                                */
/* ===================================================================== */

/**
 * Tarjeta blanca elevada: la superficie base de todo el sitio. `elevable`
 * añade el levantamiento al pasar el puntero (solo donde la tarjeta entera es
 * un enlace).
 */
export function Tarjeta({
  children,
  className = "",
  elevable = false,
  as: Etiqueta = "div",
}: {
  children: ReactNode;
  className?: string;
  elevable?: boolean;
  as?: "div" | "article" | "li" | "section";
}) {
  return (
    <Etiqueta
      className={`rounded-tarjeta bg-blanco shadow-tarjeta ${
        elevable
          ? "transition-[transform,box-shadow] duration-300 ease-ios hover:-translate-y-1 hover:shadow-elevada"
          : ""
      } ${className}`}
    >
      {children}
    </Etiqueta>
  );
}

/* ===================================================================== */
/* Botones y enlaces de acción                                            */
/* ===================================================================== */

/**
 * ARMONÍA DE LOS GRUPOS DE BOTONES
 * --------------------------------
 * Un botón suelto se mide por su etiqueta. Dos o más botones juntos son una
 * **estructura**: tienen que compartir alto siempre y, cuando quedan apilados,
 * también ancho. Antes esto se resolvía con `flex-col sm:flex-row sm:flex-wrap`
 * y fallaba justo en el caso más visible: al envolverse, cada línea se
 * dimensionaba por su contenido y quedaban dos cápsulas apiladas de anchos
 * distintos (la franja de cierre a 1440 px).
 *
 * `GrupoDeBotones` lo resuelve con rejilla en vez de flex:
 *  - Apilado (una columna): cada celda ocupa el ancho del grupo → mismo ancho.
 *  - En fila (`grid-flow-col` + `auto-cols-fr` sobre un contenedor `w-fit`):
 *    todas las columnas valen lo que la etiqueta más larga → mismo ancho, y el
 *    grupo entero se encoge a su contenido en vez de estirarse.
 * En ambos casos la altura de la fila la fija el botón más alto y las celdas
 * se estiran, así que el alto también es común.
 *
 * `tamano` mantiene el alto sincronizado entre los botones de un mismo grupo:
 * mezclar `h-12` y `h-13` a mano era la otra fuente de desalineación.
 */
const ALTOS_BOTON = {
  normal: "h-12 px-6 text-[15px]",
  grande: "h-13 px-7 text-[15px] sm:text-base",
} as const;

export type TamanoBoton = keyof typeof ALTOS_BOTON;

/** `whitespace-nowrap`: una cápsula de alto fijo no puede partir su etiqueta. */
const CLASES_BOTON =
  "pulsable group inline-flex shrink-0 items-center justify-center gap-2.5 whitespace-nowrap rounded-capsula text-center font-semibold";

function clasesBoton(tamano: TamanoBoton) {
  return `${CLASES_BOTON} ${ALTOS_BOTON[tamano]}`;
}

/**
 * Grupo de botones. `direccion`:
 *  - `"fila"` (por defecto): apilado en móvil, en fila desde `sm`.
 *  - `"apilada"`: siempre apilado (columnas estrechas, como la franja de
 *    cierre en escritorio, donde dos cápsulas largas no caben en una línea).
 *  - `"fila-hasta-lg"`: en fila entre `sm` y `lg`, apilado otra vez en `lg`.
 *
 * `alinear="fin"` pega el grupo a la derecha sin romper el `w-fit`.
 */
export function GrupoDeBotones({
  children,
  direccion = "fila",
  alinear = "inicio",
  className = "",
}: {
  children: ReactNode;
  direccion?: "fila" | "apilada" | "fila-hasta-lg";
  alinear?: "inicio" | "fin";
  className?: string;
}) {
  const porDireccion = {
    fila: "sm:w-fit sm:grid-flow-col sm:auto-cols-fr",
    apilada: "",
    "fila-hasta-lg":
      "sm:w-fit sm:grid-flow-col sm:auto-cols-fr lg:w-full lg:grid-flow-row lg:auto-cols-auto",
  }[direccion];

  return (
    <div
      data-grupo-botones=""
      className={`grid items-stretch gap-3 ${porDireccion} ${
        alinear === "fin" ? "sm:ml-auto" : ""
      } ${className}`}
    >
      {children}
    </div>
  );
}

/** Botón primario: azul de marca, cápsula con sombra suave. */
export function BotonPrimario({
  href,
  children,
  tamano = "normal",
  className = "",
}: {
  href: string;
  children: ReactNode;
  tamano?: TamanoBoton;
  className?: string;
}) {
  return (
    <Link
      href={href}
      className={`${clasesBoton(tamano)} bg-azul-700 text-blanco shadow-tarjeta hover:bg-azul-600 ${className}`}
    >
      {children}
      <IconoFlecha className="size-4.5 shrink-0 transition-transform duration-300 ease-ios group-hover:translate-x-1" />
    </Link>
  );
}

/**
 * Botón secundario: relleno suave tipo iOS (no contorno duro). Sobre fondo
 * oscuro usa el relleno claro translúcido.
 * Nunca lleva verde: el verde está reservado para WhatsApp.
 */
export function BotonSecundario({
  href,
  children,
  tono = "claro",
  tamano = "normal",
  className = "",
}: {
  href: string;
  children: ReactNode;
  tono?: "claro" | "oscuro";
  tamano?: TamanoBoton;
  className?: string;
}) {
  const clasesTono =
    tono === "oscuro"
      ? "bg-relleno-claro text-blanco hover:bg-azul-800"
      : "bg-relleno-medio text-azul-700 hover:bg-azul-100";
  return (
    <Link href={href} className={`${clasesBoton(tamano)} ${clasesTono} ${className}`}>
      {children}
      <IconoFlecha className="size-4.5 shrink-0 transition-transform duration-300 ease-ios group-hover:translate-x-1" />
    </Link>
  );
}

/**
 * Botón de WhatsApp — el único elemento verde grande del sitio.
 * Texto `azul-950` sobre `verde-500` (6.6:1). Blanco ahí falla (2.9:1).
 */
export function BotonWhatsApp({
  href,
  children = "Escríbanos por WhatsApp",
  tamano = "normal",
  className = "",
}: {
  href: string;
  children?: ReactNode;
  tamano?: TamanoBoton;
  className?: string;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={`${clasesBoton(tamano)} bg-verde-500 text-azul-950 shadow-tarjeta hover:bg-verde-400 ${className}`}
    >
      <IconoWhatsApp className="size-5 shrink-0" />
      {children}
    </a>
  );
}

/** Enlace de texto con flecha en disco, para cierres de sección. */
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
  const oscuro = tono === "oscuro";
  return (
    <Link
      href={href}
      // `w-fit`: en una columna flex, un elemento de ancho `auto` se estira a
      // todo el ancho y la cápsula dejaría de leerse como tal en móvil.
      className={`pulsable group inline-flex w-fit items-center gap-2.5 rounded-capsula py-1.5 pl-4 pr-1.5 text-[15px] font-semibold ${
        oscuro
          ? "bg-relleno-claro text-blanco hover:bg-azul-800"
          : "bg-relleno text-azul-700 hover:bg-relleno-medio"
      } ${className}`}
    >
      {children}
      <span
        aria-hidden="true"
        className={`inline-flex size-8 items-center justify-center rounded-capsula ${
          oscuro ? "bg-azul-700 text-blanco" : "bg-azul-700 text-blanco"
        }`}
      >
        <IconoFlecha className="size-4 transition-transform duration-300 ease-ios group-hover:translate-x-0.5" />
      </span>
    </Link>
  );
}

/* ===================================================================== */
/* Anterior / siguiente entre fichas                                      */
/* ===================================================================== */

/**
 * Par de tarjetas «anterior» y «siguiente» al pie de una ficha. Lo usan las
 * páginas de caso y de servicio: sin ellas cada ficha es un callejón sin
 * salida, tanto para el visitante como para el rastreador.
 *
 * Las dos celdas existen siempre y comparten altura (`h-full` dentro de una
 * rejilla de dos columnas). En la primera y la última ficha falta una de las
 * dos: esa celda no queda vacía —media fila muerta— sino que lleva al listado
 * completo (`etiquetaListado`).
 */
export function NavegacionEntreFichas({
  anterior,
  siguiente,
  etiqueta,
  base,
  etiquetaListado,
}: {
  anterior?: { slug: string; title: string } | null;
  siguiente?: { slug: string; title: string } | null;
  /** Nombre accesible del `nav`: «Navegación entre servicios». */
  etiqueta: string;
  /** Prefijo de la ruta: `/servicios` o `/proyectos`. */
  base: string;
  /** Texto del enlace al listado en la celda que falte: «Todos los servicios». */
  etiquetaListado?: string;
}) {
  if (!anterior && !siguiente) return null;

  const alListado = etiquetaListado ? (
    <Link
      href={base}
      className="pulsable group flex h-full items-center gap-4 rounded-tarjeta bg-relleno p-5 ring-1 ring-separador hover:bg-relleno-medio"
    >
      <span
        aria-hidden="true"
        className="inline-flex size-9 shrink-0 items-center justify-center rounded-capsula bg-blanco text-azul-700"
      >
        <svg viewBox="0 0 16 16" fill="none" className="size-4">
          <path d="M3 4h10M3 8h10M3 12h10" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        </svg>
      </span>
      <span>
        <span className="block text-[13px] text-acero-600">Listado</span>
        <span className="mt-0.5 block text-[1.0625rem] font-semibold leading-tight text-azul-800">
          {etiquetaListado}
        </span>
      </span>
    </Link>
  ) : null;

  return (
    <nav aria-label={etiqueta} className="bg-lienzo">
      <Contenedor className="py-8 lg:py-10">
        <ul className="grid gap-4 sm:grid-cols-2">
          <li>
            {anterior ? (
              <Link
                href={`${base}/${anterior.slug}`}
                className="pulsable group flex h-full items-center gap-4 rounded-tarjeta bg-blanco p-5 shadow-tarjeta hover:shadow-elevada"
              >
                <span
                  aria-hidden="true"
                  className="inline-flex size-9 shrink-0 items-center justify-center rounded-capsula bg-relleno text-azul-700"
                >
                  <IconoFlecha className="size-4 rotate-180 transition-transform duration-300 ease-ios group-hover:-translate-x-0.5" />
                </span>
                <span>
                  <span className="block text-[13px] text-acero-600">Anterior</span>
                  <span className="mt-0.5 block text-[1.0625rem] font-semibold leading-tight text-azul-950">
                    {anterior.title}
                  </span>
                </span>
              </Link>
            ) : (
              alListado
            )}
          </li>
          <li>
            {siguiente ? (
              <Link
                href={`${base}/${siguiente.slug}`}
                className="pulsable group flex h-full items-center justify-end gap-4 rounded-tarjeta bg-blanco p-5 text-right shadow-tarjeta hover:shadow-elevada"
              >
                <span>
                  <span className="block text-[13px] text-acero-600">Siguiente</span>
                  <span className="mt-0.5 block text-[1.0625rem] font-semibold leading-tight text-azul-950">
                    {siguiente.title}
                  </span>
                </span>
                <span
                  aria-hidden="true"
                  className="inline-flex size-9 shrink-0 items-center justify-center rounded-capsula bg-relleno text-azul-700"
                >
                  <IconoFlecha className="size-4 transition-transform duration-300 ease-ios group-hover:translate-x-0.5" />
                </span>
              </Link>
            ) : (
              alListado
            )}
          </li>
        </ul>
      </Contenedor>
    </nav>
  );
}

/* ===================================================================== */
/* Listas                                                                 */
/* ===================================================================== */

/**
 * Lista agrupada tipo iOS para los alcances de un servicio: tarjeta blanca con
 * separadores internos, marca verde de verificación y dos columnas desde `sm`.
 * En dos columnas los separadores se dibujan con `border` por celda para que
 * no quede una línea suelta al final de cada columna.
 */
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
  const oscuro = tono === "oscuro";
  // Con un número impar de ítems, el último ocupa las dos columnas: si no,
  // queda media tarjeta vacía abajo a la derecha y se lee como un error.
  const impar = items.length % 2 === 1;

  return (
    <ul
      className={`grid overflow-hidden rounded-tarjeta sm:grid-cols-2 ${
        oscuro ? "bg-azul-900/60 ring-1 ring-separador-claro" : "bg-blanco shadow-tarjeta"
      } ${className}`}
    >
      {items.map((item, indice) => (
        <li
          key={item}
          className={`flex items-start gap-3 border-t px-5 py-4 text-[15px] leading-snug first:border-t-0 sm:even:border-l sm:[&:nth-child(2)]:border-t-0 ${
            oscuro
              ? "border-separador-claro text-acero-200"
              : "border-separador text-azul-900"
          } ${impar && indice === items.length - 1 ? "sm:col-span-2" : ""}`}
        >
          <span
            aria-hidden="true"
            className="mt-0.5 inline-flex size-5 shrink-0 items-center justify-center rounded-capsula bg-verde-100 text-verde-700"
          >
            <svg viewBox="0 0 16 16" fill="none" className="size-3">
              <path
                d="M3.5 8.5l3 3 6-7"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </span>
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}
