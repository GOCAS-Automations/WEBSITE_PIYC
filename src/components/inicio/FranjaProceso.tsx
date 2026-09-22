/**
 * FRANJA DEL PROCESO DE TRABAJO
 * =============================
 * Diagnóstico → diseño → montaje → puesta en marcha → soporte. Los pasos salen
 * de `site_settings.home.proceso`; la franja se pinta en el inicio (tarjetas
 * blancas sobre el lienzo) y en `/servicios` (`tono="oscuro"`: panel azul
 * noche, para cortar la serie de secciones claras del hub).
 *
 * En escritorio los pasos van en fila, unidos por un conector. Debajo de `lg`
 * van en UNA columna, cada paso como fila (número a la izquierda): en dos
 * columnas, cinco pasos dejaban el quinto huérfano en su propia fila.
 */

import type { AjustesHome } from "@/lib/content-types";
import { Contenedor, EntradaSeccion, Rotulo, TituloSeccion } from "@/components/sections/primitivas";

export function FranjaProceso({
  proceso,
  tono = "claro",
  id = "titulo-proceso",
}: {
  proceso: AjustesHome["proceso"];
  tono?: "claro" | "oscuro";
  id?: string;
}) {
  const pasos = proceso?.pasos ?? [];
  if (pasos.length === 0) return null;
  const oscuro = tono === "oscuro";

  const encabezado = (
    <div className="grid gap-5 lg:grid-cols-12 lg:items-end lg:gap-12">
      <div className="lg:col-span-6">
        {proceso?.eyebrow ? <Rotulo tono={tono}>{proceso.eyebrow}</Rotulo> : null}
        <TituloSeccion id={id} tono={tono} className={proceso?.eyebrow ? "mt-5" : ""}>
          {proceso?.title ?? "Cómo trabajamos"}
        </TituloSeccion>
      </div>
      {proceso?.intro ? (
        <EntradaSeccion tono={tono} className="lg:col-span-6">
          {proceso.intro}
        </EntradaSeccion>
      ) : null}
    </div>
  );

  const lista = (
    <ol className="mt-10 grid gap-3 lg:grid-cols-5 lg:gap-5">
      {pasos.map((paso, indice) => (
        <li
          key={paso.titulo}
          className={`relative flex gap-4 rounded-tarjeta p-5 lg:flex-col lg:gap-0 lg:p-6 ${
            oscuro
              ? "bg-relleno-claro ring-1 ring-separador-claro"
              : "bg-blanco shadow-tarjeta"
          }`}
        >
          {/* Conector entre pasos: solo en fila y nunca tras el último. */}
          {indice < pasos.length - 1 ? (
            <span
              aria-hidden="true"
              className={`absolute right-0 top-9 hidden h-px w-5 translate-x-full lg:block ${
                oscuro ? "bg-acero-600" : "bg-acero-300"
              }`}
            />
          ) : null}

          <span
            className={`inline-flex size-9 shrink-0 items-center justify-center rounded-capsula text-[14px] font-semibold tabular-nums ${
              oscuro ? "bg-verde-500 text-azul-950" : "bg-azul-700 text-blanco"
            }`}
          >
            {indice + 1}
          </span>

          <div className="lg:mt-4">
            <h3
              className={`text-[1.0625rem] font-semibold leading-snug ${
                oscuro ? "text-blanco" : "text-azul-950"
              }`}
            >
              {paso.titulo}
            </h3>
            <p
              className={`mt-1.5 text-[14px] leading-relaxed lg:mt-2 ${
                oscuro ? "text-acero-300" : "text-acero-600"
              }`}
            >
              {paso.descripcion}
            </p>
          </div>
        </li>
      ))}
    </ol>
  );

  if (oscuro) {
    return (
      <section aria-labelledby={id} data-panel="" className="bg-lienzo py-6 lg:py-8">
        <Contenedor>
          <div className="sobre-oscuro overflow-hidden rounded-lienzo fondo-noche px-6 py-12 shadow-elevada sm:px-10 lg:px-14 lg:py-14">
            {encabezado}
            {lista}
          </div>
        </Contenedor>
      </section>
    );
  }

  return (
    <section aria-labelledby={id} className="bg-lienzo">
      <Contenedor className="py-16 lg:py-20">
        {encabezado}
        {lista}
      </Contenedor>
    </section>
  );
}
