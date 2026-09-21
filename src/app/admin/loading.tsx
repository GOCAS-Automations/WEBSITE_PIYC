/**
 * FRONTERA DE CARGA DEL PANEL — primera de las tres piezas de la regla 2
 * ======================================================================
 * QUÉ PASA SIN ESTE ARCHIVO
 * -------------------------
 * Todas las rutas de `/admin` son `force-dynamic` y consultan Supabase. Sin una
 * frontera de carga, el router de Next **no confirma la navegación hasta que el
 * servidor termina de renderizar**: la URL no cambia, la pantalla no se mueve y
 * no aparece ningún indicador. En local son 400–700 ms; contra Supabase desde
 * Colombia, varios segundos.
 *
 * Durante esa espera el panel parece congelado, así que quien lo usa vuelve a
 * hacer clic — y **cada clic nuevo cancela la navegación en curso**. Con clics
 * seguidos puede no llegar a completarse ninguna. En GPI se reportó como «se
 * traba, toca recargar» y costó días de diagnóstico.
 *
 * QUÉ HACE
 * --------
 * Crea el `<Suspense>` que le faltaba al segmento: en cuanto el servidor
 * empieza a responder, la pantalla se sustituye por este esqueleto en vez de
 * quedarse con la anterior. Solo reemplaza el `<main>` — el `AdminShell` vive
 * en el layout y se queda quieto, que es lo que hace que el cambio se lea como
 * «esta sección está cargando» y no como «la página se recargó».
 *
 * LAS OTRAS DOS PIEZAS (no quitar ninguna)
 * ----------------------------------------
 *   · `src/components/admin/PuntoDeCarga.tsx` — el punto que gira en el enlace
 *     pulsado a los ~80 ms.
 *   · `prefetch={false}` en todos los `<Link>` de `/admin` — sin él
 *     `useLinkStatus` no tiene estado pendiente que mostrar.
 */
export default function AdminLoading() {
  return (
    <>
      {/* El esqueleto es decorativo, pero el cambio de sección sí debe
          anunciarse. Va FUERA del contenedor `aria-hidden`: un
          `aria-hidden="false"` anidado dentro de uno en `true` no lo revierte
          —el atributo se hereda— y el mensaje quedaría mudo. */}
      <p className="sr-only" role="status">
        Cargando la sección del panel…
      </p>
      <div className="animate-pulse" aria-hidden="true">
        {/* Cabecera: volver + título + descripción */}
        <div className="mb-7">
          <div className="h-9 w-44 rounded-fino bg-blanco" />
          <div className="mt-5 h-9 w-72 rounded-fino bg-blanco" />
          <div className="mt-3 h-4 w-full max-w-2xl rounded-fino bg-blanco/70" />
          <div className="mt-2 h-4 w-2/3 max-w-md rounded-fino bg-blanco/70" />
        </div>

        <div className="space-y-6">
          {[0, 1].map((i) => (
            <div
              key={i}
              className="rounded-fino border border-acero-200 bg-blanco p-5 sm:p-6"
            >
              <div className="h-5 w-52 rounded-fino bg-acero-100" />
              <div className="mt-3 h-3.5 w-full max-w-lg rounded-fino bg-acero-100" />
              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                <div className="h-11 rounded-fino bg-acero-100" />
                <div className="h-11 rounded-fino bg-acero-100" />
                <div className="h-11 rounded-fino bg-acero-100" />
                <div className="h-11 rounded-fino bg-acero-100" />
              </div>
              <div className="mt-6 h-10 w-44 rounded-fino bg-acero-100" />
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
