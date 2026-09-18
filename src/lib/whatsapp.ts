import { contacto } from "@/data/contacto";

/**
 * Arma el enlace de WhatsApp (wa.me) con un mensaje prearmado.
 * El mensaje se codifica con encodeURIComponent (tildes, signos, saltos de línea).
 */
export function enlaceWhatsApp(mensaje?: string, numero: string = contacto.whatsapp): string {
  const base = `https://wa.me/${numero.replace(/\D/g, "")}`;
  const texto = mensaje?.trim();
  return texto ? `${base}?text=${encodeURIComponent(texto)}` : base;
}
