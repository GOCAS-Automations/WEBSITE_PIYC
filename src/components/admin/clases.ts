/**
 * CLASES COMPARTIDAS DEL PANEL — módulo NEUTRO
 * ============================================
 * Solo cadenas de clases de Tailwind. **Sin React, sin `next/*`, sin
 * `"use client"`.**
 *
 * POR QUÉ EXISTE (reglas 1 y 4 de `AGENTS.md`)
 * -------------------------------------------
 * `ui-base.tsx` sí lleva `"use client"`. Un valor exportado desde un módulo de
 * cliente no se puede leer en el servidor: si una página de servidor importara
 * `botonPrimario` de allí recibiría una referencia de cliente, no la cadena.
 * Al vivir aquí, la MISMA constante la pueden usar por igual un Server
 * Component (`app/admin/**`) y uno de cliente, y el panel entero se ve igual
 * sin duplicar ninguna clase.
 *
 * `ui-base.tsx` las reexporta, así que los componentes de cliente que ya
 * importaban de allí siguen funcionando.
 *
 * SISTEMA v3 «iOS»: radios generosos, cápsulas, materiales y sombras difusas de
 * tinte azul. Ningún color ni radio escrito a mano: todo sale de `@theme`
 * (`src/app/globals.css`, espejo de `src/lib/tokens.ts`).
 */

/* ------------------------------------------------------------------ */
/* Campos                                                              */
/* ------------------------------------------------------------------ */

/**
 * Campo relleno tipo iOS: sin filete duro, esquina de 14 px, fondo un escalón
 * por debajo de la tarjeta y **anillo azul** al enfocar (no un borde más
 * grueso: el anillo no desplaza lo que hay alrededor).
 */
export const inputClass =
  "w-full rounded-campo border border-separador bg-lienzo-alto px-3.5 py-2.5 text-[15px] text-azul-950 placeholder:text-acero-400 transition duration-200 ease-ios focus:border-azul-500 focus:bg-blanco focus:outline-none focus:ring-4 focus:ring-azul-700/15";

/** Etiqueta de campo: pequeña y gris, como en Ajustes de iOS. */
export const etiquetaCampo = "mb-2 block text-[13px] font-semibold text-acero-600";

/** Texto de ayuda bajo un campo. */
export const ayudaCampo = "mt-1 block text-xs leading-relaxed text-acero-600";

/**
 * El riel del interruptor: 51×31 px como en iOS, perilla blanca con sombra y
 * verde de marca al encender. El `input` real sigue debajo (accesible).
 */
export const interruptorRiel =
  "peer relative h-[31px] w-[51px] shrink-0 cursor-pointer appearance-none rounded-capsula bg-acero-300 outline-none transition-colors duration-200 ease-ios before:absolute before:left-[2px] before:top-[2px] before:h-[27px] before:w-[27px] before:rounded-capsula before:bg-blanco before:shadow-sutil before:transition-transform before:duration-200 before:ease-ios before:content-[''] checked:bg-verde-500 checked:before:translate-x-5 focus-visible:ring-4 focus-visible:ring-azul-700/25";

/* ------------------------------------------------------------------ */
/* Botones cápsula                                                     */
/* ------------------------------------------------------------------ */

/** Lo común a todos: el hundido al pulsar es el gesto de iOS. */
const botonBase =
  "inline-flex items-center justify-center gap-2 rounded-capsula font-semibold transition duration-200 ease-ios active:scale-[0.97] disabled:pointer-events-none disabled:opacity-50";

/** Botón primario: cápsula azul llena. */
export const botonPrimario = `${botonBase} bg-azul-700 px-5 py-2.5 text-sm text-blanco shadow-sutil hover:bg-azul-600`;

/**
 * Botón secundario: cápsula **tintada** (relleno translúcido de marca). El
 * hover sube al siguiente escalón del mismo relleno —no a un azul opaco—, así
 * el botón sigue dejando ver lo que tiene debajo sobre cualquier superficie.
 */
export const botonSecundario = `${botonBase} bg-relleno-medio px-4 py-2.5 text-sm text-azul-800 hover:bg-relleno-fuerte`;

/**
 * Cápsula azul noche. Para la acción que confirma algo serio pero **no
 * destructivo** (rechazar y devolver una jornada): pesa más que la secundaria
 * sin tomar prestado el rojo, que está reservado a eliminar.
 */
export const botonOscuro = `${botonBase} bg-azul-950 px-4 py-2.5 text-sm text-blanco shadow-sutil hover:bg-azul-900`;

/** Cápsula blanca elevada: acciones sobre fondo agrupado o sobre material. */
export const botonBlanco = `${botonBase} bg-blanco px-4 py-2.5 text-sm text-azul-800 shadow-sutil hover:bg-azul-50`;

/** Botón destructivo suave. `error` es el ÚNICO uso del rojo en la paleta. */
export const botonPeligro = `${botonBase} bg-error-50 px-3.5 py-2 text-xs text-error-500 hover:bg-error-300/40`;

/** Botón destructivo lleno: solo para la confirmación final de un borrado. */
export const botonPeligroFuerte = `${botonBase} bg-error-500 px-4 py-2.5 text-sm text-blanco shadow-sutil hover:bg-error-700`;

/** Cápsula verde de WhatsApp (el verde es el acento, en dosis pequeñas). */
export const botonWhatsApp = `${botonBase} bg-verde-100 px-3.5 py-2 text-xs text-verde-700 hover:bg-verde-300`;

/** Modificador compacto de cualquier cápsula (filas de lista, barras). */
export const botonChico = "px-3.5 py-2 text-xs";

/* ------------------------------------------------------------------ */
/* Superficies y rótulos                                               */
/* ------------------------------------------------------------------ */

/** Tarjeta: blanca, 20 px de radio, sombra difusa azulada. */
export const tarjetaClase = "rounded-tarjeta bg-blanco shadow-tarjeta";

/** Rótulo de grupo, como las cabeceras de Ajustes de iOS. */
export const rotulo = "text-xs font-semibold uppercase tracking-ancho text-acero-500";

/** Titular de sección dentro de una tarjeta. */
export const tituloSeccion = "text-lg font-semibold tracking-titulo text-azul-950";

/* ------------------------------------------------------------------ */
/* Chips                                                               */
/* ------------------------------------------------------------------ */

/** Tintes de chip. Se nombran para que ninguna pantalla los reinvente. */
export const CHIP_NEUTRO = "bg-relleno text-acero-600";
export const CHIP_AZUL = "bg-azul-100 text-azul-800";
export const CHIP_VERDE = "bg-verde-100 text-verde-700";
export const CHIP_ROJO = "bg-error-50 text-error-500";

/* ------------------------------------------------------------------ */
/* Banners                                                             */
/* ------------------------------------------------------------------ */

/**
 * Resultado de una acción: hoja redondeada con tinte, sin filete.
 *
 * `true` = salió bien · `false` = error · `"aviso"` = hay que leerlo antes de
 * seguir. El aviso va en **neutro cálido**, no en el azul de marca: en azul se
 * confundía con la ayuda informativa y se dejaba de leer.
 */
export const banner = (estado: boolean | "aviso") =>
  `rounded-tarjeta px-4 py-3.5 text-sm leading-relaxed ${
    estado === "aviso"
      ? "border border-aviso-200 bg-aviso-50 text-aviso-700"
      : estado
        ? "bg-verde-100 text-verde-700"
        : "bg-error-50 text-error-700"
  }`;
