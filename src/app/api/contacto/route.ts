/**
 * FORMULARIO DE CONTACTO — `POST /api/contacto`
 * =============================================
 * **Este endpoint NO envía correo** (regla 5 de AGENTS.md). Hace tres cosas:
 *
 *   1. Valida el payload y aplica el anti-spam (regla 7: honeypot + 3 s
 *      mínimos medidos contra el reloj del visitante + longitudes máximas +
 *      tope por IP con `ip_hash` salado). Sin captcha ni terceros.
 *   2. Registra el lead en `site_mensajes` con la clave service-role.
 *   3. Devuelve el enlace `wa.me` prearmado, que el cliente abre.
 *
 * EL NÚMERO DESTINO SALE SIEMPRE DE `site_settings.contact.whatsappFormulario`.
 * Nunca del payload: tomarlo del formulario convertiría el sitio en un relay
 * abierto para mandar mensajes a cualquier número.
 *
 * SI EL GUARDADO FALLA, EL LEAD NO SE PIERDE: se devuelve `ok: true` con
 * `guardado: false` y el enlace de WhatsApp igual se abre. Perder un cliente
 * por un problema de base de datos sería peor que perder el registro.
 *
 * `x-forwarded-for` es falsificable, así que el tope por IP es un freno al
 * ruido automatizado, no una barrera de seguridad. Por eso no hay nada
 * sensible detrás de este endpoint.
 */

import { createHash } from "node:crypto";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { getServiceRoleSupabase } from "@/lib/supabase/admin";
import { getContacto } from "@/lib/content";
import { whatsappFormulario } from "@/lib/contacto";
import { enlaceWhatsApp } from "@/lib/whatsapp";
import {
  LIMITES_CONTACTO,
  SEGUNDOS_MINIMOS_FORMULARIO,
  TOPE_POR_IP,
  type PayloadContacto,
  type RespuestaContacto,
} from "@/lib/content-types";

/** Nunca se prerrenderiza: recibe POST con cuerpo. */
export const dynamic = "force-dynamic";

/* ===================================================================== */
/* Utilidades                                                             */
/* ===================================================================== */

/** Cuerpo máximo aceptado, en bytes. Los seis campos juntos no llegan a 4 KB. */
const TAMANO_MAXIMO_CUERPO = 16 * 1024;

function respuesta(cuerpo: RespuestaContacto, estado: number) {
  return NextResponse.json(cuerpo, {
    status: estado,
    headers: { "Cache-Control": "no-store" },
  });
}

function texto(valor: unknown, maximo: number): string {
  if (typeof valor !== "string") return "";
  return valor.replace(/\s+/g, " ").trim().slice(0, maximo);
}

/**
 * Sal del hash de IP. Con `CONTACT_IP_SALT` propia si existe; si no, una
 * constante del código. **No se usa la service-role**: el hash se persiste en
 * `site_mensajes.ip_hash` y no hay por qué mezclar ahí el secreto más sensible
 * del proyecto. Lo que se guarda es el hash, nunca la IP en claro ni la sal.
 */
function salDeIp(): string {
  return process.env.CONTACT_IP_SALT || "piyc:contacto:v1";
}

/**
 * IP del visitante para el tope por hora.
 *
 * `x-forwarded-for` llega como «ip-del-cliente, proxy1, proxy2…» y el primer
 * elemento lo puede escribir quien llama: rotándolo, el tope nunca dispararía.
 * Vercel añade la IP real al FINAL y además fija `x-vercel-forwarded-for`, que
 * el cliente no controla. Por eso se prefiere esa cabecera y, si no está, se
 * toma el último elemento de la cadena, no el primero.
 */
async function hashDeIp(): Promise<string | null> {
  const cabeceras = await headers();
  const cadena = cabeceras.get("x-vercel-forwarded-for") ?? cabeceras.get("x-forwarded-for") ?? "";
  const reenviada = cadena.split(",").pop()?.trim();
  const ip = reenviada || cabeceras.get("x-real-ip")?.trim();
  if (!ip) return null;
  return createHash("sha256").update(`${salDeIp()}:${ip}`).digest("hex").slice(0, 64);
}

/** Mensaje que el visitante verá ya escrito en WhatsApp. */
function mensajeWhatsApp(datos: {
  nombre: string;
  empresa: string;
  telefono: string;
  email: string;
  servicio: string;
  mensaje: string;
}): string {
  const lineas = [
    "Hola, PIYC. Escribo desde el formulario del sitio web.",
    "",
    `Nombre: ${datos.nombre}`,
    `Empresa: ${datos.empresa}`,
    `Teléfono: ${datos.telefono}`,
  ];
  if (datos.email) lineas.push(`Correo: ${datos.email}`);
  if (datos.servicio) lineas.push(`Servicio de interés: ${datos.servicio}`);
  lineas.push("", datos.mensaje);
  return lineas.join("\n");
}

/* ===================================================================== */
/* Handler                                                                */
/* ===================================================================== */

export async function POST(request: Request) {
  // Tope de tamaño antes de parsear: los seis campos juntos no llegan a 4 KB,
  // así que un cuerpo grande solo puede ser un intento de hacer trabajar al
  // servidor. Se corta sin leerlo.
  const declarado = Number(request.headers.get("content-length") ?? "0");
  if (Number.isFinite(declarado) && declarado > TAMANO_MAXIMO_CUERPO) {
    return respuesta({ ok: false, error: "El mensaje es demasiado largo." }, 413);
  }

  let payload: PayloadContacto;
  try {
    payload = (await request.json()) as PayloadContacto;
  } catch {
    return respuesta(
      { ok: false, error: "No pudimos leer el formulario. Inténtelo de nuevo." },
      400,
    );
  }

  /* --- Anti-spam 1: honeypot ---------------------------------------- */
  // El campo está oculto para las personas. Si trae algo, es un bot.
  // Se responde 200 con un enlace falso de éxito para no darle pistas: el
  // registro simplemente no se hace.
  if (texto(payload.sitioWeb, 200)) {
    return respuesta({ ok: true, whatsappUrl: "", guardado: false }, 200);
  }

  /* --- Anti-spam 2: tiempo mínimo ----------------------------------- */
  // Medido con el reloj DEL VISITANTE (`Date.now()` en el cliente, desde que
  // se montó el formulario). Contra el reloj del servidor daría falsos
  // positivos con páginas cacheadas por ISR: la marca de tiempo sería la del
  // build, no la de la visita.
  const transcurrido = typeof payload.transcurridoMs === "number" ? payload.transcurridoMs : 0;
  if (transcurrido < SEGUNDOS_MINIMOS_FORMULARIO * 1000) {
    return respuesta(
      {
        ok: false,
        error: `Tómese unos segundos para revisar el formulario antes de enviarlo.`,
      },
      429,
    );
  }

  /* --- Validación y longitudes máximas ------------------------------- */
  const nombre = texto(payload.nombre, LIMITES_CONTACTO.nombre);
  const empresa = texto(payload.empresa, LIMITES_CONTACTO.empresa);
  const telefono = texto(payload.telefono, LIMITES_CONTACTO.telefono);
  const email = texto(payload.email, LIMITES_CONTACTO.email);
  const servicio = texto(payload.servicio, LIMITES_CONTACTO.servicio);
  const mensaje = texto(payload.mensaje, LIMITES_CONTACTO.mensaje);

  const campos: Partial<Record<keyof PayloadContacto, string>> = {};
  if (nombre.length < 2) campos.nombre = "Escriba su nombre.";
  // `empresa` y `telefono` son NOT NULL en `site_mensajes`: son obligatorios.
  if (empresa.length < 2) campos.empresa = "Escriba el nombre de la empresa.";
  if (telefono.replace(/\D/g, "").length < 7) campos.telefono = "Escriba un teléfono válido.";
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) {
    campos.email = "Ese correo no parece válido.";
  }
  if (mensaje.length < 10) campos.mensaje = "Cuéntenos un poco más sobre lo que necesita.";

  if (Object.keys(campos).length > 0) {
    return respuesta({ ok: false, error: "Revise los datos marcados.", campos }, 400);
  }

  /* --- Destino: SIEMPRE de los ajustes, nunca del payload ------------ */
  const contacto = await getContacto();
  const destino = whatsappFormulario(contacto);
  if (!destino) {
    return respuesta(
      {
        ok: false,
        error:
          "En este momento no podemos recibir mensajes por el formulario. Escríbanos por WhatsApp desde el botón del sitio.",
      },
      503,
    );
  }

  const whatsappUrl = enlaceWhatsApp(
    destino,
    mensajeWhatsApp({ nombre, empresa, telefono, email, servicio, mensaje }),
  );

  /* --- Registro del lead (y tope por IP) ----------------------------- */
  let guardado = false;
  const supabase = getServiceRoleSupabase();

  if (supabase) {
    try {
      const ipHash = await hashDeIp();

      // Anti-spam 3: tope por IP. Se consulta antes de insertar.
      if (ipHash) {
        const desde = new Date(Date.now() - TOPE_POR_IP.minutos * 60_000).toISOString();
        const { count, error } = await supabase
          .from("site_mensajes")
          .select("id", { count: "exact", head: true })
          .eq("ip_hash", ipHash)
          .gte("created_at", desde);

        if (!error && (count ?? 0) >= TOPE_POR_IP.envios) {
          return respuesta(
            {
              ok: false,
              error:
                "Ya recibimos varios mensajes desde esta conexión. Escríbanos directamente por WhatsApp y lo atendemos.",
            },
            429,
          );
        }
      }

      const { error } = await supabase.from("site_mensajes").insert({
        nombre,
        empresa,
        telefono,
        email: email || null,
        servicio: servicio || null,
        mensaje,
        canal: "whatsapp",
        destino,
        ip_hash: ipHash,
      });

      if (error) throw error;
      guardado = true;
    } catch (error) {
      // El lead NO se pierde por esto: se sigue devolviendo el enlace.
      // Queda en el log del servidor.
      console.error("[contacto] no se pudo registrar el lead:", error);
    }
  }

  return respuesta({ ok: true, whatsappUrl, guardado }, 200);
}
