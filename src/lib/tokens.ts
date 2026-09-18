/**
 * Tokens de diseño de PIYC — fuente de verdad para usar desde JS
 * (imágenes OG, theme-color, manifest, correos, etc.).
 *
 * ⚠ SE TOCAN JUNTOS: los mismos valores viven en `src/app/globals.css`
 * dentro de `@theme`. Si cambias uno, cambia el otro en el mismo commit.
 *
 * Paleta derivada del logo (azul #103A93, gris acero del engranaje).
 * El verde del logo NO se usa en la interfaz: queda solo dentro del logo.
 */

export const colores = {
  /** Base oscura: grafito con tinte azul. Texto principal y fondos oscuros. */
  grafito: {
    950: "#0B1322",
    900: "#121C2E",
    800: "#1B2740",
    700: "#26334A",
  },
  /** Acento de marca: azul PIYC tomado del logo (700). */
  azul: {
    50: "#EEF2FB",
    100: "#DCE5F8",
    300: "#93AEF0",
    700: "#103A93",
    800: "#0B2B70",
  },
  /** Base clara (50) y neutros medios (200–600) inspirados en el engranaje. */
  acero: {
    50: "#F3F5F8",
    100: "#E7EBF0",
    200: "#D3D9E2",
    400: "#9AA5B5",
    600: "#566172",
  },
  /** Estado / señal: naranja de seguridad. CTA de WhatsApp, indicadores, foco. */
  naranja: {
    500: "#F26A1B",
    600: "#DB5810",
    700: "#A8430A",
  },
  blanco: "#FFFFFF",
} as const;

/** Los cinco roles de la paleta. */
export const roles = {
  baseOscura: colores.grafito[950],
  baseClara: colores.acero[50],
  acento: colores.azul[700],
  neutroMedio: colores.acero[600],
  estado: colores.naranja[500],
} as const;

export const fuentes = {
  /** Títulos: condensada de señalética industrial, eco del subtítulo del logo. */
  titulos: { familia: "Barlow Condensed", variableCss: "--font-barlow" },
  /** Texto: sans de ingeniería, muy legible en párrafos y datos. */
  texto: { familia: "IBM Plex Sans", variableCss: "--font-plex" },
} as const;

/** Radios: bordes casi rectos. Nada de tarjetas redondeadas. */
export const radios = {
  ninguno: "0px",
  fino: "2px",
  medio: "4px",
} as const;

export const layout = {
  anchoMaximo: "80rem",
  gutterMovil: "16px",
} as const;
