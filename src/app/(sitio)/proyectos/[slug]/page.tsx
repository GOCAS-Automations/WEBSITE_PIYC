/**
 * DETALLE DE PROYECTO — `/proyectos/[slug]`
 *
 * El cuerpo del caso son tres párrafos en este orden: contexto → solución →
 * resultado (así los escribió el agente de contenido desde el PPTX). El
 * componente no los etiqueta uno por uno porque el panel puede escribir más o
 * menos de tres; se pintan como cuerpo continuo.
 *
 * COMPOSICIÓN (sep-2026)
 * ----------------------
 *  - Cabecera con la portada del caso de fondo. Son capturas de HMI de
 *    ~1229 px: van con velo y un desenfoque leve, que las vuelve textura. Sin
 *    portada, la foto de cabecera de `/proyectos`.
 *  - Cuerpo del caso a la izquierda y, a la derecha, la captura nítida en un
 *    marco oscuro tipo pantalla, del mismo alto que el texto (sin recortarla:
 *    una HMI recortada pierde lo que muestra). Los datos del caso —cliente,
 *    servicios, ubicación— pasan a cápsulas de la cabecera: la tarjeta de la
 *    derecha dejaba un hueco debajo.
 *  - Galería, servicios que intervinieron, anterior/siguiente y cierre.
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
import { CabeceraInterna } from "@/components/sections/CabeceraInterna";
import { FranjaCta } from "@/components/sections/FranjaCta";
import { Galeria } from "@/components/sections/Galeria";
import { RejillaDeFilasDeServicio } from "@/components/sections/tarjetas";
import {
  Contenedor,
  EntradaSeccion,
  NavegacionEntreFichas,
  Parrafos,
  Rotulo,
  TituloSeccion,
} from "@/components/sections/primitivas";
import { ContentImage } from "@/components/ui/ContentImage";
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
  // Portada del caso (la primera de la galería completa), con `alt` de
  // respaldo: sin él la cabecera no la pintaría.
  const portada = galeria[0]
    ? { ...galeria[0], alt: galeria[0].alt || `Imagen del caso: ${proyecto.title}` }
    : null;
  // Segunda imagen del caso, bajo la captura (solo si tiene texto alternativo).
  const segunda = galeria[1]?.alt ? galeria[1] : null;
  // Fondo de la cabecera: la portada, desenfocada; si el caso no tiene, la
  // foto de cabecera de `/proyectos`.
  const fondoCabecera = portada ?? paginas.proyectos?.image ?? null;

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
        imagen={fondoCabecera}
        desenfocar={Boolean(portada)}
        datos={[
          { etiqueta: "Cliente", valor: proyecto.client },
          { etiqueta: "Ubicación", valor: "Valle del Cauca, Colombia" },
        ]}
      />

      {/* Cuerpo del caso + captura nítida en marco de pantalla */}
      <section aria-labelledby="titulo-caso" className="bg-lienzo">
        <Contenedor className="py-16 lg:py-20">
          <div className="grid gap-10 lg:grid-cols-12 lg:gap-14">
            <div className={portada ? "lg:col-span-6" : "max-w-3xl lg:col-span-12"}>
              <Rotulo>El proyecto</Rotulo>
              <TituloSeccion id="titulo-caso" className="mt-5">
                {plantilla?.tituloCuerpo || "Contexto, solución y resultado"}
              </TituloSeccion>
              <Parrafos textos={cuerpo} className="mt-6" />
            </div>

            {/* Columna de imágenes, del alto del texto: la captura de la
                pantalla (entera, en marco oscuro) y, si el caso tiene más, la
                segunda imagen debajo —pantalla y campo—. Con una sola, la
                captura ocupa toda la columna. */}
            {portada ? (
              <div className="flex flex-col gap-4 lg:col-span-6">
                <ContentImage
                  src={portada.src}
                  alt={portada.alt}
                  width={portada.width}
                  height={portada.height}
                  srcMovil={portada.srcMovil}
                  sizes="(min-width: 1024px) 50vw, 100vw"
                  ajuste="contain"
                  className="p-3 sm:p-4"
                  proporcion={
                    segunda
                      ? "aspect-[16/10] lg:aspect-auto lg:min-h-[13rem] lg:flex-1"
                      : "aspect-[4/3] lg:aspect-auto lg:min-h-[22rem] lg:flex-1"
                  }
                  claseContenedor="fondo-noche rounded-panel shadow-elevada ring-1 ring-separador"
                />
                {segunda ? (
                  <ContentImage
                    src={segunda.src}
                    alt={segunda.alt}
                    width={segunda.width}
                    height={segunda.height}
                    srcMovil={segunda.srcMovil}
                    sizes="(min-width: 1024px) 50vw, 100vw"
                    proporcion="aspect-[16/10] lg:aspect-auto lg:min-h-[13rem] lg:flex-1"
                    claseContenedor="rounded-panel bg-acero-100 shadow-elevada ring-1 ring-separador"
                  />
                ) : null}
              </div>
            ) : null}
          </div>
        </Contenedor>
      </section>

      {/* Galería: con más de una imagen (la portada ya está arriba). */}
      {galeria.length > 1 ? (
        <section aria-labelledby="titulo-galeria-proyecto" className="bg-blanco">
          <Contenedor className="py-16 lg:py-20">
            <Rotulo>Del proyecto</Rotulo>
            <TituloSeccion id="titulo-galeria-proyecto" className="mt-5">
              {plantilla?.tituloGaleria || "Galería"}
            </TituloSeccion>
            <Galeria
              imagenes={galeria}
              titulo={proyecto.title}
              columnas={galeria.length % 3 === 0 ? 3 : 2}
              className="mt-8"
            />
          </Contenedor>
        </section>
      ) : null}

      {/* Servicios que intervinieron */}
      {serviciosDelCaso.length > 0 ? (
        <section
          aria-labelledby="titulo-servicios-caso"
          className={galeria.length > 1 ? "bg-lienzo" : "bg-blanco"}
        >
          <Contenedor className="py-16 lg:py-20">
            <div className="grid gap-5 lg:grid-cols-12 lg:items-end lg:gap-12">
              <TituloSeccion id="titulo-servicios-caso" className="lg:col-span-6">
                {plantilla?.tituloServicios || "Servicios que intervinieron"}
              </TituloSeccion>
              {/* La nota dice «combinó varios servicios»: con uno solo no aplica. */}
              {notaServicios && serviciosDelCaso.length > 1 ? (
                <EntradaSeccion className="lg:col-span-6">{notaServicios}</EntradaSeccion>
              ) : null}
            </div>
            <div className="mt-8">
              <RejillaDeFilasDeServicio
                servicios={serviciosDelCaso}
                columnas={
                  serviciosDelCaso.length === 1 ? 1 : serviciosDelCaso.length % 3 === 0 ? 3 : 2
                }
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
        etiquetaListado="Todos los casos de éxito"
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
