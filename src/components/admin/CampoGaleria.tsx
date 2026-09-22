"use client";

import { useRef, useState } from "react";
import { esImagenOptimizable } from "@/lib/imagenes";
import { subirImagenAlBucket } from "./subir-imagen";
import { botonChico, botonPeligro, botonSecundario, inputClass } from "./ui-base";
import { IconoFoto, IconoMas, IconoPapelera, IconoSubir } from "./iconos";
import type { CarpetaImagen } from "@/lib/admin-types";
import type { ImagenContenido } from "@/lib/content-types";

/**
 * GALERÍA DE UN SERVICIO O DE UN PROYECTO
 * =======================================
 * Una lista de filas `{ src, alt }` que viaja al servidor como **campos
 * repetidos en paralelo** (`gallery_src` y `gallery_alt`, más los ocultos
 * `gallery_movil`, `gallery_ancho` y `gallery_alto`): la server action los
 * vuelve a emparejar por posición. Es la forma más simple que sobrevive a un
 * formulario HTML sin JSON escondido en un input. Por eso cada fila pinta
 * SIEMPRE los cinco campos, aunque vayan vacíos: si faltara uno, las listas
 * se correrían y las medidas quedarían pegadas a la foto equivocada.
 *
 * Cada fila tiene su propia subida al bucket y su propio texto alternativo:
 * una foto sin descripción no se puede publicar, así que el campo está ahí
 * mismo y no en otra pantalla. La subida trae además la variante de 900 px
 * (`srcMovil`) y las medidas reales; ver `subir-imagen.ts`.
 */

type Fila = ImagenContenido & { key: number };

let contador = 0;
const nuevaFila = (imagen: Partial<ImagenContenido> = {}): Fila => ({
  src: imagen.src ?? "",
  alt: imagen.alt ?? "",
  srcMovil: imagen.srcMovil,
  width: imagen.width,
  height: imagen.height,
  key: contador++,
});

export function CampoGaleria({
  label,
  name = "gallery_src",
  altName = "gallery_alt",
  defaultValue,
  folder,
  hint,
}: {
  label: string;
  name?: string;
  altName?: string;
  defaultValue?: ImagenContenido[];
  folder: CarpetaImagen;
  hint?: string;
}) {
  const [filas, setFilas] = useState<Fila[]>(() =>
    (defaultValue ?? []).map((img) => nuevaFila(img)),
  );
  // `gallery_src` → `gallery`: raíz de los tres campos ocultos de cada fila.
  const raiz = name.replace(/_src$/, "");

  function actualizar(key: number, cambio: Partial<ImagenContenido>) {
    setFilas((prev) =>
      prev.map((fila) => (fila.key === key ? { ...fila, ...cambio } : fila)),
    );
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
          Agregar foto
        </button>
      </div>

      {hint && <p className="mb-3 text-xs leading-relaxed text-acero-600">{hint}</p>}

      {filas.length === 0 ? (
        <p className="rounded-tarjeta bg-relleno px-4 py-6 text-center text-sm text-acero-600">
          Sin fotos en la galería. Con «Agregar foto» se añade la primera; si la
          dejas vacía, el sitio simplemente no pinta la galería.
        </p>
      ) : (
        <ul className="space-y-3">
          {filas.map((fila, indice) => (
            <li
              key={fila.key}
              className="rounded-control bg-lienzo-alto p-3 ring-1 ring-separador"
            >
              <FilaGaleria
                indice={indice}
                fila={fila}
                name={name}
                altName={altName}
                raiz={raiz}
                folder={folder}
                onCambio={(cambio) => actualizar(fila.key, cambio)}
                onQuitar={() =>
                  setFilas((prev) => prev.filter((f) => f.key !== fila.key))
                }
              />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function FilaGaleria({
  indice,
  fila,
  name,
  altName,
  raiz,
  folder,
  onCambio,
  onQuitar,
}: {
  indice: number;
  fila: Fila;
  name: string;
  altName: string;
  raiz: string;
  folder: CarpetaImagen;
  onCambio: (cambio: Partial<ImagenContenido>) => void;
  onQuitar: () => void;
}) {
  const [subiendo, setSubiendo] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const enlaceNoPermitido =
    /^https?:\/\/\S+$/i.test(fila.src.trim()) && !esImagenOptimizable(fila.src.trim());
  const conFoto = fila.src.trim() !== "";

  async function manejarArchivo(file: File) {
    setSubiendo(true);
    setError(null);
    const resultado = await subirImagenAlBucket(file, folder);
    if ("error" in resultado) setError(resultado.error);
    else
      onCambio({
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
      <div className="flex h-20 w-28 shrink-0 items-center justify-center overflow-hidden rounded-control bg-blanco ring-1 ring-separador">
        {fila.src ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={fila.src}
            alt=""
            className="h-full w-full object-contain"
            onLoad={(e) => {
              // Medidas reales de lo que cargó: cubre la URL pegada a mano.
              const { naturalWidth: width, naturalHeight: height } = e.currentTarget;
              if (width > 0 && height > 0 && (width !== fila.width || height !== fila.height)) {
                onCambio({ width, height });
              }
            }}
          />
        ) : (
          <IconoFoto className="h-6 w-6 text-acero-400" />
        )}
      </div>

      <div className="min-w-0 flex-1 space-y-2">
        <input
          name={name}
          type="text"
          value={fila.src}
          // Otra URL es otra foto: la variante y las medidas de la anterior
          // ya no le corresponden.
          onChange={(e) =>
            onCambio({
              src: e.target.value,
              srcMovil: undefined,
              width: undefined,
              height: undefined,
            })
          }
          placeholder="https://… (o sube un archivo)"
          aria-label={`Dirección de la foto ${indice + 1}`}
          className={inputClass}
        />
        {/* Siempre los tres, aunque vayan vacíos: las listas se emparejan por posición. */}
        <input type="hidden" name={`${raiz}_movil`} value={conFoto ? (fila.srcMovil ?? "") : ""} />
        <input type="hidden" name={`${raiz}_ancho`} value={conFoto ? (fila.width ?? "") : ""} />
        <input type="hidden" name={`${raiz}_alto`} value={conFoto ? (fila.height ?? "") : ""} />
        <input
          name={altName}
          type="text"
          maxLength={200}
          required={fila.src.trim() !== ""}
          value={fila.alt}
          onChange={(e) => onCambio({ alt: e.target.value })}
          placeholder="Qué se ve en la foto (obligatorio)"
          aria-label={`Descripción de la foto ${indice + 1}`}
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
            {subiendo ? "Subiendo…" : "Subir"}
          </button>
          <button
            type="button"
            onClick={onQuitar}
            className={botonPeligro}
          >
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
            probable que la foto no llegue a verse.
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
