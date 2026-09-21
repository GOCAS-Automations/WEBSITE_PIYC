import { notFound } from "next/navigation";
import { requireContentEditor } from "@/lib/supabase/auth";
import { getServicio } from "@/lib/admin/lecturas";
import { AvisoGuardar, CabeceraPanel } from "@/components/admin/ui";
import { FormularioAdmin } from "@/components/admin/FormularioAdmin";
import { CamposServicio } from "../CamposServicio";
import { guardarServicio } from "../../actions";

export const dynamic = "force-dynamic";

export default async function EditarServicioPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireContentEditor();
  const { id } = await params;
  const servicio = await getServicio(id);
  if (!servicio) notFound();

  return (
    <>
      <CabeceraPanel
        title={servicio.title}
        description={`Se publica en piycsas.com/servicios/${servicio.slug}`}
        backHref="/admin/contenido/servicios"
        backLabel="Volver a Servicios"
        breadcrumb={[
          { label: "Panel", href: "/admin" },
          { label: "Contenido del sitio", href: "/admin/contenido" },
          { label: "Servicios", href: "/admin/contenido/servicios" },
          { label: servicio.title },
        ]}
      />

      <AvisoGuardar unico />

      <FormularioAdmin
        action={guardarServicio}
        submitLabel="Guardar servicio"
        backHref="/admin/contenido/servicios"
      >
        <CamposServicio servicio={servicio} />
      </FormularioAdmin>
    </>
  );
}
