/**
 * CUENTAS POR USUARIO (no por correo)
 * ===================================
 * Módulo PURO (sin Supabase ni `next/headers`): lo importan los Client
 * Components del login, los formularios del panel y las server actions.
 *
 * POR QUÉ EXISTE
 * --------------
 * El equipo de PIYC entra al portal con un **usuario** que le asigna la empresa
 * (p. ej. `jperez`). Supabase Auth, en cambio, exige un correo. La solución es
 * un **correo sintético interno** que el usuario nunca ve:
 *
 *     jperez  →  jperez@cuentas.piycsas.com
 *
 * Ese subdominio NO recibe correo y no debe usarse para nada más (no se le
 * crean registros MX: el correo real de PIYC no se toca). El correo real de la
 * persona, si lo tiene, va aparte en `profiles.email_contacto` y es informativo.
 *
 * En el ingreso, si lo escrito contiene "@" se usa tal cual (p. ej. una cuenta
 * creada con correo real desde el Dashboard); si no, se convierte al sintético.
 */

/** Dominio interno de las cuentas del portal. No recibe correo. */
export const DOMINIO_CUENTAS = "cuentas.piycsas.com";

/** Longitudes admitidas para un nombre de usuario. */
export const USUARIO_MIN = 3;
export const USUARIO_MAX = 32;

/**
 * Deja el usuario en su forma canónica: minúsculas, sin tildes, sin espacios
 * ni caracteres raros. "María Fernanda" → "mariafernanda".
 */
export function normalizarUsuario(valor: unknown): string {
  if (typeof valor !== "string") return "";
  return valor
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "") // quita tildes y diéresis
    .replace(/\s+/g, "")
    .replace(/[^a-z0-9._-]/g, "")
    .slice(0, USUARIO_MAX);
}

/** true si el usuario cumple las reglas (minúsculas, sin espacios, 3-32). */
export function esUsuarioValido(usuario: string): boolean {
  return new RegExp(`^[a-z0-9][a-z0-9._-]{${USUARIO_MIN - 1},${USUARIO_MAX - 1}}$`).test(
    usuario,
  );
}

/** Mensaje de ayuda cuando el usuario no cumple las reglas. */
export const AYUDA_USUARIO =
  "Usa entre 3 y 32 caracteres: solo letras minúsculas, números, punto, guion o guion bajo (sin espacios ni tildes). Ejemplo: jperez";

/** `jperez` → `jperez@cuentas.piycsas.com`. */
export function emailDeUsuario(usuario: string): string {
  return `${normalizarUsuario(usuario)}@${DOMINIO_CUENTAS}`;
}

/** true si el correo es uno de los sintéticos internos. */
export function esEmailSintetico(email: string | null | undefined): boolean {
  return typeof email === "string" && email.toLowerCase().endsWith(`@${DOMINIO_CUENTAS}`);
}

/** `jperez@cuentas.piycsas.com` → `jperez`; otro correo → `null`. */
export function usuarioDesdeEmail(email: string | null | undefined): string | null {
  if (!esEmailSintetico(email)) return null;
  return String(email).toLowerCase().split("@")[0] || null;
}

/**
 * Lo que la persona escribe en el campo "Usuario" del ingreso, convertido al
 * identificador que entiende Supabase Auth.
 *  - Contiene "@" → se usa tal cual.
 *  - Si no        → se mapea al correo sintético interno.
 */
export function credencialDeAcceso(entrada: string): string {
  const limpio = (entrada ?? "").trim();
  if (limpio.includes("@")) return limpio.toLowerCase();
  return emailDeUsuario(limpio);
}

/** Cómo se identifica una cuenta en la interfaz: el usuario si lo tiene; si no, el correo. */
export function identificadorCuenta(perfil: {
  username?: string | null;
  email?: string | null;
}): string {
  if (perfil.username && perfil.username.trim() !== "") return perfil.username.trim();
  const desdeEmail = usuarioDesdeEmail(perfil.email);
  return desdeEmail ?? (perfil.email ?? "");
}

/** Texto listo para dictar o pegar en WhatsApp al entregar unas credenciales. */
export function textoCredenciales(usuario: string, password: string): string {
  return `Usuario: ${usuario} · Contraseña: ${password}`;
}
