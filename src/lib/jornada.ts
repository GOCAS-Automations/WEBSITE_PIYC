/**
 * CÁLCULO DE JORNADAS Y HORAS EXTRA — módulo PURO
 * ===============================================
 * Solo depende de `src/lib/horarios.ts` y `src/lib/jornada-festivos.ts`, que
 * también lo son. Lo usan por igual el portal del empleado (vista previa en
 * vivo, en el navegador), las server actions del panel y el CSV.
 *
 * ESTE MÓDULO REPARTE HORAS, NO PESOS
 * -----------------------------------
 * Clasifica cada minuto trabajado en una de ocho categorías (ordinaria u hora
 * extra × diurna o nocturna × día común o dominical/festivo). PIYC no tiene
 * nómina, ni valor hora, ni liquidación en dinero: está explícitamente fuera de
 * alcance. Los «recargos» de aquí son factores para expresar el turno en horas
 * equivalentes, nada más.
 *
 * ZONA HORARIA — `America/Bogotá`, SIEMPRE EXPLÍCITA
 * -------------------------------------------------
 * Colombia es UTC−5 todo el año (no hay horario de verano). Todo el cálculo
 * trabaja con la hora de pared colombiana, sin leer nunca la zona horaria de la
 * máquina: el servidor de Vercel corre en UTC y, sin esto, un turno que empieza
 * a las 8:00 p. m. se contaría al día siguiente y un festivo se correría un día.
 *
 * QUÉ CUENTA COMO JORNADA ORDINARIA
 * ---------------------------------
 * La jornada ordinaria sale del **horario del mes** (`horarios_mensuales`, ver
 * `src/lib/horarios.ts`), no de un número fijo: para la fecha trabajada se busca
 * el horario de ese año/mes, se toma el día de la semana y la jornada ordinaria
 * neta es `(fin − inicio) − almuerzo`. Lo que exceda es hora extra. Si el mes no
 * está cargado se usa el horario semanal de `jornada_config`, así que el cálculo
 * nunca depende de que la base responda.
 *
 * QUÉ ES PARÁMETRO Y QUÉ ES LEY
 * -----------------------------
 *   · **Parámetros** (editables en `site_settings.jornada_config`): franja
 *     nocturna, horario semanal por defecto, topes de horas extra y los factores
 *     de recargo nocturno y de hora extra.
 *   · **Ley por fecha**: los festivos y el recargo dominical/festivo, que sube
 *     por tramos con la Ley 2466 de 2025. Salen de `jornada-festivos.ts` con la
 *     fecha de cada minuto; los tres campos dominicales de `jornada_config` son
 *     legado y el cálculo los ignora (el contexto congelado guarda el que de
 *     verdad se aplicó).
 */

import {
  claveDiaSemana,
  diaSemanaDeFecha,
  etiquetaMes,
  horarioDeFecha,
  horarioPredeterminado,
  mesDeFecha,
  minutosAlmuerzoDia,
  minutosDesdeHora,
  minutosJornadaDia,
  normalizarHorarioDias,
  resumenHorario,
  type HorarioDia,
  type HorarioDias,
  type MapaHorarios,
} from "@/lib/horarios";
import { festivoDeFecha, recargoDominicalVigente } from "@/lib/jornada-festivos";

/* ------------------------------------------------------------------ */
/* Configuración                                                       */
/* ------------------------------------------------------------------ */

export interface JornadaRecargos {
  /** Hora extra diurna, sobre la hora ordinaria (art. 168 CST: 25 %). */
  extraDiurna: number;
  /** Hora extra nocturna (art. 168 CST: 75 %). */
  extraNocturna: number;
  /** Recargo por trabajo nocturno en horas NO extra (art. 168 CST: 35 %). */
  nocturno: number;
  /**
   * LEGADO. El recargo dominical/festivo lo fija la ley por fecha
   * (`recargoDominicalVigente`); estos tres campos se siguen leyendo de
   * `jornada_config` para no romper nada, pero el cálculo los ignora.
   */
  dominicalFestivo: number;
  extraDominicalDiurna: number;
  extraDominicalNocturna: number;
}

export interface JornadaConfig {
  /**
   * Horario base de oficina — LEGADO, solo informativo. La jornada ordinaria
   * real sale de `horarios_mensuales`.
   */
  jornadaOrdinariaInicio: string;
  jornadaOrdinariaFin: string;
  /** Horas ordinarias por día — LEGADO, no se usa para clasificar el turno. */
  horasOrdinariasDia: number;
  /**
   * Horario semanal POR DEFECTO: siembra los meses nuevos en
   * `/admin/jornadas/horarios` y es la red de seguridad cuando la base no tiene
   * el mes cargado.
   */
  horarioSemanal: HorarioDias;
  /** Franja nocturna; cruza la medianoche (hoy 19:00 → 06:00). */
  inicioNocturno: string;
  finNocturno: string;
  /** Tope de horas extra al día antes de encender el aviso. Solo avisa. */
  limiteExtrasDia: number;
  /** Tope de horas extra a la semana antes de encender el aviso. Solo avisa. */
  limiteExtrasSemana: number;
  recargos: JornadaRecargos;
}

/**
 * Valores por defecto, iguales a la semilla de la migración 0002:
 *
 *   · Franja nocturna desde las **7:00 p. m.** (art. 160 CST, modificado por el
 *     art. 10 de la Ley 2466 de 2025, vigente desde el 25-dic-2025; antes era
 *     desde las 9:00 p. m. por la Ley 1846 de 2017).
 *   · Recargos de hora extra y nocturno del art. 168 del CST, que no se
 *     acumulan entre sí.
 *   · Topes de horas extra (2 h al día, 12 h a la semana) del art. 22 de la Ley
 *     50 de 1990, mod. art. 13 de la Ley 2466: el panel **solo avisa**, nunca
 *     recorta; lo trabajado siempre se registra.
 *
 * El horario semanal es **punto de partida pendiente de confirmar con PIYC**.
 */
export const jornadaConfigDefaults: JornadaConfig = {
  jornadaOrdinariaInicio: "08:00",
  jornadaOrdinariaFin: "17:30",
  horasOrdinariasDia: 8.5,
  horarioSemanal: horarioPredeterminado,
  inicioNocturno: "19:00",
  finNocturno: "06:00",
  limiteExtrasDia: 2,
  limiteExtrasSemana: 12,
  recargos: {
    extraDiurna: 0.25,
    extraNocturna: 0.75,
    nocturno: 0.35,
    // Legado: el cálculo usa el recargo dominical de la ley por fecha.
    dominicalFestivo: 0.9,
    extraDominicalDiurna: 1.15,
    extraDominicalNocturna: 1.65,
  },
};

/* ------------------------------------------------------------------ */
/* Zona horaria de Colombia                                            */
/* ------------------------------------------------------------------ */

/** Colombia es UTC−5 todo el año. */
export const COLOMBIA_UTC_OFFSET = "-05:00";
export const ZONA_HORARIA_COLOMBIA = "America/Bogota";
const OFFSET_MINUTOS = -5 * 60;

interface PartesLocales {
  /** `YYYY-MM-DD` en hora de Colombia. */
  fecha: string;
  /** Minutos transcurridos del día local, 0..1439. */
  minutosDelDia: number;
  /** 0 = domingo. */
  diaSemana: number;
}

function dosDigitos(n: number): string {
  return n < 10 ? `0${n}` : String(n);
}

/** Descompone un instante en su hora de pared colombiana. */
function partesLocales(instante: Date): PartesLocales {
  const desplazado = new Date(instante.getTime() + OFFSET_MINUTOS * 60_000);
  return {
    fecha: `${desplazado.getUTCFullYear()}-${dosDigitos(
      desplazado.getUTCMonth() + 1,
    )}-${dosDigitos(desplazado.getUTCDate())}`,
    minutosDelDia: desplazado.getUTCHours() * 60 + desplazado.getUTCMinutes(),
    diaSemana: desplazado.getUTCDay(),
  };
}

/**
 * Instante exacto (ISO 8601) a partir de una fecha `YYYY-MM-DD`, una hora
 * `HH:MM` y, opcionalmente, un desplazamiento de días. Es lo que se guarda en
 * `start_at` / `end_at`: quedan anclados a la hora real de Colombia.
 */
export function instanteColombia(
  fecha: string,
  hora: string,
  masDias = 0,
): string | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(fecha)) return null;
  if (!/^\d{1,2}:\d{2}$/.test(hora)) return null;

  const base = new Date(`${fecha}T${hora.padStart(5, "0")}:00.000${COLOMBIA_UTC_OFFSET}`);
  if (Number.isNaN(base.getTime())) return null;

  return new Date(base.getTime() + masDias * 86_400_000).toISOString();
}

/** Fecha de hoy en Colombia, `YYYY-MM-DD`. */
export function hoyEnColombia(ahora: Date = new Date()): string {
  return partesLocales(ahora).fecha;
}

/** Hora local colombiana de un instante, `HH:MM`. */
export function horaColombia(instante: Date | string): string {
  const fecha = typeof instante === "string" ? new Date(instante) : instante;
  if (Number.isNaN(fecha.getTime())) return "--:--";
  const { minutosDelDia } = partesLocales(fecha);
  return `${dosDigitos(Math.floor(minutosDelDia / 60))}:${dosDigitos(minutosDelDia % 60)}`;
}

/** Fecha local colombiana de un instante, `YYYY-MM-DD`. */
export function fechaColombia(instante: Date | string): string {
  const fecha = typeof instante === "string" ? new Date(instante) : instante;
  if (Number.isNaN(fecha.getTime())) return "";
  return partesLocales(fecha).fecha;
}

/** Nombre del festivo si la fecha `YYYY-MM-DD` lo es; si no, `null`. */
export function nombreFestivo(fecha: string): string | null {
  return festivoDeFecha(fecha);
}

/* ------------------------------------------------------------------ */
/* Desglose de una jornada                                             */
/* ------------------------------------------------------------------ */

export interface DesgloseJornada {
  /** false cuando los datos no permiten calcular (fechas inválidas, etc.). */
  valido: boolean;
  /** Mensaje para mostrarle a la persona cuando `valido` es false. */
  error?: string;

  /** Duración del turno de punta a punta, en minutos. */
  totalMinutos: number;
  /** Minutos de almuerzo descontados: NO cuentan como trabajo. */
  almuerzoMinutos: number;
  /** `totalMinutos − almuerzoMinutos`. */
  minutosTrabajados: number;
  /** Jornada ordinaria neta del día según el horario del mes, en minutos. */
  jornadaOrdinariaMinutos: number;
  /** false = el día no es laboral en el horario del mes, o es festivo. */
  diaLaboral: boolean;

  /* Minutos por categoría — las ocho combinaciones posibles. */
  ordinariaDiurna: number;
  ordinariaNocturna: number;
  extraDiurna: number;
  extraNocturna: number;
  dominicalDiurna: number;
  dominicalNocturna: number;
  extraDominicalDiurna: number;
  extraDominicalNocturna: number;

  /* Agregados para la interfaz. */
  /** Minutos dentro de la jornada ordinaria del día (incluidos los dominicales). */
  ordinarias: number;
  /** Minutos que superan la jornada ordinaria (horas extra). */
  extras: number;
  /** Minutos trabajados dentro de la franja nocturna. */
  minutosNocturnos: number;
  /** Minutos trabajados en domingo, festivo o día no laboral. */
  minutosDominicales: number;

  /** true si alguna parte del turno cayó en domingo, festivo o día no laboral. */
  esDominicalFestivo: boolean;
  /** Nombres de los festivos que toca el turno (puede estar vacío). */
  festivos: string[];
  /** true si el turno terminó en un día distinto al que empezó. */
  cruzaMedianoche: boolean;

  /**
   * El turno expresado en **horas ordinarias equivalentes** aplicando los
   * recargos. Es una referencia de magnitud, NO un valor en dinero: en PIYC no
   * hay nómina.
   */
  horasEquivalentes: number;
}

function desgloseVacio(error?: string): DesgloseJornada {
  return {
    valido: error === undefined,
    error,
    totalMinutos: 0,
    almuerzoMinutos: 0,
    minutosTrabajados: 0,
    jornadaOrdinariaMinutos: 0,
    diaLaboral: true,
    ordinariaDiurna: 0,
    ordinariaNocturna: 0,
    extraDiurna: 0,
    extraNocturna: 0,
    dominicalDiurna: 0,
    dominicalNocturna: 0,
    extraDominicalDiurna: 0,
    extraDominicalNocturna: 0,
    ordinarias: 0,
    extras: 0,
    minutosNocturnos: 0,
    minutosDominicales: 0,
    esDominicalFestivo: false,
    festivos: [],
    cruzaMedianoche: false,
    horasEquivalentes: 0,
  };
}

function minutosDeHora(hora: string, porDefecto: number): number {
  return minutosDesdeHora(hora) ?? porDefecto;
}

/** Duración máxima admitida para un turno: la misma que exige la base (24 h). */
export const MAX_MINUTOS_TURNO = 24 * 60;

/**
 * REGLA DEL ALMUERZO — **pendiente de confirmar con PIYC**.
 *
 * El horario del mes dice cuántas horas de almuerzo tiene cada día laboral,
 * pero la persona solo registra su entrada y su salida. Para saber si dentro de
 * ese rango hubo almuerzo se aplica una regla pragmática:
 *
 *   · En un día LABORAL, si el turno dura más de 6 horas se descuenta el
 *     almuerzo del día (normalmente 1 hora).
 *   · En turnos de 6 horas o menos NO se descuenta nada.
 *   · En días NO laborales (sábado, domingo o festivo) tampoco: todo el tiempo
 *     es trabajo con recargo.
 *
 * El almuerzo se ubica en el centro del tramo ordinario, que es lo que ocurre en
 * la práctica (entrando a las 8:00 a. m. cae alrededor del mediodía). Eso solo
 * afecta a la clasificación diurna/nocturna de esos minutos, no a su cantidad.
 */
export const UMBRAL_ALMUERZO_MINUTOS = 6 * 60;

/**
 * Calcula el desglose de una jornada minuto a minuto.
 *
 * @param startAt   Instante de inicio (Date o ISO).
 * @param endAt     Instante de fin (Date o ISO). Puede caer en el día siguiente.
 * @param workDate  Día laboral `YYYY-MM-DD` al que se imputa la jornada.
 * @param config    Parámetros de cálculo (`jornada_config`).
 * @param horarios  Horarios mensuales indexados por `"YYYY-MM"`. Si falta el
 *                  mes se usa el horario semanal de `config`.
 */
export function calcularJornada(
  startAt: Date | string,
  endAt: Date | string,
  workDate: string,
  config: JornadaConfig = jornadaConfigDefaults,
  horarios?: MapaHorarios | null,
): DesgloseJornada {
  const inicio = typeof startAt === "string" ? new Date(startAt) : startAt;
  const fin = typeof endAt === "string" ? new Date(endAt) : endAt;

  if (Number.isNaN(inicio.getTime()) || Number.isNaN(fin.getTime())) {
    return desgloseVacio("Las horas de inicio y fin no son válidas.");
  }

  const totalMinutos = Math.round((fin.getTime() - inicio.getTime()) / 60_000);

  if (totalMinutos <= 0) {
    return desgloseVacio(
      "La hora de finalización debe ser posterior a la de inicio. Si el turno terminó después de medianoche, marca la casilla «terminé al día siguiente».",
    );
  }
  if (totalMinutos > MAX_MINUTOS_TURNO) {
    return desgloseVacio(
      "Una jornada no puede durar más de 24 horas. Revisa las horas ingresadas.",
    );
  }

  const inicioNocturno = minutosDeHora(config.inicioNocturno, 19 * 60);
  const finNocturno = minutosDeHora(config.finNocturno, 6 * 60);

  // La franja normalmente cruza la medianoche (19:00 → 06:00), pero se soporta
  // también una franja «recta» por si alguna vez se configura así.
  const esNocturno = (minutosDelDia: number): boolean =>
    inicioNocturno > finNocturno
      ? minutosDelDia >= inicioNocturno || minutosDelDia < finNocturno
      : minutosDelDia >= inicioNocturno && minutosDelDia < finNocturno;

  /* ---- Horario del mes que rige cada fecha (con caché por día) ---- */
  const semanaPorDefecto = normalizarHorarioDias(
    config.horarioSemanal ?? horarioPredeterminado,
    horarioPredeterminado,
  );
  const cacheDias = new Map<string, HorarioDias>();
  const diasDe = (fecha: string): HorarioDias => {
    let dias = cacheDias.get(fecha);
    if (!dias) {
      dias = horarioDeFecha(fecha, horarios, semanaPorDefecto);
      cacheDias.set(fecha, dias);
    }
    return dias;
  };

  /* ---- Jornada ordinaria del día laboral imputado ----------------- */
  const fechaBase = /^\d{4}-\d{2}-\d{2}$/.test(workDate)
    ? workDate
    : partesLocales(inicio).fecha;

  const horarioBase = diasDe(fechaBase)[claveDiaSemana(diaSemanaDeFecha(fechaBase))];
  const festivoBase = nombreFestivo(fechaBase);

  // Día laboral = el horario del mes lo marca como laboral y no es festivo.
  // Sábado, domingo, festivo o día apagado en el horario → jornada ordinaria 0:
  // todo el turno es extra con tratamiento dominical/festivo.
  const diaLaboral = horarioBase !== null && festivoBase === null;
  const jornadaOrdinariaMinutos = diaLaboral ? minutosJornadaDia(horarioBase) : 0;

  const almuerzoMinutos =
    diaLaboral && totalMinutos > UMBRAL_ALMUERZO_MINUTOS
      ? Math.min(minutosAlmuerzoDia(horarioBase), totalMinutos)
      : 0;

  // Tramo ordinario medido en tiempo transcurrido desde la entrada: la jornada
  // neta más el almuerzo que ocurre dentro de ella. Con 8,5 h netas + 1 h de
  // almuerzo, para quien entró a las 8:00 a. m. el reloj de las extras empieza a
  // las 5:30 p. m., que es justo lo esperado.
  const limiteTranscurrido = Math.min(
    totalMinutos,
    jornadaOrdinariaMinutos + almuerzoMinutos,
  );

  // Ventana de almuerzo, centrada en ese tramo ordinario.
  const almuerzoDesde =
    almuerzoMinutos > 0
      ? Math.max(0, Math.round((limiteTranscurrido - almuerzoMinutos) / 2))
      : -1;
  const almuerzoHasta = almuerzoDesde + almuerzoMinutos;

  const resultado = desgloseVacio();
  resultado.valido = true;
  resultado.totalMinutos = totalMinutos;
  resultado.almuerzoMinutos = almuerzoMinutos;
  resultado.minutosTrabajados = totalMinutos - almuerzoMinutos;
  resultado.jornadaOrdinariaMinutos = jornadaOrdinariaMinutos;
  resultado.diaLaboral = diaLaboral;

  const festivos = new Set<string>();

  const r = { ...jornadaConfigDefaults.recargos, ...(config.recargos ?? {}) };
  const recargoDelDia = new Map<string, number>();
  let equivalente = 0;

  for (let i = 0; i < totalMinutos; i += 1) {
    // El almuerzo no es tiempo de trabajo: no entra en ninguna categoría.
    if (almuerzoMinutos > 0 && i >= almuerzoDesde && i < almuerzoHasta) continue;

    const instante = new Date(inicio.getTime() + i * 60_000);
    const { fecha, minutosDelDia, diaSemana } = partesLocales(instante);

    const festivo = nombreFestivo(fecha);
    if (festivo) festivos.add(festivo);

    // Se evalúa con la fecha REAL de cada minuto: un turno que cruza la
    // medianoche hacia un domingo o un festivo cambia de tratamiento a partir de
    // las 12:00 a. m.
    const noLaboral = diasDe(fecha)[claveDiaSemana(diaSemana)] === null;
    const dominical = diaSemana === 0 || festivo !== null || noLaboral;
    const nocturno = esNocturno(minutosDelDia);
    const extra = i >= limiteTranscurrido;

    if (dominical) {
      if (extra) {
        if (nocturno) resultado.extraDominicalNocturna += 1;
        else resultado.extraDominicalDiurna += 1;
      } else if (nocturno) {
        resultado.dominicalNocturna += 1;
      } else {
        resultado.dominicalDiurna += 1;
      }
    } else if (extra) {
      if (nocturno) resultado.extraNocturna += 1;
      else resultado.extraDiurna += 1;
    } else if (nocturno) {
      resultado.ordinariaNocturna += 1;
    } else {
      resultado.ordinariaDiurna += 1;
    }

    if (nocturno) resultado.minutosNocturnos += 1;
    if (dominical) resultado.minutosDominicales += 1;

    if (dominical) {
      let d = recargoDelDia.get(fecha);
      if (d === undefined) {
        d = recargoDominicalVigente(fecha);
        recargoDelDia.set(fecha, d);
      }
      equivalente += extra
        ? 1 + (nocturno ? r.extraNocturna : r.extraDiurna) + d
        : 1 + d + (nocturno ? r.nocturno : 0);
    } else if (extra) {
      equivalente += 1 + (nocturno ? r.extraNocturna : r.extraDiurna);
    } else {
      equivalente += nocturno ? 1 + r.nocturno : 1;
    }
  }

  resultado.ordinarias =
    resultado.ordinariaDiurna +
    resultado.ordinariaNocturna +
    resultado.dominicalDiurna +
    resultado.dominicalNocturna;

  resultado.extras =
    resultado.extraDiurna +
    resultado.extraNocturna +
    resultado.extraDominicalDiurna +
    resultado.extraDominicalNocturna;

  resultado.festivos = [...festivos];
  resultado.esDominicalFestivo = resultado.minutosDominicales > 0;
  // Se mira el último minuto trabajado (fin − 1): un turno que termina justo a
  // las 12:00 a. m. no «cruza» la medianoche.
  resultado.cruzaMedianoche =
    partesLocales(inicio).fecha !== partesLocales(new Date(fin.getTime() - 1)).fecha;

  resultado.horasEquivalentes = Math.round((equivalente / 60) * 100) / 100;

  return resultado;
}

/* ------------------------------------------------------------------ */
/* Sumas de varias jornadas                                            */
/* ------------------------------------------------------------------ */

/** Las categorías de minutos que se suman en los totales de un periodo. */
export const CATEGORIAS_DESGLOSE = [
  "ordinariaDiurna",
  "ordinariaNocturna",
  "extraDiurna",
  "extraNocturna",
  "dominicalDiurna",
  "dominicalNocturna",
  "extraDominicalDiurna",
  "extraDominicalNocturna",
] as const;

export type CategoriaDesglose = (typeof CATEGORIAS_DESGLOSE)[number];

export const ETIQUETA_CATEGORIA: Record<CategoriaDesglose, string> = {
  ordinariaDiurna: "Ordinaria diurna",
  ordinariaNocturna: "Ordinaria nocturna",
  extraDiurna: "Extra diurna",
  extraNocturna: "Extra nocturna",
  dominicalDiurna: "Dominical/festiva diurna",
  dominicalNocturna: "Dominical/festiva nocturna",
  extraDominicalDiurna: "Extra dominical/festiva diurna",
  extraDominicalNocturna: "Extra dominical/festiva nocturna",
};

export interface TotalesJornadas extends Record<CategoriaDesglose, number> {
  /** Cuántas jornadas se sumaron. */
  jornadas: number;
  totalMinutos: number;
  almuerzoMinutos: number;
  minutosTrabajados: number;
  ordinarias: number;
  extras: number;
  minutosNocturnos: number;
  minutosDominicales: number;
  horasEquivalentes: number;
}

export function totalesVacios(): TotalesJornadas {
  const base = {
    jornadas: 0,
    totalMinutos: 0,
    almuerzoMinutos: 0,
    minutosTrabajados: 0,
    ordinarias: 0,
    extras: 0,
    minutosNocturnos: 0,
    minutosDominicales: 0,
    horasEquivalentes: 0,
  } as TotalesJornadas;
  for (const clave of CATEGORIAS_DESGLOSE) base[clave] = 0;
  return base;
}

/** Suma los desgloses de varias jornadas. Es lo que se pinta como «totales». */
export function sumarDesgloses(
  desgloses: readonly DesgloseJornada[],
): TotalesJornadas {
  const total = totalesVacios();
  for (const d of desgloses) {
    if (!d.valido) continue;
    total.jornadas += 1;
    total.totalMinutos += d.totalMinutos;
    total.almuerzoMinutos += d.almuerzoMinutos;
    total.minutosTrabajados += d.minutosTrabajados;
    total.ordinarias += d.ordinarias;
    total.extras += d.extras;
    total.minutosNocturnos += d.minutosNocturnos;
    total.minutosDominicales += d.minutosDominicales;
    total.horasEquivalentes += d.horasEquivalentes;
    for (const clave of CATEGORIAS_DESGLOSE) total[clave] += d[clave];
  }
  total.horasEquivalentes = Math.round(total.horasEquivalentes * 100) / 100;
  return total;
}

/* ------------------------------------------------------------------ */
/* Formateo para la interfaz                                           */
/* ------------------------------------------------------------------ */

/** 510 → "8 h 30 min"; 480 → "8 h"; 45 → "45 min". */
export function formatearDuracion(minutos: number): string {
  if (!Number.isFinite(minutos) || minutos <= 0) return "0 min";
  const h = Math.floor(minutos / 60);
  const m = Math.round(minutos % 60);
  if (h === 0) return `${m} min`;
  if (m === 0) return `${h} h`;
  return `${h} h ${m} min`;
}

/** Versión compacta: 510 → "8h 30m". */
export function formatearHoras(minutos: number): string {
  if (!Number.isFinite(minutos) || minutos <= 0) return "0h";
  const total = Math.round(minutos);
  const h = Math.floor(total / 60);
  const m = total % 60;
  if (h === 0) return `${m}m`;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}m`;
}

/**
 * Minutos → horas decimales con coma, como las escribe Excel en español:
 * 510 → "8,5". Es el formato de las celdas numéricas del CSV.
 */
export function horasDecimales(minutos: number): number {
  if (!Number.isFinite(minutos) || minutos <= 0) return 0;
  return Math.round((minutos / 60) * 100) / 100;
}

/** "2026-07-27" → "27/07/2026". */
export function formatearFechaNumerica(fecha: string): string {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(fecha)) return fecha;
  const [y, m, d] = fecha.split("-");
  return `${d}/${m}/${y}`;
}

/** "2026-07-27" → "lunes, 27 de julio de 2026". */
export function formatearFechaLarga(fecha: string): string {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(fecha)) return fecha;
  const [y, m, d] = fecha.split("-").map(Number);
  const utc = new Date(Date.UTC(y, m - 1, d));
  return new Intl.DateTimeFormat("es-CO", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(utc);
}

/** "2026-07-27" → "27 jul 2026". */
export function formatearFechaCorta(fecha: string): string {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(fecha)) return fecha;
  const [y, m, d] = fecha.split("-").map(Number);
  const utc = new Date(Date.UTC(y, m - 1, d));
  return new Intl.DateTimeFormat("es-CO", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  }).format(utc);
}

/** "19:00" → "7:00 p. m.". */
export function formatearHora12(hora: string): string {
  const match = /^(\d{1,2}):(\d{2})$/.exec(hora ?? "");
  if (!match) return hora ?? "";
  const h = Number(match[1]);
  const m = match[2];
  const sufijo = h < 12 ? "a. m." : "p. m.";
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return `${h12}:${m} ${sufijo}`;
}

/** «de 7:00 a. m. a 5:00 p. m.» a partir de los dos instantes de la jornada. */
export function rangoHorario(startAt: string, endAt: string): string {
  return `${formatearHora12(horaColombia(startAt))} – ${formatearHora12(horaColombia(endAt))}`;
}

/* ------------------------------------------------------------------ */
/* Normalización de `site_settings.jornada_config`                     */
/* ------------------------------------------------------------------ */

function esObjeto(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function numeroOr(value: unknown, porDefecto: number): number {
  const n = typeof value === "string" ? Number(value) : value;
  return typeof n === "number" && Number.isFinite(n) ? n : porDefecto;
}

function horaOr(value: unknown, porDefecto: string): string {
  return typeof value === "string" && /^\d{1,2}:\d{2}$/.test(value) ? value : porDefecto;
}

/**
 * Convierte el JSON guardado en `site_settings.jornada_config` en una
 * `JornadaConfig` completa, rellenando con los valores por defecto lo que falte
 * o venga mal escrito. Nunca lanza: el portal debe funcionar sin base de datos.
 */
export function normalizarJornadaConfig(value: unknown): JornadaConfig {
  if (!esObjeto(value)) return jornadaConfigDefaults;

  const recargosRaw = esObjeto(value.recargos) ? value.recargos : {};
  const d = jornadaConfigDefaults;

  return {
    jornadaOrdinariaInicio: horaOr(value.jornadaOrdinariaInicio, d.jornadaOrdinariaInicio),
    jornadaOrdinariaFin: horaOr(value.jornadaOrdinariaFin, d.jornadaOrdinariaFin),
    horasOrdinariasDia: Math.min(
      24,
      Math.max(1, numeroOr(value.horasOrdinariasDia, d.horasOrdinariasDia)),
    ),
    horarioSemanal: normalizarHorarioDias(value.horarioSemanal, d.horarioSemanal),
    inicioNocturno: horaOr(value.inicioNocturno, d.inicioNocturno),
    finNocturno: horaOr(value.finNocturno, d.finNocturno),
    limiteExtrasDia: Math.min(
      24,
      Math.max(0, numeroOr(value.limiteExtrasDia, d.limiteExtrasDia)),
    ),
    limiteExtrasSemana: Math.min(
      168,
      Math.max(0, numeroOr(value.limiteExtrasSemana, d.limiteExtrasSemana)),
    ),
    recargos: {
      extraDiurna: numeroOr(recargosRaw.extraDiurna, d.recargos.extraDiurna),
      extraNocturna: numeroOr(recargosRaw.extraNocturna, d.recargos.extraNocturna),
      nocturno: numeroOr(recargosRaw.nocturno, d.recargos.nocturno),
      dominicalFestivo: numeroOr(recargosRaw.dominicalFestivo, d.recargos.dominicalFestivo),
      extraDominicalDiurna: numeroOr(
        recargosRaw.extraDominicalDiurna,
        d.recargos.extraDominicalDiurna,
      ),
      extraDominicalNocturna: numeroOr(
        recargosRaw.extraDominicalNocturna,
        d.recargos.extraDominicalNocturna,
      ),
    },
  };
}

/* ------------------------------------------------------------------ */
/* DESGLOSE CONGELADO                                                  */
/* ------------------------------------------------------------------ */

/**
 * EL PROBLEMA QUE RESUELVE ESTA SECCIÓN
 * -------------------------------------
 * `calcularJornada` es una función pura: con el mismo turno, pero con otro
 * horario del mes u otros recargos, devuelve otro resultado. Eso está bien
 * mientras la jornada está pendiente, y es inaceptable una vez aprobada: si en
 * noviembre alguien corrige el horario de septiembre, cambiarían las cifras de
 * jornadas ya revisadas y firmadas.
 *
 * Solución: al APROBAR se calcula una vez y se guardan el resultado
 * (`desglose`), el contexto que se usó (`contexto_calculo`) y el instante
 * (`calculado_at`). Desde entonces esa jornada muestra siempre lo mismo.
 *
 * **REGLA DE LECTURA ÚNICA**: todos los consumidores —portal, listado de
 * revisión, detalle, totales y CSV— leen el desglose con `obtenerDesglose()`,
 * nunca llamando a `calcularJornada` por su cuenta. Si hay congelado lo usa; si
 * no, calcula en vivo. La única excepción legítima es la vista previa del
 * formulario, donde todavía no hay fila en la base.
 */

/** Versión del formato del contexto congelado, por si algún día cambia. */
export const VERSION_CONTEXTO_CALCULO = 1;

/**
 * Todo lo que se usó para calcular una jornada, guardado tal cual: es el
 * respaldo de auditoría que permite explicar POR QUÉ salió ese número aunque
 * después se cambie el horario del mes.
 */
export interface ContextoCalculo {
  version: number;
  /** Mes del horario aplicado, `"YYYY-MM"` (`""` si la fecha no era válida). */
  mes: string;
  /** Ese mes en palabras: "julio de 2026". */
  mesEtiqueta: string;
  /** Horario del día trabajado. `null` = ese día no era laboral. */
  horarioDia: HorarioDia | null;
  /** Resumen legible del horario semanal de ese mes. */
  horarioSemana: string;
  /** false = día no laboral o festivo: todo el turno va con recargo. */
  diaLaboral: boolean;
  /** Nombre del festivo del día imputado, si lo era. */
  festivo: string | null;
  /** Jornada ordinaria neta de ese día, en minutos. */
  jornadaOrdinariaMinutos: number;
  /** Franja nocturna vigente al calcular. */
  inicioNocturno: string;
  finNocturno: string;
  /** Recargos que de verdad se aplicaron. */
  recargos: JornadaRecargos;
  /** Topes de horas extra vigentes al calcular. */
  limiteExtrasDia: number;
  limiteExtrasSemana: number;
}

/** Lo mínimo que necesita `obtenerDesglose` de una fila de `jornadas`. */
export interface JornadaCalculable {
  start_at: string;
  end_at: string;
  work_date: string;
  desglose?: unknown;
  contexto_calculo?: unknown;
  calculado_at?: string | null;
}

export interface DesgloseResuelto {
  desglose: DesgloseJornada;
  /** true = viene del congelado al aprobar; ya no cambia nunca. */
  congelado: boolean;
  /** Contexto del congelado o, si se calculó en vivo, el vigente. */
  contexto: ContextoCalculo | null;
  /** Instante ISO en que se congeló; `null` si se calculó en vivo. */
  calculadoEn: string | null;
}

/**
 * Los recargos que de verdad se aplican a un día: los de `jornada_config` para
 * nocturno y extras, y el dominical de la LEY en esa fecha (del que se derivan
 * los tres campos dominicales). Es lo que se guarda en el contexto congelado.
 */
function recargosAplicados(fecha: string, config: JornadaConfig): JornadaRecargos {
  const r = { ...jornadaConfigDefaults.recargos, ...(config.recargos ?? {}) };
  const d = recargoDominicalVigente(fecha);
  const dos = (n: number) => Math.round(n * 100) / 100;
  return {
    ...r,
    dominicalFestivo: d,
    extraDominicalDiurna: dos(r.extraDiurna + d),
    extraDominicalNocturna: dos(r.extraNocturna + d),
  };
}

/**
 * Reconstruye el contexto de cálculo de un día con el horario y la
 * configuración que rigen AHORA. Es lo que se persiste al aprobar y también lo
 * que se muestra como referencia mientras la jornada sigue pendiente.
 */
export function construirContextoCalculo(
  workDate: string,
  config: JornadaConfig = jornadaConfigDefaults,
  horarios?: MapaHorarios | null,
): ContextoCalculo {
  const fecha = /^\d{4}-\d{2}-\d{2}$/.test(workDate) ? workDate : "";

  const semanaPorDefecto = normalizarHorarioDias(
    config.horarioSemanal ?? horarioPredeterminado,
    horarioPredeterminado,
  );
  const dias = fecha
    ? horarioDeFecha(fecha, horarios, semanaPorDefecto)
    : semanaPorDefecto;

  const horarioDia = fecha ? dias[claveDiaSemana(diaSemanaDeFecha(fecha))] : null;
  const festivo = fecha ? nombreFestivo(fecha) : null;
  const diaLaboral = horarioDia !== null && festivo === null;

  const mes = mesDeFecha(fecha);
  const anio = Number(mes.slice(0, 4));
  const numeroMes = Number(mes.slice(5, 7));
  const mesValido =
    Number.isInteger(anio) &&
    Number.isInteger(numeroMes) &&
    numeroMes >= 1 &&
    numeroMes <= 12;

  return {
    version: VERSION_CONTEXTO_CALCULO,
    mes,
    mesEtiqueta: mesValido ? etiquetaMes(anio, numeroMes) : "",
    horarioDia: horarioDia ? { ...horarioDia } : null,
    horarioSemana: resumenHorario(dias),
    diaLaboral,
    festivo,
    jornadaOrdinariaMinutos: diaLaboral ? minutosJornadaDia(horarioDia) : 0,
    inicioNocturno: config.inicioNocturno,
    finNocturno: config.finNocturno,
    recargos: recargosAplicados(fecha, config),
    limiteExtrasDia: config.limiteExtrasDia,
    limiteExtrasSemana: config.limiteExtrasSemana,
  };
}

/** Minutos leídos de un JSON: nunca negativos, siempre enteros. */
function minutosGuardados(value: unknown): number {
  const n = numeroOr(value, 0);
  return Number.isFinite(n) && n > 0 ? Math.round(n) : 0;
}

/**
 * Convierte el JSON de `jornadas.desglose` en un `DesgloseJornada` completo.
 * Devuelve `null` cuando NO hay congelado utilizable (jornada nunca aprobada o
 * JSON incompleto): en ese caso el llamador calcula en vivo. Nunca lanza.
 */
export function normalizarDesglose(value: unknown): DesgloseJornada | null {
  if (!esObjeto(value)) return null;
  if (value.valido === false) return null;

  const totalMinutos = minutosGuardados(value.totalMinutos);
  // Un congelado sin duración no explica nada: se trata como ausente.
  if (totalMinutos <= 0) return null;

  return {
    valido: true,
    totalMinutos,
    almuerzoMinutos: minutosGuardados(value.almuerzoMinutos),
    minutosTrabajados: minutosGuardados(value.minutosTrabajados),
    jornadaOrdinariaMinutos: minutosGuardados(value.jornadaOrdinariaMinutos),
    diaLaboral: value.diaLaboral !== false,
    ordinariaDiurna: minutosGuardados(value.ordinariaDiurna),
    ordinariaNocturna: minutosGuardados(value.ordinariaNocturna),
    extraDiurna: minutosGuardados(value.extraDiurna),
    extraNocturna: minutosGuardados(value.extraNocturna),
    dominicalDiurna: minutosGuardados(value.dominicalDiurna),
    dominicalNocturna: minutosGuardados(value.dominicalNocturna),
    extraDominicalDiurna: minutosGuardados(value.extraDominicalDiurna),
    extraDominicalNocturna: minutosGuardados(value.extraDominicalNocturna),
    ordinarias: minutosGuardados(value.ordinarias),
    extras: minutosGuardados(value.extras),
    minutosNocturnos: minutosGuardados(value.minutosNocturnos),
    minutosDominicales: minutosGuardados(value.minutosDominicales),
    esDominicalFestivo: value.esDominicalFestivo === true,
    festivos: Array.isArray(value.festivos)
      ? value.festivos.filter((f): f is string => typeof f === "string")
      : [],
    cruzaMedianoche: value.cruzaMedianoche === true,
    horasEquivalentes: numeroOr(value.horasEquivalentes, 0),
  };
}

/**
 * Convierte el JSON de `jornadas.contexto_calculo` en un `ContextoCalculo`.
 * Devuelve `null` si no hay nada legible. Nunca lanza.
 */
export function normalizarContextoCalculo(value: unknown): ContextoCalculo | null {
  if (!esObjeto(value)) return null;

  const d = jornadaConfigDefaults;
  const diaBruto = esObjeto(value.horarioDia) ? value.horarioDia : null;
  const recargosBrutos = esObjeto(value.recargos) ? value.recargos : {};

  const horarioDia: HorarioDia | null =
    diaBruto &&
    minutosDesdeHora(diaBruto.inicio) !== null &&
    minutosDesdeHora(diaBruto.fin) !== null
      ? {
          inicio: String(diaBruto.inicio),
          fin: String(diaBruto.fin),
          almuerzoHoras: Math.max(0, numeroOr(diaBruto.almuerzoHoras, 0)),
        }
      : null;

  return {
    version: numeroOr(value.version, VERSION_CONTEXTO_CALCULO),
    mes: typeof value.mes === "string" ? value.mes : "",
    mesEtiqueta: typeof value.mesEtiqueta === "string" ? value.mesEtiqueta : "",
    horarioDia,
    horarioSemana: typeof value.horarioSemana === "string" ? value.horarioSemana : "",
    diaLaboral: value.diaLaboral !== false,
    festivo: typeof value.festivo === "string" && value.festivo ? value.festivo : null,
    jornadaOrdinariaMinutos: minutosGuardados(value.jornadaOrdinariaMinutos),
    inicioNocturno: horaOr(value.inicioNocturno, d.inicioNocturno),
    finNocturno: horaOr(value.finNocturno, d.finNocturno),
    recargos: {
      extraDiurna: numeroOr(recargosBrutos.extraDiurna, d.recargos.extraDiurna),
      extraNocturna: numeroOr(recargosBrutos.extraNocturna, d.recargos.extraNocturna),
      nocturno: numeroOr(recargosBrutos.nocturno, d.recargos.nocturno),
      dominicalFestivo: numeroOr(
        recargosBrutos.dominicalFestivo,
        d.recargos.dominicalFestivo,
      ),
      extraDominicalDiurna: numeroOr(
        recargosBrutos.extraDominicalDiurna,
        d.recargos.extraDominicalDiurna,
      ),
      extraDominicalNocturna: numeroOr(
        recargosBrutos.extraDominicalNocturna,
        d.recargos.extraDominicalNocturna,
      ),
    },
    limiteExtrasDia: numeroOr(value.limiteExtrasDia, d.limiteExtrasDia),
    limiteExtrasSemana: numeroOr(value.limiteExtrasSemana, d.limiteExtrasSemana),
  };
}

/**
 * **LA ÚNICA LECTURA VÁLIDA del desglose de una jornada guardada.**
 *
 * Si la jornada tiene desglose congelado (se aprobó) devuelve ese, marcado con
 * `congelado: true`. Si no, lo calcula en vivo con el horario y la
 * configuración actuales.
 */
export function obtenerDesglose(
  jornada: JornadaCalculable,
  config: JornadaConfig = jornadaConfigDefaults,
  horarios?: MapaHorarios | null,
): DesgloseResuelto {
  const guardado = normalizarDesglose(jornada.desglose);

  if (guardado) {
    return {
      desglose: guardado,
      congelado: true,
      contexto: normalizarContextoCalculo(jornada.contexto_calculo),
      calculadoEn:
        typeof jornada.calculado_at === "string" && jornada.calculado_at
          ? jornada.calculado_at
          : null,
    };
  }

  return {
    desglose: calcularJornada(
      jornada.start_at,
      jornada.end_at,
      jornada.work_date,
      config,
      horarios,
    ),
    congelado: false,
    contexto: construirContextoCalculo(jornada.work_date, config, horarios),
    calculadoEn: null,
  };
}

/** "1 h de almuerzo" · "0,5 h de almuerzo" · "" si no hay almuerzo. */
function textoAlmuerzo(horas: number): string {
  if (!Number.isFinite(horas) || horas <= 0) return "";
  return `${horas.toLocaleString("es-CO", { maximumFractionDigits: 2 })} h de almuerzo`;
}

/**
 * Explicación en lenguaje llano de un cálculo congelado, para la nota al pie
 * del detalle:
 *
 *   «Cálculo congelado el 28/09/2026 con el horario de septiembre de 2026
 *    (Lunes a jueves 08:00–17:30 · Viernes 08:00–17:00; 1 h de almuerzo).
 *    Cambiar después el horario del mes ya no altera esta jornada.»
 */
export function textoCalculoCongelado(
  contexto: ContextoCalculo | null,
  calculadoEn: string | null,
): string {
  const fecha = calculadoEn ? fechaColombia(calculadoEn) : "";
  const cuando = fecha ? ` el ${formatearFechaNumerica(fecha)}` : "";

  let conQue = "";
  if (contexto?.mesEtiqueta) {
    const detalles = [
      contexto.horarioSemana,
      textoAlmuerzo(contexto.horarioDia?.almuerzoHoras ?? 0),
    ].filter((d) => d !== "");
    conQue = ` con el horario de ${contexto.mesEtiqueta}${
      detalles.length > 0 ? ` (${detalles.join("; ")})` : ""
    }`;
  }

  return `Cálculo congelado${cuando}${conQue}. Cambiar después el horario del mes o los recargos ya no altera esta jornada.`;
}
