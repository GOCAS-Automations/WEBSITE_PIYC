"use client";

import { useLinkStatus } from "next/link";

/**
 * INDICADOR DE «ESTA SECCIÓN SE ESTÁ ABRIENDO»
 * ============================================
 * Segunda de las tres piezas obligatorias de la navegación del panel (regla 2
 * de `AGENTS.md`; las otras son `src/app/admin/loading.tsx` y `prefetch={false}`
 * en todos los `<Link>` de `/admin`).
 *
 * Las rutas del panel son `force-dynamic`: entre el clic y el cambio de
 * pantalla pasa lo que tarde Supabase en responder, y hasta entonces el router
 * **no confirma la navegación** — la URL no cambia y nada se mueve. Quien no ve
 * reaccionar el panel vuelve a hacer clic, y cada clic cancela la navegación
 * anterior, así que puede no completarse ninguna. Con este punto girando, el
 * clic siempre hace algo visible y nadie pulsa a ciegas.
 *
 * `useLinkStatus` (Next 16) solo funciona dentro de un `<Link>` y expone su
 * estado pendiente; la documentación lo recomienda justo para este caso (ruta
 * dinámica + `prefetch={false}`).
 *
 * Se pinta SIEMPRE, con `opacity-0` en reposo, para que aparecer no desplace el
 * texto. Va oculto a los lectores de pantalla: el aviso de carga lo da el
 * esqueleto de `app/admin/loading.tsx`, y dos anuncios a la vez sobran.
 */
export function PuntoDeCarga({ className = "" }: { className?: string }) {
  const { pending } = useLinkStatus();
  return (
    <span
      aria-hidden="true"
      className={`h-3.5 w-3.5 shrink-0 rounded-full border-2 border-current border-t-transparent transition-opacity duration-150 ${
        pending ? "animate-spin opacity-70" : "opacity-0"
      } ${className}`}
    />
  );
}
