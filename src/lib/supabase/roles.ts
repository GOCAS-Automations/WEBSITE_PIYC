/**
 * ROLES — módulo PURO (sin Supabase ni `next/*`)
 * ==============================================
 * Lo comparten Server Components, server actions y Client Components.
 * Tres roles, igual que el CHECK de `profiles.role` (0001_contenido.sql):
 *
 *   admin        → todo.
 *   coordinador  → el contenido del sitio y las jornadas de todos, pero en
 *                  Equipo solo las cuentas de EMPLEADO: sobre un administrador
 *                  o sobre otro coordinador no puede editar, desactivar,
 *                  eliminar ni restablecer la contraseña. Restablecer una
 *                  contraseña es poder entrar como esa persona; si un
 *                  coordinador pudiera hacerlo con un par o con un
 *                  administrador, podría suplantarlo.
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
 * Los roles cuyas cuentas puede administrar `actor` en /admin/equipo.
 *
 * ÚNICO CRITERIO de esa pantalla: de aquí salen el listado, la ficha, las
 * opciones del selector de rol y todas las server actions.
 */
export function rolesAdministrables(actor: UserRole): readonly UserRole[] {
  if (actor === "admin") return ROLES;
  if (actor === "coordinador") return ["empleado"];
  return [];
}

/**
 * ¿Puede `actor` editar, desactivar, eliminar o restablecerle la contraseña a
 * una cuenta AJENA con rol `objetivo`?
 *
 * La server action que usa la Auth Admin API DEBE llamarla: la service-role no
 * pasa por la guardia de la base. La cuenta propia es caso aparte —cada quien
 * edita sus datos— y la resuelve quien llama, junto con las reglas de «nadie se
 * degrada ni se desactiva a sí mismo».
 */
export function puedeGestionarCuenta(actor: UserRole, objetivo: UserRole): boolean {
  return rolesAdministrables(actor).includes(objetivo);
}

/** ¿Puede `actor` asignar el rol `objetivo` al crear o al editar una cuenta? */
export function puedeAsignarRol(actor: UserRole, objetivo: UserRole): boolean {
  return puedeGestionarCuenta(actor, objetivo);
}

/** Por qué no, en una línea. La usan la interfaz y el error del servidor. */
export function motivoSinPermiso(actor: UserRole, objetivo: UserRole): string {
  if (actor === "coordinador")
    return `Un coordinador solo gestiona cuentas de empleado. Para una cuenta de ${ETIQUETA_ROL[
      objetivo
    ].toLowerCase()} hace falta un administrador.`;
  return "Tu cuenta no tiene permisos para gestionar el equipo.";
}
