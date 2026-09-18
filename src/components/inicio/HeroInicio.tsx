import Link from "next/link";
import { contacto, mensajesWhatsApp } from "@/data/contacto";
import { enlaceWhatsApp } from "@/lib/whatsapp";
import { IconoFlecha, IconoWhatsApp } from "@/components/ui/iconos";
import { DiagramaEscalera } from "./DiagramaEscalera";

const lineas = [
  {
    titulo: "Automatización y control",
    detalle: "Control PLC y monitoreo HMI/SCADA de procesos industriales.",
  },
  {
    titulo: "Tableros eléctricos",
    detalle: "Ensamble de tableros de control y potencia.",
  },
  {
    titulo: "Telemetría y telecontrol",
    detalle: "Supervisión y operación remota de equipos y procesos.",
  },
  {
    titulo: "Refrigeración y climatización",
    detalle: "Cuartos fríos, refrigeración industrial y aires acondicionados.",
  },
] as const;

const cartela = [
  { dato: "Esquema", valor: "Ilustrativo" },
  { dato: "Norma", valor: "IEC 61131-3" },
  { dato: "Lenguaje", valor: "Escalera (LD)" },
  { dato: "Rev.", valor: "A · 01/01" },
] as const;

/** Marcas de corte en las esquinas del panel, como en un plano. */
function MarcasDeCorte() {
  const comun = "pointer-events-none absolute size-4 border-naranja-500";
  return (
    <>
      <span aria-hidden="true" className={`${comun} -left-2 -top-2 border-l-2 border-t-2`} />
      <span aria-hidden="true" className={`${comun} -right-2 -top-2 border-r-2 border-t-2`} />
      <span aria-hidden="true" className={`${comun} -bottom-2 -left-2 border-b-2 border-l-2`} />
      <span aria-hidden="true" className={`${comun} -bottom-2 -right-2 border-b-2 border-r-2`} />
    </>
  );
}

export function HeroInicio() {
  const hrefWhatsApp = enlaceWhatsApp(mensajesWhatsApp.general);

  return (
    <section aria-labelledby="titulo-inicio" className="fondo-plano border-b border-acero-200">
      <div className="mx-auto grid max-w-sitio gap-12 px-4 pb-14 pt-10 sm:pt-14 lg:grid-cols-12 lg:items-center lg:gap-10 lg:px-8 lg:pb-16 lg:pt-14">
        {/* Texto */}
        <div className="lg:col-span-7">
          <p className="flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.12em] text-acero-600 sm:tracking-[0.16em]">
            <span aria-hidden="true" className="size-2.5 shrink-0 bg-naranja-500" />
            <span>
              Ingeniería<span className="hidden sm:inline"> eléctrica</span> · Automatización · Control
            </span>
          </p>

          <h1
            id="titulo-inicio"
            className="mt-5 text-[2.625rem] font-semibold leading-[0.98] tracking-[-0.01em] text-grafito-950 sm:text-6xl lg:text-[4.375rem]"
          >
            <span className="text-azul-700">Automatización industrial</span>, tableros de control e
            ingeniería eléctrica en Cali
          </h1>

          <p className="mt-6 border-l-[3px] border-naranja-500 pl-4 font-titulo text-2xl font-medium leading-tight text-grafito-800 sm:text-[1.75rem]">
            {contacto.eslogan}
          </p>

          <p className="mt-5 max-w-[60ch] text-base leading-relaxed text-acero-600 sm:text-[1.0625rem]">
            Somos un equipo de ingenieros especializados en proyectos de ingeniería, montaje y
            mantenimiento de equipos eléctricos y electrónicos. Automatizamos equipos y ejecutamos
            obras eléctricas: desde el control de procesos hasta el desarrollo de equipos de óptima
            calidad.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/servicios"
              className="group inline-flex h-12 items-center justify-center gap-3 rounded-fino bg-azul-700 px-6 font-semibold text-blanco transition-colors hover:bg-azul-800"
            >
              Ver servicios
              <IconoFlecha className="size-5 transition-transform group-hover:translate-x-1" />
            </Link>
            <a
              href={hrefWhatsApp}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-12 items-center justify-center gap-3 rounded-fino bg-naranja-500 px-6 font-semibold text-grafito-950 transition-colors hover:bg-naranja-600"
            >
              <IconoWhatsApp className="size-5" />
              Escríbenos por WhatsApp
            </a>
          </div>
        </div>

        {/* Panel con el diagrama */}
        <figure className="relative mx-2 lg:col-span-5 lg:mx-0">
          <MarcasDeCorte />
          <div className="sobre-oscuro border border-grafito-700 bg-grafito-950">
            <div className="flex items-center justify-between gap-4 border-b border-grafito-700 px-4 py-2.5 text-[11px] font-semibold uppercase tracking-[0.14em]">
              <span className="text-acero-200">PLC-01 · Lógica de control</span>
              <span className="flex items-center gap-2 text-naranja-500">
                <span aria-hidden="true" className="size-2 rounded-full bg-naranja-500 animate-parpadeo" />
                En marcha
              </span>
            </div>
            <div className="px-3 py-4 sm:px-5 sm:py-5">
              <DiagramaEscalera className="block h-auto w-full font-sans" />
            </div>
            <figcaption>
              <dl className="grid grid-cols-2 border-t border-grafito-700 sm:grid-cols-4">
                {cartela.map((celda, indice) => (
                  <div
                    key={celda.dato}
                    className={`px-4 py-2.5 ${indice % 2 === 0 ? "border-r" : ""} ${indice < 2 ? "border-b sm:border-b-0" : ""} border-grafito-700 sm:border-r sm:last:border-r-0`}
                  >
                    <dt className="text-[10px] font-semibold uppercase tracking-[0.14em] text-acero-400">
                      {celda.dato}
                    </dt>
                    <dd className="mt-0.5 text-[13px] font-medium text-acero-100">{celda.valor}</dd>
                  </div>
                ))}
              </dl>
            </figcaption>
          </div>
        </figure>
      </div>

      {/* Líneas de trabajo: franja con divisiones, sin tarjetas */}
      <div className="border-t border-acero-200 bg-blanco">
        <h2 className="sr-only">Líneas de servicio</h2>
        <ul className="mx-auto grid max-w-sitio sm:grid-cols-2 lg:grid-cols-4 lg:px-8">
          {lineas.map((linea, indice) => (
            <li
              key={linea.titulo}
              className="flex gap-4 border-b border-acero-200 px-4 py-5 last:border-b-0 sm:odd:border-r sm:[&:nth-last-child(-n+2)]:border-b-0 lg:border-b-0 lg:border-r lg:px-6 lg:py-6 lg:first:pl-0 lg:last:border-r-0"
            >
              <span className="pt-1 font-titulo text-sm font-semibold tabular-nums text-naranja-700">
                {String(indice + 1).padStart(2, "0")}
              </span>
              <div>
                <h3 className="text-xl font-semibold leading-tight text-grafito-950">{linea.titulo}</h3>
                <p className="mt-1.5 text-sm leading-snug text-acero-600">{linea.detalle}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
