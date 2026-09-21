/**
 * GRÁFICO DE SERVICIO — SUSTITUTO DE LA FOTO CUANDO NO HAY
 * ========================================================
 * Dos de los nueve servicios (`refrigeracion-industrial` y
 * `aires-acondicionados`) **no tienen ni una foto**: el PPTX de casos de éxito
 * es todo automatización de procesos (`docs/CONTENIDO.md` §3).
 *
 * La salida fácil sería ponerles una foto de tablero que no tiene nada que ver
 * con el servicio. Eso engaña al visitante y arruina el `alt`. En su lugar se
 * pinta un panel técnico con el símbolo del servicio y su cajetín, que es
 * coherente con el lenguaje del sitio y no promete lo que no hay.
 *
 * Cuando Jorge entregue fotos de refrigeración y climatización, se cargan
 * desde el panel y este panel desaparece solo.
 */

import type { Servicio } from "@/lib/content-types";
import { IconoServicio } from "@/components/ui/iconos-servicio";
import { MarcasDeCorte } from "@/components/ui/ContentImage";

export function GraficoServicio({
  servicio,
  className = "",
}: {
  servicio: Pick<Servicio, "iconKey" | "navTitle" | "slug">;
  className?: string;
}) {
  return (
    <div className={`relative ${className}`}>
      <MarcasDeCorte />
      <div className="sobre-oscuro border border-azul-800 bg-azul-950">
        <p className="border-b border-azul-800 px-4 py-2.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-acero-300">
          Símbolo de servicio
        </p>

        <div
          className="flex aspect-[4/3] items-center justify-center p-8"
          style={{
            // Retícula fina del plano, en versión oscura. Se escribe aquí
            // porque `fondo-plano` es la variante clara.
            backgroundImage:
              "linear-gradient(to right, color-mix(in srgb, var(--color-azul-300) 12%, transparent) 1px, transparent 1px), linear-gradient(to bottom, color-mix(in srgb, var(--color-azul-300) 12%, transparent) 1px, transparent 1px)",
            backgroundSize: "24px 24px",
          }}
        >
          <IconoServicio
            clave={servicio.iconKey}
            className="size-28 text-azul-300 sm:size-32"
            strokeWidth={1}
          />
        </div>

        <dl className="grid grid-cols-2 border-t border-azul-800">
          <div className="border-r border-azul-800 px-4 py-2.5">
            <dt className="text-[10px] font-semibold uppercase tracking-[0.14em] text-acero-400">
              Servicio
            </dt>
            <dd className="mt-0.5 text-[13px] font-medium text-acero-100">
              {servicio.navTitle}
            </dd>
          </div>
          <div className="px-4 py-2.5">
            <dt className="text-[10px] font-semibold uppercase tracking-[0.14em] text-acero-400">
              Referencia
            </dt>
            <dd className="mt-0.5 font-mono text-[13px] font-medium uppercase text-acero-100">
              {servicio.slug.slice(0, 3)}
            </dd>
          </div>
        </dl>
      </div>
    </div>
  );
}
