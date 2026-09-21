import Link from "next/link";
import { requireContentEditor } from "@/lib/supabase/auth";
import { getAjustes, listProyectos, listServicios } from "@/lib/admin/lecturas";
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
import { CampoLista } from "@/components/admin/CampoLista";
import { CampoParejas } from "@/components/admin/CampoParejas";
import {
  guardarInicioCierre,
  guardarInicioDestacados,
  guardarInicioFranja,
  guardarInicioHero,
  guardarInicioIntro,
  guardarInicioProceso,
  guardarInicioValores,
} from "../actions";

export const dynamic = "force-dynamic";

/**
 * Las dos franjas de listado de la portada. El encabezado de cada una (rótulo,
 * título, entrada y texto del enlace) se guarda con la misma acción; la clave
 * viaja en un campo oculto y la acción la valida.
 */
const FRANJAS = [
  {
    clave: "seccionServicios",
    titulo: "Franja de servicios",
    descripcion:
      "Los textos que encabezan la franja de servicios de la portada. Cuáles se muestran se decide más abajo, en «Qué se destaca en la portada».",
    ruta: "/servicios",
    placeholderEyebrow: "Portafolio",
    placeholderTitulo: "Servicios",
    placeholderEnlace: "Ver los nueve servicios",
  },
  {
    clave: "seccionProyectos",
    titulo: "Franja de casos de éxito",
    descripcion: "Los textos que encabezan la franja de proyectos de la portada.",
    ruta: "/proyectos",
    placeholderEyebrow: "Casos de éxito",
    placeholderTitulo: "Proyectos entregados y funcionando",
    placeholderEnlace: "Ver todos los proyectos",
  },
] as const;

/**
 * PÁGINA DE INICIO
 * ================
 * Edita la clave `home` de `site_settings`, bloque a bloque, con la forma exacta
 * que define `src/lib/content-types.ts` (`AjustesHome`). Cada tarjeta guarda
 * SOLO su parte del JSON: la acción lee el valor actual, fusiona y reescribe,
 * así dos personas editando bloques distintos no se pisan.
 */
export default async function InicioPage() {
  await requireContentEditor();
  const [ajustes, servicios, proyectos] = await Promise.all([
    getAjustes(),
    listServicios(),
    listProyectos(),
  ]);
  const home = ajustes.home;

  return (
    <>
      <CabeceraPanel
        title="Página de inicio"
        description="La portada de piycsas.com: lo primero que ve quien llega desde Google o desde un enlace."
        backHref="/admin/contenido"
        backLabel="Volver a Contenido"
        breadcrumb={[
          { label: "Panel", href: "/admin" },
          { label: "Contenido del sitio", href: "/admin/contenido" },
          { label: "Página de inicio" },
        ]}
      />

      <AvisoGuardar />

      <div className="space-y-6">
        {/* --- Hero ------------------------------------------------- */}
        <Tarjeta>
          <TituloTarjeta
            title="Primera pantalla"
            description="El titular grande y los dos botones. Es lo único que muchos visitantes van a leer."
          />
          <FormularioAdmin action={guardarInicioHero}>
            <div className="grid gap-4 sm:grid-cols-2">
              <Campo
                label="Línea pequeña de arriba"
                name="eyebrow"
                scope="hero"
                defaultValue={home.hero?.eyebrow}
                placeholder="Cali, Valle del Cauca"
              />
              <Campo
                label="Titular"
                name="title"
                scope="hero"
                defaultValue={home.hero?.title}
                placeholder="Tu socio confiable en soluciones industriales"
                hint="Corto y concreto: qué hace PIYC, no qué siente."
              />
              <AreaTexto
                label="Frase de apoyo"
                name="subtitle"
                scope="hero"
                rows={2}
                defaultValue={home.hero?.subtitle}
                className="sm:col-span-2"
              />
              <Campo
                label="Botón principal — texto"
                name="cta1_etiqueta"
                scope="hero"
                defaultValue={home.hero?.ctaPrimario?.etiqueta}
                placeholder="Cotizar por WhatsApp"
              />
              <Campo
                label="Botón principal — a dónde lleva"
                name="cta1_href"
                scope="hero"
                defaultValue={home.hero?.ctaPrimario?.href}
                placeholder="/contacto"
                hint="Una dirección del propio sitio empieza por barra: /contacto, /servicios."
              />
              <Campo
                label="Botón secundario — texto"
                name="cta2_etiqueta"
                scope="hero"
                defaultValue={home.hero?.ctaSecundario?.etiqueta}
                placeholder="Ver servicios"
              />
              <Campo
                label="Botón secundario — a dónde lleva"
                name="cta2_href"
                scope="hero"
                defaultValue={home.hero?.ctaSecundario?.href}
                placeholder="/servicios"
              />
            </div>
          </FormularioAdmin>
        </Tarjeta>

        {/* --- Intro ------------------------------------------------ */}
        <Tarjeta>
          <TituloTarjeta
            title="Qué hace PIYC"
            description="El bloque de presentación que va debajo de la primera pantalla."
          />
          <FormularioAdmin action={guardarInicioIntro}>
            <div className="grid gap-4 sm:grid-cols-2">
              <Campo
                label="Línea pequeña de arriba"
                name="eyebrow"
                scope="intro"
                defaultValue={home.intro?.eyebrow}
                placeholder="Quiénes somos"
              />
              <Campo
                label="Título"
                name="title"
                scope="intro"
                defaultValue={home.intro?.title}
              />
              <AreaTexto
                label="Texto"
                name="body"
                scope="intro"
                rows={6}
                defaultValue={home.intro?.body}
                hint="Separa los párrafos dejando una línea en blanco entre ellos."
                className="sm:col-span-2"
              />
              <Campo
                label="Texto del enlace a Nosotros"
                name="cta_etiqueta"
                scope="intro"
                defaultValue={home.intro?.ctaEtiqueta}
                placeholder="Conocer a PIYC"
                hint="Si lo dejas vacío, el enlace no se pinta."
                className="sm:col-span-2"
              />
              <div className="sm:col-span-2">
                <CampoImagen
                  label="Foto del bloque"
                  name="cover"
                  altName="cover_alt"
                  folder="inicio"
                  scope="intro"
                  defaultValue={home.intro?.image?.src}
                  defaultAlt={home.intro?.image?.alt}
                />
              </div>
            </div>
          </FormularioAdmin>
        </Tarjeta>

        {/* --- Encabezados de las dos franjas de listado ------------- */}
        {FRANJAS.map((franja) => {
          const datos = home[franja.clave];
          return (
            <Tarjeta key={franja.clave}>
              <TituloTarjeta title={franja.titulo} description={franja.descripcion} />
              <FormularioAdmin action={guardarInicioFranja}>
                <input type="hidden" name="franja" value={franja.clave} />
                <div className="grid gap-4 sm:grid-cols-2">
                  <Campo
                    label="Línea pequeña de arriba"
                    name="eyebrow"
                    scope={franja.clave}
                    defaultValue={datos?.eyebrow}
                    placeholder={franja.placeholderEyebrow}
                  />
                  <Campo
                    label="Título"
                    name="title"
                    scope={franja.clave}
                    defaultValue={datos?.title}
                    placeholder={franja.placeholderTitulo}
                  />
                  <AreaTexto
                    label="Párrafo de entrada"
                    name="intro"
                    scope={franja.clave}
                    rows={2}
                    defaultValue={datos?.intro}
                    className="sm:col-span-2"
                  />
                  <Campo
                    label="Texto del enlace «ver todos»"
                    name="cta_etiqueta"
                    scope={franja.clave}
                    defaultValue={datos?.ctaEtiqueta}
                    placeholder={franja.placeholderEnlace}
                    hint={`Siempre lleva a ${franja.ruta}. Si lo dejas vacío, el enlace no se pinta.`}
                    className="sm:col-span-2"
                  />
                </div>
              </FormularioAdmin>
            </Tarjeta>
          );
        })}

        {/* --- Proceso ---------------------------------------------- */}
        <Tarjeta>
          <TituloTarjeta
            title="Cómo trabajamos"
            description="Los pasos del proceso, del diagnóstico al soporte. Es lo que le quita el miedo a quien nunca ha contratado automatización."
          />
          <FormularioAdmin action={guardarInicioProceso}>
            <div className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <Campo
                  label="Línea pequeña de arriba"
                  name="eyebrow"
                  scope="proceso"
                  defaultValue={home.proceso?.eyebrow}
                />
                <Campo
                  label="Título"
                  name="title"
                  scope="proceso"
                  defaultValue={home.proceso?.title}
                  placeholder="Cómo trabajamos"
                />
                <AreaTexto
                  label="Introducción"
                  name="intro"
                  scope="proceso"
                  rows={2}
                  defaultValue={home.proceso?.intro}
                  className="sm:col-span-2"
                />
              </div>
              <CampoParejas
                label="Pasos"
                nameA="paso_titulo"
                nameB="paso_descripcion"
                placeholderA="Diagnóstico en sitio"
                placeholderB="Vamos a la planta, medimos y entendemos el proceso antes de proponer nada."
                textoAgregar="Agregar paso"
                defaultValue={(home.proceso?.pasos ?? []).map((p) => ({
                  a: p.titulo,
                  b: p.descripcion,
                }))}
                hint="Entre tres y cinco. Cada paso: un título de dos o tres palabras y una frase de qué pasa ahí."
              />
            </div>
          </FormularioAdmin>
        </Tarjeta>

        {/* --- Entradilla de los valores en la portada --------------- */}
        <Tarjeta>
          <TituloTarjeta
            title="Entradilla de los valores en la portada"
            description="El rótulo, el título y la frase que presentan los cuatro valores en el inicio. Son textos distintos de los de la página Nosotros."
          />
          <AyudaSeccion className="mb-5">
            Los valores en sí —nombre, descripción e icono— se editan en{" "}
            <Link
              prefetch={false}
              href="/admin/contenido/valores"
              className="font-semibold text-azul-700 underline"
            >
              Valores corporativos
            </Link>
            , y se usan tanto aquí como en Nosotros.
          </AyudaSeccion>
          <FormularioAdmin action={guardarInicioValores}>
            <div className="grid gap-4 sm:grid-cols-2">
              <Campo
                label="Línea pequeña de arriba"
                name="eyebrow"
                scope="valores-inicio"
                defaultValue={home.seccionValores?.eyebrow}
                placeholder="Lo que sostiene el trabajo"
              />
              <Campo
                label="Título"
                name="title"
                scope="valores-inicio"
                defaultValue={home.seccionValores?.title}
                placeholder="Nuestros valores"
              />
              <AreaTexto
                label="Frase de presentación"
                name="intro"
                scope="valores-inicio"
                rows={2}
                defaultValue={home.seccionValores?.intro}
                className="sm:col-span-2"
              />
            </div>
          </FormularioAdmin>
        </Tarjeta>

        {/* --- Destacados ------------------------------------------- */}
        <Tarjeta>
          <TituloTarjeta
            title="Qué se destaca en la portada"
            description="Los servicios y los proyectos que aparecen en el inicio, escritos por su dirección (slug)."
          />
          <AyudaSeccion className="mb-5">
            Escribe la dirección de cada uno, tal como aparece en su ficha. Si
            dejas una lista vacía, esa franja no se pinta en la portada — es una
            decisión válida y se respeta.
            {servicios.length > 0 && (
              <>
                {" "}
                <strong>Servicios disponibles:</strong>{" "}
                <span className="font-mono text-xs">
                  {servicios.map((s) => s.slug).join(" · ")}
                </span>
              </>
            )}
            {proyectos.length > 0 && (
              <>
                {" "}
                <strong>Proyectos disponibles:</strong>{" "}
                <span className="font-mono text-xs">
                  {proyectos.map((p) => p.slug).join(" · ")}
                </span>
              </>
            )}
          </AyudaSeccion>
          <FormularioAdmin action={guardarInicioDestacados}>
            <div className="grid gap-6 sm:grid-cols-2">
              <CampoLista
                label="Servicios destacados"
                name="servicio"
                defaultValue={home.serviciosDestacados}
                placeholder="automatizacion-de-procesos"
                textoAgregar="Agregar servicio"
              />
              <CampoLista
                label="Proyectos destacados"
                name="proyecto"
                defaultValue={home.proyectosDestacados}
                placeholder="planta-de-tratamiento"
                textoAgregar="Agregar proyecto"
              />
            </div>
          </FormularioAdmin>
        </Tarjeta>

        {/* --- Cierre ----------------------------------------------- */}
        <Tarjeta>
          <TituloTarjeta
            title="Franja de cierre"
            description="La última llamada a la acción, al final de la portada."
          />
          <FormularioAdmin action={guardarInicioCierre}>
            <div className="grid gap-4 sm:grid-cols-2">
              <Campo
                label="Título"
                name="title"
                scope="cierre"
                defaultValue={home.cta?.title}
                placeholder="¿Tiene un proceso que quiere automatizar?"
                className="sm:col-span-2"
              />
              <AreaTexto
                label="Texto"
                name="body"
                scope="cierre"
                rows={2}
                defaultValue={home.cta?.body}
                className="sm:col-span-2"
              />
              <Campo
                label="Botón principal — texto"
                name="cta1_etiqueta"
                scope="cierre"
                defaultValue={home.cta?.ctaPrimario?.etiqueta}
              />
              <Campo
                label="Botón principal — a dónde lleva"
                name="cta1_href"
                scope="cierre"
                defaultValue={home.cta?.ctaPrimario?.href}
                placeholder="/contacto"
              />
              <Campo
                label="Botón secundario — texto"
                name="cta2_etiqueta"
                scope="cierre"
                defaultValue={home.cta?.ctaSecundario?.etiqueta}
              />
              <Campo
                label="Botón secundario — a dónde lleva"
                name="cta2_href"
                scope="cierre"
                defaultValue={home.cta?.ctaSecundario?.href}
              />

              <AyudaSeccion className="sm:col-span-2">
                La frase pequeña que va debajo del título lleva un enlace en la
                mitad. Se escribe en tres partes: lo que va antes del enlace, el
                texto del enlace y lo que va después. Deja las tres vacías para
                que no aparezca.
              </AyudaSeccion>
              <Campo
                label="Frase pequeña — antes del enlace"
                name="nota_texto"
                scope="cierre"
                defaultValue={home.cta?.nota?.texto}
                placeholder="También puede"
              />
              <Campo
                label="Frase pequeña — texto del enlace"
                name="nota_enlace_etiqueta"
                scope="cierre"
                defaultValue={home.cta?.nota?.enlace?.etiqueta}
                placeholder="revisar el portafolio de servicios"
              />
              <Campo
                label="Frase pequeña — a dónde lleva el enlace"
                name="nota_enlace_href"
                scope="cierre"
                defaultValue={home.cta?.nota?.enlace?.href}
                placeholder="/servicios"
              />
              <Campo
                label="Frase pequeña — después del enlace"
                name="nota_texto_final"
                scope="cierre"
                defaultValue={home.cta?.nota?.textoFinal}
                placeholder="antes de escribirnos."
              />
            </div>
          </FormularioAdmin>
        </Tarjeta>
      </div>
    </>
  );
}
