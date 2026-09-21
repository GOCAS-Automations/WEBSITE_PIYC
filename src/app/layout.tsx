/**
 * LAYOUT RAÍZ — lo mínimo que comparten el sitio público, el panel y el portal.
 *
 * Aquí solo va lo que TODOS necesitan: el idioma, las tipografías, la metadata
 * base y el `metadataBase` que resuelve los canonical relativos de cada página.
 *
 * El encabezado, el pie, el botón de WhatsApp y el JSON-LD del sitio viven en
 * `src/app/(sitio)/layout.tsx`: el panel no debe heredar nada de eso.
 */

import type { Metadata, Viewport } from "next";
import { Barlow_Condensed, IBM_Plex_Sans } from "next/font/google";
import "./globals.css";
import { colores } from "@/lib/tokens";
import { seoEstatico } from "@/data/ajustes";
import { urlSitio } from "@/lib/seo";

// Títulos: condensada de señalética industrial.
const barlow = Barlow_Condensed({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  display: "swap",
  variable: "--font-barlow",
});

// Texto: sans de ingeniería, legible en párrafos y datos técnicos.
const plex = IBM_Plex_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  display: "swap",
  variable: "--font-plex",
});

/**
 * La metadata base es estática a propósito: se evalúa en el build y no puede
 * depender de una consulta. Los títulos y descripciones por página sí salen de
 * `site_settings.seo` (ver `src/lib/seo.ts`).
 */
export const metadata: Metadata = {
  metadataBase: new URL(urlSitio()),
  title: {
    default: seoEstatico.defaultTitle ?? "PIYC",
    template: seoEstatico.titleTemplate ?? "%s | PIYC",
  },
  description: seoEstatico.defaultDescription,
  applicationName: "PIYC",
  authors: [{ name: "PIYC — Programación Industrial y Control S.A.S." }],
  creator: "GOCAS",
  formatDetection: { telephone: false, address: false, email: false },
  openGraph: {
    type: "website",
    locale: "es_CO",
    siteName: "PIYC — Programación Industrial y Control",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large" },
  },
};

export const viewport: Viewport = {
  themeColor: colores.blanco,
  colorScheme: "light",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es-CO" className={`${barlow.variable} ${plex.variable}`}>
      <body className="min-h-dvh">{children}</body>
    </html>
  );
}
