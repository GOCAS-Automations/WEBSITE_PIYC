/**
 * PROXY — en Next.js 16 reemplaza al antiguo `middleware`.
 * =======================================================
 * Dos responsabilidades, ninguna más:
 *
 *  1. **Refrescar la sesión de Supabase** y reescribir las cookies de auth
 *     (patrón oficial de `@supabase/ssr` con `getAll` / `setAll`). Un Server
 *     Component no puede escribir cookies, así que si el token no se renovara
 *     aquí la sesión se caería sola a los pocos minutos.
 *  2. **Redirección optimista**: sin sesión, `/admin` y el interior de
 *     `/mi-cuenta` van al ingreso. La verificación AUTORITATIVA (sesión + rol +
 *     cuenta activa) vive en `src/app/admin/layout.tsx` y en cada server
 *     action; esto solo evita pintar una pantalla que igual iba a rebotar.
 *
 * `/mi-cuenta` a secas NO se redirige: es la pantalla de ingreso.
 *
 * El matcher se limita al panel y al portal. El resto del sitio es estático con
 * ISR y no debe pagar el coste del proxy ni perder el cacheado (regla: el sitio
 * público nunca se vuelve dinámico). Si Supabase no está configurado, el proxy
 * deja pasar la petición sin tocar nada.
 *
 * LOS PREFETCH NO REFRESCAN LA SESIÓN
 * -----------------------------------
 * Un prefetch es especulativo y puede no usarse nunca. Cada uno costaba aquí
 * una llamada a `getUser()` y, peor, podía rotar el refresh token: varios
 * prefetch simultáneos compiten por canjear el MISMO token, Supabase los rota
 * de uno en uno e invalida los canjes perdedores, y la cookie que acaba escrita
 * puede ser la de una petición ya caducada. La siguiente navegación real ve
 * `getUser() === null` y rebota al ingreso. Va de la mano de `prefetch={false}`
 * en toda la navegación del panel (ver `AdminShell`).
 */

import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";
import {
  SUPABASE_ANON_KEY,
  SUPABASE_URL,
  isSupabaseConfigured,
} from "@/lib/supabase/config";

/** Cabecera que Next añade a las peticiones especulativas del router. */
const CABECERA_PREFETCH = "next-router-prefetch";

/** Dónde se ingresa. Es también la única ruta pública de `/mi-cuenta`. */
const RUTA_INGRESO = "/mi-cuenta";

export async function proxy(request: NextRequest) {
  if (!isSupabaseConfigured()) {
    return NextResponse.next();
  }

  if (
    request.headers.get(CABECERA_PREFETCH) === "1" ||
    request.headers.get("purpose") === "prefetch"
  ) {
    return NextResponse.next();
  }

  let response = NextResponse.next({ request });

  const supabase = createServerClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet, headers) {
        for (const { name, value } of cookiesToSet) {
          request.cookies.set(name, value);
        }
        response = NextResponse.next({ request });
        for (const { name, value, options } of cookiesToSet) {
          response.cookies.set(name, value, options);
        }
        // @supabase/ssr entrega aquí los encabezados anti-caché de la sesión.
        for (const [key, value] of Object.entries(headers ?? {})) {
          response.headers.set(key, value);
        }
      },
    },
  });

  // IMPORTANTE: antes de generar cualquier respuesta, para que el refresco de
  // token alcance a escribirse en las cookies.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;
  const esRutaProtegida =
    pathname.startsWith("/admin") ||
    (pathname.startsWith(`${RUTA_INGRESO}/`) && pathname !== RUTA_INGRESO);

  if (!user && esRutaProtegida) {
    const destino = request.nextUrl.clone();
    destino.pathname = RUTA_INGRESO;
    destino.search = "";
    return NextResponse.redirect(destino);
  }

  return response;
}

export const config = {
  matcher: ["/admin/:path*", "/mi-cuenta/:path*"],
};
