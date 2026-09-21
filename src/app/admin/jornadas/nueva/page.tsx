import { requireManager } from "@/lib/supabase/auth";
import { getContextoJornadas, listPersonasParaJornadas } from "@/lib/jornadas-lecturas";
import { hoyEnColombia } from "@/lib/jornada";
import {
  AyudaSeccion,
  CabeceraPanel,
  EstadoVacio,
  Tarjeta,
  TituloTarjeta,
} from "@/components/admin/ui";
import { FormularioJornada } from "@/components/jornadas/FormularioJornada";
import { guardarJornadaComoManager } from "../actions";

export const dynamic = "force-dynamic";

/**
 * REGISTRAR UNA JORNADA A NOMBRE DE ALGUIEN
 * =========================================
 * Para quien no registra desde su celular: el coordinador la escribe aquí y la
 * jornada queda a nombre de esa persona, visible en su portal y pendiente de
 * aprobación como cualquier otra.
 *
 * Solo managers. La acción vuelve a exigir el rol y comprueba que la cuenta
 * destino exista y esté activa: aquí `employee_id` SÍ viene del formulario
 * —es el sentido de la pantalla—, así que la validación en el servidor no es
 * opcional.
 */
export default async function NuevaJornadaPage() {
  await requireManager();

  const [{ config, horarios }, personas] = await Promise.all([
    getContextoJornadas(),
    listPersonasParaJornadas(),
  ]);

  const activas = personas.filter((p) => p.activa);

  return (
    <>
      <CabeceraPanel
        title="Registrar jornada"
        description="Para quien no la registra desde su celular. Queda a nombre de la persona y pendiente de aprobación."
        backHref="/admin/jornadas"
        backLabel="Volver a Jornadas"
        breadcrumb={[
          { label: "Panel", href: "/admin" },
          { label: "Jornadas", href: "/admin/jornadas" },
          { label: "Registrar" },
        ]}
      />

      <AyudaSeccion className="mb-6">
        La jornada entra como <strong>pendiente</strong>, igual que si la hubiera
        registrado la persona: hay que aprobarla después desde su ficha para que
        su desglose de horas quede congelado.
      </AyudaSeccion>

      {activas.length === 0 ? (
        <EstadoVacio
          title="No hay cuentas activas"
          description="Para registrar una jornada hace falta al menos una cuenta activa en Equipo. Crea o reactiva la de la persona y vuelve aquí."
        />
      ) : (
        <Tarjeta>
          <TituloTarjeta
            title="Datos del turno"
            description="Las horas se registran en hora de Colombia. Si el turno pasó de la medianoche, marca la casilla correspondiente."
          />
          <FormularioJornada
            action={guardarJornadaComoManager}
            config={config}
            horarios={horarios}
            hoy={hoyEnColombia()}
            empleados={activas.map((p) => ({
              id: p.id,
              nombre: p.nombre,
              cargo: p.cargo,
            }))}
            cancelHref="/admin/jornadas"
          />
        </Tarjeta>
      )}
    </>
  );
}
