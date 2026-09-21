import Link from "next/link";
import { requireContentEditor } from "@/lib/supabase/auth";
import { listServicios } from "@/lib/admin/lecturas";
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
import { eliminarServicio } from "../actions";
import { ICONOS_CONTENIDO, IconoEngranaje, IconoLapiz, IconoMas } from "@/components/admin/iconos";

export const dynamic = "force-dynamic";

export default async function ServiciosPage({
  searchParams,
}: {
  searchParams: Promise<{ pagina?: string }>;
}) {
  await requireContentEditor();
  const servicios = await listServicios();
  const pagina = paginar(servicios, leerPagina((await searchParams).pagina));

  return (
    <>
      <CabeceraPanel
        title="Servicios"
        description="Lo que ofrece PIYC: sus textos, sus fotos y el orden en que aparecen. Lo que guardes se ve en el sitio en pocos minutos."
        backHref="/admin/contenido"
        backLabel="Volver a Contenido"
        breadcrumb={[
          { label: "Panel", href: "/admin" },
          { label: "Contenido del sitio", href: "/admin/contenido" },
          { label: "Servicios" },
        ]}
        action={
          <EnlacePrimario href="/admin/contenido/servicios/nuevo">
            <IconoMas className="h-4 w-4" />
            Nuevo servicio
          </EnlacePrimario>
        }
      />

      <AyudaSeccion className="mb-6">
        En cada fila ves si el servicio está visible y su número de{" "}
        <strong>orden</strong>: el más bajo aparece primero en el menú y en la
        página de servicios. {AYUDA_VISIBILIDAD} {AYUDA_ORDEN_PAGINAS}
      </AyudaSeccion>

      {servicios.length === 0 ? (
        <EstadoVacio
          title="Todavía no hay servicios"
          description="Crea el primero. Cada servicio tiene su propia página en el sitio, con su descripción, sus alcances y sus fotos."
          action={
            <EnlacePrimario href="/admin/contenido/servicios/nuevo">
              <IconoMas className="h-4 w-4" />
              Crear servicio
            </EnlacePrimario>
          }
        />
      ) : (
        <>
          <ul id="lista-servicios" className="scroll-mt-8 space-y-3">
            {pagina.visibles.map((servicio) => {
              const Icono =
                ICONOS_CONTENIDO[servicio.icon_key as keyof typeof ICONOS_CONTENIDO] ??
                IconoEngranaje;
              return (
                <li
                  key={servicio.id}
                  className="flex flex-wrap items-center gap-4 rounded-fino border border-acero-200 bg-blanco p-4"
                >
                  <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-fino border border-acero-200 bg-acero-50 text-azul-700">
                    <Icono className="h-5 w-5" />
                  </span>

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="font-titulo text-lg font-semibold uppercase tracking-wide text-azul-950">
                        {servicio.title}
                      </h2>
                      <InsigniaPublicado published={servicio.published} />
                      <span className="text-xs text-acero-500">
                        orden {servicio.sort}
                      </span>
                    </div>
                    <p className="mt-0.5 truncate font-mono text-xs text-acero-500">
                      /servicios/{servicio.slug}
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <Link
                      prefetch={false}
                      href={`/servicios/${servicio.slug}`}
                      target="_blank"
                      className="inline-flex items-center gap-1.5 rounded-fino border border-acero-300 bg-blanco px-3 py-2 text-xs font-semibold text-acero-700 transition-colors hover:border-azul-700 hover:text-azul-700"
                    >
                      Ver en el sitio
                    </Link>
                    <Link
                      prefetch={false}
                      href={`/admin/contenido/servicios/${servicio.id}`}
                      className="inline-flex items-center gap-1.5 rounded-fino bg-azul-700 px-3 py-2 text-xs font-semibold text-blanco transition-colors hover:bg-azul-800"
                    >
                      <IconoLapiz className="h-3.5 w-3.5" />
                      Editar
                    </Link>
                    <FormularioEliminar
                      action={eliminarServicio}
                      id={servicio.id}
                      confirmMessage={`¿Eliminar el servicio «${servicio.title}»?\n\nEsto borra sus textos y la referencia a sus fotos para siempre, y no se puede deshacer.\n\nSi solo quieres retirarlo del sitio, cancela y ponlo en «Oculto»: así se conserva y puedes volver a mostrarlo cuando quieras.`}
                    />
                  </div>
                </li>
              );
            })}
          </ul>
          <Paginacion
            pagina={pagina.pagina}
            total={pagina.total}
            hrefBase="/admin/contenido/servicios"
            ancla="lista-servicios"
            etiqueta="Páginas de servicios"
          />
        </>
      )}
    </>
  );
}
