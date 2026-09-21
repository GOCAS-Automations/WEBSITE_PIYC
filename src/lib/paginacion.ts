/**
 * PAGINACIÓN DE LAS TABLAS DEL PANEL
 * ==================================
 * Toda lista de registros del panel muestra como máximo `FILAS_POR_PAGINA`
 * filas. La cifra vive AQUÍ y solo aquí; el control visual es uno solo,
 * `Paginacion` de `src/components/admin/ui-base.tsx`.
 *
 * Módulo PURO (sin `"use client"`, sin importaciones): lo usan por igual las
 * páginas de servidor, que leen `?pagina=` de la URL, y los componentes de
 * cliente, que paginan con estado local.
 */

/** Máximo de filas por página en todas las listas del panel. */
export const FILAS_POR_PAGINA = 10;

/** Nombre del parámetro de la URL que lleva la página (1, 2, 3…). */
export const PARAM_PAGINA = "pagina";

/**
 * Lee `?pagina=` tal como llega de `searchParams`. Cualquier cosa que no sea un
 * entero ≥ 1 cuenta como la página 1 (el recorte por arriba lo hace `paginar`,
 * que es quien conoce el total).
 */
export function leerPagina(valor: string | string[] | undefined): number {
  const crudo = Array.isArray(valor) ? valor[0] : valor;
  const n = Number(crudo);
  return Number.isInteger(n) && n >= 1 ? n : 1;
}

export interface PaginaDe<T> {
  visibles: T[];
  /** Página actual, 1-based y ya recortada al rango válido. */
  pagina: number;
  totalPaginas: number;
  /** Filas del conjunto completo. */
  total: number;
  desde: number;
  hasta: number;
}

/**
 * Trocea una lista. Una página fuera de rango (un enlace viejo, una fila
 * borrada que dejó vacía la última página) se recorta a la última que existe en
 * vez de mostrar una tabla vacía.
 */
export function paginar<T>(
  lista: readonly T[],
  paginaPedida: number,
  porPagina: number = FILAS_POR_PAGINA,
): PaginaDe<T> {
  const total = lista.length;
  const totalPaginas = Math.max(1, Math.ceil(total / porPagina));
  const pagina = Math.min(Math.max(1, Math.trunc(paginaPedida) || 1), totalPaginas);
  const inicio = (pagina - 1) * porPagina;
  const visibles = lista.slice(inicio, inicio + porPagina);
  return {
    visibles,
    pagina,
    totalPaginas,
    total,
    desde: total === 0 ? 0 : inicio + 1,
    hasta: total === 0 ? 0 : inicio + visibles.length,
  };
}

/**
 * La misma dirección con otra página. `base` es la URL actual SIN pensar en la
 * página (ruta + los demás parámetros); la página 1 no se escribe, para que la
 * dirección «limpia» y la de la primera página sean la misma.
 */
export function hrefConPagina(base: string, pagina: number): string {
  const [ruta, consulta = ""] = base.split("?");
  const params = new URLSearchParams(consulta);
  if (pagina > 1) params.set(PARAM_PAGINA, String(pagina));
  else params.delete(PARAM_PAGINA);
  const q = params.toString();
  return q ? `${ruta}?${q}` : ruta;
}
