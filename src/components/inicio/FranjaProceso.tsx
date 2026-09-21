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
    <section
      aria-labelledby="titulo-proceso"
      className="fondo-plano border-y border-acero-200"
    >
      <Contenedor className="py-14 lg:py-18">
        <div className="max-w-3xl">
          {proceso?.eyebrow ? <Rotulo>{proceso.eyebrow}</Rotulo> : null}
          <TituloSeccion id="titulo-proceso" className="mt-5">
            {proceso?.title ?? "Cómo trabajamos"}
          </TituloSeccion>
          {proceso?.intro ? <EntradaSeccion className="mt-5">{proceso.intro}</EntradaSeccion> : null}
        </div>

        <ol className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-5 lg:gap-6">
          {pasos.map((paso, indice) => (
            <li key={paso.titulo} className="relative">
              {/* Filete de conexión: solo entre nodos, nunca después del último. */}
              {indice < pasos.length - 1 ? (
                <span
                  aria-hidden="true"
                  className="absolute left-4 top-11 hidden h-px w-[calc(100%-1rem)] bg-acero-300 lg:block"
                />
              ) : null}

              <div className="relative flex items-center gap-3">
                <span className="flex size-8 shrink-0 items-center justify-center border border-azul-700 bg-blanco font-titulo text-sm font-semibold tabular-nums text-azul-700">
                  {indice + 1}
                </span>
                <span
                  aria-hidden="true"
                  className="h-px flex-1 bg-acero-300 lg:hidden"
                />
              </div>

              <h3 className="mt-4 text-xl font-semibold leading-tight text-azul-950">
                {paso.titulo}
              </h3>
              <p className="mt-2 text-[15px] leading-relaxed text-acero-600">
                {paso.descripcion}
              </p>
            </li>
          ))}
        </ol>
      </Contenedor>
    </section>
  );
}
