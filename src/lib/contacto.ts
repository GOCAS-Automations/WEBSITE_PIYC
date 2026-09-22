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

/* ===================================================================== */
/* Mapa                                                                   */
/* ===================================================================== */

/**
 * LA FICHA DEL NEGOCIO, NO LA DIRECCIÓN CRUDA
 * -------------------------------------------
 * Cesar: «quiero que salga PIYC PROGRAMACIÓN INDUSTRIAL Y CONTROL SAS, no la
 * dirección cruda». Buscar por texto (`?q=Cl. 33 #5-76…`) planta un pin sin
 * nombre; lo que muestra la ficha con su rótulo es el **CID** del negocio.
 *
 * El CID es el segundo hexadecimal del tramo `!1s0x…:0x…` de la URL larga de
 * Google Maps, pasado a decimal:
 *   `0x37f6221799314f66` → 4032448001106595686
 *
 * Comprobado en un iframe real (`?cid=…&output=embed`): sale la tarjeta con
 * «PIYC PROGRAMACION INDUSTRIAL Y CONTROL SAS» y el pin rotulado.
 *
 * Va en código como respaldo, no como única fuente: el panel puede sustituir
 * las dos URL desde Ajustes → Mapa si PIYC cambia de sede o de ficha.
 *
 * `output=embed` es la forma sin clave de API, y la CSP ya permite
 * `https://www.google.com` en `frame-src` (ver `next.config.ts`): no hace
 * falta abrir ningún origen nuevo.
 */
const CID_FICHA_GOOGLE: string = "4032448001106595686";

/** Respaldo en código de la ficha de Google de PIYC. */
export const URL_FICHA_GOOGLE: string =
  "https://www.google.com/maps/place/PIYC+PROGRAMACION+INDUSTRIAL+Y+CONTROL+SAS/@3.4579204,-76.5164019,17z/data=!4m6!3m5!1s0x2d231fb0340d391f:0x37f6221799314f66!8m2!3d3.457915!4d-76.513827!16s%2Fg%2F11y6rd3ykb";

/** `https://www.google.com/maps?cid=…&output=embed` para un CID dado. */
function embedDeCid(cid: string): string {
  return `https://www.google.com/maps?cid=${encodeURIComponent(cid)}&output=embed`;
}

/**
 * URL del iframe del mapa. Por orden: la que ponga el panel, el CID de la
 * ficha y —solo si alguien vaciara el respaldo de arriba— la búsqueda por
 * dirección, que pinta un pin sin nombre pero es mejor que un hueco. Las dos
 * constantes van tipadas como `string` para que ese último tramo no quede
 * como código muerto ante el compilador.
 */
export function urlMapaEmbebido(contacto: AjustesContact): string {
  const delPanel = contacto.mapsEmbedUrl?.trim();
  if (delPanel) return delPanel;
  if (CID_FICHA_GOOGLE) return embedDeCid(CID_FICHA_GOOGLE);

  const consulta = contacto.mapsQuery || direccionEnLinea(contacto);
  if (!consulta) return "";
  return `https://www.google.com/maps?q=${encodeURIComponent(consulta)}&output=embed`;
}

/**
 * Enlace «Abrir en Google Maps» (mapa de `/contacto` y pie de página): lleva a
 * la **ficha** del negocio, no a una búsqueda por dirección.
 */
export function urlMapaExterno(contacto: AjustesContact): string {
  const delPanel = contacto.mapsPlaceUrl?.trim();
  if (delPanel) return delPanel;
  if (URL_FICHA_GOOGLE) return URL_FICHA_GOOGLE;

  const consulta = contacto.mapsQuery || direccionEnLinea(contacto);
  if (!consulta) return "";
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(consulta)}`;
}
