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
 * Cuántas columnas usar para N tarjetas sin dejar una huérfana suelta.
 * (Con tarjetas separadas ya no hay celdas grises, pero una fila con una sola
 * tarjeta sigue leyéndose mal: 4 → 2 columnas.)
 */
export function columnasParaCantidad(cantidad: number): 2 | 3 {
  if (cantidad % 3 === 0) return 3;
  if (cantidad % 2 === 0) return 2;
  return cantidad > 3 ? 3 : 2;
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

export function TarjetaProyecto({
  proyecto,
  prioritaria = false,
}: {
  proyecto: Proyecto;
  prioritaria?: boolean;
}) {
  return (
    <article className="group relative flex flex-col overflow-hidden rounded-tarjeta bg-blanco shadow-tarjeta transition-[transform,box-shadow] duration-300 ease-ios hover:-translate-y-1 hover:shadow-elevada">
      {proyecto.images.cover ? (
        <div className="p-2 pb-0">
          <ContentImage
            src={proyecto.images.cover}
            alt={proyecto.images.coverAlt ?? ""}
            proporcion="aspect-[16/10]"
            prioritaria={prioritaria}
            claseContenedor="rounded-chip"
          />
        </div>
      ) : null}

      <div className="flex flex-1 flex-col gap-2.5 p-5 lg:p-6">
        {proyecto.client ? (
          <p className="text-[13px] font-medium text-acero-600">{proyecto.client}</p>
        ) : null}

        <h3 className="text-[1.1875rem] font-semibold leading-tight text-azul-950">
          <Link
            href={`/proyectos/${proyecto.slug}`}
            className="after:absolute after:inset-0 after:content-['']"
          >
            {proyecto.title}
          </Link>
        </h3>

        {proyecto.description ? (
          <p className="text-[15px] leading-relaxed text-acero-600">{proyecto.description}</p>
        ) : null}

        <span className="mt-auto inline-flex items-center gap-2 pt-3 text-sm font-semibold text-azul-700">
          Ver el caso
          <IconoFlecha className="size-4 transition-transform duration-300 ease-ios group-hover:translate-x-1" />
        </span>
      </div>
    </article>
  );
}

export function RejillaDeProyectos({
  proyectos,
  columnas = 3,
  prioritariaLaPrimera = false,
}: {
  proyectos: readonly Proyecto[];
  columnas?: 2 | 3;
  prioritariaLaPrimera?: boolean;
}) {
  if (proyectos.length === 0) return null;

  return (
    <div
      className={`grid gap-4 lg:gap-5 ${columnas === 2 ? "sm:grid-cols-2" : "sm:grid-cols-2 lg:grid-cols-3"}`}
    >
      {proyectos.map((proyecto, indice) => (
        <TarjetaProyecto
          key={proyecto.slug}
          proyecto={proyecto}
          prioritaria={prioritariaLaPrimera && indice === 0}
        />
      ))}
    </div>
  );
}
