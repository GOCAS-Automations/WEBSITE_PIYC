import Link from "next/link";
import { requireContentEditor } from "@/lib/supabase/auth";
import { isManagerRole } from "@/lib/supabase/roles";
import { getContadores, listMensajes } from "@/lib/admin/lecturas";
import { contarJornadasPendientes } from "@/lib/jornadas-lecturas";
import {
  AyudaSeccion,
  EnlaceSiguiente,
  TarjetaSeccion,
} from "@/components/admin/ui";
import {
  IconoCapas,
  IconoEquipo,
  IconoFlecha,
  IconoReloj,
  IconoSobre,
  IconoWhatsApp,
} from "@/components/admin/iconos";
import { formatearFechaCorta, enlaceWhatsAppLead } from "@/lib/admin/mensajes";
import { botonWhatsApp } from "@/components/admin/clases";

export const dynamic = "force-dynamic";

/**
 * DASHBOARD
 * =========
 * Lo primero que se ve al entrar: en qué estado está el sitio y por dónde
 * seguir. Nada de gráficas — no hay nada que graficar en un sitio corporativo,
 * y el plan deja las métricas explícitamente fuera de alcance.
 *
 * REGLA 9 — `0` nunca se muestra como dato
 * ----------------------------------------
 * Una tarjeta que dice «0 mensajes» no informa: ocupa sitio y sugiere que algo
 * falla. Las cifras en cero simplemente no se pintan, y en su lugar la pantalla
 * dice qué hacer para que dejen de estar vacías.
 */
export default async function AdminDashboardPage() {
  const { profile } = await requireContentEditor();
  const esManager = isManagerRole(profile.role);

  const [contadores, mensajes, jornadasPendientes] = await Promise.all([
    getContadores(),
    esManager ? listMensajes(5) : Promise.resolve([]),
    esManager ? contarJornadasPendientes() : Promise.resolve(0),
  ]);

  const cifras = [
    {
      valor: contadores.servicios,
      etiqueta: contadores.servicios === 1 ? "servicio" : "servicios",
      detalle:
        contadores.serviciosOcultos > 0
          ? `${contadores.serviciosOcultos} sin publicar`
          : null,
      href: "/admin/contenido/servicios",
    },
    {
      valor: contadores.proyectos,
      etiqueta: contadores.proyectos === 1 ? "proyecto" : "proyectos",
      detalle:
        contadores.proyectosOcultos > 0
          ? `${contadores.proyectosOcultos} sin publicar`
          : null,
      href: "/admin/contenido/proyectos",
    },
    {
      valor: contadores.mensajesRecientes,
      etiqueta: contadores.mensajesRecientes === 1 ? "mensaje nuevo" : "mensajes nuevos",
      detalle: "en los últimos 7 días",
      href: "/admin/mensajes",
    },
    {
      valor: contadores.cuentas,
      etiqueta: contadores.cuentas === 1 ? "cuenta" : "cuentas",
      detalle:
        contadores.cuentasInactivas > 0
          ? `${contadores.cuentasInactivas} desactivadas`
          : null,
      href: "/admin/equipo",
      soloManager: true,
    },
    {
      valor: jornadasPendientes,
      etiqueta:
        jornadasPendientes === 1 ? "jornada por revisar" : "jornadas por revisar",
      detalle: "registradas por el equipo",
      href: "/admin/jornadas?estado=pendiente",
      soloManager: true,
    },
  ].filter((c) => c.valor > 0 && (!c.soloManager || esManager));

  return (
    <>
      <header className="mb-7">
        <p className="text-xs font-semibold uppercase tracking-ancho text-azul-700">
          Panel de PIYC
        </p>
        <h1 className="mt-1 text-titular-lg font-semibold tracking-display text-azul-950 sm:text-titular-xl">
          Hola, {profile.fullName.split(" ")[0]}
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-acero-600">
          Desde aquí se administra todo lo que se ve en piycsas.com y las
          cuentas del equipo. Lo que guardes se refleja en el sitio en pocos
          minutos.
        </p>
      </header>

      {/* Cifras. Si todas son cero no se pinta la fila (regla 9). */}
      {cifras.length > 0 && (
        <section aria-label="Resumen" className="mb-7 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {cifras.map((c) => (
            <Link
              key={c.etiqueta}
              href={c.href}
              prefetch={false}
              className="rounded-tarjeta bg-blanco p-4 shadow-tarjeta transition duration-200 ease-ios hover:-translate-y-0.5 hover:shadow-elevada"
            >
              <p className="text-titular-xl font-semibold tracking-display text-azul-700">
                {c.valor}
              </p>
              <p className="mt-1.5 text-sm font-semibold text-azul-950">{c.etiqueta}</p>
              {c.detalle && (
                <p className="mt-0.5 text-xs text-acero-600">{c.detalle}</p>
              )}
            </Link>
          ))}
        </section>
      )}

      {/* Accesos */}
      <section aria-label="Secciones" className="grid gap-4 sm:grid-cols-2">
        <TarjetaSeccion
          href="/admin/contenido"
          label="Contenido del sitio"
          icon={IconoCapas}
          destacada
          description="Los textos, las fotos y los servicios de piycsas.com, página por página: inicio, nosotros, servicios, proyectos, valores, cabeceras y datos de contacto."
        />
        {esManager && (
          <TarjetaSeccion
            href="/admin/equipo"
            label="Equipo"
            icon={IconoEquipo}
            count={contadores.cuentas}
            unit={contadores.cuentas === 1 ? "cuenta" : "cuentas"}
            description="Las cuentas del portal: crear, editar, activar o desactivar personas, cambiar su rol y restablecer contraseñas."
          />
        )}
        {esManager && (
          <TarjetaSeccion
            href="/admin/mensajes"
            label="Mensajes de contacto"
            icon={IconoSobre}
            count={contadores.mensajes}
            unit={contadores.mensajes === 1 ? "mensaje" : "mensajes"}
            description="Todo el que llena el formulario del sitio queda registrado aquí, aunque no llegue a enviar el WhatsApp. Desde cada uno se responde con un clic."
          />
        )}
        {esManager && (
          <TarjetaSeccion
            href="/admin/jornadas"
            label="Jornadas"
            icon={IconoReloj}
            count={jornadasPendientes}
            unit={jornadasPendientes === 1 ? "por revisar" : "por revisar"}
            description="El registro de horas del equipo: revisar y aprobar lo que registran desde su portal, corregir, exportar a CSV y fijar los horarios de cada mes."
          />
        )}
      </section>

      {/* Últimos mensajes. Sin mensajes no se pinta la tarjeta (regla 9). */}
      {esManager && mensajes.length > 0 && (
        <section className="mt-8">
          <div className="mb-3 flex flex-wrap items-end justify-between gap-2">
            <h2 className="text-xl font-semibold tracking-titulo text-azul-950">
              Últimos mensajes
            </h2>
            <EnlaceSiguiente href="/admin/mensajes" label="Ver todos" />
          </div>
          <ul className="divide-y divide-separador overflow-hidden rounded-tarjeta bg-blanco shadow-tarjeta">
            {mensajes.map((m) => (
              <li key={m.id} className="flex flex-wrap items-center gap-3 p-4">
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-azul-950">
                    {m.nombre}{" "}
                    <span className="font-normal text-acero-600">· {m.empresa}</span>
                  </p>
                  <p className="mt-0.5 truncate text-sm text-acero-600">{m.mensaje}</p>
                </div>
                <span className="whitespace-nowrap text-xs text-acero-500">
                  {formatearFechaCorta(m.created_at)}
                </span>
                <a
                  href={enlaceWhatsAppLead(m)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={botonWhatsApp}
                >
                  <IconoWhatsApp className="h-3.5 w-3.5" />
                  Responder
                </a>
              </li>
            ))}
          </ul>
        </section>
      )}

      <AyudaSeccion title="¿Por dónde empezar?" className="mt-8">
        Si es la primera vez, entra a{" "}
        <Link
          prefetch={false}
          href="/admin/contenido"
          className="font-semibold text-azul-700 underline"
        >
          Contenido del sitio
        </Link>{" "}
        y revisa los servicios uno por uno: son la parte del sitio que más
        visitan los clientes. Cada pantalla explica qué hace cada campo, y nada
        se publica hasta que pulses «Guardar».
      </AyudaSeccion>

      <p className="mt-6 text-sm text-acero-600">
        <Link
          prefetch={false}
          href="/mi-cuenta?portal=1"
          className="inline-flex items-center gap-1.5 font-semibold text-azul-700 hover:text-azul-800"
        >
          Cambiar mi contraseña
          <IconoFlecha className="h-4 w-4" />
        </Link>
      </p>
    </>
  );
}
