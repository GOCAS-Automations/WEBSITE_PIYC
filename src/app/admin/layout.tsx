import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AdminShell } from "@/components/admin/AdminShell";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { requireContentEditor } from "@/lib/supabase/auth";
import { signOutAction } from "@/lib/session-actions";

export const metadata: Metadata = {
  title: "Panel de administración",
  // El panel nunca se indexa.
  robots: { index: false, follow: false },
};

/**
 * El panel depende de la sesión: se evalúa en cada petición, nunca se cachea.
 * Es también lo que hace imprescindibles las tres piezas de la regla 2
 * (`loading.tsx`, `PuntoDeCarga` y `prefetch={false}`).
 */
export const dynamic = "force-dynamic";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Sin Supabase configurado no hay panel posible: se envía al portal, que
  // explica qué falta.
  if (!isSupabaseConfigured()) redirect("/mi-cuenta");

  // VERIFICACIÓN AUTORITATIVA: sesión válida, cuenta activa y rol con permiso
  // de contenido (admin | coordinador). El proxy ya rebotó a quien no tenía
  // sesión, pero eso es solo una redirección optimista; la barrera es esta, y
  // cada server action vuelve a comprobar por su cuenta.
  const { profile } = await requireContentEditor();

  return (
    <AdminShell
      identificador={profile.identificador}
      nombre={profile.fullName}
      role={profile.role}
      signOut={signOutAction}
    >
      {children}
    </AdminShell>
  );
}
