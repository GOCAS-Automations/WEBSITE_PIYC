import {
  AreaTexto,
  AyudaSeccion,
  Campo,
  Interruptor,
  Selector,
  Tarjeta,
  TituloTarjeta,
} from "@/components/admin/ui";
import { AYUDA_ORDEN, AYUDA_SLUG, AYUDA_VIDEO } from "@/components/admin/ui";
import { CampoImagen } from "@/components/admin/CampoImagen";
import { CampoGaleria } from "@/components/admin/CampoGaleria";
import { CampoLista } from "@/components/admin/CampoLista";
import { CLAVES_ICONO_SERVICIO } from "@/lib/content-types";
import { LIMITES_CONTENIDO, type ServicioRow } from "@/lib/admin-types";

/**
 * CAMPOS DE UN SERVICIO — Server Component
 * ========================================
 * Es solo la lista de campos: quien lo envuelve es `FormularioAdmin`, que sí es
 * de cliente y aporta el botón, el estado pendiente y el mensaje del resultado.
 *
 * Al ser de servidor puede importar de `components/admin/ui.tsx` sin problema
 * (regla 1: la prohibición es para los módulos `"use client"`). Los campos que
 * necesitan estado —imagen, galería, lista— son componentes de cliente
 * importados de sus propios archivos.
 */
export function CamposServicio({ servicio }: { servicio?: ServicioRow }) {
  const opcionesIcono = [
    { value: "", label: "Sin icono (se usa uno genérico)" },
    ...CLAVES_ICONO_SERVICIO.map((clave) => ({ value: clave, label: clave })),
  ];

  return (
    <>
      {servicio && <input type="hidden" name="id" value={servicio.id} />}

      <Tarjeta>
        <TituloTarjeta
          title="Lo básico"
          description="El nombre del servicio, su dirección en el sitio y el resumen que se lee en la tarjeta del listado."
        />
        <div className="grid gap-4 sm:grid-cols-2">
          <Campo
            label="Título"
            name="title"
            required
            maxLength={LIMITES_CONTENIDO.titulo}
            defaultValue={servicio?.title}
            placeholder="Automatización de procesos industriales"
            hint="Es el titular de la página del servicio y el nombre que ve el cliente."
            className="sm:col-span-2"
          />
          <Campo
            label="Dirección en el sitio (slug)"
            name="slug"
            maxLength={LIMITES_CONTENIDO.slug}
            defaultValue={servicio?.slug}
            placeholder="automatizacion-de-procesos"
            hint={AYUDA_SLUG}
          />
          <Campo
            label="Nombre corto para el menú"
            name="nav_title"
            maxLength={LIMITES_CONTENIDO.navTitulo}
            defaultValue={servicio?.nav_title}
            placeholder="Automatización"
            hint="Si lo dejas vacío se usa el título completo. Sirve cuando el título es largo y no cabe en el menú."
          />
          <AreaTexto
            label="Resumen"
            name="summary"
            rows={2}
            maxLength={LIMITES_CONTENIDO.resumen}
            defaultValue={servicio?.summary}
            placeholder="Programamos PLC y HMI/SCADA para que su planta opere sola, con datos en tiempo real."
            hint="Una o dos frases. Es lo que se lee en la tarjeta del listado de servicios y lo que usa Google si no escribes una descripción propia."
            className="sm:col-span-2"
          />
          <Selector
            label="Icono"
            name="icon_key"
            defaultValue={servicio?.icon_key ?? ""}
            options={opcionesIcono}
            hint="Dibujo que acompaña al servicio en el listado."
          />
          <Campo
            label="Orden"
            name="sort"
            type="number"
            defaultValue={servicio?.sort ?? 0}
            hint={AYUDA_ORDEN}
          />
          <Interruptor
            label="¿Se muestra en el sitio?"
            name="published"
            defaultChecked={servicio?.published ?? true}
            hint="Oculto no borra nada: el servicio se conserva aquí y puedes volver a mostrarlo cuando quieras."
          />
        </div>
      </Tarjeta>

      <Tarjeta>
        <TituloTarjeta
          title="Descripción y alcances"
          description="El cuerpo de la página del servicio y la lista de lo que incluye."
        />
        <div className="space-y-5">
          <AreaTexto
            label="Descripción"
            name="description"
            rows={8}
            defaultValue={servicio?.description}
            hint="Separa los párrafos dejando una línea en blanco entre ellos. Escribe como le explicarías el servicio a un cliente, sin siglas que él no conozca."
          />
          <CampoLista
            label="Qué incluye el servicio"
            name="items"
            defaultValue={servicio?.items}
            placeholder="Programación de PLC Siemens y Allen-Bradley"
            textoAgregar="Agregar alcance"
            hint="Entre cinco y ocho puntos concretos. Son lo primero que mira quien compara proveedores."
          />
        </div>
      </Tarjeta>

      <Tarjeta>
        <TituloTarjeta
          title="Fotos"
          description="La foto de portada encabeza la página del servicio; la galería va más abajo."
        />
        <div className="space-y-6">
          <CampoImagen
            label="Foto de portada"
            name="cover"
            altName="cover_alt"
            folder="servicios"
            scope="servicio"
            defaultValue={servicio?.images.cover}
            defaultAlt={servicio?.images.coverAlt}
          />
          <CampoGaleria
            label="Galería"
            folder="servicios"
            defaultValue={servicio?.images.gallery}
            hint="Fotos de trabajos reales de este servicio. Horizontales se ven mejor. Si la dejas vacía, el sitio no pinta la galería."
          />
        </div>
      </Tarjeta>

      <Tarjeta>
        <TituloTarjeta
          title="Video"
          description="Opcional. Un video de YouTube dentro de la página del servicio."
        />
        <AyudaSeccion className="mb-5">{AYUDA_VIDEO}</AyudaSeccion>
        <div className="grid gap-4 sm:grid-cols-2">
          <Campo
            label="Enlace de YouTube"
            name="video_url"
            defaultValue={servicio?.video?.url}
            placeholder="https://www.youtube.com/watch?v=…"
            className="sm:col-span-2"
          />
          <Campo
            label="Título del video"
            name="video_titulo"
            defaultValue={servicio?.video?.titulo}
            placeholder="Tablero de control en operación"
          />
          <Interruptor
            label="¿Mostrar el video?"
            name="video_visible"
            defaultChecked={servicio?.video?.visible ?? false}
            onLabel="Se muestra"
            offLabel="Guardado, sin mostrar"
            hint="Empieza apagado: enciéndelo cuando el enlace esté listo para publicarse."
          />
          <AreaTexto
            label="Descripción del video"
            name="video_descripcion"
            rows={2}
            defaultValue={servicio?.video?.descripcion}
            className="sm:col-span-2"
          />
        </div>
      </Tarjeta>

      <Tarjeta>
        <TituloTarjeta
          title="Cómo lo ve Google"
          description="Los textos que aparecen en los resultados de búsqueda. Si los dejas vacíos se arman solos con el título y el resumen."
        />
        <div className="grid gap-4 sm:grid-cols-2">
          <Campo
            label="Título para buscadores"
            name="meta_title"
            maxLength={LIMITES_CONTENIDO.metaTitle}
            defaultValue={servicio?.meta_title}
            hint="Máximo 60 caracteres: más largo, Google lo corta."
          />
          <Campo
            label="Descripción para buscadores"
            name="meta_description"
            maxLength={LIMITES_CONTENIDO.metaDescription}
            defaultValue={servicio?.meta_description}
            hint="Máximo 155 caracteres. Es el párrafo gris bajo el enlace azul."
          />
        </div>
      </Tarjeta>
    </>
  );
}
