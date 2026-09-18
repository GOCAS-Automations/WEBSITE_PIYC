/**
 * Generación de slugs (la parte final de una URL).
 *
 * Módulo PURO: lo usan las server actions del panel (al guardar un servicio o
 * un proyecto) y la capa de contenido pública, que necesita un slug de
 * respaldo cuando una fila no lo trae.
 *
 * Regla: minúsculas, sin tildes, con guiones en lugar de cualquier otro
 * carácter, máximo 80 caracteres.
 */
export function slugify(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "") // quita las tildes que deja NFD
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}
