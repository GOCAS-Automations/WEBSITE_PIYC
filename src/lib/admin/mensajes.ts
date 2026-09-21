/**
 * UTILIDADES DE LA BANDEJA DE MENSAJES — módulo PURO
 * ==================================================
 * Formato de fechas y armado del enlace para responderle a un lead por
 * WhatsApp. Sin `next/*` ni Supabase: lo usan Server Components y, si hiciera
 * falta, también un componente de cliente.
 *
 * OJO CON LA REGLA 5 DE `AGENTS.md`
 * ---------------------------------
 * Lo que jamás puede salir del payload es el **destino del formulario público**
 * (`contact.whatsappFormulario`). Aquí es al revés: se le responde a la persona
 * que escribió, así que el número ES el suyo, el que dejó en el formulario.
 * El servidor no le manda nada: solo se abre WhatsApp con el mensaje escrito
 * para que quien atiende lo revise antes de enviarlo.
 */

import type { MensajeRow } from "@/lib/admin-types";

/** Zona horaria de Colombia. El servidor puede estar en cualquier parte. */
const ZONA = "America/Bogota";

/** «18 sep 2026, 3:42 p. m.» */
export function formatearFechaLarga(iso: string): string {
  const fecha = new Date(iso);
  if (Number.isNaN(fecha.getTime())) return "";
  return new Intl.DateTimeFormat("es-CO", {
    timeZone: ZONA,
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(fecha);
}

/** «18 sep» — para las listas, donde el año sobra. */
export function formatearFechaCorta(iso: string): string {
  const fecha = new Date(iso);
  if (Number.isNaN(fecha.getTime())) return "";
  return new Intl.DateTimeFormat("es-CO", {
    timeZone: ZONA,
    day: "numeric",
    month: "short",
  }).format(fecha);
}

/**
 * Deja un teléfono en el formato que pide `wa.me`: solo dígitos y con
 * indicativo. A un número colombiano de 10 dígitos se le antepone el 57; el que
 * ya viene con indicativo se deja como está.
 */
export function telefonoInternacional(valor: string): string {
  const digitos = valor.replace(/\D/g, "");
  if (digitos.length === 10 && digitos.startsWith("3")) return `57${digitos}`;
  if (digitos.startsWith("57")) return digitos;
  return digitos;
}

/** Enlace de WhatsApp para responderle a quien escribió, con saludo armado. */
export function enlaceWhatsAppLead(mensaje: MensajeRow): string {
  const numero = telefonoInternacional(mensaje.telefono);
  const saludo = [
    `Hola ${mensaje.nombre.split(" ")[0]}, te escribimos de PIYC (Programación Industrial y Control).`,
    mensaje.servicio
      ? `Recibimos tu solicitud sobre ${mensaje.servicio} y queremos ayudarte.`
      : "Recibimos tu mensaje desde nuestro sitio web y queremos ayudarte.",
  ].join(" ");
  return `https://wa.me/${numero}?text=${encodeURIComponent(saludo)}`;
}
