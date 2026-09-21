/**
 * ROBOTS — `/robots.txt`
 *
 * El panel, el portal del empleado y las rutas de API no se indexan. No son
 * secretos (eso lo resuelve la RLS y el proxy), pero no aportan nada en
 * resultados de búsqueda y diluyen el presupuesto de rastreo.
 */

import type { MetadataRoute } from "next";
import { urlAbsoluta } from "@/lib/seo";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin", "/mi-cuenta", "/api"],
    },
    sitemap: urlAbsoluta("/sitemap.xml"),
  };
}
