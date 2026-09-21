/**
 * DETALLE DE SERVICIO — `/servicios/[slug]`
 *
 * En Next 16 `params` es una Promise: hay que esperarla antes de leer `slug`.
 *
 * `generateStaticParams` prerrenderiza los nueve servicios en el build. Un
 * slug que no exista cae en `notFound()`.
 */

import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  enParrafos,
  galeriaCompleta,
  getContacto,
  getPaginas,
  getProyectosDeServicio,
  getServicio,
  getServicios,
} from "@/lib/content";
import { MENSAJES_WHATSAPP, enlaceWhatsAppDe } from "@/lib/contacto";
import {
  jsonLdMigas,
  jsonLdServicio,
  metadataDePagina,
  type Miga,
} from "@/lib/seo";
import { lineasDeServicio } from "@/data/servicios";
import { CabeceraInterna, FichaTecnica } from "@/components/sections/CabeceraInterna";
import { FranjaCta } from "@/components/sections/FranjaCta";
import { Galeria } from "@/components/sections/Galeria";
import { GraficoServicio } from "@/components/sections/GraficoServicio";
import { RejillaDeProyectos, RejillaDeServicios } from "@/components/sections/tarjetas";
import {
  Contenedor,
  ListaDeAlcances,
  Parrafos,
  Rotulo,
  TituloSeccion,
} from "@/components/sections/primitivas";
import { FotoEnmarcada } from "@/components/ui/ContentImage";
import { JsonLd } from "@/components/ui/JsonLd";

export const revalidate = 300;

export async function generateStaticParams() {
  const servicios = await getServicios();
  return servicios.map((servicio) => ({ slug: servicio.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const servicio = await getServicio(slug);
  if (!servicio) return {};

  return metadataDePagina({
    titulo: servicio.metaTitle || servicio.title,
    descripcion: servicio.metaDescription || servicio.summary,
    ruta: `/servicios/${servicio.slug}`,
    imagen: servicio.images.cover,
    tipo: "article",
  });
}

export default async function PaginaDeServicio({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const servicio = await getServicio(slug);
  if (!servicio) notFound();

  const [contacto, todos, relacionados, paginas] = await Promise.all([
    getContacto(),
    getServicios(),
    getProyectosDeServicio(slug),
    getPaginas(),
  ]);

  const hrefWhatsApp = enlaceWhatsAppDe(
    contacto,
    MENSAJES_WHATSAPP.servicio(servicio.title.toLowerCase()),
  );

  const migas: Miga[] = [
    { etiqueta: "Inicio", href: "/" },
    { etiqueta: "Servicios", href: "/servicios" },
    { etiqueta: servicio.navTitle, href: `/servicios/${servicio.slug}` },
  ];

  const galeria = galeriaCompleta(servicio.images);
  const portada = servicio.images.cover;
  const otros = todos.filter((otro) => otro.slug !== servicio.slug).slice(0, 3);
  const parrafos = enParrafos(servicio.description);
  // Línea a la que pertenece el servicio (agrupación propuesta, en el código).
  const linea = lineasDeServicio.find((candidata) => candidata.slugs.includes(servicio.slug));

  return (
    <main id="contenido">
      <JsonLd datos={jsonLdMigas(migas)} />
      <JsonLd
        datos={jsonLdServicio({
          nombre: servicio.title,
          descripcion: servicio.summary || parrafos[0] || "",
          ruta: `/servicios/${servicio.slug}`,
          contacto,
          alcances: servicio.items,
        })}
      />

      <CabeceraInterna
        rotulo="Servicio"
        titulo={servicio.title}
        bajada={servicio.summary}
        migas={migas}
        aside={
          portada ? (
            <FotoEnmarcada
              src={portada}
              alt={servicio.images.coverAlt ?? servicio.title}
              proporcion="aspect-[4/3]"
              prioritaria
              className="mx-auto max-w-[min(100%,26rem)] lg:mx-0 lg:ml-auto"
            />
          ) : (
            <GraficoServicio
              servicio={servicio}
              className="mx-auto max-w-[min(100%,26rem)] lg:mx-0 lg:ml-auto"
            />
          )
        }
      />

      {/* Descripción + alcances */}
      <section aria-labelledby="titulo-alcance" className="bg-lienzo">
        <Contenedor className="py-16 lg:py-20">
          <div className="grid gap-12 lg:grid-cols-12 lg:gap-12">
            <div className="lg:col-span-7">
              <Rotulo>En qué consiste</Rotulo>
              {/* El h2 no puede repetir el h1: en cuatro servicios `title` y
                  `navTitle` son la misma cadena («Telemetría» / «Telemetría»). */}
              <TituloSeccion id="titulo-alcance" className="mt-5">
                Alcance y forma de trabajo
              </TituloSeccion>
              <Parrafos textos={parrafos} className="mt-6" />
            </div>

            <div className="lg:col-span-5">
              <FichaTecnica
                titulo="Resumen"
                filas={[
                  { dato: "Servicio", valor: servicio.navTitle },
                  { dato: "Línea", valor: linea?.titulo },
                  { dato: "Zona", valor: "Cali y Valle del Cauca" },
                  {
                    dato: "Casos publicados",
                    valor: relacionados.length ? String(relacionados.length) : null,
                  },
                ]}
              />
            </div>
          </div>

          {servicio.items.length > 0 ? (
            <div className="mt-12">
              <h3 className="text-[1.375rem] font-semibold leading-tight text-azul-950">
                Qué incluye
              </h3>
              <ListaDeAlcances items={servicio.items} className="mt-5" />
            </div>
          ) : null}
        </Contenedor>
      </section>

      {/* Galería */}
      {galeria.length > 0 ? (
        <section
          aria-labelledby="titulo-galeria-servicio"
          className="bg-lienzo-alto"
        >
          <Contenedor className="py-16 lg:py-20">
            <Rotulo>Del trabajo</Rotulo>
            <TituloSeccion id="titulo-galeria-servicio" className="mt-5">
              Galería
            </TituloSeccion>
            <Galeria
              imagenes={galeria}
              titulo={servicio.navTitle}
              columnas={3}
              className="mt-8"
            />
          </Contenedor>
        </section>
      ) : null}

      {/* Proyectos relacionados */}
      {relacionados.length > 0 ? (
        <section aria-labelledby="titulo-relacionados" className="bg-lienzo">
          <Contenedor className="py-16 lg:py-20">
            <Rotulo>Casos de éxito</Rotulo>
            <TituloSeccion id="titulo-relacionados" className="mt-5">
              Proyectos con este servicio
            </TituloSeccion>
            <div className="mt-8">
              <RejillaDeProyectos proyectos={relacionados} columnas={3} />
            </div>
          </Contenedor>
        </section>
      ) : null}

      {/* Otros servicios */}
      {otros.length > 0 ? (
        <section
          aria-labelledby="titulo-otros"
          className="bg-lienzo-alto"
        >
          <Contenedor className="py-16 lg:py-20">
            <TituloSeccion id="titulo-otros">Otros servicios</TituloSeccion>
            <div className="mt-8">
              <RejillaDeServicios servicios={otros} columnas={3} />
            </div>
          </Contenedor>
        </section>
      ) : null}

      <FranjaCta
        titulo={`¿Necesita ${servicio.navTitle.toLowerCase()}?`}
        texto={
          paginas.servicioDetalle?.ctaTexto ??
          "Escríbanos con los datos del equipo o del proceso y le decimos qué información hace falta para cotizar."
        }
        hrefWhatsApp={hrefWhatsApp}
        etiquetaWhatsApp="Consultar por WhatsApp"
      />
    </main>
  );
}
