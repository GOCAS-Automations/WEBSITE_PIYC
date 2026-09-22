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
import { CampoLista } from "@/components/admin/CampoLista";
import { CampoParejas } from "@/components/admin/CampoParejas";
import { guardarContacto, guardarSeo } from "../actions";
import { LIMITES_CONTENIDO } from "@/lib/admin-types";

export const dynamic = "force-dynamic";

/**
 * DATOS DE CONTACTO Y BUSCADORES
 * ==============================
 * Edita las claves `contact` y `seo` de `site_settings`.
 *
 * El campo más importante de todo el panel está aquí: **el WhatsApp que recibe
 * los mensajes del formulario**. El servidor lo lee SIEMPRE de estos ajustes y
 * nunca del formulario público (regla 5): tomarlo del payload convertiría el
 * sitio en un relay de spam para cualquiera.
 */
export default async function AjustesPage() {
  await requireContentEditor();
  const { contact, seo } = await getAjustes();

  return (
    <>
      <CabeceraPanel
        title="Datos de contacto y buscadores"
        description="Dónde está PIYC, por dónde la contactan y qué se lee de ella en Google."
        backHref="/admin/contenido"
        backLabel="Volver a Contenido"
        breadcrumb={[
          { label: "Panel", href: "/admin" },
          { label: "Contenido del sitio", href: "/admin/contenido" },
          { label: "Contacto y buscadores" },
        ]}
      />

      <AvisoGuardar />

      <div className="space-y-6">
        {/* --- Contacto --------------------------------------------- */}
        <Tarjeta>
          <TituloTarjeta
            title="Datos de contacto"
            description="Se usan en el pie de página, en la página de contacto y en la ficha que Google muestra de la empresa."
          />

          <AyudaSeccion tono="aviso" title="El campo que no se puede dejar mal" className="mb-5">
            El <strong>WhatsApp que recibe los mensajes del formulario</strong>{" "}
            es a donde llega todo el que escribe desde el sitio. Va con
            indicativo y solo dígitos: <span className="font-mono">573217617958</span>.
            Si se equivoca un número, los mensajes se pierden sin que nadie se
            entere.
          </AyudaSeccion>

          <FormularioAdmin action={guardarContacto}>
            <div className="space-y-6">
              <div className="grid gap-4 sm:grid-cols-2">
                <Campo
                  label="Nombre comercial"
                  name="company_name"
                  scope="contacto"
                  defaultValue={contact.companyName}
                  placeholder="PIYC"
                />
                <Campo
                  label="Razón social"
                  name="legal_name"
                  scope="contacto"
                  defaultValue={contact.legalName}
                  placeholder="Programación Industrial y Control S.A.S."
                />
                <Campo
                  label="NIT"
                  name="nit"
                  scope="contacto"
                  defaultValue={contact.nit}
                  placeholder="901.161.923"
                />
                <Campo
                  label="Eslogan"
                  name="tagline"
                  scope="contacto"
                  defaultValue={contact.tagline}
                  placeholder="Tu socio confiable en soluciones industriales"
                />
              </div>

              <fieldset className="rounded-control p-4 ring-1 ring-separador">
                <legend className="px-2 text-sm font-semibold text-azul-950">
                  Dirección
                </legend>
                <div className="grid gap-4 sm:grid-cols-2">
                  <Campo
                    label="Calle y número"
                    name="calle"
                    scope="direccion"
                    defaultValue={contact.address?.street}
                    placeholder="Cl. 33 #5-76"
                  />
                  <Campo
                    label="Barrio o comuna"
                    name="barrio"
                    scope="direccion"
                    defaultValue={contact.address?.area}
                    placeholder="Comuna 4"
                  />
                  <Campo
                    label="Ciudad"
                    name="ciudad"
                    scope="direccion"
                    defaultValue={contact.address?.city}
                    placeholder="Cali"
                  />
                  <Campo
                    label="Departamento"
                    name="region"
                    scope="direccion"
                    defaultValue={contact.address?.region}
                    placeholder="Valle del Cauca"
                  />
                  <Campo
                    label="Dirección completa, como se muestra"
                    name="direccion_completa"
                    scope="direccion"
                    defaultValue={contact.address?.full}
                    hint="Si la dejas vacía se arma sola con los campos de arriba."
                    className="sm:col-span-2"
                  />
                  <Campo
                    label="Búsqueda para el mapa"
                    name="maps_query"
                    scope="direccion"
                    defaultValue={contact.mapsQuery}
                    hint="Lo que se escribiría en Google Maps para encontrar la sede. Si lo dejas vacío se usa la dirección completa."
                    className="sm:col-span-2"
                  />
                </div>
              </fieldset>

              {/* Mapa: las dos URL van juntas porque describen la misma ficha
                  de Google. Vacías = el sitio usa la ficha que trae en código
                  (la que muestra «PIYC PROGRAMACIÓN INDUSTRIAL Y CONTROL SAS»
                  en vez de un pin con la dirección). */}
              <fieldset className="rounded-control p-4 ring-1 ring-separador">
                <legend className="px-2 text-sm font-semibold text-azul-950">Mapa</legend>
                <div className="grid gap-4">
                  <Campo
                    label="Enlace de la ficha en Google Maps"
                    name="maps_place_url"
                    scope="direccion"
                    defaultValue={contact.mapsPlaceUrl}
                    placeholder="https://www.google.com/maps/place/PIYC+..."
                    hint="A dónde llevan los enlaces «Abrir en Google Maps» del mapa y del pie. Déjalo vacío para usar la ficha que ya trae el sitio."
                  />
                  <Campo
                    label="Dirección del mapa embebido"
                    name="maps_embed_url"
                    scope="direccion"
                    defaultValue={contact.mapsEmbedUrl}
                    placeholder="https://www.google.com/maps?cid=4032448001106595686&output=embed"
                    hint="Es lo que se ve dentro del recuadro del mapa en Contacto. Tiene que terminar en «&output=embed» y ser de google.com o maps.google.com. Vacío = la ficha que ya trae el sitio."
                  />
                </div>
              </fieldset>

              <fieldset className="rounded-control p-4 ring-1 ring-separador">
                <legend className="px-2 text-sm font-semibold text-azul-950">
                  Teléfonos y WhatsApp
                </legend>
                <div className="space-y-5">
                  <Campo
                    label="WhatsApp que recibe los mensajes del formulario"
                    name="whatsapp_formulario"
                    scope="contacto"
                    required
                    defaultValue={contact.whatsappFormulario}
                    placeholder="573217617958"
                    hint="Con indicativo del país y solo dígitos, sin espacios ni signos."
                  />
                  <Campo
                    label="WhatsApp principal (botón flotante y botones del sitio)"
                    name="whatsapp_principal"
                    scope="contacto"
                    defaultValue={contact.primaryWhatsApp}
                    placeholder="573217617958"
                    hint="Normalmente es el mismo de arriba. Con indicativo y solo dígitos."
                  />
                  <CampoParejas
                    label="Líneas de WhatsApp que se muestran"
                    nameA="whatsapp_label"
                    nameB="whatsapp_persona"
                    etiquetaA="Número"
                    etiquetaB="De quién es"
                    filasB={1}
                    placeholderA="+57 321 761 7958"
                    placeholderB="Jorge Castillo (déjalo vacío si es el número general)"
                    textoAgregar="Agregar WhatsApp"
                    defaultValue={(contact.whatsapp ?? []).map((w) => ({
                      a: w.label,
                      b: w.person ?? "",
                    }))}
                    hint="El número se escribe como quieres que se lea; el sistema le quita los espacios para armar el enlace."
                  />
                  <CampoLista
                    label="Teléfonos de contacto"
                    name="telefono"
                    defaultValue={(contact.phones ?? []).map((t) => t.label)}
                    placeholder="+57 321 761 7958"
                    textoAgregar="Agregar teléfono"
                  />
                </div>
              </fieldset>

              <fieldset className="rounded-control p-4 ring-1 ring-separador">
                <legend className="px-2 text-sm font-semibold text-azul-950">
                  Correo, redes y horario
                </legend>
                <div className="space-y-5">
                  <CampoParejas
                    label="Correos que se publican"
                    nameA="correo"
                    nameB="correo_persona"
                    etiquetaA="Correo"
                    etiquetaB="De quién es"
                    filasB={1}
                    placeholderA="contacto@piycsas.com"
                    placeholderB="Jorge Castillo"
                    textoAgregar="Agregar correo"
                    defaultValue={(contact.emails ?? []).map((c) => ({
                      a: c.address,
                      b: c.person ?? "",
                    }))}
                  />
                  <div className="grid gap-4 sm:grid-cols-2">
                    <Campo
                      label="Instagram"
                      name="instagram"
                      scope="contacto"
                      defaultValue={contact.social?.instagram}
                      placeholder="https://www.instagram.com/piyc_sas/"
                    />
                    <Campo
                      label="Dirección del sitio"
                      name="site_url"
                      scope="contacto"
                      defaultValue={contact.siteUrl}
                      placeholder="https://piycsas.com"
                    />
                    <Campo
                      label="Horario de atención"
                      name="horario"
                      scope="contacto"
                      defaultValue={contact.horario?.label}
                      placeholder="Lunes a viernes, 8:00 a. m. – 5:00 p. m. · Sábados y domingos, cerrado"
                      hint="Es el horario que se lee en la página de contacto. Si lo dejas vacío, el sitio no muestra ningún horario: es mejor no decir nada que publicar uno equivocado."
                      className="sm:col-span-2"
                    />
                    <Campo
                      label="Horario para Google"
                      name="horario_schema"
                      scope="contacto"
                      defaultValue={(contact.horario?.schema ?? []).join(", ")}
                      placeholder="Mo-Fr 08:00-17:00"
                      hint="El mismo horario, en el formato que entiende Google: días en inglés abreviado y horas de 24 h (Mo, Tu, We, Th, Fr, Sa, Su). Varios tramos, separados por coma. Los días cerrados no se escriben. Si cambias el horario de arriba, cambia también este."
                      className="sm:col-span-2"
                    />
                  </div>
                </div>
              </fieldset>
            </div>
          </FormularioAdmin>
        </Tarjeta>

        {/* --- SEO -------------------------------------------------- */}
        <Tarjeta>
          <TituloTarjeta
            title="Lo que se lee en Google"
            description="El título y la descripción con los que aparece cada página en los resultados de búsqueda."
          />
          <AyudaSeccion className="mb-5">
            El <strong>título</strong> es el enlace azul y el{" "}
            <strong>texto</strong>, el párrafo gris de debajo. Google los corta
            si son largos: hasta 60 caracteres el título y 155 el texto. Si
            dejas uno vacío, el sitio arma uno solo con el contenido de la
            página.
          </AyudaSeccion>
          <FormularioAdmin action={guardarSeo}>
            <div className="space-y-6">
              <div className="grid gap-4 sm:grid-cols-2">
                <Campo
                  label="Título por defecto del sitio"
                  name="default_title"
                  scope="seo"
                  maxLength={LIMITES_CONTENIDO.metaTitle}
                  defaultValue={seo.defaultTitle}
                />
                <Campo
                  label="Plantilla del resto de títulos"
                  name="title_template"
                  scope="seo"
                  defaultValue={seo.titleTemplate}
                  placeholder="%s | PIYC"
                  hint="El %s se reemplaza por el título de cada página."
                />
                <AreaTexto
                  label="Descripción por defecto"
                  name="default_description"
                  scope="seo"
                  rows={2}
                  maxLength={LIMITES_CONTENIDO.metaDescription}
                  defaultValue={seo.defaultDescription}
                  className="sm:col-span-2"
                />
                <Campo
                  label="Imagen para compartir en redes"
                  name="og_image"
                  scope="seo"
                  defaultValue={seo.ogImage}
                  hint="1200 × 630 píxeles. Es la que se ve cuando alguien pega el enlace del sitio en WhatsApp o en Facebook."
                />
                <Campo
                  label="Verificación de Google Search Console"
                  name="google_verification"
                  scope="seo"
                  defaultValue={seo.googleSiteVerification}
                  hint="Solo si Google pidió verificar el sitio. Es un código largo que da él mismo."
                />
                <div className="sm:col-span-2">
                  <CampoLista
                    label="Palabras clave"
                    name="keyword"
                    defaultValue={seo.keywords}
                    placeholder="automatización industrial Cali"
                    textoAgregar="Agregar palabra clave"
                    hint="Informativas: sirven para tener claro sobre qué quiere posicionar PIYC. Google ya no las usa como etiqueta."
                  />
                </div>
              </div>

              <fieldset className="rounded-control p-4 ring-1 ring-separador">
                <legend className="px-2 text-sm font-semibold text-azul-950">
                  Página por página
                </legend>
                <div className="space-y-4">
                  {(
                    [
                      ["inicio", "Inicio"],
                      ["nosotros", "Nosotros"],
                      ["servicios", "Servicios"],
                      ["proyectos", "Proyectos"],
                      ["contacto", "Contacto"],
                    ] as const
                  ).map(([clave, etiqueta]) => (
                    <div key={clave} className="grid gap-4 sm:grid-cols-2">
                      <Campo
                        label={`${etiqueta} — título`}
                        name={`${clave}_title`}
                        scope="seo"
                        maxLength={LIMITES_CONTENIDO.metaTitle}
                        defaultValue={seo.paginas?.[clave]?.title}
                      />
                      <Campo
                        label={`${etiqueta} — descripción`}
                        name={`${clave}_description`}
                        scope="seo"
                        maxLength={LIMITES_CONTENIDO.metaDescription}
                        defaultValue={seo.paginas?.[clave]?.description}
                      />
                    </div>
                  ))}
                </div>
              </fieldset>
            </div>
          </FormularioAdmin>
        </Tarjeta>
      </div>
    </>
  );
}
