/**
 * FLOTANTE DE WHATSAPP
 * ====================
 * Cápsula verde fija abajo a la derecha, **siempre visible** en todo el sitio
 * (decisión de Cesar, 22-sep-2026). Antes aparecía solo tras 360 px de scroll
 * y se retiraba junto al pie y en `/contacto`, porque tapaba contenido: eso se
 * resuelve ahora en quien puede taparse —el formulario de contacto lleva
 * relleno inferior en móvil— y no escondiendo el botón.
 *
 * Solo el ícono, sin etiqueta: el texto duplicaba el CTA que ya hay en el
 * encabezado y en cada franja de cierre. `size-14` = 56 px, por encima del
 * mínimo táctil de 48 px.
 *
 * Sin estado ni efectos: no necesita ser Client Component. El número se
 * resuelve en el servidor y llega por prop.
 */

import { IconoWhatsApp } from "@/components/ui/iconos";

export function FlotanteWhatsApp({ href }: { href: string }) {
  return (
    <aside aria-label="Escribir a PIYC por WhatsApp">
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        data-whatsapp-flotante=""
        aria-label="Escribirle a PIYC por WhatsApp (se abre en una pestaña nueva)"
        className={`fixed bottom-4 right-4 z-30 inline-flex size-14 items-center justify-center rounded-capsula bg-verde-500 text-azul-950 shadow-flotante transition-[opacity,transform] duration-300 ease-ios hover:bg-verde-400 active:scale-95 sm:bottom-6 sm:right-6`}
      >
        <IconoWhatsApp className="size-7 shrink-0" />
      </a>
    </aside>
  );
}
