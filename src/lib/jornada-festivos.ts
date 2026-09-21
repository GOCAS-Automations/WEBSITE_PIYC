/**
 * FESTIVOS DE COLOMBIA Y RECARGO DOMINICAL — módulo PURO
 * ======================================================
 * Sin importaciones de ningún tipo: lo usan por igual `src/lib/jornada.ts`, los
 * Server Components del panel, los Client Components del portal y el runner de
 * pruebas de Node.
 *
 * Todo lo que depende de una fecha la recibe como `YYYY-MM-DD` en hora de
 * **Colombia** (quien llama la saca de `hoyEnColombia()` o de la fecha real de
 * cada minuto trabajado), nunca de `new Date()`: el servidor de Vercel corre en
 * UTC y un festivo leído con la fecha del servidor se corre un día.
 *
 * LOS FESTIVOS SE CALCULAN, NO SE ESCRIBEN A MANO
 * ----------------------------------------------
 * Una tabla escrita a mano caduca: funciona un año y al siguiente el sistema
 * deja de reconocer los festivos en silencio, y un domingo o un festivo no
 * reconocido es plata que no se le paga a alguien. Aquí se generan para
 * cualquier año a partir de tres reglas:
 *
 *   · **Fijos** — no se mueven aunque caigan en fin de semana: 1-ene, 1-may,
 *     20-jul, 7-ago, 8-dic y 25-dic.
 *   · **Trasladables** (Ley 51 de 1983, «Ley Emiliani») — si no caen en lunes,
 *     se corren al lunes siguiente: 6-ene, 19-mar, 29-jun, 15-ago, 12-oct,
 *     1-nov y 11-nov; y **desde 2026** el 9 de julio (Nuestra Señora del Rosario
 *     de Chiquinquirá, Ley 2578 de 2026, art. 6).
 *   · **De la Pascua** — Jueves Santo (P−3) y Viernes Santo (P−2) en su día, y
 *     Ascensión (P+43), Corpus Christi (P+64) y Sagrado Corazón (P+71) ya
 *     trasladados al lunes por la misma Ley Emiliani. La Pascua sale del
 *     algoritmo gregoriano de Meeus/Jones/Butcher.
 *
 * FUENTES (revisadas el 20-sep-2026)
 * ----------------------------------
 *   · Festivos — Ley 51 de 1983 y Ley 2578 de 2026, art. 6.
 *   · Recargo dominical y festivo — art. 179 del CST, modificado por el art. 14
 *     de la Ley 2466 de 2025 (calendario gradual del parágrafo transitorio).
 *   · La franja nocturna (7:00 p. m. – 6:00 a. m., art. 160 CST modificado por
 *     el art. 10 de la Ley 2466 de 2025) NO vive aquí: es un parámetro editable
 *     de `site_settings.jornada_config`.
 *
 * ALCANCE: este módulo reparte HORAS, nunca pesos. En PIYC no hay nómina, ni
 * valor hora, ni liquidación: eso está explícitamente fuera del alcance.
 */

/* ------------------------------------------------------------------ */
/* Recargo dominical y festivo                                         */
/* ------------------------------------------------------------------ */

/**
 * Recargo dominical y festivo por fecha (art. 179 CST, mod. Ley 2466 de 2025).
 * Es un FACTOR sobre la hora ordinaria, no un valor en dinero: sirve para
 * expresar la jornada en «horas equivalentes».
 */
export const CALENDARIO_RECARGO_DOMINICAL = [
  { desde: "0000-01-01", recargo: 0.75 },
  { desde: "2025-07-01", recargo: 0.8 },
  { desde: "2026-07-01", recargo: 0.9 },
  { desde: "2027-07-01", recargo: 1.0 },
] as const;

/**
 * Recargo dominical/festivo vigente en una fecha `YYYY-MM-DD`:
 * 0,75 → 0,80 (1-jul-2025) → 0,90 (1-jul-2026) → 1,00 (1-jul-2027).
 *
 * Una fecha ilegible devuelve el tramo más reciente (el más alto): ante la duda,
 * nunca por debajo de lo que exige la ley.
 */
export function recargoDominicalVigente(fecha: string): number {
  const ultimo =
    CALENDARIO_RECARGO_DOMINICAL[CALENDARIO_RECARGO_DOMINICAL.length - 1].recargo;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(fecha)) return ultimo;

  let vigente: number = CALENDARIO_RECARGO_DOMINICAL[0].recargo;
  for (const tramo of CALENDARIO_RECARGO_DOMINICAL) {
    if (fecha >= tramo.desde) vigente = tramo.recargo;
  }
  return vigente;
}

/* ------------------------------------------------------------------ */
/* Festivos, para cualquier año                                        */
/* ------------------------------------------------------------------ */

const iso = (d: Date): string => d.toISOString().slice(0, 10);
const utc = (y: number, m: number, d: number): Date => new Date(Date.UTC(y, m - 1, d));
const masDias = (d: Date, n: number): Date => new Date(d.getTime() + n * 86_400_000);

/** El mismo día si ya es lunes; si no, el lunes siguiente (Ley Emiliani). */
function lunesSiguiente(d: Date): Date {
  const diaSemana = d.getUTCDay();
  return diaSemana === 1 ? d : masDias(d, (8 - diaSemana) % 7);
}

/**
 * Domingo de Pascua de un año (algoritmo gregoriano anónimo, en la formulación
 * de Meeus/Jones/Butcher). De él salen los cinco festivos móviles.
 */
export function domingoDePascua(anio: number): string {
  const y = anio;
  const a = y % 19;
  const b = Math.floor(y / 100);
  const c = y % 100;
  const d = Math.floor(b / 4);
  const e = b % 4;
  const f = Math.floor((b + 8) / 25);
  const g = Math.floor((b - f + 1) / 3);
  const h = (19 * a + b - d - g + 15) % 30;
  const i = Math.floor(c / 4);
  const k = c % 4;
  const l = (32 + 2 * e + 2 * i - h - k) % 7;
  const m = Math.floor((a + 11 * h + 22 * l) / 451);
  const mes = Math.floor((h + l - 7 * m + 114) / 31);
  const dia = ((h + l - 7 * m + 114) % 31) + 1;
  return iso(utc(y, mes, dia));
}

const cacheFestivos = new Map<number, Readonly<Record<string, string>>>();

/**
 * Festivos nacionales de un año, `{ "YYYY-MM-DD": nombre }`, en orden de fecha.
 *
 * Dos festivos pueden caer el MISMO lunes (en 2025, Sagrado Corazón y San Pedro
 * el 30 de junio): el día festivo es uno solo y se nombran los dos.
 *
 * Memoizado por año: `calcularJornada` consulta la fecha de cada minuto.
 */
export function festivosDelAnio(anio: number): Readonly<Record<string, string>> {
  // Antes de 1984 no rige la Ley Emiliani y después de 2200 no hay nada que
  // calcular: en ambos casos, ningún festivo (y nunca una excepción).
  if (!Number.isInteger(anio) || anio < 1984 || anio > 2200) return {};

  const guardado = cacheFestivos.get(anio);
  if (guardado) return guardado;

  const y = anio;
  const pascua = new Date(`${domingoDePascua(y)}T00:00:00.000Z`);
  const mapa: Record<string, string> = {};

  const poner = (d: Date, nombre: string) => {
    const clave = iso(d);
    mapa[clave] = mapa[clave] ? `${mapa[clave]} / ${nombre}` : nombre;
  };

  poner(utc(y, 1, 1), "Año Nuevo");
  poner(lunesSiguiente(utc(y, 1, 6)), "Día de los Reyes Magos");
  poner(lunesSiguiente(utc(y, 3, 19)), "Día de San José");
  poner(masDias(pascua, -3), "Jueves Santo");
  poner(masDias(pascua, -2), "Viernes Santo");
  poner(utc(y, 5, 1), "Día del Trabajo");
  poner(masDias(pascua, 43), "Ascensión del Señor");
  poner(masDias(pascua, 64), "Corpus Christi");
  poner(masDias(pascua, 71), "Sagrado Corazón de Jesús");
  poner(lunesSiguiente(utc(y, 6, 29)), "San Pedro y San Pablo");
  // Ley 2578 de 2026, art. 6: festivo nacional desde 2026, trasladable.
  if (y >= 2026) {
    poner(
      lunesSiguiente(utc(y, 7, 9)),
      "Nuestra Señora del Rosario de Chiquinquirá",
    );
  }
  poner(utc(y, 7, 20), "Día de la Independencia");
  poner(utc(y, 8, 7), "Batalla de Boyacá");
  poner(lunesSiguiente(utc(y, 8, 15)), "Asunción de la Virgen");
  poner(lunesSiguiente(utc(y, 10, 12)), "Día de la Raza");
  poner(lunesSiguiente(utc(y, 11, 1)), "Día de Todos los Santos");
  poner(lunesSiguiente(utc(y, 11, 11)), "Independencia de Cartagena");
  poner(utc(y, 12, 8), "Día de la Inmaculada Concepción");
  poner(utc(y, 12, 25), "Navidad");

  const ordenado = Object.freeze(
    Object.fromEntries(Object.entries(mapa).sort(([a], [b]) => a.localeCompare(b))),
  );
  cacheFestivos.set(anio, ordenado);
  return ordenado;
}

/** Nombre del festivo si la fecha `YYYY-MM-DD` lo es; si no, `null`. */
export function festivoDeFecha(fecha: string): string | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(fecha)) return null;
  return festivosDelAnio(Number(fecha.slice(0, 4)))[fecha] ?? null;
}

/**
 * Festivos de un mes concreto, en orden. Lo usa el editor de horarios para
 * señalarlos: un festivo en medio del mes explica por qué esa semana cuadra
 * distinto.
 */
export function festivosDelMes(
  anio: number,
  mes: number,
): { fecha: string; nombre: string; dia: number }[] {
  if (!Number.isInteger(mes) || mes < 1 || mes > 12) return [];
  const prefijo = `${anio}-${String(mes).padStart(2, "0")}-`;
  return Object.entries(festivosDelAnio(anio))
    .filter(([fecha]) => fecha.startsWith(prefijo))
    .map(([fecha, nombre]) => ({ fecha, nombre, dia: Number(fecha.slice(8, 10)) }));
}
