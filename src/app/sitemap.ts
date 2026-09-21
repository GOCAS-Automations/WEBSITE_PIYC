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

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [servicios, proyectos] = await Promise.all([getServicios(), getProyectos()]);
  const ahora = new Date();

  const fijas: MetadataRoute.Sitemap = [
    { url: urlAbsoluta("/"), lastModified: ahora, changeFrequency: "monthly", priority: 1 },
    { url: urlAbsoluta("/servicios"), lastModified: ahora, changeFrequency: "monthly", priority: 0.9 },
    { url: urlAbsoluta("/proyectos"), lastModified: ahora, changeFrequency: "monthly", priority: 0.8 },
    { url: urlAbsoluta("/nosotros"), lastModified: ahora, changeFrequency: "yearly", priority: 0.6 },
    { url: urlAbsoluta("/contacto"), lastModified: ahora, changeFrequency: "yearly", priority: 0.7 },
  ];

  return [
    ...fijas,
    ...servicios.map((servicio) => ({
      url: urlAbsoluta(`/servicios/${servicio.slug}`),
      lastModified: ahora,
      changeFrequency: "monthly" as const,
      priority: 0.8,
    })),
    ...proyectos.map((proyecto) => ({
      url: urlAbsoluta(`/proyectos/${proyecto.slug}`),
      lastModified: ahora,
      changeFrequency: "yearly" as const,
      priority: 0.6,
    })),
  ];
}
