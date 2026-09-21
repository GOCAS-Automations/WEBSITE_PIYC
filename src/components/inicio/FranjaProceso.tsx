/**
 * FRANJA DEL PROCESO DE TRABAJO
 * =============================
 * Diagnóstico → diseño → montaje → puesta en marcha → soporte.
 *
 * Se dibuja como una línea de proceso: nodos cuadrados unidos por un filete
 * horizontal en escritorio y vertical en móvil. Nada de flechas curvas ni de
 * tarjetas: es un esquema, no una infografía.
 */

import type { AjustesHome } from "@/lib/content-types";
import { Contenedor, EntradaSeccion, Rotulo, TituloSeccion } from "@/components/sections/primitivas";

export function FranjaProceso({ proceso }: { proceso: AjustesHome["proceso"] }) {
  const pasos = proceso?.pasos ?? [];
  if (pasos.length === 0) return null;

  return (
    <section aria-labelledby="titulo-proceso" className="bg-lienzo">
      <Contenedor className="py-16 lg:py-20">
        <div className="max-w-3xl">
          {proceso?.eyebrow ? <Rotulo>{proceso.eyebrow}</Rotulo> : null}
          <TituloSeccion id="titulo-proceso" className="mt-5">
            {proceso?.title ?? "Cómo trabajamos"}
          </TituloSeccion>
          {proceso?.intro ? <EntradaSeccion className="mt-5">{proceso.intro}</EntradaSeccion> : null}
        </div>

        <ol className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-5 lg:gap-5">
          {pasos.map((paso, indice) => (
            <li
              key={paso.titulo}
              className="relative rounded-tarjeta bg-blanco p-5 shadow-tarjeta lg:p-6"
            >
              {/* Conector entre pasos: solo entre tarjetas, nunca tras la última. */}
              {indice < pasos.length - 1 ? (
                <span
                  aria-hidden="true"
                  className="absolute right-0 top-9 hidden h-px w-5 translate-x-full bg-acero-300 lg:block"
                />
              ) : null}

              <span className="inline-flex size-9 items-center justify-center rounded-capsula bg-azul-700 text-[14px] font-semibold tabular-nums text-blanco">
                {indice + 1}
              </span>

              <h3 className="mt-4 text-[1.0625rem] font-semibold leading-snug text-azul-950">
                {paso.titulo}
              </h3>
              <p className="mt-2 text-[14px] leading-relaxed text-acero-600">
                {paso.descripcion}
              </p>
            </li>
          ))}
        </ol>
      </Contenedor>
    </section>
  );
}
