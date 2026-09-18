import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { SUPABASE_ANON_KEY, SUPABASE_URL, isSupabaseConfigured } from "./config";
import type { Database } from "./database.types";

/**
 * Cliente ANÓNIMO de lectura (sin cookies).
 *
 * Lo usa la capa de contenido (`src/lib/content.ts`) para que las páginas
 * públicas sigan siendo estáticas/ISR: al no tocar `cookies()` no se fuerza el
 * render dinámico. Las tablas `site_*` tienen SELECT público por RLS (solo lo
 * `published`).
 */
export function getPublicSupabase(): SupabaseClient<Database> | null {
  if (!isSupabaseConfigured()) return null;
  return createClient<Database>(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

/**
 * Cliente de servidor ligado a la sesión del usuario (cookies).
 *
 * En Next.js 16 `cookies()` es asíncrono y solo admite escritura en Server
 * Functions y Route Handlers. Desde un Server Component `set` lanza: por eso
 * `setAll` va en try/catch — el refresco de la sesión lo hace el proxy
 * (`src/proxy.ts`, día 5) en cada request, y es ahí donde también se aplican
 * los encabezados anti-caché que @supabase/ssr entrega como segundo argumento.
 *
 * Crear un cliente nuevo por request (nunca cachearlo entre requests).
 */
export async function getServerSupabase(): Promise<SupabaseClient<Database> | null> {
  if (!isSupabaseConfigured()) return null;

  const cookieStore = await cookies();

  return createServerClient<Database>(SUPABASE_URL, SUPABASE_ANON_KEY, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          for (const { name, value, options } of cookiesToSet) {
            cookieStore.set(name, value, options);
          }
        } catch {
          // Server Component: la escritura la resuelve el proxy. Ignorable.
        }
      },
    },
  });
}
