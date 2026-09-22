/**
 * NOSOTROS — `/nosotros`
 *
 * Cabecera con foto · Quiénes somos · Misión y visión · Valores · Galería.
 *
 * COMPOSICIÓN (sep-2026)
 * ----------------------
 * Cesar: «se ve muy cuadriculado o escolar que la sección de arriba y la de
 * abajo sean texto a la izquierda, imagen a la derecha; démosle más vida». Las
 * secciones alternan composición y fondo:
 *  - Quiénes somos: foto a la IZQUIERDA, estirada al alto del texto (lienzo).
 *  - Misión y visión: tríptico tarjeta · foto · tarjeta oscura (blanco).
 *  - Valores: panel azul noche con encabezado partido y los cuatro en fila.
 *  - Galería: carrusel con el encabezado partido (lienzo).
 *
 * ⚠ Misión y visión quedaron intercambiadas respecto al documento original de
 * PIYC por decisión de Cesar (ver `AjustesNosotros` en `content-types.ts`). El
 * sitio pinta cada bloque con el rótulo que trae del panel.
 */

import type { Metadata } from "next";
import type { ImagenContenido } from "@/lib/content-types";
import {
  enParrafos,
  getContacto,
  getNosotros,
  getSeo,
  getValores,
} from "@/lib/content";
import { MENSAJES_WHATSAPP, enlaceWhatsAppDe } from "@/lib/contacto";
import { jsonLdMigas, metadataDePagina, metadatosPagina, type Miga } from "@/lib/seo";
import { CabeceraInterna } from "@/components/sections/CabeceraInterna";
import { FranjaCta } from "@/components/sections/FranjaCta";
import { Galeria } from "@/components/sections/Galeria";
import { Valores } from "@/components/sections/Valores";
import {
  Contenedor,
  EntradaSeccion,
  Parrafos,
  Rotulo,
  TituloSeccion,
} from "@/components/sections/primitivas";
import { ContentImage } from "@/components/ui/ContentImage";
import { JsonLd } from "@/components/ui/JsonLd";

export const revalidate = 300;

const MIGAS: Miga[] = [
  { etiqueta: "Inicio", href: "/" },
  { etiqueta: "Nosotros", href: "/nosotros" },
];

export async function generateMetadata(): Promise<Metadata> {
  const seo = await getSeo();
  const { titulo, descripcion, imagen } = metadatosPagina(seo.paginas?.nosotros, {
    titulo: "Quiénes somos",
    descripcion:
      "PIYC — Programación Industrial y Control S.A.S.: ingenieros dedicados a proyectos de ingeniería, montaje y mantenimiento de equipos eléctricos y electrónicos.",
  }, seo.ogImage);
  return metadataDePagina({ titulo, descripcion, ruta: "/nosotros", imagen });
}

/** Una imagen utilizable: con `src` y con `alt` (sin `alt` no entra al sitio). */
function imagenValida(imagen: ImagenContenido | null | undefined): ImagenContenido | null {
  return imagen?.src && imagen.alt ? imagen : null;
}

export default async function Nosotros() {
  const [nosotros, valores, contacto] = await Promise.all([
    getNosotros(),
    getValores(),
    getContacto(),
  ]);

  const hrefWhatsApp = enlaceWhatsAppDe(contacto, MENSAJES_WHATSAPP.general);
  const quienesSomos = nosotros.quienesSomos;
  const fotoQuienes = imagenValida(quienesSomos?.image);
  const galeria = nosotros.galeria ?? [];
  const bloqueGaleria = nosotros.bloqueGaleria;

  // Foto del tríptico de misión y visión: la del panel o, si no hay, una de la
  // galería que no esté ya en la cabecera ni en «Quiénes somos» (repetir la
  // misma foto dos pantallas seguidas se nota). Se busca desde el FINAL: las
  // primeras son las que el carrusel muestra al abrir.
  const usadas = new Set([nosotros.hero?.image?.src, fotoQuienes?.src].filter(Boolean));
  const fotoMisionVision =
    imagenValida(nosotros.imagenMisionVision) ??
    [...galeria].reverse().find((foto) => !usadas.has(foto.src) && foto.alt) ??
    null;
  // Segunda foto de «Quiénes somos» (el par escalonado de la izquierda): la
  // primera de la galería que no esté usada ya en la página.
  const fotoDuo =
    galeria.find(
      (foto) => foto.alt && !usadas.has(foto.src) && foto.src !== fotoMisionVision?.src,
    ) ?? null;
  // El carrusel no repite las fotos que ya se ven arriba, si le quedan
  // suficientes (tres o más); si no, las muestra todas.
  const yaVistas = new Set([fotoDuo?.src, fotoMisionVision?.src].filter(Boolean));
  const restantes = galeria.filter((foto) => !yaVistas.has(foto.src));
  const galeriaCarrusel = restantes.length >= 3 ? restantes : galeria;
  const bloquesMisionVision = [
    { bloque: nosotros.mision, oscuro: false },
    { bloque: nosotros.vision, oscuro: true },
  ].filter(({ bloque }) => Boolean(bloque?.body));

  return (
    <main id="contenido">
      <JsonLd datos={jsonLdMigas(MIGAS)} />

      <CabeceraInterna
        ajustes={nosotros.hero}
        rotulo="Quiénes somos"
        titulo="Sobre PIYC"
        migas={MIGAS}
      />

      {/* Quiénes somos — foto a la izquierda, alineada arriba con el rótulo y
          abajo con la ficha de razón social. */}
      {quienesSomos?.body ? (
        <section aria-labelledby="titulo-quienes-somos" className="bg-lienzo">
          <Contenedor className="py-16 lg:py-24">
            <div className="grid gap-10 lg:grid-cols-12 lg:gap-14">
              <div
                className={`flex flex-col items-start ${
                  fotoQuienes ? "lg:col-span-7" : "max-w-3xl lg:col-span-12"
                }`}
              >
                {quienesSomos.eyebrow !== "" ? (
                  <Rotulo>{quienesSomos.eyebrow ?? "La empresa"}</Rotulo>
                ) : null}
                <TituloSeccion
                  id="titulo-quienes-somos"
                  className={quienesSomos.eyebrow !== "" ? "mt-5" : ""}
                >
                  {quienesSomos.title ?? "Quiénes somos"}
                </TituloSeccion>
                <Parrafos textos={enParrafos(quienesSomos.body)} className="mt-6" />

                <dl className="mt-8 grid w-full overflow-hidden rounded-tarjeta bg-blanco shadow-tarjeta sm:grid-cols-2">
                  <div className="px-5 py-4">
                    <dt className="text-[13px] text-acero-600">Razón social</dt>
                    <dd className="mt-0.5 text-[15px] font-medium text-azul-950">
                      {contacto.legalName}
                    </dd>
                  </div>
                  {contacto.nit ? (
                    <div className="border-t border-separador px-5 py-4 sm:border-l sm:border-t-0">
                      <dt className="text-[13px] text-acero-600">NIT</dt>
                      <dd className="mt-0.5 text-[15px] font-medium text-azul-950">
                        {contacto.nit}
                      </dd>
                    </div>
                  ) : null}
                </dl>
              </div>

              {/* Par escalonado: la foto principal a todo el alto de la
                  columna de texto (arriba con el rótulo, abajo con la ficha) y
                  una segunda, más baja, apoyada abajo. Una sola foto en un
                  recuadro era justo la composición de GPI (regla 13). */}
              {fotoQuienes ? (
                <div
                  className={`grid gap-4 lg:order-first lg:col-span-5 lg:min-h-[26rem] ${
                    fotoDuo ? "grid-cols-5" : ""
                  }`}
                >
                  <ContentImage
                    src={fotoQuienes.src}
                    alt={fotoQuienes.alt}
                    width={fotoQuienes.width}
                    height={fotoQuienes.height}
                    srcMovil={fotoQuienes.srcMovil}
                    sizes="(min-width: 1024px) 26vw, 60vw"
                    proporcion={`${fotoDuo ? "col-span-3 aspect-[3/4]" : "aspect-[4/3] sm:aspect-[16/10]"} lg:aspect-auto lg:h-full`}
                    claseContenedor="rounded-panel bg-acero-100 shadow-elevada ring-1 ring-separador"
                  />
                  {fotoDuo ? (
                    <ContentImage
                      src={fotoDuo.src}
                      alt={fotoDuo.alt}
                      width={fotoDuo.width}
                      height={fotoDuo.height}
                      srcMovil={fotoDuo.srcMovil}
                      sizes="(min-width: 1024px) 17vw, 40vw"
                      proporcion="col-span-2 aspect-[7/10] self-end lg:aspect-auto lg:h-[72%]"
                      claseContenedor="rounded-panel bg-acero-100 shadow-elevada ring-1 ring-separador"
                    />
                  ) : null}
                </div>
              ) : null}
            </div>
          </Contenedor>
        </section>
      ) : null}

      {/* Misión y visión — tríptico: tarjeta clara · foto · tarjeta oscura. La
          foto se estira al alto de las tarjetas. */}
      {bloquesMisionVision.length > 0 ? (
        <section aria-labelledby="titulo-mision-vision" className="bg-blanco">
          <Contenedor className="py-16 lg:py-24">
            <h2 id="titulo-mision-vision" className="sr-only">
              Misión y visión
            </h2>
            {/* Tríptico solo desde `xl`: en `lg` (1024) las tres columnas
                quedaban de ~300 px y las tarjetas, altísimas y desparejas. Ahí
                van las dos tarjetas lado a lado y la foto debajo, como banda. */}
            <div
              className={`grid gap-4 lg:gap-5 ${
                bloquesMisionVision.length === 2 ? "lg:grid-cols-2" : ""
              } ${bloquesMisionVision.length === 2 && fotoMisionVision ? "xl:grid-cols-3" : ""}`}
            >
              {bloquesMisionVision.map(({ bloque, oscuro }, indice) => (
                <article
                  key={bloque?.title ?? indice}
                  className={`flex flex-col rounded-panel p-7 lg:p-9 ${
                    oscuro
                      ? "sobre-oscuro fondo-noche shadow-elevada"
                      : "bg-lienzo ring-1 ring-separador"
                  } ${indice === 1 ? "xl:order-last" : ""}`}
                >
                  <span
                    className={`inline-flex size-9 items-center justify-center rounded-capsula text-[13px] font-semibold tabular-nums ${
                      oscuro ? "bg-relleno-claro text-verde-300" : "bg-relleno-medio text-azul-700"
                    }`}
                  >
                    {indice === 0 ? "01" : "02"}
                  </span>
                  <h3
                    className={`mt-5 text-[1.75rem] font-semibold leading-tight sm:text-[2rem] ${
                      oscuro ? "text-blanco" : "text-azul-950"
                    }`}
                  >
                    {bloque?.title}
                  </h3>
                  <p
                    className={`mt-4 text-[1.0625rem] leading-[1.7] ${
                      oscuro ? "text-acero-200" : "text-acero-700"
                    }`}
                  >
                    {bloque?.body}
                  </p>
                </article>
              ))}

              {/* En `xl` queda en medio de las dos tarjetas (la segunda va
                  `xl:order-last`) y se estira a su alto; por debajo, banda
                  apaisada al final, a lo ancho de las dos. */}
              {fotoMisionVision && bloquesMisionVision.length === 2 ? (
                <ContentImage
                  src={fotoMisionVision.src}
                  alt={fotoMisionVision.alt}
                  width={fotoMisionVision.width}
                  height={fotoMisionVision.height}
                  srcMovil={fotoMisionVision.srcMovil}
                  sizes="(min-width: 1280px) 30vw, 100vw"
                  proporcion="aspect-[16/10] lg:col-span-2 lg:aspect-[21/8] xl:col-span-1 xl:aspect-auto xl:h-full xl:min-h-[20rem]"
                  claseContenedor="rounded-panel bg-acero-100 shadow-elevada ring-1 ring-separador"
                />
              ) : null}
            </div>
          </Contenedor>
        </section>
      ) : null}

      <Valores
        valores={valores}
        rotulo={nosotros.valores?.eyebrow ?? "Cómo trabajamos"}
        titulo={nosotros.valores?.title ?? "Nuestros valores"}
        intro={nosotros.valores?.intro}
        disposicion="lista"
      />

      {/* Galería: encabezado partido y carrusel a todo el ancho. */}
      {galeria.length > 0 ? (
        <section aria-labelledby="titulo-galeria" className="bg-lienzo">
          <Contenedor className="py-16 lg:py-20">
            <div className="grid gap-5 lg:grid-cols-12 lg:items-end lg:gap-12">
              <div className="lg:col-span-6">
                {bloqueGaleria?.eyebrow !== "" ? (
                  <Rotulo>{bloqueGaleria?.eyebrow ?? "En obra"}</Rotulo>
                ) : null}
                <TituloSeccion
                  id="titulo-galeria"
                  className={bloqueGaleria?.eyebrow !== "" ? "mt-5" : ""}
                >
                  {bloqueGaleria?.title ?? "Nuestro trabajo"}
                </TituloSeccion>
              </div>
              {bloqueGaleria?.intro ? (
                <EntradaSeccion className="lg:col-span-6">{bloqueGaleria.intro}</EntradaSeccion>
              ) : null}
            </div>
            {/* Carrusel horizontal: Cesar pidió poder moverse lateralmente
                entre las fotos en vez de ver un mosaico. El clic abre el visor. */}
            <Galeria
              imagenes={galeriaCarrusel}
              titulo={bloqueGaleria?.title ?? "Nuestro trabajo"}
              vista="carrusel"
              className="mt-8"
            />
          </Contenedor>
        </section>
      ) : null}

      <FranjaCta
        titulo={nosotros.cta?.title ?? "¿Quiere trabajar con nosotros?"}
        texto={nosotros.cta?.body}
        hrefWhatsApp={hrefWhatsApp}
      />
    </main>
  );
}
