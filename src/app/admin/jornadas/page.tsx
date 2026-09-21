import { requireManager } from "@/lib/supabase/auth";
import { AyudaSeccion, CabeceraPanel, EstadoVacio } from "@/components/admin/ui";

export const dynamic = "force-dynamic";

/**
 * JORNADAS — MARCADOR
 * ===================
 * Cuarta entrada del menú. Esta pantalla la reemplaza entera el agente del
 * módulo de jornadas; existe ahora para que el menú no tenga un enlace roto y
 * para dejar escrito, en el sitio donde se va a trabajar, qué se espera aquí.
 *
 * QUÉ VA A VIVIR EN ESTA RUTA
 * ---------------------------
 *   /admin/jornadas            → listado con filtros (persona, estado, rango de
 *                                fechas), aprobación y rechazo, exportación CSV.
 *   /admin/jornadas/horarios   → horarios mensuales (`horarios_mensuales`), a
 *                                donde ya apunta el enlace de «Equipo».
 *
 * LO QUE YA ESTÁ LISTO Y CONVIENE REUTILIZAR
 * ------------------------------------------
 *   · `requireManager()` — la guarda de rol de esta sección.
 *   · `Paginacion` y `paginar()` — 10 filas por página en todo el panel.
 *   · `nombresDeCompaneros()` de `src/lib/admin/lecturas.ts` — nombre y cargo
 *     con la service-role, que es lo que la regla 3 permite mostrar.
 *   · `FormularioAdmin`, `BotonAccion` y `FormularioEliminar` de
 *     `components/admin/FormularioAdmin.tsx`.
 *
 * REGLA 6, QUE SE APLICA AQUÍ MÁS QUE EN NINGÚN LADO: **rechazar ≠ eliminar**.
 * Rechazar devuelve la jornada al empleado con una nota para que la corrija;
 * eliminar borra el registro. Hay que decirlo en la interfaz, cada vez.
 */
export default async function JornadasPage() {
  await requireManager();

  return (
    <>
      <CabeceraPanel
        title="Jornadas"
        description="El registro de horas del equipo: revisión, aprobación y exportación."
        breadcrumb={[{ label: "Panel", href: "/admin" }, { label: "Jornadas" }]}
      />

      <AyudaSeccion tono="aviso" title="Sección en construcción" className="mb-6">
        El módulo de jornadas se está construyendo. Mientras tanto, el registro
        de horas sigue como hasta ahora; nada de lo que ya exista se pierde.
      </AyudaSeccion>

      <EstadoVacio
        title="Todavía no hay nada que revisar"
        description="Aquí aparecerán las jornadas que registre el equipo desde su portal, para aprobarlas o devolverlas con una nota. También se podrán exportar para la nómina."
      />
    </>
  );
}
