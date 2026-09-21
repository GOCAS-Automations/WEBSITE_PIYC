/**
 * PIE DE PÁGINA
 * =============
 * Server Component: lee contacto y servicios de la capa de contenido, así que
 * el panel edita lo que aparece aquí sin tocar código.
 *
 * Fondo `azul-950` con el logo para fondo oscuro (`logo-piyc-oscuro.png`),
 * que es *chrome* y por eso va con `next/image` (regla 14 de AGENTS.md).
 * El único verde es el icono de WhatsApp y el filete superior.
 */

import Image from "next/image";
import Link from "next/link";
import { getContacto, getServicios } from "@/lib/content";
import {
  MENSAJES_WHATSAPP,
  correosVisibles,
  direccionEnLinea,
  enlaceWhatsAppDe,
  hrefTelefono,
  telefonoPrincipal,
  urlMapaExterno,
  usuarioInstagram,
} from "@/lib/contacto";
import { navegacionPrincipal } from "@/data/navegacion";
import {
  IconoInstagram,
  IconoUbicacion,
  IconoWhatsApp,
} from "@/components/ui/iconos";
import { IconoCorreo, IconoTelefono } from "@/components/ui/iconos-servicio";

export async function PieDePagina() {
  const [contacto, servicios] = await Promise.all([getContacto(), getServicios()]);

  const telefono = telefonoPrincipal(contacto);
  const hrefWhatsApp = enlaceWhatsAppDe(contacto, MENSAJES_WHATSAPP.general);
  const correos = correosVisibles(contacto);
  const direccion = direccionEnLinea(contacto);
  const mapa = urlMapaExterno(contacto);
  const instagram = contacto.social?.instagram;
  const anio = new Date().getFullYear();

  return (
    <footer className="sobre-oscuro bg-azul-950 text-acero-200">
      <div aria-hidden="true" className="h-1 w-full bg-verde-500" />

      <div className="mx-auto max-w-sitio px-4 py-14 lg:px-8 lg:py-16">
        <div className="grid gap-10 lg:grid-cols-12 lg:gap-8">
          {/* Marca */}
          <div className="lg:col-span-4">
            <Link href="/" className="inline-block">
              <Image
                src="/brand/logo-piyc-oscuro.png"
                alt="PIYC — Programación Industrial y Control S.A.S., ir al inicio"
                width={452}
                height={192}
                loading="lazy"
                className="h-14 w-auto"
              />
            </Link>
            {contacto.tagline ? (
              <p className="mt-5 max-w-[34ch] border-l-[3px] border-verde-500 pl-4 font-titulo text-xl font-medium leading-tight text-blanco">
                {contacto.tagline}
              </p>
            ) : null}

            {instagram ? (
              <a
                href={instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-6 inline-flex items-center gap-2.5 border border-azul-800 px-4 py-2.5 text-sm font-medium transition-colors hover:border-azul-300 hover:text-blanco"
              >
                <IconoInstagram className="size-5 text-acero-400" />
                <span>
                  <span className="sr-only">Instagram: </span>
                  {usuarioInstagram(instagram)}
                </span>
              </a>
            ) : null}
          </div>

          {/* Navegación */}
          <nav aria-labelledby="pie-navegacion" className="lg:col-span-2">
            <h2
              id="pie-navegacion"
              className="text-[11px] font-semibold uppercase tracking-[0.14em] text-acero-400"
            >
              Navegación
            </h2>
            <ul className="mt-4 space-y-2.5 text-[15px]">
              {navegacionPrincipal.map((enlace) => (
                <li key={enlace.href}>
                  <Link href={enlace.href} className="transition-colors hover:text-blanco">
                    {enlace.etiqueta}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Servicios */}
          <nav aria-labelledby="pie-servicios" className="lg:col-span-3">
            <h2
              id="pie-servicios"
              className="text-[11px] font-semibold uppercase tracking-[0.14em] text-acero-400"
            >
              Servicios
            </h2>
            <ul className="mt-4 space-y-2.5 text-[15px]">
              {servicios.map((servicio) => (
                <li key={servicio.slug}>
                  <Link
                    href={`/servicios/${servicio.slug}`}
                    className="transition-colors hover:text-blanco"
                  >
                    {servicio.navTitle}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Contacto */}
          <div className="lg:col-span-3">
            <h2 className="text-[11px] font-semibold uppercase tracking-[0.14em] text-acero-400">
              Contacto
            </h2>
            <ul className="mt-4 space-y-3.5 text-[15px]">
              {direccion ? (
                <li className="flex gap-3">
                  <IconoUbicacion className="mt-0.5 size-5 shrink-0 text-acero-400" />
                  {mapa ? (
                    <a
                      href={mapa}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="leading-snug transition-colors hover:text-blanco"
                    >
                      {direccion}
                    </a>
                  ) : (
                    <span className="leading-snug">{direccion}</span>
                  )}
                </li>
              ) : null}

              {telefono ? (
                <li className="flex gap-3">
                  <IconoTelefono className="mt-0.5 size-5 shrink-0 text-acero-400" />
                  <a
                    href={hrefTelefono(telefono)}
                    className="transition-colors hover:text-blanco"
                  >
                    {telefono.label}
                  </a>
                </li>
              ) : null}

              {hrefWhatsApp ? (
                <li className="flex gap-3">
                  <IconoWhatsApp className="mt-0.5 size-5 shrink-0 text-verde-400" />
                  <a
                    href={hrefWhatsApp}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="transition-colors hover:text-blanco"
                  >
                    Escribir por WhatsApp
                  </a>
                </li>
              ) : null}

              {correos.map((correo) => (
                <li key={correo.address} className="flex gap-3">
                  <IconoCorreo className="mt-0.5 size-5 shrink-0 text-acero-400" />
                  <a
                    href={`mailto:${correo.address}`}
                    className="break-all transition-colors hover:text-blanco"
                  >
                    {correo.address}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Línea legal */}
        <div className="mt-12 flex flex-col gap-4 border-t border-azul-800 pt-6 text-[13px] text-acero-400 sm:flex-row sm:items-center sm:justify-between">
          <p className="leading-snug">
            © {anio} {contacto.legalName ?? "PIYC"}
            {contacto.nit ? ` · NIT ${contacto.nit}` : ""}
          </p>
          {/* Crédito discreto, sin enlace: no hay un dominio de GOCAS
              confirmado y no se inventa uno. */}
          <p className="leading-snug">
            Desarrollado por <span className="font-medium text-acero-300">GOCAS</span>
          </p>
        </div>
      </div>
    </footer>
  );
}
