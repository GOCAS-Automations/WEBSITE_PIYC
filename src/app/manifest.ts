/**
 * MANIFEST — `/manifest.webmanifest`
 *
 * El sitio no es una PWA: el manifest está para el icono y el color de la
 * barra cuando alguien lo guarda en la pantalla de inicio del teléfono.
 * Los colores salen de `src/lib/tokens.ts` — ninguno escrito a mano.
 */

import type { MetadataRoute } from "next";
import { colores } from "@/lib/tokens";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "PIYC — Programación Industrial y Control S.A.S.",
    short_name: "PIYC",
    description:
      "Automatización de procesos, tableros de control e ingeniería eléctrica industrial en Cali, Valle del Cauca.",
    start_url: "/",
    display: "standalone",
    background_color: colores.blanco,
    theme_color: colores.azul[700],
    lang: "es-CO",
    icons: [
      { src: "/icon.png", sizes: "any", type: "image/png" },
      { src: "/apple-icon.png", sizes: "180x180", type: "image/png" },
    ],
  };
}
