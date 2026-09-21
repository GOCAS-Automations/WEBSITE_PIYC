/**
 * HUB DE SERVICIOS — `/servicios`
 *
 * Los nueve servicios agrupados en cuatro líneas. La agrupación
 * (`lineasDeServicio`) es una **propuesta pendiente de validar con Jorge**: el
 * documento original de PIYC los lista planos, sin categorías.
 *
 * Un servicio que la base traiga y que no esté en ninguna línea igual aparece,
 * en un grupo final: nunca se pierde contenido por una agrupación desfasada.
 */

import type { Metadata } from "next";
import { getContacto, getPaginas, getSeo, getServicios } from "@/lib/content";
import { MENSAJES_WHATSAPP, enlaceWhatsAppDe } from "@/lib/contacto";
import {
  jsonLdFaq,
  jsonLdMigas,
  metadataDePagina,
  metadatosPagina,
  type Miga,
} from "@/lib/seo";
import { lineasDeServicio } from "@/data/servicios";
import { CabeceraInterna } from "@/components/sections/CabeceraInterna";
import { Faq } from "@/components/sections/Faq";
import { FranjaCta } from "@/components/sections/FranjaCta";
import { RejillaDeServicios, columnasParaCantidad } from "@/components/sections/tarjetas";
import { Contenedor, EntradaSeccion } from "@/components/sections/primitivas";
import { JsonLd } from "@/components/ui/JsonLd";

export const revalidate = 300;

const MIGAS: Miga[] = [
  { etiqueta: "Inicio", href: "/" },
  { etiqueta: "Servicios", href: "/servicios" },
];

export async function generateMetadata(): Promise<Metadata> {
  const seo = await getSeo();
  const { titulo, descripcion, imagen } = metadatosPagina(seo.paginas?.servicios, {
    titulo: "Servicios",
    descripcion:
      "Automatización con PLC, tableros de control y potencia, ingeniería eléctrica, telemetría, telecontrol, proyectos llave en mano, refrigeración y climatización.",
  });
  return metadataDePagina({ titulo, descripcion, ruta: "/servicios", imagen });
}

export default async function HubDeServicios() {
  const [servicios, paginas, contacto] = await Promise.all([
    getServicios(),
    getPaginas(),
    getContacto(),
  ]);

  const hrefWhatsApp = enlaceWhatsAppDe(contacto, MENSAJES_WHATSAPP.general);
  const ajustes = paginas.servicios;
  const faq = ajustes?.faq ?? [];

  // Agrupar sin perder ninguno: los que no están en ninguna línea van al final.
  const porSlug = new Map(servicios.map((servicio) => [servicio.slug, servicio]));
  const usados = new Set<string>();

  const grupos = lineasDeServicio
    .map((linea) => {
      const delGrupo = linea.slugs
        .map((slug) => {
          const servicio = porSlug.get(slug);
          if (servicio) usados.add(slug);
          return servicio;
        })
        .filter((servicio) => servicio !== undefined);
      return { linea, servicios: delGrupo };
    })
    .filter((grupo) => grupo.servicios.length > 0);

  const sueltos = servicios.filter((servicio) => !usados.has(servicio.slug));
  if (sueltos.length > 0) {
    grupos.push({
      linea: {
        id: "otros-servicios",
        titulo: "Otros servicios",
        resumen: "Servicios publicados desde el panel que aún no están agrupados en una línea.",
        slugs: sueltos.map((servicio) => servicio.slug),
      },
      servicios: sueltos,
    });
  }

  // La numeración es continua entre grupos (01…09). El desplazamiento de cada
  // grupo se calcula ANTES del render: mutar un contador dentro del `.map()`
  // del JSX no es fiable entre renders.
  const desplazamientos: number[] = [];
  grupos.reduce((acumulado, grupo) => {
    desplazamientos.push(acumulado);
    return acumulado + grupo.servicios.length;
  }, 0);

  return (
    <main id="contenido">
      <JsonLd datos={jsonLdMigas(MIGAS)} />
      <JsonLd datos={jsonLdFaq(faq)} />

      <CabeceraInterna
        ajustes={ajustes}
        rotulo="Portafolio"
        titulo="Servicios"
        migas={MIGAS}
      />

      <section aria-labelledby="titulo-lineas" className="bg-blanco">
        <Contenedor className="py-14 lg:py-18">
          <h2 id="titulo-lineas" className="sr-only">
            Líneas de servicio
          </h2>

          {ajustes?.intro ? (
            <EntradaSeccion className="mb-12 max-w-[72ch]">{ajustes.intro}</EntradaSeccion>
          ) : null}

          <div className="space-y-14 lg:space-y-16">
            {grupos.map(({ linea, servicios: delGrupo }, indiceGrupo) => {
              const desde = desplazamientos[indiceGrupo];

              return (
                <section
                  key={linea.id}
                  id={linea.id}
                  aria-labelledby={`${linea.id}-titulo`}
                  className="scroll-mt-28"
                >
                  <div className="flex flex-col gap-3 border-b-2 border-azul-700 pb-4 sm:flex-row sm:items-end sm:justify-between sm:gap-8">
                    <h3
                      id={`${linea.id}-titulo`}
                      className="font-titulo text-[1.75rem] font-semibold leading-tight text-azul-950 sm:text-[2rem]"
                    >
                      {linea.titulo}
                    </h3>
                    <p className="max-w-[46ch] text-[15px] leading-snug text-acero-600">
                      {linea.resumen}
                    </p>
                  </div>

                  <div className="mt-px border border-t-0 border-acero-200">
                    <RejillaDeServicios
                      servicios={delGrupo}
                      columnas={columnasParaCantidad(delGrupo.length)}
                      numerar
                      desde={desde}
                    />
                  </div>
                </section>
              );
            })}
          </div>
        </Contenedor>
      </section>

      <Faq preguntas={faq} />

      <FranjaCta
        titulo={ajustes?.cta?.title ?? "¿No está seguro de qué servicio necesita?"}
        texto={ajustes?.cta?.body}
        hrefWhatsApp={hrefWhatsApp}
      />
    </main>
  );
}
