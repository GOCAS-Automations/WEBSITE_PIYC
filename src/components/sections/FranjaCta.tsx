/**
 * FRANJA DE CIERRE (CTA)
 * ======================
 * La banda oscura con la que cierran todas las páginas. Es el único lugar
 * donde el azul 950 ocupa el ancho completo, y sostiene el ritmo de fondos
 * blanco → retícula → oscuro.
 *
 * El botón verde de WhatsApp es el acento; el resto es azul y acero.
 */

import type { ReactNode } from "react";
import { BotonSecundario, BotonWhatsApp, Contenedor, TituloSeccion } from "./primitivas";

export function FranjaCta({
  titulo,
  texto,
  hrefWhatsApp,
  etiquetaWhatsApp = "Escríbanos por WhatsApp",
  hrefSecundario = "/contacto",
  etiquetaSecundaria = "Ir al formulario de contacto",
  children,
}: {
  titulo: string;
  texto?: string;
  hrefWhatsApp: string;
  etiquetaWhatsApp?: string;
  hrefSecundario?: string;
  etiquetaSecundaria?: string;
  children?: ReactNode;
}) {
  return (
    <section aria-labelledby="titulo-cta" className="sobre-oscuro relative bg-azul-950">
      {/* Filete superior con el acento verde: una sola marca, sin fondo verde. */}
      <div aria-hidden="true" className="h-1 w-full bg-verde-500" />

      <Contenedor className="py-14 lg:py-16">
        <div className="grid gap-8 lg:grid-cols-12 lg:items-end lg:gap-12">
          <div className="lg:col-span-7">
            <TituloSeccion id="titulo-cta" tono="oscuro">
              {titulo}
            </TituloSeccion>
            {texto ? (
              <p className="mt-5 max-w-[60ch] text-base leading-relaxed text-acero-200 sm:text-[1.0625rem]">
                {texto}
              </p>
            ) : null}
            {children}
          </div>

          <div className="flex flex-col gap-3 sm:flex-row lg:col-span-5 lg:justify-end">
            <BotonWhatsApp href={hrefWhatsApp}>{etiquetaWhatsApp}</BotonWhatsApp>
            <BotonSecundario href={hrefSecundario} tono="oscuro">
              {etiquetaSecundaria}
            </BotonSecundario>
          </div>
        </div>
      </Contenedor>
    </section>
  );
}
