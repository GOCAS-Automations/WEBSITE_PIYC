/**
 * INICIO — `/`
 *
 * Ritmo de la página: retícula (hero) → blanco (qué hacemos) → acero
 * (servicios) → blanco (casos) → retícula (proceso) → oscuro (valores) →
 * oscuro (CTA). Ningún fondo se repite dos veces seguidas salvo el cierre.
 */

import type { Metadata } from "next";
import Link from "next/link";
import {
  getContacto,
  getHome,
  getProyectos,
  getSeo,
  getServicios,
  getServiciosPorSlug,
  getValores,
  enParrafos,
} from "@/lib/content";
import { MENSAJES_WHATSAPP, enlaceWhatsAppDe } from "@/lib/contacto";
import { metadataDePagina, metadatosPagina } from "@/lib/seo";
import { lineasDeServicio } from "@/data/servicios";
import { HeroInicio } from "@/components/inicio/HeroInicio";
import { FranjaProceso } from "@/components/inicio/FranjaProceso";
import { FranjaCta } from "@/components/sections/FranjaCta";
import { Valores } from "@/components/sections/Valores";
import { RejillaDeProyectos, RejillaDeServicios } from "@/components/sections/tarjetas";
import {
  Contenedor,
  EnlaceConFlecha,
  EntradaSeccion,
  Parrafos,
  Rotulo,
  TituloSeccion,
} from "@/components/sections/primitivas";
import { FotoEnmarcada } from "@/components/ui/ContentImage";

export const revalidate = 300;

export async function generateMetadata(): Promise<Metadata> {
  const seo = await getSeo();
  const { titulo, descripcion, imagen } = metadatosPagina(seo.paginas?.inicio, {
    titulo: seo.defaultTitle ?? "PIYC",
    descripcion: seo.defaultDescription ?? "",
  });

  return {
    // El inicio no usa la plantilla «%s | PIYC»: su título ya está completo.
    ...metadataDePagina({ titulo, descripcion, ruta: "/", imagen }),
    title: { absolute: titulo },
  };
}

export default async function Inicio() {
  const [home, contacto, valores, todosLosServicios, proyectos] = await Promise.all([
    getHome(),
    getContacto(),
    getValores(),
    getServicios(),
    getProyectos(),
  ]);

  const hrefWhatsApp = enlaceWhatsAppDe(contacto, MENSAJES_WHATSAPP.general);

  // `undefined` = no configurado → se eligen los primeros. Lista vacía = el
  // panel decidió no mostrar la sección, y se respeta.
  const serviciosDestacados = home.serviciosDestacados
    ? await getServiciosPorSlug(home.serviciosDestacados)
    : todosLosServicios.slice(0, 4);

  const proyectosDestacados = home.proyectosDestacados
    ? home.proyectosDestacados
        .map((slug) => proyectos.find((proyecto) => proyecto.slug === slug))
        .filter((proyecto) => proyecto !== undefined)
    : proyectos.slice(0, 3);

  const intro = home.intro;

  return (
    <main id="contenido">
      <HeroInicio
        hero={home.hero}
        eslogan={contacto.tagline}
        lineas={lineasDeServicio}
        hrefWhatsApp={hrefWhatsApp}
      />

      {/* Qué hace PIYC */}
      {intro?.body ? (
        <section aria-labelledby="titulo-intro" className="bg-blanco">
          <Contenedor className="py-14 lg:py-18">
            <div className="grid gap-10 lg:grid-cols-12 lg:items-start lg:gap-12">
              <div className="lg:col-span-7">
                {intro.eyebrow ? <Rotulo>{intro.eyebrow}</Rotulo> : null}
                <TituloSeccion id="titulo-intro" className="mt-5">
                  {intro.title ?? "Qué hacemos"}
                </TituloSeccion>
                <Parrafos textos={enParrafos(intro.body)} className="mt-6" />
                <EnlaceConFlecha href="/nosotros" className="mt-7">
                  Conocer a PIYC
                </EnlaceConFlecha>
              </div>

              {intro.image ? (
                <div className="lg:col-span-5">
                  <FotoEnmarcada
                    src={intro.image.src}
                    alt={intro.image.alt}
                    width={intro.image.width}
                    height={intro.image.height}
                    proporcion="aspect-[4/3]"
                    className="mx-auto max-w-[min(100%,28rem)] lg:mx-0 lg:ml-auto"
                    pie={intro.image.alt}
                  />
                </div>
              ) : null}
            </div>
          </Contenedor>
        </section>
      ) : null}

      {/* Servicios destacados */}
      {serviciosDestacados.length > 0 ? (
        <section aria-labelledby="titulo-servicios" className="border-t border-acero-200 bg-acero-50">
          <Contenedor className="py-14 lg:py-18">
            <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
              <div className="max-w-2xl">
                <Rotulo>Portafolio</Rotulo>
                <TituloSeccion id="titulo-servicios" className="mt-5">
                  Servicios
                </TituloSeccion>
                <EntradaSeccion className="mt-5">
                  Nueve servicios para el ciclo completo: diseñar la instalación, armarla, ponerla
                  a producir y sostenerla después.
                </EntradaSeccion>
              </div>
              <EnlaceConFlecha href="/servicios" className="shrink-0">
                Ver los nueve servicios
              </EnlaceConFlecha>
            </div>

            <div className="mt-10 border border-acero-200">
              <RejillaDeServicios servicios={serviciosDestacados} columnas={4} numerar />
            </div>
          </Contenedor>
        </section>
      ) : null}

      {/* Casos de éxito */}
      {proyectosDestacados.length > 0 ? (
        <section aria-labelledby="titulo-casos" className="border-t border-acero-200 bg-blanco">
          <Contenedor className="py-14 lg:py-18">
            <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
              <div className="max-w-2xl">
                <Rotulo>Casos de éxito</Rotulo>
                <TituloSeccion id="titulo-casos" className="mt-5">
                  Proyectos entregados y funcionando
                </TituloSeccion>
                <EntradaSeccion className="mt-5">
                  Automatizaciones y sistemas de control ejecutados en plantas de producción del
                  Valle del Cauca.
                </EntradaSeccion>
              </div>
              <EnlaceConFlecha href="/proyectos" className="shrink-0">
                Ver todos los proyectos
              </EnlaceConFlecha>
            </div>

            <div className="mt-10">
              <RejillaDeProyectos proyectos={proyectosDestacados} columnas={3} />
            </div>
          </Contenedor>
        </section>
      ) : null}

      <FranjaProceso proceso={home.proceso} />

      <Valores
        valores={valores}
        rotulo="Lo que sostiene el trabajo"
        titulo="Nuestros valores"
        intro="Cuatro criterios que se notan en cómo se cotiza, cómo se ejecuta y qué se entrega al final del proyecto."
      />

      <FranjaCta
        titulo={home.cta?.title ?? "¿Hablamos de su proyecto?"}
        texto={home.cta?.body}
        hrefWhatsApp={hrefWhatsApp}
        etiquetaWhatsApp={home.cta?.ctaPrimario?.etiqueta ?? "Escríbanos por WhatsApp"}
        hrefSecundario={home.cta?.ctaSecundario?.href ?? "/contacto"}
        etiquetaSecundaria={home.cta?.ctaSecundario?.etiqueta ?? "Ir al formulario de contacto"}
      >
        <p className="mt-6 text-sm text-acero-300">
          También puede{" "}
          <Link href="/servicios" className="font-medium text-azul-300 underline-offset-2 hover:text-blanco hover:underline">
            revisar el portafolio de servicios
          </Link>{" "}
          antes de escribirnos.
        </p>
      </FranjaCta>
    </main>
  );
}
