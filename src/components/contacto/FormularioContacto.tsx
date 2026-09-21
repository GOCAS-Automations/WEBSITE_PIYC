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

const CLASES_CAMPO =
  "h-12 w-full rounded-fino border border-acero-300 bg-blanco px-3.5 text-[15px] text-azul-950 transition-colors placeholder:text-acero-400 hover:border-acero-500 focus:border-azul-700";

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
          "No pudimos enviar el mensaje. Revise su conexión o escríbanos directo por WhatsApp.",
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
          <label
            htmlFor="contacto-servicio"
            className="block text-[13px] font-semibold text-azul-950"
          >
            Servicio de interés{" "}
            <span className="font-normal text-acero-500">(opcional)</span>
          </label>
          <select
            id="contacto-servicio"
            name="servicio"
            defaultValue=""
            className={`${CLASES_CAMPO} mt-2 appearance-none bg-[length:12px] bg-[right_1rem_center] bg-no-repeat pr-10`}
            style={{
              backgroundImage:
                "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 12 8' fill='none' stroke='%2356606E' stroke-width='1.6'%3E%3Cpath d='M1 1l5 5 5-5'/%3E%3C/svg%3E\")",
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
          <label
            htmlFor="contacto-mensaje"
            className="block text-[13px] font-semibold text-azul-950"
          >
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
            className={`mt-2 w-full rounded-fino border bg-blanco px-3.5 py-3 text-[15px] leading-relaxed text-azul-950 transition-colors placeholder:text-acero-400 hover:border-acero-500 focus:border-azul-700 ${
              errores.mensaje ? "border-error-500" : "border-acero-300"
            }`}
          />
          {errores.mensaje ? (
            <p id="error-mensaje" className="mt-1.5 text-[13px] font-medium text-error-500">
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

        <div className="flex flex-col gap-4 sm:col-span-2 sm:flex-row sm:items-center">
          <button
            type="submit"
            disabled={enviando}
            className="inline-flex h-12 items-center justify-center gap-3 rounded-fino bg-verde-500 px-6 font-semibold text-azul-950 transition-colors hover:bg-verde-400 disabled:cursor-not-allowed disabled:bg-acero-300 disabled:text-acero-600"
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
          <div className="border-l-4 border-verde-500 bg-verde-100 p-5">
            <p className="font-titulo text-xl font-semibold text-azul-950">
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
                className="mt-4 inline-flex h-12 items-center gap-3 rounded-fino border border-verde-700 px-5 font-semibold text-verde-700 transition-colors hover:bg-verde-500 hover:text-azul-950"
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
          <div className="border-l-4 border-error-500 bg-error-50 p-5">
            <p className="font-titulo text-xl font-semibold text-azul-950">
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
      <label htmlFor={id} className="block text-[13px] font-semibold text-azul-950">
        {etiqueta}{" "}
        {requerido ? (
          <span aria-hidden="true">*</span>
        ) : (
          <span className="font-normal text-acero-500">({ayuda ?? "opcional"})</span>
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
        className={`${CLASES_CAMPO} mt-2 ${error ? "border-error-500" : ""}`}
      />
      {error ? (
        <p id={idError} className="mt-1.5 text-[13px] font-medium text-error-500">
          {error}
        </p>
      ) : null}
    </div>
  );
}
