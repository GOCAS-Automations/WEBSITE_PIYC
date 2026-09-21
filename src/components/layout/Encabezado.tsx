/**
 * ENCABEZADO DEL SITIO PÚBLICO
 * ============================
 * Server Component: lee los datos de contacto de `site_settings.contact` (con
 * respaldo estático) y se los pasa a la navegación, que sí es de cliente.
 *
 * Sistema v3: ya **no** hay barra de datos encima del encabezado (dirección,
 * teléfono, correo, Instagram). Se veía anticuada y esos datos ya están en el
 * pie y en `/contacto`. Lo único que queda arriba es la cápsula flotante.
 *
 * `next/image` aparece aquí a propósito: el logo es *chrome* del sitio, no
 * contenido editable (regla 14 de AGENTS.md).
 */

import Image from "next/image";
import { getContacto } from "@/lib/content";
import {
  MENSAJES_WHATSAPP,
  correoPrincipal,
  enlaceWhatsAppDe,
  telefonoPrincipal,
} from "@/lib/contacto";
import { NavegacionPrincipal } from "./NavegacionPrincipal";

export async function Encabezado() {
  const contacto = await getContacto();
  const hrefWhatsApp = enlaceWhatsAppDe(contacto, MENSAJES_WHATSAPP.general);
  const telefono = telefonoPrincipal(contacto);
  const correo = correoPrincipal(contacto);

  return (
    <NavegacionPrincipal
      hrefWhatsApp={hrefWhatsApp}
      telefono={telefono?.label}
      correo={correo}
    >
      <Image
        src="/brand/logo-piyc.svg"
        alt="PIYC — Programación Industrial y Control S.A.S., ir al inicio"
        width={452}
        height={192}
        priority
        unoptimized
        className="h-9 w-auto sm:h-10"
      />
    </NavegacionPrincipal>
  );
}
