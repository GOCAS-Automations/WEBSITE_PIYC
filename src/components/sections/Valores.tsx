/**
 * BLOQUE DE VALORES
 * =================
 * Lo usan `/` y `/nosotros`. Los valores salen de `site_values`.
 *
 * Panel azul noche. Dos disposiciones, para que las dos páginas no repitan la
 * misma pieza:
 *  - `"rejilla"` (inicio): encabezado arriba y los valores en tarjetas de
 *    vidrio, 2 × 2.
 *  - `"lista"` (nosotros): encabezado partido —título a la izquierda, entrada
 *    a la derecha— y cada valor en una fila: nombre a la izquierda, texto a la
 *    derecha, separados por filetes. Las descripciones son largas; en cuatro
 *    columnas quedaban tarjetas altísimas y estrechas.
 * Con un número de valores que no llene la última fila de la rejilla, se
 * ajustan las columnas para no dejar una tarjeta huérfana.
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
  disposicion = "rejilla",
}: {
  valores: readonly Valor[];
  titulo?: string;
  intro?: string;
  rotulo?: string;
  id?: string;
  disposicion?: "rejilla" | "lista";
}) {
  if (valores.length === 0) return null;
  const enLista = disposicion === "lista";
  const columnas = valores.length === 1 ? "" : valores.length % 3 === 0 ? "sm:grid-cols-3" : "sm:grid-cols-2";

  return (
    <section
      id={id}
      aria-labelledby={`${id}-titulo`}
      data-panel=""
      className="bg-lienzo py-6 lg:py-8"
    >
      <Contenedor>
        <div className="sobre-oscuro overflow-hidden rounded-lienzo fondo-noche px-6 py-12 shadow-elevada sm:px-10 lg:px-14 lg:py-14">
          <div
            className={
              enLista ? "grid gap-5 lg:grid-cols-12 lg:items-end lg:gap-12" : "max-w-3xl"
            }
          >
            {/* En lista, el encabezado se parte 4/8 como las filas: la entrada
                arranca en la misma columna que las descripciones. */}
            <div className={enLista ? "lg:col-span-4" : ""}>
              {rotulo ? <Rotulo tono="oscuro">{rotulo}</Rotulo> : null}
              {/* Título vacío = decisión del panel. La sección sigue necesitando
                  un nombre accesible: queda uno solo para lectores de pantalla. */}
              {titulo ? (
                <TituloSeccion
                  id={`${id}-titulo`}
                  tono="oscuro"
                  className={rotulo ? "mt-5" : ""}
                >
                  {titulo}
                </TituloSeccion>
              ) : (
                <h2 id={`${id}-titulo`} className="sr-only">
                  Valores
                </h2>
              )}
            </div>
            {intro ? (
              <EntradaSeccion tono="oscuro" className={enLista ? "lg:col-span-8" : "mt-5"}>
                {intro}
              </EntradaSeccion>
            ) : null}
          </div>

          {enLista ? (
            <ul className="mt-10 border-t border-separador-claro">
              {valores.map((valor, indice) => (
                <li
                  key={valor.title}
                  className="grid gap-3 border-b border-separador-claro py-6 lg:grid-cols-12 lg:gap-12 lg:py-7"
                >
                  <div className="flex items-center gap-4 lg:col-span-4">
                    <span className="inline-flex size-12 shrink-0 items-center justify-center rounded-control bg-relleno-claro text-verde-300">
                      <IconoValor clave={valor.iconKey} className="size-6" />
                    </span>
                    <div>
                      <span className="block text-[13px] font-semibold tabular-nums text-acero-300">
                        {String(indice + 1).padStart(2, "0")}
                      </span>
                      <h3 className="text-[1.375rem] font-semibold leading-tight text-blanco">
                        {valor.title}
                      </h3>
                    </div>
                  </div>
                  {valor.description ? (
                    <p className="max-w-[72ch] text-[1.0625rem] leading-relaxed text-acero-200 lg:col-span-8 lg:self-center">
                      {valor.description}
                    </p>
                  ) : null}
                </li>
              ))}
            </ul>
          ) : (
            <ul className={`mt-10 grid gap-4 lg:gap-5 ${columnas}`}>
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
          )}
        </div>
      </Contenedor>
    </section>
  );
}
