"use client";

import Link from "next/link";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { IconoFlecha } from "@/components/admin/iconos";

/**
 * REDIRECCIÓN AL PANEL, HECHA EN EL CLIENTE
 * =========================================
 * Quien administra el sitio entra por «Mi cuenta» buscando el PANEL, así que se
 * le lleva allí — salvo que haya pedido el portal a propósito con
 * `/mi-cuenta?portal=1`.
 *
 * ¿Por qué no un `redirect()` del servidor? Porque `/mi-cuenta` es la pantalla
 * de ingreso y el navegador acaba de recibir sus cookies de sesión: un redirect
 * de servidor en la misma respuesta puede leerse antes de que las cookies estén
 * asentadas y devolver a la persona al ingreso, en bucle. Navegando desde el
 * cliente con `router.replace()` la sesión ya está puesta y el enlace manual de
 * abajo sirve de red si el JavaScript no llegara a ejecutarse.
 */
export function IrAlPanel({ nombre }: { nombre: string }) {
  const router = useRouter();

  useEffect(() => {
    router.replace("/admin");
  }, [router]);

  return (
    <main
      id="contenido"
      className="mx-auto flex min-h-[60vh] max-w-sitio flex-col items-center justify-center px-4 py-16 text-center"
    >
      <p className="font-titulo text-xs font-semibold uppercase tracking-[0.18em] text-azul-700">
        Hola, {nombre}
      </p>
      <h1 className="mt-2 font-titulo text-3xl font-semibold uppercase tracking-wide text-azul-950">
        Abriendo el panel…
      </h1>
      <p className="mt-3 max-w-md text-sm leading-relaxed text-acero-600">
        Tu cuenta administra el sitio de PIYC. Si esta pantalla no cambia sola en
        un par de segundos, entra con el botón.
      </p>
      <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
        <Link
          prefetch={false}
          href="/admin"
          className="inline-flex items-center gap-2 rounded-fino bg-azul-700 px-5 py-2.5 text-sm font-semibold text-blanco transition-colors hover:bg-azul-800"
        >
          Ir al panel
          <IconoFlecha className="h-4 w-4" />
        </Link>
        <Link
          prefetch={false}
          href="/mi-cuenta?portal=1"
          className="inline-flex items-center gap-2 rounded-fino border border-acero-300 bg-blanco px-5 py-2.5 text-sm font-semibold text-acero-700 transition-colors hover:border-azul-700 hover:text-azul-700"
        >
          Ver mi portal
        </Link>
      </div>
    </main>
  );
}
