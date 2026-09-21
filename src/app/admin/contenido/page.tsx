import { requireContentEditor } from "@/lib/supabase/auth";
import { isManagerRole } from "@/lib/supabase/roles";
import { getContadores } from "@/lib/admin/lecturas";
import { AyudaSeccion, CabeceraPanel, TarjetaSeccion } from "@/components/admin/ui";
import {
  IconoAjustes,
  IconoDocumento,
  IconoEngranaje,
  IconoEscudo,
  IconoFoto,
  IconoInicio,
  IconoSobre,
  IconoEquipo,
} from "@/components/admin/iconos";

export const dynamic = "force-dynamic";

/**
 * CONTENIDO DEL SITIO — índice
 * ============================
 * Una de las cuatro entradas del menú. Recoge las siete pantallas de contenido
 * y las presenta como lo que son: las páginas del sitio, en el orden en que un
 * visitante las recorre, con una frase que dice qué se administra en cada una.
 *
 * Las de arriba son páginas completas; las de abajo, listas donde se añaden y
 * se ordenan elementos.
 */
export default async function ContenidoPage() {
  const { profile } = await requireContentEditor();
  const contadores = await getContadores();
  const esManager = isManagerRole(profile.role);

  const secciones = [
    {
      href: "/admin/contenido/inicio",
      label: "Página de inicio",
      icon: IconoInicio,
      description:
        "La portada: la primera pantalla con el eslogan, el bloque de qué hace PIYC, el proceso de trabajo, lo que se destaca y la franja de cierre.",
    },
    {
      href: "/admin/contenido/nosotros",
      label: "Página Nosotros",
      icon: IconoEquipo,
      description:
        "Quiénes somos, misión y visión tal como los escribió PIYC, la entradilla de los valores y la galería de fotos.",
    },
    {
      href: "/admin/contenido/servicios",
      label: "Servicios",
      icon: IconoEngranaje,
      count: contadores.servicios,
      unit: contadores.servicios === 1 ? "servicio" : "servicios",
      description:
        "Lo que ofrece PIYC: textos, alcances, fotos, video y el orden en que aparecen en el menú y en la página de servicios.",
    },
    {
      href: "/admin/contenido/proyectos",
      label: "Proyectos",
      icon: IconoFoto,
      count: contadores.proyectos,
      unit: contadores.proyectos === 1 ? "proyecto" : "proyectos",
      description:
        "Los trabajos ya realizados, cada uno con su foto de portada, su galería y su propia página.",
    },
    {
      href: "/admin/contenido/valores",
      label: "Valores corporativos",
      icon: IconoEscudo,
      count: contadores.valores,
      unit: contadores.valores === 1 ? "valor" : "valores",
      description:
        "Los principios de la empresa, con su icono, que se muestran en el inicio y en la página Nosotros.",
    },
    {
      href: "/admin/contenido/paginas",
      label: "Cabeceras de páginas",
      icon: IconoDocumento,
      description:
        "Los títulos, las bajadas y las fotos de cabecera de Servicios, Proyectos y Contacto, y el texto de la página «no encontrada».",
    },
    {
      href: "/admin/contenido/ajustes",
      label: "Datos de contacto y buscadores",
      icon: IconoAjustes,
      description:
        "Dirección, teléfonos, WhatsApp (incluido el que recibe los mensajes del formulario), correo, Instagram, horario y los textos que ve Google.",
    },
  ];

  return (
    <>
      <CabeceraPanel
        title="Contenido del sitio"
        description="Todo lo que se ve en piycsas.com, página por página. Elige qué quieres editar."
        breadcrumb={[{ label: "Panel", href: "/admin" }, { label: "Contenido del sitio" }]}
      />

      <AyudaSeccion title="Cómo está organizado" className="mb-6">
        Cada tarjeta abre una pantalla con los textos y las fotos de esa parte
        del sitio. Dentro de cada una, <strong>cada bloque se guarda con su
        propio botón</strong>: lo que escribas no se aplica hasta que pulses
        «Guardar» en ese bloque.
      </AyudaSeccion>

      <div className="grid gap-4 sm:grid-cols-2">
        {secciones.map((seccion) => (
          <TarjetaSeccion key={seccion.href} {...seccion} />
        ))}
        {esManager && (
          <TarjetaSeccion
            href="/admin/mensajes"
            label="Mensajes de contacto"
            icon={IconoSobre}
            count={contadores.mensajes}
            unit={contadores.mensajes === 1 ? "mensaje" : "mensajes"}
            description="Quien llena el formulario del sitio queda registrado aquí, aunque cierre WhatsApp sin enviar nada. Es la bandeja de posibles clientes."
          />
        )}
      </div>
    </>
  );
}
