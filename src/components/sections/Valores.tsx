/**
 * BLOQUE DE VALORES
 * =================
 * Lo usan `/` y `/nosotros`. Los valores salen de `site_values`.
 *
 * Retícula de filetes sobre fondo oscuro: los cuatro valores se leen como un
 * cuadro de datos, no como cuatro tarjetas flotando.
 */

import type { Valor } from "@/lib/content-types";
import { IconoValor } from "@/components/ui/iconos-servicio";
import { Contenedor, EntradaSeccion, Rotulo, TituloSeccion } from "./primitivas";

export function Valores({
  valores,
  titulo = "Nuestros valores",
  intro,
  rotulo = "Cómo trabajamos",
  id = "valores",
}: {
  valores: readonly Valor[];
  titulo?: string;
  intro?: string;
  rotulo?: string;
  id?: string;
}) {
  if (valores.length === 0) return null;

  return (
    <section id={id} aria-labelledby={`${id}-titulo`} className="bg-lienzo py-6 lg:py-8">
      <Contenedor>
        <div className="sobre-oscuro overflow-hidden rounded-lienzo fondo-noche px-6 py-12 shadow-elevada sm:px-10 lg:px-14 lg:py-14">
        <div className="max-w-3xl">
          {rotulo ? <Rotulo tono="oscuro">{rotulo}</Rotulo> : null}
          {/* Título vacío = decisión del panel. La sección sigue necesitando un
              nombre accesible, así que queda uno solo para lectores de pantalla. */}
          {titulo ? (
            <TituloSeccion id={`${id}-titulo`} tono="oscuro" className="mt-5">
              {titulo}
            </TituloSeccion>
          ) : (
            <h2 id={`${id}-titulo`} className="sr-only">
              Valores
            </h2>
          )}
          {intro ? (
            <EntradaSeccion tono="oscuro" className="mt-5">
              {intro}
            </EntradaSeccion>
          ) : null}
        </div>

        <ul className="mt-10 grid gap-4 sm:grid-cols-2 lg:gap-5">
          {valores.map((valor, indice) => (
            <li
              key={valor.title}
              className="rounded-tarjeta bg-relleno-claro p-6 ring-1 ring-separador-claro backdrop-blur-material lg:p-7"
            >
              <div className="flex items-start justify-between gap-4">
                <span className="inline-flex size-12 shrink-0 items-center justify-center rounded-control bg-relleno-claro text-verde-300">
                  <IconoValor clave={valor.iconKey} className="size-6" />
                </span>
                <span className="text-[13px] font-semibold tabular-nums text-acero-300">
                  {String(indice + 1).padStart(2, "0")}
                </span>
              </div>
              <h3 className="mt-4 text-[1.3125rem] font-semibold leading-tight text-blanco">
                {valor.title}
              </h3>
              {valor.description ? (
                <p className="mt-2.5 text-[15px] leading-relaxed text-acero-300">
                  {valor.description}
                </p>
              ) : null}
            </li>
          ))}
        </ul>
        </div>
      </Contenedor>
    </section>
  );
}
