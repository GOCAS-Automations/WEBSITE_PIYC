/**
 * TIPOS Y CONSTANTES DEL MÓDULO DE JORNADAS — módulo PURO
 * =======================================================
 * Sin React, sin `next/*`, sin Supabase, sin `"use client"`.
 *
 * Existe por la **regla 4** de `AGENTS.md`: un valor exportado desde un módulo
 * `"use client"` no se puede leer en el servidor. Todo lo que comparten las
 * páginas de servidor, las server actions y los formularios de cliente
 * (estados, etiquetas, opciones de filtro, forma de una fila, longitudes
 * máximas) vive aquí y solo aquí.
 */

/* ===================================================================== */
/* 1. Estados de una jornada                                              */
/* ===================================================================== */

/** Los tres estados del CHECK de `jornadas.status` (migración 0002). */
export const ESTADOS_JORNADA = ["pendiente", "aprobada", "rechazada"] as const;

export type EstadoJornada = (typeof ESTADOS_JORNADA)[number];

export const ETIQUETA_ESTADO: Record<EstadoJornada, string> = {
  pendiente: "Pendiente",
  aprobada: "Aprobada",
  rechazada: "Rechazada",
};

/**
 * Qué significa cada estado, en una frase. Se muestra junto a la insignia para
 * que nadie confunda **rechazada** con **eliminada** (regla 6).
 */
export const EXPLICACION_ESTADO: Record<EstadoJornada, string> = {
  // La frase la leen dos pantallas: el panel (que ya no elimina jornadas) y el
  // portal del empleado. Por eso habla solo de editar: es cierto en las dos.
  pendiente: "Registrada, esperando revisión. Todavía se puede editar.",
  aprobada:
    "Revisada y aceptada. Su desglose de horas quedó congelado y ya no cambia.",
  rechazada:
    "Devuelta con una nota para corregirla. NO está eliminada: el registro se conserva.",
};

/** Clases de la insignia de cada estado, con la paleta de PIYC. */
export const CLASES_ESTADO: Record<EstadoJornada, string> = {
  pendiente: "border-azul-300 bg-azul-50 text-azul-800",
  aprobada: "border-verde-300 bg-verde-100 text-verde-700",
  rechazada: "border-error-300 bg-error-50 text-error-700",
};

/** Cualquier valor desconocido se lee como «pendiente». */
export function normalizarEstado(valor: unknown): EstadoJornada {
  return typeof valor === "string" && (ESTADOS_JORNADA as readonly string[]).includes(valor)
    ? (valor as EstadoJornada)
    : "pendiente";
}

/* ===================================================================== */
/* 2. Una jornada, tal como la leen el panel y el portal                  */
/* ===================================================================== */

export interface JornadaRecord {
  id: string;
  employee_id: string;
  /** Orden de trabajo. `null` = la labor no tenía orden asociada. */
  work_order: string | null;
  /** Día laboral al que se imputa la jornada, `YYYY-MM-DD`. */
  work_date: string;
  /** Instante ISO de entrada. */
  start_at: string;
  /** Instante ISO de salida; puede caer en el día siguiente. */
  end_at: string;
  description: string;
  observations: string | null;
  status: EstadoJornada;
  /** Nota de quien revisó. Obligatoria al rechazar. */
  review_note: string | null;
  reviewed_by: string | null;
  reviewed_at: string | null;
  /** Desglose CONGELADO al aprobar. `null` mientras no esté aprobada. */
  desglose: unknown;
  contexto_calculo: unknown;
  calculado_at: string | null;
  created_at: string;
  updated_at: string;
}

/** Una jornada con el nombre de quien la registró, ya resuelto (regla 3). */
export interface JornadaConPersona extends JornadaRecord {
  /** Nombre de la persona; «Cuenta eliminada» si el perfil ya no existe. */
  empleadoNombre: string;
  empleadoCargo: string | null;
  /** Nombre de quien revisó, si lo hubo. */
  revisorNombre: string | null;
}

/* ===================================================================== */
/* 3. Longitudes de los campos                                            */
/* ===================================================================== */

/**
 * Topes de texto. No los exige la base (las columnas son `text`), los exige el
 * buen juicio: una descripción de veinte mil caracteres no la lee nadie y sí
 * rompe cualquier exportación.
 */
export const LIMITES_JORNADA = {
  ordenTrabajo: 40,
  descripcion: 600,
  observaciones: 600,
  notaRevision: 600,
} as const;

/* ===================================================================== */
/* 4. Filtros del listado (`/admin/jornadas`)                             */
/* ===================================================================== */

/**
 * Los filtros viven en la URL, no en estado del cliente: así un enlace se puede
 * compartir, el botón «atrás» funciona y el CSV recibe exactamente lo que se
 * está viendo en pantalla.
 */
export const PARAM_FILTRO = {
  empleado: "empleado",
  estado: "estado",
  desde: "desde",
  hasta: "hasta",
  orden: "orden",
} as const;

export interface FiltrosJornadas {
  /** `id` del empleado, o `""` para todos. */
  empleado: string;
  /** Estado, o `""` para todos. */
  estado: EstadoJornada | "";
  /** `YYYY-MM-DD` o `""`. */
  desde: string;
  /** `YYYY-MM-DD` o `""`. */
  hasta: string;
  /** Texto de la orden de trabajo (coincidencia parcial) o `""`. */
  orden: string;
}

export const FILTROS_VACIOS: FiltrosJornadas = {
  empleado: "",
  estado: "",
  desde: "",
  hasta: "",
  orden: "",
};

/** Opciones del selector de estado del filtro. */
export const OPCIONES_ESTADO_FILTRO: { value: string; label: string }[] = [
  { value: "", label: "Todos los estados" },
  ...ESTADOS_JORNADA.map((estado) => ({
    value: estado,
    label: ETIQUETA_ESTADO[estado],
  })),
];

const ES_FECHA = /^\d{4}-\d{2}-\d{2}$/;

function texto(valor: string | string[] | undefined, maximo = 80): string {
  const crudo = Array.isArray(valor) ? valor[0] : valor;
  return typeof crudo === "string" ? crudo.trim().slice(0, maximo) : "";
}

/**
 * Lee los filtros de `searchParams`. Todo lo que no sea válido se descarta en
 * silencio: un enlace viejo nunca debe dejar la pantalla en blanco.
 */
export function leerFiltros(params: {
  [key: string]: string | string[] | undefined;
}): FiltrosJornadas {
  const estadoBruto = texto(params[PARAM_FILTRO.estado], 20);
  const desde = texto(params[PARAM_FILTRO.desde], 10);
  const hasta = texto(params[PARAM_FILTRO.hasta], 10);

  return {
    empleado: texto(params[PARAM_FILTRO.empleado], 40),
    estado: (ESTADOS_JORNADA as readonly string[]).includes(estadoBruto)
      ? (estadoBruto as EstadoJornada)
      : "",
    desde: ES_FECHA.test(desde) ? desde : "",
    hasta: ES_FECHA.test(hasta) ? hasta : "",
    orden: texto(params[PARAM_FILTRO.orden], 40),
  };
}

/** true si hay al menos un filtro puesto. */
export function hayFiltros(filtros: FiltrosJornadas): boolean {
  return (
    filtros.empleado !== "" ||
    filtros.estado !== "" ||
    filtros.desde !== "" ||
    filtros.hasta !== "" ||
    filtros.orden !== ""
  );
}

/** Los filtros como cadena de consulta, sin la página. */
export function filtrosAConsulta(filtros: FiltrosJornadas): string {
  const params = new URLSearchParams();
  if (filtros.empleado) params.set(PARAM_FILTRO.empleado, filtros.empleado);
  if (filtros.estado) params.set(PARAM_FILTRO.estado, filtros.estado);
  if (filtros.desde) params.set(PARAM_FILTRO.desde, filtros.desde);
  if (filtros.hasta) params.set(PARAM_FILTRO.hasta, filtros.hasta);
  if (filtros.orden) params.set(PARAM_FILTRO.orden, filtros.orden);
  return params.toString();
}

/** `/ruta` + los filtros activos. Es la base que recibe `Paginacion`. */
export function hrefConFiltros(ruta: string, filtros: FiltrosJornadas): string {
  const consulta = filtrosAConsulta(filtros);
  return consulta ? `${ruta}?${consulta}` : ruta;
}

/* ===================================================================== */
/* 5. Clases de botón para los Server Components de esta sección          */
/* ===================================================================== */

/**
 * COPIA DELIBERADA de `botonPrimario` / `botonSecundario` de
 * `components/admin/ui-base.tsx`.
 *
 * No es un descuido: `ui-base` lleva `"use client"` y la **regla 4** de
 * `AGENTS.md` prohíbe leer en el servidor un valor exportado desde un módulo de
 * cliente (lo que llega no es la cadena, es una referencia de cliente). Los
 * componentes de cliente de `components/jornadas/` siguen importándolas de
 * `ui-base`; estas dos son solo para las páginas de servidor de
 * `/admin/jornadas`. Si cambia el estilo del botón del panel, se tocan los dos
 * sitios.
 */
export const BOTON_PRIMARIO =
  "inline-flex items-center justify-center gap-2 rounded-fino bg-azul-700 px-5 py-2.5 text-sm font-semibold text-blanco transition-colors hover:bg-azul-800 disabled:pointer-events-none disabled:opacity-60";

export const BOTON_SECUNDARIO =
  "inline-flex items-center justify-center gap-2 rounded-fino border border-acero-300 bg-blanco px-4 py-2.5 text-sm font-semibold text-acero-700 transition-colors hover:border-azul-700 hover:text-azul-700";

/* ===================================================================== */
/* 6. Filtros del portal del empleado (`/mi-cuenta`)                      */
/* ===================================================================== */

/**
 * El portal filtra por mes y estado, y lo hace **en el cliente**: el empleado
 * tiene pocas jornadas y así el filtro es instantáneo en el celular, sin
 * recargar la página en medio de una obra con mala señal.
 */
export interface FiltrosPortal {
  /** `"YYYY-MM"` o `""` para todos los meses. */
  mes: string;
  estado: EstadoJornada | "";
}

export const FILTROS_PORTAL_VACIOS: FiltrosPortal = { mes: "", estado: "" };
