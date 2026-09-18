/**
 * Datos de contacto oficiales de PIYC (respaldo estático).
 * Confirmados por Cesar el 2026-09-18. El contacto es SOLO por WhatsApp:
 * el correo se muestra, pero el sitio no envía correos.
 */
export const contacto = {
  razonSocial: "Programación Industrial y Control S.A.S.",
  nombreComercial: "PIYC",
  nit: "901.161.923",
  eslogan: "Tu socio confiable en soluciones industriales",
  direccion: {
    via: "Cl. 33 #5-76",
    sector: "Comuna 4",
    ciudad: "Cali",
    departamento: "Valle del Cauca",
    pais: "CO",
  },
  telefono: {
    visible: "+57 321 761 7958",
    e164: "+573217617958",
  },
  /** Número para wa.me: solo dígitos, con indicativo de país. */
  whatsapp: "573217617958",
  correo: "jorge.castillo@piycsas.com",
  instagram: "https://www.instagram.com/piyc_sas/",
  dominio: "https://piycsas.com",
} as const;

/** Mensajes prearmados para los enlaces de WhatsApp. */
export const mensajesWhatsApp = {
  general:
    "Hola, PIYC. Quiero información sobre sus servicios de automatización e ingeniería eléctrica.",
  cotizacion: "Hola, PIYC. Quiero solicitar una cotización para un proyecto.",
} as const;
