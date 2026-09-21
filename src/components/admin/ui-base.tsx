"use client";

/**
 * PRIMITIVAS DEL PANEL QUE TAMBIÉN USAN LOS COMPONENTES DE CLIENTE
 * ================================================================
 * Campos, insignias, tarjetas, notas de ayuda y el control de paginación.
 * `components/admin/ui.tsx` las **reexporta**, así que un Server Component
 * puede importarlas de cualquiera de los dos.
 *
 * POR QUÉ ESTE ARCHIVO EXISTE (regla 1 de `AGENTS.md`)
 * ----------------------------------------------------
 * `ui.tsx` NO lleva `"use client"` y entre sus importaciones está
 * `PuntoDeCarga`, que sí es de cliente. Mientras solo lo importen Server
 * Components, eso es correcto. El problema aparece cuando un **Client
 * Component** importa un COMPONENTE de `ui.tsx`: entonces `ui.tsx` entra
 * también en el grafo del navegador arrastrando esa referencia de cliente y, en
 * **producción**, la respuesta de cualquier server action de esa pantalla deja
 * de llegar. El botón se queda en «Guardando…» aunque el dato SÍ se escribió.
 * En desarrollo no se reproduce: por eso en GPI costó días encontrarlo.
 *
 * REGLA: **un componente `"use client"` importa estas piezas de AQUÍ, nunca de
 * `ui.tsx`.**
 *
 * ESTILO — SISTEMA v3 «iOS» (y no es el panel de GPI, regla 13)
 * -------------------------------------------------------------
 * Fondo agrupado (`lienzo`), contenido en **tarjetas blancas redondeadas**
 * (`rounded-tarjeta`) con sombra difusa de tinte azul (`shadow-tarjeta`),
 * listas agrupadas con separadores hairline (`separador`), botones cápsula,
 * campos rellenos con anillo de foco y chips en cápsula.
 *
 * Ningún color ni radio escrito a mano: todo sale de los tokens de `@theme`
 * (`src/app/globals.css`, espejo de `src/lib/tokens.ts`). `rounded-fino` y
 * `rounded-medio` siguen existiendo por compatibilidad, pero **no se usan
 * aquí**: son del sistema v2.
 */

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition, type ReactNode } from "react";
import {
  IconoChevronAbajo,
  IconoChevronDerecha,
  IconoChevronIzquierda,
  IconoInfo,
} from "./iconos";
import {
  FILAS_POR_PAGINA,
  hrefConPagina,
  paginar,
  type PaginaDe,
} from "@/lib/paginacion";
import { PuntoDeCarga } from "./PuntoDeCarga";
import {
  CHIP_NEUTRO,
  CHIP_VERDE,
  inputClass,
  interruptorRiel,
  tarjetaClase,
} from "./clases";

/* ------------------------------------------------------------------ */
/* Clases compartidas                                                  */
/* ------------------------------------------------------------------ */

/**
 * Viven en `./clases` —módulo NEUTRO, sin `"use client"`— para que también las
 * puedan leer las páginas de servidor (regla 4). Aquí se reexportan para no
 * romper a los componentes de cliente que ya importaban de `./ui-base`.
 */
export * from "./clases";

/* ------------------------------------------------------------------ */
/* Ayuda para personas no técnicas                                     */
/* ------------------------------------------------------------------ */

/**
 * Nota de ayuda: un párrafo corto con icono, opcionalmente titulado.
 *
 * `tono="info"` (por defecto) para explicaciones y `tono="aviso"` para lo que
 * conviene leer antes de tocar algo. El aviso va en el **neutro cálido**
 * (`aviso-*`), con borde e icono propios: en el azul de marca se confundía con
 * la ayuda informativa y se dejaba de leer. El rojo sigue reservado a los
 * errores de validación.
 */
export function AyudaSeccion({
  children,
  title,
  tono = "info",
  className = "",
}: {
  children: ReactNode;
  title?: string;
  tono?: "info" | "aviso";
  className?: string;
}) {
  const info = tono === "info";
  return (
    <div
      className={`flex items-start gap-3 rounded-tarjeta px-4 py-3.5 text-sm leading-relaxed ${
        info
          ? "bg-relleno text-acero-700"
          : "border border-aviso-200 bg-aviso-50 text-aviso-700"
      } ${className}`}
    >
      <IconoInfo
        className={`mt-0.5 h-4 w-4 shrink-0 ${info ? "text-acero-500" : "text-aviso-500"}`}
      />
      <div className="min-w-0">
        {title && (
          <p className={`font-semibold ${info ? "text-azul-950" : "text-aviso-700"}`}>
            {title}
          </p>
        )}
        <div className={title ? "mt-1" : ""}>{children}</div>
      </div>
    </div>
  );
}

/**
 * Ayuda desplegable para textos largos: se abre solo si la persona quiere.
 * `<details>`/`<summary>` nativos, así que funciona sin JavaScript y es
 * accesible con teclado sin código extra.
 */
export function AyudaDesplegable({
  label,
  children,
  className = "",
}: {
  label: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <details className={`group rounded-tarjeta bg-relleno px-4 py-3.5 ${className}`}>
      <summary className="flex cursor-pointer list-none items-center gap-2 text-sm font-semibold text-acero-700 transition-colors hover:text-azul-700 [&::-webkit-details-marker]:hidden">
        <IconoInfo className="h-4 w-4 shrink-0 text-azul-700" />
        {label}
        <IconoChevronAbajo className="ml-auto h-4 w-4 shrink-0 transition-transform duration-200 ease-ios group-open:rotate-180" />
      </summary>
      <div className="mt-3 text-sm leading-relaxed text-acero-700">{children}</div>
    </details>
  );
}

/* ------------------------------------------------------------------ */
/* Campos de formulario                                                */
/* ------------------------------------------------------------------ */

/**
 * Los campos usan `htmlFor`/`id` explícitos y enlazan la ayuda con
 * `aria-describedby`: el lector de pantalla lee primero la etiqueta y después
 * la ayuda, en vez de mezclarlo todo en el nombre del campo.
 *
 * `scope` es obligatorio cuando una pantalla tiene VARIOS formularios que
 * reutilizan el mismo `name` (p. ej. «Título» en cada bloque de Nosotros): los
 * `name` pueden repetirse entre formularios, los `id` del documento no.
 */
const idCampo = (name: string, scope?: string) =>
  scope ? `campo-${scope}-${name}` : `campo-${name}`;
const idAyuda = (name: string, scope?: string) => `${idCampo(name, scope)}-ayuda`;

interface PropsCampo {
  label: string;
  name: string;
  defaultValue?: string | number | null;
  placeholder?: string;
  required?: boolean;
  type?: string;
  hint?: string;
  className?: string;
  maxLength?: number;
  readOnly?: boolean;
  scope?: string;
  /** Se pasa tal cual al `<input>` (p. ej. `inputMode`, `autoComplete`). */
  autoComplete?: string;
}

export function Campo({
  label,
  name,
  defaultValue,
  placeholder,
  required,
  type = "text",
  hint,
  className = "",
  scope,
  maxLength,
  readOnly,
  autoComplete,
}: PropsCampo) {
  return (
    <div className={`block ${className}`}>
      <label
        htmlFor={idCampo(name, scope)}
        className="mb-2 block text-[13px] font-semibold text-acero-600"
      >
        {label}
        {required && <span className="text-azul-700"> *</span>}
      </label>
      <input
        id={idCampo(name, scope)}
        name={name}
        type={type}
        required={required}
        maxLength={maxLength}
        readOnly={readOnly}
        autoComplete={autoComplete}
        aria-required={required ? true : undefined}
        aria-describedby={hint ? idAyuda(name, scope) : undefined}
        defaultValue={defaultValue ?? ""}
        placeholder={placeholder}
        className={`${inputClass} ${readOnly ? "cursor-not-allowed bg-relleno text-acero-500" : ""}`}
      />
      {hint && (
        <span
          id={idAyuda(name, scope)}
          className="mt-1 block text-xs leading-relaxed text-acero-600"
        >
          {hint}
        </span>
      )}
    </div>
  );
}

export function AreaTexto({
  label,
  name,
  defaultValue,
  placeholder,
  required,
  rows = 4,
  hint,
  className = "",
  scope,
  maxLength,
}: Omit<PropsCampo, "type"> & { rows?: number }) {
  return (
    <div className={`block ${className}`}>
      <label
        htmlFor={idCampo(name, scope)}
        className="mb-2 block text-[13px] font-semibold text-acero-600"
      >
        {label}
        {required && <span className="text-azul-700"> *</span>}
      </label>
      <textarea
        id={idCampo(name, scope)}
        name={name}
        rows={rows}
        required={required}
        maxLength={maxLength}
        aria-required={required ? true : undefined}
        aria-describedby={hint ? idAyuda(name, scope) : undefined}
        defaultValue={defaultValue ?? ""}
        placeholder={placeholder}
        className={`${inputClass} resize-y`}
      />
      {hint && (
        <span
          id={idAyuda(name, scope)}
          className="mt-1 block text-xs leading-relaxed text-acero-600"
        >
          {hint}
        </span>
      )}
    </div>
  );
}

export function Selector({
  label,
  name,
  defaultValue,
  options,
  hint,
  className = "",
  scope,
  disabled,
}: {
  label: string;
  name: string;
  defaultValue?: string;
  options: { value: string; label: string }[];
  hint?: string;
  className?: string;
  scope?: string;
  disabled?: boolean;
}) {
  return (
    <div className={`block ${className}`}>
      <label
        htmlFor={idCampo(name, scope)}
        className="mb-2 block text-[13px] font-semibold text-acero-600"
      >
        {label}
      </label>
      <select
        id={idCampo(name, scope)}
        name={name}
        defaultValue={defaultValue}
        disabled={disabled}
        aria-describedby={hint ? idAyuda(name, scope) : undefined}
        className={`${inputClass} ${disabled ? "cursor-not-allowed bg-relleno text-acero-500" : ""}`}
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
      {hint && (
        <span
          id={idAyuda(name, scope)}
          className="mt-1 block text-xs leading-relaxed text-acero-600"
        >
          {hint}
        </span>
      )}
    </div>
  );
}

/**
 * Interruptor visible/oculto.
 *
 * Envía SIEMPRE un valor: un input oculto con `"false"` y, si está encendido,
 * también el checkbox con `"true"`. Sin el oculto, un checkbox desmarcado no
 * manda nada y el servidor no podría distinguir «apagado» de «no enviado». Se
 * lee con `bool()` de `src/lib/admin/formulario.ts`.
 *
 * El verde del encendido es el acento de PIYC (señal energizada), en la dosis
 * pequeña que le toca.
 */
export function Interruptor({
  label,
  name,
  defaultChecked = true,
  hint,
  onLabel = "Visible",
  offLabel = "Oculto",
}: {
  label: string;
  name: string;
  defaultChecked?: boolean;
  hint?: string;
  onLabel?: string;
  offLabel?: string;
}) {
  return (
    <div>
      <span className="mb-2 block text-[13px] font-semibold text-acero-600">{label}</span>
      <label className="inline-flex cursor-pointer items-center gap-3 rounded-campo bg-lienzo-alto px-3.5 py-2.5 transition duration-200 ease-ios hover:bg-relleno">
        <input type="hidden" name={name} value="false" />
        {/* El checkbox es el riel (appearance-none) y su ::before la perilla:
            los estados dependen solo de :checked, sin JavaScript. El `input`
            real sigue ahí, así que el teclado y el lector de pantalla lo tratan
            como la casilla que es. */}
        <input
          type="checkbox"
          name={name}
          value="true"
          defaultChecked={defaultChecked}
          className={interruptorRiel}
        />
        <span className="text-sm font-semibold text-acero-600 peer-checked:hidden">
          {offLabel}
        </span>
        <span className="hidden text-sm font-semibold text-verde-700 peer-checked:inline">
          {onLabel}
        </span>
      </label>
      {hint && <p className="mt-1.5 text-xs leading-relaxed text-acero-600">{hint}</p>}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Insignias y contenedores                                            */
/* ------------------------------------------------------------------ */

/** Chip en cápsula, con tinte suave y texto que cumple AA sobre él. */
export function Insignia({
  children,
  className = CHIP_NEUTRO,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-capsula px-2.5 py-1 text-[11px] font-semibold leading-none ${className}`}
    >
      {children}
    </span>
  );
}

/** Insignia de visibilidad de un elemento de contenido. */
export function InsigniaPublicado({ published }: { published: boolean }) {
  return (
    <Insignia className={published ? CHIP_VERDE : CHIP_NEUTRO}>
      {published ? "Visible" : "Oculto"}
    </Insignia>
  );
}

/** Superficie del panel: tarjeta blanca redondeada, sombra difusa azulada. */
export function Tarjeta({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={`${tarjetaClase} p-5 sm:p-6 ${className}`}>{children}</div>
  );
}

export function TituloTarjeta({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="mb-5 flex flex-wrap items-start justify-between gap-3 border-b border-separador pb-4">
      <div>
        <h2 className="text-lg font-semibold tracking-titulo text-azul-950">
          {title}
        </h2>
        {description && (
          <p className="mt-1 max-w-2xl text-sm leading-relaxed text-acero-600">
            {description}
          </p>
        )}
      </div>
      {action}
    </div>
  );
}

export function EstadoVacio({
  title,
  description,
  action,
}: {
  title: string;
  description: string;
  action?: ReactNode;
}) {
  return (
    <div className={`${tarjetaClase} px-6 py-12 text-center`}>
      <p className="text-lg font-semibold tracking-titulo text-azul-950">{title}</p>
      <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-acero-600">
        {description}
      </p>
      {action && <div className="mt-6 flex justify-center">{action}</div>}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Control segmentado                                                  */
/* ------------------------------------------------------------------ */

/**
 * CONTROL SEGMENTADO, como el de iOS: un riel relleno con la pastilla blanca
 * sobre la opción activa. Se usa para los filtros de estado, donde las opciones
 * son pocas y conviene verlas todas a la vez en vez de abrir un desplegable.
 *
 * Por dentro son `<button type="button">`, así que **no envía el formulario**
 * que lo contenga; el valor se comunica por `onCambiar`. Para un `<form
 * method="get">` está `Selector`, que sí viaja en la petición.
 */
export function ControlSegmentado<T extends string>({
  etiqueta,
  valor,
  opciones,
  onCambiar,
  className = "",
}: {
  etiqueta: string;
  valor: T;
  opciones: { value: T; label: string }[];
  onCambiar: (valor: T) => void;
  className?: string;
}) {
  return (
    <div
      role="group"
      aria-label={etiqueta}
      className={`inline-flex w-full min-w-0 gap-1 rounded-control bg-relleno p-1 ${className}`}
    >
      {opciones.map((o) => {
        const activa = o.value === valor;
        return (
          <button
            key={o.value}
            type="button"
            aria-pressed={activa}
            onClick={() => onCambiar(o.value)}
            className={`min-w-0 flex-1 truncate rounded-chip px-2 py-1.5 text-[12px] font-semibold transition duration-200 ease-ios sm:px-3 sm:text-[13px] ${
              activa
                ? "bg-blanco text-azul-800 shadow-sutil"
                : "text-acero-600 hover:text-azul-800"
            }`}
          >
            {o.label}
          </button>
        );
      })}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Paginación — el ÚNICO control de páginas del panel                   */
/* ------------------------------------------------------------------ */

type PaginacionComun = {
  pagina: number;
  /** Filas del conjunto completo. Con él se pinta «Mostrando a–b de N». */
  total?: number;
  porPagina?: number;
  totalPaginas?: number;
  /** `id` del principio del listado, para volver ahí al cambiar de página. */
  ancla?: string;
  etiqueta?: string;
  className?: string;
};

type PropsPaginacion = PaginacionComun &
  (
    | { onCambiar: (pagina: number) => void; hrefBase?: never }
    | { hrefBase: string; onCambiar?: never }
  );

const BOTON_PAGINA =
  "inline-flex items-center gap-1 rounded-capsula bg-blanco px-3.5 py-2 text-xs font-semibold text-azul-800 shadow-sutil transition duration-200 ease-ios hover:bg-azul-50 active:scale-[0.97]";

/** «Mostrando a–b de N» · Anterior · Página [n] de N · Siguiente. */
export function Paginacion(props: PropsPaginacion) {
  const {
    pagina,
    total,
    porPagina = FILAS_POR_PAGINA,
    ancla,
    etiqueta = "Paginación",
    className = "mt-4",
  } = props;
  const totalPaginas =
    props.totalPaginas ?? Math.max(1, Math.ceil((total ?? 0) / porPagina));

  const router = useRouter();
  const [, startTransition] = useTransition();
  const [valor, setValor] = useState(String(pagina));
  // Si la página cambia desde fuera (filtros, botón atrás), el campo se
  // resincroniza durante el render, sin efecto.
  const [previa, setPrevia] = useState(pagina);
  if (previa !== pagina) {
    setPrevia(pagina);
    setValor(String(pagina));
  }

  if (totalPaginas <= 1) return null;

  const href = (n: number) =>
    `${hrefConPagina(props.hrefBase ?? "", n)}${ancla ? `#${ancla}` : ""}`;

  function volverAlAncla() {
    if (!ancla) return;
    requestAnimationFrame(() => {
      const el = document.getElementById(ancla);
      if (el && el.getBoundingClientRect().top < 0) {
        el.scrollIntoView({ block: "start", behavior: "smooth" });
      }
    });
  }

  function ir(n: number) {
    const destino = Math.max(1, Math.min(totalPaginas, n));
    setValor(String(destino));
    if (destino === pagina) return;
    if (props.onCambiar) {
      props.onCambiar(destino);
      volverAlAncla();
    } else {
      startTransition(() => {
        router.push(href(destino), { scroll: Boolean(ancla) });
      });
    }
  }

  function confirmar() {
    const n = Number.parseInt(valor, 10);
    if (Number.isNaN(n)) {
      setValor(String(pagina));
      return;
    }
    ir(n);
  }

  function control(
    destino: number,
    habilitado: boolean,
    texto: string,
    etiquetaControl: string,
    icono: ReactNode,
    iconoAlFinal = false,
  ) {
    const contenido = (
      <>
        {!iconoAlFinal && icono}
        {texto}
        {iconoAlFinal && icono}
      </>
    );
    if (!habilitado) {
      return (
        <span
          aria-disabled="true"
          className={`${BOTON_PAGINA} pointer-events-none opacity-35`}
        >
          {contenido}
        </span>
      );
    }
    if (props.onCambiar) {
      return (
        <button
          type="button"
          onClick={() => ir(destino)}
          aria-label={etiquetaControl}
          className={BOTON_PAGINA}
        >
          {contenido}
        </button>
      );
    }
    return (
      <Link
        prefetch={false}
        href={href(destino)}
        scroll={Boolean(ancla)}
        aria-label={etiquetaControl}
        className={BOTON_PAGINA}
      >
        {contenido}
        <PuntoDeCarga className="ml-0.5" />
      </Link>
    );
  }

  const desde = total != null ? (pagina - 1) * porPagina + 1 : 0;
  const hasta = total != null ? Math.min(pagina * porPagina, total) : 0;

  return (
    <nav
      aria-label={etiqueta}
      className={`flex flex-col items-center gap-2.5 sm:flex-row ${
        total != null ? "sm:justify-between" : "sm:justify-center"
      } ${className}`}
    >
      {total != null && (
        <p className="text-xs text-acero-600" aria-live="polite">
          Mostrando{" "}
          <strong className="font-semibold text-azul-950">
            {desde}–{hasta}
          </strong>{" "}
          de <strong className="font-semibold text-azul-950">{total}</strong>
        </p>
      )}
      <div className="flex items-center gap-1.5 sm:gap-2">
        {control(
          pagina - 1,
          pagina > 1,
          "Anterior",
          "Página anterior",
          <IconoChevronIzquierda className="h-3.5 w-3.5" />,
        )}
        <span className="inline-flex items-center gap-1.5 whitespace-nowrap text-xs text-acero-600">
          <span className="hidden sm:inline">Página</span>
          <input
            type="text"
            inputMode="numeric"
            value={valor}
            onChange={(e) => setValor(e.target.value.replace(/\D/g, ""))}
            onBlur={confirmar}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                confirmar();
              }
            }}
            aria-label={`Ir a la página (de 1 a ${totalPaginas})`}
            className="w-11 rounded-chip border border-separador bg-blanco px-1.5 py-1.5 text-center text-xs font-semibold text-azul-950 focus:border-azul-500 focus:outline-none focus:ring-4 focus:ring-azul-700/15"
          />
          de {totalPaginas}
        </span>
        {control(
          pagina + 1,
          pagina < totalPaginas,
          "Siguiente",
          "Página siguiente",
          <IconoChevronDerecha className="h-3.5 w-3.5" />,
          true,
        )}
      </div>
    </nav>
  );
}

/**
 * Paginación con estado local, para las tablas que se filtran en el cliente.
 * `claveReinicio` resume los filtros: cuando cambia, se vuelve a la página 1
 * (ajuste durante el render, el patrón que recomienda React, sin efecto).
 */
export function usePaginaLocal<T>(
  lista: readonly T[],
  claveReinicio = "",
  porPagina: number = FILAS_POR_PAGINA,
): PaginaDe<T> & { setPagina: (pagina: number) => void } {
  const [pagina, setPagina] = useState(1);
  const [clave, setClave] = useState(claveReinicio);
  const reiniciar = clave !== claveReinicio;
  if (reiniciar) {
    setClave(claveReinicio);
    setPagina(1);
  }
  return { ...paginar(lista, reiniciar ? 1 : pagina, porPagina), setPagina };
}
