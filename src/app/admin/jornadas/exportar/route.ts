/**
 * EXPORTACIÓN DE JORNADAS A CSV
 * =============================
 * `GET /admin/jornadas/exportar?…` con **los mismos parámetros del listado**:
 * el archivo contiene exactamente lo que la persona tiene en pantalla, ni una
 * fila más. Por eso los filtros viven en la URL.
 *
 * PROTEGIDO POR ROL: es un route handler, así que no lo cubre el layout de
 * `/admin`. Exige manager aquí mismo y responde 403 si no lo es; una
 * redirección no serviría, porque quien lo pide es una descarga.
 *
 * FORMATO, PENSADO PARA QUE EXCEL EN ESPAÑOL LO ABRA BIEN
 * -------------------------------------------------------
 *   · **UTF-8 con BOM** — sin el BOM, Excel en Windows lee el archivo como
 *     ANSI y las tildes y las eñes salen rotas.
 *   · **Separador `;`** — en la configuración regional de Colombia la coma es
 *     el separador decimal, así que el separador de listas es el punto y coma.
 *     Se declara además con la línea `sep=;` de la primera fila.
 *   · **Coma decimal** — `8,5` y no `8.5`, para que Excel lo tome como número.
 *   · **Saltos de línea CRLF**, que es lo que espera Excel.
 *
 * INYECCIÓN DE FÓRMULAS: una celda que empiece por `=`, `+`, `-` o `@` la
 * ejecuta Excel al abrir el archivo. Como el texto lo escribe cualquiera desde
 * el portal (una descripción que empiece por «=» basta), esas celdas se
 * neutralizan con una comilla simple delante. No es teórico: es la vía clásica
 * para convertir un informe en un ataque.
 */

import { getManagerOrNull } from "@/lib/supabase/auth";
import {
  getContextoJornadas,
  listJornadasFiltradas,
  resolverDesgloses,
  totalesDeJornadas,
} from "@/lib/jornadas-lecturas";
import {
  CATEGORIAS_DESGLOSE,
  ETIQUETA_CATEGORIA,
  fechaColombia,
  formatearFechaNumerica,
  horaColombia,
  horasDecimales,
  hoyEnColombia,
} from "@/lib/jornada";
import { ETIQUETA_ESTADO, leerFiltros } from "@/lib/jornada-types";

export const dynamic = "force-dynamic";

const SEPARADOR = ";";
const SALTO = "\r\n";
const BOM = "﻿";

/** Caracteres con los que Excel empieza a interpretar una celda como fórmula. */
const ARRANQUE_PELIGROSO = /^[=+\-@\t\r]/;

/** Una celda de texto: neutraliza fórmulas, escapa comillas y quita saltos. */
function celda(valor: string | null | undefined): string {
  let texto = (valor ?? "").replace(/[\r\n]+/g, " ").trim();
  if (ARRANQUE_PELIGROSO.test(texto)) texto = `'${texto}`;
  return `"${texto.replace(/"/g, '""')}"`;
}

/** Una celda numérica en horas, con coma decimal. */
function celdaHoras(minutos: number): string {
  return String(horasDecimales(minutos)).replace(".", ",");
}

/** Una celda numérica cualquiera, con coma decimal. */
function celdaNumero(n: number): string {
  return String(Math.round(n * 100) / 100).replace(".", ",");
}

function fila(celdas: readonly string[]): string {
  return celdas.join(SEPARADOR);
}

export async function GET(request: Request): Promise<Response> {
  const session = await getManagerOrNull();
  if (!session) {
    return new Response(
      "No tienes permiso para exportar las jornadas. Vuelve a ingresar con una cuenta de administrador o coordinador.",
      { status: 403, headers: { "Content-Type": "text/plain; charset=utf-8" } },
    );
  }

  const url = new URL(request.url);
  const filtros = leerFiltros(Object.fromEntries(url.searchParams.entries()));

  const [{ config, horarios }, jornadas] = await Promise.all([
    getContextoJornadas(),
    listJornadasFiltradas(filtros),
  ]);

  const desgloses = resolverDesgloses(jornadas, config, horarios);
  const totales = totalesDeJornadas(jornadas, desgloses);

  /* ---------------- Cabecera ---------------- */
  const columnas = [
    "Fecha",
    "Persona",
    "Cargo",
    "Estado",
    "Orden de trabajo",
    "Entrada",
    "Salida",
    "Terminó al día siguiente",
    "Presencia (h)",
    "Almuerzo (h)",
    "Trabajadas (h)",
    ...CATEGORIAS_DESGLOSE.map((c) => `${ETIQUETA_CATEGORIA[c]} (h)`),
    "Total ordinarias (h)",
    "Total extra (h)",
    "Nocturnas (h)",
    "Dominicales/festivas (h)",
    "Horas equivalentes con recargo",
    "Festivos del turno",
    "Cálculo",
    "Revisada por",
    "Fecha de revisión",
    "Labor realizada",
    "Observaciones",
    "Nota de revisión",
  ];

  const lineas: string[] = [
    // Le dice a Excel cuál es el separador antes de leer la cabecera.
    "sep=;",
    fila(columnas.map((c) => celda(c))),
  ];

  /* ---------------- Una fila por jornada ---------------- */
  for (const j of jornadas) {
    const resuelto = desgloses.get(j.id);
    const d = resuelto?.desglose;
    if (!d) continue;

    lineas.push(
      fila([
        celda(formatearFechaNumerica(j.work_date)),
        celda(j.empleadoNombre),
        celda(j.empleadoCargo),
        celda(ETIQUETA_ESTADO[j.status]),
        celda(j.work_order),
        celda(horaColombia(j.start_at)),
        celda(horaColombia(j.end_at)),
        celda(d.cruzaMedianoche ? "Sí" : "No"),
        celdaHoras(d.totalMinutos),
        celdaHoras(d.almuerzoMinutos),
        celdaHoras(d.minutosTrabajados),
        ...CATEGORIAS_DESGLOSE.map((c) => celdaHoras(d[c])),
        celdaHoras(d.ordinarias),
        celdaHoras(d.extras),
        celdaHoras(d.minutosNocturnos),
        celdaHoras(d.minutosDominicales),
        celdaNumero(d.horasEquivalentes),
        celda(d.festivos.join(" / ")),
        celda(resuelto.congelado ? "Congelado al aprobar" : "En vivo"),
        celda(j.revisorNombre),
        celda(j.reviewed_at ? formatearFechaNumerica(fechaColombia(j.reviewed_at)) : ""),
        celda(j.description),
        celda(j.observations),
        celda(j.review_note),
      ]),
    );
  }

  /* ---------------- Fila de totales ---------------- */
  if (totales.jornadas > 0) {
    const vacias = (n: number) => Array.from({ length: n }, () => celda(""));
    lineas.push(
      fila([
        celda(`TOTALES (${totales.jornadas})`),
        ...vacias(7), // Persona … Terminó al día siguiente
        celdaHoras(totales.totalMinutos),
        celdaHoras(totales.almuerzoMinutos),
        celdaHoras(totales.minutosTrabajados),
        ...CATEGORIAS_DESGLOSE.map((c) => celdaHoras(totales[c])),
        celdaHoras(totales.ordinarias),
        celdaHoras(totales.extras),
        celdaHoras(totales.minutosNocturnos),
        celdaHoras(totales.minutosDominicales),
        celdaNumero(totales.horasEquivalentes),
        ...vacias(7), // Festivos … Nota de revisión
      ]),
    );
  }

  const cuerpo = BOM + lineas.join(SALTO) + SALTO;
  const nombre = `jornadas-piyc-${hoyEnColombia()}.csv`;

  return new Response(cuerpo, {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${nombre}"`,
      // Un informe con datos de personas no se guarda en ninguna caché.
      "Cache-Control": "no-store, max-age=0",
    },
  });
}
