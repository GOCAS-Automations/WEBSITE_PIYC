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
 *   · **UTF-8 con BOM, y SIN la línea `sep=;`** — sin el BOM, Excel en
 *     Windows lee el archivo como ANSI y las tildes y las eñes salen rotas;
 *     con `sep=` delante, el BOM deja de servir. Las dos cosas juntas no
 *     funcionan, y era justo la causa de las tildes rotas (ver abajo).
 *   · **Separador `;`** — en la configuración regional de Colombia la coma es
 *     el separador decimal, así que el separador de listas es el punto y coma.
 *     Excel lo toma de la configuración regional de Windows, no del archivo.
 *   · **Coma decimal** — `8,5` y no `8.5`, para que Excel lo tome como número.
 *   · **Saltos de línea CRLF**, que es lo que espera Excel.
 *
 * POR QUÉ SE QUITÓ `sep=;` (las tildes rotas, reportado en sept-2026)
 * ---------------------------------------------------------------------
 * El archivo salía bien formado —UTF-8 de verdad, con el BOM al principio— y
 * aun así Excel mostraba «Salió» como «SaliÃ³» y «Diseño» como «DiseÃ±o». El
 * culpable no era la codificación del archivo sino la línea `sep=;`:
 *
 *   cuando Excel encuentra `sep=` en la primera línea de un .csv abierto con
 *   doble clic, entra por la ruta de importación «con directiva de separador»,
 *   y en esa ruta **descarta el BOM**: relee el archivo con la página de
 *   códigos ANSI del sistema (Windows-1252 en un Windows en español). Cada
 *   byte de un par UTF-8 se pinta entonces como un carácter suelto, y de ahí
 *   el «Ã³», el «Ã±» y el «Â».
 *
 * O sea: en Excel, BOM y `sep=` son excluyentes. Hay que elegir uno.
 *
 * SE ELIGIÓ EL BOM, porque lo que se rompe sin él —tildes y eñes— está en los
 * nombres de las personas, en la labor realizada y en las notas de revisión,
 * es decir en casi todas las celdas con texto; mientras que lo único que
 * aportaba `sep=` —decirle a Excel que el separador es `;`— ya lo resuelve la
 * configuración regional: en es-CO (y en es-ES) el separador de listas de
 * Windows **es** el punto y coma, así que Excel parte las columnas bien por su
 * cuenta. Solo un Windows configurado en inglés abriría el archivo en una sola
 * columna, y ahí el remedio es Datos → Texto en columnas, no romperle las
 * tildes a todos los demás.
 *
 * El BOM tiene que ser el primer carácter del cuerpo, sin nada delante: si lo
 * precediera cualquier otra cosa, Excel tampoco lo reconocería.
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

  // OJO: la primera línea es la CABECERA, no `sep=;`. Volver a meter esa
  // directiva rompe las tildes en Excel (ver la nota del encabezado).
  const lineas: string[] = [fila(columnas.map((c) => celda(c)))];

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
