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
        <Contenedor className="flex min-h-[70vh] flex-col justify-center pb-20 pt-[calc(var(--alto-nav)+3rem)] lg:pb-24">
          <div className="max-w-2xl rounded-lienzo bg-blanco p-8 shadow-elevada sm:p-12">
            {/* El número es decorativo —quien no ve la pantalla necesita «Esta
                página no existe», no «404»— pero igual se pinta con contraste
                suficiente: `azul-200` daba 1.5:1 sobre blanco y axe lo marcaba.
                `azul-300` sobre `relleno` ronda 3:1, el mínimo para texto
                grande, y mantiene el aire de cifra en marca de agua. */}
            <p
              aria-hidden="true"
              className="inline-flex items-center rounded-tarjeta bg-relleno px-4 py-1 text-[4.5rem] font-bold leading-none tracking-[-0.04em] text-azul-500 sm:text-[6rem]"
            >
              404
            </p>
            <TituloSeccion as="h1" className="mt-4">
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
        </Contenedor>
      </main>

      <PieDePagina />
    </>
  );
}
