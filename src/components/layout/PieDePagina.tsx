/**
 * PIE DE PÁGINA
 * =============
 * Server Component: todo lo que muestra sale de `site_settings.contact` (con
 * respaldo estático), así que el panel lo edita sin tocar código.
 *
 * COMPACTO Y EN TRES FRANJAS (sep-2026)
 * -------------------------------------
 * Cesar: «debe estar más organizado y concreto; no tiene sentido colocar
 * todos los casos de éxito y todos los servicios ahí». Ya no hay listas de
 * servicios ni de casos (el menú y las páginas ya los enlazan). Queda:
 *  1. Marca (logo + eslogan + Instagram) y la navegación principal.
 *  2. Cuatro celdas de contacto de peso parecido —dónde, teléfono y WhatsApp,
 *     correo, horario—, para que ninguna columna quede medio vacía.
 *  3. Línea legal: razón social, NIT y crédito.
 * Una celda cuyo dato no esté en los ajustes no se pinta, y la rejilla se
 * reparte entre las que quedan.
 *
 * Fondo azul noche con el logo para fondo oscuro, que es *chrome* y por eso va
 * con `next/image` (regla 14 de AGENTS.md). El único verde es el WhatsApp.
 */

import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import { getContacto } from "@/lib/content";
import {
  MENSAJES_WHATSAPP,
  correosVisibles,
  direccionEnLinea,
  hrefTelefono,
  telefonoPrincipal,
  urlMapaExterno,
  usuarioInstagram,
} from "@/lib/contacto";
import { enlaceWhatsApp } from "@/lib/whatsapp";
import { navegacionPrincipal } from "@/data/navegacion";
import { IconoInstagram, IconoUbicacion, IconoWhatsApp } from "@/components/ui/iconos";
import { IconoCorreo, IconoReloj } from "@/components/ui/iconos-servicio";

/** Una celda de contacto: icono, rótulo y contenido. */
function CeldaContacto({
  icono,
  titulo,
  children,
}: {
  icono: ReactNode;
  titulo: string;
  children: ReactNode;
}) {
  return (
    <div className="flex gap-3.5">
      <span
        aria-hidden="true"
        className="mt-0.5 inline-flex size-9 shrink-0 items-center justify-center rounded-control bg-relleno-claro text-acero-200"
      >
        {icono}
      </span>
      <div className="min-w-0">
        <h3 className="text-[13px] font-semibold text-acero-300">{titulo}</h3>
        <div className="mt-1 space-y-0.5 text-[15px] leading-snug text-acero-100">{children}</div>
      </div>
    </div>
  );
}

const CLASE_ENLACE = "transition-colors hover:text-blanco hover:underline underline-offset-2";

export async function PieDePagina() {
  const contacto = await getContacto();

  const telefono = telefonoPrincipal(contacto);
  const numerosWhatsApp = contacto.whatsapp ?? [];
  // El teléfono solo se repite si NO es uno de los WhatsApp: hoy la línea fija
  // y el WhatsApp principal son el mismo número.
  const telefonoAparte =
    telefono && !numerosWhatsApp.some((numero) => numero.intl === telefono.intl) ? telefono : null;
  const correos = correosVisibles(contacto);
  const direccion = direccionEnLinea(contacto);
  const mapa = urlMapaExterno(contacto);
  const instagram = contacto.social?.instagram;
  const horario = contacto.horario?.label;
  const anio = new Date().getFullYear();

  const hayTelefonos = numerosWhatsApp.length > 0 || Boolean(telefonoAparte);

  return (
    // `pt-*`: el pie se separa solo de lo que tenga encima, sea el panel de
    // cierre o una sección blanca (en /contacto termina en las preguntas).
    <footer className="sobre-oscuro fondo-noche text-acero-200">
      {/* Franja a sangre, no tarjeta flotante (Cesar, 22-sep-2026): el pie
          cierra la página de borde a borde y el contenido conserva los mismos
          márgenes laterales que el resto del sitio. */}
      <div className="mx-auto w-full max-w-sitio px-4 sm:px-6 lg:px-8">
        <div className="py-10 lg:py-12">
          {/* 1 · Marca y navegación */}
          {/* Marca y navegación en una fila solo desde `xl`: en 1024 no caben
              juntas y «Contacto» caía solo a una segunda línea. */}
          <div className="flex flex-col gap-6 xl:flex-row xl:items-center xl:justify-between">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:gap-6">
              <Link href="/" className="inline-block shrink-0" prefetch={false}>
                <Image
                  src="/brand/logo-piyc-oscuro.svg"
                  alt="PIYC — Programación Industrial y Control S.A.S., ir al inicio"
                  width={452}
                  height={192}
                  loading="lazy"
                  unoptimized
                  className="h-11 w-auto"
                />
              </Link>
              {contacto.tagline ? (
                <p className="max-w-[30ch] text-[1.0625rem] font-medium leading-snug text-blanco sm:border-l sm:border-separador-claro sm:pl-6">
                  {contacto.tagline}
                </p>
              ) : null}
            </div>

            {/* `prefetch={false}`: el pie asoma al final de cada página y, con
                el prefetch por defecto, dispararía una petición por enlace.
                `py-2.5`: objetivo de toque de ~40 px sin inflar el pie. */}
            <nav aria-label="Pie de página">
              <ul className="-mx-3 flex flex-wrap gap-x-1 text-[15px] font-medium">
                {navegacionPrincipal.map((enlace) => (
                  <li key={enlace.href}>
                    <Link
                      href={enlace.href}
                      prefetch={false}
                      className="inline-block rounded-capsula px-3 py-2.5 leading-none transition-colors hover:bg-relleno-claro hover:text-blanco"
                    >
                      {enlace.etiqueta}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          </div>

          {/* 2 · Contacto */}
          <div className="mt-9 border-t border-separador-claro pt-9">
            <h2 className="sr-only">Contacto</h2>
            {/* 2 columnas en tableta; en escritorio ancho, una fila con las
                que haya (`auto-fit` reparte el ancho y no deja huecos). */}
            <div className="grid gap-x-8 gap-y-7 sm:grid-cols-2 xl:grid-cols-[repeat(auto-fit,minmax(12rem,1fr))]">
              {direccion ? (
                <CeldaContacto icono={<IconoUbicacion className="size-4.5" />} titulo="Dirección">
                  <p>{direccion}</p>
                  {mapa ? (
                    <p>
                      <a
                        href={mapa}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`text-acero-300 ${CLASE_ENLACE}`}
                      >
                        Abrir en Google Maps
                      </a>
                    </p>
                  ) : null}
                </CeldaContacto>
              ) : null}

              {hayTelefonos ? (
                <CeldaContacto
                  icono={<IconoWhatsApp className="size-4.5 text-verde-400" />}
                  titulo={telefonoAparte ? "Teléfono y WhatsApp" : "WhatsApp y teléfono"}
                >
                  {numerosWhatsApp.map((numero) => (
                    <p key={numero.intl}>
                      <a
                        href={enlaceWhatsApp(numero.intl, MENSAJES_WHATSAPP.general)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={CLASE_ENLACE}
                      >
                        {numero.label}
                      </a>
                      {numero.person ? (
                        <span className="text-acero-300"> · {numero.person}</span>
                      ) : null}
                    </p>
                  ))}
                  {telefonoAparte ? (
                    <p>
                      <a href={hrefTelefono(telefonoAparte)} className={CLASE_ENLACE}>
                        {telefonoAparte.label}
                      </a>
                    </p>
                  ) : null}
                  {/* Mismo número para llamar y escribir: se ofrece la llamada
                      sin repetir la cifra. */}
                  {!telefonoAparte && telefono ? (
                    <p>
                      <a href={hrefTelefono(telefono)} className={`text-acero-300 ${CLASE_ENLACE}`}>
                        Llamar
                      </a>
                    </p>
                  ) : null}
                </CeldaContacto>
              ) : null}

              {correos.length > 0 ? (
                <CeldaContacto icono={<IconoCorreo className="size-4.5" />} titulo="Correo">
                  {correos.map((correo) => (
                    <p key={correo.address}>
                      <a href={`mailto:${correo.address}`} className={`break-all ${CLASE_ENLACE}`}>
                        {correo.address}
                      </a>
                    </p>
                  ))}
                </CeldaContacto>
              ) : null}

              {horario ? (
                <CeldaContacto icono={<IconoReloj className="size-4.5" />} titulo="Horario">
                  <p>{horario}</p>
                </CeldaContacto>
              ) : null}
            </div>
          </div>

          {/* 3 · Línea legal */}
          <div className="mt-9 flex flex-col gap-4 border-t border-separador-claro pt-6 text-[13px] text-acero-300 md:flex-row md:items-center md:justify-between">
            <p className="leading-snug">
              © {anio} {contacto.legalName ?? "PIYC"}
              {contacto.nit ? ` · NIT ${contacto.nit}` : ""}
            </p>
            <div className="flex flex-wrap items-center gap-x-5 gap-y-3">
              {instagram ? (
                <a
                  href={instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="pulsable inline-flex items-center gap-2 rounded-capsula bg-relleno-claro py-2 pl-3 pr-3.5 text-[13px] font-medium text-acero-100 hover:bg-azul-800 hover:text-blanco"
                >
                  <IconoInstagram className="size-4.5 text-acero-300" />
                  <span>
                    <span className="sr-only">Instagram: </span>
                    {usuarioInstagram(instagram)}
                  </span>
                </a>
              ) : null}
              {/* Crédito discreto, sin enlace: no hay un dominio de GOCAS
                  confirmado y no se inventa uno. */}
              <p className="leading-snug">
                Desarrollado por <span className="font-medium text-acero-200">GOCAS</span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
