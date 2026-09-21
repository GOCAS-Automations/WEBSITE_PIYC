/**
 * ⚠ ARCHIVO DE COMPATIBILIDAD — NO AGREGAR DATOS AQUÍ
 * ===================================================
 * Los datos de contacto viven en **`site_settings.contact`** y su respaldo
 * estático es `contactEstatico` (`src/data/ajustes.ts`), que replica la
 * semilla de `0001_contenido.sql` §6.
 *
 * Este módulo solo existe para no romper los importadores anteriores. Todo lo
 * que exporta se **deriva** de `contactEstatico`: no hay un segundo juego de
 * datos que se pueda desincronizar.
 *
 * En código nuevo:
 *   - Server Component → `getContacto()` de `src/lib/content.ts`.
 *   - Helpers (teléfono, correo, WhatsApp, mapa) → `src/lib/contacto.ts`.
 */

import { contactEstatico } from "./ajustes";
import { MENSAJES_WHATSAPP, telefonoPrincipal, whatsappPrincipal } from "@/lib/contacto";

const telefono = telefonoPrincipal(contactEstatico);

/** @deprecated Usa `getContacto()` (`src/lib/content.ts`). */
export const contacto = {
  razonSocial: contactEstatico.legalName ?? "",
  nombreComercial: contactEstatico.companyName ?? "",
  nit: contactEstatico.nit ?? "",
  eslogan: contactEstatico.tagline ?? "",
  direccion: {
    via: contactEstatico.address?.street ?? "",
    sector: contactEstatico.address?.area ?? "",
    ciudad: contactEstatico.address?.city ?? "",
    departamento: contactEstatico.address?.region ?? "",
    pais: "CO",
  },
  telefono: {
    visible: telefono?.label ?? "",
    e164: telefono?.intl ? `+${telefono.intl}` : "",
  },
  whatsapp: whatsappPrincipal(contactEstatico),
  correo: contactEstatico.emails?.[0]?.address ?? "",
  instagram: contactEstatico.social?.instagram ?? "",
  dominio: contactEstatico.siteUrl ?? "https://piycsas.com",
} as const;

/** @deprecated Usa `MENSAJES_WHATSAPP` (`src/lib/contacto.ts`). */
export const mensajesWhatsApp = {
  general: MENSAJES_WHATSAPP.general,
  cotizacion: MENSAJES_WHATSAPP.cotizacion,
} as const;
