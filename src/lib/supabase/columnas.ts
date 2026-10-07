/**
 * COLUMNAS QUE TODAVÍA NO EXISTEN EN LA BASE — módulo PURO
 * ========================================================
 * Las migraciones se aplican a mano desde el SQL Editor de Supabase, así que
 * entre que se despliega el código y alguien corre el SQL hay una ventana en la
 * que la base **no tiene** las columnas nuevas. Lo que se escribe en ese rato
 * no se puede perder por eso: la escritura se reintenta sin las columnas
 * nuevas y queda un aviso en el log para que alguien aplique la migración.
 *
 * El patrón nació con la 0005 (consentimiento del formulario de contacto) y lo
 * reusa la 0006 (gastos de una jornada). Vive aquí para que las dos pantallas
 * reconozcan el error igual.
 */

/**
 * ¿El error es «esa columna no existe»?
 *
 * PostgREST responde `PGRST204` cuando la columna no está en su caché de
 * esquema, y Postgres `42703` cuando la consulta llega igual. Se mira también
 * el texto porque el código no siempre viaja. Cualquier otro error se propaga:
 * solo este caso merece un reintento.
 */
export function esColumnaDesconocida(error: unknown): boolean {
  if (!error || typeof error !== "object") return false;
  const { code, message } = error as { code?: unknown; message?: unknown };
  if (code === "PGRST204" || code === "42703") return true;
  return typeof message === "string" && /column|schema cache/i.test(message);
}
