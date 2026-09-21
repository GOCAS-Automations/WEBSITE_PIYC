import { notFound } from "next/navigation";
import { requireManager } from "@/lib/supabase/auth";
import {
  completarPersonas,
  getContextoJornadas,
  getJornada,
  listPersonasParaJornadas,
} from "@/lib/jornadas-lecturas";
import {
  formatearFechaLarga,
  formatearFechaNumerica,
  fechaColombia,
  hoyEnColombia,
  obtenerDesglose,
  rangoHorario,
} from "@/lib/jornada";
import {
  CLASES_ESTADO,
  ETIQUETA_ESTADO,
  EXPLICACION_ESTADO,
} from "@/lib/jornada-types";
import {
  AyudaSeccion,
  CabeceraPanel,
  Insignia,
  Tarjeta,
  TituloTarjeta,
} from "@/components/admin/ui";
import { Desglose } from "@/components/jornadas/Desglose";
import { AccionesRevision } from "@/components/jornadas/AccionesRevision";
import { FormularioJornada } from "@/components/jornadas/FormularioJornada";
import {
  aprobarJornada,
  eliminarJornadaComoManager,
  guardarJornadaComoManager,
  reabrirJornada,
  rechazarJornada,
} from "../actions";

export const dynamic = "force-dynamic";

/**
 * FICHA DE UNA JORNADA
 * ====================
 * Todo lo que hace falta para decidir: quién, cuándo, qué hizo, cómo se
 * reparten sus horas y con qué horario se calcularon. Debajo, las acciones de
 * revisión, con la diferencia entre **rechazar** y **eliminar** escrita al lado
 * de cada botón (regla 6).
 *
 * El desglose sale siempre de `obtenerDesglose()`: si la jornada está aprobada
 * muestra lo congelado; si no, lo recalcula con el horario vigente. Esta
 * pantalla nunca llama a `calcularJornada` por su cuenta.
 */
export default async function JornadaDetallePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireManager();

  const { id } = await params;
  const jornada = await getJornada(id);
  if (!jornada) notFound();

  const [{ config, horarios }, [conPersona], personas] = await Promise.all([
    getContextoJornadas(),
    completarPersonas([jornada]),
    listPersonasParaJornadas(),
  ]);

  const resuelto = obtenerDesglose(jornada, config, horarios);
  const contexto = resuelto.contexto;

  return (
    <>
      <CabeceraPanel
        title={conPersona.empleadoNombre}
        // Sin punto final: `rangoHorario` ya termina en «a. m.» / «p. m.».
        description={`Jornada del ${formatearFechaLarga(jornada.work_date)}, de ${rangoHorario(
          jornada.start_at,
          jornada.end_at,
        )}`}
        backHref="/admin/jornadas"
        backLabel="Volver a Jornadas"
        breadcrumb={[
          { label: "Panel", href: "/admin" },
          { label: "Jornadas", href: "/admin/jornadas" },
          { label: "Ficha" },
        ]}
      />

      <div className="grid gap-5 lg:grid-cols-[1fr_20rem]">
        <div className="space-y-5">
          {/* ---------------- Datos del turno ---------------- */}
          <Tarjeta>
            <div className="mb-4 flex flex-wrap items-center gap-2 border-b border-acero-200 pb-4">
              <Insignia className={CLASES_ESTADO[jornada.status]}>
                {ETIQUETA_ESTADO[jornada.status]}
              </Insignia>
              {resuelto.congelado && <Insignia>Cálculo congelado</Insignia>}
              <span className="text-sm text-acero-600">
                {EXPLICACION_ESTADO[jornada.status]}
              </span>
            </div>

            <dl className="grid gap-x-6 gap-y-3 sm:grid-cols-2">
              <div>
                <dt className="text-xs font-semibold uppercase tracking-wider text-acero-500">
                  Persona
                </dt>
                <dd className="mt-0.5 text-sm text-azul-950">
                  {conPersona.empleadoNombre}
                  {conPersona.empleadoCargo && (
                    <span className="text-acero-600"> · {conPersona.empleadoCargo}</span>
                  )}
                </dd>
              </div>
              <div>
                <dt className="text-xs font-semibold uppercase tracking-wider text-acero-500">
                  Día laboral
                </dt>
                <dd className="mt-0.5 text-sm text-azul-950">
                  {formatearFechaLarga(jornada.work_date)}
                </dd>
              </div>
              <div>
                <dt className="text-xs font-semibold uppercase tracking-wider text-acero-500">
                  Horario del turno
                </dt>
                <dd className="mt-0.5 text-sm text-azul-950">
                  {rangoHorario(jornada.start_at, jornada.end_at)}
                  {resuelto.desglose.cruzaMedianoche && (
                    <span className="text-acero-600"> (terminó al día siguiente)</span>
                  )}
                </dd>
              </div>
              <div>
                <dt className="text-xs font-semibold uppercase tracking-wider text-acero-500">
                  Orden de trabajo
                </dt>
                <dd className="mt-0.5 text-sm text-azul-950">
                  {jornada.work_order ?? (
                    <span className="text-acero-500">Sin orden asociada</span>
                  )}
                </dd>
              </div>
              <div className="sm:col-span-2">
                <dt className="text-xs font-semibold uppercase tracking-wider text-acero-500">
                  Labor realizada
                </dt>
                <dd className="mt-0.5 text-sm leading-relaxed text-azul-950">
                  {jornada.description}
                </dd>
              </div>
              {jornada.observations && (
                <div className="sm:col-span-2">
                  <dt className="text-xs font-semibold uppercase tracking-wider text-acero-500">
                    Observaciones
                  </dt>
                  <dd className="mt-0.5 text-sm leading-relaxed text-acero-700">
                    {jornada.observations}
                  </dd>
                </div>
              )}
            </dl>

            <p className="mt-4 border-t border-acero-200 pt-3 text-xs text-acero-500">
              Registrada el {formatearFechaNumerica(fechaColombia(jornada.created_at))}
              {jornada.reviewed_at && (
                <>
                  {" "}
                  · Revisada el{" "}
                  {formatearFechaNumerica(fechaColombia(jornada.reviewed_at))}
                  {conPersona.revisorNombre && <> por {conPersona.revisorNombre}</>}
                </>
              )}
            </p>
          </Tarjeta>

          {/* ---------------- Nota de revisión ---------------- */}
          {jornada.review_note && (
            <AyudaSeccion
              tono={jornada.status === "rechazada" ? "aviso" : "info"}
              title={
                jornada.status === "rechazada"
                  ? "Nota con la que se devolvió"
                  : "Nota de la revisión"
              }
            >
              {jornada.review_note}
            </AyudaSeccion>
          )}

          {/* ---------------- Desglose ---------------- */}
          <Tarjeta>
            <TituloTarjeta
              title="Desglose de horas"
              description={
                resuelto.congelado
                  ? "Estas cifras quedaron fijas al aprobar la jornada. Corregir el horario del mes ya no las altera."
                  : "Calculado ahora con el horario del mes vigente. Quedará fijo cuando la jornada se apruebe."
              }
            />
            <Desglose
              desglose={resuelto.desglose}
              contexto={contexto}
              congelado={resuelto.congelado}
              calculadoEn={resuelto.calculadoEn}
            />

            {contexto && (
              <dl className="mt-4 grid gap-x-6 gap-y-2 border-t border-acero-200 pt-4 text-sm sm:grid-cols-2">
                <div className="flex items-baseline justify-between gap-3">
                  <dt className="text-acero-600">Horario aplicado</dt>
                  <dd className="text-right font-semibold text-azul-950">
                    {contexto.mesEtiqueta || "—"}
                  </dd>
                </div>
                <div className="flex items-baseline justify-between gap-3">
                  <dt className="text-acero-600">Franja nocturna</dt>
                  <dd className="text-right font-semibold text-azul-950">
                    {contexto.inicioNocturno}–{contexto.finNocturno}
                  </dd>
                </div>
                <div className="flex items-baseline justify-between gap-3">
                  <dt className="text-acero-600">Recargo dominical / festivo</dt>
                  <dd className="text-right font-semibold text-azul-950">
                    {Math.round(contexto.recargos.dominicalFestivo * 100)} %
                  </dd>
                </div>
                <div className="flex items-baseline justify-between gap-3">
                  <dt className="text-acero-600">Extra diurna / nocturna</dt>
                  <dd className="text-right font-semibold text-azul-950">
                    {Math.round(contexto.recargos.extraDiurna * 100)} % /{" "}
                    {Math.round(contexto.recargos.extraNocturna * 100)} %
                  </dd>
                </div>
              </dl>
            )}
          </Tarjeta>

          {/* ---------------- Corregir ---------------- */}
          <Tarjeta>
            <TituloTarjeta
              title="Corregir esta jornada"
              description="Cambiar las horas invalida el cálculo: la jornada vuelve a quedar pendiente y hay que aprobarla de nuevo para congelarla."
            />
            <details className="group">
              <summary className="cursor-pointer list-none text-sm font-semibold text-azul-700 transition-colors hover:text-azul-800 [&::-webkit-details-marker]:hidden">
                Abrir el formulario de corrección
                <span className="ml-1 inline-block transition-transform group-open:rotate-90">
                  ›
                </span>
              </summary>
              <div className="mt-4">
                <FormularioJornada
                  action={guardarJornadaComoManager}
                  config={config}
                  horarios={horarios}
                  hoy={hoyEnColombia()}
                  jornada={jornada}
                  empleados={personas
                    .filter((p) => p.activa || p.id === jornada.employee_id)
                    .map((p) => ({ id: p.id, nombre: p.nombre, cargo: p.cargo }))}
                  submitLabel="Guardar la corrección"
                />
              </div>
            </details>
          </Tarjeta>
        </div>

        {/* ---------------- Acciones de revisión ---------------- */}
        <aside className="lg:sticky lg:top-6 lg:self-start">
          <Tarjeta>
            <TituloTarjeta title="Revisión" />
            <AccionesRevision
              id={jornada.id}
              estado={jornada.status}
              aprobar={aprobarJornada}
              rechazar={rechazarJornada}
              reabrir={reabrirJornada}
              eliminar={eliminarJornadaComoManager}
            />
          </Tarjeta>
        </aside>
      </div>
    </>
  );
}
