import Link from "next/link";
import { requireManager } from "@/lib/supabase/auth";
import {
  getHorarioMensual,
  getJornadaConfig,
  listMesesConHorario,
} from "@/lib/jornadas-lecturas";
import {
  clonarHorario,
  etiquetaMes,
  hoyMesEnColombia,
  mesAnterior,
  mesSiguiente,
  normalizarMes,
  resumenHorario,
} from "@/lib/horarios";
import { BOTON_SECUNDARIO } from "@/lib/jornada-types";
import {
  AyudaSeccion,
  CabeceraPanel,
  Insignia,
  Tarjeta,
  TituloTarjeta,
} from "@/components/admin/ui";
import { EditorHorario } from "@/components/jornadas/EditorHorario";
import { guardarHorarioMensual } from "./actions";

export const dynamic = "force-dynamic";

/**
 * HORARIOS MENSUALES
 * ==================
 * A esta ruta apunta el enlace «Horarios mensuales» de `/admin/equipo`.
 *
 * POR QUÉ EL ENLACE ESTÁ EN «EQUIPO» Y LA PANTALLA EN «JORNADAS»
 * --------------------------------------------------------------
 * Porque quien busca los horarios los busca junto a las personas, pero lo que
 * hacen es alimentar el cálculo de las jornadas: el desglose se congela al
 * aprobar, y corregir un horario después NO altera una jornada ya aprobada.
 * Manteniendo la pantalla dentro de `/admin/jornadas` esa relación queda a la
 * vista de quien la programe.
 *
 * El mes se elige con `?anio=&mes=`; sin parámetros, el mes en curso.
 */
export default async function HorariosPage({
  searchParams,
}: {
  searchParams: Promise<{ anio?: string; mes?: string }>;
}) {
  await requireManager();

  const params = await searchParams;
  const actual = normalizarMes(params.anio, params.mes, hoyMesEnColombia());
  const anterior = mesAnterior(actual);
  const siguiente = mesSiguiente(actual);

  const [config, guardado, delAnterior, meses] = await Promise.all([
    getJornadaConfig(),
    getHorarioMensual(actual.anio, actual.mes),
    getHorarioMensual(anterior.anio, anterior.mes),
    listMesesConHorario(),
  ]);

  // De dónde salen los días que se muestran: lo guardado, si no el mes
  // anterior, si no el horario por defecto de `jornada_config`.
  const origen = guardado ? "guardado" : delAnterior ? "mes-anterior" : "predeterminado";
  const dias = guardado
    ? guardado.dias
    : delAnterior
      ? clonarHorario(delAnterior.dias)
      : clonarHorario(config.horarioSemanal);

  const href = (m: { anio: number; mes: number }) =>
    `/admin/jornadas/horarios?anio=${m.anio}&mes=${m.mes}`;

  return (
    <>
      <CabeceraPanel
        title="Horarios mensuales"
        description="El calendario laboral de cada mes: qué días son hábiles, cuáles festivos y cuál es la jornada esperada."
        backHref="/admin/jornadas"
        backLabel="Volver a Jornadas"
        breadcrumb={[
          { label: "Panel", href: "/admin" },
          { label: "Jornadas", href: "/admin/jornadas" },
          { label: "Horarios mensuales" },
        ]}
      />

      {/* ---------------- Navegación de meses ---------------- */}
      <nav
        aria-label="Mes del horario"
        className="mb-5 flex flex-wrap items-center justify-between gap-3 rounded-fino border border-acero-200 bg-blanco p-4"
      >
        <Link prefetch={false} href={href(anterior)} className={BOTON_SECUNDARIO}>
          <span aria-hidden="true">←</span>
          {etiquetaMes(anterior.anio, anterior.mes)}
        </Link>
        <p className="font-titulo text-xl font-semibold uppercase tracking-wide text-azul-950">
          {etiquetaMes(actual.anio, actual.mes)}
        </p>
        <Link prefetch={false} href={href(siguiente)} className={BOTON_SECUNDARIO}>
          {etiquetaMes(siguiente.anio, siguiente.mes)}
          <span aria-hidden="true">→</span>
        </Link>
      </nav>

      {origen !== "guardado" && (
        <AyudaSeccion
          tono="aviso"
          title={`${etiquetaMes(actual.anio, actual.mes)} todavía no tiene horario guardado`}
          className="mb-5"
        >
          {origen === "mes-anterior" ? (
            <>
              Abajo está cargado el horario de{" "}
              <strong>{etiquetaMes(anterior.anio, anterior.mes)}</strong> como punto
              de partida. Revísalo y pulsa <strong>Guardar horario</strong> para
              dejarlo fijado en este mes.
            </>
          ) : (
            <>
              Abajo está cargado el <strong>horario predeterminado</strong>.
              Revísalo y pulsa <strong>Guardar horario</strong>. Mientras no se
              guarde, las jornadas de este mes se calculan igualmente con ese
              horario: el cálculo nunca se queda sin referencia.
            </>
          )}
        </AyudaSeccion>
      )}

      <Tarjeta className="mb-6">
        <TituloTarjeta
          title="Plantilla semanal del mes"
          description="Define qué cuenta como jornada ordinaria: lo que exceda se calcula como hora extra."
          action={
            guardado ? (
              <Insignia className="border-verde-300 bg-verde-100 text-verde-700">
                Guardado
              </Insignia>
            ) : (
              <Insignia>Sin guardar</Insignia>
            )
          }
        />
        <EditorHorario
          action={guardarHorarioMensual}
          anio={actual.anio}
          mes={actual.mes}
          diasIniciales={dias}
          notasIniciales={guardado?.notas ?? ""}
          horarioPorDefecto={config.horarioSemanal}
          diasMesAnterior={delAnterior?.dias ?? null}
          etiquetaMesAnterior={etiquetaMes(anterior.anio, anterior.mes)}
        />
      </Tarjeta>

      {/* ---------------- Meses ya cargados ---------------- */}
      {meses.length > 0 && (
        <Tarjeta>
          <TituloTarjeta
            title="Meses con horario guardado"
            description="Los meses que no aparezcan aquí usan el horario predeterminado hasta que se guarde el suyo."
          />
          <ul className="flex flex-wrap gap-2">
            {meses.map((m) => {
              const esActual = m.anio === actual.anio && m.mes === actual.mes;
              return (
                <li key={`${m.anio}-${m.mes}`}>
                  <Link
                    prefetch={false}
                    href={href(m)}
                    className={`inline-flex rounded-fino border px-3 py-1.5 text-sm font-semibold transition-colors ${
                      esActual
                        ? "border-azul-700 bg-azul-700 text-blanco"
                        : "border-acero-300 bg-blanco text-acero-700 hover:border-azul-700 hover:text-azul-700"
                    }`}
                  >
                    {etiquetaMes(m.anio, m.mes)}
                  </Link>
                </li>
              );
            })}
          </ul>
        </Tarjeta>
      )}

      <p className="mt-6 text-sm leading-relaxed text-acero-600">
        Horario predeterminado (el de <span className="font-mono text-xs">jornada_config</span>):{" "}
        <strong className="text-azul-950">{resumenHorario(config.horarioSemanal)}</strong>. Franja
        nocturna {config.inicioNocturno}–{config.finNocturno}. Es un punto de
        partida pendiente de confirmar con PIYC.
      </p>
    </>
  );
}
