/**
 * DETALLE DE PROYECTO — `/proyectos/[slug]`
 *
 * El cuerpo del caso son tres párrafos en este orden: contexto → solución →
 * resultado (así los escribió el agente de contenido desde el PPTX). El
 * componente no los etiqueta uno por uno porque el panel puede escribir más o
 * menos de tres; se pintan como cuerpo continuo.
 */

import type { Metadata } from "next";

import { notFound } from "next/navigation";
import {
  enParrafos,
  galeriaCompleta,
  getContacto,
  getPaginas,
  getProyecto,
  getProyectos,
  getServiciosPorSlug,
  getVecinosDeProyecto,
} from "@/lib/content";
import { MENSAJES_WHATSAPP, enlaceWhatsAppDe } from "@/lib/contacto";
import { jsonLdCaso, jsonLdMigas, metadataDePagina, type Miga } from "@/lib/seo";
import { proyectosEstaticos } from "@/data/proyectos";
import { CabeceraInterna, FichaTecnica } from "@/components/sections/CabeceraInterna";
import { FranjaCta } from "@/components/sections/FranjaCta";
import { Galeria } from "@/components/sections/Galeria";
import { RejillaDeServicios, columnasParaCantidad } from "@/components/sections/tarjetas";
import {
  Contenedor,
  NavegacionEntreFichas,
  Parrafos,
  Rotulo,
  TituloSeccion,
} from "@/components/sections/primitivas";
import { FotoEnmarcada } from "@/components/ui/ContentImage";
import { JsonLd } from "@/components/ui/JsonLd";

export const revalidate = 300;

export async function generateStaticParams() {
  const proyectos = await getProyectos();
  return proyectos.map((proyecto) => ({ slug: proyecto.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const proyecto = await getProyecto(slug);
  if (!proyecto) return {};

  return metadataDePagina({
    titulo: proyecto.title,
    descripcion: proyecto.description || enParrafos(proyecto.body)[0] || "",
    ruta: `/proyectos/${proyecto.slug}`,
    imagen: proyecto.images.cover,
    tipo: "article",
  });
}

export default async function PaginaDeProyecto({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const proyecto = await getProyecto(slug);
  if (!proyecto) notFound();

  const [contacto, vecinos, paginas] = await Promise.all([
    getContacto(),
    getVecinosDeProyecto(slug),
    getPaginas(),
  ]);

  // Textos de la plantilla (iguales en todos los casos), editables desde el
  // panel en «Textos de las páginas».
  const plantilla = paginas.proyectoDetalle;
  const notaServicios =
    plantilla?.notaServicios ??
    "Este caso combinó varios servicios de PIYC. Abajo puede ver cada uno.";

  // La relación caso → servicio vive en el respaldo estático: `site_projects`
  // no tiene columna para ella (`docs/CONTENIDO.md` §7).
  const slugsDeServicio =
    proyectosEstaticos.find((estatico) => estatico.slug === slug)?.servicios ?? [];
  const serviciosDelCaso = await getServiciosPorSlug(slugsDeServicio);

  const hrefWhatsApp = enlaceWhatsAppDe(contacto, MENSAJES_WHATSAPP.proyecto(proyecto.title));
  const cuerpo = enParrafos(proyecto.body || proyecto.description);
  const galeria = galeriaCompleta(proyecto.images);
  const portada = proyecto.images.cover;

  const migas: Miga[] = [
    { etiqueta: "Inicio", href: "/" },
    { etiqueta: "Proyectos", href: "/proyectos" },
    { etiqueta: proyecto.title, href: `/proyectos/${proyecto.slug}` },
  ];

  return (
    <main id="contenido">
      <JsonLd datos={jsonLdMigas(migas)} />
      <JsonLd
        datos={jsonLdCaso({
          titulo: proyecto.title,
          descripcion: proyecto.description || cuerpo[0] || "",
          ruta: `/proyectos/${proyecto.slug}`,
          imagen: proyecto.images.cover,
          actualizado: proyecto.updatedAt,
          contacto,
        })}
      />

      <CabeceraInterna
        rotulo="Caso de éxito"
        titulo={proyecto.title}
        bajada={proyecto.description}
        migas={migas}
        aside={
          portada ? (
            <FotoEnmarcada
              src={portada}
              alt={proyecto.images.coverAlt ?? proyecto.title}
              proporcion="aspect-[4/3]"
              prioritaria
              className="mx-auto max-w-[min(100%,26rem)] lg:mx-0 lg:ml-auto"
            />
          ) : undefined
        }
      />

      {/* Cuerpo del caso */}
      <section aria-labelledby="titulo-caso" className="bg-lienzo">
        <Contenedor className="py-16 lg:py-20">
          <div className="grid gap-12 lg:grid-cols-12">
            <div className="lg:col-span-7">
              <Rotulo>El proyecto</Rotulo>
              <TituloSeccion id="titulo-caso" className="mt-5">
                {plantilla?.tituloCuerpo || "Contexto, solución y resultado"}
              </TituloSeccion>
              <Parrafos textos={cuerpo} className="mt-6" />
            </div>

            <div className="lg:col-span-5">
              <FichaTecnica
                titulo="Datos del proyecto"
                filas={[
                  { dato: "Cliente", valor: proyecto.client },
                  {
                    dato: "Servicios",
                    valor: serviciosDelCaso.map((servicio) => servicio.navTitle).join(" · "),
                  },
                  { dato: "Ubicación", valor: "Valle del Cauca, Colombia" },
                ]}
              />

              {serviciosDelCaso.length > 0 && notaServicios ? (
                <p className="mt-4 text-[13px] leading-snug text-acero-600">{notaServicios}</p>
              ) : null}
            </div>
          </div>
        </Contenedor>
      </section>

      {/* Galería */}
      {galeria.length > 0 ? (
        <section
          aria-labelledby="titulo-galeria-proyecto"
          className="bg-lienzo-alto"
        >
          <Contenedor className="py-16 lg:py-20">
            <Rotulo>Del proyecto</Rotulo>
            <TituloSeccion id="titulo-galeria-proyecto" className="mt-5">
              {plantilla?.tituloGaleria || "Galería"}
            </TituloSeccion>
            <Galeria
              imagenes={galeria}
              titulo={proyecto.title}
              columnas={3}
              className="mt-8"
            />
          </Contenedor>
        </section>
      ) : null}

      {/* Servicios que intervinieron */}
      {serviciosDelCaso.length > 0 ? (
        <section aria-labelledby="titulo-servicios-caso" className="bg-lienzo">
          <Contenedor className="py-16 lg:py-20">
            <TituloSeccion id="titulo-servicios-caso">
              {plantilla?.tituloServicios || "Servicios que intervinieron"}
            </TituloSeccion>
            <div className="mt-8">
              <RejillaDeServicios
                servicios={serviciosDelCaso}
                columnas={columnasParaCantidad(serviciosDelCaso.length)}
              />
            </div>
          </Contenedor>
        </section>
      ) : null}

      {/* Anterior / siguiente entre casos */}
      <NavegacionEntreFichas
        anterior={vecinos.anterior}
        siguiente={vecinos.siguiente}
        etiqueta="Navegación entre proyectos"
        base="/proyectos"
      />

      <FranjaCta
        titulo={plantilla?.cta?.title ?? "¿Quiere un resultado parecido en su planta?"}
        texto={plantilla?.cta?.body}
        hrefWhatsApp={hrefWhatsApp}
        hrefSecundario="/proyectos"
        etiquetaSecundaria="Ver los demás casos"
      />
    </main>
  );
}
