/**
 * ROLES — módulo PURO (sin Supabase ni `next/*`)
 * ==============================================
 * Lo comparten Server Components, server actions y Client Components.
 * Tres roles, igual que el CHECK de `profiles.role` (0001_contenido.sql):
 *
 *   admin        → todo.
 *   coordinador  → todo menos crear, modificar o eliminar administradores.
 *   empleado     → solo su portal de jornadas (/mi-cuenta).
 *
 * Estas funciones deciden qué se MUESTRA; quien decide qué se PUEDE es la RLS
 * (`private.is_content_editor()`, `private.is_manager()`) y el trigger
 * `profiles_proteger`. Las server actions validan igualmente en el servidor.
 */

export const ROLES = ["admin", "coordinador", "empleado"] as const;
export type UserRole = (typeof ROLES)[number];

export const ETIQUETA_ROL: Record<UserRole, string> = {
  admin: "Administrador",
  coordinador: "Coordinador",
  empleado: "Empleado",
};

/** Cualquier valor desconocido cae en el rol de menor privilegio. */
export function normalizeRole(valor: unknown): UserRole {
  return typeof valor === "string" && (ROLES as readonly string[]).includes(valor)
    ? (valor as UserRole)
    : "empleado";
}

/** Puede editar el contenido del sitio (igual que `private.is_content_editor()`). */
export function isContentEditorRole(role: UserRole): boolean {
  return role === "admin" || role === "coordinador";
}

/** Gestiona cuentas y aprueba jornadas (igual que `private.is_manager()`). */
export function isManagerRole(role: UserRole): boolean {
  return role === "admin" || role === "coordinador";
}

export function isEmployeeRole(role: UserRole): boolean {
  return role === "empleado";
}

/**
 * ¿Puede `actor` crear, editar o eliminar una cuenta con rol `objetivo`?
 * Un coordinador gestiona coordinadores y empleados, nunca administradores.
 * La server action que usa la Auth Admin API DEBE llamarla: la service-role no
 * pasa por la guardia de la base.
 */
export function puedeGestionarRol(actor: UserRole, objetivo: UserRole): boolean {
  if (actor === "admin") return true;
  if (actor === "coordinador") return objetivo !== "admin";
  return false;
}
