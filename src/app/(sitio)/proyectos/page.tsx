/**
 * PROYECTOS — `/proyectos`
 *
 * Casos de éxito en tarjetas clicables completas. El contenido lo extrajo el
 * agente de contenido del PPTX de PIYC (`docs/CONTENIDO.md` §1).
 */

import type { Metadata } from "next";
import { getContacto, getPaginas, getProyectos, getSeo } from "@/lib/content";
import { MENSAJES_WHATSAPP, enlaceWhatsAppDe } from "@/lib/contacto";
import {
  jsonLdListado,
  jsonLdMigas,
  metadataDePagina,
  metadatosPagina,
  type Miga,
} from "@/lib/seo";
import { CabeceraInterna } from "@/components/sections/CabeceraInterna";
import { FranjaCta } from "@/components/sections/FranjaCta";
import { RejillaDeProyectos, columnasParaCantidad } from "@/components/sections/tarjetas";
import { Contenedor, EntradaSeccion } from "@/components/sections/primitivas";
import { JsonLd } from "@/components/ui/JsonLd";

export const revalidate = 300;

const MIGAS: Miga[] = [
  { etiqueta: "Inicio", href: "/" },
  { etiqueta: "Proyectos", href: "/proyectos" },
];

export async function generateMetadata(): Promise<Metadata> {
  const seo = await getSeo();
  const { titulo, descripcion, imagen } = metadatosPagina(seo.paginas?.proyectos, {
    titulo: "Proyectos",
    descripcion:
      "Casos de éxito de PIYC: automatizaciones, sistemas de control e ingeniería eléctrica entregados en plantas de producción del Valle del Cauca.",
  }, seo.ogImage);
  return metadataDePagina({ titulo, descripcion, ruta: "/proyectos", imagen });
}

export default async function ListadoDeProyectos() {
  const [proyectos, paginas, contacto] = await Promise.all([
    getProyectos(),
    getPaginas(),
    getContacto(),
  ]);

  const hrefWhatsApp = enlaceWhatsAppDe(contacto, MENSAJES_WHATSAPP.cotizacion);
  const ajustes = paginas.proyectos;

  return (
    <main id="contenido">
      <JsonLd datos={jsonLdMigas(MIGAS)} />
      <JsonLd
        datos={jsonLdListado({
          nombre: ajustes?.title || "Proyectos de PIYC",
          descripcion:
            ajustes?.intro ||
            ajustes?.subtitle ||
            "Casos de éxito de automatización e ingeniería eléctrica entregados por PIYC.",
          ruta: "/proyectos",
          elementos: proyectos.map((proyecto) => ({
            nombre: proyecto.title,
            ruta: `/proyectos/${proyecto.slug}`,
          })),
        })}
      />

      <CabeceraInterna
        ajustes={ajustes}
        rotulo="Casos de éxito"
        titulo="Proyectos"
        migas={MIGAS}
      />

      <section aria-labelledby="titulo-listado" className="bg-lienzo">
        <Contenedor className="py-16 lg:py-20">
          <h2 id="titulo-listado" className="sr-only">
            Listado de proyectos
          </h2>

          {ajustes?.intro ? (
            <EntradaSeccion className="mb-10 max-w-[72ch]">{ajustes.intro}</EntradaSeccion>
          ) : null}

          {proyectos.length > 0 ? (
            /* `columnasParaCantidad`: con 4 casos, tres columnas dejan uno
               solo en la segunda fila y se lee como un error de maquetación. */
            <RejillaDeProyectos
              proyectos={proyectos}
              columnas={columnasParaCantidad(proyectos.length)}
              prioritariaLaPrimera
            />
          ) : (
            <p className="rounded-tarjeta bg-blanco px-5 py-10 text-center text-acero-600 shadow-tarjeta">
              Todavía no hay casos publicados.
            </p>
          )}
        </Contenedor>
      </section>

      <FranjaCta
        titulo={ajustes?.cta?.title ?? "¿Tiene un proyecto parecido?"}
        texto={ajustes?.cta?.body}
        hrefWhatsApp={hrefWhatsApp}
      />
    </main>
  );
}
