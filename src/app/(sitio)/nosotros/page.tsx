/**
 * NOSOTROS — `/nosotros`
 *
 * Quiénes somos · Misión · Visión · Valores · Galería.
 *
 * ⚠ Los rótulos «Misión» y «Visión» son los que usó PIYC en su documento, y
 * en el original parecen intercambiados (`docs/PLAN_INICIAL_PIYC.md` §4.3).
 * **No se corrigen desde el sitio**: se muestran tal cual hasta que Jorge
 * confirme. Cambiarlos es editar `site_settings.nosotros` desde el panel.
 */

import type { Metadata } from "next";
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
  Parrafos,
  Rotulo,
  TituloSeccion,
} from "@/components/sections/primitivas";
import { FotoEnmarcada } from "@/components/ui/ContentImage";
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
  });
  return metadataDePagina({ titulo, descripcion, ruta: "/nosotros", imagen });
}

export default async function Nosotros() {
  const [nosotros, valores, contacto] = await Promise.all([
    getNosotros(),
    getValores(),
    getContacto(),
  ]);

  const hrefWhatsApp = enlaceWhatsAppDe(contacto, MENSAJES_WHATSAPP.general);
  const quienesSomos = nosotros.quienesSomos;
  const galeria = nosotros.galeria ?? [];
  const bloqueGaleria = nosotros.bloqueGaleria;

  return (
    <main id="contenido">
      <JsonLd datos={jsonLdMigas(MIGAS)} />

      <CabeceraInterna
        ajustes={nosotros.hero}
        rotulo="Quiénes somos"
        titulo="Sobre PIYC"
        migas={MIGAS}
      />

      {/* Quiénes somos */}
      {quienesSomos?.body ? (
        <section aria-labelledby="titulo-quienes-somos" className="bg-lienzo">
          <Contenedor className="py-16 lg:py-20">
            <div className="grid gap-10 lg:grid-cols-12 lg:items-start lg:gap-12">
              <div className="lg:col-span-7">
                {quienesSomos.eyebrow !== "" ? (
                  <Rotulo>{quienesSomos.eyebrow ?? "La empresa"}</Rotulo>
                ) : null}
                <TituloSeccion id="titulo-quienes-somos" className="mt-5">
                  {quienesSomos.title ?? "Quiénes somos"}
                </TituloSeccion>
                <Parrafos textos={enParrafos(quienesSomos.body)} className="mt-6" />

                <dl className="mt-8 grid overflow-hidden rounded-tarjeta bg-blanco shadow-tarjeta sm:grid-cols-2">
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

              {quienesSomos.image ? (
                <div className="lg:col-span-5">
                  <FotoEnmarcada
                    src={quienesSomos.image.src}
                    alt={quienesSomos.image.alt}
                    width={quienesSomos.image.width}
                    height={quienesSomos.image.height}
                    proporcion="aspect-[4/3]"
                    className="mx-auto max-w-[min(100%,28rem)] lg:mx-0 lg:ml-auto"
                    pie={quienesSomos.image.alt}
                  />
                </div>
              ) : null}
            </div>
          </Contenedor>
        </section>
      ) : null}

      {/* Misión y visión, con los rótulos originales de PIYC */}
      {nosotros.mision?.body || nosotros.vision?.body ? (
        <section
          aria-labelledby="titulo-mision-vision"
          className="bg-lienzo-alto"
        >
          <Contenedor className="py-16 lg:py-20">
            <h2 id="titulo-mision-vision" className="sr-only">
              Misión y visión
            </h2>
            <div className="grid gap-4 lg:grid-cols-2 lg:gap-5">
              {[nosotros.mision, nosotros.vision]
                .filter((bloque) => Boolean(bloque?.body))
                .map((bloque, indice) => (
                  <article
                    key={bloque!.title ?? indice}
                    className="rounded-panel bg-blanco p-6 shadow-tarjeta lg:p-9"
                  >
                    <span className="inline-flex size-9 items-center justify-center rounded-capsula bg-relleno text-[13px] font-semibold tabular-nums text-azul-700">
                      {indice === 0 ? "01" : "02"}
                    </span>
                    <h3 className="mt-4 text-[1.625rem] font-semibold leading-tight text-azul-950 sm:text-[1.875rem]">
                      {bloque!.title}
                    </h3>
                    <p className="mt-4 max-w-[60ch] text-[1.0625rem] leading-[1.7] text-acero-700">
                      {bloque!.body}
                    </p>
                  </article>
                ))}
            </div>
          </Contenedor>
        </section>
      ) : null}

      <Valores
        valores={valores}
        rotulo={nosotros.valores?.eyebrow ?? "Cómo trabajamos"}
        titulo={nosotros.valores?.title ?? "Nuestros valores"}
        intro={nosotros.valores?.intro}
      />

      {/* Galería */}
      {galeria.length > 0 ? (
        <section aria-labelledby="titulo-galeria" className="bg-lienzo">
          <Contenedor className="py-16 lg:py-20">
            {bloqueGaleria?.eyebrow !== "" ? (
              <Rotulo>{bloqueGaleria?.eyebrow ?? "En obra"}</Rotulo>
            ) : null}
            <TituloSeccion id="titulo-galeria" className="mt-5">
              {bloqueGaleria?.title ?? "Nuestro trabajo"}
            </TituloSeccion>
            <Galeria
              imagenes={galeria}
              titulo="PIYC en obra"
              columnas={3}
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
