/**
 * INICIO — `/`
 *
 * Sistema v3: el ritmo ya no lo hacen los fondos alternados sino las
 * superficies. Todo se apoya en el mismo lienzo gris-azulado y lo que cambia
 * es qué flota encima: tarjetas blancas (servicios, casos, proceso) y el panel
 * azul noche del cierre. Es el patrón «grouped» de iOS.
 *
 * Abre con el hero de fondo a sangre (imagen o video del panel) y cierra con
 * la franja de logos de clientes. Los valores ya no van aquí: viven solo en
 * `/nosotros` (reunión con PIYC, sep-2026).
 */

import type { Metadata } from "next";
import Link from "next/link";
import {
  fondoDelHero,
  franjaDeClientes,
  getContacto,
  getHome,
  getLineasDeServicio,
  getProyectos,
  getSeo,
  getServicios,
  getServiciosPorSlug,
  enParrafos,
} from "@/lib/content";
import { MENSAJES_WHATSAPP, enlaceWhatsAppDe } from "@/lib/contacto";
import { metadataDePagina, metadatosPagina } from "@/lib/seo";
import { HeroInicio } from "@/components/inicio/HeroInicio";
import { FranjaClientes } from "@/components/inicio/FranjaClientes";
import { FranjaProceso } from "@/components/inicio/FranjaProceso";
import { FranjaCta } from "@/components/sections/FranjaCta";
import { RejillaDeProyectos, RejillaDeServicios } from "@/components/sections/tarjetas";
import {
  Contenedor,
  EnlaceConFlecha,
  EntradaSeccion,
  Parrafos,
  Rotulo,
  TituloSeccion,
} from "@/components/sections/primitivas";
import { FotoDeColumna } from "@/components/ui/ContentImage";

export const revalidate = 300;

export async function generateMetadata(): Promise<Metadata> {
  const seo = await getSeo();
  const { titulo, descripcion, imagen } = metadatosPagina(seo.paginas?.inicio, {
    titulo: seo.defaultTitle ?? "PIYC",
    descripcion: seo.defaultDescription ?? "",
  }, seo.ogImage);

  return {
    // El inicio no usa la plantilla «%s | PIYC»: su título ya está completo.
    ...metadataDePagina({ titulo, descripcion, ruta: "/", imagen }),
    title: { absolute: titulo },
  };
}

export default async function Inicio() {
  const [home, contacto, todosLosServicios, proyectos, lineas] = await Promise.all([
    getHome(),
    getContacto(),
    getServicios(),
    getProyectos(),
    getLineasDeServicio(),
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
  // Rótulos, títulos e introducciones de las franjas: todos salen de
  // `site_settings.home`. Si el panel los deja vacíos, no se pintan, y el
  // título visible se reemplaza por uno solo para lectores de pantalla, para
  // que la sección no quede sin nombre.
  const seccionServicios = home.seccionServicios;
  const seccionProyectos = home.seccionProyectos;
  const notaCierre = home.cta?.nota;

  return (
    <main id="contenido">
      <HeroInicio
        hero={home.hero}
        fondo={fondoDelHero(home.hero)}
        eslogan={contacto.tagline}
        lineas={lineas}
        hrefWhatsApp={hrefWhatsApp}
      />

      {/* Qué hace PIYC — foto a la izquierda (el hero tiene su panel a la
          derecha: zigzag), estirada al alto de la columna de texto. */}
      {intro?.body ? (
        <section aria-labelledby="titulo-intro" className="bg-lienzo-alto">
          <Contenedor className="py-16 lg:py-20">
            <div className="grid gap-10 lg:grid-cols-12 lg:gap-14">
              <div className="flex flex-col items-start lg:col-span-7">
                {intro.eyebrow ? <Rotulo>{intro.eyebrow}</Rotulo> : null}
                <TituloSeccion id="titulo-intro" className={intro.eyebrow ? "mt-5" : ""}>
                  {intro.title ?? "Qué hacemos"}
                </TituloSeccion>
                <Parrafos textos={enParrafos(intro.body)} className="mt-6" />
                {intro.ctaEtiqueta !== "" ? (
                  <EnlaceConFlecha href="/nosotros" className="mt-7">
                    {intro.ctaEtiqueta ?? "Conocer a PIYC"}
                  </EnlaceConFlecha>
                ) : null}
              </div>

              {intro.image?.src ? (
                <FotoDeColumna
                  imagen={intro.image}
                  className="lg:order-first lg:col-span-5"
                />
              ) : null}
            </div>
          </Contenedor>
        </section>
      ) : null}

      {/* Servicios destacados */}
      {serviciosDestacados.length > 0 ? (
        <section aria-labelledby="titulo-servicios" className="bg-lienzo">
          <Contenedor className="py-16 lg:py-20">
            <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
              <div className="max-w-2xl">
                {seccionServicios?.eyebrow ? <Rotulo>{seccionServicios.eyebrow}</Rotulo> : null}
                {seccionServicios?.title ? (
                  <TituloSeccion id="titulo-servicios" className="mt-5">
                    {seccionServicios.title}
                  </TituloSeccion>
                ) : (
                  <h2 id="titulo-servicios" className="sr-only">
                    Servicios destacados
                  </h2>
                )}
                {seccionServicios?.intro ? (
                  <EntradaSeccion className="mt-5">{seccionServicios.intro}</EntradaSeccion>
                ) : null}
              </div>
              {seccionServicios?.ctaEtiqueta !== "" ? (
                <EnlaceConFlecha href="/servicios" className="shrink-0">
                  {seccionServicios?.ctaEtiqueta ?? "Ver los nueve servicios"}
                </EnlaceConFlecha>
              ) : null}
            </div>

            <div className="mt-10">
              <RejillaDeServicios servicios={serviciosDestacados} columnas={4} numerar />
            </div>
          </Contenedor>
        </section>
      ) : null}

      {/* Casos de éxito */}
      {proyectosDestacados.length > 0 ? (
        <section aria-labelledby="titulo-casos" className="bg-lienzo-alto">
          <Contenedor className="py-16 lg:py-20">
            <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
              <div className="max-w-2xl">
                {seccionProyectos?.eyebrow ? <Rotulo>{seccionProyectos.eyebrow}</Rotulo> : null}
                {seccionProyectos?.title ? (
                  <TituloSeccion id="titulo-casos" className="mt-5">
                    {seccionProyectos.title}
                  </TituloSeccion>
                ) : (
                  <h2 id="titulo-casos" className="sr-only">
                    Casos de éxito
                  </h2>
                )}
                {seccionProyectos?.intro ? (
                  <EntradaSeccion className="mt-5">{seccionProyectos.intro}</EntradaSeccion>
                ) : null}
              </div>
              {seccionProyectos?.ctaEtiqueta !== "" ? (
                <EnlaceConFlecha href="/proyectos" className="shrink-0">
                  {seccionProyectos?.ctaEtiqueta ?? "Ver todos los proyectos"}
                </EnlaceConFlecha>
              ) : null}
            </div>

            <div className="mt-10">
              <RejillaDeProyectos proyectos={proyectosDestacados} columnas={3} />
            </div>
          </Contenedor>
        </section>
      ) : null}

      <FranjaProceso proceso={home.proceso} />

      {/* Prueba social: los logos de los clientes, cada uno hacia su caso de
          éxito. Los valores salieron de la portada (reunión con PIYC,
          sep-2026): se quedan solo en `/nosotros`. */}
      <FranjaClientes
        clientes={franjaDeClientes(home)}
        slugsPublicados={new Set(proyectos.map((proyecto) => proyecto.slug))}
      />

      <FranjaCta
        titulo={home.cta?.title ?? "¿Hablamos de su proyecto?"}
        texto={home.cta?.body}
        hrefWhatsApp={hrefWhatsApp}
        etiquetaWhatsApp={home.cta?.ctaPrimario?.etiqueta ?? "Escríbanos por WhatsApp"}
        hrefSecundario={home.cta?.ctaSecundario?.href ?? "/contacto"}
        etiquetaSecundaria={home.cta?.ctaSecundario?.etiqueta ?? "Ir al formulario de contacto"}
      >
        {/* Nota del cierre: se edita en tres piezas (texto · enlace · texto)
            para que el panel no tenga que escribir HTML. */}
        {notaCierre?.texto || notaCierre?.enlace?.etiqueta || notaCierre?.textoFinal ? (
          <p className="mt-6 text-sm text-acero-200">
            {notaCierre.texto ? `${notaCierre.texto} ` : null}
            {notaCierre.enlace?.etiqueta ? (
              <Link
                href={notaCierre.enlace.href || "/servicios"}
                className="font-medium text-blanco underline underline-offset-2 decoration-acero-400 hover:decoration-blanco"
              >
                {notaCierre.enlace.etiqueta}
              </Link>
            ) : null}
            {notaCierre.textoFinal ? ` ${notaCierre.textoFinal}` : null}
          </p>
        ) : null}
      </FranjaCta>
    </main>
  );
}
