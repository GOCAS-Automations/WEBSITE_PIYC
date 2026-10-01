/**
 * LATIDO — mantiene despierto el proyecto de Supabase
 * ===================================================
 * El plan gratuito de Supabase **pausa** un proyecto tras siete días sin
 * actividad en la base. Un proyecto pausado no se pierde, pero deja de
 * responder: el sitio público seguiría en pie gracias al respaldo estático de
 * `src/lib/content.ts`, y en cambio el panel, el portal y el formulario
 * quedarían fuera de servicio hasta que alguien lo reanude a mano desde el
 * tablero de Supabase. Para un sitio entregado a un cliente, eso es una caída.
 *
 * Esta ruta hace una consulta mínima —una fila, una columna— que cuenta como
 * actividad. La dispara el cron de Vercel una vez al día (`vercel.json`).
 *
 * POR QUÉ UNA CONSULTA Y NO UN `ping`
 * -----------------------------------
 * Lo que Supabase mira es la actividad de la **base**, no del dominio. Pedirle
 * la portada al sitio no sirve: con ISR la respuesta sale de la caché y la base
 * ni se entera.
 *
 * SEGURIDAD
 * ---------
 * Si existe `CRON_SECRET`, Vercel la manda como `Authorization: Bearer …` en
 * sus llamadas programadas y aquí se exige: sin ella, 401. Así nadie de fuera
 * puede usar la ruta como fuelle. Si la variable no está definida (desarrollo
 * local), la ruta responde igual — no expone nada: solo dice si la base
 * contestó. Lee con la clave anónima y una tabla de lectura pública, así que
 * ni siquiera necesita privilegios.
 */

import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

/** Nunca se cachea: una respuesta cacheada no despertaría nada. */
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const secreto = process.env.CRON_SECRET;
  if (secreto) {
    const cabecera = request.headers.get("authorization");
    if (cabecera !== `Bearer ${secreto}`) {
      return NextResponse.json({ ok: false }, { status: 401 });
    }
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anon) {
    return NextResponse.json(
      { ok: false, motivo: "faltan las variables de Supabase" },
      { status: 503 },
    );
  }

  const supabase = createClient(url, anon, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  // `site_settings` tiene lectura pública y siempre tiene filas: es la consulta
  // más barata que de verdad toca la base.
  const { error } = await supabase.from("site_settings").select("key").limit(1);

  if (error) {
    console.error("[latido] la base no respondió:", error.message);
    return NextResponse.json({ ok: false, motivo: "sin respuesta" }, { status: 503 });
  }

  return NextResponse.json({ ok: true, momento: new Date().toISOString() });
}
