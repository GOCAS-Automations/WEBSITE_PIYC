/**
 * SITEMAP — `/sitemap.xml`
 *
 * Se genera desde la capa de contenido, así que incluye los slugs reales de
 * servicios y proyectos (de Supabase, o del respaldo estático si la base no
 * responde: mejor un sitemap con los slugs de respaldo que ninguno).
 *
 * Se regenera con el mismo ISR que el sitio.
 */

import type { MetadataRoute } from "next";
import { getProyectos, getServicios } from "@/lib/content";
import { urlAbsoluta } from "@/lib/seo";

export const revalidate = 300;

/**
 * `updated_at` de la fila, si la base lo trajo. Una fecha inválida (o el
 * respaldo estático, que no tiene columna) cae a la fecha de generación: un
 * `lastModified` inventado es peor que uno aproximado, pero vacío es peor aún.
 */
function fechaDe(valor: string | null | undefined, respaldo: Date): Date {
  if (!valor) return respaldo;
  const fecha = new Date(valor);
  return Number.isNaN(fecha.getTime()) ? respaldo : fecha;
}

/** La más reciente de una lista de fechas, para los hubs. */
function masReciente(fechas: Date[], respaldo: Date): Date {
  const valida = fechas.filter((fecha) => !Number.isNaN(fecha.getTime()));
  if (valida.length === 0) return respaldo;
  return new Date(Math.max(...valida.map((fecha) => fecha.getTime())));
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [servicios, proyectos] = await Promise.all([getServicios(), getProyectos()]);
  const ahora = new Date();

  const fechasServicios = servicios.map((servicio) => fechaDe(servicio.updatedAt, ahora));
  const fechasProyectos = proyectos.map((proyecto) => fechaDe(proyecto.updatedAt, ahora));

  const fijas: MetadataRoute.Sitemap = [
    { url: urlAbsoluta("/"), lastModified: ahora, changeFrequency: "monthly", priority: 1 },
    {
      url: urlAbsoluta("/servicios"),
      lastModified: masReciente(fechasServicios, ahora),
      changeFrequency: "monthly",
      priority: 0.9,
    },
    {
      url: urlAbsoluta("/proyectos"),
      lastModified: masReciente(fechasProyectos, ahora),
      changeFrequency: "monthly",
      priority: 0.8,
    },
    { url: urlAbsoluta("/nosotros"), lastModified: ahora, changeFrequency: "yearly", priority: 0.6 },
    { url: urlAbsoluta("/contacto"), lastModified: ahora, changeFrequency: "yearly", priority: 0.7 },
  ];

  return [
    ...fijas,
    ...servicios.map((servicio, indice) => ({
      url: urlAbsoluta(`/servicios/${servicio.slug}`),
      lastModified: fechasServicios[indice],
      changeFrequency: "monthly" as const,
      priority: 0.8,
    })),
    ...proyectos.map((proyecto, indice) => ({
      url: urlAbsoluta(`/proyectos/${proyecto.slug}`),
      lastModified: fechasProyectos[indice],
      changeFrequency: "yearly" as const,
      priority: 0.6,
    })),
  ];
}
