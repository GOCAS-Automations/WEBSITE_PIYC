import { Fragment } from "react";
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
import { CampoParejas } from "@/components/admin/CampoParejas";
import {
  guardarCabeceraPagina,
  guardarCierrePagina,
  guardarFaqPagina,
  guardarPaginaNoEncontrada,
  guardarPlantillasDeFicha,
  guardarTextosFormulario,
} from "../actions";
import type { CabeceraPagina, CierrePagina, PreguntaFrecuente } from "@/lib/content-types";

export const dynamic = "force-dynamic";

type Bloque = {
  clave: "servicios" | "proyectos" | "contacto";
  nombre: string;
  titulo: string;
  descripcion: string;
  ruta: string;
};

const BLOQUES: Bloque[] = [
  {
    clave: "servicios",
    nombre: "Servicios",
    titulo: "Cabecera de Servicios",
    descripcion: "Lo que abre la página /servicios, encima del listado.",
    ruta: "/servicios",
  },
  {
    clave: "proyectos",
    nombre: "Proyectos",
    titulo: "Cabecera de Proyectos",
    descripcion: "Lo que abre la página /proyectos, encima de los casos de éxito.",
    ruta: "/proyectos",
  },
  {
    clave: "contacto",
    nombre: "Contacto",
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
        title="Textos de las páginas"
        description="Los textos de Servicios, Proyectos y Contacto: cabecera, franja de cierre, preguntas frecuentes y formulario. Y los que se repiten en todas las fichas."
        backHref="/admin/contenido"
        backLabel="Volver a Contenido"
        breadcrumb={[
          { label: "Panel", href: "/admin" },
          { label: "Contenido del sitio", href: "/admin/contenido" },
          { label: "Textos de las páginas" },
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
          // Las tres páginas comparten cabecera; cada una añade lo suyo
          // (cierre, FAQ, textos del formulario). El molde común evita tener
          // que discriminar la unión en cada campo.
          const datos = (paginas[bloque.clave] ?? {}) as CabeceraPagina & {
            intro?: string;
            cta?: CierrePagina;
            faq?: PreguntaFrecuente[];
          };
          return (
            <Fragment key={bloque.clave}>
            <Tarjeta>
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

            {/* Franja de cierre: solo Servicios y Proyectos la tienen
                editable. La de Contacto no existe (ahí manda el formulario). */}
            {bloque.clave !== "contacto" ? (
              <Tarjeta>
                <TituloTarjeta
                  title={`Franja de cierre de ${bloque.nombre}`}
                  description="La última llamada a la acción, al final de la página. Los dos botones son siempre los mismos."
                />
                <FormularioAdmin action={guardarCierrePagina}>
                  <input type="hidden" name="pagina" value={bloque.clave} />
                  <div className="space-y-4">
                    <Campo
                      label="Título"
                      name="title"
                      scope={`cierre-${bloque.clave}`}
                      defaultValue={datos.cta?.title}
                    />
                    <AreaTexto
                      label="Texto"
                      name="body"
                      scope={`cierre-${bloque.clave}`}
                      rows={2}
                      defaultValue={datos.cta?.body}
                    />
                  </div>
                </FormularioAdmin>
              </Tarjeta>
            ) : null}

            {/* Los dos párrafos que acompañan al formulario de contacto. */}
            {bloque.clave === "contacto" ? (
              <Tarjeta>
                <TituloTarjeta
                  title="Textos del formulario"
                  description="Los dos párrafos que rodean el formulario de contacto."
                />
                <FormularioAdmin action={guardarTextosFormulario}>
                  <div className="space-y-4">
                    <AreaTexto
                      label="Párrafo de arriba del formulario"
                      name="intro_formulario"
                      scope="formulario"
                      rows={2}
                      defaultValue={paginas.contacto?.introFormulario}
                      hint="Qué pasa al enviar. El sitio no manda correos: abre WhatsApp con el mensaje ya escrito."
                    />
                    <AreaTexto
                      label="Nota de abajo del formulario"
                      name="nota_formulario"
                      scope="formulario"
                      rows={2}
                      defaultValue={paginas.contacto?.notaFormulario}
                      hint="Qué se hace con los datos de quien escribe. Déjala vacía si no quieres nota."
                    />
                    <div className="grid gap-4 sm:grid-cols-3">
                      <Campo
                        label="Título del bloque de datos"
                        name="titulo_datos"
                        scope="formulario"
                        defaultValue={paginas.contacto?.tituloDatos}
                        placeholder="Dónde encontrarnos"
                      />
                      <Campo
                        label="Título del bloque del formulario"
                        name="titulo_formulario"
                        scope="formulario"
                        defaultValue={paginas.contacto?.tituloFormulario}
                        placeholder="Cuéntenos qué necesita"
                      />
                      <Campo
                        label="Título del bloque del mapa"
                        name="titulo_mapa"
                        scope="formulario"
                        defaultValue={paginas.contacto?.tituloMapa}
                        placeholder="Cómo llegar"
                      />
                    </div>
                  </div>
                </FormularioAdmin>
              </Tarjeta>
            ) : null}

            {/* Preguntas frecuentes: Servicios y Contacto. */}
            {bloque.clave !== "proyectos" ? (
              <Tarjeta>
                <TituloTarjeta
                  title={`Preguntas frecuentes de ${bloque.nombre}`}
                  description="Se pintan como acordeón al final de la página y Google las puede mostrar en los resultados."
                />
                <AyudaSeccion className="mb-5">
                  No prometas plazos, precios ni garantías que PIYC no haya
                  confirmado: estas respuestas son públicas. Si borras todas, el
                  bloque desaparece de la página.
                </AyudaSeccion>
                <FormularioAdmin action={guardarFaqPagina}>
                  <input type="hidden" name="pagina" value={bloque.clave} />
                  <CampoParejas
                    label="Preguntas"
                    nameA="pregunta"
                    nameB="respuesta"
                    etiquetaA="Pregunta"
                    etiquetaB="Respuesta"
                    filasB={3}
                    placeholderA="¿Atienden fuera de Cali?"
                    placeholderB="La base está en Cali, Valle del Cauca. Para otras ciudades, escríbanos con el alcance."
                    textoAgregar="Agregar pregunta"
                    defaultValue={(datos.faq ?? []).map((item) => ({
                      a: item.pregunta,
                      b: item.respuesta,
                    }))}
                  />
                </FormularioAdmin>
              </Tarjeta>
            ) : null}
            </Fragment>
          );
        })}

        <Tarjeta>
          <TituloTarjeta
            title="Textos que se repiten en todas las fichas"
            description="Las páginas de cada servicio y de cada caso de éxito comparten estos textos. No pertenecen a una ficha concreta, por eso se editan aquí."
          />
          <FormularioAdmin action={guardarPlantillasDeFicha}>
            <div className="space-y-4">
              <AreaTexto
                label="Ficha de un caso — frase bajo los datos del proyecto"
                name="nota_servicios"
                scope="ficha"
                rows={2}
                defaultValue={paginas.proyectoDetalle?.notaServicios}
                hint="Solo aparece cuando el caso tiene servicios asociados."
              />
              <div className="grid gap-4 sm:grid-cols-2">
                <Campo
                  label="Ficha de un caso — título del cierre"
                  name="proyecto_cta_title"
                  scope="ficha"
                  defaultValue={paginas.proyectoDetalle?.cta?.title}
                />
                <AreaTexto
                  label="Ficha de un caso — texto del cierre"
                  name="proyecto_cta_body"
                  scope="ficha"
                  rows={2}
                  defaultValue={paginas.proyectoDetalle?.cta?.body}
                />
              </div>
              <div className="grid gap-4 sm:grid-cols-3">
                <Campo
                  label="Ficha de un caso — título del cuerpo"
                  name="proyecto_titulo_cuerpo"
                  scope="ficha"
                  defaultValue={paginas.proyectoDetalle?.tituloCuerpo}
                  placeholder="Contexto, solución y resultado"
                />
                <Campo
                  label="Ficha de un caso — título de la galería"
                  name="proyecto_titulo_galeria"
                  scope="ficha"
                  defaultValue={paginas.proyectoDetalle?.tituloGaleria}
                  placeholder="Galería"
                />
                <Campo
                  label="Ficha de un caso — título de los servicios"
                  name="proyecto_titulo_servicios"
                  scope="ficha"
                  defaultValue={paginas.proyectoDetalle?.tituloServicios}
                  placeholder="Servicios que intervinieron"
                />
              </div>

              <AreaTexto
                label="Ficha de un servicio — texto del cierre"
                name="servicio_cta_body"
                scope="ficha"
                rows={2}
                defaultValue={paginas.servicioDetalle?.ctaTexto}
                hint="El título lo arma el sitio con el nombre del servicio («¿Necesita telemetría?»)."
              />
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <Campo
                  label="Ficha de un servicio — título del alcance"
                  name="servicio_titulo_alcance"
                  scope="ficha"
                  defaultValue={paginas.servicioDetalle?.tituloAlcance}
                  placeholder="Alcance y forma de trabajo"
                />
                <Campo
                  label="Ficha de un servicio — título de «Qué incluye»"
                  name="servicio_titulo_incluye"
                  scope="ficha"
                  defaultValue={paginas.servicioDetalle?.tituloIncluye}
                  placeholder="Qué incluye"
                />
                <Campo
                  label="Ficha de un servicio — título de la galería"
                  name="servicio_titulo_galeria"
                  scope="ficha"
                  defaultValue={paginas.servicioDetalle?.tituloGaleria}
                  placeholder="Galería"
                />
                <Campo
                  label="Ficha de un servicio — título de los casos"
                  name="servicio_titulo_casos"
                  scope="ficha"
                  defaultValue={paginas.servicioDetalle?.tituloCasos}
                  placeholder="Proyectos con este servicio"
                />
                <Campo
                  label="Ficha de un servicio — título de «Otros servicios»"
                  name="servicio_titulo_otros"
                  scope="ficha"
                  defaultValue={paginas.servicioDetalle?.tituloOtros}
                  placeholder="Otros servicios"
                />
              </div>
            </div>
          </FormularioAdmin>
        </Tarjeta>

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
                placeholder="Puede que el enlace esté mal escrito o que hayamos movido la página. Vuelva al inicio o escríbanos y le ayudamos."
              />
            </div>
          </FormularioAdmin>
        </Tarjeta>
      </div>
    </>
  );
}
