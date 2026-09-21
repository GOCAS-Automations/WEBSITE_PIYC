import { requireContentEditor } from "@/lib/supabase/auth";
import { AvisoGuardar, CabeceraPanel } from "@/components/admin/ui";
import { FormularioAdmin } from "@/components/admin/FormularioAdmin";
import { CamposProyecto } from "../CamposProyecto";
import { guardarProyecto } from "../../actions";

export const dynamic = "force-dynamic";

export default async function NuevoProyectoPage() {
  await requireContentEditor();

  return (
    <>
      <CabeceraPanel
        title="Nuevo proyecto"
        description="Un caso de éxito del portafolio. Tendrá su propia página en el sitio."
        backHref="/admin/contenido/proyectos"
        backLabel="Volver a Proyectos"
        breadcrumb={[
          { label: "Panel", href: "/admin" },
          { label: "Contenido del sitio", href: "/admin/contenido" },
          { label: "Proyectos", href: "/admin/contenido/proyectos" },
          { label: "Nuevo" },
        ]}
      />

      <AvisoGuardar unico />

      <FormularioAdmin
        action={guardarProyecto}
        submitLabel="Crear proyecto"
        backHref="/admin/contenido/proyectos"
      >
        <CamposProyecto />
      </FormularioAdmin>
    </>
  );
}
