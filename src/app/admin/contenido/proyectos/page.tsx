import Link from "next/link";
import { requireContentEditor } from "@/lib/supabase/auth";
import { listProyectos } from "@/lib/admin/lecturas";
import { leerPagina, paginar } from "@/lib/paginacion";
import {
  AYUDA_ORDEN_PAGINAS,
  AYUDA_VISIBILIDAD,
  AyudaSeccion,
  CabeceraPanel,
  EnlacePrimario,
  EstadoVacio,
  InsigniaPublicado,
  Paginacion,
} from "@/components/admin/ui";
import { FormularioEliminar } from "@/components/admin/FormularioAdmin";
import { eliminarProyecto } from "../actions";
import { IconoFoto, IconoLapiz, IconoMas } from "@/components/admin/iconos";

export const dynamic = "force-dynamic";

export default async function ProyectosPage({
  searchParams,
}: {
  searchParams: Promise<{ pagina?: string }>;
}) {
  await requireContentEditor();
  const proyectos = await listProyectos();
  const pagina = paginar(proyectos, leerPagina((await searchParams).pagina));

  return (
    <>
      <CabeceraPanel
        title="Proyectos"
        description="Los trabajos ya realizados. Cada uno tiene su propia página con su galería."
        backHref="/admin/contenido"
        backLabel="Volver a Contenido"
        breadcrumb={[
          { label: "Panel", href: "/admin" },
          { label: "Contenido del sitio", href: "/admin/contenido" },
          { label: "Proyectos" },
        ]}
        action={
          <EnlacePrimario href="/admin/contenido/proyectos/nuevo">
            <IconoMas className="h-4 w-4" />
            Nuevo proyecto
          </EnlacePrimario>
        }
      />

      <AyudaSeccion className="mb-6">
        Los proyectos son lo que más convence a un cliente nuevo: son la prueba
        de que el trabajo ya se hizo. {AYUDA_VISIBILIDAD} {AYUDA_ORDEN_PAGINAS}
      </AyudaSeccion>

      {proyectos.length === 0 ? (
        <EstadoVacio
          title="Todavía no hay proyectos"
          description="Agrega el primero: un trabajo real, con una foto y tres frases de qué se hizo, vale más que cualquier texto publicitario."
          action={
            <EnlacePrimario href="/admin/contenido/proyectos/nuevo">
              <IconoMas className="h-4 w-4" />
              Crear proyecto
            </EnlacePrimario>
          }
        />
      ) : (
        <>
          <ul id="lista-proyectos" className="scroll-mt-8 space-y-3">
            {pagina.visibles.map((proyecto) => (
              <li
                key={proyecto.id}
                className="flex flex-wrap items-center gap-4 rounded-fino border border-acero-200 bg-blanco p-4"
              >
                <span className="flex h-14 w-20 shrink-0 items-center justify-center overflow-hidden rounded-fino border border-acero-200 bg-acero-50">
                  {proyecto.images.cover ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={proyecto.images.cover}
                      alt=""
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <IconoFoto className="h-5 w-5 text-acero-400" />
                  )}
                </span>

                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="font-titulo text-lg font-semibold uppercase tracking-wide text-azul-950">
                      {proyecto.title}
                    </h2>
                    <InsigniaPublicado published={proyecto.published} />
                    <span className="text-xs text-acero-500">orden {proyecto.sort}</span>
                  </div>
                  <p className="mt-0.5 truncate text-sm text-acero-600">
                    {proyecto.client ?? "Sin cliente indicado"}
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <Link
                    prefetch={false}
                    href={`/proyectos/${proyecto.slug}`}
                    target="_blank"
                    className="inline-flex items-center gap-1.5 rounded-fino border border-acero-300 bg-blanco px-3 py-2 text-xs font-semibold text-acero-700 transition-colors hover:border-azul-700 hover:text-azul-700"
                  >
                    Ver en el sitio
                  </Link>
                  <Link
                    prefetch={false}
                    href={`/admin/contenido/proyectos/${proyecto.id}`}
                    className="inline-flex items-center gap-1.5 rounded-fino bg-azul-700 px-3 py-2 text-xs font-semibold text-blanco transition-colors hover:bg-azul-800"
                  >
                    <IconoLapiz className="h-3.5 w-3.5" />
                    Editar
                  </Link>
                  <FormularioEliminar
                    action={eliminarProyecto}
                    id={proyecto.id}
                    confirmMessage={`¿Eliminar el proyecto «${proyecto.title}»?\n\nEsto borra su texto y su galería para siempre, y no se puede deshacer.\n\nSi solo quieres retirarlo del sitio, cancela y ponlo en «Oculto».`}
                  />
                </div>
              </li>
            ))}
          </ul>
          <Paginacion
            pagina={pagina.pagina}
            total={pagina.total}
            hrefBase="/admin/contenido/proyectos"
            ancla="lista-proyectos"
            etiqueta="Páginas de proyectos"
          />
        </>
      )}
    </>
  );
}
