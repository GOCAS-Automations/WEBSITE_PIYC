import type { SVGProps } from "react";

/**
 * ICONOS DEL PANEL
 * ================
 * Trazo de 1.6 px y remates **cuadrados**: es el mismo lenguaje del plano
 * técnico que usa el sitio público de PIYC, no la línea redondeada de las
 * librerías de moda (regla 13: el panel tampoco puede parecerse al de GPI).
 *
 * Módulo sin `"use client"` a propósito: son componentes puros sin estado, así
 * que los puede usar por igual un Server Component y uno de cliente. Por eso NO
 * viven en `ui.tsx` — arrastrar `ui.tsx` al navegador rompe las server actions
 * en producción (regla 1).
 */

type PropsIcono = SVGProps<SVGSVGElement>;

const base = {
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.6,
  strokeLinecap: "square",
  strokeLinejoin: "miter",
  "aria-hidden": true,
  focusable: false,
} as const;

/** Dashboard: un tablero de instrumentos. */
export function IconoTablero(props: PropsIcono) {
  return (
    <svg {...base} {...props}>
      <path d="M3 4h7v7H3zM14 4h7v4h-7zM14 11h7v9h-7zM3 14h7v6H3z" />
    </svg>
  );
}

/** Contenido del sitio: hojas apiladas. */
export function IconoCapas(props: PropsIcono) {
  return (
    <svg {...base} {...props}>
      <path d="M12 3 3 8l9 5 9-5-9-5z" />
      <path d="M3 13l9 5 9-5M3 17.5l9 5 9-5" />
    </svg>
  );
}

/** Equipo: dos personas. */
export function IconoEquipo(props: PropsIcono) {
  return (
    <svg {...base} {...props}>
      <circle cx="9" cy="8" r="3.2" />
      <path d="M3 20v-1.5C3 16 5.7 14.5 9 14.5s6 1.5 6 4V20" />
      <path d="M16.5 5.6a3.2 3.2 0 0 1 0 6.3M17 14.7c2.4.4 4 1.8 4 3.8V20" />
    </svg>
  );
}

/** Jornadas: un reloj. */
export function IconoReloj(props: PropsIcono) {
  return (
    <svg {...base} {...props}>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5.2l3.4 2" />
    </svg>
  );
}

/** Inicio del sitio. */
export function IconoInicio(props: PropsIcono) {
  return (
    <svg {...base} {...props}>
      <path d="M3.5 10.5 12 3.5l8.5 7M5.5 9.5V20h13V9.5" />
      <path d="M10 20v-5.5h4V20" />
    </svg>
  );
}

/** Servicios: engranaje. */
export function IconoEngranaje(props: PropsIcono) {
  return (
    <svg {...base} {...props}>
      <circle cx="12" cy="12" r="3.2" />
      <path d="M12 2.5v3M12 18.5v3M2.5 12h3M18.5 12h3M5.2 5.2l2.1 2.1M16.7 16.7l2.1 2.1M18.8 5.2l-2.1 2.1M7.3 16.7l-2.1 2.1" />
    </svg>
  );
}

/** Proyectos / fotos. */
export function IconoFoto(props: PropsIcono) {
  return (
    <svg {...base} {...props}>
      <rect x="3" y="5" width="18" height="14" />
      <path d="m3 16 5-4 4 3 3-2.5 6 4.5" />
      <circle cx="8.5" cy="9.5" r="1.4" />
    </svg>
  );
}

/** Valores: escudo. */
export function IconoEscudo(props: PropsIcono) {
  return (
    <svg {...base} {...props}>
      <path d="M12 3 4.5 6v5.5c0 4.6 3.1 8 7.5 9.5 4.4-1.5 7.5-4.9 7.5-9.5V6L12 3z" />
    </svg>
  );
}

/** Páginas / documentos. */
export function IconoDocumento(props: PropsIcono) {
  return (
    <svg {...base} {...props}>
      <path d="M6 3h8l4 4v14H6z" />
      <path d="M14 3v4h4M9 12h6M9 16h6" />
    </svg>
  );
}

/** Ajustes: deslizadores. */
export function IconoAjustes(props: PropsIcono) {
  return (
    <svg {...base} {...props}>
      <path d="M4 7h16M4 12h16M4 17h16" />
      <path d="M9 4.5v5M15.5 9.5v5M7 14.5v5" />
    </svg>
  );
}

/** Mensajes / leads: un sobre. */
export function IconoSobre(props: PropsIcono) {
  return (
    <svg {...base} {...props}>
      <rect x="3" y="5" width="18" height="14" />
      <path d="m3 6 9 6.5L21 6" />
    </svg>
  );
}

export function IconoFlecha(props: PropsIcono) {
  return (
    <svg {...base} {...props}>
      <path d="M4 12h15M13 6l6 6-6 6" />
    </svg>
  );
}

export function IconoSalir(props: PropsIcono) {
  return (
    <svg {...base} {...props}>
      <path d="M14 4H5v16h9" />
      <path d="M17 8.5 20.5 12 17 15.5M20 12H9.5" />
    </svg>
  );
}

export function IconoMas(props: PropsIcono) {
  return (
    <svg {...base} {...props}>
      <path d="M12 5v14M5 12h14" />
    </svg>
  );
}

export function IconoLapiz(props: PropsIcono) {
  return (
    <svg {...base} {...props}>
      <path d="M4 20h4.5L20 8.5 15.5 4 4 15.5V20z" />
      <path d="m14 5.5 4.5 4.5" />
    </svg>
  );
}

export function IconoPapelera(props: PropsIcono) {
  return (
    <svg {...base} {...props}>
      <path d="M4 6.5h16M9.5 6.5V4h5v2.5" />
      <path d="M6.5 6.5 7.5 20h9l1-13.5M10.5 10v6M13.5 10v6" />
    </svg>
  );
}

export function IconoCheck(props: PropsIcono) {
  return (
    <svg {...base} {...props}>
      <path d="m4.5 12.5 5 5L20 7" />
    </svg>
  );
}

export function IconoSubir(props: PropsIcono) {
  return (
    <svg {...base} {...props}>
      <path d="M12 16V4M7.5 8.5 12 4l4.5 4.5" />
      <path d="M4 15v5h16v-5" />
    </svg>
  );
}

export function IconoInfo(props: PropsIcono) {
  return (
    <svg {...base} {...props}>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 11v6" />
      <path d="M12 7.6v.9" strokeWidth={2} />
    </svg>
  );
}

export function IconoCandado(props: PropsIcono) {
  return (
    <svg {...base} {...props}>
      <rect x="4.5" y="10" width="15" height="10" />
      <path d="M8 10V7.5a4 4 0 0 1 8 0V10" />
    </svg>
  );
}

export function IconoUsuario(props: PropsIcono) {
  return (
    <svg {...base} {...props}>
      <circle cx="12" cy="8" r="3.5" />
      <path d="M4.5 20v-1.5c0-2.8 3.4-4.5 7.5-4.5s7.5 1.7 7.5 4.5V20" />
    </svg>
  );
}

export function IconoCalendario(props: PropsIcono) {
  return (
    <svg {...base} {...props}>
      <rect x="3.5" y="5" width="17" height="15" />
      <path d="M3.5 9.5h17M8 3v4M16 3v4" />
    </svg>
  );
}

export function IconoChevronAbajo(props: PropsIcono) {
  return (
    <svg {...base} {...props}>
      <path d="m6 9 6 6 6-6" />
    </svg>
  );
}

export function IconoChevronIzquierda(props: PropsIcono) {
  return (
    <svg {...base} {...props}>
      <path d="m14.5 5-7 7 7 7" />
    </svg>
  );
}

export function IconoChevronDerecha(props: PropsIcono) {
  return (
    <svg {...base} {...props}>
      <path d="m9.5 5 7 7-7 7" />
    </svg>
  );
}

export function IconoWhatsApp(props: PropsIcono) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden focusable="false" {...props}>
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z" />
    </svg>
  );
}

/** Mapa de claves de icono → componente, para los formularios de contenido. */
export const ICONOS_CONTENIDO = {
  plano: IconoDocumento,
  automatizacion: IconoEngranaje,
  tablero: IconoTablero,
  telemetria: IconoReloj,
  telecontrol: IconoAjustes,
  "llave-en-mano": IconoCapas,
  aplicaciones: IconoCapas,
  refrigeracion: IconoEscudo,
  clima: IconoEscudo,
  integridad: IconoEscudo,
  compromiso: IconoCheck,
  cliente: IconoEquipo,
  innovacion: IconoEngranaje,
} as const;
