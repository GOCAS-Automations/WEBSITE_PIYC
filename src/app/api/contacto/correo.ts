/**
 * AVISO POR CORREO DE UN LEAD DEL FORMULARIO
 * ==========================================
 * PIYC pidió (reunión de sept-2026) que, además del registro en `site_mensajes`
 * y del enlace de WhatsApp, **llegue un correo** a quien atiende los mensajes.
 * Este módulo es esa pieza y nada más: recibe un lead ya validado y lo manda
 * por SMTP.
 *
 * TRES COSAS QUE NO SE NEGOCIAN
 * -----------------------------
 * 1. **Apagado por defecto.** Si falta cualquiera de las variables de entorno
 *    del SMTP, `enviarAvisoDeLead` no hace nada y devuelve `"sin-configurar"`.
 *    El formulario se comporta exactamente como antes —lead + WhatsApp— y el
 *    visitante no ve ningún error. Encender el correo es cargar las variables
 *    en Vercel y volver a desplegar (regla 11), sin tocar código.
 * 2. **El correo nunca bloquea la respuesta.** Quien llama usa `after()` de
 *    Next: primero se guarda el lead y se devuelve el enlace de WhatsApp, y el
 *    envío ocurre después. Si el SMTP está caído, el visitante ni se entera.
 * 3. **El destinatario JAMÁS sale del payload** (misma razón que la regla 5 de
 *    `AGENTS.md`): sale de `CONTACT_TO` o, si no está, del correo publicado en
 *    `site_settings.contact`. Tomarlo del formulario convertiría el sitio en
 *    un relay para mandar correo a cualquiera, firmado con el dominio de PIYC.
 *
 * EL `From` TAMPOCO ES EL DEL VISITANTE. Un correo que dice venir de
 * `@gmail.com` saliendo del SMTP de PIYC lo marca SPF/DMARC como falsificado y
 * termina en spam. El remitente es siempre una dirección del dominio que
 * autentica el envío (`CONTACT_FROM`); el correo del visitante va en
 * `replyTo`, que es lo que importa: responder desde Gmail le contesta a él.
 *
 * VARIABLES: `SMTP_HOST`, `SMTP_PORT`, `SMTP_SECURE`, `SMTP_USER`, `SMTP_PASS`,
 * `CONTACT_FROM`, `CONTACT_TO`. Documentadas en `.env.example` y, con el detalle
 * de qué hay que conseguir en cada proveedor, en `docs/DESPLIEGUE.md`.
 */

import type { Transporter } from "nodemailer";

/* ===================================================================== */
/* Configuración                                                          */
/* ===================================================================== */

type ConfigSmtp = {
  host: string;
  port: number;
  secure: boolean;
  user: string;
  pass: string;
  from: string;
};

/** Qué pasó con el envío. Solo se usa para el log del servidor. */
export type ResultadoCorreo = "enviado" | "sin-configurar" | "sin-destinatario" | "error";

function limpio(valor: string | undefined): string {
  return (valor ?? "").trim();
}

/**
 * Lee la configuración del entorno, o `null` si está incompleta.
 *
 * `SMTP_SECURE` es opcional: si no se declara, se deduce del puerto, que es lo
 * que la gente espera —465 es SMTPS (TLS desde el saludo) y 587 es STARTTLS—.
 * Declararlo mal es la causa número uno de «el correo no sale»: con `true` en
 * el 587 la conexión se queda colgada hasta el timeout.
 */
function leerConfig(): ConfigSmtp | null {
  const host = limpio(process.env.SMTP_HOST);
  const user = limpio(process.env.SMTP_USER);
  const pass = limpio(process.env.SMTP_PASS);
  if (!host || !user || !pass) return null;

  const port = Number(limpio(process.env.SMTP_PORT)) || 587;
  const declarado = limpio(process.env.SMTP_SECURE).toLowerCase();
  const secure = declarado ? declarado === "true" || declarado === "1" : port === 465;

  // Sin `CONTACT_FROM`, el remitente es la propia cuenta del SMTP: es lo único
  // que con seguridad está autenticado para ese servidor.
  const from = limpio(process.env.CONTACT_FROM) || user;

  return { host, port, secure, user, pass, from };
}

/** ¿Hay SMTP configurado? Para decidir si vale la pena programar el envío. */
export function correoConfigurado(): boolean {
  return leerConfig() !== null;
}

/* ===================================================================== */
/* Redacción del mensaje                                                  */
/* ===================================================================== */

export type LeadContacto = {
  nombre: string;
  empresa: string;
  telefono: string;
  email: string;
  servicio: string;
  mensaje: string;
  /** Número de WhatsApp al que se dirigió el lead. Contexto para quien atiende. */
  destino: string;
  /** `true` si el lead quedó registrado en `site_mensajes`. */
  guardado: boolean;
};

/** Escapa lo que va dentro del HTML. El texto lo escribe un desconocido. */
function escapar(valor: string): string {
  return valor
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/**
 * El asunto lleva nombre y empresa porque es lo que se lee en la lista del
 * correo sin abrir nada. Los saltos de línea se quitan: una cabecera con `\n`
 * es una inyección de cabeceras de toda la vida.
 */
function asuntoDe(lead: LeadContacto): string {
  const quien = [lead.nombre, lead.empresa].filter(Boolean).join(" — ");
  return `Nuevo mensaje del sitio: ${quien}`.replace(/[\r\n]+/g, " ").slice(0, 180);
}

function filasDe(lead: LeadContacto): Array<[string, string]> {
  const filas: Array<[string, string]> = [
    ["Nombre", lead.nombre],
    ["Empresa", lead.empresa],
    ["Teléfono", lead.telefono],
  ];
  if (lead.email) filas.push(["Correo", lead.email]);
  if (lead.servicio) filas.push(["Servicio de interés", lead.servicio]);
  return filas;
}

function cuerpoTexto(lead: LeadContacto): string {
  // `null` = línea que no va; `""` = línea en blanco a propósito. Filtrar por
  // cadena vacía se comería los renglones de separación y dejaría un ladrillo.
  const lineas: Array<string | null> = [
    "Llegó un mensaje por el formulario de piycsas.com.",
    "",
    ...filasDe(lead).map(([etiqueta, valor]) => `${etiqueta}: ${valor}`),
    "",
    "Mensaje:",
    lead.mensaje,
    "",
    "—",
    lead.email
      ? `Puede responder este correo directamente: le llega a ${lead.email}.`
      : "El visitante no dejó correo; el contacto es por teléfono o WhatsApp.",
    lead.destino ? `El visitante siguió la conversación por WhatsApp al +${lead.destino}.` : null,
    lead.guardado
      ? "El mensaje también quedó registrado en el panel."
      : "OJO: este mensaje NO se pudo registrar en el panel; este correo es la única copia.",
  ];
  return lineas.filter((l) => l !== null).join("\n");
}

/**
 * HTML sobrio a propósito: tabla simple, sin imágenes, sin fuentes externas,
 * sin estilos que dependan del cliente de correo. Lo que tiene que sobrevivir a
 * Gmail, a Outlook y al correo del celular es el dato, no el diseño.
 */
function cuerpoHtml(lead: LeadContacto): string {
  const filas = filasDe(lead)
    .map(
      ([etiqueta, valor]) =>
        `<tr><td style="padding:6px 16px 6px 0;color:#56606E;white-space:nowrap;vertical-align:top">${escapar(
          etiqueta,
        )}</td><td style="padding:6px 0;color:#0A2350"><strong>${escapar(valor)}</strong></td></tr>`,
    )
    .join("");

  const mensaje = escapar(lead.mensaje).replace(/\n/g, "<br />");
  const pie = lead.email
    ? `Puede responder este correo directamente: le llega a <strong>${escapar(lead.email)}</strong>.`
    : "El visitante no dejó correo; el contacto es por teléfono o WhatsApp.";
  const avisoRegistro = lead.guardado
    ? "El mensaje también quedó registrado en el panel."
    : "<strong>Este mensaje no se pudo registrar en el panel: este correo es la única copia.</strong>";

  return `<!doctype html>
<html lang="es"><head><meta charset="utf-8" /><title>${escapar(asuntoDe(lead))}</title></head>
<body style="margin:0;padding:24px;background:#EEF2F9;font-family:system-ui,-apple-system,Segoe UI,Roboto,sans-serif;font-size:15px;line-height:1.6;color:#0A2350">
  <div style="max-width:560px;margin:0 auto;background:#FFFFFF;border-radius:20px;padding:28px">
    <p style="margin:0 0 4px;color:#123B94;font-weight:600">Nuevo mensaje del formulario</p>
    <p style="margin:0 0 20px;color:#56606E;font-size:13px">piycsas.com · /contacto</p>
    <table style="border-collapse:collapse;width:100%;font-size:15px">${filas}</table>
    <p style="margin:20px 0 6px;color:#56606E;font-size:13px">Mensaje</p>
    <div style="background:#F4F6F9;border-radius:14px;padding:16px;color:#0A2350">${mensaje}</div>
    <p style="margin:20px 0 0;color:#56606E;font-size:13px">${pie}<br />${avisoRegistro}</p>
  </div>
</body></html>`;
}

/* ===================================================================== */
/* Envío                                                                  */
/* ===================================================================== */

/**
 * El transporte se crea una vez por instancia y se reutiliza: `nodemailer`
 * mantiene el pool y así no se negocia TLS en cada lead. En serverless la
 * instancia vive poco, pero una ráfaga de formularios sí aprovecha el pool.
 */
let transporteCacheado: Transporter | null = null;
let claveDelTransporte = "";

async function obtenerTransporte(config: ConfigSmtp): Promise<Transporter> {
  const clave = `${config.host}:${config.port}:${config.secure}:${config.user}`;
  if (transporteCacheado && claveDelTransporte === clave) return transporteCacheado;

  // Import dinámico: `nodemailer` solo se carga si de verdad hay que mandar un
  // correo. Con las variables vacías, el módulo ni se toca.
  const { createTransport } = await import("nodemailer");
  transporteCacheado = createTransport({
    host: config.host,
    port: config.port,
    secure: config.secure,
    auth: { user: config.user, pass: config.pass },
    pool: true,
    maxConnections: 1,
    // Un formulario de contacto no espera: si el SMTP no responde pronto, se
    // abandona y queda en el log. El lead ya está guardado.
    connectionTimeout: 10_000,
    greetingTimeout: 10_000,
    socketTimeout: 15_000,
  });
  claveDelTransporte = clave;
  return transporteCacheado;
}

/**
 * Manda el aviso. **Nunca lanza**: devuelve qué pasó y deja el detalle en el
 * log del servidor. Quien la llama no tiene nada que hacer con el fallo.
 *
 * @param destinatarioDeAjustes correo publicado en `site_settings.contact`, que
 *   se usa solo si no hay `CONTACT_TO`. Así el panel puede cambiar a quién le
 *   llegan los mensajes sin tocar Vercel, pero una variable de entorno siempre
 *   manda sobre lo que haya en la base.
 */
export async function enviarAvisoDeLead(
  lead: LeadContacto,
  destinatarioDeAjustes: string,
): Promise<ResultadoCorreo> {
  const config = leerConfig();
  if (!config) return "sin-configurar";

  const destinatario = limpio(process.env.CONTACT_TO) || limpio(destinatarioDeAjustes);
  if (!destinatario) {
    console.warn(
      "[contacto] SMTP configurado pero sin destinatario: cargue CONTACT_TO o publique un correo en Ajustes → Contacto.",
    );
    return "sin-destinatario";
  }

  try {
    const transporte = await obtenerTransporte(config);
    await transporte.sendMail({
      from: config.from,
      to: destinatario,
      // El visitante contesta desde su propio correo, sin que el `From` mienta.
      replyTo: lead.email || undefined,
      subject: asuntoDe(lead),
      text: cuerpoTexto(lead),
      html: cuerpoHtml(lead),
    });
    return "enviado";
  } catch (error) {
    // Ni la clave ni el cuerpo del mensaje van al log: solo el motivo.
    console.error(
      "[contacto] no se pudo enviar el aviso por correo:",
      error instanceof Error ? error.message : error,
    );
    return "error";
  }
}
