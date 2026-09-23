"use client";

import { useRef, useState } from "react";
import { esImagenOptimizable } from "@/lib/imagenes";
import { subirImagenAlBucket } from "./subir-imagen";
import { botonChico, botonPeligro, botonSecundario, inputClass } from "./ui-base";
import { IconoChevronAbajo, IconoFoto, IconoMas, IconoPapelera, IconoSubir } from "./iconos";
import type { CarpetaImagen } from "@/lib/admin-types";
import type { LogoCliente } from "@/lib/content-types";

/**
 * LOGOS DE CLIENTES DE LA PORTADA
 * ===============================
 * Lista de filas `{ nombre, logo, proyectoSlug }` que se puede **agregar,
 * reordenar y quitar**. Como la galería, viaja al servidor en campos repetidos
 * en paralelo (`cliente_nombre`, `cliente_logo`, `cliente_logo_alt`,
 * `cliente_slug` y los ocultos `cliente_logo_movil`, `_ancho` y `_alto`): la
 * server action los empareja por posición, así que cada fila pinta SIEMPRE los
 * siete campos aunque vayan vacíos.
 *
 * El orden de la franja es el orden de esta lista: por eso las flechas, y no
 * un campo «posición» que obligue a renumerar todo para meter uno en medio.
 *
 * `proyectoSlug` es la dirección del caso de éxito de ese cliente. Vacío —o de
 * un proyecto que todavía no está publicado— deja el logo sin enlace: se ve
 * igual, pero no lleva a ninguna parte. Nunca manda a un 404.
 */

type Fila = LogoCliente & { key: number };

let contador = 0;
const nuevaFila = (cliente?: LogoCliente): Fila => ({
  nombre: cliente?.nombre ?? "",
  logo: cliente?.logo ?? { src: "", alt: "" },
  proyectoSlug: cliente?.proyectoSlug ?? "",
  key: contador++,
});

export function CampoLogos({
  label,
  defaultValue,
  folder,
  hint,
  slugsDisponibles = [],
}: {
  label: string;
  defaultValue?: LogoCliente[];
  folder: CarpetaImagen;
  hint?: string;
  /** Slugs de proyectos que existen, para la lista de sugerencias del campo. */
  slugsDisponibles?: string[];
}) {
  const [filas, setFilas] = useState<Fila[]>(() =>
    (defaultValue ?? []).map((cliente) => nuevaFila(cliente)),
  );

  function actualizar(key: number, cambio: Partial<LogoCliente>) {
    setFilas((prev) => prev.map((fila) => (fila.key === key ? { ...fila, ...cambio } : fila)));
  }

  /** Mueve una fila un puesto arriba (`-1`) o abajo (`+1`). */
  function mover(indice: number, salto: -1 | 1) {
    setFilas((prev) => {
      const destino = indice + salto;
      if (destino < 0 || destino >= prev.length) return prev;
      const copia = [...prev];
      [copia[indice], copia[destino]] = [copia[destino]!, copia[indice]!];
      return copia;
    });
  }

  return (
    <div>
      <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
        <span className="text-[15px] font-semibold text-azul-950">{label}</span>
        <button
          type="button"
          onClick={() => setFilas((prev) => [...prev, nuevaFila()])}
          className={`${botonSecundario} ${botonChico}`}
        >
          <IconoMas className="h-3.5 w-3.5" />
          Agregar cliente
        </button>
      </div>

      {hint && <p className="mb-3 text-xs leading-relaxed text-acero-600">{hint}</p>}

      {slugsDisponibles.length > 0 && (
        <datalist id="slugs-de-proyecto">
          {slugsDisponibles.map((slug) => (
            <option key={slug} value={slug} />
          ))}
        </datalist>
      )}

      {filas.length === 0 ? (
        <p className="rounded-tarjeta bg-relleno px-4 py-6 text-center text-sm text-acero-600">
          Sin clientes. Con «Agregar cliente» se añade el primero; mientras la
          lista esté vacía, la franja de logos no aparece en la portada.
        </p>
      ) : (
        <ul className="space-y-3">
          {filas.map((fila, indice) => (
            <li key={fila.key} className="rounded-control bg-lienzo-alto p-3 ring-1 ring-separador">
              <FilaLogo
                indice={indice}
                total={filas.length}
                fila={fila}
                folder={folder}
                conSugerencias={slugsDisponibles.length > 0}
                onCambio={(cambio) => actualizar(fila.key, cambio)}
                onMover={(salto) => mover(indice, salto)}
                onQuitar={() => setFilas((prev) => prev.filter((f) => f.key !== fila.key))}
              />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function FilaLogo({
  indice,
  total,
  fila,
  folder,
  conSugerencias,
  onCambio,
  onMover,
  onQuitar,
}: {
  indice: number;
  total: number;
  fila: Fila;
  folder: CarpetaImagen;
  conSugerencias: boolean;
  onCambio: (cambio: Partial<LogoCliente>) => void;
  onMover: (salto: -1 | 1) => void;
  onQuitar: () => void;
}) {
  const [subiendo, setSubiendo] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const src = fila.logo.src;
  const conLogo = src.trim() !== "";
  const enlaceNoPermitido = /^https?:\/\/\S+$/i.test(src.trim()) && !esImagenOptimizable(src.trim());

  function cambiarLogo(cambio: Partial<LogoCliente["logo"]>) {
    onCambio({ logo: { ...fila.logo, ...cambio } });
  }

  async function manejarArchivo(file: File) {
    setSubiendo(true);
    setError(null);
    const resultado = await subirImagenAlBucket(file, folder);
    if ("error" in resultado) setError(resultado.error);
    else
      cambiarLogo({
        src: resultado.url,
        srcMovil: resultado.urlMovil,
        width: resultado.width,
        height: resultado.height,
      });
    setSubiendo(false);
    if (fileRef.current) fileRef.current.value = "";
  }

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-start">
      {/* Vista previa sobre blanco: así se ve el logo como se verá en la franja. */}
      <div className="flex h-20 w-28 shrink-0 items-center justify-center overflow-hidden rounded-control bg-blanco ring-1 ring-separador">
        {conLogo ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={src}
            alt=""
            className="h-full w-full object-contain p-2"
            onLoad={(e) => {
              const { naturalWidth: width, naturalHeight: height } = e.currentTarget;
              if (width > 0 && height > 0 && (width !== fila.logo.width || height !== fila.logo.height)) {
                cambiarLogo({ width, height });
              }
            }}
          />
        ) : (
          <IconoFoto className="h-6 w-6 text-acero-400" />
        )}
      </div>

      <div className="min-w-0 flex-1 space-y-2">
        <div className="grid gap-2 sm:grid-cols-2">
          <input
            name="cliente_nombre"
            type="text"
            maxLength={80}
            value={fila.nombre}
            onChange={(e) => onCambio({ nombre: e.target.value })}
            placeholder="Nombre del cliente (JGB, Colombina…)"
            aria-label={`Nombre del cliente ${indice + 1}`}
            className={inputClass}
          />
          <input
            name="cliente_slug"
            type="text"
            list={conSugerencias ? "slugs-de-proyecto" : undefined}
            value={fila.proyectoSlug ?? ""}
            onChange={(e) => onCambio({ proyectoSlug: e.target.value })}
            placeholder="Dirección del caso (opcional)"
            aria-label={`Caso de éxito del cliente ${indice + 1}`}
            className={inputClass}
          />
        </div>

        <input
          name="cliente_logo"
          type="text"
          value={src}
          // Otra URL es otro archivo: la variante y las medidas anteriores ya
          // no le corresponden.
          onChange={(e) =>
            cambiarLogo({ src: e.target.value, srcMovil: undefined, width: undefined, height: undefined })
          }
          placeholder="https://… (o sube el archivo del logo)"
          aria-label={`Dirección del logo ${indice + 1}`}
          className={inputClass}
        />
        {/* Siempre los tres, aunque vayan vacíos: se emparejan por posición. */}
        <input type="hidden" name="cliente_logo_movil" value={conLogo ? (fila.logo.srcMovil ?? "") : ""} />
        <input type="hidden" name="cliente_logo_ancho" value={conLogo ? (fila.logo.width ?? "") : ""} />
        <input type="hidden" name="cliente_logo_alto" value={conLogo ? (fila.logo.height ?? "") : ""} />

        <input
          name="cliente_logo_alt"
          type="text"
          maxLength={200}
          required={conLogo}
          value={fila.logo.alt}
          onChange={(e) => cambiarLogo({ alt: e.target.value })}
          placeholder="Descripción del logo: «Logotipo de JGB» (obligatorio)"
          aria-label={`Descripción del logo ${indice + 1}`}
          className={inputClass}
        />

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            disabled={subiendo}
            className={`${botonSecundario} ${botonChico}`}
          >
            <IconoSubir className="h-3.5 w-3.5" />
            {subiendo ? "Subiendo…" : "Subir logo"}
          </button>
          <button
            type="button"
            onClick={() => onMover(-1)}
            disabled={indice === 0}
            aria-label={`Subir ${fila.nombre || `el cliente ${indice + 1}`} un puesto`}
            className={`${botonSecundario} ${botonChico} disabled:cursor-not-allowed disabled:opacity-40`}
          >
            <IconoChevronAbajo className="h-3.5 w-3.5 rotate-180" />
          </button>
          <button
            type="button"
            onClick={() => onMover(1)}
            disabled={indice === total - 1}
            aria-label={`Bajar ${fila.nombre || `el cliente ${indice + 1}`} un puesto`}
            className={`${botonSecundario} ${botonChico} disabled:cursor-not-allowed disabled:opacity-40`}
          >
            <IconoChevronAbajo className="h-3.5 w-3.5" />
          </button>
          <button type="button" onClick={onQuitar} className={botonPeligro}>
            <IconoPapelera className="h-3.5 w-3.5" />
            Quitar
          </button>
        </div>

        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) void manejarArchivo(file);
          }}
        />

        {enlaceNoPermitido && (
          <p className="rounded-control bg-azul-50 px-3 py-2 text-xs leading-relaxed text-azul-900">
            Este enlace no es del almacenamiento del sitio ni de Cloudinary: es
            probable que el logo no llegue a verse.
          </p>
        )}
        {error && (
          <p role="alert" className="text-xs leading-relaxed text-error-500">
            {error}
          </p>
        )}
      </div>
    </div>
  );
}
