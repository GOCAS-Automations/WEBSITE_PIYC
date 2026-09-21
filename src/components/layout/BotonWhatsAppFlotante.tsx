/**
 * BOTÓN FLOTANTE DE WHATSAPP
 * ==========================
 * Server Component: el número sale de `site_settings.contact`. Si no hay
 * número utilizable, **no se pinta nada** en vez de dejar un enlace roto.
 *
 * Detalles que importan:
 *  - `verde-500` con texto e icono `azul-950` (6.6:1). Blanco sobre verde-500
 *    falla el contraste (2.9:1) — ver la tabla de marca en AGENTS.md.
 *  - En escritorio muestra la etiqueta; en móvil solo el icono, para no tapar
 *    contenido en pantallas de 360 px.
 *  - `z-30`: por debajo del encabezado pegajoso (`z-40`) y del visor de
 *    galería (que es un `<dialog>` modal y vive en la capa superior).
 *  - **En `/contacto` no se pinta**: ahí tapaba el botón de enviar del
 *    formulario en móvil, y el visitante ya tiene los números a la vista. Se
 *    resuelve con CSS (`:has()` sobre `main[data-pagina="contacto"]`, ver
 *    `globals.css`) para no convertir el layout en Client Component solo por
 *    leer la ruta.
 */

import { getContacto } from "@/lib/content";
import { MENSAJES_WHATSAPP, enlaceWhatsAppDe } from "@/lib/contacto";
import { IconoWhatsApp } from "@/components/ui/iconos";

export async function BotonWhatsAppFlotante() {
  const contacto = await getContacto();
  const href = enlaceWhatsAppDe(contacto, MENSAJES_WHATSAPP.general);
  if (!href) return null;

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      data-whatsapp-flotante=""
      className="fixed bottom-4 right-4 z-30 inline-flex h-14 items-center gap-3 rounded-fino bg-verde-500 px-4 font-semibold text-azul-950 transition-colors hover:bg-verde-400 sm:bottom-6 sm:right-6"
    >
      <IconoWhatsApp className="size-7 shrink-0" />
      <span className="sr-only sm:not-sr-only sm:pr-1">Escríbenos</span>
    </a>
  );
}
