import { requireContentEditor } from "@/lib/supabase/auth";
import { getAjustes } from "@/lib/admin/lecturas";
import {
  AreaTexto,
  AvisoGuardar,
  AyudaSeccion,
  CabeceraPanel,
  Campo,
  Tarjeta,
  TituloTarjeta,
} from "@/components/admin/ui";
import { FormularioAdmin } from "@/components/admin/FormularioAdmin";
import { CampoImagen } from "@/components/admin/CampoImagen";
import { guardarCabeceraPagina, guardarPaginaNoEncontrada } from "../actions";
import type { CabeceraPagina } from "@/lib/content-types";

export const dynamic = "force-dynamic";

type Bloque = {
  clave: "servicios" | "proyectos" | "contacto";
  titulo: string;
  descripcion: string;
  ruta: string;
};

const BLOQUES: Bloque[] = [
  {
    clave: "servicios",
    titulo: "Cabecera de Servicios",
    descripcion: "Lo que abre la página /servicios, encima del listado.",
    ruta: "/servicios",
  },
  {
    clave: "proyectos",
    titulo: "Cabecera de Proyectos",
    descripcion: "Lo que abre la página /proyectos, encima de los casos de éxito.",
    ruta: "/proyectos",
  },
  {
    clave: "contacto",
    titulo: "Cabecera de Contacto",
    descripcion: "Lo que abre la página /contacto, encima de los datos y del formulario.",
    ruta: "/contacto",
  },
];

/**
 * CABECERAS DE LAS PÁGINAS INTERNAS
 * =================================
 * Edita la clave `paginas` de `site_settings` (forma `AjustesPaginas`). Son los
 * textos que nadie recuerda dónde se cambian: por eso tienen su propia pantalla
 * y no están escondidos dentro de cada listado.
 */
export default async function PaginasPage() {
  await requireContentEditor();
  const { paginas } = await getAjustes();

  return (
    <>
      <CabeceraPanel
        title="Cabeceras de páginas"
        description="Los títulos, las bajadas y las fotos con las que abren Servicios, Proyectos y Contacto."
        backHref="/admin/contenido"
        backLabel="Volver a Contenido"
        breadcrumb={[
          { label: "Panel", href: "/admin" },
          { label: "Contenido del sitio", href: "/admin/contenido" },
          { label: "Cabeceras de páginas" },
        ]}
      />

      <AvisoGuardar />

      <AyudaSeccion className="mb-6">
        La cabecera es la franja de arriba de cada página: un rótulo pequeño, un
        título grande, una frase de apoyo y, si quieres, una foto de fondo. No
        cambia lo que hay debajo (los servicios, los proyectos o el formulario),
        solo su presentación.
      </AyudaSeccion>

      <div className="space-y-6">
        {BLOQUES.map((bloque) => {
          const datos = (paginas[bloque.clave] ?? {}) as CabeceraPagina & {
            intro?: string;
          };
          return (
            <Tarjeta key={bloque.clave}>
              <TituloTarjeta title={bloque.titulo} description={bloque.descripcion} />
              <FormularioAdmin action={guardarCabeceraPagina}>
                <input type="hidden" name="pagina" value={bloque.clave} />
                <div className="grid gap-4 sm:grid-cols-2">
                  <Campo
                    label="Línea pequeña de arriba"
                    name="eyebrow"
                    scope={bloque.clave}
                    defaultValue={datos.eyebrow}
                  />
                  <Campo
                    label="Título"
                    name="title"
                    scope={bloque.clave}
                    defaultValue={datos.title}
                  />
                  <AreaTexto
                    label="Frase de apoyo"
                    name="subtitle"
                    scope={bloque.clave}
                    rows={2}
                    defaultValue={datos.subtitle}
                    className="sm:col-span-2"
                  />
                  <AreaTexto
                    label="Párrafo de entrada"
                    name="intro"
                    scope={bloque.clave}
                    rows={3}
                    defaultValue={datos.intro}
                    hint="Va debajo del título, ya dentro del contenido. Puedes dejarlo vacío."
                    className="sm:col-span-2"
                  />
                  <div className="sm:col-span-2">
                    <CampoImagen
                      label="Foto de cabecera"
                      name="cover"
                      altName="cover_alt"
                      folder="cabeceras"
                      scope={bloque.clave}
                      defaultValue={datos.image?.src}
                      defaultAlt={datos.image?.alt}
                    />
                  </div>
                </div>
              </FormularioAdmin>
            </Tarjeta>
          );
        })}

        <Tarjeta>
          <TituloTarjeta
            title="Página «no encontrada»"
            description="Lo que ve alguien que llega a una dirección que ya no existe. Con un texto amable se queda; con un error seco, se va."
          />
          <FormularioAdmin action={guardarPaginaNoEncontrada}>
            <div className="space-y-4">
              <Campo
                label="Título"
                name="title"
                scope="404"
                defaultValue={paginas.noEncontrada?.title}
                placeholder="Esta página no existe"
              />
              <AreaTexto
                label="Texto"
                name="body"
                scope="404"
                rows={3}
                defaultValue={paginas.noEncontrada?.body}
                placeholder="Puede que el enlace esté mal escrito o que hayamos movido la página. Vuelve al inicio o escríbenos y te ayudamos."
              />
            </div>
          </FormularioAdmin>
        </Tarjeta>
      </div>
    </>
  );
}
