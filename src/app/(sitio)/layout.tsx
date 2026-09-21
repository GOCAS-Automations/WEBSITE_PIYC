/**
 * LAYOUT DEL SITIO PÚBLICO
 * ========================
 * Grupo de rutas `(sitio)`: no aparece en la URL, pero separa lo público del
 * panel. Todo lo que hay aquí —encabezado, pie, botón flotante y JSON-LD—
 * queda **fuera** de `/admin` y `/mi-cuenta`, que tienen su propio chrome.
 *
 * El sitio público es estático + ISR y nunca dinámico: `revalidate` se declara
 * también en cada página, porque una página puede revalidar por su cuenta.
 */

import { BotonWhatsAppFlotante } from "@/components/layout/BotonWhatsAppFlotante";
import { Encabezado } from "@/components/layout/Encabezado";
import { PieDePagina } from "@/components/layout/PieDePagina";
import { JsonLd } from "@/components/ui/JsonLd";
import { getContacto } from "@/lib/content";
import { jsonLdSitio } from "@/lib/seo";

export const revalidate = 300;

export default async function LayoutSitio({ children }: { children: React.ReactNode }) {
  const contacto = await getContacto();

  return (
    <>
      {/* Organization + LocalBusiness + WebSite, una sola vez para todo el sitio. */}
      <JsonLd datos={jsonLdSitio(contacto)} />

      <a
        href="#contenido"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:bg-azul-950 focus:px-4 focus:py-2 focus:text-blanco"
      >
        Saltar al contenido
      </a>

      <Encabezado />
      {children}
      <PieDePagina />
      <BotonWhatsAppFlotante />
    </>
  );
}
