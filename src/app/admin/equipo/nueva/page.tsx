import { requireManager } from "@/lib/supabase/auth";
import { isServiceRoleConfigured } from "@/lib/supabase/admin";
import { AvisoGuardar, AyudaSeccion, CabeceraPanel } from "@/components/admin/ui";
import { FormularioCuenta } from "../FormularioCuenta";
import { CamposCuenta } from "../CamposCuenta";
import { crearCuenta } from "../actions";

export const dynamic = "force-dynamic";

export default async function NuevaCuentaPage() {
  const { profile } = await requireManager();
  const configurado = isServiceRoleConfigured();

  return (
    <>
      <CabeceraPanel
        title="Nueva cuenta"
        description="Una cuenta por persona. Compartir una entre varias hace que las jornadas dejen de decir quién trabajó."
        backHref="/admin/equipo"
        backLabel="Volver a Equipo"
        breadcrumb={[
          { label: "Panel", href: "/admin" },
          { label: "Equipo", href: "/admin/equipo" },
          { label: "Nueva cuenta" },
        ]}
      />

      {!configurado ? (
        <AyudaSeccion tono="aviso" title="Falta la clave de servicio">
          No se pueden crear cuentas sin la variable{" "}
          <span className="font-mono text-xs">SUPABASE_SERVICE_ROLE_KEY</span> en
          el servidor. Cárgala y vuelve a desplegar.
        </AyudaSeccion>
      ) : (
        <>
          <AvisoGuardar unico />

          <AyudaSeccion className="mb-6">
            Al guardar verás <strong>una sola vez</strong> el usuario y la
            contraseña con los que la persona entra. Cópialos antes de cerrar la
            pantalla: la contraseña no se guarda en ninguna parte y, si se
            pierde, hay que restablecerla.
          </AyudaSeccion>

          <FormularioCuenta
            action={crearCuenta}
            submitLabel="Crear cuenta"
            backHref="/admin/equipo"
          >
            <CamposCuenta actor={profile.role} />
          </FormularioCuenta>
        </>
      )}
    </>
  );
}
