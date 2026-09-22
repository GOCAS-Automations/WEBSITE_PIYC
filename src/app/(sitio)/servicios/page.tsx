/**
 * HUB DE SERVICIOS — `/servicios`
 *
 * Los nueve servicios agrupados en cuatro líneas. La agrupación
 * (`lineasDeServicio`) es una **propuesta pendiente de validar con Jorge**: el
 * documento original de PIYC los lista planos, sin categorías. El nombre de
 * cada línea se edita en el panel (Inicio → líneas de servicio).
 *
 * Un servicio que la base traiga y que no esté en ninguna línea igual aparece,
 * en un grupo final: nunca se pierde contenido por una agrupación desfasada.
 *
 * COMPOSICIÓN (sep-2026)
 * ----------------------
 * Cesar: «el contenido está bien pero la página se ve muy pobre solo con
 * cuadros y texto». Ahora:
 *  1. Cabecera con foto de fondo.
 *  2. Entrada + índice de las cuatro líneas (anclas).
 *  3. Cada línea como sección propia: foto grande que alterna de lado
 *     (zigzag) y fondos alternos, y sus servicios en filas con miniatura.
 *  4. Banda oscura del proceso de trabajo (los mismos pasos del inicio).
 *  5. Casos de éxito, preguntas frecuentes y cierre.
 * Nada de cifras ni datos nuevos: todo sale del contenido que ya existe.
 */

import type { Metadata } from "next";
import type { ImagenContenido, LineaServicio, Servicio } from "@/lib/content-types";
import {
  galeriaCompleta,
  getContacto,
  getHome,
  getLineasDeServicio,
  getPaginas,
  getProyectos,
  getSeo,
  getServicios,
  primeraFotoDe,
} from "@/lib/content";
import { MENSAJES_WHATSAPP, enlaceWhatsAppDe } from "@/lib/contacto";
import {
  jsonLdFaq,
  jsonLdListado,
  jsonLdMigas,
  metadataDePagina,
  metadatosPagina,
  type Miga,
} from "@/lib/seo";
import { FranjaProceso } from "@/components/inicio/FranjaProceso";
import { CabeceraInterna } from "@/components/sections/CabeceraInterna";
import { Faq } from "@/components/sections/Faq";
import { FranjaCta } from "@/components/sections/FranjaCta";
import { RejillaDeFilasDeServicio, RejillaDeProyectos } from "@/components/sections/tarjetas";
import {
  Contenedor,
  EnlaceConFlecha,
  EntradaSeccion,
  Rotulo,
  TituloSeccion,
} from "@/components/sections/primitivas";
import { FotoDeColumna } from "@/components/ui/ContentImage";
import { IconoServicio } from "@/components/ui/iconos-servicio";
import { JsonLd } from "@/components/ui/JsonLd";
import { MarcadorDeMarca } from "@/components/ui/MarcadorDeMarca";

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
  }, seo.ogImage);
  return metadataDePagina({ titulo, descripcion, ruta: "/servicios", imagen });
}

/**
 * Foto grande de una línea. Se prefiere una que NO sea la miniatura de ningún
 * servicio de la línea (la segunda de alguna galería), para no ver la misma
 * foto en grande y en pequeño a la vez; si no hay, la primera de la línea.
 */
function fotoDeLinea(servicios: readonly Servicio[]): ImagenContenido | null {
  const miniaturas = new Set(
    servicios.map((servicio) => primeraFotoDe(servicio.images)?.src).filter(Boolean),
  );
  for (const servicio of servicios) {
    const otra = galeriaCompleta(servicio.images).find(
      (foto) => !miniaturas.has(foto.src) && foto.alt,
    );
    if (otra) return otra;
  }
  for (const servicio of servicios) {
    const primera = primeraFotoDe(servicio.images);
    if (primera?.alt) return primera;
  }
  return null;
}

/**
 * Sustituto de la foto cuando ningún servicio de la línea tiene fotos: la
 * superficie de marca de `MarcadorDeMarca`, pero con los iconos de los
 * servicios de la línea en vez del logo — dicen más de qué va la línea, y el
 * logo ya está en el nav y en el pie de la misma pantalla.
 */
function PanelDeLinea({ servicios, className = "" }: { servicios: readonly Servicio[]; className?: string }) {
  return (
    <MarcadorDeMarca
      proporcion="aspect-[16/10] lg:aspect-auto lg:h-full lg:min-h-[24rem]"
      className={className}
      marca={
        <span className="flex items-center justify-center gap-6">
          {servicios.slice(0, 3).map((servicio) => (
            <IconoServicio
              key={servicio.slug}
              clave={servicio.iconKey}
              className="size-16 text-azul-300 sm:size-20"
              strokeWidth={1.2}
            />
          ))}
        </span>
      }
    />
  );
}

export default async function HubDeServicios() {
  const [servicios, paginas, contacto, lineas, home, proyectos] = await Promise.all([
    getServicios(),
    getPaginas(),
    getContacto(),
    getLineasDeServicio(),
    getHome(),
    getProyectos(),
  ]);

  const hrefWhatsApp = enlaceWhatsAppDe(contacto, MENSAJES_WHATSAPP.general);
  const ajustes = paginas.servicios;
  const faq = ajustes?.faq ?? [];

  // Agrupar sin perder ninguno: los que no están en ninguna línea van al final.
  const porSlug = new Map(servicios.map((servicio) => [servicio.slug, servicio]));
  const usados = new Set<string>();

  const grupos: { linea: LineaServicio; servicios: Servicio[] }[] = lineas
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

  // Casos de la franja: los destacados del inicio (o los tres primeros). Los
  // textos del encabezado son los mismos de la franja de casos del inicio.
  const casos = home.proyectosDestacados
    ? home.proyectosDestacados
        .map((slug) => proyectos.find((proyecto) => proyecto.slug === slug))
        .filter((proyecto) => proyecto !== undefined)
        .slice(0, 3)
    : proyectos.slice(0, 3);
  const seccionCasos = home.seccionProyectos;

  return (
    <main id="contenido">
      <JsonLd datos={jsonLdMigas(MIGAS)} />
      <JsonLd datos={jsonLdFaq(faq)} />
      <JsonLd
        datos={jsonLdListado({
          nombre: ajustes?.title || "Servicios de PIYC en Cali",
          descripcion:
            ajustes?.intro ||
            ajustes?.subtitle ||
            "Los servicios de automatización e ingeniería eléctrica industrial de PIYC.",
          ruta: "/servicios",
          elementos: servicios.map((servicio) => ({
            nombre: servicio.title,
            ruta: `/servicios/${servicio.slug}`,
          })),
        })}
      />

      <CabeceraInterna
        ajustes={ajustes}
        rotulo="Portafolio"
        titulo="Servicios"
        migas={MIGAS}
      />

      {/* Entrada + índice de líneas. Dos columnas centradas en vertical: el
          párrafo a la izquierda y las cuatro anclas a la derecha. */}
      <div className="bg-lienzo">
        <Contenedor className="py-12 lg:py-16">
          <div className="grid gap-8 lg:grid-cols-12 lg:items-center lg:gap-14">
            {ajustes?.intro ? (
              <EntradaSeccion className="lg:col-span-6 sm:!text-[1.1875rem]">
                {ajustes.intro}
              </EntradaSeccion>
            ) : null}
            <nav
              aria-label="Líneas de servicio"
              className={ajustes?.intro ? "lg:col-span-6" : "lg:col-span-12"}
            >
              <ol className="grid gap-px overflow-hidden rounded-tarjeta bg-separador shadow-tarjeta ring-1 ring-separador sm:grid-cols-2">
                {grupos.map(({ linea, servicios: delGrupo }, indice) => (
                  <li
                    key={linea.id}
                    className={
                      grupos.length % 2 === 1 && indice === grupos.length - 1
                        ? "sm:col-span-2"
                        : ""
                    }
                  >
                    <a
                      href={`#${linea.id}`}
                      className="group flex h-full items-center gap-3.5 bg-blanco px-5 py-4 transition-colors duration-300 ease-ios hover:bg-lienzo-alto"
                    >
                      <span className="inline-flex size-9 shrink-0 items-center justify-center rounded-capsula bg-relleno text-[13px] font-semibold tabular-nums text-azul-700 transition-colors duration-300 ease-ios group-hover:bg-azul-700 group-hover:text-blanco">
                        {String(indice + 1).padStart(2, "0")}
                      </span>
                      <span className="min-w-0">
                        <span className="block text-[15px] font-semibold leading-snug text-azul-950">
                          {linea.titulo}
                        </span>
                        <span className="mt-0.5 block text-[13px] text-acero-600">
                          {delGrupo.length === 1 ? "1 servicio" : `${delGrupo.length} servicios`}
                        </span>
                      </span>
                    </a>
                  </li>
                ))}
              </ol>
            </nav>
          </div>
        </Contenedor>
      </div>

      {/* Una sección por línea: foto que alterna de lado y fondo alterno. */}
      {grupos.map(({ linea, servicios: delGrupo }, indice) => {
        const foto = fotoDeLinea(delGrupo);
        const fotoALaIzquierda = indice % 2 === 0;
        const numero = String(indice + 1).padStart(2, "0");

        return (
          <section
            key={linea.id}
            id={linea.id}
            aria-labelledby={`${linea.id}-titulo`}
            className={`scroll-mt-[calc(var(--alto-nav)+1rem)] ${
              indice % 2 === 0 ? "bg-blanco" : "bg-lienzo"
            }`}
          >
            <Contenedor className="py-16 lg:py-20">
              <div className="grid gap-8 lg:grid-cols-12 lg:gap-14">
                <div className="flex flex-col lg:col-span-7">
                  <Rotulo className="self-start">Línea {numero}</Rotulo>
                  <TituloSeccion id={`${linea.id}-titulo`} className="mt-5">
                    {linea.titulo}
                  </TituloSeccion>
                  {linea.resumen ? (
                    <EntradaSeccion className="mt-4">{linea.resumen}</EntradaSeccion>
                  ) : null}
                  <div className="mt-8">
                    <RejillaDeFilasDeServicio
                      servicios={delGrupo}
                      numerarDesde={desplazamientos[indice]}
                      evitarFoto={foto?.src}
                    />
                  </div>
                </div>

                {foto ? (
                  <FotoDeColumna
                    imagen={foto}
                    className={`lg:col-span-5 ${fotoALaIzquierda ? "lg:order-first" : ""}`}
                    altoMinimo="lg:min-h-[24rem]"
                  />
                ) : (
                  <PanelDeLinea
                    servicios={delGrupo}
                    className={`lg:col-span-5 ${fotoALaIzquierda ? "lg:order-first" : ""}`}
                  />
                )}
              </div>
            </Contenedor>
          </section>
        );
      })}

      {/* Banda oscura: el proceso de trabajo, los mismos pasos del inicio. */}
      <FranjaProceso proceso={home.proceso} tono="oscuro" id="titulo-proceso-servicios" />

      {/* Casos de éxito */}
      {casos.length > 0 ? (
        <section aria-labelledby="titulo-casos-servicios" className="bg-blanco">
          <Contenedor className="py-16 lg:py-20">
            <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
              <div className="max-w-2xl">
                {seccionCasos?.eyebrow !== "" ? (
                  <Rotulo>{seccionCasos?.eyebrow ?? "Casos de éxito"}</Rotulo>
                ) : null}
                <TituloSeccion
                  id="titulo-casos-servicios"
                  className={seccionCasos?.eyebrow !== "" ? "mt-5" : ""}
                >
                  {seccionCasos?.title || "Proyectos entregados y funcionando"}
                </TituloSeccion>
                {seccionCasos?.intro ? (
                  <EntradaSeccion className="mt-5">{seccionCasos.intro}</EntradaSeccion>
                ) : null}
              </div>
              {seccionCasos?.ctaEtiqueta !== "" ? (
                <EnlaceConFlecha href="/proyectos" className="shrink-0">
                  {seccionCasos?.ctaEtiqueta ?? "Ver todos los proyectos"}
                </EnlaceConFlecha>
              ) : null}
            </div>
            <div className="mt-10">
              <RejillaDeProyectos proyectos={casos} columnas={casos.length === 2 ? 2 : 3} />
            </div>
          </Contenedor>
        </section>
      ) : null}

      <Faq preguntas={faq} />

      <FranjaCta
        titulo={ajustes?.cta?.title ?? "¿No está seguro de qué servicio necesita?"}
        texto={ajustes?.cta?.body}
        hrefWhatsApp={hrefWhatsApp}
      />
    </main>
  );
}
