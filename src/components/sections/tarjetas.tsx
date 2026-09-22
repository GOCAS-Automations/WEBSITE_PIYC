/**
 * TARJETAS DE SERVICIO Y DE PROYECTO
 * ==================================
 * Tarjetas blancas con esquinas continuas y sombra en capas, separadas por
 * espacio real y no por filetes: flotan sobre el lienzo gris-azulado en vez de
 * formar una retícula de plano (sistema v3, regla 13 de AGENTS.md).
 *
 * Las dos tarjetas son **clicables completas**: el `<Link>` cubre la tarjeta
 * con un pseudo-elemento (`after:absolute after:inset-0`) y el título es el
 * texto accesible del enlace. Así no hay un «Leer más» suelto ni enlaces
 * anidados.
 */

import Link from "next/link";
import type { Proyecto, Servicio } from "@/lib/content-types";
import { primeraFotoDe } from "@/lib/content";
import { ContentImage } from "@/components/ui/ContentImage";
import { IconoServicio } from "@/components/ui/iconos-servicio";
import { IconoFlecha } from "@/components/ui/iconos";

/* ===================================================================== */
/* Servicio                                                               */
/* ===================================================================== */

export function TarjetaServicio({
  servicio,
  numero,
  tono = "claro",
}: {
  servicio: Servicio;
  /** Número de orden dentro de la rejilla. */
  numero?: number;
  tono?: "claro" | "oscuro";
}) {
  const oscuro = tono === "oscuro";

  return (
    <article
      className={`group relative flex flex-col gap-4 rounded-tarjeta p-6 transition-[transform,box-shadow,background-color] duration-300 ease-ios hover:-translate-y-1 lg:p-7 ${
        oscuro
          ? "bg-azul-900/50 ring-1 ring-separador-claro hover:bg-azul-900"
          : "bg-blanco shadow-tarjeta hover:shadow-elevada"
      }`}
    >
      <div className="flex items-start justify-between gap-4">
        <span
          className={`inline-flex size-12 shrink-0 items-center justify-center rounded-control ${
            oscuro ? "bg-relleno-claro text-verde-300" : "bg-relleno text-azul-700"
          }`}
        >
          <IconoServicio clave={servicio.iconKey} className="size-6" />
        </span>
        {numero ? (
          <span
            className={`text-[13px] font-semibold tabular-nums ${
              oscuro ? "text-acero-300" : "text-acero-600"
            }`}
          >
            {String(numero).padStart(2, "0")}
          </span>
        ) : null}
      </div>

      <h3
        className={`text-[1.3125rem] font-semibold leading-tight ${
          oscuro ? "text-blanco" : "text-azul-950"
        }`}
      >
        <Link
          href={`/servicios/${servicio.slug}`}
          className="after:absolute after:inset-0 after:content-['']"
        >
          {servicio.navTitle}
        </Link>
      </h3>

      {servicio.summary ? (
        <p
          className={`text-[15px] leading-relaxed ${oscuro ? "text-acero-300" : "text-acero-600"}`}
        >
          {servicio.summary}
        </p>
      ) : null}

      <span
        className={`mt-auto inline-flex items-center gap-2 pt-2 text-sm font-semibold ${
          oscuro ? "text-verde-300" : "text-azul-700"
        }`}
      >
        Ver el servicio
        <IconoFlecha className="size-4 transition-transform duration-300 ease-ios group-hover:translate-x-1" />
      </span>
    </article>
  );
}

/**
 * Miniatura de un servicio: su primera foto, recortada en cuadrado redondeado.
 * Un servicio sin fotos (hoy, aires acondicionados) lleva en su lugar el icono
 * del servicio sobre el degradado de marca: tiene que verse como una pieza
 * gráfica a propósito, no como una foto que falta.
 */
export function MiniaturaServicio({
  servicio,
  className = "size-20",
  evitar,
}: {
  servicio: Servicio;
  className?: string;
  /** URL que ya se ve en grande en la misma pantalla: si coincide, va el icono. */
  evitar?: string;
}) {
  const foto = primeraFotoDe(servicio.images);
  if (foto && foto.src !== evitar) {
    return (
      <ContentImage
        src={foto.src}
        alt=""
        width={foto.width}
        height={foto.height}
        srcMovil={foto.srcMovil}
        sizes="160px"
        proporcion={`shrink-0 ${className}`}
        claseContenedor="rounded-control bg-acero-100 ring-1 ring-separador"
      />
    );
  }
  return (
    <span
      aria-hidden="true"
      className={`sobre-oscuro fondo-noche inline-flex shrink-0 items-center justify-center rounded-control ring-1 ring-separador ${className}`}
    >
      <IconoServicio clave={servicio.iconKey} className="size-9 text-azul-300" strokeWidth={1.4} />
    </span>
  );
}

/**
 * Servicio en fila: miniatura + nombre + resumen + flecha. Es la tarjeta de
 * las líneas del hub y de «otros servicios» en las fichas: más compacta que
 * `TarjetaServicio` y con foto, que es lo que le faltaba al hub (Cesar: «se ve
 * muy pobre solo con cuadros y texto»). Clicable completa.
 */
export function FilaDeServicio({
  servicio,
  numero,
  evitarFoto,
}: {
  servicio: Servicio;
  numero?: number;
  /** URL de la foto grande de la sección: la miniatura no la repite. */
  evitarFoto?: string;
}) {
  return (
    <article className="group relative flex items-center gap-4 rounded-tarjeta bg-blanco p-3 pr-4 shadow-tarjeta ring-1 ring-separador transition-[transform,box-shadow] duration-300 ease-ios hover:-translate-y-0.5 hover:shadow-elevada sm:gap-5 sm:pr-5">
      <MiniaturaServicio servicio={servicio} className="size-20 sm:size-24" evitar={evitarFoto} />
      <div className="min-w-0 flex-1 py-1">
        {numero ? (
          <p className="text-[12px] font-semibold tabular-nums text-acero-600">
            {String(numero).padStart(2, "0")}
          </p>
        ) : null}
        {/* `overflow-wrap: anywhere` y no `break-words`: solo el primero baja el
            ancho MÍNIMO intrínseco del título. Sin él, «Automatización» —14
            caracteres en semibold de 18 px— fijaba un mínimo de 305 px para la
            fila y a 320 px de ventana la página desbordaba 2 px. La palabra
            solo se parte cuando de verdad no cabe; de 360 px para arriba nada
            cambia. */}
        <h3 className="text-[1.125rem] font-semibold leading-snug text-azul-950 [overflow-wrap:anywhere]">
          <Link
            href={`/servicios/${servicio.slug}`}
            className="after:absolute after:inset-0 after:rounded-tarjeta after:content-['']"
          >
            {servicio.navTitle}
          </Link>
        </h3>
        {servicio.summary ? (
          <p className="mt-1 line-clamp-2 text-[14px] leading-snug text-acero-600">
            {servicio.summary}
          </p>
        ) : null}
      </div>
      <span
        aria-hidden="true"
        className="inline-flex size-9 shrink-0 items-center justify-center rounded-capsula bg-relleno text-azul-700 transition-colors duration-300 ease-ios group-hover:bg-azul-700 group-hover:text-blanco"
      >
        <IconoFlecha className="size-4 transition-transform duration-300 ease-ios group-hover:translate-x-0.5" />
      </span>
    </article>
  );
}

/** Rejilla de filas de servicio, sin huérfanas: 1 columna, o 2/3 según la cantidad. */
export function RejillaDeFilasDeServicio({
  servicios,
  columnas = 1,
  numerarDesde,
  evitarFoto,
}: {
  servicios: readonly Servicio[];
  columnas?: 1 | 2 | 3;
  /** Si se da, cada fila lleva su número (continúa la serie entre grupos). */
  numerarDesde?: number;
  /** URL de la foto grande de la sección: ninguna miniatura la repite. */
  evitarFoto?: string;
}) {
  if (servicios.length === 0) return null;
  // Tres por fila solo desde `xl`: en dos columnas, tres filas dejaban una
  // huérfana, y por debajo de `xl` tres no caben con su miniatura.
  const clasesColumnas = { 1: "", 2: "md:grid-cols-2", 3: "xl:grid-cols-3" }[columnas];
  return (
    <ul className={`grid gap-3 ${clasesColumnas}`}>
      {servicios.map((servicio, indice) => (
        <li key={servicio.slug}>
          <FilaDeServicio
            servicio={servicio}
            numero={numerarDesde !== undefined ? numerarDesde + indice + 1 : undefined}
            evitarFoto={evitarFoto}
          />
        </li>
      ))}
    </ul>
  );
}

/** Rejilla de servicios: tarjetas separadas por espacio, no por filetes. */
export function RejillaDeServicios({
  servicios,
  columnas = 3,
  tono = "claro",
  numerar = false,
  desde = 0,
}: {
  servicios: readonly Servicio[];
  columnas?: 2 | 3 | 4;
  tono?: "claro" | "oscuro";
  numerar?: boolean;
  /** Primer número de la serie, para continuar la numeración entre grupos. */
  desde?: number;
}) {
  if (servicios.length === 0) return null;

  const clasesColumnas = {
    2: "sm:grid-cols-2",
    3: "sm:grid-cols-2 lg:grid-cols-3",
    4: "sm:grid-cols-2 lg:grid-cols-4",
  }[columnas];

  return (
    <div className={`grid gap-4 ${clasesColumnas} lg:gap-5`}>
      {servicios.map((servicio, indice) => (
        <TarjetaServicio
          key={servicio.slug}
          servicio={servicio}
          tono={tono}
          numero={numerar ? desde + indice + 1 : undefined}
        />
      ))}
    </div>
  );
}

/* ===================================================================== */
/* Proyecto                                                               */
/* ===================================================================== */

/**
 * Tarjeta de caso. `variante`:
 *  - `"normal"`: foto 16:10 arriba y texto debajo (rejillas).
 *  - `"grande"`: igual, con más aire y título mayor (los destacados del listado).
 *  - `"horizontal"`: foto a la izquierda y texto a la derecha en escritorio
 *    (un destacado solo, a todo el ancho).
 */
export function TarjetaProyecto({
  proyecto,
  prioritaria = false,
  variante = "normal",
}: {
  proyecto: Proyecto;
  prioritaria?: boolean;
  variante?: "normal" | "grande" | "horizontal";
}) {
  const horizontal = variante === "horizontal";
  const grande = variante !== "normal";

  return (
    <article
      className={`group relative flex flex-col overflow-hidden rounded-tarjeta bg-blanco shadow-tarjeta transition-[transform,box-shadow] duration-300 ease-ios hover:-translate-y-1 hover:shadow-elevada ${
        horizontal ? "lg:grid lg:grid-cols-12" : ""
      }`}
    >
      {proyecto.images.cover ? (
        <div className={horizontal ? "p-2 lg:col-span-7 lg:pr-0" : "p-2 pb-0"}>
          <ContentImage
            src={proyecto.images.cover}
            alt={proyecto.images.coverAlt ?? ""}
            sizes={horizontal ? "(min-width: 1024px) 55vw, 100vw" : "(min-width: 1024px) 33vw, 100vw"}
            proporcion={horizontal ? "aspect-[16/10] lg:aspect-auto lg:h-full lg:min-h-[20rem]" : "aspect-[16/10]"}
            prioritaria={prioritaria}
            claseContenedor={grande ? "rounded-control bg-acero-100" : "rounded-chip bg-acero-100"}
          />
        </div>
      ) : null}

      <div
        className={`flex flex-1 flex-col gap-2.5 ${
          grande ? "p-6 lg:p-8" : "p-5 lg:p-6"
        } ${horizontal ? "lg:col-span-5 lg:justify-center" : ""}`}
      >
        {proyecto.client ? (
          <p className="text-[13px] font-medium text-acero-600">{proyecto.client}</p>
        ) : null}

        <h3
          className={`font-semibold leading-tight text-azul-950 ${
            grande ? "text-[1.5rem] lg:text-[1.75rem]" : "text-[1.1875rem]"
          }`}
        >
          <Link
            href={`/proyectos/${proyecto.slug}`}
            className="after:absolute after:inset-0 after:content-['']"
          >
            {proyecto.title}
          </Link>
        </h3>

        {proyecto.description ? (
          <p
            className={`leading-relaxed text-acero-600 ${
              grande ? "text-[1.0625rem]" : "line-clamp-3 text-[15px]"
            }`}
          >
            {proyecto.description}
          </p>
        ) : null}

        <span
          className={`inline-flex items-center gap-2 pt-3 text-sm font-semibold text-azul-700 ${
            horizontal ? "lg:mt-2" : "mt-auto"
          }`}
        >
          Ver el caso
          <IconoFlecha className="size-4 transition-transform duration-300 ease-ios group-hover:translate-x-1" />
        </span>
      </div>
    </article>
  );
}

/**
 * Listado completo de `/proyectos`: primero los destacados, grandes, y luego
 * el resto en una rejilla que se llena sin huérfanas.
 *  - Destacados: 2 si lo que queda es par (6 → 2 + 4), 1 si no (5 → 1 + 4,
 *    7 → 1 + 6). Uno solo va en horizontal, a todo el ancho.
 *  - Resto: 4 columnas si es múltiplo de 4, 3 si lo es de 3, 2 si no.
 */
export function ListadoDeProyectos({ proyectos }: { proyectos: readonly Proyecto[] }) {
  const total = proyectos.length;
  if (total === 0) return null;

  const cuantosDestacados = total <= 2 ? total : total % 2 === 0 ? 2 : 1;
  const destacados = proyectos.slice(0, cuantosDestacados);
  const resto = proyectos.slice(cuantosDestacados);
  // Tres columnas solo desde `lg`: en `sm` (640 px) tres tarjetas con foto
  // quedan de ~187 px y el título se parte en cuatro líneas. Hasta ahí van de
  // dos en dos, que es lo que se ve hoy con seis casos y lo que se verá con
  // siete, nueve o doce.
  const columnasResto =
    resto.length % 4 === 0
      ? "sm:grid-cols-2 lg:grid-cols-4"
      : resto.length % 3 === 0
        ? "sm:grid-cols-2 lg:grid-cols-3"
        : "sm:grid-cols-2";

  return (
    <div className="space-y-5">
      <div className={`grid gap-5 ${destacados.length === 2 ? "md:grid-cols-2" : ""}`}>
        {destacados.map((proyecto) => (
          <TarjetaProyecto
            key={proyecto.slug}
            proyecto={proyecto}
            variante={destacados.length === 1 ? "horizontal" : "grande"}
          />
        ))}
      </div>
      {resto.length > 0 ? (
        <div className={`grid gap-4 lg:gap-5 ${columnasResto}`}>
          {resto.map((proyecto) => (
            <TarjetaProyecto key={proyecto.slug} proyecto={proyecto} />
          ))}
        </div>
      ) : null}
    </div>
  );
}

/**
 * Rejilla de casos. Ninguna tarjeta es prioritaria: en las páginas internas la
 * imagen LCP es la foto de fondo de la cabecera.
 */
export function RejillaDeProyectos({
  proyectos,
  columnas = 3,
}: {
  proyectos: readonly Proyecto[];
  columnas?: 2 | 3;
}) {
  if (proyectos.length === 0) return null;

  // Tres (o seis) casos en tres columnas ya desde tableta: en dos, el tercero
  // quedaba solo en su fila. Por debajo de `md`, una columna.
  const clasesColumnas =
    columnas === 2
      ? "sm:grid-cols-2"
      : proyectos.length % 3 === 0
        ? "md:grid-cols-3"
        : "sm:grid-cols-2 lg:grid-cols-3";

  return (
    <div className={`grid gap-4 lg:gap-5 ${clasesColumnas}`}>
      {proyectos.map((proyecto) => (
        <TarjetaProyecto key={proyecto.slug} proyecto={proyecto} />
      ))}
    </div>
  );
}
