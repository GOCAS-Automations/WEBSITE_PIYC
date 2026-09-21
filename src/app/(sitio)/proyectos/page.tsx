/**
 * PROYECTOS — `/proyectos`
 *
 * Casos de éxito en tarjetas clicables completas. El contenido lo extrajo el
 * agente de contenido del PPTX de PIYC (`docs/CONTENIDO.md` §1).
 */

import type { Metadata } from "next";
import { getContacto, getPaginas, getProyectos, getSeo } from "@/lib/content";
import { MENSAJES_WHATSAPP, enlaceWhatsAppDe } from "@/lib/contacto";
import { jsonLdMigas, metadataDePagina, metadatosPagina, type Miga } from "@/lib/seo";
import { CabeceraInterna } from "@/components/sections/CabeceraInterna";
import { FranjaCta } from "@/components/sections/FranjaCta";
import { RejillaDeProyectos } from "@/components/sections/tarjetas";
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
  });
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

      <CabeceraInterna
        ajustes={ajustes}
        rotulo="Casos de éxito"
        titulo="Proyectos"
        migas={MIGAS}
      />

      <section aria-labelledby="titulo-listado" className="bg-blanco">
        <Contenedor className="py-14 lg:py-18">
          <h2 id="titulo-listado" className="sr-only">
            Listado de proyectos
          </h2>

          {ajustes?.intro ? (
            <EntradaSeccion className="mb-10 max-w-[72ch]">{ajustes.intro}</EntradaSeccion>
          ) : null}

          {proyectos.length > 0 ? (
            <RejillaDeProyectos proyectos={proyectos} columnas={3} prioritariaLaPrimera />
          ) : (
            <p className="border border-acero-200 px-5 py-8 text-center text-acero-600">
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
