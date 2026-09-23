import Link from "next/link";
import { requireManager } from "@/lib/supabase/auth";
import { leerPagina, paginar } from "@/lib/paginacion";
import {
  getContextoJornadas,
  listJornadasFiltradas,
  listPersonasParaJornadas,
  resolverDesgloses,
  totalesDeJornadas,
} from "@/lib/jornadas-lecturas";
import {
  OPCIONES_ESTADO_FILTRO,
  PARAM_FILTRO,
  hayFiltros,
  hrefConFiltros,
  leerFiltros,
} from "@/lib/jornada-types";
import { formatearDuracion, formatearFechaCorta, rangoHorario } from "@/lib/jornada";
import {
  AyudaSeccion,
  CabeceraPanel,
  Campo,
  EnlacePrimario,
  EstadoVacio,
  Insignia,
  Paginacion,
  Selector,
} from "@/components/admin/ui";
import {
  IconoCalendario,
  IconoDocumento,
  IconoMas,
} from "@/components/admin/iconos";
import { ChipEstado, TotalesDesglose } from "@/components/jornadas/Desglose";
import { botonChico, botonPrimario, botonSecundario } from "@/components/admin/clases";
import { CHIP_NEUTRO } from "@/components/admin/clases";

export const dynamic = "force-dynamic";

/**
 * JORNADAS — listado y revisión
 * =============================
 * Cuarta entrada del menú. Solo managers (`requireManager`).
 *
 * LOS FILTROS VIVEN EN LA URL, no en estado del cliente: así el enlace se puede
 * compartir con un compañero, el botón «atrás» del navegador funciona y —lo más
 * importante— **el CSV exporta exactamente lo que se está viendo**, porque
 * recibe los mismos parámetros. El formulario es un `<form method="get">`
 * normal: funciona aunque falle el JavaScript y no necesita un componente de
 * cliente.
 *
 * REGLA 6, que aquí se aplica más que en ningún lado: rechazar conserva el
 * registro. Desde sept-2026 el panel ya no elimina jornadas.
 * Se dice en esta pantalla y se vuelve a decir en la ficha de cada jornada.
 */
export default async function JornadasPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  await requireManager();

  const params = await searchParams;
  const filtros = leerFiltros(params);
  const conFiltros = hayFiltros(filtros);

  const [{ config, horarios }, jornadas, personas] = await Promise.all([
    getContextoJornadas(),
    listJornadasFiltradas(filtros),
    listPersonasParaJornadas(),
  ]);

  const desgloses = resolverDesgloses(jornadas, config, horarios);
  const totales = totalesDeJornadas(jornadas, desgloses);
  const pagina = paginar(jornadas, leerPagina(params.pagina));
  const base = hrefConFiltros("/admin/jornadas", filtros);

  const pendientes = jornadas.filter((j) => j.status === "pendiente").length;

  return (
    <>
      <CabeceraPanel
        title="Jornadas"
        description="El registro de horas del equipo: revisión, aprobación y exportación."
        breadcrumb={[{ label: "Panel", href: "/admin" }, { label: "Jornadas" }]}
        action={
          <EnlacePrimario href="/admin/jornadas/nueva">
            <IconoMas className="h-4 w-4" />
            Registrar jornada
          </EnlacePrimario>
        }
      />

      {/*
        Ya no hay aviso de «Jornada eliminada»: el panel no borra jornadas
        (decisión de PIYC, sept-2026). Se quitó también el parámetro
        ?eliminada=1 que lo disparaba.
      */}
      <AyudaSeccion className="mb-5">
        <strong>Una jornada registrada no se borra.</strong> Rechazar la devuelve
        a la persona con una nota para que la corrija, y el registro se conserva
        siempre (regla 6). Al <strong>aprobar</strong>, el desglose de horas queda
        congelado y ya no cambia aunque después se corrija el horario del mes.
      </AyudaSeccion>

      {/* ---------------- Filtros ---------------- */}
      <form
        method="get"
        action="/admin/jornadas"
        className="mb-5 rounded-tarjeta bg-blanco p-5 shadow-tarjeta"
      >
        <h2 className="text-lg font-semibold tracking-titulo text-azul-950">
          Filtrar
        </h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Selector
            label="Persona"
            name={PARAM_FILTRO.empleado}
            defaultValue={filtros.empleado}
            options={[
              { value: "", label: "Todo el equipo" },
              ...personas.map((p) => ({
                value: p.id,
                label: p.activa ? p.nombre : `${p.nombre} (desactivada)`,
              })),
            ]}
          />
          <Selector
            label="Estado"
            name={PARAM_FILTRO.estado}
            defaultValue={filtros.estado}
            options={OPCIONES_ESTADO_FILTRO}
          />
          <Campo
            label="Desde"
            name={PARAM_FILTRO.desde}
            type="date"
            defaultValue={filtros.desde}
          />
          <Campo
            label="Hasta"
            name={PARAM_FILTRO.hasta}
            type="date"
            defaultValue={filtros.hasta}
          />
          <Campo
            label="Orden de trabajo"
            name={PARAM_FILTRO.orden}
            defaultValue={filtros.orden}
            placeholder="Ej.: OT-1042"
            hint="Busca coincidencias parciales, sin distinguir mayúsculas."
            className="lg:col-span-2"
          />
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-3 border-t border-separador pt-4">
          <button type="submit" className={botonPrimario}>
            Aplicar filtros
          </button>
          {conFiltros && (
            <Link prefetch={false} href="/admin/jornadas" className={botonSecundario}>
              Quitar filtros
            </Link>
          )}
          {jornadas.length > 0 && (
            <a
              href={`/admin/jornadas/exportar${
                base.includes("?") ? base.slice(base.indexOf("?")) : ""
              }`}
              className={`${botonSecundario} ml-auto`}
            >
              <IconoDocumento className="h-4 w-4" />
              Exportar a CSV ({jornadas.length})
            </a>
          )}
        </div>
      </form>

      {/* ---------------- Totales ---------------- */}
      <div className="mb-5">
        <TotalesDesglose
          totales={totales}
          titulo={conFiltros ? "Totales del filtro" : "Totales de todo el histórico"}
          descripcion={`${totales.jornadas} ${
            totales.jornadas === 1 ? "jornada" : "jornadas"
          }${pendientes > 0 ? ` · ${pendientes} sin revisar` : ""}. Las aprobadas aportan sus cifras congeladas; las demás, las que se calculan ahora con el horario vigente.`}
        />
      </div>

      {/* ---------------- Listado ---------------- */}
      {jornadas.length === 0 ? (
        <EstadoVacio
          title={conFiltros ? "Ninguna jornada coincide con ese filtro" : "Todavía no hay jornadas"}
          description={
            conFiltros
              ? "Prueba con un rango de fechas más amplio o quita alguno de los filtros."
              : "Aquí aparecerán las jornadas que registre el equipo desde su portal, para revisarlas y exportarlas. También puedes registrar una tú, a nombre de quien no use el celular."
          }
          action={
            conFiltros ? (
              <Link prefetch={false} href="/admin/jornadas" className={botonSecundario}>
                Quitar filtros
              </Link>
            ) : (
              <EnlacePrimario href="/admin/jornadas/nueva">
                <IconoMas className="h-4 w-4" />
                Registrar jornada
              </EnlacePrimario>
            )
          }
        />
      ) : (
        <>
          <ul id="lista-jornadas" className="scroll-mt-8 space-y-3">
            {pagina.visibles.map((j) => {
              const resuelto = desgloses.get(j.id);
              return (
                <li
                  key={j.id}
                  className={`flex flex-wrap items-start gap-4 rounded-tarjeta bg-blanco p-4 shadow-tarjeta ${
                    j.status === "pendiente" ? "ring-1 ring-azul-300" : ""
                  }`}
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="text-lg font-semibold tracking-titulo text-azul-950">
                        {j.empleadoNombre}
                      </h2>
                      <ChipEstado estado={j.status} />
                      {resuelto?.congelado && (
                        <Insignia className={CHIP_NEUTRO}>Cálculo congelado</Insignia>
                      )}
                    </div>

                    <p className="mt-1 text-sm text-acero-700">
                      {formatearFechaCorta(j.work_date)} ·{" "}
                      {rangoHorario(j.start_at, j.end_at)}
                      {resuelto && (
                        <>
                          {" "}
                          ·{" "}
                          <strong className="text-azul-950">
                            {formatearDuracion(resuelto.desglose.minutosTrabajados)}
                          </strong>
                          {resuelto.desglose.extras > 0 && (
                            <>
                              {" "}
                              ({formatearDuracion(resuelto.desglose.extras)} extra)
                            </>
                          )}
                        </>
                      )}
                      {j.work_order && <> · Orden {j.work_order}</>}
                    </p>

                    <p className="mt-1 line-clamp-2 text-sm leading-relaxed text-acero-600">
                      {j.description}
                    </p>
                  </div>

                  <Link
                    prefetch={false}
                    href={`/admin/jornadas/${j.id}`}
                    className={`${botonPrimario} ${botonChico}`}
                  >
                    {j.status === "pendiente" ? "Revisar" : "Abrir ficha"}
                  </Link>
                </li>
              );
            })}
          </ul>

          <Paginacion
            pagina={pagina.pagina}
            total={pagina.total}
            hrefBase={base}
            ancla="lista-jornadas"
            etiqueta="Páginas de jornadas"
          />
        </>
      )}

      {/* ---------------- Horarios mensuales ---------------- */}
      <div className="mt-8 rounded-tarjeta bg-blanco p-5 shadow-tarjeta">
        <h2 className="text-xl font-semibold tracking-titulo text-azul-950">
          Horarios mensuales
        </h2>
        <p className="mt-1.5 max-w-2xl text-sm leading-relaxed text-acero-600">
          Qué días son hábiles cada mes y cuál es la jornada esperada. Es lo que
          permite saber qué parte de un turno es hora extra: sin el horario del
          mes, el cálculo no tiene contra qué comparar.
        </p>
        <Link
          prefetch={false}
          href="/admin/jornadas/horarios"
          className={`${botonSecundario} mt-4`}
        >
          <IconoCalendario className="h-4 w-4" />
          Administrar horarios
        </Link>
      </div>
    </>
  );
}
