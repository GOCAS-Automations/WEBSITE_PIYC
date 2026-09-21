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
import { getContacto, getProyectos, getServicios } from "@/lib/content";
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
  const [contacto, servicios, proyectos] = await Promise.all([
    getContacto(),
    getServicios(),
    getProyectos(),
  ]);

  const telefono = telefonoPrincipal(contacto);
  const hrefWhatsApp = enlaceWhatsAppDe(contacto, MENSAJES_WHATSAPP.general);
  const correos = correosVisibles(contacto);
  const direccion = direccionEnLinea(contacto);
  const mapa = urlMapaExterno(contacto);
  const instagram = contacto.social?.instagram;
  const anio = new Date().getFullYear();

  return (
    <footer className="sobre-oscuro bg-lienzo pb-4 text-acero-200 lg:pb-6">
      <div className="mx-auto w-full max-w-sitio px-4 sm:px-6 lg:px-8">
        <div className="overflow-hidden rounded-lienzo fondo-noche px-6 py-12 shadow-elevada sm:px-10 lg:px-12 lg:py-14">
        <div className="grid gap-10 lg:grid-cols-12 lg:gap-8">
          {/* Marca */}
          <div className="lg:col-span-3">
            <Link href="/" className="inline-block" prefetch={false}>
              <Image
                src="/brand/logo-piyc-oscuro.svg"
                alt="PIYC — Programación Industrial y Control S.A.S., ir al inicio"
                width={452}
                height={192}
                loading="lazy"
                unoptimized
                className="h-12 w-auto"
              />
            </Link>
            {contacto.tagline ? (
              <p className="mt-5 max-w-[32ch] text-[1.0625rem] font-medium leading-snug text-blanco">
                {contacto.tagline}
              </p>
            ) : null}

            {instagram ? (
              <a
                href={instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="pulsable mt-6 inline-flex items-center gap-2.5 rounded-capsula bg-relleno-claro px-4 py-2.5 text-sm font-medium hover:bg-azul-800 hover:text-blanco"
              >
                <IconoInstagram className="size-5 text-acero-300" />
                <span>
                  <span className="sr-only">Instagram: </span>
                  {usuarioInstagram(instagram)}
                </span>
              </a>
            ) : null}
          </div>

          {/* Navegación */}
          {/* Mapa del sitio: páginas, casos y servicios, todo enlazado.
              `prefetch={false}`: el pie está al final de cada página y, con el
              prefetch por defecto, apenas asoma dispara una petición por cada
              uno de sus ~20 enlaces. Aquí la intención de clic es baja. */}
          <div className="lg:col-span-3">
            <nav aria-labelledby="pie-navegacion">
              <h2 id="pie-navegacion" className="text-[13px] font-semibold text-acero-300">
                Navegación
              </h2>
              {/* `py-2.5` en cada enlace: el objetivo de toque pasa de 19 px
                  a ~40 px sin inflar el pie con márgenes. */}
              <ul className="mt-3 text-[15px]">
                {navegacionPrincipal.map((enlace) => (
                  <li key={enlace.href}>
                    <Link
                      href={enlace.href}
                      prefetch={false}
                      className="inline-block py-2.5 leading-snug transition-colors hover:text-blanco"
                    >
                      {enlace.etiqueta}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>

            {proyectos.length > 0 ? (
              <nav aria-labelledby="pie-proyectos" className="mt-8">
                <h2 id="pie-proyectos" className="text-[13px] font-semibold text-acero-300">
                  Casos de éxito
                </h2>
                <ul className="mt-3 text-[15px]">
                  {proyectos.map((proyecto) => (
                    <li key={proyecto.slug}>
                      <Link
                        href={`/proyectos/${proyecto.slug}`}
                        prefetch={false}
                        className="inline-block py-2.5 leading-snug transition-colors hover:text-blanco"
                      >
                        {proyecto.title}
                      </Link>
                    </li>
                  ))}
                </ul>
              </nav>
            ) : null}
          </div>

          {/* Servicios */}
          <nav aria-labelledby="pie-servicios" className="lg:col-span-3">
            <h2 id="pie-servicios" className="text-[13px] font-semibold text-acero-300">
              Servicios
            </h2>
            <ul className="mt-3 text-[15px]">
              {servicios.map((servicio) => (
                <li key={servicio.slug}>
                  <Link
                    href={`/servicios/${servicio.slug}`}
                    prefetch={false}
                    className="inline-block py-2.5 leading-snug transition-colors hover:text-blanco"
                  >
                    {servicio.navTitle}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Contacto */}
          <div className="lg:col-span-3">
            <h2 className="text-[13px] font-semibold text-acero-300">Contacto</h2>
            <ul className="mt-4 space-y-3.5 text-[15px]">
              {direccion ? (
                <li className="flex gap-3">
                  <IconoUbicacion className="mt-0.5 size-5 shrink-0 text-acero-300" />
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
                  <IconoTelefono className="mt-0.5 size-5 shrink-0 text-acero-300" />
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
                  <IconoCorreo className="mt-0.5 size-5 shrink-0 text-acero-300" />
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
        <div className="mt-12 flex flex-col gap-4 border-t border-separador-claro pt-6 text-[13px] text-acero-300 sm:flex-row sm:items-center sm:justify-between">
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
      </div>
    </footer>
  );
}
