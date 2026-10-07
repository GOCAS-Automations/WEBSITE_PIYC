/**
 * ESCRITURA DE JORNADAS — el reintento sin las columnas de gastos
 * ===============================================================
 * Las migraciones de PIYC se aplican a mano desde el SQL Editor de Supabase,
 * así que entre el despliegue del código y la aplicación del SQL hay una
 * ventana en la que la base todavía **no tiene** las columnas de la 0006
 * (`gasto_alimentacion`, `gasto_transporte`, `gasto_otros`,
 * `gasto_otros_nota`).
 *
 * UNA JORNADA NO SE PIERDE POR ESO. Es el mismo patrón de la 0005 en
 * `src/app/api/contacto/route.ts`: se intenta con las columnas nuevas y, si
 * Postgres o PostgREST contestan «esa columna no existe», se repite la
 * escritura sin ellas y queda el aviso en el log para que alguien aplique la
 * migración. Las horas —que son lo que el módulo calcula— se guardan igual;
 * lo único que se queda sin registrar es el reembolso.
 *
 * NO SE CACHEA EL RESULTADO a propósito: si una vez falló, la siguiente vuelve
 * a intentarlo con las columnas. Recordar «aquí no existen» en el proceso
 * haría que, justo después de aplicar la migración, un proceso tibio siguiera
 * descartando los gastos en silencio.
 *
 * No lleva `"use server"`: no es una acción, es una utilidad que importan las
 * acciones del portal y del panel.
 */

import { esColumnaDesconocida } from "@/lib/supabase/columnas";

/** Lo que hay que correr en el SQL Editor si aparece el aviso del log. */
export const AVISO_SIN_COLUMNAS_GASTOS =
  "[jornadas] la base no tiene las columnas de gastos: aplica supabase/migrations/0006_gastos_jornada.sql. La jornada se guarda SIN los montos reembolsables.";

/**
 * Corre la escritura con los gastos y, solo si falla porque esas columnas no
 * existen, la repite sin ellos. Cualquier otro error se devuelve tal cual:
 * un conflicto de RLS o una restricción violada tienen que llegar a la
 * pantalla, no disfrazarse de columna ausente.
 */
export async function escribirJornadaConGastos<R extends { error: unknown }>(
  conGastos: () => PromiseLike<R>,
  sinGastos: () => PromiseLike<R>,
): Promise<R> {
  const primero = await conGastos();
  if (!primero.error || !esColumnaDesconocida(primero.error)) return primero;

  console.warn(AVISO_SIN_COLUMNAS_GASTOS);
  return await sinGastos();
}
