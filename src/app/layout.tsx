import type { Metadata, Viewport } from "next";
import { Barlow_Condensed, IBM_Plex_Sans } from "next/font/google";
import "./globals.css";
import { Encabezado } from "@/components/layout/Encabezado";
import { colores } from "@/lib/tokens";

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

const urlSitio = process.env.NEXT_PUBLIC_SITE_URL || "https://piycsas.com";

export const metadata: Metadata = {
  metadataBase: new URL(urlSitio),
  title: {
    default: "PIYC — Automatización industrial e ingeniería eléctrica en Cali",
    template: "%s | PIYC",
  },
  description:
    "Automatización de procesos con PLC y HMI/SCADA, tableros de control y potencia, telemetría y proyectos eléctricos llave en mano en Cali, Valle del Cauca.",
  applicationName: "PIYC",
  openGraph: {
    type: "website",
    locale: "es_CO",
    siteName: "PIYC — Programación Industrial y Control",
  },
};

export const viewport: Viewport = {
  themeColor: colores.blanco,
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es-CO" className={`${barlow.variable} ${plex.variable}`}>
      <body className="min-h-dvh">
        <a
          href="#contenido"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:bg-grafito-950 focus:px-4 focus:py-2 focus:text-blanco"
        >
          Saltar al contenido
        </a>
        <Encabezado />
        {children}
      </body>
    </html>
  );
}
