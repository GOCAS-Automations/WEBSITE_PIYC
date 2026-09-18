import Image from "next/image";
import Link from "next/link";
import { contacto, mensajesWhatsApp } from "@/data/contacto";
import { enlaceWhatsApp } from "@/lib/whatsapp";
import { IconoInstagram, IconoUbicacion, IconoWhatsApp } from "@/components/ui/iconos";
import { NavegacionPrincipal } from "./NavegacionPrincipal";

export function Encabezado() {
  const hrefWhatsApp = enlaceWhatsApp(mensajesWhatsApp.general);
  const { direccion } = contacto;

  return (
    <>
      {/* Barra de datos (solo escritorio) */}
      <div className="sobre-oscuro hidden bg-grafito-950 text-acero-200 md:block">
        <div className="mx-auto flex max-w-sitio items-center justify-between gap-6 px-4 py-2 text-[13px] lg:px-8">
          <p className="flex items-center gap-2">
            <IconoUbicacion className="size-4 text-naranja-500" />
            <span>
              {direccion.via}, {direccion.sector} · {direccion.ciudad}, {direccion.departamento}
            </span>
          </p>
          <ul className="flex items-center gap-5">
            <li>
              <a
                href={hrefWhatsApp}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 transition-colors hover:text-blanco"
              >
                <IconoWhatsApp className="size-3.5 text-naranja-500" />
                <span>{contacto.telefono.visible}</span>
              </a>
            </li>
            <li className="hidden lg:block">{contacto.correo}</li>
            <li>
              <a
                href={contacto.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 transition-colors hover:text-blanco"
              >
                <IconoInstagram className="size-4 text-naranja-500" />
                <span>
                  <span className="sr-only">Instagram: </span>@piyc_sas
                </span>
              </a>
            </li>
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
              loading="eager"
              className="h-10 w-auto lg:h-14"
            />
          </Link>
          <NavegacionPrincipal hrefWhatsApp={hrefWhatsApp} />
        </div>
      </header>
    </>
  );
}
