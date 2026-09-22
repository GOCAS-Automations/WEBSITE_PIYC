/**
 * DETALLE DE SERVICIO — `/servicios/[slug]`
 *
 * En Next 16 `params` es una Promise: hay que esperarla antes de leer `slug`.
 *
 * `generateStaticParams` prerrenderiza los nueve servicios en el build. Un
 * slug que no exista cae en `notFound()`.
 *
 * COMPOSICIÓN (sep-2026)
 * ----------------------
 *  - Cabecera con la primera foto del servicio de fondo; sin fotos (hoy, aires
 *    acondicionados), degradado de marca con el icono del servicio. Los datos
 *    de la ficha (línea, zona, casos) van en cápsulas bajo la bajada: la
 *    tarjeta «Resumen» de la derecha dejaba un hueco debajo.
 *  - «En qué consiste» + «Qué incluye» en dos columnas del mismo alto. Con una
 *    sola foto, la foto ocupa la columna derecha y los alcances van debajo.
 *  - Galería (dos fotos o más), casos, otros servicios de la misma línea
 *    primero, anterior/siguiente y cierre, con fondos alternos.
 */

import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  enParrafos,
  galeriaCompleta,
  getContacto,
  getLineasDeServicio,
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
import { CabeceraInterna } from "@/components/sections/CabeceraInterna";
import { FranjaCta } from "@/components/sections/FranjaCta";
import { Galeria } from "@/components/sections/Galeria";
import {
  RejillaDeFilasDeServicio,
  RejillaDeProyectos,
  TarjetaProyecto,
} from "@/components/sections/tarjetas";
import {
  BotonWhatsApp,
  Contenedor,
  ListaDeAlcances,
  NavegacionEntreFichas,
  Parrafos,
  Rotulo,
  TituloSeccion,
} from "@/components/sections/primitivas";
import { FotoDeColumna } from "@/components/ui/ContentImage";
import { IconoServicio } from "@/components/ui/iconos-servicio";
import { JsonLd } from "@/components/ui/JsonLd";
import { MarcadorDeMarca } from "@/components/ui/MarcadorDeMarca";

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

/** Lista de verificación de «Qué incluye», dentro de su tarjeta. */
function ListaIncluye({ items }: { items: readonly string[] }) {
  return (
    <ul className="mt-4 divide-y divide-separador">
      {items.map((item) => (
        <li key={item} className="flex items-start gap-3 py-2.5 text-[15px] leading-snug text-azul-900">
          <span
            aria-hidden="true"
            className="mt-0.5 inline-flex size-5 shrink-0 items-center justify-center rounded-capsula bg-verde-100 text-verde-700"
          >
            <svg viewBox="0 0 16 16" fill="none" className="size-3">
              <path
                d="M3.5 8.5l3 3 6-7"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </span>
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

export default async function PaginaDeServicio({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const servicio = await getServicio(slug);
  if (!servicio) notFound();

  const [contacto, todos, relacionados, paginas, lineas] = await Promise.all([
    getContacto(),
    getServicios(),
    getProyectosDeServicio(slug),
    getPaginas(),
    getLineasDeServicio(),
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
  // Foto de la cabecera: la primera con texto alternativo.
  const fotoCabecera = galeria.find((foto) => foto.alt) ?? null;
  // Cada foto se ve una sola vez en la ficha: la de la cabecera no se repite
  // junto al texto ni en la galería. Si queda UNA, va junto al texto (y «Qué
  // incluye» baja); si quedan dos o más, van a la galería.
  const resto = galeria.filter((foto) => foto !== fotoCabecera);
  const fotoLateral = resto.length === 1 && resto[0].alt ? resto[0] : null;
  const galeriaInferior = resto.length > 1 ? resto : [];
  const parrafos = enParrafos(servicio.description);
  // Línea a la que pertenece el servicio (agrupación del código, nombre del panel).
  const linea = lineas.find((candidata) => candidata.slugs.includes(servicio.slug));
  // Otros servicios: primero los de la misma línea, luego el resto; tres.
  const otrosDeLaLinea = todos.filter(
    (otro) => otro.slug !== servicio.slug && linea?.slugs.includes(otro.slug),
  );
  const otros = [
    ...otrosDeLaLinea,
    ...todos.filter((otro) => otro.slug !== servicio.slug && !otrosDeLaLinea.includes(otro)),
  ].slice(0, 3);
  // Títulos de las secciones de la plantilla, editables en «Textos de las
  // páginas». Se usa `||` y no `??`: un título vacío dejaría la sección sin
  // nombre accesible, así que ahí vuelve el de fábrica.
  const plantilla = paginas.servicioDetalle;
  const tituloIncluye = plantilla?.tituloIncluye || "Qué incluye";
  // Anterior y siguiente dentro del listado: la ficha deja de ser un callejón
  // sin salida y el rastreador llega a las nueve desde cualquiera.
  const indiceActual = todos.findIndex((otro) => otro.slug === servicio.slug);
  const anterior = indiceActual > 0 ? todos[indiceActual - 1] : null;
  const siguiente =
    indiceActual >= 0 && indiceActual < todos.length - 1 ? todos[indiceActual + 1] : null;

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
        imagen={fotoCabecera}
        marca={
          <IconoServicio clave={servicio.iconKey} className="size-64 lg:size-80" strokeWidth={0.9} />
        }
        datos={[
          {
            etiqueta: "Línea",
            valor: linea?.titulo,
            href: linea ? `/servicios#${linea.id}` : undefined,
          },
          { etiqueta: "Zona", valor: "Cali y Valle del Cauca" },
          {
            etiqueta: "Casos publicados",
            valor: relacionados.length ? String(relacionados.length) : null,
          },
        ]}
      />

      {/* En qué consiste + qué incluye (o la foto, si solo hay una) */}
      <section aria-labelledby="titulo-alcance" className="bg-lienzo">
        <Contenedor className="py-16 lg:py-20">
          <div className="grid gap-10 lg:grid-cols-12 lg:gap-14">
            <div className="flex flex-col items-start lg:col-span-7">
              <Rotulo>En qué consiste</Rotulo>
              {/* El h2 no puede repetir el h1: en cuatro servicios `title` y
                  `navTitle` son la misma cadena («Telemetría» / «Telemetría»). */}
              <TituloSeccion id="titulo-alcance" className="mt-5">
                {plantilla?.tituloAlcance || "Alcance y forma de trabajo"}
              </TituloSeccion>
              <Parrafos textos={parrafos} className="mt-6" />
            </div>

            {fotoLateral ? (
              <FotoDeColumna imagen={fotoLateral} className="lg:col-span-5" />
            ) : galeria.length === 0 ? (
              // El servicio no tiene NINGUNA foto (hoy, aires acondicionados:
              // el material del cliente no trae ninguna). En vez de dejar la
              // página entera sin una sola imagen, la columna lleva el marcador
              // de marca y los alcances bajan al bloque de abajo. Se ve que es
              // provisional y PIYC sabe que ahí va una foto, desde el panel.
              <MarcadorDeMarca className="lg:col-span-5" />
            ) : servicio.items.length > 0 ? (
              // Mismo alto que la columna de texto; el botón se sienta abajo
              // (`mt-auto`), alineado con el último párrafo.
              <aside
                aria-labelledby="titulo-incluye"
                className="flex flex-col rounded-panel bg-blanco p-6 shadow-tarjeta ring-1 ring-separador lg:col-span-5 lg:p-8"
              >
                <h3
                  id="titulo-incluye"
                  className="text-[1.375rem] font-semibold leading-tight text-azul-950"
                >
                  {tituloIncluye}
                </h3>
                <ListaIncluye items={servicio.items} />
                <div className="mt-auto pt-6">
                  <BotonWhatsApp href={hrefWhatsApp} className="w-full">
                    Consultar por WhatsApp
                  </BotonWhatsApp>
                </div>
              </aside>
            ) : (
              // Sin foto y sin alcances, las cinco columnas de la derecha
              // quedaban vacías al lado del texto. Va el marcador de marca:
              // llena la columna y le dice a PIYC que ahí falta una foto.
              <MarcadorDeMarca className="lg:col-span-5" />
            )}
          </div>

          {(fotoLateral || galeria.length === 0) && servicio.items.length > 0 ? (
            <div className="mt-12">
              <h3 className="text-[1.375rem] font-semibold leading-tight text-azul-950">
                {tituloIncluye}
              </h3>
              <ListaDeAlcances items={servicio.items} className="mt-5" />
            </div>
          ) : null}
        </Contenedor>
      </section>

      {/* Galería: las fotos que no están ni en la cabecera ni junto al texto. */}
      {galeriaInferior.length > 0 ? (
        <section aria-labelledby="titulo-galeria-servicio" className="bg-blanco">
          <Contenedor className="py-16 lg:py-20">
            <Rotulo>Del trabajo</Rotulo>
            <TituloSeccion id="titulo-galeria-servicio" className="mt-5">
              {plantilla?.tituloGaleria || "Galería"}
            </TituloSeccion>
            <Galeria
              imagenes={galeriaInferior}
              titulo={servicio.navTitle}
              columnas={galeriaInferior.length % 3 === 0 ? 3 : 2}
              className="mt-8"
            />
          </Contenedor>
        </section>
      ) : null}

      {/* Proyectos relacionados */}
      {relacionados.length > 0 ? (
        <section
          aria-labelledby="titulo-relacionados"
          className={galeriaInferior.length > 0 ? "bg-lienzo" : "bg-blanco"}
        >
          <Contenedor className="py-16 lg:py-20">
            <Rotulo>Casos de éxito</Rotulo>
            <TituloSeccion id="titulo-relacionados" className="mt-5">
              {plantilla?.tituloCasos || "Proyectos con este servicio"}
            </TituloSeccion>
            <div className="mt-8">
              {/* Un caso solo va en horizontal, a todo el ancho: en una rejilla
                  de tres quedaba una tarjeta sola y dos huecos. */}
              {relacionados.length === 1 ? (
                <TarjetaProyecto proyecto={relacionados[0]} variante="horizontal" />
              ) : (
                <RejillaDeProyectos
                  proyectos={relacionados}
                  columnas={relacionados.length % 3 === 0 ? 3 : 2}
                />
              )}
            </div>
          </Contenedor>
        </section>
      ) : null}

      {/* Otros servicios: primero los de la misma línea. */}
      {otros.length > 0 ? (
        <section aria-labelledby="titulo-otros" className="bg-lienzo-alto">
          <Contenedor className="py-16 lg:py-20">
            <TituloSeccion id="titulo-otros">
              {plantilla?.tituloOtros || "Otros servicios"}
            </TituloSeccion>
            <div className="mt-8">
              <RejillaDeFilasDeServicio servicios={otros} columnas={otros.length === 3 ? 3 : 2} />
            </div>
          </Contenedor>
        </section>
      ) : null}

      {/* Anterior / siguiente entre servicios */}
      <NavegacionEntreFichas
        anterior={anterior}
        siguiente={siguiente}
        etiqueta="Navegación entre servicios"
        base="/servicios"
        etiquetaListado="Todos los servicios"
      />

      <FranjaCta
        titulo={`¿Necesita ${servicio.navTitle.toLowerCase()}?`}
        texto={
          plantilla?.ctaTexto ??
          "Escríbanos con los datos del equipo o del proceso y le decimos qué información hace falta para cotizar."
        }
        hrefWhatsApp={hrefWhatsApp}
        etiquetaWhatsApp="Consultar por WhatsApp"
      />
    </main>
  );
}
