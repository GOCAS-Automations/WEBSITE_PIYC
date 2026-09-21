/**
 * ENCABEZADO DEL SITIO PÚBLICO
 * ============================
 * Server Component: lee los datos de contacto de `site_settings.contact` (con
 * respaldo estático) y se los pasa a la navegación, que sí es de cliente.
 *
 * `next/image` aparece aquí a propósito: el logo es *chrome* del sitio, no
 * contenido editable (regla 14 de AGENTS.md).
 */

import Image from "next/image";
import Link from "next/link";
import { getContacto } from "@/lib/content";
import {
  MENSAJES_WHATSAPP,
  correoPrincipal,
  enlaceWhatsAppDe,
  telefonoPrincipal,
  usuarioInstagram,
} from "@/lib/contacto";
import { IconoInstagram, IconoUbicacion, IconoWhatsApp } from "@/components/ui/iconos";
import { NavegacionPrincipal } from "./NavegacionPrincipal";

export async function Encabezado() {
  const contacto = await getContacto();
  const hrefWhatsApp = enlaceWhatsAppDe(contacto, MENSAJES_WHATSAPP.general);
  const telefono = telefonoPrincipal(contacto);
  const correo = correoPrincipal(contacto);
  const instagram = contacto.social?.instagram;
  const direccion = contacto.address;

  return (
    <>
      {/* Barra de datos (solo escritorio) */}
      <div className="sobre-oscuro hidden bg-azul-950 text-acero-200 md:block">
        <div className="mx-auto flex max-w-sitio items-center justify-between gap-6 px-4 py-2 text-[13px] lg:px-8">
          {direccion?.full ? (
            <p className="flex items-center gap-2">
              <IconoUbicacion className="size-4 text-acero-400" />
              <span>{direccion.full}</span>
            </p>
          ) : (
            <span />
          )}
          <ul className="flex items-center gap-5">
            {telefono ? (
              <li>
                <a
                  href={hrefWhatsApp}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 transition-colors hover:text-blanco"
                >
                  <IconoWhatsApp className="size-3.5 text-verde-400" />
                  <span>{telefono.label}</span>
                </a>
              </li>
            ) : null}
            {correo ? (
              <li className="hidden lg:block">
                <a href={`mailto:${correo}`} className="transition-colors hover:text-blanco">
                  {correo}
                </a>
              </li>
            ) : null}
            {instagram ? (
              <li>
                <a
                  href={instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 transition-colors hover:text-blanco"
                >
                  <IconoInstagram className="size-4 text-acero-400" />
                  <span>
                    <span className="sr-only">Instagram: </span>
                    {usuarioInstagram(instagram)}
                  </span>
                </a>
              </li>
            ) : null}
          </ul>
        </div>
      </div>

      <header className="sticky top-0 z-40 border-b border-acero-200 bg-blanco">
        <div className="mx-auto flex h-16 max-w-sitio items-center justify-between gap-6 px-4 lg:h-[76px] lg:px-8">
          <Link href="/" className="shrink-0">
            <Image
              src="/brand/logo-piyc.png"
              alt="PIYC — Programación Industrial y Control S.A.S., ir al inicio"
              width={452}
              height={192}
              priority
              className="h-10 w-auto lg:h-14"
            />
          </Link>
          <NavegacionPrincipal
            hrefWhatsApp={hrefWhatsApp}
            telefono={telefono?.label}
            correo={correo}
          />
        </div>
      </header>
    </>
  );
}
