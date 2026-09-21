"use client";

/**
 * INGRESO AL PORTAL — se entra con USUARIO, no con correo
 * =======================================================
 * El equipo de PIYC no tiene correo corporativo: cada persona recibe un usuario
 * (p. ej. `jperez`). Supabase Auth exige un correo, así que aquí se traduce lo
 * escrito con `credencialDeAcceso()`:
 *   · si contiene "@" se envía tal cual (por si alguna cuenta se creó con un
 *     correo real desde el Dashboard de Supabase);
 *   · si no, se convierte al correo sintético interno `…@cuentas.piycsas.com`,
 *     un subdominio que no recibe correo y que la persona nunca ve.
 *
 * A DÓNDE SE ATERRIZA
 * -------------------
 * · Administrador y coordinador → `/admin`: el panel es su pantalla de trabajo.
 * · Empleado → se queda en `/mi-cuenta`, su portal.
 * `/mi-cuenta?portal=1` sigue mostrando el portal para cualquier rol, así que
 * nadie queda encerrado en el panel.
 *
 * MENSAJES QUE NO REVELAN SI UNA CUENTA EXISTE
 * --------------------------------------------
 * Usuario inexistente y contraseña equivocada dicen **exactamente lo mismo**.
 * Distinguirlos convertiría el formulario en un comprobador de usuarios válidos
 * para quien quisiera probar contraseñas.
 */

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { getBrowserSupabase } from "@/lib/supabase/client";
import { credencialDeAcceso } from "@/lib/usuarios";
import { isContentEditorRole, normalizeRole } from "@/lib/supabase/roles";
import { IconoCandado, IconoFlecha, IconoUsuario } from "@/components/admin/iconos";

const inputIngreso =
  "w-full rounded-fino border border-acero-300 bg-blanco py-3 pl-10 pr-3 text-sm text-azul-950 placeholder:text-acero-400 transition-colors focus:border-azul-700 focus:outline-none focus:ring-2 focus:ring-azul-700/25";

type Estado =
  | { tipo: "reposo" }
  | { tipo: "cargando" }
  | { tipo: "error"; mensaje: string }
  | { tipo: "inactiva" };

/** El mismo texto para credenciales malas y para usuario inexistente. */
const CREDENCIALES_INVALIDAS = "Usuario o contraseña incorrectos.";

export function FormularioIngreso() {
  const router = useRouter();
  const [usuario, setUsuario] = useState("");
  const [password, setPassword] = useState("");
  const [estado, setEstado] = useState<Estado>({ tipo: "reposo" });

  async function enviar(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setEstado({ tipo: "cargando" });

    const supabase = getBrowserSupabase();
    if (!supabase) {
      setEstado({
        tipo: "error",
        mensaje: "El portal todavía no está conectado. Inténtalo más tarde.",
      });
      return;
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email: credencialDeAcceso(usuario),
      password,
    });

    if (error || !data.user) {
      // Cualquier error de credenciales se responde igual. Solo se distinguen
      // los problemas que NO hablan de la existencia de la cuenta (red, tope
      // de intentos), porque ahí callar sería dejar a la persona sin saber qué
      // hacer.
      const mensaje = error?.message ?? "";
      setEstado({
        tipo: "error",
        mensaje: /rate limit|too many/i.test(mensaje)
          ? "Demasiados intentos seguidos. Espera un minuto y vuelve a probar."
          : /fetch|network/i.test(mensaje)
            ? "No hay conexión con el servidor. Revisa tu internet e inténtalo otra vez."
            : CREDENCIALES_INVALIDAS,
      });
      return;
    }

    const { data: perfil } = await supabase
      .from("profiles")
      .select("role, active")
      .eq("id", data.user.id)
      .maybeSingle();

    // Cuenta desactivada: se cierra la sesión al instante. La comprobación
    // autoritativa vive en el servidor; esto solo evita que la persona entre y
    // se encuentre con puertas cerradas sin explicación.
    if (perfil?.active === false) {
      await supabase.auth.signOut();
      setEstado({ tipo: "inactiva" });
      return;
    }

    if (isContentEditorRole(normalizeRole(perfil?.role))) {
      router.replace("/admin");
      router.refresh();
      return;
    }

    // El servidor decide qué pintar en esta misma ruta.
    router.refresh();
  }

  if (estado.tipo === "inactiva") {
    return (
      <div className="rounded-fino border border-azul-300 bg-azul-50 p-6 text-center">
        <p className="font-titulo text-xl font-semibold uppercase tracking-wide text-azul-950">
          Tu cuenta está desactivada
        </p>
        <p className="mt-2 text-sm leading-relaxed text-acero-700">
          Los datos que escribiste son correctos, pero un administrador
          desactivó el acceso de esta cuenta. Comunícate con tu coordinador para
          que la reactive.
        </p>
        <button
          type="button"
          onClick={() => setEstado({ tipo: "reposo" })}
          className="mt-5 inline-flex items-center justify-center rounded-fino border border-acero-300 bg-blanco px-5 py-2.5 text-sm font-semibold text-azul-950 transition-colors hover:border-azul-700 hover:text-azul-700"
        >
          Volver a intentar
        </button>
      </div>
    );
  }

  const cargando = estado.tipo === "cargando";

  return (
    <form onSubmit={enviar} className="space-y-4">
      <div>
        <label
          htmlFor="usuario"
          className="mb-1.5 block text-sm font-semibold text-azul-950"
        >
          Usuario
        </label>
        <div className="relative">
          <IconoUsuario className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-acero-400" />
          <input
            id="usuario"
            name="usuario"
            type="text"
            required
            autoComplete="username"
            autoCapitalize="none"
            autoCorrect="off"
            spellCheck={false}
            value={usuario}
            onChange={(e) => setUsuario(e.target.value)}
            className={inputIngreso}
            placeholder="jperez"
          />
        </div>
        <p className="mt-1.5 text-xs leading-relaxed text-acero-600">
          Es el usuario que te asignó PIYC, no un correo electrónico.
        </p>
      </div>

      <div>
        <label
          htmlFor="password"
          className="mb-1.5 block text-sm font-semibold text-azul-950"
        >
          Contraseña
        </label>
        <div className="relative">
          <IconoCandado className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-acero-400" />
          <input
            id="password"
            name="password"
            type="password"
            required
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={inputIngreso}
            placeholder="••••••••••"
          />
        </div>
      </div>

      {estado.tipo === "error" && (
        <p
          role="alert"
          className="rounded-fino border border-error-300 bg-error-50 px-4 py-3 text-sm text-error-700"
        >
          {estado.mensaje}
        </p>
      )}

      <button
        type="submit"
        disabled={cargando}
        className="inline-flex w-full items-center justify-center gap-2 rounded-fino bg-azul-700 px-6 py-3.5 text-base font-semibold text-blanco transition-colors hover:bg-azul-800 disabled:pointer-events-none disabled:opacity-60"
      >
        {cargando ? "Verificando…" : "Ingresar"}
        {!cargando && <IconoFlecha className="h-5 w-5" />}
      </button>

      <p className="text-center text-xs leading-relaxed text-acero-600">
        ¿Olvidaste tu contraseña? Pídele a tu coordinador que la restablezca
        desde el panel: te entregará una nueva y podrás cambiarla al ingresar.
      </p>
    </form>
  );
}
