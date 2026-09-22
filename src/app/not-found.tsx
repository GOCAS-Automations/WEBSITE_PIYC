/**
 * 404 — página no encontrada.
 *
 * Vive en la raíz de `app/` (no dentro de `(sitio)`) porque Next usa el
 * `not-found.tsx` más cercano y este tiene que cubrir también las URL que no
 * caen en ningún grupo. Por eso pinta su propio encabezado y pie: no hereda
 * el layout del sitio.
 */

import type { Metadata } from "next";
import Link from "next/link";
import { Encabezado } from "@/components/layout/Encabezado";
import { PieDePagina } from "@/components/layout/PieDePagina";
import { getContacto, getPaginas } from "@/lib/content";
import { MENSAJES_WHATSAPP, enlaceWhatsAppDe } from "@/lib/contacto";
import { navegacionPrincipal } from "@/data/navegacion";
import {
  BotonPrimario,
  BotonSecundario,
  BotonWhatsApp,
  Contenedor,
  GrupoDeBotones,
  TituloSeccion,
} from "@/components/sections/primitivas";

export const metadata: Metadata = {
  title: "Página no encontrada",
  robots: { index: false, follow: true },
};

export default async function NoEncontrada() {
  const [paginas, contacto] = await Promise.all([getPaginas(), getContacto()]);
  const ajustes = paginas.noEncontrada;
  const hrefWhatsApp = enlaceWhatsAppDe(contacto, MENSAJES_WHATSAPP.general);

  return (
    <>
      <Encabezado />

      <main id="contenido" className="fondo-plano flex-1">
        <Contenedor className="flex min-h-[70vh] flex-col justify-center pb-6 pt-[calc(var(--alto-nav)+2.5rem)] lg:pb-8">
          {/* Dos piezas del mismo alto: la tarjeta con la salida y, a su lado,
              el panel del PLC «sin señal». Antes la tarjeta iba sola a la
              izquierda y dejaba media pantalla vacía. */}
          <div className="grid gap-5 lg:grid-cols-12 lg:gap-6">
          <div className="rounded-lienzo bg-blanco p-8 shadow-elevada sm:p-12 lg:col-span-7">
            {/* El número es decorativo —quien no ve la pantalla necesita «Esta
                página no existe», no «404»— pero igual se pinta con contraste
                suficiente: `azul-500` sobre `relleno` supera 3:1, el mínimo
                para texto grande. En escritorio se muda al panel oscuro. */}
            <p
              aria-hidden="true"
              className="inline-flex items-center rounded-tarjeta bg-relleno px-4 py-1 text-[4.5rem] font-bold leading-none tracking-[-0.04em] text-azul-500 sm:text-[6rem] lg:hidden"
            >
              404
            </p>
            <TituloSeccion as="h1" className="mt-4 lg:mt-0">
              {ajustes?.title ?? "Esta página no existe"}
            </TituloSeccion>
            <p className="mt-6 max-w-[60ch] text-[1.0625rem] leading-[1.65] text-acero-600">
              {ajustes?.body ??
                "El enlace puede estar mal escrito o la página pudo haber cambiado de dirección."}
            </p>

            <GrupoDeBotones className="mt-9">
              <BotonPrimario href="/">Volver al inicio</BotonPrimario>
              <BotonSecundario href="/servicios">Ver los servicios</BotonSecundario>
              {hrefWhatsApp ? <BotonWhatsApp href={hrefWhatsApp}>Escribirnos</BotonWhatsApp> : null}
            </GrupoDeBotones>

            {/* Enlaces útiles: una 404 sin salidas es un callejón. */}
            <nav aria-labelledby="404-enlaces" className="mt-10 border-t border-separador pt-6">
              <h2 id="404-enlaces" className="text-[13px] font-semibold text-acero-600">
                O vaya directo a una de estas páginas
              </h2>
              <ul className="mt-3 flex flex-wrap gap-2">
                {navegacionPrincipal
                  .filter((enlace) => enlace.href !== "/")
                  .map((enlace) => (
                    <li key={enlace.href}>
                      <Link
                        href={enlace.href}
                        className="pulsable inline-flex h-11 items-center rounded-capsula bg-relleno px-4 text-[15px] font-medium text-azul-700 hover:bg-relleno-medio"
                      >
                        {enlace.etiqueta}
                      </Link>
                    </li>
                  ))}
              </ul>
            </nav>
          </div>

          {/* Panel del PLC: la «ruta» es un contacto abierto y la bobina de la
              página no energiza. Decorativo: todo `aria-hidden`. */}
          <div
            aria-hidden="true"
            className="sobre-oscuro fondo-noche hidden flex-col overflow-hidden rounded-lienzo p-6 shadow-elevada ring-1 ring-separador-claro lg:col-span-5 lg:flex"
          >
            <div className="flex items-center justify-between gap-4 px-2">
              <span className="text-[13px] font-medium text-acero-300">PLC-01 · Diagnóstico</span>
              <span className="inline-flex items-center gap-2 rounded-capsula bg-relleno-claro px-2.5 py-1 text-[12px] font-semibold text-acero-200">
                <span className="size-1.5 rounded-capsula bg-acero-400 animate-parpadeo" />
                Sin señal
              </span>
            </div>
            <div className="mt-4 flex flex-1 flex-col items-center justify-center gap-8 rounded-tarjeta bg-azul-950/55 px-6 py-10 ring-1 ring-separador-claro">
              <p className="text-[7.5rem] font-bold leading-none tracking-[-0.05em] text-azul-300">404</p>
              <svg viewBox="0 0 320 96" fill="none" className="w-full max-w-[22rem]">
                <path d="M12 12V84" className="stroke-verde-400" strokeWidth="3" />
                <path d="M308 12V84" className="stroke-acero-600" strokeWidth="3" />
                <path d="M12 44H112" className="stroke-verde-400" strokeWidth="2.5" />
                <path d="M112 30V58M128 30V58" className="stroke-acero-300" strokeWidth="2.5" />
                <path d="M128 44H240M272 44H308" className="stroke-acero-600" strokeWidth="2.5" strokeDasharray="6 6" />
                <path d="M246 30a14 14 0 0 0 0 28M266 30a14 14 0 0 1 0 28" className="stroke-acero-400" strokeWidth="2.5" />
                <text x="120" y="78" textAnchor="middle" className="fill-acero-300 text-[10px] font-semibold tracking-[0.08em]">
                  RUTA
                </text>
                <text x="256" y="78" textAnchor="middle" className="fill-acero-300 text-[10px] font-semibold tracking-[0.08em]">
                  PÁGINA
                </text>
              </svg>
            </div>
          </div>
          </div>
        </Contenedor>
      </main>

      <PieDePagina />
    </>
  );
}
