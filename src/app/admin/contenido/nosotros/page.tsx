import Link from "next/link";
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
import { CampoGaleria } from "@/components/admin/CampoGaleria";
import {
  guardarNosotrosCierre,
  guardarNosotrosGaleria,
  guardarNosotrosHero,
  guardarNosotrosMisionVision,
  guardarNosotrosQuienes,
  guardarNosotrosValores,
} from "../actions";

export const dynamic = "force-dynamic";

/** Edita la clave `nosotros` de `site_settings` (forma `AjustesNosotros`). */
export default async function NosotrosPage() {
  await requireContentEditor();
  const { nosotros } = await getAjustes();

  return (
    <>
      <CabeceraPanel
        title="Página Nosotros"
        description="La historia de PIYC: quiénes somos, misión, visión y la galería."
        backHref="/admin/contenido"
        backLabel="Volver a Contenido"
        breadcrumb={[
          { label: "Panel", href: "/admin" },
          { label: "Contenido del sitio", href: "/admin/contenido" },
          { label: "Nosotros" },
        ]}
      />

      <AvisoGuardar />

      <div className="space-y-6">
        <Tarjeta>
          <TituloTarjeta
            title="Cabecera de la página"
            description="El título y la foto de fondo con los que abre /nosotros."
          />
          <FormularioAdmin action={guardarNosotrosHero}>
            <div className="grid gap-4 sm:grid-cols-2">
              <Campo
                label="Línea pequeña de arriba"
                name="eyebrow"
                scope="hero"
                defaultValue={nosotros.hero?.eyebrow}
                placeholder="Desde 2017 en Cali"
              />
              <Campo
                label="Título"
                name="title"
                scope="hero"
                defaultValue={nosotros.hero?.title}
                placeholder="Nosotros"
              />
              <AreaTexto
                label="Frase de apoyo"
                name="subtitle"
                scope="hero"
                rows={2}
                defaultValue={nosotros.hero?.subtitle}
                className="sm:col-span-2"
              />
              <div className="sm:col-span-2">
                <CampoImagen
                  label="Foto de cabecera"
                  name="cover"
                  altName="cover_alt"
                  folder="cabeceras"
                  scope="nosotros-hero"
                  defaultValue={nosotros.hero?.image?.src}
                  defaultAlt={nosotros.hero?.image?.alt}
                />
              </div>
            </div>
          </FormularioAdmin>
        </Tarjeta>

        <Tarjeta>
          <TituloTarjeta
            title="Quiénes somos"
            description="El texto de presentación de la empresa."
          />
          <FormularioAdmin action={guardarNosotrosQuienes}>
            <div className="space-y-4">
              <Campo
                label="Línea pequeña de arriba"
                name="eyebrow"
                scope="quienes"
                defaultValue={nosotros.quienesSomos?.eyebrow}
                placeholder="La empresa"
              />
              <Campo
                label="Título del bloque"
                name="title"
                scope="quienes"
                defaultValue={nosotros.quienesSomos?.title}
                placeholder="Quiénes somos"
              />
              <AreaTexto
                label="Texto"
                name="body"
                scope="quienes"
                rows={8}
                defaultValue={nosotros.quienesSomos?.body}
                hint="Separa los párrafos dejando una línea en blanco. Cuenta desde cuándo existe PIYC, en qué sectores trabaja y con qué marcas."
              />
              <CampoImagen
                label="Foto del bloque"
                name="cover"
                altName="cover_alt"
                folder="nosotros"
                scope="quienes"
                defaultValue={nosotros.quienesSomos?.image?.src}
                defaultAlt={nosotros.quienesSomos?.image?.alt}
              />
            </div>
          </FormularioAdmin>
        </Tarjeta>

        <Tarjeta>
          <TituloTarjeta
            title="Misión y visión"
            description="Se publican con el rótulo que tienen aquí."
          />
          <AyudaSeccion tono="aviso" title="Ojo con estos dos textos" className="mb-5">
            Se guardan y se publican <strong>tal como los rotuló PIYC</strong>.
            Si al leerlos te parece que están intercambiados, no los cambies por
            tu cuenta: coméntalo con Jorge y que él decida. Quien redacta la
            misión de una empresa es la empresa.
          </AyudaSeccion>
          <FormularioAdmin action={guardarNosotrosMisionVision}>
            <div className="grid gap-5 sm:grid-cols-2">
              <div className="space-y-4">
                <Campo
                  label="Rótulo del primer bloque"
                  name="mision_title"
                  defaultValue={nosotros.mision?.title ?? "Misión"}
                />
                <AreaTexto
                  label="Texto"
                  name="mision_body"
                  rows={7}
                  defaultValue={nosotros.mision?.body}
                />
              </div>
              <div className="space-y-4">
                <Campo
                  label="Rótulo del segundo bloque"
                  name="vision_title"
                  defaultValue={nosotros.vision?.title ?? "Visión"}
                />
                <AreaTexto
                  label="Texto"
                  name="vision_body"
                  rows={7}
                  defaultValue={nosotros.vision?.body}
                />
              </div>
            </div>
          </FormularioAdmin>
        </Tarjeta>

        <Tarjeta>
          <TituloTarjeta
            title="Entradilla de los valores"
            description="El título y la frase que presentan los valores."
          />
          <AyudaSeccion className="mb-5">
            Los valores en sí se editan en{" "}
            <Link
              prefetch={false}
              href="/admin/contenido/valores"
              className="font-semibold text-azul-700 underline"
            >
              Valores corporativos
            </Link>
            . Aquí solo va el título y la frase que los presentan.
          </AyudaSeccion>
          <FormularioAdmin action={guardarNosotrosValores}>
            <div className="grid gap-4 sm:grid-cols-2">
              <Campo
                label="Línea pequeña de arriba"
                name="eyebrow"
                scope="valores"
                defaultValue={nosotros.valores?.eyebrow}
                placeholder="Cómo trabajamos"
              />
              <Campo
                label="Título"
                name="title"
                scope="valores"
                defaultValue={nosotros.valores?.title}
                placeholder="En qué creemos"
              />
              <AreaTexto
                label="Frase de presentación"
                name="intro"
                scope="valores"
                rows={2}
                defaultValue={nosotros.valores?.intro}
                className="sm:col-span-2"
              />
            </div>
          </FormularioAdmin>
        </Tarjeta>

        <Tarjeta>
          <TituloTarjeta
            title="Galería"
            description="Fotos del equipo, del taller o de los montajes."
          />
          <FormularioAdmin action={guardarNosotrosGaleria}>
            <div className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <Campo
                  label="Línea pequeña de arriba"
                  name="galeria_eyebrow"
                  scope="galeria"
                  defaultValue={nosotros.bloqueGaleria?.eyebrow}
                  placeholder="En obra"
                />
                <Campo
                  label="Título del bloque"
                  name="galeria_title"
                  scope="galeria"
                  defaultValue={nosotros.bloqueGaleria?.title}
                  placeholder="Nuestro trabajo"
                />
                <AreaTexto
                  label="Texto de entrada"
                  name="galeria_intro"
                  scope="galeria"
                  rows={2}
                  defaultValue={nosotros.bloqueGaleria?.intro}
                  hint="Una o dos frases sobre lo que se ve en las fotos. Si lo dejas vacío, no se pinta."
                  className="sm:col-span-2"
                />
              </div>
              <p className="rounded-control bg-azul-50 px-3 py-2 text-xs leading-relaxed text-azul-900">
                En el sitio estas fotos se ven en un carrusel que se desliza de
                lado. Van todas a la misma altura y recortadas al centro, así
                que sirven tanto apaisadas como verticales.
              </p>
              <CampoGaleria
                label="Fotos de la página Nosotros"
                folder="nosotros"
                defaultValue={nosotros.galeria}
                hint="Fotos reales, no de banco de imágenes: se nota, y lo que vende es que se vea el trabajo de PIYC. Si la dejas vacía, el sitio no pinta la galería."
              />
            </div>
          </FormularioAdmin>
        </Tarjeta>

        <Tarjeta>
          <TituloTarjeta
            title="Franja de cierre"
            description="La última llamada a la acción, al final de la página Nosotros."
          />
          <FormularioAdmin action={guardarNosotrosCierre}>
            <div className="space-y-4">
              <Campo
                label="Título"
                name="title"
                scope="cierre-nosotros"
                defaultValue={nosotros.cta?.title}
                placeholder="¿Quiere trabajar con nosotros?"
              />
              <AreaTexto
                label="Texto"
                name="body"
                scope="cierre-nosotros"
                rows={2}
                defaultValue={nosotros.cta?.body}
              />
            </div>
          </FormularioAdmin>
        </Tarjeta>
      </div>
    </>
  );
}
