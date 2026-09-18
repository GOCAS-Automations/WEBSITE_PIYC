import { redirect } from "next/navigation";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "./database.types";
import { getServerSupabase } from "./server";
import {
  isContentEditorRole,
  isEmployeeRole,
  isManagerRole,
  normalizeRole,
  type UserRole,
} from "./roles";
import { identificadorCuenta, usuarioDesdeEmail } from "@/lib/usuarios";

export type { UserRole };

export interface SessionProfile {
  id: string;
  /** Correo con el que Supabase Auth identifica la cuenta (casi siempre sintético). */
  email: string;
  /** Usuario del portal; `null` si la cuenta no tiene. */
  username: string | null;
  /** Lo que se muestra en la interfaz: el usuario si lo hay, si no el correo. */
  identificador: string;
  fullName: string;
  role: UserRole;
  cargo: string | null;
  phone: string | null;
  /** false = cuenta desactivada por un administrador (o nacida fuera del panel). */
  active: boolean;
}

export interface Session {
  supabase: SupabaseClient<Database>;
  profile: SessionProfile;
}

/**
 * Lee la sesión actual y el perfil (rol) del usuario.
 * Devuelve `null` si Supabase no está configurado o no hay sesión válida.
 * `getUser()` valida el token contra Auth: no confiar en `getSession()` en el
 * servidor.
 */
export async function getSessionProfile(): Promise<Session | null> {
  const supabase = await getServerSupabase();
  if (!supabase) return null;

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();
  if (error || !user) return null;

  const { data } = await supabase
    .from("profiles")
    .select("email, username, full_name, role, cargo, phone, active")
    .eq("id", user.id)
    .maybeSingle();

  const email = data?.email ?? user.email ?? "";
  const username =
    typeof data?.username === "string" && data.username.trim() !== ""
      ? data.username.trim()
      : usuarioDesdeEmail(email);

  return {
    supabase,
    profile: {
      id: user.id,
      email,
      username,
      identificador: identificadorCuenta({ username, email }),
      fullName: data?.full_name ?? email,
      role: normalizeRole(data?.role),
      cargo: data?.cargo ?? null,
      phone: data?.phone ?? null,
      // Sin fila de perfil no hay permisos: se trata como desactivada.
      active: data?.active === true,
    },
  };
}

/** Sesión válida y cuenta activa; `null` en cualquier otro caso. */
export async function getActiveSession(): Promise<Session | null> {
  const session = await getSessionProfile();
  if (!session || !session.profile.active) return null;
  return session;
}

/* ------------------------------------------------------------------ */
/* Guardas para páginas (redirigen)                                    */
/* ------------------------------------------------------------------ */

/** Exige sesión activa con permiso para editar contenido. Layout de /admin. */
export async function requireContentEditor(): Promise<Session> {
  const session = await getActiveSession();
  if (!session || !isContentEditorRole(session.profile.role)) {
    redirect("/mi-cuenta");
  }
  return session;
}

/** Exige sesión activa de manager (admin | coordinador). */
export async function requireManager(): Promise<Session> {
  const session = await getActiveSession();
  if (!session || !isManagerRole(session.profile.role)) {
    redirect("/admin");
  }
  return session;
}

/** Exige sesión activa con rol 'admin'. */
export async function requireAdmin(): Promise<Session> {
  const session = await getActiveSession();
  if (!session || session.profile.role !== "admin") {
    redirect("/admin");
  }
  return session;
}

/* ------------------------------------------------------------------ */
/* Guardas para server actions (devuelven null, no redirigen)          */
/* ------------------------------------------------------------------ */

/** Editor de contenido o `null`. */
export async function getContentEditorOrNull(): Promise<Session | null> {
  const session = await getActiveSession();
  if (!session || !isContentEditorRole(session.profile.role)) return null;
  return session;
}

/** Manager (admin | coordinador) o `null`. */
export async function getManagerOrNull(): Promise<Session | null> {
  const session = await getActiveSession();
  if (!session || !isManagerRole(session.profile.role)) return null;
  return session;
}

/** Administrador o `null`. */
export async function getAdminOrNull(): Promise<Session | null> {
  const session = await getActiveSession();
  if (!session || session.profile.role !== "admin") return null;
  return session;
}

/**
 * Cuenta con rol EXACTAMENTE 'empleado', o `null`. Ojo: el portal de jornadas
 * no la usa — cualquier cuenta activa registra SUS jornadas (basta con
 * `getActiveSession()`; la RLS exige `employee_id = auth.uid()`).
 */
export async function getEmployeeOrNull(): Promise<Session | null> {
  const session = await getActiveSession();
  if (!session || !isEmployeeRole(session.profile.role)) return null;
  return session;
}
