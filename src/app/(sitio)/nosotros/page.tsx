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
        <section aria-labelledby="titulo-quienes-somos" className="bg-blanco">
          <Contenedor className="py-14 lg:py-18">
            <div className="grid gap-10 lg:grid-cols-12 lg:items-start lg:gap-12">
              <div className="lg:col-span-7">
                <Rotulo>La empresa</Rotulo>
                <TituloSeccion id="titulo-quienes-somos" className="mt-5">
                  {quienesSomos.title ?? "Quiénes somos"}
                </TituloSeccion>
                <Parrafos textos={enParrafos(quienesSomos.body)} className="mt-6" />

                <dl className="mt-8 grid gap-px border border-acero-200 bg-acero-200 sm:grid-cols-2">
                  <div className="bg-blanco px-4 py-3.5">
                    <dt className="text-[11px] font-semibold uppercase tracking-[0.12em] text-acero-500">
                      Razón social
                    </dt>
                    <dd className="mt-1 text-[15px] font-medium text-azul-950">
                      {contacto.legalName}
                    </dd>
                  </div>
                  {contacto.nit ? (
                    <div className="bg-blanco px-4 py-3.5">
                      <dt className="text-[11px] font-semibold uppercase tracking-[0.12em] text-acero-500">
                        NIT
                      </dt>
                      <dd className="mt-1 text-[15px] font-medium text-azul-950">
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
          className="fondo-plano border-y border-acero-200"
        >
          <Contenedor className="py-14 lg:py-18">
            <h2 id="titulo-mision-vision" className="sr-only">
              Misión y visión
            </h2>
            <div className="grid gap-px border border-acero-200 bg-acero-200 lg:grid-cols-2">
              {[nosotros.mision, nosotros.vision]
                .filter((bloque) => Boolean(bloque?.body))
                .map((bloque, indice) => (
                  <article key={bloque!.title ?? indice} className="bg-blanco p-6 lg:p-9">
                    <p className="flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.14em] text-acero-600">
                      <span aria-hidden="true" className="size-2.5 shrink-0 bg-verde-500" />
                      <span>{indice === 0 ? "01" : "02"}</span>
                    </p>
                    <h3 className="mt-4 font-titulo text-[1.75rem] font-semibold leading-tight text-azul-950 sm:text-[2rem]">
                      {bloque!.title}
                    </h3>
                    <p className="mt-4 max-w-[60ch] text-base leading-relaxed text-acero-700 sm:text-[1.0625rem]">
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
        rotulo="Cómo trabajamos"
        titulo={nosotros.valores?.title ?? "Nuestros valores"}
        intro={nosotros.valores?.intro}
      />

      {/* Galería */}
      {galeria.length > 0 ? (
        <section aria-labelledby="titulo-galeria" className="bg-blanco">
          <Contenedor className="py-14 lg:py-18">
            <Rotulo>En obra</Rotulo>
            <TituloSeccion id="titulo-galeria" className="mt-5">
              Nuestro trabajo
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
        titulo="¿Quiere trabajar con nosotros?"
        texto="Cuéntenos qué necesita su planta y con qué restricciones trabaja. Revisamos el alcance antes de proponer cualquier cosa."
        hrefWhatsApp={hrefWhatsApp}
      />
    </main>
  );
}
