/**
 * 404 — página no encontrada.
 *
 * Vive en la raíz de `app/` (no dentro de `(sitio)`) porque Next usa el
 * `not-found.tsx` más cercano y este tiene que cubrir también las URL que no
 * caen en ningún grupo. Por eso pinta su propio encabezado y pie: no hereda
 * el layout del sitio.
 */

import type { Metadata } from "next";
import { Encabezado } from "@/components/layout/Encabezado";
import { PieDePagina } from "@/components/layout/PieDePagina";
import { getContacto, getPaginas } from "@/lib/content";
import { MENSAJES_WHATSAPP, enlaceWhatsAppDe } from "@/lib/contacto";
import {
  BotonPrimario,
  BotonSecundario,
  BotonWhatsApp,
  Contenedor,
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

      <main id="contenido" className="fondo-plano flex-1 border-b border-acero-200">
        <Contenedor className="flex min-h-[60vh] flex-col justify-center py-20 lg:py-24">
          <div className="max-w-2xl">
            <p className="font-titulo text-[6rem] font-semibold leading-none tracking-[-0.02em] text-azul-200 sm:text-[8rem]">
              404
            </p>
            <TituloSeccion as="h1" className="mt-4">
              {ajustes?.title ?? "Esta página no existe"}
            </TituloSeccion>
            <p className="mt-6 max-w-[60ch] text-base leading-relaxed text-acero-600 sm:text-[1.0625rem]">
              {ajustes?.body ??
                "El enlace puede estar mal escrito o la página pudo haber cambiado de dirección."}
            </p>

            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <BotonPrimario href="/">Volver al inicio</BotonPrimario>
              <BotonSecundario href="/servicios">Ver los servicios</BotonSecundario>
              {hrefWhatsApp ? <BotonWhatsApp href={hrefWhatsApp}>Escribirnos</BotonWhatsApp> : null}
            </div>
          </div>
        </Contenedor>
      </main>

      <PieDePagina />
    </>
  );
}
