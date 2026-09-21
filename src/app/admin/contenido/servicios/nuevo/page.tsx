import { requireContentEditor } from "@/lib/supabase/auth";
import { AvisoGuardar, CabeceraPanel } from "@/components/admin/ui";
import { FormularioAdmin } from "@/components/admin/FormularioAdmin";
import { CamposServicio } from "../CamposServicio";
import { guardarServicio } from "../../actions";

export const dynamic = "force-dynamic";

export default async function NuevoServicioPage() {
  await requireContentEditor();

  return (
    <>
      <CabeceraPanel
        title="Nuevo servicio"
        description="Un servicio nuevo del portafolio de PIYC. Tendrá su propia página en el sitio."
        backHref="/admin/contenido/servicios"
        backLabel="Volver a Servicios"
        breadcrumb={[
          { label: "Panel", href: "/admin" },
          { label: "Contenido del sitio", href: "/admin/contenido" },
          { label: "Servicios", href: "/admin/contenido/servicios" },
          { label: "Nuevo" },
        ]}
      />

      <AvisoGuardar unico />

      <FormularioAdmin
        action={guardarServicio}
        submitLabel="Crear servicio"
        backHref="/admin/contenido/servicios"
      >
        <CamposServicio />
      </FormularioAdmin>
    </>
  );
}
