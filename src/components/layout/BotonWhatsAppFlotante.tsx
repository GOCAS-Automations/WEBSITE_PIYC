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
 *  - **Cuándo se ve** lo decide `FlotanteWhatsApp` (Client Component): no
 *    aparece hasta que el visitante baja, y se retira al llegar al pie. Aquí
 *    solo se resuelve el número, que es trabajo de servidor.
 *  - Va dentro de un `aside`: un elemento suelto colgando de `<body>` queda
 *    fuera de todo landmark.
 *  - **En `/contacto` no se pinta**: ahí tapaba el botón de enviar del
 *    formulario en móvil, y el visitante ya tiene los números a la vista. Lo
 *    decide `FlotanteWhatsApp` con `usePathname()`.
 */

import { getContacto } from "@/lib/content";
import { MENSAJES_WHATSAPP, enlaceWhatsAppDe } from "@/lib/contacto";
import { FlotanteWhatsApp } from "./FlotanteWhatsApp";

export async function BotonWhatsAppFlotante() {
  const contacto = await getContacto();
  const href = enlaceWhatsAppDe(contacto, MENSAJES_WHATSAPP.general);
  if (!href) return null;

  return <FlotanteWhatsApp href={href} />;
}
