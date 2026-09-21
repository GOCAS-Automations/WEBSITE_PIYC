/**
 * LECTURAS SOBRE `site_settings.contact`
 * ======================================
 * Módulo **puro** (sin React, sin `next/*`): despeja del JSON de contacto los
 * datos que las páginas necesitan, con los respaldos y validaciones en un solo
 * sitio. Así ningún componente tiene que saber que `phones` es un arreglo ni
 * que `intl` va sin `+`.
 *
 * Todo devuelve `null`/`""` cuando el dato no está: el sitio no pinta el
 * bloque en vez de mostrar un hueco o inventarse un valor.
 */

import type { AjustesContact, CorreoContacto, TelefonoContacto } from "@/lib/content-types";
import { enlaceWhatsApp, soloDigitos } from "@/lib/whatsapp";

/** Mensajes prearmados de los enlaces de WhatsApp del sitio. */
export const MENSAJES_WHATSAPP = {
  general:
    "Hola, PIYC. Quiero información sobre sus servicios de automatización e ingeniería eléctrica.",
  cotizacion: "Hola, PIYC. Quiero solicitar una cotización para un proyecto.",
  /** CTA de una página de servicio: lleva el nombre del servicio. */
  servicio: (nombre: string) => `Hola, PIYC. Quiero información sobre ${nombre}.`,
  /** CTA de un caso de éxito. */
  proyecto: (titulo: string) =>
    `Hola, PIYC. Vi el caso «${titulo}» en su sitio y quiero algo parecido para mi planta.`,
} as const;

/** El WhatsApp principal: el marcado `principal`, o el primero que haya. */
export function whatsappPrincipal(contacto: AjustesContact): string {
  const marcado = contacto.whatsapp?.find((numero) => numero.principal)?.intl;
  const explicito = contacto.primaryWhatsApp;
  const primero = contacto.whatsapp?.[0]?.intl;
  return soloDigitos(marcado || explicito || primero || "");
}

/**
 * DESTINO DEL FORMULARIO DE CONTACTO.
 * Sale de `whatsappFormulario`, y si no está, del principal. **Nunca** del
 * payload del formulario (regla 5 de AGENTS.md).
 */
export function whatsappFormulario(contacto: AjustesContact): string {
  return soloDigitos(contacto.whatsappFormulario || "") || whatsappPrincipal(contacto);
}

/** Enlace `wa.me` al número principal, con el mensaje ya escrito. */
export function enlaceWhatsAppDe(contacto: AjustesContact, mensaje?: string): string {
  return enlaceWhatsApp(whatsappPrincipal(contacto), mensaje);
}

/** El teléfono que se muestra: el primero de `phones`, o el WhatsApp principal. */
export function telefonoPrincipal(contacto: AjustesContact): TelefonoContacto | null {
  const telefono = contacto.phones?.[0];
  if (telefono?.label) return telefono;

  const whatsapp = contacto.whatsapp?.find((numero) => numero.principal) ?? contacto.whatsapp?.[0];
  return whatsapp?.label ? { label: whatsapp.label, intl: whatsapp.intl } : null;
}

/** `tel:` en formato E.164. */
export function hrefTelefono(telefono: TelefonoContacto | null): string {
  if (!telefono?.intl) return "";
  return `tel:+${soloDigitos(telefono.intl)}`;
}

export function correosVisibles(contacto: AjustesContact): CorreoContacto[] {
  return (contacto.emails ?? []).filter((correo) => Boolean(correo.address));
}

export function correoPrincipal(contacto: AjustesContact): string {
  return correosVisibles(contacto)[0]?.address ?? "";
}

/** `@piyc_sas` a partir de la URL del perfil. */
export function usuarioInstagram(url: string | undefined): string {
  if (!url) return "";
  const limpio = url.replace(/\/+$/, "").split("/").pop();
  return limpio ? `@${limpio}` : "";
}

/** Dirección en una línea, con lo que haya. */
export function direccionEnLinea(contacto: AjustesContact): string {
  const direccion = contacto.address;
  if (!direccion) return "";
  if (direccion.full) return direccion.full;
  return [direccion.street, direccion.area, direccion.city, direccion.region]
    .filter(Boolean)
    .join(", ");
}

/**
 * URL del mapa embebido de Google.
 * `output=embed` es la forma sin clave de API; la CSP ya permite
 * `https://www.google.com` en `frame-src` (ver `next.config.ts`).
 */
export function urlMapaEmbebido(contacto: AjustesContact): string {
  const consulta = contacto.mapsQuery || direccionEnLinea(contacto);
  if (!consulta) return "";
  return `https://www.google.com/maps?q=${encodeURIComponent(consulta)}&output=embed`;
}

/** Enlace para abrir la dirección en Google Maps en una pestaña nueva. */
export function urlMapaExterno(contacto: AjustesContact): string {
  const consulta = contacto.mapsQuery || direccionEnLinea(contacto);
  if (!consulta) return "";
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(consulta)}`;
}
