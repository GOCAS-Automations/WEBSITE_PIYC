"use server";

/**
 * SERVER ACTIONS — CUENTAS DEL EQUIPO (/admin/equipo)
 * ===================================================
 * Crear, editar, activar, desactivar, restablecer contraseña y eliminar las
 * cuentas del portal.
 *
 * CUENTAS POR USUARIO
 * -------------------
 * El equipo de PIYC no tiene correo corporativo: cada persona entra con un
 * usuario (`jperez`). Supabase Auth exige un correo, así que la cuenta se crea
 * con el sintético interno `jperez@cuentas.piycsas.com` (ver
 * `src/lib/usuarios.ts`); ese subdominio no recibe correo y la persona nunca lo
 * ve. Su correo real, si lo tiene, va aparte en `profiles.email_contacto` y es
 * solo informativo.
 *
 * EL ROL VA EN `app_metadata`, NUNCA EN `user_metadata`
 * -----------------------------------------------------
 * `app_metadata` solo la puede escribir la service-role; `user_metadata` la
 * controla quien se registra. Si el trigger `handle_new_user` leyera el rol de
 * ahí, cualquiera podría autopromoverse a administrador con un `signUp()`. Por
 * eso la migración 0001 lo lee de `app_metadata` y una cuenta creada **sin**
 * rol nace empleado y DESACTIVADA.
 *
 * SEGURIDAD — SE VALIDA SIEMPRE EN EL SERVIDOR, EN CADA ACCIÓN
 * ------------------------------------------------------------
 *  1. Quien ejecuta tiene que ser manager activo (admin | coordinador).
 *  2. Un coordinador **no** crea administradores ni toca la cuenta de uno
 *     (`puedeGestionarRol()`). La Auth Admin API no sabe quién la llama y la
 *     service-role se salta la RLS: esta comprobación es la única barrera de
 *     ese lado. En la base, el trigger `profiles_proteger` cubre el camino con
 *     sesión.
 *  3. Nadie se desactiva, se degrada ni se elimina a sí mismo: es como se acaba
 *     un sistema sin ningún administrador con acceso.
 */

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getManagerOrNull } from "@/lib/supabase/auth";
import {
  generarPassword,
  getServiceRoleSupabase,
  isServiceRoleConfigured,
} from "@/lib/supabase/admin";
import { normalizeRole, puedeGestionarRol, type UserRole } from "@/lib/supabase/roles";
import {
  AYUDA_USUARIO,
  emailDeUsuario,
  esUsuarioValido,
  identificadorCuenta,
  normalizarUsuario,
} from "@/lib/usuarios";
import { bool, text, textOrNull } from "@/lib/admin/formulario";
import {
  PASSWORD_MINIMO,
  type ActionState,
  type CredentialState,
} from "@/lib/admin-types";
import type { SupabaseClient } from "@supabase/supabase-js";

/* ------------------------------------------------------------------ */
/* Estados y utilidades                                                */
/* ------------------------------------------------------------------ */

const SIN_PERMISO: CredentialState = {
  status: "error",
  message:
    "Tu sesión expiró o tu cuenta no tiene permisos para gestionar el equipo. Vuelve a ingresar.",
};

const SIN_SERVICE_ROLE: CredentialState = {
  status: "error",
  message:
    "Falta la variable SUPABASE_SERVICE_ROLE_KEY en el servidor. Sin ella no se pueden crear, restablecer ni eliminar cuentas. Cárgala y vuelve a desplegar: cargarla no basta.",
};

const fail = (message: string): CredentialState => ({ status: "error", message });

function esCorreoValido(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email);
}

function revalidarEquipo() {
  revalidatePath("/admin/equipo");
  revalidatePath("/admin");
}

/** ¿Ya hay una cuenta con ese usuario? */
async function usuarioOcupado(
  client: SupabaseClient,
  usuario: string,
): Promise<boolean> {
  try {
    const { data, error } = await client
      .from("profiles")
      .select("id")
      .eq("username", usuario)
      .limit(1);
    if (error) return false; // el correo único lo atrapa igual
    return Array.isArray(data) && data.length > 0;
  } catch {
    return false;
  }
}

/**
 * Lee la cuenta afectada y comprueba que quien ejecuta puede gestionarla.
 * Devuelve la fila o el `CredentialState` de error, nunca ambas cosas.
 */
async function cuentaGestionable(
  supabase: SupabaseClient,
  actor: UserRole,
  id: string,
): Promise<
  | { ok: true; fila: Record<string, unknown>; rol: UserRole }
  | { ok: false; estado: CredentialState }
> {
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error || !data)
    return { ok: false, estado: fail("No se encontró esa cuenta.") };

  const rol = normalizeRole((data as Record<string, unknown>).role);
  if (!puedeGestionarRol(actor, rol))
    return {
      ok: false,
      estado: fail(
        "Solo un administrador puede modificar la cuenta de otro administrador.",
      ),
    };

  return { ok: true, fila: data as Record<string, unknown>, rol };
}

/** El usuario con el que se identifica una fila de `profiles`. */
function usuarioDeFila(fila: Record<string, unknown>): string {
  return identificadorCuenta({
    username: typeof fila.username === "string" ? fila.username : null,
    email: String(fila.email ?? ""),
  });
}

/* ------------------------------------------------------------------ */
/* Crear cuenta                                                        */
/* ------------------------------------------------------------------ */

export async function crearCuenta(
  _prev: CredentialState,
  formData: FormData,
): Promise<CredentialState> {
  const session = await getManagerOrNull();
  if (!session) return SIN_PERMISO;
  if (!isServiceRoleConfigured()) return SIN_SERVICE_ROLE;

  const fullName = text(formData, "full_name");
  const usuario = normalizarUsuario(text(formData, "username"));
  const role = normalizeRole(text(formData, "role"));
  const emailContacto = textOrNull(formData, "email_contacto");
  const passwordEscrita = text(formData, "password");

  if (fullName === "") return fail("Escribe el nombre completo de la persona.");
  if (usuario === "")
    return fail("Escribe el usuario con el que ingresará al portal.");
  if (!esUsuarioValido(usuario)) return fail(`Ese usuario no es válido. ${AYUDA_USUARIO}`);
  if (emailContacto !== null && !esCorreoValido(emailContacto))
    return fail("El correo de contacto no parece válido. Revísalo o déjalo vacío.");
  if (passwordEscrita !== "" && passwordEscrita.length < PASSWORD_MINIMO)
    return fail(
      `La contraseña inicial debe tener al menos ${PASSWORD_MINIMO} caracteres. Déjala vacía si prefieres que el panel genere una.`,
    );
  if (!puedeGestionarRol(session.profile.role, role))
    return fail(
      "Solo un administrador puede crear cuentas de administrador. Elige otro rol.",
    );

  if (await usuarioOcupado(session.supabase, usuario))
    return fail(
      `Ya existe una cuenta con el usuario «${usuario}». Elige otro, por ejemplo añadiendo la inicial del segundo apellido.`,
    );

  const admin = getServiceRoleSupabase();
  if (!admin) return SIN_SERVICE_ROLE;

  const email = emailDeUsuario(usuario);
  const password = passwordEscrita !== "" ? passwordEscrita : generarPassword();

  const { data, error } = await admin.auth.admin.createUser({
    email,
    password,
    // Sin correo de verificación: el subdominio de las cuentas no recibe correo
    // y quien crea la cuenta es la propia empresa.
    email_confirm: true,
    // EL ROL VA AQUÍ. `handle_new_user` lo lee de `raw_app_meta_data`.
    app_metadata: { role },
    user_metadata: {
      full_name: fullName,
      username: usuario,
      cargo: textOrNull(formData, "cargo") ?? "",
      phone: textOrNull(formData, "phone") ?? "",
      cedula: textOrNull(formData, "cedula") ?? "",
      email_contacto: emailContacto ?? "",
    },
  });

  if (error || !data?.user) {
    const mensaje = error?.message ?? "";
    if (/already|registered|exists/i.test(mensaje))
      return fail(`Ya existe una cuenta con el usuario «${usuario}».`);
    if (/password/i.test(mensaje))
      return fail(
        `Supabase rechazó la contraseña: debe tener al menos ${PASSWORD_MINIMO} caracteres.`,
      );
    return fail(mensaje || "No fue posible crear la cuenta. Inténtalo de nuevo.");
  }

  // Red de seguridad: si el trigger `on_auth_user_created` no hubiera podido
  // ejecutarse, el perfil se crea aquí con la service-role.
  const { error: perfilError } = await admin.from("profiles").upsert(
    {
      id: data.user.id,
      email,
      username: usuario,
      full_name: fullName,
      role,
      cargo: textOrNull(formData, "cargo"),
      phone: textOrNull(formData, "phone"),
      cedula: textOrNull(formData, "cedula"),
      email_contacto: emailContacto,
      active: true,
    },
    { onConflict: "id" },
  );

  if (perfilError)
    return fail(
      `La cuenta se creó, pero su ficha quedó incompleta (${perfilError.message}). Ábrela desde el listado y guárdala de nuevo.`,
    );

  revalidarEquipo();

  return {
    status: "success",
    message: `Cuenta creada para ${fullName}.`,
    credential: { usuario, password, kind: "created" },
  };
}

/* ------------------------------------------------------------------ */
/* Editar cuenta                                                       */
/* ------------------------------------------------------------------ */

export async function actualizarCuenta(
  _prev: CredentialState,
  formData: FormData,
): Promise<CredentialState> {
  const session = await getManagerOrNull();
  if (!session) return SIN_PERMISO;

  const id = text(formData, "id");
  if (!id) return fail("Falta el identificador de la cuenta.");

  const encontrada = await cuentaGestionable(session.supabase, session.profile.role, id);
  if (!encontrada.ok) return encontrada.estado;

  const rolNuevo = normalizeRole(text(formData, "role"));
  if (!puedeGestionarRol(session.profile.role, rolNuevo))
    return fail("Solo un administrador puede asignar el rol de administrador.");

  const fullName = text(formData, "full_name");
  if (fullName === "") return fail("El nombre completo es obligatorio.");

  const emailContacto = textOrNull(formData, "email_contacto");
  if (emailContacto !== null && !esCorreoValido(emailContacto))
    return fail("El correo de contacto no parece válido. Revísalo o déjalo vacío.");

  const active = bool(formData, "active");
  const esUnoMismo = id === session.profile.id;

  if (esUnoMismo && !active)
    return fail(
      "No puedes desactivar tu propia cuenta. Pídeselo a otro administrador.",
    );
  if (esUnoMismo && rolNuevo !== encontrada.rol)
    return fail("No puedes cambiar tu propio rol. Pídeselo a otro administrador.");

  // El usuario NO se cambia: es la identidad de la cuenta en Auth.
  const { error } = await session.supabase
    .from("profiles")
    .update({
      full_name: fullName,
      role: rolNuevo,
      cargo: textOrNull(formData, "cargo"),
      phone: textOrNull(formData, "phone"),
      cedula: textOrNull(formData, "cedula"),
      email_contacto: emailContacto,
      active,
    })
    .eq("id", id);

  if (error) {
    // El trigger `profiles_proteger` habla en español y dice exactamente qué
    // regla se violó: se pasa tal cual.
    if (error.code === "42501") return fail(error.message);
    return fail(`No se pudieron guardar los cambios: ${error.message}`);
  }

  // El rol también se replica en `app_metadata` para que la cuenta no quede
  // incoherente si algún día se recreara el perfil desde el trigger.
  const admin = getServiceRoleSupabase();
  if (admin) {
    await admin.auth.admin.updateUserById(id, {
      app_metadata: { role: rolNuevo },
      user_metadata: { full_name: fullName, username: usuarioDeFila(encontrada.fila) },
    });
  }

  revalidarEquipo();
  return {
    status: "success",
    message: active
      ? "Cambios guardados."
      : "Cambios guardados. La cuenta quedó desactivada y ya no puede iniciar sesión.",
  };
}

/* ------------------------------------------------------------------ */
/* Activar / desactivar desde el listado                               */
/* ------------------------------------------------------------------ */

/**
 * Atajo de una pulsación. Hace lo mismo que el interruptor de la ficha, con las
 * mismas comprobaciones: existe porque desactivar a alguien que se fue de la
 * empresa es lo más urgente que se hace en esta pantalla y no debería obligar a
 * abrir un formulario.
 */
export async function alternarActiva(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const session = await getManagerOrNull();
  if (!session) return SIN_PERMISO;

  const id = text(formData, "id");
  if (!id) return fail("Falta el identificador de la cuenta.");
  if (id === session.profile.id)
    return fail("No puedes desactivar ni reactivar tu propia cuenta.");

  const encontrada = await cuentaGestionable(session.supabase, session.profile.role, id);
  if (!encontrada.ok) return encontrada.estado;

  const activa = text(formData, "active") === "true";

  const { error } = await session.supabase
    .from("profiles")
    .update({ active: activa })
    .eq("id", id);

  if (error) return fail(error.code === "42501" ? error.message : error.message);

  revalidarEquipo();
  return {
    status: "success",
    message: activa ? "Cuenta reactivada." : "Cuenta desactivada.",
  };
}

/* ------------------------------------------------------------------ */
/* Restablecer contraseña                                              */
/* ------------------------------------------------------------------ */

/**
 * Genera una contraseña nueva y la devuelve UNA sola vez.
 *
 * No se guarda en ninguna parte ni se puede volver a consultar: si se pierde,
 * se vuelve a restablecer. Es lo correcto —una contraseña recuperable no es una
 * contraseña— y por eso la pantalla insiste en copiarla antes de cerrar.
 */
export async function restablecerPassword(
  _prev: CredentialState,
  formData: FormData,
): Promise<CredentialState> {
  const session = await getManagerOrNull();
  if (!session) return SIN_PERMISO;
  if (!isServiceRoleConfigured()) return SIN_SERVICE_ROLE;

  const id = text(formData, "id");
  if (!id) return fail("Falta el identificador de la cuenta.");

  const encontrada = await cuentaGestionable(session.supabase, session.profile.role, id);
  if (!encontrada.ok) return encontrada.estado;

  const admin = getServiceRoleSupabase();
  if (!admin) return SIN_SERVICE_ROLE;

  const password = generarPassword();
  const { error } = await admin.auth.admin.updateUserById(id, { password });
  if (error) return fail(`No se pudo restablecer la contraseña: ${error.message}`);

  return {
    status: "success",
    message: "Contraseña restablecida.",
    credential: {
      usuario: usuarioDeFila(encontrada.fila),
      password,
      kind: "reset",
    },
  };
}

/* ------------------------------------------------------------------ */
/* Eliminar cuenta                                                     */
/* ------------------------------------------------------------------ */

/**
 * DOBLE CONFIRMACIÓN (regla 6): además del aviso del navegador, hay que
 * escribir el usuario exacto. Borrar la cuenta de Auth arrastra su perfil y sus
 * jornadas (`on delete cascade`): no puede ser un clic distraído.
 */
export async function eliminarCuenta(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const session = await getManagerOrNull();
  if (!session) return SIN_PERMISO;
  if (!isServiceRoleConfigured()) return SIN_SERVICE_ROLE;

  const id = text(formData, "id");
  if (!id) return fail("Falta el identificador de la cuenta.");
  if (id === session.profile.id) return fail("No puedes eliminar tu propia cuenta.");

  const encontrada = await cuentaGestionable(session.supabase, session.profile.role, id);
  if (!encontrada.ok) return encontrada.estado;

  const esperado = usuarioDeFila(encontrada.fila).toLowerCase();
  if (text(formData, "confirm_usuario").toLowerCase() !== esperado)
    return fail(
      "Para eliminar la cuenta hay que escribir su usuario exactamente como aparece arriba.",
    );

  const admin = getServiceRoleSupabase();
  if (!admin) return SIN_SERVICE_ROLE;

  const { error } = await admin.auth.admin.deleteUser(id);
  if (error) return fail(`No se pudo eliminar la cuenta: ${error.message}`);

  revalidarEquipo();
  redirect("/admin/equipo");
}
