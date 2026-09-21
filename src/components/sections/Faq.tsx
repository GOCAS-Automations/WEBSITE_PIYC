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
    <section aria-labelledby={`${id}-titulo`} className="border-t border-acero-200 bg-blanco">
      <Contenedor className="py-14 lg:py-16">
        <div className="grid gap-10 lg:grid-cols-12 lg:gap-12">
          <div className="lg:col-span-4">
            <Rotulo>{rotulo}</Rotulo>
            <TituloSeccion id={`${id}-titulo`} className="mt-5">
              {titulo}
            </TituloSeccion>
          </div>

          <div className="border-t border-acero-200 lg:col-span-8 lg:border-t-0">
            {preguntas.map((item, indice) => (
              <details
                key={item.pregunta}
                name={id}
                className="group border-b border-acero-200"
                {...(indice === 0 ? { open: true } : {})}
              >
                <summary className="flex cursor-pointer list-none items-start justify-between gap-6 py-5 text-left font-titulo text-xl font-semibold leading-tight text-azul-950 transition-colors marker:hidden hover:text-azul-700 [&::-webkit-details-marker]:hidden">
                  <span>{item.pregunta}</span>
                  <span
                    aria-hidden="true"
                    className="relative mt-2 size-3.5 shrink-0 text-azul-700"
                  >
                    <span className="absolute left-0 top-1/2 h-0.5 w-full -translate-y-1/2 bg-current" />
                    <span className="absolute left-1/2 top-0 h-full w-0.5 -translate-x-1/2 bg-current transition-transform group-open:scale-y-0" />
                  </span>
                </summary>
                <p className="max-w-[68ch] pb-5 pr-8 text-[15px] leading-relaxed text-acero-600">
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
