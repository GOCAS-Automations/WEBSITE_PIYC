/**
 * Tokens de diseño de PIYC — fuente de verdad para usar desde JS
 * (imágenes OG, theme-color, manifest, correos, etc.).
 *
 * ⚠ SE TOCAN JUNTOS: los mismos valores viven en `src/app/globals.css`
 * dentro de `@theme`. Si cambias uno, cambia el otro en el mismo commit.
 *
 * Toda la paleta sale del logo (`public/brand/logo-piyc.png`), medido pixel
 * a pixel: azul #123B94 (letras «PI», «C» y engranaje), verde #52AC26 (la «Y»
 * y los nodos del circuito) y gris acero #BFC4CD (el engranaje).
 * El sitio se lee AZUL; el verde es acento, en dosis pequeñas. Sin naranja.
 */

export const colores = {
  /**
   * Azul PIYC — color dominante. El 700 es el del logo; el 950/900 son el
   * mismo tono llevado a noche y sirven de fondo oscuro (nada de grafito
   * neutro), y del 300 para abajo son tintes de superficie.
   */
  azul: {
    50: "#F0F4FD",
    100: "#DFE8FB",
    200: "#C2D4F8",
    300: "#8FB1F2",
    500: "#2C63D4",
    600: "#1A4CB6",
    700: "#123B94",
    800: "#0C2A6B",
    900: "#0A2350",
    950: "#06142F",
  },
  /**
   * Verde PIYC — acento, ~10 % de la superficie: CTA de WhatsApp, indicadores,
   * señal energizada. El 500 es el del logo (texto oscuro encima, nunca
   * blanco: 2.88:1). Para texto verde sobre claro va el 700; sobre fondo
   * oscuro, el 300/400.
   */
  verde: {
    100: "#E5F6D9",
    300: "#A3DC80",
    400: "#77C64B",
    500: "#52AC26",
    600: "#3A801A",
    700: "#2C6314",
  },
  /** Gris acero frío del engranaje (el 300 es el medido). Neutros y bordes. */
  acero: {
    50: "#F4F6F9",
    100: "#E9EDF2",
    200: "#D7DCE4",
    300: "#BFC4CD",
    400: "#99A2B0",
    500: "#727C8B",
    600: "#56606E",
    700: "#3B434F",
  },
  /** Error — solo validación de formularios. No es un color de marca. */
  error: {
    50: "#FEF3F2",
    300: "#F4A8A0",
    500: "#B42318",
    700: "#8E1C14",
  },
  blanco: "#FFFFFF",
} as const;

/** Los seis roles de la paleta. */
export const roles = {
  /** Fondos oscuros (barra de datos, paneles técnicos). */
  baseOscura: colores.azul[950],
  /** Fondos claros con retícula de plano. */
  baseClara: colores.acero[50],
  /** Marca: botones primarios, enlaces, titulares destacados. */
  marca: colores.azul[700],
  /** Acento: WhatsApp, indicadores, señal activa. Dosis pequeñas. */
  acento: colores.verde[500],
  /** Texto secundario y bordes. */
  neutroMedio: colores.acero[600],
  /** Estado de error en formularios. */
  error: colores.error[500],
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
