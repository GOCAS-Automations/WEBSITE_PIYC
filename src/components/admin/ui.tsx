import Link from "next/link";
import type { ReactNode } from "react";
import { PuntoDeCarga } from "./PuntoDeCarga";
import { IconoFlecha } from "./iconos";
import { AyudaSeccion } from "./ui-base";

/**
 * SISTEMA DE COMPONENTES DEL PANEL — parte de SERVIDOR
 * ====================================================
 * Aquí viven los TEXTOS de ayuda reutilizados y las piezas que dependen de
 * `next/link` (cabecera de sección, tarjetas del hub, botones de volver), que
 * son para Server Components.
 *
 * Los campos, insignias, tarjetas y notas de ayuda están en `./ui-base` —que sí
 * lleva `"use client"`— y se REEXPORTAN desde aquí.
 *
 * ⚠ REGLA 1 DE `AGENTS.md`: **un componente de cliente importa de `./ui-base`,
 * nunca de aquí**. Arrastrar este módulo al navegador deja colgadas las server
 * actions de esa pantalla EN PRODUCCIÓN (el botón se queda en «Guardando…»
 * aunque el dato ya se guardó). En desarrollo no se reproduce.
 */
export * from "./ui-base";

/* ------------------------------------------------------------------ */
/* Textos de ayuda reutilizados                                        */
/* ------------------------------------------------------------------ */

/**
 * Viven aquí, y no repetidos en cada pantalla, para que digan siempre lo mismo.
 * Están escritos en español llano: quien usa el panel no es técnico.
 */

/** Cuánto tarda en verse un cambio en el sitio público (ISR, 5 minutos). */
export const AYUDA_PUBLICACION =
  "Lo que guardes aquí se ve en el sitio en pocos minutos.";

/** Qué hace el campo «Orden». */
export const AYUDA_ORDEN =
  "El número controla la posición: el más bajo aparece primero.";

/** Diferencia entre ocultar y eliminar (regla 6: rechazar ≠ eliminar). */
export const AYUDA_VISIBILIDAD =
  "Ocultar es reversible y no borra nada: el contenido se conserva aquí y puedes volver a mostrarlo cuando quieras. Eliminar sí es permanente. Para retirar algo del sitio de forma temporal, oculta.";

/** Por qué un elemento puede cambiar de página al guardarlo. */
export const AYUDA_ORDEN_PAGINAS =
  "La lista va de 10 en 10, ordenada por el número de orden. Si le cambias el orden a un elemento y guardas, pasa a su nuevo lugar aunque quede en otra página.";

/** Qué es el texto alternativo de una imagen y por qué importa. */
export const AYUDA_ALT =
  "Describe en pocas palabras lo que se ve en la foto. Lo leen en voz alta los programas que usan las personas con discapacidad visual y le sirve a Google para entender la imagen. Es obligatorio.";

/** Qué es el slug y por qué conviene no cambiarlo. */
export const AYUDA_SLUG =
  "Es la parte final de la dirección (piycsas.com/servicios/ESTO). Se propone solo a partir del título; cámbialo únicamente si hace falta, porque los enlaces que ya se compartieron con el anterior dejarán de funcionar.";

/** Qué hace el bloque de video de un servicio. */
export const AYUDA_VIDEO =
  "Pega el enlace de YouTube tal como sale de la barra del navegador o del botón «Compartir». El video aparece en la página del servicio con su título y su descripción; el interruptor empieza apagado: enciéndelo cuando el enlace esté listo para publicarse.";

/** Recordatorio de guardar, el aviso que más falta hace. */
export const AYUDA_GUARDAR_BLOQUES =
  "Los cambios NO se aplican hasta que pulses «Guardar» en el bloque que editaste.";

/**
 * Aviso de guardado para la cabecera de una pantalla de contenido.
 * UNO POR PANTALLA, nunca uno por bloque: repetirlo junto a cada botón lo
 * convierte en ruido que se deja de leer.
 */
export function AvisoGuardar({
  className = "mb-6",
  unico = false,
}: {
  className?: string;
  /** true = la pantalla es UN formulario con un solo botón al final. */
  unico?: boolean;
}) {
  return (
    <AyudaSeccion tono="aviso" title="Recuerda guardar" className={className}>
      {unico ? (
        <>
          Esta pantalla se guarda con <strong>un solo botón</strong>, al final
          del formulario. {AYUDA_GUARDAR_BLOQUES} Si sales sin guardar, lo
          escrito se pierde.
        </>
      ) : (
        <>
          Esta pantalla guarda <strong>bloque a bloque</strong>: cada tarjeta
          tiene su propio botón. {AYUDA_GUARDAR_BLOQUES} Si cambias de sección
          sin guardar, lo escrito se pierde. {AYUDA_PUBLICACION}
        </>
      )}
    </AyudaSeccion>
  );
}

/* ------------------------------------------------------------------ */
/* Enlaces y navegación                                                */
/* ------------------------------------------------------------------ */

/** Botón «← Volver a …». `prefetch={false}`, como toda la navegación del panel. */
export function EnlaceVolver({
  href,
  label,
  className = "",
}: {
  href: string;
  label: string;
  className?: string;
}) {
  return (
    <Link
      prefetch={false}
      href={href}
      className={`inline-flex items-center gap-1.5 rounded-fino border border-acero-300 bg-blanco px-3.5 py-2 text-sm font-semibold text-acero-700 transition-colors hover:border-azul-700 hover:text-azul-700 ${className}`}
    >
      <span aria-hidden="true">←</span>
      {label}
      <PuntoDeCarga className="ml-0.5" />
    </Link>
  );
}

export function EnlacePrimario({
  href,
  children,
  className = "",
}: {
  href: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <Link
      prefetch={false}
      href={href}
      className={`inline-flex items-center gap-2 rounded-fino bg-azul-700 px-4 py-2.5 text-sm font-semibold text-blanco transition-colors hover:bg-azul-800 ${className}`}
    >
      {children}
      <PuntoDeCarga className="ml-0.5" />
    </Link>
  );
}

/**
 * Cabecera de una sección del panel: migas, título, descripción y acción
 * principal opcional.
 */
export function CabeceraPanel({
  title,
  description,
  backHref = "/admin",
  backLabel = "Volver al panel",
  breadcrumb,
  action,
}: {
  title: string;
  description?: string;
  backHref?: string;
  backLabel?: string;
  breadcrumb?: { label: string; href?: string }[];
  action?: ReactNode;
}) {
  return (
    <header className="mb-7">
      <div className="flex flex-wrap items-center gap-3">
        <EnlaceVolver href={backHref} label={backLabel} />
        {breadcrumb && breadcrumb.length > 0 && (
          <nav aria-label="Ruta del panel">
            <ol className="flex flex-wrap items-center gap-1.5 text-xs text-acero-500">
              {breadcrumb.map((crumb, i) => (
                <li key={`${crumb.label}-${i}`} className="flex items-center gap-1.5">
                  {crumb.href ? (
                    <Link
                      prefetch={false}
                      href={crumb.href}
                      className="transition-colors hover:text-azul-700"
                    >
                      {crumb.label}
                    </Link>
                  ) : (
                    <span className="font-semibold text-acero-700">{crumb.label}</span>
                  )}
                  {i < breadcrumb.length - 1 && <span aria-hidden="true">/</span>}
                </li>
              ))}
            </ol>
          </nav>
        )}
      </div>

      <div className="mt-4 flex flex-wrap items-end justify-between gap-4 border-b border-acero-200 pb-4">
        <div>
          <h1 className="font-titulo text-3xl font-semibold uppercase tracking-wide text-azul-950 sm:text-4xl">
            {title}
          </h1>
          {description && (
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-acero-600">
              {description}
            </p>
          )}
        </div>
        {action}
      </div>
    </header>
  );
}

/**
 * Tarjeta de acceso a una sección. La comparten el dashboard y el índice de
 * contenido: dos rejillas iguales duplicadas acaban diferenciándose sin querer.
 *
 * `prefetch={false}` porque una rejilla de ocho tarjetas visibles a la vez
 * serían, con el prefetch por defecto, ocho peticiones simultáneas a rutas
 * `force-dynamic`.
 */
export function TarjetaSeccion({
  href,
  label,
  icon: Icon,
  count = null,
  unit = "",
  description,
  destacada = false,
}: {
  href: string;
  label: string;
  icon: (props: { className?: string }) => ReactNode;
  /** Regla 9: `0` no se pinta. Pasa `null` cuando no hay nada que contar. */
  count?: number | null;
  unit?: string;
  description: string;
  destacada?: boolean;
}) {
  return (
    <Link
      href={href}
      prefetch={false}
      className={`group flex flex-col rounded-fino border bg-blanco p-5 transition-colors hover:border-azul-700 ${
        destacada ? "border-azul-300" : "border-acero-200"
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <span className="inline-flex h-11 w-11 items-center justify-center rounded-fino border border-acero-200 bg-acero-50 text-azul-700 transition-colors group-hover:border-azul-700 group-hover:bg-azul-700 group-hover:text-blanco">
          <Icon className="h-5 w-5" />
        </span>
        {/* Regla 9: `0` nunca se muestra como dato. */}
        {count !== null && count > 0 && (
          <span className="rounded-fino border border-acero-200 bg-acero-50 px-2.5 py-1 text-xs font-semibold text-acero-600">
            {count} {unit}
          </span>
        )}
      </div>
      <h3 className="mt-4 font-titulo text-lg font-semibold uppercase tracking-wide text-azul-950 group-hover:text-azul-700">
        {label}
      </h3>
      <p className="mt-1.5 flex-1 text-sm leading-relaxed text-acero-600">
        {description}
      </p>
      <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-azul-700">
        Administrar
        <IconoFlecha className="h-4 w-4 transition-transform group-hover:translate-x-1" />
        <PuntoDeCarga className="ml-1" />
      </span>
    </Link>
  );
}

/** Enlace de «siguiente paso» al pie de una pantalla. */
export function EnlaceSiguiente({ href, label }: { href: string; label: string }) {
  return (
    <Link
      prefetch={false}
      href={href}
      className="inline-flex items-center gap-1.5 text-sm font-semibold text-azul-700 transition-colors hover:text-azul-800"
    >
      {label}
      <IconoFlecha className="h-4 w-4" />
      <PuntoDeCarga className="ml-0.5" />
    </Link>
  );
}
