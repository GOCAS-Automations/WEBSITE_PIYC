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

export function GraficoServicio({
  servicio,
  className = "",
}: {
  servicio: Pick<Servicio, "iconKey" | "navTitle" | "slug">;
  className?: string;
}) {
  return (
    <div className={`relative ${className}`}>
      <div className="sobre-oscuro overflow-hidden rounded-panel fondo-noche shadow-elevada ring-1 ring-separador-claro">
        <p className="px-5 pb-1 pt-4 text-[13px] font-medium text-acero-300">
          Símbolo de servicio
        </p>

        <div className="px-3">
          <div className="flex aspect-[4/3] items-center justify-center rounded-tarjeta bg-azul-950/55 p-8 ring-1 ring-separador-claro">
            <IconoServicio
              clave={servicio.iconKey}
              className="size-28 text-azul-300 sm:size-32"
              strokeWidth={1.2}
            />
          </div>
        </div>

        <dl className="grid grid-cols-2 gap-2 p-3">
          <div className="rounded-chip bg-relleno-claro px-3 py-2.5">
            <dt className="text-[11px] font-medium text-acero-300">Servicio</dt>
            <dd className="mt-0.5 text-[13px] font-medium text-acero-100">
              {servicio.navTitle}
            </dd>
          </div>
          <div className="rounded-chip bg-relleno-claro px-3 py-2.5">
            <dt className="text-[11px] font-medium text-acero-300">Referencia</dt>
            <dd className="mt-0.5 text-[13px] font-medium uppercase text-acero-100">
              {servicio.slug.slice(0, 3)}
            </dd>
          </div>
        </dl>
      </div>
    </div>
  );
}
