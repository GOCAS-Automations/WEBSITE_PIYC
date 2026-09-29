import { notFound } from "next/navigation";
import { requireManager } from "@/lib/supabase/auth";
import { getPerfil } from "@/lib/admin/lecturas";
import {
  ETIQUETA_ROL,
  motivoSinPermiso,
  puedeGestionarCuenta,
} from "@/lib/supabase/roles";
import { isServiceRoleConfigured } from "@/lib/supabase/admin";
import {
  AvisoGuardar,
  AyudaSeccion,
  CabeceraPanel,
  Tarjeta,
  TituloTarjeta,
} from "@/components/admin/ui";
import { EliminarConfirmando } from "@/components/admin/FormularioAdmin";
import { FormularioCuenta } from "../FormularioCuenta";
import { CamposCuenta } from "../CamposCuenta";
import { BotonRestablecer } from "../BotonRestablecer";
import { actualizarCuenta, eliminarCuenta, restablecerPassword } from "../actions";

export const dynamic = "force-dynamic";

export default async function FichaCuentaPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { profile } = await requireManager();
  const { id } = await params;
  const cuenta = await getPerfil(id);
  if (!cuenta) notFound();

  const esUnoMismo = cuenta.id === profile.id;
  const configurado = isServiceRoleConfigured();
  const usuario = cuenta.username ?? cuenta.email;

  // Un coordinador no gestiona cuentas de administrador ni de otro coordinador.
  // La ficha se abre igual —consultar el dato es útil— pero SIN formulario y
  // sin las acciones: mostrarlas sería prometer algo que el servidor rechaza.
  const gestionable =
    esUnoMismo || puedeGestionarCuenta(profile.role, cuenta.role);

  if (!gestionable) {
    return (
      <>
        <CabeceraPanel
          title={cuenta.full_name}
          description={`Entra al portal con el usuario ${usuario}.`}
          backHref="/admin/equipo"
          backLabel="Volver a Equipo"
          breadcrumb={[
            { label: "Panel", href: "/admin" },
            { label: "Equipo", href: "/admin/equipo" },
            { label: cuenta.full_name },
          ]}
        />

        <AyudaSeccion tono="aviso" title="Solo lectura" className="mb-6">
          {motivoSinPermiso(profile.role, cuenta.role)}
        </AyudaSeccion>

        <Tarjeta>
          <TituloTarjeta
            title="Ficha de la cuenta"
            description="No se puede editar, desactivar, eliminar ni restablecerle la contraseña desde tu cuenta."
          />
          <dl className="grid gap-4 sm:grid-cols-2">
            <Dato etiqueta="Usuario" valor={usuario} mono />
            <Dato etiqueta="Rol" valor={ETIQUETA_ROL[cuenta.role]} />
            <Dato etiqueta="Cargo" valor={cuenta.cargo ?? "Sin cargo"} />
            <Dato
              etiqueta="Estado"
              valor={cuenta.active ? "Activa" : "Desactivada"}
            />
          </dl>
        </Tarjeta>
      </>
    );
  }

  return (
    <>
      <CabeceraPanel
        title={cuenta.full_name}
        description={`Entra al portal con el usuario ${usuario}.`}
        backHref="/admin/equipo"
        backLabel="Volver a Equipo"
        breadcrumb={[
          { label: "Panel", href: "/admin" },
          { label: "Equipo", href: "/admin/equipo" },
          { label: cuenta.full_name },
        ]}
      />

      <AvisoGuardar unico />

      {esUnoMismo && (
        <AyudaSeccion tono="aviso" title="Esta es tu propia cuenta" className="mb-6">
          Puedes cambiar tus datos, pero no tu rol ni tu estado: eso lo hace otro
          administrador. Es lo que evita que el sistema se quede sin nadie que
          pueda entrar. Tu contraseña la cambias desde{" "}
          <strong>Mi cuenta</strong>, no desde aquí.
        </AyudaSeccion>
      )}

      <FormularioCuenta
        action={actualizarCuenta}
        submitLabel="Guardar cambios"
        backHref="/admin/equipo"
      >
        <CamposCuenta cuenta={cuenta} actor={profile.role} esUnoMismo={esUnoMismo} />
      </FormularioCuenta>

      {!esUnoMismo && configurado && (
        <div className="mt-8 space-y-6">
          <Tarjeta>
            <TituloTarjeta
              title="Contraseña"
              description="Si la persona olvidó la suya, genérale una nueva y entrégasela."
            />
            <BotonRestablecer
              action={restablecerPassword}
              id={cuenta.id}
              nombre={cuenta.full_name}
            />
          </Tarjeta>

          <Tarjeta className="border-error-300">
            <TituloTarjeta
              title="Eliminar la cuenta"
              description="Permanente. Se borran también sus jornadas registradas."
            />
            <AyudaSeccion tono="aviso" className="mb-5">
              <strong>Desactivar no es eliminar.</strong> Si la persona salió de
              la empresa, lo correcto casi siempre es desactivar su cuenta: deja
              de poder entrar y su historial de jornadas se conserva para
              cualquier consulta posterior. Elimina solo las cuentas de prueba o
              las creadas por error.
            </AyudaSeccion>
            <EliminarConfirmando
              action={eliminarCuenta}
              id={cuenta.id}
              usuario={usuario}
              nombre={cuenta.full_name}
            />
          </Tarjeta>
        </div>
      )}
    </>
  );
}

/** Un dato de la ficha en modo solo lectura. */
function Dato({
  etiqueta,
  valor,
  mono = false,
}: {
  etiqueta: string;
  valor: string;
  mono?: boolean;
}) {
  return (
    <div>
      <dt className="text-[13px] font-semibold text-acero-600">{etiqueta}</dt>
      <dd
        className={`mt-1 text-azul-950 ${mono ? "font-mono text-sm" : "text-base"}`}
      >
        {valor}
      </dd>
    </div>
  );
}
