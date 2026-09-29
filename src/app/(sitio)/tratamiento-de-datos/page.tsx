/**
 * POLÍTICA DE TRATAMIENTO DE DATOS PERSONALES — `/tratamiento-de-datos`
 * =====================================================================
 * La página legal que pide la **Ley 1581 de 2012** y el **Decreto 1074 de
 * 2015** (art. 2.2.2.25.3.1: contenido mínimo de la política). Es la que
 * enlaza la casilla del formulario de contacto, el pie de página y el portal
 * del equipo.
 *
 * TODO EL TEXTO ES EDITABLE desde Panel → Contenido → Textos de las páginas.
 * Vive en `site_settings.paginas.tratamientoDatos` y cae al respaldo estático
 * de `src/data/ajustes.ts` como el resto del sitio.
 *
 * LOS DATOS DEL RESPONSABLE NO SE ESCRIBEN AQUÍ. La ficha de identificación
 * —razón social, NIT, dirección, teléfono, correo, horario— se arma con
 * `site_settings.contact`, y dentro del cuerpo entran por marcadores que
 * `src/lib/politica-datos.ts` sustituye. Si PIYC cambia de sede, la política
 * se actualiza sola.
 *
 * Sin tildes en la URL, como el resto de las rutas del sitio.
 */

import type { Metadata } from "next";
import Link from "next/link";
import { getContacto, getPaginas, getSeo } from "@/lib/content";
import { correoPrincipal, direccionEnLinea, hrefTelefono, telefonoPrincipal } from "@/lib/contacto";
import {
  bloquesDeCuerpo,
  fechaEnLetras,
  resolverMarcadores,
  seccionesDePolitica,
} from "@/lib/politica-datos";
import { RUTA_POLITICA_DATOS } from "@/lib/content-types";
import { jsonLdMigas, metadataDePagina, metadatosPagina, type Miga } from "@/lib/seo";
import { CabeceraInterna } from "@/components/sections/CabeceraInterna";
import { Contenedor, Rotulo } from "@/components/sections/primitivas";
import { JsonLd } from "@/components/ui/JsonLd";

export const revalidate = 300;

const MIGAS: Miga[] = [
  { etiqueta: "Inicio", href: "/" },
  { etiqueta: "Tratamiento de datos", href: RUTA_POLITICA_DATOS },
];

export async function generateMetadata(): Promise<Metadata> {
  const seo = await getSeo();
  const { titulo, descripcion, imagen } = metadatosPagina(
    seo.paginas?.tratamientoDatos,
    {
      titulo: "Tratamiento de datos personales",
      descripcion:
        "Qué datos personales recoge PIYC, para qué los usa, cuánto los conserva y cómo ejercer sus derechos de conocer, actualizar, rectificar y suprimir.",
    },
    seo.ogImage,
  );
  return metadataDePagina({ titulo, descripcion, ruta: RUTA_POLITICA_DATOS, imagen });
}

/** `id` estable para el índice lateral y para enlazar una sección concreta. */
function idDeSeccion(indice: number): string {
  return `seccion-${indice + 1}`;
}

/** Una fila de la ficha del responsable. Sin dato, la fila no se pinta. */
function FilaResponsable({
  dato,
  children,
}: {
  dato: string;
  children: React.ReactNode;
}) {
  return (
    <div className="border-t border-separador py-3 first:border-t-0 first:pt-0">
      <dt className="text-[13px] text-acero-600">{dato}</dt>
      <dd className="mt-1 text-[15px] leading-relaxed text-azul-950">{children}</dd>
    </div>
  );
}

const CLASE_ENLACE = "font-medium text-azul-700 underline-offset-2 hover:underline";

export default async function TratamientoDeDatos() {
  const [contacto, paginas] = await Promise.all([getContacto(), getPaginas()]);

  const politica = paginas.tratamientoDatos;
  const secciones = seccionesDePolitica(politica, contacto);
  const intro = politica?.intro ? resolverMarcadores(politica.intro, contacto) : "";
  const vigencia = fechaEnLetras(politica?.vigenteDesde);
  const version = politica?.version?.trim() ?? "";

  const telefono = telefonoPrincipal(contacto);
  const correo = correoPrincipal(contacto);
  const direccion = direccionEnLinea(contacto);
  const horario = contacto.horario?.label;

  return (
    <main id="contenido" data-pagina="tratamiento-de-datos">
      <JsonLd datos={jsonLdMigas(MIGAS)} />

      <CabeceraInterna
        ajustes={{
          eyebrow: politica?.eyebrow,
          title: politica?.title,
          subtitle: politica?.subtitle,
        }}
        rotulo="Datos personales"
        titulo="Política de tratamiento de datos personales"
        migas={MIGAS}
        imagen={null}
      />

      <section aria-labelledby="titulo-politica" className="bg-lienzo">
        <Contenedor className="py-14 lg:py-20">
          <h2 id="titulo-politica" className="sr-only">
            Política de tratamiento de datos personales de PIYC
          </h2>

          <div className="grid gap-5 lg:grid-cols-12 lg:items-start lg:gap-6">
            {/* Ficha del responsable: los datos salen de los ajustes, nunca
                del texto de la política. Una fila sin dato no se pinta. */}
            <aside className="rounded-panel bg-blanco p-6 shadow-tarjeta ring-1 ring-separador sm:p-8 lg:sticky lg:top-28 lg:col-span-4">
              <Rotulo>Responsable</Rotulo>
              <h3 className="mt-4 text-[1.375rem] font-semibold leading-tight text-azul-950">
                Quién trata sus datos
              </h3>
              <dl className="mt-4">
                {contacto.legalName ? (
                  <FilaResponsable dato="Razón social">{contacto.legalName}</FilaResponsable>
                ) : null}
                {contacto.nit ? <FilaResponsable dato="NIT">{contacto.nit}</FilaResponsable> : null}
                {direccion ? (
                  <FilaResponsable dato="Dirección">{direccion}</FilaResponsable>
                ) : null}
                {telefono ? (
                  <FilaResponsable dato="Teléfono y WhatsApp">
                    <a href={hrefTelefono(telefono)} className={CLASE_ENLACE}>
                      {telefono.label}
                    </a>
                  </FilaResponsable>
                ) : null}
                {correo ? (
                  <FilaResponsable dato="Correo para ejercer sus derechos">
                    <a href={`mailto:${correo}`} className={`break-all ${CLASE_ENLACE}`}>
                      {correo}
                    </a>
                  </FilaResponsable>
                ) : null}
                {horario ? (
                  <FilaResponsable dato="Horario de atención">{horario}</FilaResponsable>
                ) : null}
                {vigencia ? (
                  <FilaResponsable dato="Entrada en vigencia">
                    {vigencia}
                    {version ? ` · Versión ${version}` : ""}
                  </FilaResponsable>
                ) : null}
              </dl>

              {secciones.length > 0 ? (
                <nav aria-label="Contenido de la política" className="mt-6 border-t border-separador pt-5">
                  <h3 className="text-[13px] font-semibold text-acero-600">En esta página</h3>
                  <ol className="mt-3 space-y-1.5 text-[15px] leading-snug">
                    {secciones.map((seccion, indice) => (
                      <li key={seccion.titulo}>
                        <a href={`#${idDeSeccion(indice)}`} className={CLASE_ENLACE}>
                          {seccion.titulo}
                        </a>
                      </li>
                    ))}
                  </ol>
                </nav>
              ) : null}
            </aside>

            {/* Cuerpo de la política */}
            <div className="rounded-panel bg-blanco p-6 shadow-tarjeta ring-1 ring-separador sm:p-8 lg:col-span-8 lg:p-10">
              {intro ? (
                <p className="max-w-[70ch] text-[1.0625rem] leading-[1.7] text-acero-700">{intro}</p>
              ) : null}

              {secciones.map((seccion, indice) => (
                <section
                  key={seccion.titulo}
                  id={idDeSeccion(indice)}
                  aria-labelledby={`${idDeSeccion(indice)}-titulo`}
                  className="mt-9 scroll-mt-28 border-t border-separador pt-8 first:mt-0 first:border-t-0 first:pt-0"
                >
                  <h3
                    id={`${idDeSeccion(indice)}-titulo`}
                    className="text-[1.375rem] font-semibold leading-tight tracking-titulo text-azul-950 sm:text-[1.5rem]"
                  >
                    {seccion.titulo}
                  </h3>
                  <div className="mt-4 space-y-4 text-[1.0625rem] leading-[1.7] text-acero-700">
                    {bloquesDeCuerpo(seccion.cuerpo).map((bloque, i) =>
                      bloque.tipo === "lista" ? (
                        <ul key={i} className="max-w-[70ch] list-disc space-y-2 pl-5 marker:text-azul-300">
                          {bloque.items.map((item, j) => (
                            <li key={j}>{item}</li>
                          ))}
                        </ul>
                      ) : (
                        <p key={i} className="max-w-[70ch]">
                          {bloque.texto}
                        </p>
                      ),
                    )}
                  </div>
                </section>
              ))}

              <p className="mt-9 border-t border-separador pt-6 text-[15px] leading-relaxed text-acero-600">
                ¿Tiene una solicitud sobre sus datos o una duda sobre esta política?{" "}
                <Link href="/contacto" className={CLASE_ENLACE} prefetch={false}>
                  Escríbanos desde la página de contacto
                </Link>
                {correo ? (
                  <>
                    {" "}
                    o directamente a{" "}
                    <a href={`mailto:${correo}`} className={`break-all ${CLASE_ENLACE}`}>
                      {correo}
                    </a>
                  </>
                ) : null}
                .
              </p>
            </div>
          </div>
        </Contenedor>
      </section>
    </main>
  );
}
