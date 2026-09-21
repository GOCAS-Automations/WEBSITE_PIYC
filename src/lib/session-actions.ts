"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getServerSupabase } from "@/lib/supabase/server";

/**
 * Cierra la sesión de cualquier cuenta del portal y vuelve al ingreso.
 *
 * `revalidatePath("/", "layout")` limpia lo que el router tuviera cacheado de
 * las pantallas con sesión: sin eso, el botón «atrás» del navegador puede
 * mostrar el panel de alguien que ya salió.
 */
export async function signOutAction(): Promise<void> {
  const supabase = await getServerSupabase();
  if (supabase) await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect("/mi-cuenta");
}
