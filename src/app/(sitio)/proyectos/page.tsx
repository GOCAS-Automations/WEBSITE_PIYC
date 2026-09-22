/**
 * PROYECTOS — `/proyectos`
 *
 * Casos de éxito en tarjetas clicables completas. El contenido lo extrajo el
 * agente de contenido del PPTX de PIYC (`docs/CONTENIDO.md` §1).
 *
 * COMPOSICIÓN (sep-2026): cabecera con foto de fondo; entrada con los
 * clientes de los casos (sacados de los propios casos, no inventados); los
 * primeros casos en grande y el resto en una rejilla que se llena sin
 * huérfanas (`ListadoDeProyectos`).
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
import { ListadoDeProyectos } from "@/components/sections/tarjetas";
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

export default async function ListadoDeProyectosPagina() {
  const [proyectos, paginas, contacto] = await Promise.all([
    getProyectos(),
    getPaginas(),
    getContacto(),
  ]);

  const hrefWhatsApp = enlaceWhatsAppDe(contacto, MENSAJES_WHATSAPP.cotizacion);
  const ajustes = paginas.proyectos;
  // Clientes de los casos publicados, sin repetir y en orden de aparición.
  const clientes = [
    ...new Set(
      proyectos
        .map((proyecto) => proyecto.client?.trim())
        .filter((cliente): cliente is string => Boolean(cliente)),
    ),
  ];

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
        <Contenedor className="py-14 lg:py-20">
          <h2 id="titulo-listado" className="sr-only">
            Listado de proyectos
          </h2>

          {/* Entrada a la izquierda; a la derecha, para quién se hicieron. */}
          {ajustes?.intro || clientes.length > 0 ? (
            <div className="mb-10 grid gap-6 lg:mb-12 lg:grid-cols-12 lg:items-center lg:gap-14">
              {ajustes?.intro ? (
                <EntradaSeccion className="lg:col-span-7 sm:!text-[1.1875rem]">
                  {ajustes.intro}
                </EntradaSeccion>
              ) : null}
              {clientes.length > 0 ? (
                <div
                  className={`rounded-tarjeta bg-blanco px-5 py-4 shadow-tarjeta ring-1 ring-separador ${
                    ajustes?.intro ? "lg:col-span-5" : "lg:col-span-12"
                  }`}
                >
                  <p className="text-[13px] font-medium text-acero-600">Clientes de estos casos</p>
                  {/* El campo trae «Nombre — sector»: el nombre se destaca y el
                      sector va al lado, más tenue. Sin guion, todo es nombre. */}
                  <ul className="mt-2 divide-y divide-separador">
                    {clientes.map((cliente) => {
                      const [nombre, ...resto] = cliente.split(/\s+[—–-]\s+/);
                      return (
                        <li key={cliente} className="flex flex-wrap items-baseline gap-x-2 py-2 text-[15px]">
                          <span className="font-semibold text-azul-900">{nombre}</span>
                          {resto.length > 0 ? (
                            <span className="text-[14px] text-acero-600">{resto.join(" — ")}</span>
                          ) : null}
                        </li>
                      );
                    })}
                  </ul>
                </div>
              ) : null}
            </div>
          ) : null}

          {proyectos.length > 0 ? (
            <ListadoDeProyectos proyectos={proyectos} />
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
