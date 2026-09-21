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
 *
 * SISTEMA v3 (iOS): la paleta no cambió. Lo que cambió es la piel — radios
 * generosos, superficies agrupadas, materiales translúcidos y sombras en
 * capas con tinte azul. Los tokens nuevos se derivan de los colores de arriba,
 * nunca de valores sueltos.
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
  /**
   * Aviso — NO es un color de marca ni un estado de error. Es el gris acero
   * llevado a neutro cálido (mismo claro, sin la componente azul) para que un
   * aviso no se confunda con una tarjeta de información, que va en azul. Sin
   * naranja ni ámbar: no están en el logo. El borde y el icono propios
   * terminan de separarlo. `aviso700` sobre `aviso50` da 7.6:1.
   */
  aviso: {
    50: "#F0EEEA",
    200: "#D6D1C8",
    500: "#8A8377",
    700: "#4A453C",
  },
  blanco: "#FFFFFF",
  /**
   * Fondo agrupado tipo iOS: gris-azulado muy claro sobre el que flotan las
   * tarjetas blancas. Es el color de `body`; el blanco queda para las tarjetas.
   */
  lienzo: "#EEF2F9",
} as const;

/** Los seis roles de la paleta. */
export const roles = {
  /** Fondos oscuros (paneles nocturnos, pie de página, franjas de cierre). */
  baseOscura: colores.azul[950],
  /** Fondo agrupado del sitio: sobre él flotan las tarjetas blancas. */
  baseClara: colores.lienzo,
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
  /**
   * Una sola familia para todo, como en iOS con SF Pro: Geist, un grotesco
   * moderno de eje variable, altura de x alta y aperturas cerradas. Reemplaza
   * a Barlow Condensed (lo condensado era parte de lo que se veía antiguo).
   */
  titulos: { familia: "Geist", variableCss: "--font-geist" },
  texto: { familia: "Geist", variableCss: "--font-geist" },
} as const;

/**
 * Radios — esquinas continuas y generosas. `fino` y `medio` quedan por
 * compatibilidad con pantallas que todavía no migraron; no usarlos en nuevo.
 */
export const radios = {
  /** @deprecated heredado del sistema v2 */
  fino: "2px",
  /** @deprecated heredado del sistema v2 */
  medio: "4px",
  chip: "10px",
  control: "12px",
  campo: "14px",
  tarjeta: "20px",
  panel: "28px",
  lienzo: "36px",
  capsula: "999px",
} as const;

/** Sombras en capas, muy difusas y con tinte azul noche. Nunca negro puro. */
export const sombras = {
  sutil: "0 1px 2px rgb(6 20 47 / 0.04), 0 1px 1px rgb(6 20 47 / 0.03)",
  tarjeta:
    "0 1px 2px rgb(6 20 47 / 0.04), 0 6px 16px -6px rgb(6 20 47 / 0.10), 0 20px 40px -24px rgb(6 20 47 / 0.14)",
  elevada:
    "0 2px 4px rgb(6 20 47 / 0.05), 0 12px 28px -8px rgb(6 20 47 / 0.14), 0 36px 60px -32px rgb(6 20 47 / 0.22)",
  flotante:
    "0 1px 1px rgb(6 20 47 / 0.04), 0 8px 24px -8px rgb(6 20 47 / 0.16), 0 28px 48px -28px rgb(6 20 47 / 0.24)",
} as const;

/**
 * Rellenos translúcidos tipo iOS. Se usan para chips, cápsulas tintadas y sus
 * estados: `fuerte` es el `hover`. Translúcidos a propósito — un `azul-100`
 * opaco tapa el material que tenga debajo.
 */
export const rellenos = {
  suave: "rgb(18 59 148 / 0.05)",
  medio: "rgb(18 59 148 / 0.08)",
  fuerte: "rgb(18 59 148 / 0.14)",
  sobreOscuro: "rgb(255 255 255 / 0.07)",
} as const;

/** Escala de titulares, para no escribir `text-[2rem]` a mano. */
export const titulares = {
  xs: "1.25rem",
  sm: "1.5rem",
  md: "1.75rem",
  lg: "2rem",
  xl: "2.5rem",
  "2xl": "3.5rem",
} as const;

/** Materiales translúcidos (con respaldo opaco donde no hay backdrop-filter). */
export const materiales = {
  claro: "rgb(255 255 255 / 0.72)",
  claroFuerte: "rgb(255 255 255 / 0.88)",
  oscuro: "rgb(6 20 47 / 0.72)",
  desenfoque: "20px",
  saturacion: "180%",
} as const;

/** Curvas tipo resorte de iOS. */
export const curvas = {
  ios: "cubic-bezier(0.2, 0.8, 0.2, 1)",
  suave: "cubic-bezier(0.32, 0.72, 0, 1)",
} as const;

export const layout = {
  anchoMaximo: "80rem",
  /** Ancho de la cápsula flotante del nav. */
  anchoNav: "68.75rem",
  gutterMovil: "16px",
} as const;
