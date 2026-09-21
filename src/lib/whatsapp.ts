/**
 * ENLACES DE WHATSAPP
 * ===================
 * Módulo **puro**: sin React y sin `next/*`. Lo usan el sitio público, la ruta
 * del formulario de contacto y (si hiciera falta) el panel.
 *
 * El número SIEMPRE llega como argumento, nunca se lee aquí de ninguna parte:
 * quien llama decide de dónde sale, y en el formulario de contacto sale
 * exclusivamente de `site_settings.contact.whatsappFormulario` (regla 5 de
 * AGENTS.md — tomarlo del payload convertiría el sitio en un relay abierto).
 */

/** Deja solo los dígitos: `wa.me` no acepta `+`, espacios ni guiones. */
export function soloDigitos(numero: string): string {
  return numero.replace(/\D/g, "");
}

/**
 * Arma el enlace `wa.me` con el mensaje prearmado.
 * Devuelve cadena vacía si el número no es utilizable, para que quien llame
 * pueda decidir no pintar el botón en vez de generar un enlace roto.
 */
export function enlaceWhatsApp(numero: string | null | undefined, mensaje?: string): string {
  const digitos = numero ? soloDigitos(numero) : "";
  if (digitos.length < 8) return "";

  const base = `https://wa.me/${digitos}`;
  const texto = mensaje?.trim();
  return texto ? `${base}?text=${encodeURIComponent(texto)}` : base;
}
