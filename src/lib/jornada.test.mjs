/**
 * PRUEBAS DEL CÁLCULO DE JORNADAS
 * ===============================
 * Se corren con el runner nativo de Node (sin instalar nada):
 *
 *     npm test          →  node --test src/lib/jornada.test.mjs
 *
 * Node 22 ya entiende TypeScript (borra los tipos al vuelo), pero NO conoce el
 * alias `@/` del `tsconfig.json`. Por eso el archivo registra un `resolve` hook
 * de doce líneas que traduce `@/algo` a `src/algo.ts` y solo después importa los
 * módulos. Así el código fuente se queda idiomático —importando con `@/`, como
 * el resto del proyecto— y las pruebas no necesitan compilación ni empaquetador.
 *
 * QUÉ SE PRUEBA: solo los dos módulos puros (`jornada.ts`, `horarios.ts`,
 * `jornada-festivos.ts`). Nada que toque React, Next o Supabase.
 */

import test from "node:test";
import assert from "node:assert/strict";
import { register } from "node:module";
import { pathToFileURL } from "node:url";
import path from "node:path";

/* --- Resolución del alias `@/` para el runner de Node --------------- */

const RAIZ_SRC = pathToFileURL(
  path.join(path.dirname(new URL(import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, "$1")), "..", "/"),
).href;

register(
  "data:text/javascript," +
    encodeURIComponent(
      `const RAIZ = ${JSON.stringify(RAIZ_SRC)};
       export async function resolve(especificador, contexto, siguiente) {
         if (especificador.startsWith("@/")) {
           return siguiente(new URL(especificador.slice(2) + ".ts", RAIZ).href, contexto);
         }
         return siguiente(especificador, contexto);
       }`,
    ),
);

const {
  calcularJornada,
  instanteColombia,
  hoyEnColombia,
  horaColombia,
  obtenerDesglose,
  sumarDesgloses,
  jornadaConfigDefaults,
} = await import("./jornada.ts");

const { festivoDeFecha, festivosDelAnio, domingoDePascua, recargoDominicalVigente } =
  await import("./jornada-festivos.ts");

const { minutosJornadaDia, minutosSemanales, normalizarHorarioDias } = await import(
  "./horarios.ts"
);

/* ------------------------------------------------------------------ */
/* Ayudas                                                              */
/* ------------------------------------------------------------------ */

/** Calcula un turno dado en hora de pared colombiana. */
function turno(fecha, desde, hasta, { diaSiguiente = false, horarios = null } = {}) {
  const inicio = instanteColombia(fecha, desde);
  const fin = instanteColombia(fecha, hasta, diaSiguiente ? 1 : 0);
  return calcularJornada(inicio, fin, fecha, jornadaConfigDefaults, horarios);
}

/* ==================================================================== */
/* 1. Zona horaria                                                       */
/* ==================================================================== */

test("la hora de pared colombiana no depende de la zona del servidor", () => {
  // 21-sep-2026, 08:00 en Cali = 13:00 UTC (Colombia es UTC−5 todo el año).
  assert.equal(instanteColombia("2026-09-21", "08:00"), "2026-09-21T13:00:00.000Z");
  assert.equal(horaColombia("2026-09-21T13:00:00.000Z"), "08:00");

  // Las 8:00 p. m. de Colombia son ya el día siguiente en UTC: si el servidor
  // leyera su propia fecha, contaría el turno un día después.
  assert.equal(instanteColombia("2026-09-21", "20:00"), "2026-09-22T01:00:00.000Z");
  assert.equal(hoyEnColombia(new Date("2026-09-22T01:00:00.000Z")), "2026-09-21");
});

/* ==================================================================== */
/* 2. Día normal                                                         */
/* ==================================================================== */

test("día normal: 8:00 a 17:30 un lunes son 8,5 h ordinarias y 1 h de almuerzo", () => {
  // 2026-09-21 es lunes.
  const d = turno("2026-09-21", "08:00", "17:30");

  assert.equal(d.valido, true);
  assert.equal(d.diaLaboral, true);
  assert.equal(d.totalMinutos, 570); // 9,5 h de presencia
  assert.equal(d.almuerzoMinutos, 60);
  assert.equal(d.minutosTrabajados, 510); // 8,5 h netas
  assert.equal(d.jornadaOrdinariaMinutos, 510);
  assert.equal(d.ordinarias, 510);
  assert.equal(d.extras, 0);
  assert.equal(d.ordinariaDiurna, 510);
  assert.equal(d.minutosNocturnos, 0);
  assert.equal(d.esDominicalFestivo, false);
  assert.equal(d.cruzaMedianoche, false);
  assert.equal(d.horasEquivalentes, 8.5);
});

test("turno corto en día laboral: menos de 6 horas no descuenta almuerzo", () => {
  const d = turno("2026-09-21", "08:00", "13:00"); // 5 h
  assert.equal(d.almuerzoMinutos, 0);
  assert.equal(d.minutosTrabajados, 300);
  assert.equal(d.ordinarias, 300);
  assert.equal(d.extras, 0);
});

/* ==================================================================== */
/* 3. Horas extra                                                        */
/* ==================================================================== */

test("extra diurna: salir a las 7:00 p. m. deja 1,5 h extra, todas diurnas", () => {
  const d = turno("2026-09-21", "08:00", "19:00");

  assert.equal(d.totalMinutos, 660);
  assert.equal(d.almuerzoMinutos, 60);
  assert.equal(d.ordinarias, 510);
  assert.equal(d.extras, 90); // de 17:30 a 19:00
  assert.equal(d.extraDiurna, 90);
  assert.equal(d.extraNocturna, 0);
  // La franja nocturna empieza a las 19:00 y el turno termina justo ahí.
  assert.equal(d.minutosNocturnos, 0);
});

test("extra nocturna: lo trabajado después de las 7:00 p. m. es nocturno", () => {
  const d = turno("2026-09-21", "08:00", "21:00");

  assert.equal(d.ordinarias, 510);
  assert.equal(d.extras, 210);
  assert.equal(d.extraDiurna, 90); // 17:30 → 19:00
  assert.equal(d.extraNocturna, 120); // 19:00 → 21:00
  assert.equal(d.minutosNocturnos, 120);
  // 8,5 ordinarias + 1,5 extra diurna (×1,25) + 2 extra nocturna (×1,75) =
  // 13,875 h equivalentes, que el cálculo redondea a dos decimales.
  assert.equal(d.horasEquivalentes, 13.88);
});

test("el recargo nocturno de las horas ORDINARIAS no se confunde con la extra", () => {
  // Turno de tarde-noche, martes: 14:00 a 22:00 (8 h, menos que la ordinaria).
  const d = turno("2026-09-22", "14:00", "22:00");

  assert.equal(d.extras, 0);
  assert.equal(d.ordinariaDiurna, 5 * 60 - 60); // 14:00→19:00 menos el almuerzo
  assert.equal(d.ordinariaNocturna, 180); // 19:00→22:00
  assert.equal(d.almuerzoMinutos, 60);
});

/* ==================================================================== */
/* 4. Cruce de medianoche                                                */
/* ==================================================================== */

test("cruce de medianoche: el turno se reparte entre los dos días reales", () => {
  // Martes 22:00 → miércoles 02:00. Ambos días son laborales.
  const d = turno("2026-09-22", "22:00", "02:00", { diaSiguiente: true });

  assert.equal(d.valido, true);
  assert.equal(d.totalMinutos, 240);
  assert.equal(d.cruzaMedianoche, true);
  assert.equal(d.almuerzoMinutos, 0); // 4 h: no da para almorzar
  assert.equal(d.minutosNocturnos, 240); // 22:00→02:00 cae entera en la franja
  assert.equal(d.ordinariaNocturna, 240);
  assert.equal(d.extras, 0);
});

test("cruce de medianoche hacia un domingo: cambia de tratamiento a las 12:00 a. m.", () => {
  // Sábado 2026-09-26 22:00 → domingo 27 02:00. El sábado no es laboral en el
  // horario por defecto, así que ambos tramos van con recargo dominical, pero
  // el domingo se reconoce por la fecha REAL de cada minuto.
  const d = turno("2026-09-26", "22:00", "02:00", { diaSiguiente: true });

  assert.equal(d.cruzaMedianoche, true);
  assert.equal(d.minutosDominicales, 240);
  assert.equal(d.esDominicalFestivo, true);
});

test("una jornada de más de 24 horas no se calcula", () => {
  const d = calcularJornada(
    "2026-09-21T13:00:00.000Z",
    "2026-09-22T14:00:00.000Z",
    "2026-09-21",
  );
  assert.equal(d.valido, false);
  assert.match(d.error ?? "", /24 horas/);
});

/* ==================================================================== */
/* 5. Domingo, sábado y días sin horario                                 */
/* ==================================================================== */

test("domingo: no hay jornada ordinaria, todo va con recargo dominical", () => {
  // 2026-09-27 es domingo.
  const d = turno("2026-09-27", "08:00", "12:00");

  assert.equal(d.diaLaboral, false);
  assert.equal(d.jornadaOrdinariaMinutos, 0);
  assert.equal(d.almuerzoMinutos, 0);
  assert.equal(d.extraDominicalDiurna, 240);
  assert.equal(d.ordinarias, 0);
  assert.equal(d.extras, 240);
  assert.equal(d.minutosDominicales, 240);
  // 4 h × (1 + 0,25 de extra diurna + 0,90 de dominical vigente en sep-2026).
  assert.equal(d.horasEquivalentes, 4 * 2.15);
});

test("día sin horario definido (sábado): se trata como no laboral", () => {
  const d = turno("2026-09-26", "08:00", "12:00"); // sábado
  assert.equal(d.diaLaboral, false);
  assert.equal(d.jornadaOrdinariaMinutos, 0);
  assert.equal(d.minutosDominicales, 240);
});

test("un horario del mes que SÍ abre el sábado convierte ese día en laboral", () => {
  const horarios = {
    "2026-09": normalizarHorarioDias({
      lun: { inicio: "08:00", fin: "17:30", almuerzoHoras: 1 },
      mar: { inicio: "08:00", fin: "17:30", almuerzoHoras: 1 },
      mie: { inicio: "08:00", fin: "17:30", almuerzoHoras: 1 },
      jue: { inicio: "08:00", fin: "17:30", almuerzoHoras: 1 },
      vie: { inicio: "08:00", fin: "17:00", almuerzoHoras: 1 },
      sab: { inicio: "08:00", fin: "12:00", almuerzoHoras: 0 },
      dom: null,
    }),
  };

  const d = turno("2026-09-26", "08:00", "12:00", { horarios });
  assert.equal(d.diaLaboral, true);
  assert.equal(d.jornadaOrdinariaMinutos, 240);
  assert.equal(d.ordinariaDiurna, 240);
  assert.equal(d.minutosDominicales, 0);
});

/* ==================================================================== */
/* 6. Festivos                                                           */
/* ==================================================================== */

test("festivo trasladado al lunes (Ley Emiliani)", () => {
  // Reyes 2026: el 6 de enero cae martes → se traslada al lunes 12.
  assert.equal(festivoDeFecha("2026-01-06"), null);
  assert.equal(festivoDeFecha("2026-01-12"), "Día de los Reyes Magos");

  // 2027: el 6 de enero cae miércoles → lunes 11.
  assert.equal(festivoDeFecha("2027-01-11"), "Día de los Reyes Magos");
});

test("festivo fijo que cae en fin de semana NO se traslada", () => {
  // 1 de mayo de 2027 es sábado y sigue siendo festivo ese día.
  assert.equal(festivoDeFecha("2027-05-01"), "Día del Trabajo");
  assert.equal(festivoDeFecha("2027-05-03"), null);
});

test("Semana Santa sale de la Pascua, no de una lista", () => {
  assert.equal(domingoDePascua(2026), "2026-04-05");
  assert.equal(festivoDeFecha("2026-04-02"), "Jueves Santo");
  assert.equal(festivoDeFecha("2026-04-03"), "Viernes Santo");

  assert.equal(domingoDePascua(2027), "2027-03-28");
  assert.equal(festivoDeFecha("2027-03-25"), "Jueves Santo");
  assert.equal(festivoDeFecha("2027-03-26"), "Viernes Santo");
});

test("el 9 de julio (Ley 2578 de 2026) solo es festivo desde 2026", () => {
  assert.equal(festivoDeFecha("2025-07-14"), null);
  // 2026: el 9 de julio cae jueves → lunes 13.
  assert.equal(
    festivoDeFecha("2026-07-13"),
    "Nuestra Señora del Rosario de Chiquinquirá",
  );
});

test("Colombia tiene 19 días festivos en 2026 y 2027", () => {
  // Eran 18 hasta 2025; el 9 de julio (Ley 2578 de 2026) hace el número 19.
  // Se cuentan DÍAS, no nombres: dos festivos pueden caer el mismo lunes.
  assert.equal(Object.keys(festivosDelAnio(2026)).length, 19);
  assert.equal(Object.keys(festivosDelAnio(2027)).length, 19);

  // Puntos de control contra el calendario oficial de 2026.
  assert.equal(festivoDeFecha("2026-03-23"), "Día de San José");
  assert.equal(festivoDeFecha("2026-08-17"), "Asunción de la Virgen");
  assert.equal(festivoDeFecha("2026-11-16"), "Independencia de Cartagena");
  // 2027: el 12 de octubre cae martes → lunes 18.
  assert.equal(festivoDeFecha("2027-10-18"), "Día de la Raza");
});

test("trabajar en festivo se paga como dominical aunque sea día hábil", () => {
  // Lunes 13 de julio de 2026: laboral en el calendario, festivo por ley.
  const d = turno("2026-07-13", "08:00", "17:30");

  assert.equal(d.diaLaboral, false);
  assert.equal(d.jornadaOrdinariaMinutos, 0);
  assert.deepEqual(d.festivos, ["Nuestra Señora del Rosario de Chiquinquirá"]);
  assert.equal(d.extras, 570); // sin almuerzo: el día no es laboral
  assert.equal(d.extraDominicalDiurna, 570);
});

test("el recargo dominical sube por tramos con la Ley 2466 de 2025", () => {
  assert.equal(recargoDominicalVigente("2026-06-30"), 0.8);
  assert.equal(recargoDominicalVigente("2026-07-01"), 0.9);
  assert.equal(recargoDominicalVigente("2027-07-01"), 1.0);
});

/* ==================================================================== */
/* 7. Horarios mensuales                                                 */
/* ==================================================================== */

test("la jornada neta del día descuenta el almuerzo", () => {
  assert.equal(minutosJornadaDia({ inicio: "08:00", fin: "17:30", almuerzoHoras: 1 }), 510);
  assert.equal(minutosJornadaDia({ inicio: "08:00", fin: "12:00", almuerzoHoras: 0 }), 240);
  assert.equal(minutosJornadaDia(null), 0);
});

test("el horario por defecto suma 42 horas semanales netas", () => {
  assert.equal(minutosSemanales(jornadaConfigDefaults.horarioSemanal), 42 * 60);
});

/* ==================================================================== */
/* 8. Desglose congelado                                                 */
/* ==================================================================== */

test("una jornada aprobada usa su desglose congelado, no el horario de hoy", () => {
  const original = turno("2026-09-21", "08:00", "19:00");

  // Se aprueba y se congela. Después alguien cambia el horario del mes: el
  // lunes pasa a ser no laboral, lo que en vivo daría un resultado muy distinto.
  const horariosCambiados = {
    "2026-09": normalizarHorarioDias({
      lun: null,
      mar: null,
      mie: null,
      jue: null,
      vie: null,
      sab: null,
      dom: null,
    }),
  };

  const resuelto = obtenerDesglose(
    {
      start_at: instanteColombia("2026-09-21", "08:00"),
      end_at: instanteColombia("2026-09-21", "19:00"),
      work_date: "2026-09-21",
      desglose: original,
      contexto_calculo: { version: 1, mes: "2026-09", mesEtiqueta: "septiembre de 2026" },
      calculado_at: "2026-09-21T23:00:00.000Z",
    },
    jornadaConfigDefaults,
    horariosCambiados,
  );

  assert.equal(resuelto.congelado, true);
  assert.equal(resuelto.desglose.ordinarias, 510);
  assert.equal(resuelto.desglose.extraDiurna, 90);

  // La misma jornada SIN congelar sí cambiaría con el horario nuevo.
  const enVivo = obtenerDesglose(
    {
      start_at: instanteColombia("2026-09-21", "08:00"),
      end_at: instanteColombia("2026-09-21", "19:00"),
      work_date: "2026-09-21",
      desglose: null,
      contexto_calculo: null,
      calculado_at: null,
    },
    jornadaConfigDefaults,
    horariosCambiados,
  );

  assert.equal(enVivo.congelado, false);
  assert.equal(enVivo.desglose.ordinarias, 0);
  assert.equal(enVivo.desglose.extras, 660);
});

/* ==================================================================== */
/* 9. Totales de un periodo                                              */
/* ==================================================================== */

test("los totales del periodo son la suma exacta de cada categoría", () => {
  const a = turno("2026-09-21", "08:00", "19:00"); // 510 ord + 90 extra diurna
  const b = turno("2026-09-27", "08:00", "12:00"); // 240 extra dominical diurna

  const total = sumarDesgloses([a, b]);

  assert.equal(total.jornadas, 2);
  assert.equal(total.ordinarias, 510);
  assert.equal(total.extras, 90 + 240);
  assert.equal(total.extraDiurna, 90);
  assert.equal(total.extraDominicalDiurna, 240);
  assert.equal(total.minutosTrabajados, 600 + 240);

  // El total de minutos trabajados cuadra con la suma de las ocho categorías.
  const porCategoria =
    total.ordinariaDiurna +
    total.ordinariaNocturna +
    total.extraDiurna +
    total.extraNocturna +
    total.dominicalDiurna +
    total.dominicalNocturna +
    total.extraDominicalDiurna +
    total.extraDominicalNocturna;
  assert.equal(porCategoria, total.minutosTrabajados);
});
