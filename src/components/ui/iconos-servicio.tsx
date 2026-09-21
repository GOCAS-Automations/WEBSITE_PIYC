/**
 * ICONOS DE SERVICIO Y DE VALOR
 * =============================
 * Trazo técnico: línea de 1.6, remates cuadrados, sin relleno. Leen como
 * símbolos de plano, no como iconografía de app — que es justo lo que separa
 * este sitio del de GPI (regla 13 de AGENTS.md).
 *
 * `icon_key` lo escribe el panel: puede llegar cualquier texto, incluso vacío.
 * Por eso `IconoServicio` **nunca falla**: si la clave no está en el mapa,
 * pinta el símbolo genérico.
 */

import type { SVGProps } from "react";

type PropsIcono = SVGProps<SVGSVGElement>;

const base = {
  viewBox: "0 0 32 32",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.6,
  strokeLinecap: "round",
  strokeLinejoin: "round",
  "aria-hidden": true,
  focusable: false,
} as const;

/* --- Servicios -------------------------------------------------------- */

/** Plano: hoja con cajetín y cotas. Diseño e ingeniería eléctrica. */
function IconoPlano(props: PropsIcono) {
  return (
    <svg {...base} {...props}>
      <path d="M4 5h24v22H4z" />
      <path d="M4 22h24M20 22v5" />
      <path d="M8 9h8v8H8z" />
      <path d="M19 9h5M19 13h5M19 17h3" />
    </svg>
  );
}

/** Automatización: PLC con entradas, salidas y señal de control. */
function IconoAutomatizacion(props: PropsIcono) {
  return (
    <svg {...base} {...props}>
      <path d="M10 10h12v12H10z" />
      <path d="M14 14h4v4h-4z" />
      <path d="M10 13H4M10 19H4M22 13h6M22 19h6M13 10V4M19 10V4M13 22v6M19 22v6" />
    </svg>
  );
}

/** Tablero: gabinete con carril, borneras y puerta. */
function IconoTablero(props: PropsIcono) {
  return (
    <svg {...base} {...props}>
      <path d="M5 4h22v24H5z" />
      <path d="M5 11h22M5 19h22" />
      <path d="M9 7v1.5M13 7v1.5M17 7v1.5M21 7v1.5" />
      <path d="M9 14v2M13 14v2M17 14v2M21 14v2" />
      <path d="M24 23v2" />
    </svg>
  );
}

/** Telemetría: sensor en campo que emite una medida hacia arriba. */
function IconoTelemetria(props: PropsIcono) {
  return (
    <svg {...base} {...props}>
      <path d="M8 28h16" />
      <path d="M16 28V17" />
      <circle cx="16" cy="14" r="3" />
      <path d="M10.5 8.5a7.8 7.8 0 0 1 11 0" />
      <path d="M6.5 4.5a13.4 13.4 0 0 1 19 0" />
    </svg>
  );
}

/** Telecontrol: mando remoto sobre un equipo, con retorno de confirmación. */
function IconoTelecontrol(props: PropsIcono) {
  return (
    <svg {...base} {...props}>
      <path d="M3 18h9v9H3z" />
      <path d="M20 5h9v9h-9z" />
      <path d="M12 21h8a4 4 0 0 0 4-4v-3" />
      <path d="M21.5 16.5 24 14l2.5 2.5" />
      <path d="M7.5 18v-4a4 4 0 0 1 4-4H20" />
    </svg>
  );
}

/** Llave en mano: caja de proyecto cerrada con su marca de entrega. */
function IconoLlaveEnMano(props: PropsIcono) {
  return (
    <svg {...base} {...props}>
      <path d="M16 3 28 9v14l-12 6-12-6V9z" />
      <path d="M4 9l12 6 12-6M16 15v14" />
      <path d="M11 18.5 14.5 22l6.5-6.5" />
    </svg>
  );
}

/** Aplicaciones industriales: engranaje sobre un módulo a la medida. */
function IconoAplicaciones(props: PropsIcono) {
  return (
    <svg {...base} {...props}>
      <path d="M4 20h24v8H4z" />
      <path d="M10 24h4M18 24h4" />
      <circle cx="16" cy="10" r="4" />
      <path d="M16 2v3M16 15v1M8.9 5.9 11 8M21 12l2.1 2.1M23.1 5.9 21 8M11 12l-2.1 2.1" />
    </svg>
  );
}

/** Refrigeración: copo de hielo dentro de una cámara. */
function IconoRefrigeracion(props: PropsIcono) {
  return (
    <svg {...base} {...props}>
      <path d="M4 4h24v24H4z" />
      <path d="M16 9v14M10 12l12 8M22 12l-12 8" />
      <path d="M14 10.5 16 9l2 1.5M14 21.5 16 23l2-1.5" />
    </svg>
  );
}

/** Climatización: unidad de aire con flujo de aire frío. */
function IconoClima(props: PropsIcono) {
  return (
    <svg {...base} {...props}>
      <path d="M3 5h26v10H3z" />
      <path d="M3 11h26" />
      <path d="M7 19c0 2 3 2 3 4M14 19c0 2 3 2 3 4M21 19c0 2 3 2 3 4" />
      <path d="M7 8h6" />
    </svg>
  );
}

/** Genérico: nodo de proceso. Respaldo cuando la clave no existe. */
function IconoGenerico(props: PropsIcono) {
  return (
    <svg {...base} {...props}>
      <path d="M6 6h20v20H6z" />
      <circle cx="16" cy="16" r="5" />
      <path d="M16 6v5M16 21v5M6 16h5M21 16h5" />
    </svg>
  );
}

const ICONOS_SERVICIO: Record<string, (props: PropsIcono) => React.ReactElement> = {
  plano: IconoPlano,
  automatizacion: IconoAutomatizacion,
  tablero: IconoTablero,
  telemetria: IconoTelemetria,
  telecontrol: IconoTelecontrol,
  "llave-en-mano": IconoLlaveEnMano,
  aplicaciones: IconoAplicaciones,
  refrigeracion: IconoRefrigeracion,
  clima: IconoClima,
};

/** Pinta el icono de una clave. Clave desconocida o vacía → genérico. */
export function IconoServicio({
  clave,
  ...props
}: PropsIcono & { clave: string | null | undefined }) {
  const Componente = (clave && ICONOS_SERVICIO[clave]) || IconoGenerico;
  return <Componente {...props} />;
}

/* --- Valores ---------------------------------------------------------- */

/** Integridad: fiel de balanza equilibrado. */
function IconoIntegridad(props: PropsIcono) {
  return (
    <svg {...base} {...props}>
      <path d="M16 5v22M8 27h16" />
      <path d="M5 10h22" />
      <path d="M5 10 2 19h6zM27 10l-3 9h6z" />
    </svg>
  );
}

/** Compromiso: marca de verificación dentro de un ciclo cerrado. */
function IconoCompromiso(props: PropsIcono) {
  return (
    <svg {...base} {...props}>
      <path d="M27 16a11 11 0 1 1-4.5-8.9" />
      <path d="M22.5 3v5h-5" />
      <path d="m11 16 3.5 3.5L22 12" />
    </svg>
  );
}

/** Orientación al cliente: dos personas frente a frente, en diálogo. */
function IconoCliente(props: PropsIcono) {
  return (
    <svg {...base} {...props}>
      <circle cx="11" cy="10" r="4" />
      <path d="M4 26v-3a7 7 0 0 1 7-7h0a7 7 0 0 1 7 7v3" />
      <path d="M21 8h8v7h-3l-3 3v-3h-2z" />
    </svg>
  );
}

/** Innovación: señal que sube por un circuito hacia un nodo nuevo. */
function IconoInnovacion(props: PropsIcono) {
  return (
    <svg {...base} {...props}>
      <path d="M4 26h6v-6H4zM13 26h6V14h-6z" />
      <path d="M22 26h6V8h-6z" />
      <path d="m20 6 5-3 5 3" />
    </svg>
  );
}

const ICONOS_VALOR: Record<string, (props: PropsIcono) => React.ReactElement> = {
  integridad: IconoIntegridad,
  compromiso: IconoCompromiso,
  cliente: IconoCliente,
  innovacion: IconoInnovacion,
};

export function IconoValor({
  clave,
  ...props
}: PropsIcono & { clave: string | null | undefined }) {
  const Componente = (clave && ICONOS_VALOR[clave]) || IconoGenerico;
  return <Componente {...props} />;
}

/* --- Otros iconos del sitio ------------------------------------------- */

export function IconoCorreo(props: PropsIcono) {
  return (
    <svg {...base} viewBox="0 0 24 24" {...props}>
      <path d="M3 5h18v14H3z" />
      <path d="m3 6 9 7 9-7" />
    </svg>
  );
}

export function IconoTelefono(props: PropsIcono) {
  return (
    <svg {...base} viewBox="0 0 24 24" strokeLinecap="round" {...props}>
      <path d="M6 3h4l2 5-2.5 1.5a11 11 0 0 0 5 5L16 12l5 2v4a2 2 0 0 1-2.2 2A16.5 16.5 0 0 1 4 5.2 2 2 0 0 1 6 3z" />
    </svg>
  );
}

export function IconoReloj(props: PropsIcono) {
  return (
    <svg {...base} viewBox="0 0 24 24" {...props}>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5.5l3.5 2" />
    </svg>
  );
}

export function IconoDocumento(props: PropsIcono) {
  return (
    <svg {...base} viewBox="0 0 24 24" {...props}>
      <path d="M6 3h8l4 4v14H6z" />
      <path d="M14 3v4h4M9 12h6M9 16h6" />
    </svg>
  );
}
