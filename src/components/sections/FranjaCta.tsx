/**
 * FRANJA DE CIERRE (CTA)
 * ======================
 * El panel oscuro con el que cierran todas las páginas. Sistema v3: ya no es
 * una banda a sangre sino una **tarjeta grande** azul noche con luces difusas,
 * flotando sobre el lienzo como el resto de superficies.
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
    <section aria-labelledby="titulo-cta" className="bg-lienzo pb-6 pt-16 lg:pb-8 lg:pt-20">
      <Contenedor>
        {/* Panel oscuro redondeado, no una banda a sangre: el azul noche flota
            sobre el lienzo como una tarjeta más, en clave iOS. */}
        <div className="sobre-oscuro overflow-hidden rounded-lienzo fondo-marca px-6 py-12 shadow-elevada sm:px-10 lg:px-14 lg:py-14">
          <div className="grid gap-8 lg:grid-cols-12 lg:items-end lg:gap-12">
            <div className="lg:col-span-7">
              <TituloSeccion id="titulo-cta" tono="oscuro">
                {titulo}
              </TituloSeccion>
              {texto ? (
                <p className="mt-5 max-w-[58ch] text-[1.0625rem] leading-[1.65] text-acero-200">
                  {texto}
                </p>
              ) : null}
              {children}
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap lg:col-span-5 lg:justify-end">
              <BotonWhatsApp href={hrefWhatsApp}>{etiquetaWhatsApp}</BotonWhatsApp>
              <BotonSecundario href={hrefSecundario} tono="oscuro">
                {etiquetaSecundaria}
              </BotonSecundario>
            </div>
          </div>
        </div>
      </Contenedor>
    </section>
  );
}
