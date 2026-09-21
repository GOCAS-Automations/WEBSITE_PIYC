/**
 * TARJETAS DE SERVICIO Y DE PROYECTO
 * ==================================
 * Sin sombra y sin esquinas redondeadas: la separación la hacen los filetes y
 * la rejilla `gap-px` sobre fondo acero, que produce una retícula continua en
 * vez de fichas flotando (regla 13 de AGENTS.md).
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
  /** Número de orden dentro de la rejilla, como en una lista de planos. */
  numero?: number;
  tono?: "claro" | "oscuro";
}) {
  const oscuro = tono === "oscuro";

  return (
    <article
      className={`group relative flex flex-col gap-4 p-6 transition-colors lg:p-7 ${
        oscuro ? "bg-azul-950 hover:bg-azul-900" : "bg-blanco hover:bg-azul-50"
      }`}
    >
      <div className="flex items-start justify-between gap-4">
        <IconoServicio
          clave={servicio.iconKey}
          className={`size-9 shrink-0 ${oscuro ? "text-azul-300" : "text-azul-700"}`}
        />
        {numero ? (
          <span
            className={`font-titulo text-sm font-semibold tabular-nums ${
              oscuro ? "text-acero-400" : "text-acero-600"
            }`}
          >
            {String(numero).padStart(2, "0")}
          </span>
        ) : null}
      </div>

      <h3
        className={`text-[1.375rem] font-semibold leading-tight ${
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
          oscuro ? "text-azul-300" : "text-azul-700"
        }`}
      >
        Ver el servicio
        <IconoFlecha className="size-4 transition-transform group-hover:translate-x-1" />
      </span>
    </article>
  );
}

/**
 * Cuántas columnas usar para N tarjetas sin dejar huecos.
 *
 * La rejilla enseña su fondo por el `gap-px`, así que una celda vacía se ve
 * como un bloque gris: con 4 tarjetas en 3 columnas queda una huérfana y un
 * hueco. Se prefiere la repartición exacta (4 → 2 columnas).
 */
export function columnasParaCantidad(cantidad: number): 2 | 3 {
  if (cantidad % 3 === 0) return 3;
  if (cantidad % 2 === 0) return 2;
  return cantidad > 3 ? 3 : 2;
}

/** Rejilla de servicios con filete continuo (fondo acero visible en el `gap`). */
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
    <div
      className={`grid gap-px ${clasesColumnas} ${
        tono === "oscuro" ? "bg-azul-800" : "bg-acero-200"
      }`}
    >
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
    <article className="group relative flex flex-col border border-acero-200 bg-blanco transition-colors hover:border-azul-700">
      {proyecto.images.cover ? (
        <div className="border-b border-acero-200 bg-acero-100">
          <ContentImage
            src={proyecto.images.cover}
            alt={proyecto.images.coverAlt ?? ""}
            proporcion="aspect-[16/10]"
            prioritaria={prioritaria}
          />
        </div>
      ) : null}

      <div className="flex flex-1 flex-col gap-3 p-5 lg:p-6">
        {proyecto.client ? (
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-acero-600">
            {proyecto.client}
          </p>
        ) : null}

        <h3 className="text-xl font-semibold leading-tight text-azul-950">
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

        <span className="mt-auto inline-flex items-center gap-2 pt-2 text-sm font-semibold text-azul-700">
          Ver el caso
          <IconoFlecha className="size-4 transition-transform group-hover:translate-x-1" />
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
      className={`grid gap-5 ${columnas === 2 ? "sm:grid-cols-2" : "sm:grid-cols-2 lg:grid-cols-3"}`}
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
