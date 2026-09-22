/**
 * MARCADOR DE MARCA — EL HUECO DE UNA FOTO QUE AÚN NO ESTÁ
 * ========================================================
 * Cuando un bloque pide una foto y el contenido todavía no la trae, lo que no
 * puede quedar es un recuadro gris: se lee como una imagen rota. Aquí va, en su
 * lugar, una superficie de marca terminada —azul noche de PIYC con la retícula
 * tenue de las cabeceras y el logo centrado— y una cápsula discreta que dice
 * que la foto está pendiente. Así se entiende que es una decisión provisional y
 * no un error, y PIYC sabe que ese bloque se cambia desde el panel.
 *
 * Es **decorativo**: `aria-hidden`. No aporta información al visitante que no
 * ve la pantalla, y el bloque que lo contiene ya tiene su título y su texto.
 *
 * El logo va con `next/image` porque es *chrome* de marca, no contenido
 * (regla 14 de `AGENTS.md`): no sale de la base ni del bucket, vive en
 * `public/brand/` y no lo edita el panel.
 *
 * `marca` permite cambiar el centro por otra pieza gráfica —los iconos de los
 * servicios de una línea, por ejemplo— manteniendo la misma superficie.
 */

import Image from "next/image";
import type { ReactNode } from "react";

export function MarcadorDeMarca({
  /** Medida del recuadro. Misma gramática que `proporcion` de `ContentImage`. */
  proporcion = "aspect-[4/3] sm:aspect-[16/10] lg:aspect-auto lg:h-full lg:min-h-[22rem]",
  /** Pieza central alternativa. Por defecto, el logo de PIYC. */
  marca,
  /** Texto de la cápsula. `""` la quita (para marcadores puramente gráficos). */
  nota = "Foto pendiente",
  className = "",
}: {
  proporcion?: string;
  marca?: ReactNode;
  nota?: string;
  className?: string;
}) {
  return (
    <div
      aria-hidden="true"
      className={`sobre-oscuro fondo-noche reticula-cabecera relative flex flex-col items-center justify-center gap-5 overflow-hidden rounded-panel p-6 shadow-elevada ring-1 ring-separador ${proporcion} ${className}`}
    >
      {/* `relative`: la retícula de `reticula-cabecera` se pinta en un
          `::before` absoluto y sin esto quedaría por encima del logo. */}
      <div className="relative flex flex-col items-center gap-5">
        {marca ?? (
          <Image
            src="/brand/logo-piyc-oscuro.svg"
            alt=""
            width={452}
            height={192}
            loading="lazy"
            unoptimized
            className="h-14 w-auto opacity-90 sm:h-16"
          />
        )}
        {nota ? (
          <span className="rounded-capsula bg-relleno-claro px-3.5 py-1.5 text-[13px] font-medium text-acero-200 ring-1 ring-separador-claro">
            {nota}
          </span>
        ) : null}
      </div>
    </div>
  );
}
