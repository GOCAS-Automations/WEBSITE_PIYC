import {
  AreaTexto,
  AYUDA_ORDEN,
  AYUDA_SLUG,
  Campo,
  Interruptor,
  Tarjeta,
  TituloTarjeta,
} from "@/components/admin/ui";
import { CampoImagen } from "@/components/admin/CampoImagen";
import { CampoGaleria } from "@/components/admin/CampoGaleria";
import { LIMITES_CONTENIDO, type ProyectoRow } from "@/lib/admin-types";

/** Campos de un caso de éxito. Server Component; lo envuelve `FormularioAdmin`. */
export function CamposProyecto({ proyecto }: { proyecto?: ProyectoRow }) {
  return (
    <>
      {proyecto && <input type="hidden" name="id" value={proyecto.id} />}

      <Tarjeta>
        <TituloTarjeta
          title="Lo básico"
          description="Cómo se llama el trabajo, para quién se hizo y el resumen que se lee en la tarjeta."
        />
        <div className="grid gap-4 sm:grid-cols-2">
          <Campo
            label="Título"
            name="title"
            required
            maxLength={LIMITES_CONTENIDO.titulo}
            defaultValue={proyecto?.title}
            placeholder="Automatización de planta de tratamiento"
            className="sm:col-span-2"
          />
          <Campo
            label="Dirección en el sitio (slug)"
            name="slug"
            maxLength={LIMITES_CONTENIDO.slug}
            defaultValue={proyecto?.slug}
            hint={AYUDA_SLUG}
          />
          <Campo
            label="Cliente o sector"
            name="client"
            defaultValue={proyecto?.client}
            placeholder="Ingenio del Valle del Cauca"
            hint="Si el cliente pidió no aparecer, escribe el sector («Ingenio azucarero») o déjalo vacío."
          />
          <AreaTexto
            label="Descripción corta"
            name="description"
            rows={3}
            defaultValue={proyecto?.description}
            hint="Dos o tres frases. Es lo que se lee en la tarjeta del listado de proyectos."
            className="sm:col-span-2"
          />
          <Campo
            label="Orden"
            name="sort"
            type="number"
            defaultValue={proyecto?.sort ?? 0}
            hint={AYUDA_ORDEN}
          />
          <Interruptor
            label="¿Se muestra en el sitio?"
            name="published"
            defaultChecked={proyecto?.published ?? true}
            hint="Ocultar no borra nada: el proyecto se conserva aquí."
          />
        </div>
      </Tarjeta>

      <Tarjeta>
        <TituloTarjeta
          title="La historia completa"
          description="El texto largo de la página del proyecto. Si lo dejas vacío, el sitio usa la descripción corta."
        />
        <AreaTexto
          label="Contexto, solución y resultado"
          name="body"
          rows={10}
          defaultValue={proyecto?.body}
          hint="Separa los párrafos dejando una línea en blanco. Funciona muy bien contar tres cosas: qué necesitaba el cliente, qué hizo PIYC y qué ganó al final (menos paradas, más producción, menos consumo)."
        />
      </Tarjeta>

      <Tarjeta>
        <TituloTarjeta
          title="Fotos"
          description="La portada es la que se ve en el listado de proyectos."
        />
        <div className="space-y-6">
          <CampoImagen
            label="Foto de portada"
            name="cover"
            altName="cover_alt"
            folder="proyectos"
            scope="proyecto"
            defaultValue={proyecto?.images.cover}
            defaultAlt={proyecto?.images.coverAlt}
          />
          <CampoGaleria
            label="Galería del proyecto"
            folder="proyectos"
            defaultValue={proyecto?.images.gallery}
            hint="Fotos del trabajo terminado, del montaje o del tablero en obra. Si la dejas vacía, el sitio no pinta la galería."
          />
        </div>
      </Tarjeta>
    </>
  );
}
