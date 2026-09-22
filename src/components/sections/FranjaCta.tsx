/**
 * FRANJA DE CIERRE (CTA)
 * ======================
 * El panel azul con el que cierran las páginas: tarjeta grande con luces
 * difusas que flota sobre el lienzo, como el resto de superficies.
 *
 * COMPOSICIÓN (sep-2026)
 * ----------------------
 * Antes el texto iba arriba a la izquierda y los botones abajo a la derecha
 * (`items-end` en una rejilla 7/5): quedaba un vacío grande arriba a la
 * derecha. Ahora son dos columnas **centradas en vertical**: el texto toma el
 * ancho que necesita y los botones, apilados y de igual ancho
 * (`GrupoDeBotones`), se sientan a su lado a media altura. Menos relleno
 * vertical: el panel mide lo que mide su contenido.
 *
 * El botón verde de WhatsApp es el acento; el resto es azul y acero.
 */

import type { ReactNode } from "react";
import {
  BotonSecundario,
  BotonWhatsApp,
  Contenedor,
  GrupoDeBotones,
  TituloSeccion,
} from "./primitivas";

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
    // `data-panel`: tras una sección de fondo lienzo no suma aire arriba
    // (regla de ritmo en `globals.css`); tras una blanca, deja 32–40 px.
    // Abajo no pone nada: el aire hasta el pie lo pone el pie.
    <section aria-labelledby="titulo-cta" data-panel="" className="bg-lienzo pt-8 lg:pt-10">
      <Contenedor>
        <div className="sobre-oscuro overflow-hidden rounded-lienzo fondo-marca px-6 py-10 shadow-elevada sm:px-10 sm:py-12 lg:px-14">
          <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center lg:gap-16">
            <div className="max-w-[48rem]">
              <TituloSeccion id="titulo-cta" tono="oscuro">
                {titulo}
              </TituloSeccion>
              {texto ? (
                <p className="mt-4 max-w-[62ch] text-[1.0625rem] leading-[1.65] text-acero-200">
                  {texto}
                </p>
              ) : null}
              {children}
            </div>

            {/* En fila entre `sm` y `lg`; en escritorio, apilados en la columna
                de la derecha, que mide lo que la etiqueta más larga. */}
            <GrupoDeBotones direccion="fila-hasta-lg">
              <BotonWhatsApp href={hrefWhatsApp}>{etiquetaWhatsApp}</BotonWhatsApp>
              <BotonSecundario href={hrefSecundario} tono="oscuro">
                {etiquetaSecundaria}
              </BotonSecundario>
            </GrupoDeBotones>
          </div>
        </div>
      </Contenedor>
    </section>
  );
}
