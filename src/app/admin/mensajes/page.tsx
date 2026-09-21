import { requireManager } from "@/lib/supabase/auth";
import { listMensajes } from "@/lib/admin/lecturas";
import { leerPagina, paginar } from "@/lib/paginacion";
import {
  AyudaSeccion,
  CabeceraPanel,
  EstadoVacio,
  Insignia,
  Paginacion,
} from "@/components/admin/ui";
import { IconoWhatsApp } from "@/components/admin/iconos";
import { enlaceWhatsAppLead, formatearFechaLarga } from "@/lib/admin/mensajes";

export const dynamic = "force-dynamic";

/**
 * BANDEJA DE MENSAJES DEL FORMULARIO
 * ==================================
 * SOLO LECTURA, a propósito: `site_mensajes` tiene una única política de RLS
 * (`SELECT` para managers) y ninguna de UPDATE ni DELETE. Es un registro de
 * quién escribió, no una bandeja que se administre.
 *
 * POR QUÉ ESTA PANTALLA EXISTE
 * ----------------------------
 * El formulario del sitio no envía correo: guarda el lead aquí y abre WhatsApp
 * con el mensaje ya escrito. Si el visitante cierra WhatsApp sin enviar —pasa
 * a cada rato—, **el contacto igual quedó registrado**. Sin esta pantalla, ese
 * cliente se perdería sin que nadie se enterara.
 *
 * Vive bajo «Contenido del sitio» en el menú: las cuatro entradas no se tocan.
 */
export default async function MensajesPage({
  searchParams,
}: {
  searchParams: Promise<{ pagina?: string }>;
}) {
  await requireManager();
  const mensajes = await listMensajes();
  const pagina = paginar(mensajes, leerPagina((await searchParams).pagina));

  return (
    <>
      <CabeceraPanel
        title="Mensajes de contacto"
        description="Todo el que llena el formulario de piycsas.com queda registrado aquí."
        backHref="/admin/contenido"
        backLabel="Volver a Contenido"
        breadcrumb={[
          { label: "Panel", href: "/admin" },
          { label: "Contenido del sitio", href: "/admin/contenido" },
          { label: "Mensajes" },
        ]}
      />

      <AyudaSeccion title="Cómo funciona" className="mb-6">
        El formulario del sitio <strong>no manda correos</strong>: guarda el
        mensaje aquí y abre WhatsApp con el texto ya escrito para que la persona
        solo tenga que pulsar enviar. Muchos no lo pulsan — por eso esta lista es
        importante: el contacto está igual, con su teléfono. El botón{" "}
        <strong>Responder</strong> abre WhatsApp con un saludo armado; revísalo
        antes de enviarlo. Esta pantalla es de solo lectura: los mensajes no se
        editan ni se borran.
      </AyudaSeccion>

      {mensajes.length === 0 ? (
        <EstadoVacio
          title="Todavía no ha escrito nadie"
          description="Cuando alguien llene el formulario de la página de contacto, aparecerá aquí con su teléfono y su mensaje, aunque no llegue a enviar el WhatsApp."
        />
      ) : (
        <>
          <ul id="lista-mensajes" className="scroll-mt-8 space-y-3">
            {pagina.visibles.map((mensaje) => (
              <li
                key={mensaje.id}
                className="rounded-fino border border-acero-200 bg-blanco p-4 sm:p-5"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h2 className="font-titulo text-lg font-semibold uppercase tracking-wide text-azul-950">
                      {mensaje.nombre}
                    </h2>
                    <p className="mt-0.5 text-sm text-acero-600">
                      {mensaje.empresa}
                      {mensaje.servicio && (
                        <>
                          {" · "}
                          <span className="text-azul-700">{mensaje.servicio}</span>
                        </>
                      )}
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <Insignia>{formatearFechaLarga(mensaje.created_at)}</Insignia>
                    <a
                      href={enlaceWhatsAppLead(mensaje)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 rounded-fino border border-verde-300 bg-verde-100 px-3 py-2 text-xs font-semibold text-verde-700 transition-colors hover:bg-verde-300"
                    >
                      <IconoWhatsApp className="h-3.5 w-3.5" />
                      Responder por WhatsApp
                    </a>
                  </div>
                </div>

                <p className="mt-3 whitespace-pre-line border-l-2 border-acero-200 pl-3 text-sm leading-relaxed text-acero-700">
                  {mensaje.mensaje}
                </p>

                <dl className="mt-3 flex flex-wrap gap-x-6 gap-y-1 border-t border-acero-200 pt-3 text-sm">
                  <div className="flex gap-1.5">
                    <dt className="text-acero-500">Teléfono:</dt>
                    <dd className="font-semibold text-azul-950">{mensaje.telefono}</dd>
                  </div>
                  {mensaje.email && (
                    <div className="flex gap-1.5">
                      <dt className="text-acero-500">Correo:</dt>
                      <dd>
                        <a
                          href={`mailto:${mensaje.email}`}
                          className="font-semibold text-azul-700 underline"
                        >
                          {mensaje.email}
                        </a>
                      </dd>
                    </div>
                  )}
                  {mensaje.destino && (
                    <div className="flex gap-1.5">
                      <dt className="text-acero-500">Se dirigió a:</dt>
                      <dd className="font-mono text-xs text-acero-600">
                        {mensaje.destino}
                      </dd>
                    </div>
                  )}
                </dl>
              </li>
            ))}
          </ul>
          <Paginacion
            pagina={pagina.pagina}
            total={pagina.total}
            hrefBase="/admin/mensajes"
            ancla="lista-mensajes"
            etiqueta="Páginas de mensajes"
          />
        </>
      )}
    </>
  );
}
