/**
 * LECTURA DE `FormData` EN LAS SERVER ACTIONS — módulo PURO
 * =========================================================
 * Un formulario HTML solo manda texto, y manda `""` donde la base espera
 * `null`. Estos helpers hacen esa traducción en un solo sitio para que todas
 * las acciones del panel la hagan igual.
 *
 * No lleva `"use server"`: no es una acción, es una utilidad que importan las
 * acciones. (Un archivo `"use server"` solo puede exportar funciones async.)
 */

import type { ActionState } from "@/lib/admin-types";

/** Texto recortado; `""` si el campo no vino. */
export function text(formData: FormData, key: string): string {
  const valor = formData.get(key);
  return typeof valor === "string" ? valor.trim() : "";
}

/** Texto recortado o `null` si quedó vacío. */
export function textOrNull(formData: FormData, key: string): string | null {
  const valor = text(formData, key);
  return valor === "" ? null : valor;
}

/**
 * Interruptor. El componente `Interruptor` manda SIEMPRE un `"false"` oculto y,
 * si está encendido, además el checkbox con `"true"`: así el servidor distingue
 * «apagado» de «no enviado» (un checkbox desmarcado no manda nada).
 */
export function bool(formData: FormData, key: string, porDefecto = true): boolean {
  const valores = formData.getAll(key);
  if (valores.length === 0) return porDefecto;
  return valores.includes("true");
}

/** Entero; `porDefecto` si lo escrito no es un número. */
export function int(formData: FormData, key: string, porDefecto = 0): number {
  const n = Number(text(formData, key));
  return Number.isFinite(n) ? Math.trunc(n) : porDefecto;
}

/**
 * Lista de valores repetidos bajo el mismo `name` (los ítems de un servicio,
 * las filas de una galería), ya limpia de vacíos.
 */
export function lista(formData: FormData, key: string): string[] {
  return formData
    .getAll(key)
    .map((v) => (typeof v === "string" ? v.trim() : ""))
    .filter((v) => v !== "");
}

/**
 * Dos listas paralelas (`src[]` y `alt[]` de una galería) emparejadas fila a
 * fila. Se descartan las filas sin `src`; el `alt` puede quedar vacío y es el
 * formulario quien lo exige.
 */
export function paresDeListas(
  formData: FormData,
  keyA: string,
  keyB: string,
): { a: string; b: string }[] {
  const as = formData.getAll(keyA).map((v) => (typeof v === "string" ? v.trim() : ""));
  const bs = formData.getAll(keyB).map((v) => (typeof v === "string" ? v.trim() : ""));
  return as
    .map((a, i) => ({ a, b: bs[i] ?? "" }))
    .filter((par) => par.a !== "");
}

/* ------------------------------------------------------------------ */
/* Estados tipados                                                     */
/* ------------------------------------------------------------------ */

export const fail = (message: string): ActionState => ({ status: "error", message });
export const ok = (message: string): ActionState => ({ status: "success", message });

/** El mismo mensaje en todas partes cuando la sesión ya no sirve. */
export const SIN_PERMISO: ActionState = {
  status: "error",
  message:
    "Tu sesión expiró o tu cuenta ya no tiene permiso para esta pantalla. Vuelve a ingresar, por favor.",
};

/** Falta la clave de servicio: sin ella no se crean ni se eliminan cuentas. */
export const SIN_SERVICE_ROLE: ActionState = {
  status: "error",
  message:
    "Falta la variable SUPABASE_SERVICE_ROLE_KEY en el servidor. Sin ella no se pueden crear, restablecer ni eliminar cuentas. Cárgala en Vercel y vuelve a desplegar (cargarla no basta: las páginas deciden en el build).",
};
