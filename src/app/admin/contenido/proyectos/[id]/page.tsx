import { notFound } from "next/navigation";
import { requireContentEditor } from "@/lib/supabase/auth";
import { getProyecto } from "@/lib/admin/lecturas";
import { AvisoGuardar, CabeceraPanel } from "@/components/admin/ui";
import { FormularioAdmin } from "@/components/admin/FormularioAdmin";
import { CamposProyecto } from "../CamposProyecto";
import { guardarProyecto } from "../../actions";

export const dynamic = "force-dynamic";

export default async function EditarProyectoPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireContentEditor();
  const { id } = await params;
  const proyecto = await getProyecto(id);
  if (!proyecto) notFound();

  return (
    <>
      <CabeceraPanel
        title={proyecto.title}
        description={`Se publica en piycsas.com/proyectos/${proyecto.slug}`}
        backHref="/admin/contenido/proyectos"
        backLabel="Volver a Proyectos"
        breadcrumb={[
          { label: "Panel", href: "/admin" },
          { label: "Contenido del sitio", href: "/admin/contenido" },
          { label: "Proyectos", href: "/admin/contenido/proyectos" },
          { label: proyecto.title },
        ]}
      />

      <AvisoGuardar unico />

      <FormularioAdmin
        action={guardarProyecto}
        submitLabel="Guardar proyecto"
        backHref="/admin/contenido/proyectos"
      >
        <CamposProyecto proyecto={proyecto} />
      </FormularioAdmin>
    </>
  );
}
