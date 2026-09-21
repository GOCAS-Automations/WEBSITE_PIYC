/**
 * CONTACTO — `/contacto`
 *
 * Datos de contacto, mapa embebido y formulario que **no envía correo**: el
 * servidor registra el lead y devuelve el enlace `wa.me` (ver
 * `src/app/api/contacto/route.ts`).
 *
 * El horario **solo se pinta si está en `site_settings.contact.horario`**. El
 * vigente —lunes a viernes de 8:00 a. m. a 5:00 p. m.— salió de la ficha de
 * Google del negocio; si algún día se borra desde el panel, el bloque
 * desaparece en vez de quedar en blanco.
 */

import type { Metadata } from "next";
import { getContacto, getPaginas, getSeo, getServicios } from "@/lib/content";
import {
  MENSAJES_WHATSAPP,
  correosVisibles,
  direccionEnLinea,
  hrefTelefono,
  telefonoPrincipal,
  urlMapaEmbebido,
  urlMapaExterno,
  usuarioInstagram,
} from "@/lib/contacto";
import { enlaceWhatsApp } from "@/lib/whatsapp";
import { jsonLdFaq, jsonLdMigas, metadataDePagina, metadatosPagina, type Miga } from "@/lib/seo";
import { CabeceraInterna } from "@/components/sections/CabeceraInterna";
import { Faq } from "@/components/sections/Faq";
import { FormularioContacto } from "@/components/contacto/FormularioContacto";
import { Contenedor, Rotulo, TituloSeccion } from "@/components/sections/primitivas";
import { IconoInstagram, IconoUbicacion, IconoWhatsApp } from "@/components/ui/iconos";
import { IconoCorreo, IconoReloj, IconoTelefono } from "@/components/ui/iconos-servicio";
import { JsonLd } from "@/components/ui/JsonLd";

export const revalidate = 300;

const MIGAS: Miga[] = [
  { etiqueta: "Inicio", href: "/" },
  { etiqueta: "Contacto", href: "/contacto" },
];

export async function generateMetadata(): Promise<Metadata> {
  const seo = await getSeo();
  const { titulo, descripcion, imagen } = metadatosPagina(seo.paginas?.contacto, {
    titulo: "Contacto",
    descripcion:
      "Escríbanos por WhatsApp o déjenos los datos de su proyecto de automatización, tableros o ingeniería eléctrica en Cali.",
  }, seo.ogImage);
  return metadataDePagina({ titulo, descripcion, ruta: "/contacto", imagen });
}

export default async function Contacto() {
  const [contacto, paginas, servicios] = await Promise.all([
    getContacto(),
    getPaginas(),
    getServicios(),
  ]);

  const ajustes = paginas.contacto;
  const faq = ajustes?.faq ?? [];
  const telefono = telefonoPrincipal(contacto);
  const correos = correosVisibles(contacto);
  const direccion = direccionEnLinea(contacto);
  const mapaEmbebido = urlMapaEmbebido(contacto);
  const mapaExterno = urlMapaExterno(contacto);
  const instagram = contacto.social?.instagram;
  const horario = contacto.horario?.label;
  const numerosWhatsApp = contacto.whatsapp ?? [];

  return (
    // `data-pagina` queda como marca de la página para CSS y pruebas. Quien
    // apaga el botón flotante de WhatsApp aquí —tapaba el «Enviar» del
    // formulario en móvil— es `FlotanteWhatsApp`, por ruta.
    <main id="contenido" data-pagina="contacto">
      <JsonLd datos={jsonLdMigas(MIGAS)} />
      <JsonLd datos={jsonLdFaq(faq)} />

      <CabeceraInterna
        ajustes={ajustes}
        rotulo="Contacto"
        titulo="Hablemos de su proyecto"
        migas={MIGAS}
      />

      <section aria-labelledby="titulo-contacto" className="bg-lienzo">
        <Contenedor className="py-16 lg:py-20">
          <h2 id="titulo-contacto" className="sr-only">
            Datos de contacto y formulario
          </h2>

          <div className="grid gap-12 lg:grid-cols-12 lg:gap-12">
            {/* Datos */}
            <div className="lg:col-span-5">
              <Rotulo>Datos</Rotulo>
              <TituloSeccion className="mt-5 !text-[1.75rem] sm:!text-[2rem]">
                {ajustes?.tituloDatos || "Dónde encontrarnos"}
              </TituloSeccion>

              <dl className="mt-7 overflow-hidden rounded-tarjeta bg-blanco shadow-tarjeta">
                {direccion ? (
                  <div className="grid grid-cols-[1.75rem_1fr] items-start gap-x-4 border-t border-separador px-5 py-4 first:border-t-0">
                    <IconoUbicacion className="row-span-2 mt-0.5 size-6 shrink-0 text-azul-600" />
                    <dt className="text-[13px] text-acero-600">
                      Dirección
                    </dt>
                    <dd className="mt-1 text-[15px] leading-relaxed text-azul-950">
                      {direccion}
                      {mapaExterno ? (
                        <>
                          {" · "}
                          <a
                            href={mapaExterno}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="font-medium text-azul-700 underline-offset-2 hover:underline"
                          >
                            Abrir en Google Maps
                          </a>
                        </>
                      ) : null}
                    </dd>
                  </div>
                ) : null}

                {numerosWhatsApp.length > 0 ? (
                  <div className="grid grid-cols-[1.75rem_1fr] items-start gap-x-4 border-t border-separador px-5 py-4 first:border-t-0">
                    <IconoWhatsApp className="row-span-2 mt-0.5 size-6 shrink-0 text-verde-600" />
                    <dt className="text-[13px] text-acero-600">
                      WhatsApp
                    </dt>
                    <dd className="mt-1 space-y-1.5">
                      {numerosWhatsApp.map((numero) => {
                        const href = enlaceWhatsApp(numero.intl, MENSAJES_WHATSAPP.general);
                        return (
                          <p key={numero.intl} className="text-[15px] text-azul-950">
                            <a
                              href={href}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="font-medium text-azul-700 underline-offset-2 hover:underline"
                            >
                              {numero.label}
                            </a>
                            {numero.person ? (
                              <span className="text-acero-600"> · {numero.person}</span>
                            ) : null}
                          </p>
                        );
                      })}
                    </dd>
                  </div>
                ) : null}

                {/* El teléfono solo se repite si NO es uno de los WhatsApp:
                    hoy la línea fija y el WhatsApp principal son el mismo
                    número y pintarlo dos veces confunde. */}
                {telefono &&
                !numerosWhatsApp.some((numero) => numero.intl === telefono.intl) ? (
                  <div className="grid grid-cols-[1.75rem_1fr] items-start gap-x-4 border-t border-separador px-5 py-4 first:border-t-0">
                    <IconoTelefono className="row-span-2 mt-0.5 size-6 shrink-0 text-azul-600" />
                    <dt className="text-[13px] text-acero-600">
                      Teléfono
                    </dt>
                    <dd className="mt-1 text-[15px] text-azul-950">
                      <a
                        href={hrefTelefono(telefono)}
                        className="font-medium text-azul-700 underline-offset-2 hover:underline"
                      >
                        {telefono.label}
                      </a>
                    </dd>
                  </div>
                ) : null}

                {correos.length > 0 ? (
                  <div className="grid grid-cols-[1.75rem_1fr] items-start gap-x-4 border-t border-separador px-5 py-4 first:border-t-0">
                    <IconoCorreo className="row-span-2 mt-0.5 size-6 shrink-0 text-azul-600" />
                    <dt className="text-[13px] text-acero-600">
                      Correo
                    </dt>
                    <dd className="mt-1 space-y-1.5">
                      {correos.map((correo) => (
                        <p key={correo.address} className="text-[15px] text-azul-950">
                          <a
                            href={`mailto:${correo.address}`}
                            className="font-medium break-all text-azul-700 underline-offset-2 hover:underline"
                          >
                            {correo.address}
                          </a>
                        </p>
                      ))}
                    </dd>
                  </div>
                ) : null}

                {/* Horario: solo si está en los ajustes. Nunca se inventa. */}
                {horario ? (
                  <div className="grid grid-cols-[1.75rem_1fr] items-start gap-x-4 border-t border-separador px-5 py-4 first:border-t-0">
                    <IconoReloj className="row-span-2 mt-0.5 size-6 shrink-0 text-azul-600" />
                    <dt className="text-[13px] text-acero-600">
                      Horario
                    </dt>
                    <dd className="mt-1 text-[15px] text-azul-950">{horario}</dd>
                  </div>
                ) : null}

                {instagram ? (
                  <div className="grid grid-cols-[1.75rem_1fr] items-start gap-x-4 border-t border-separador px-5 py-4 first:border-t-0">
                    <IconoInstagram className="row-span-2 mt-0.5 size-6 shrink-0 text-azul-600" />
                    <dt className="text-[13px] text-acero-600">
                      Instagram
                    </dt>
                    <dd className="mt-1 text-[15px]">
                      <a
                        href={instagram}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-medium text-azul-700 underline-offset-2 hover:underline"
                      >
                        {usuarioInstagram(instagram)}
                      </a>
                    </dd>
                  </div>
                ) : null}
              </dl>

              <div className="mt-4 rounded-tarjeta bg-azul-50 px-5 py-4">
                <p className="text-[14px] leading-relaxed text-azul-900">
                  {contacto.legalName}
                  {contacto.nit ? ` · NIT ${contacto.nit}` : ""}
                </p>
              </div>
            </div>

            {/* Formulario */}
            <div className="lg:col-span-7">
              <Rotulo>Formulario</Rotulo>
              <TituloSeccion className="mt-5 !text-[1.75rem] sm:!text-[2rem]">
                {ajustes?.tituloFormulario || "Cuéntenos qué necesita"}
              </TituloSeccion>
              {ajustes?.introFormulario !== "" ? (
                <p className="mt-4 max-w-[60ch] text-[15px] leading-relaxed text-acero-600">
                  {ajustes?.introFormulario ??
                    "Al enviar, se abre WhatsApp con el mensaje ya escrito para que solo tenga que darle enviar. No enviamos correos automáticos."}
                </p>
              ) : null}

              <div className="mt-8">
                <FormularioContacto
                  servicios={servicios.map((servicio) => ({
                    slug: servicio.slug,
                    titulo: servicio.navTitle,
                  }))}
                  nota={ajustes?.notaFormulario}
                />
              </div>
            </div>
          </div>
        </Contenedor>
      </section>

      {/* Mapa */}
      {mapaEmbebido ? (
        <section
          aria-labelledby="titulo-mapa"
          className="bg-lienzo-alto"
        >
          <Contenedor className="py-16 lg:py-20">
            <Rotulo>Ubicación</Rotulo>
            <TituloSeccion id="titulo-mapa" className="mt-5">
              {ajustes?.tituloMapa || "Cómo llegar"}
            </TituloSeccion>
            <p className="mt-4 text-[15px] text-acero-600">{direccion}</p>

            <div className="mt-8 overflow-hidden rounded-panel bg-blanco p-2 shadow-elevada">
              <iframe
                src={mapaEmbebido}
                title={`Mapa de Google con la ubicación de PIYC: ${direccion}`}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                className="block aspect-[16/10] w-full rounded-tarjeta border-0 sm:aspect-[21/9]"
              />
            </div>
          </Contenedor>
        </section>
      ) : null}

      <Faq
        preguntas={faq}
        rotulo="Dudas frecuentes"
        titulo="Antes de escribirnos"
        id="faq-contacto"
      />
    </main>
  );
}
