/**
 * PREGUNTAS FRECUENTES
 * ====================
 * Acordeón con `<details>`/`<summary>` nativos: abre y cierra sin JavaScript,
 * el teclado ya funciona (Enter y Espacio), el buscador ve el texto de las
 * respuestas aunque estén cerradas y no hace falta un Client Component.
 *
 * `name` agrupa los `<details>` para que solo uno quede abierto a la vez
 * (soportado por todos los navegadores actuales; donde no lo esté, se abren
 * varios — degrada sin romperse).
 */

import type { PreguntaFrecuente } from "@/lib/content-types";
import { Contenedor, Rotulo, TituloSeccion } from "./primitivas";

export function Faq({
  preguntas,
  titulo = "Preguntas frecuentes",
  rotulo = "Antes de escribirnos",
  id = "preguntas-frecuentes",
}: {
  preguntas: readonly PreguntaFrecuente[];
  titulo?: string;
  rotulo?: string;
  id?: string;
}) {
  if (preguntas.length === 0) return null;

  return (
    <section aria-labelledby={`${id}-titulo`} className="bg-lienzo">
      <Contenedor className="py-16 lg:py-20">
        <div className="grid gap-10 lg:grid-cols-12 lg:gap-12">
          <div className="lg:col-span-4">
            <Rotulo>{rotulo}</Rotulo>
            <TituloSeccion id={`${id}-titulo`} className="mt-5">
              {titulo}
            </TituloSeccion>
          </div>

          <div className="overflow-hidden rounded-tarjeta bg-blanco shadow-tarjeta lg:col-span-8">
            {preguntas.map((item, indice) => (
              <details
                key={item.pregunta}
                name={id}
                className="group border-t border-separador first:border-t-0"
                {...(indice === 0 ? { open: true } : {})}
              >
                <summary className="flex cursor-pointer list-none items-start justify-between gap-6 px-5 py-4.5 text-left text-[1.0625rem] font-semibold leading-snug text-azul-950 transition-colors marker:hidden hover:bg-relleno hover:text-azul-700 lg:px-6 [&::-webkit-details-marker]:hidden">
                  <span>{item.pregunta}</span>
                  <span
                    aria-hidden="true"
                    className="mt-0.5 inline-flex size-6 shrink-0 items-center justify-center rounded-capsula bg-relleno text-azul-700 transition-transform duration-300 ease-ios group-open:rotate-180"
                  >
                    <svg viewBox="0 0 16 16" fill="none" className="size-3.5">
                      <path
                        d="M4 6.5l4 4 4-4"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </span>
                </summary>
                <p className="max-w-[68ch] px-5 pb-5 text-[15px] leading-relaxed text-acero-600 lg:px-6">
                  {item.respuesta}
                </p>
              </details>
            ))}
          </div>
        </div>
      </Contenedor>
    </section>
  );
}
