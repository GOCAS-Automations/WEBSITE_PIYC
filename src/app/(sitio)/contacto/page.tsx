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
 *
 * COMPOSICIÓN (sep-2026)
 * ----------------------
 * Cabecera con foto de fondo. Debajo, una rejilla de dos columnas: a la
 * izquierda la tarjeta de datos y, bajo ella, el mapa, que se estira hasta el
 * pie del formulario (antes la columna de datos terminaba mucho antes que el
 * formulario y el mapa iba en otra sección); a la derecha el formulario. En
 * móvil el orden es datos → formulario → mapa: el mapa no empuja el
 * formulario hacia abajo.
 */

import type { Metadata } from "next";
import type { ReactNode } from "react";
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
import { Contenedor, Rotulo } from "@/components/sections/primitivas";
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

/**
 * Una fila de la lista de datos: icono, rótulo y valor. El icono va DENTRO
 * del `<dt>` (decorativo, `aria-hidden`): un `<dl>` solo admite grupos de
 * `<dt>`/`<dd>`, y un `<span>` suelto en el grupo lo marca axe.
 */
function FilaDato({
  icono,
  dato,
  children,
}: {
  icono: ReactNode;
  dato: string;
  children: ReactNode;
}) {
  return (
    <div className="border-t border-separador py-3 pl-11 first:border-t-0">
      <dt className="relative text-[13px] text-acero-600">
        <span aria-hidden="true" className="absolute -left-11 top-0.5">
          {icono}
        </span>
        {dato}
      </dt>
      <dd className="mt-1 text-[15px] leading-relaxed text-azul-950">{children}</dd>
    </div>
  );
}

const CLASE_ENLACE = "font-medium text-azul-700 underline-offset-2 hover:underline";

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
        <Contenedor className="py-14 lg:py-20">
          <h2 id="titulo-contacto" className="sr-only">
            Datos de contacto y formulario
          </h2>

          {/* Rejilla con áreas: datos (izq. arriba), mapa (izq. abajo, se estira)
              y formulario (der., ocupa las dos filas). */}
          <div className="grid gap-5 lg:grid-cols-12 lg:grid-rows-[auto_1fr] lg:gap-6">
            {/* Datos */}
            <div className="rounded-panel bg-blanco p-6 shadow-tarjeta ring-1 ring-separador sm:p-8 lg:col-span-5 lg:row-start-1 lg:p-10">
              <Rotulo>Datos</Rotulo>
              <h3 className="mt-4 text-[1.625rem] font-semibold leading-tight text-azul-950 sm:text-[1.875rem]">
                {ajustes?.tituloDatos || "Dónde encontrarnos"}
              </h3>

              <dl className="mt-4">
                {direccion ? (
                  <FilaDato
                    dato="Dirección"
                    icono={<IconoUbicacion className="size-6 text-azul-600" />}
                  >
                    {direccion}
                    {mapaExterno ? (
                      <>
                        {" · "}
                        <a
                          href={mapaExterno}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={CLASE_ENLACE}
                        >
                          Abrir en Google Maps
                        </a>
                      </>
                    ) : null}
                  </FilaDato>
                ) : null}

                {numerosWhatsApp.length > 0 ? (
                  <FilaDato
                    dato="WhatsApp"
                    icono={<IconoWhatsApp className="size-6 text-verde-600" />}
                  >
                    <span className="block space-y-1.5">
                      {numerosWhatsApp.map((numero) => (
                        <span key={numero.intl} className="block">
                          <a
                            href={enlaceWhatsApp(numero.intl, MENSAJES_WHATSAPP.general)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={CLASE_ENLACE}
                          >
                            {numero.label}
                          </a>
                          {numero.person ? (
                            <span className="text-acero-600"> · {numero.person}</span>
                          ) : null}
                        </span>
                      ))}
                    </span>
                  </FilaDato>
                ) : null}

                {/* El teléfono solo se repite si NO es uno de los WhatsApp:
                    hoy la línea fija y el WhatsApp principal son el mismo
                    número y pintarlo dos veces confunde. */}
                {telefono &&
                !numerosWhatsApp.some((numero) => numero.intl === telefono.intl) ? (
                  <FilaDato dato="Teléfono" icono={<IconoTelefono className="size-6 text-azul-600" />}>
                    <a href={hrefTelefono(telefono)} className={CLASE_ENLACE}>
                      {telefono.label}
                    </a>
                  </FilaDato>
                ) : null}

                {correos.length > 0 ? (
                  <FilaDato dato="Correo" icono={<IconoCorreo className="size-6 text-azul-600" />}>
                    <span className="block space-y-1.5">
                      {correos.map((correo) => (
                        <span key={correo.address} className="block">
                          <a href={`mailto:${correo.address}`} className={`break-all ${CLASE_ENLACE}`}>
                            {correo.address}
                          </a>
                        </span>
                      ))}
                    </span>
                  </FilaDato>
                ) : null}

                {/* Horario: solo si está en los ajustes. Nunca se inventa. */}
                {horario ? (
                  <FilaDato dato="Horario" icono={<IconoReloj className="size-6 text-azul-600" />}>
                    {horario}
                  </FilaDato>
                ) : null}

                {instagram ? (
                  <FilaDato
                    dato="Instagram"
                    icono={<IconoInstagram className="size-6 text-azul-600" />}
                  >
                    <a href={instagram} target="_blank" rel="noopener noreferrer" className={CLASE_ENLACE}>
                      {usuarioInstagram(instagram)}
                    </a>
                  </FilaDato>
                ) : null}
              </dl>
              {/* La razón social y el NIT ya van en la línea legal del pie:
                  aquí le quitaban alto al mapa de abajo. */}
            </div>

            {/* Formulario */}
            <div className="rounded-panel bg-blanco p-6 shadow-tarjeta ring-1 ring-separador sm:p-8 lg:col-span-7 lg:col-start-6 lg:row-span-2 lg:row-start-1 lg:p-10">
              <Rotulo>Formulario</Rotulo>
              <h3 className="mt-4 text-[1.625rem] font-semibold leading-tight text-azul-950 sm:text-[1.875rem]">
                {ajustes?.tituloFormulario || "Cuéntenos qué necesita"}
              </h3>
              {ajustes?.introFormulario !== "" ? (
                <p className="mt-3 max-w-[60ch] text-[15px] leading-relaxed text-acero-600">
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

            {/* Mapa: llena lo que queda de la columna izquierda hasta el pie
                del formulario. */}
            {mapaEmbebido ? (
              <section
                aria-labelledby="titulo-mapa"
                // Alto mínimo moderado: si fuera alto, la columna izquierda
                // pasaría al formulario y este quedaría con un hueco abajo.
                className="flex min-h-[18rem] flex-col overflow-hidden rounded-panel bg-blanco p-2 shadow-tarjeta ring-1 ring-separador lg:col-span-5 lg:row-start-2 lg:min-h-[10rem]"
              >
                <h3
                  id="titulo-mapa"
                  className="px-4 pb-2 pt-3 text-[15px] font-semibold text-azul-950"
                >
                  {ajustes?.tituloMapa || "Cómo llegar"}
                </h3>
                {/* El mapa muestra la FICHA del negocio, con su nombre, no un
                    pin con la dirección cruda (ver `urlMapaEmbebido`). El
                    título del marco dice lo mismo que se ve dentro. */}
                <iframe
                  src={mapaEmbebido}
                  title={`Mapa de Google con la ficha de ${contacto.legalName ?? "PIYC"}${
                    direccion ? ` en ${direccion}` : ""
                  }`}
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  className="block min-h-[14rem] w-full flex-1 rounded-tarjeta border-0 lg:min-h-[6rem]"
                />
              </section>
            ) : null}
          </div>
        </Contenedor>
      </section>

      <Faq
        preguntas={faq}
        rotulo="Dudas frecuentes"
        titulo="Antes de escribirnos"
        id="faq-contacto"
        fondo="blanco"
      />
    </main>
  );
}
