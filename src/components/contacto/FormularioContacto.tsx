"use client";

/**
 * FORMULARIO DE CONTACTO
 * ======================
 * **No envía correo.** Manda el lead a `POST /api/contacto`, que lo registra
 * en `site_mensajes` y devuelve el enlace `wa.me` prearmado; el cliente lo
 * abre. Si el navegador bloquea la ventana emergente, el enlace queda visible
 * en pantalla para abrirlo a mano — que es el caso más común en móvil.
 *
 * ANTI-SPAM, LA PARTE DEL CLIENTE (regla 7 de AGENTS.md)
 * -------------------------------------------------------
 *  - **Honeypot** `sitioWeb`: un campo real, oculto a las personas con
 *    posicionamiento (no con `display:none`, que algunos bots detectan) y
 *    marcado `tabIndex={-1}` + `aria-hidden` para que el teclado y los
 *    lectores de pantalla ni lo vean.
 *  - **Tiempo mínimo**: se guarda `Date.now()` al montar y se manda cuánto
 *    transcurrió. Se mide con el reloj DEL VISITANTE: con el del servidor, una
 *    página cacheada por ISR daría la hora del build y rechazaría envíos
 *    legítimos.
 *  - Longitudes máximas con `maxLength`, iguales a las del servidor.
 *
 * Client Component: no importa nada de `components/admin/*` (regla 1).
 */

import { useEffect, useRef, useState } from "react";
import {
  LIMITES_CONTACTO,
  type RespuestaContacto,
} from "@/lib/content-types";
import { IconoWhatsApp } from "@/components/ui/iconos";

type Estado =
  | { fase: "inicial" }
  | { fase: "enviando" }
  | { fase: "ok"; whatsappUrl: string; guardado: boolean }
  | { fase: "error"; mensaje: string; campos?: Record<string, string> };

/**
 * Campo relleno estilo iOS: fondo gris-azulado muy claro, sin borde duro, y
 * anillo azul al enfocar. El contorno global de `:focus-visible` se conserva
 * —es el que ve quien navega con teclado—; el anillo es el acabado visual.
 */
const CLASES_CAMPO =
  "h-12 w-full rounded-campo bg-acero-50 px-4 text-[15px] text-azul-950 ring-1 ring-separador transition-[background-color,box-shadow] duration-200 ease-ios placeholder:text-acero-600 hover:bg-acero-100 focus:bg-blanco focus:ring-2 focus:ring-azul-600";

const CLASES_ETIQUETA = "block pl-1 text-[13px] font-medium text-acero-600";

export function FormularioContacto({
  servicios,
  nota,
}: {
  /** Opciones del select «servicio de interés». */
  servicios: readonly { slug: string; titulo: string }[];
  nota?: string;
}) {
  const [estado, setEstado] = useState<Estado>({ fase: "inicial" });
  const montadoEn = useRef<number>(0);
  const formularioRef = useRef<HTMLFormElement>(null);
  const resultadoRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    montadoEn.current = Date.now();
  }, []);

  // Al terminar, se lleva el foco al bloque de resultado para que el lector de
  // pantalla lo anuncie y el teclado quede donde está el enlace de WhatsApp.
  useEffect(() => {
    if (estado.fase === "ok" || estado.fase === "error") {
      resultadoRef.current?.focus();
    }
  }, [estado.fase]);

  async function enviar(evento: React.FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    if (estado.fase === "enviando") return;

    const datos = new FormData(evento.currentTarget);
    setEstado({ fase: "enviando" });

    try {
      const peticion = await fetch("/api/contacto", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nombre: datos.get("nombre"),
          empresa: datos.get("empresa"),
          telefono: datos.get("telefono"),
          email: datos.get("email"),
          servicio: datos.get("servicio"),
          mensaje: datos.get("mensaje"),
          sitioWeb: datos.get("sitioWeb"),
          transcurridoMs: Date.now() - montadoEn.current,
        }),
      });

      const respuesta = (await peticion.json()) as RespuestaContacto;

      if (!respuesta.ok) {
        setEstado({
          fase: "error",
          mensaje: respuesta.error,
          campos: respuesta.campos as Record<string, string> | undefined,
        });
        return;
      }

      setEstado({
        fase: "ok",
        whatsappUrl: respuesta.whatsappUrl,
        guardado: respuesta.guardado,
      });
      formularioRef.current?.reset();

      // Se intenta abrir WhatsApp. Si el navegador lo bloquea, el enlace
      // alternativo ya está visible en pantalla.
      if (respuesta.whatsappUrl) {
        window.open(respuesta.whatsappUrl, "_blank", "noopener,noreferrer");
      }
    } catch {
      setEstado({
        fase: "error",
        mensaje:
          "No pudimos enviar el mensaje. Revise su conexión o escríbanos directamente por WhatsApp.",
      });
    }
  }

  const errores = estado.fase === "error" ? (estado.campos ?? {}) : {};
  const enviando = estado.fase === "enviando";

  return (
    <div>
      <form ref={formularioRef} onSubmit={enviar} noValidate className="grid gap-5 sm:grid-cols-2">
        <Campo
          nombre="nombre"
          etiqueta="Nombre"
          requerido
          maxLength={LIMITES_CONTACTO.nombre}
          autoComplete="name"
          error={errores.nombre}
        />
        <Campo
          nombre="empresa"
          etiqueta="Empresa"
          requerido
          maxLength={LIMITES_CONTACTO.empresa}
          autoComplete="organization"
          error={errores.empresa}
        />
        <Campo
          nombre="telefono"
          etiqueta="Teléfono"
          tipo="tel"
          requerido
          maxLength={LIMITES_CONTACTO.telefono}
          autoComplete="tel"
          inputMode="tel"
          error={errores.telefono}
        />
        <Campo
          nombre="email"
          etiqueta="Correo"
          tipo="email"
          maxLength={LIMITES_CONTACTO.email}
          autoComplete="email"
          inputMode="email"
          error={errores.email}
        />

        <div className="sm:col-span-2">
          <label htmlFor="contacto-servicio" className={CLASES_ETIQUETA}>
            Servicio de interés <span className="text-acero-600">(opcional)</span>
          </label>
          <select
            id="contacto-servicio"
            name="servicio"
            defaultValue=""
            className={`${CLASES_CAMPO} mt-2 appearance-none bg-[length:12px] bg-[right_1.125rem_center] bg-no-repeat pr-11`}
            style={{
              backgroundImage:
                "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 12 8' fill='none' stroke='%2356606E' stroke-width='1.8' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M1 1.5l5 5 5-5'/%3E%3C/svg%3E\")",
            }}
          >
            <option value="">No estoy seguro / otro</option>
            {servicios.map((servicio) => (
              <option key={servicio.slug} value={servicio.titulo}>
                {servicio.titulo}
              </option>
            ))}
          </select>
        </div>

        <div className="sm:col-span-2">
          <label htmlFor="contacto-mensaje" className={CLASES_ETIQUETA}>
            Mensaje <span aria-hidden="true">*</span>
          </label>
          <textarea
            id="contacto-mensaje"
            name="mensaje"
            required
            rows={5}
            maxLength={LIMITES_CONTACTO.mensaje}
            aria-invalid={errores.mensaje ? true : undefined}
            aria-describedby={errores.mensaje ? "error-mensaje" : undefined}
            placeholder="Cuéntenos qué proceso o equipo quiere intervenir, y cualquier restricción de su planta."
            className={`mt-2 w-full rounded-campo bg-acero-50 px-4 py-3.5 text-[15px] leading-relaxed text-azul-950 ring-1 transition-[background-color,box-shadow] duration-200 ease-ios placeholder:text-acero-600 hover:bg-acero-100 focus:bg-blanco focus:ring-2 focus:ring-azul-600 ${
              errores.mensaje ? "ring-error-500" : "ring-separador"
            }`}
          />
          {errores.mensaje ? (
            <p id="error-mensaje" className="mt-1.5 pl-1 text-[13px] font-medium text-error-500">
              {errores.mensaje}
            </p>
          ) : null}
        </div>

        {/* Honeypot: fuera de la vista, sin `display:none`, invisible al teclado
            y a los lectores de pantalla. Una persona nunca lo llena. */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute left-[-9999px] top-0 size-px overflow-hidden"
        >
          <label htmlFor="contacto-sitio-web">No llenar este campo</label>
          <input
            id="contacto-sitio-web"
            type="text"
            name="sitioWeb"
            tabIndex={-1}
            autoComplete="off"
          />
        </div>

        {/* `pb-16 sm:pb-0`: el flotante de WhatsApp ahora se ve siempre, y en
            móvil se sentaba justo encima de este botón. */}
        <div className="flex flex-col gap-4 pb-16 sm:col-span-2 sm:flex-row sm:items-center sm:pb-0">
          <button
            type="submit"
            disabled={enviando}
            // `whitespace-nowrap` + `shrink-0`: junto a la nota de campos
            // obligatorios, la cápsula se encogía y partía su etiqueta en dos.
            className="pulsable inline-flex h-12 shrink-0 items-center justify-center gap-2.5 whitespace-nowrap rounded-capsula bg-verde-500 px-6 text-[15px] font-semibold text-azul-950 shadow-tarjeta hover:bg-verde-400 disabled:cursor-not-allowed disabled:bg-acero-200 disabled:text-acero-600 disabled:shadow-none"
          >
            <IconoWhatsApp className="size-5" />
            {enviando ? "Enviando…" : "Enviar y abrir WhatsApp"}
          </button>
          <p className="text-[13px] leading-snug text-acero-600">
            <span aria-hidden="true">*</span> Campos obligatorios: nombre, empresa, teléfono y
            mensaje.
          </p>
        </div>
      </form>

      {nota ? <p className="mt-5 text-[13px] leading-relaxed text-acero-600">{nota}</p> : null}

      {/* Resultado: éxito o error */}
      <div
        ref={resultadoRef}
        tabIndex={-1}
        aria-live="polite"
        className="mt-6 empty:mt-0 focus:outline-none"
      >
        {estado.fase === "ok" ? (
          <div className="rounded-tarjeta bg-verde-100 p-5 ring-1 ring-verde-300">
            <p className="text-[1.0625rem] font-semibold text-azul-950">
              Listo, su mensaje quedó armado
            </p>
            <p className="mt-2 text-[15px] leading-relaxed text-azul-900">
              Debería haberse abierto WhatsApp con el mensaje ya escrito. Si no se abrió, use el
              enlace de abajo.
            </p>
            {estado.whatsappUrl ? (
              <a
                href={estado.whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="pulsable mt-4 inline-flex h-12 items-center gap-2.5 rounded-capsula bg-verde-500 px-6 text-[15px] font-semibold text-azul-950 shadow-tarjeta hover:bg-verde-400"
              >
                <IconoWhatsApp className="size-5" />
                Abrir WhatsApp
              </a>
            ) : null}
            {!estado.guardado ? (
              <p className="mt-4 text-[13px] leading-snug text-acero-600">
                Nota: no pudimos guardar una copia del mensaje en nuestro sistema, pero el
                mensaje de WhatsApp sí está listo para enviar.
              </p>
            ) : null}
          </div>
        ) : null}

        {estado.fase === "error" ? (
          <div className="rounded-tarjeta bg-error-50 p-5 ring-1 ring-error-300">
            <p className="text-[1.0625rem] font-semibold text-azul-950">
              No pudimos enviar el mensaje
            </p>
            <p className="mt-2 text-[15px] leading-relaxed text-azul-900">{estado.mensaje}</p>
          </div>
        ) : null}
      </div>
    </div>
  );
}

/* ===================================================================== */
/* Campo de texto                                                         */
/* ===================================================================== */

function Campo({
  nombre,
  etiqueta,
  tipo = "text",
  requerido = false,
  maxLength,
  autoComplete,
  inputMode,
  ayuda,
  error,
}: {
  nombre: string;
  etiqueta: string;
  tipo?: string;
  requerido?: boolean;
  maxLength: number;
  autoComplete?: string;
  inputMode?: "tel" | "email" | "text";
  ayuda?: string;
  error?: string;
}) {
  const id = `contacto-${nombre}`;
  const idError = `error-${nombre}`;

  return (
    <div>
      <label htmlFor={id} className={CLASES_ETIQUETA}>
        {etiqueta}{" "}
        {requerido ? (
          <span aria-hidden="true">*</span>
        ) : (
          <span className="text-acero-600">({ayuda ?? "opcional"})</span>
        )}
      </label>
      <input
        id={id}
        name={nombre}
        type={tipo}
        required={requerido}
        maxLength={maxLength}
        autoComplete={autoComplete}
        inputMode={inputMode}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? idError : undefined}
        className={`${CLASES_CAMPO} mt-2 ${error ? "ring-error-500" : ""}`}
      />
      {error ? (
        <p id={idError} className="mt-1.5 pl-1 text-[13px] font-medium text-error-500">
          {error}
        </p>
      ) : null}
    </div>
  );
}
