"use client";

import { useRef, useState } from "react";
import { esImagenOptimizable } from "@/lib/imagenes";
import { subirImagenAlBucket, pesoLegible } from "./subir-imagen";
import { inputClass } from "./ui-base";
import { IconoFoto, IconoSubir } from "./iconos";
import type { CarpetaImagen } from "@/lib/admin-types";

/**
 * AYUDA DE IMÁGENES — el texto que más falta hace en el panel.
 * Vive aquí y no en `ui.tsx` porque este archivo es de cliente (regla 1).
 */
export const AYUDA_IMAGEN =
  "Sube la foto desde tu computador: el panel la convierte sola a WebP, la reduce a 1920 píxeles de ancho y la deja por debajo de 400 KB antes de guardarla, que es lo que necesita el sitio para cargar rápido. También puedes pegar la dirección de una imagen que ya esté publicada en internet.";

/**
 * CAMPO DE IMAGEN
 * ===============
 * Dos caminos, los dos válidos: subir el archivo al bucket `site-images` (a la
 * carpeta que indique `folder`) o pegar la URL de una imagen ya publicada.
 *
 * El `alt` va JUNTO a la imagen, no en otra parte del formulario: separar la
 * foto de su descripción es la forma segura de que la descripción no se
 * escriba nunca.
 *
 * La vista previa es un `<img>` a secas **a propósito**: acepta cualquier URL
 * sin pasar por el optimizador de Next, así que una dirección rara se ve rota
 * en el recuadro pero no tumba la pantalla del panel (regla 14).
 */
export function CampoImagen({
  label,
  name,
  altName,
  defaultValue,
  defaultAlt,
  folder,
  hint,
  required,
  scope,
}: {
  label: string;
  /** `name` del campo con la URL. */
  name: string;
  /** `name` del campo con el texto alternativo. */
  altName: string;
  defaultValue?: string | null;
  defaultAlt?: string | null;
  folder: CarpetaImagen;
  hint?: string;
  required?: boolean;
  scope?: string;
}) {
  const [value, setValue] = useState(defaultValue ?? "");
  const [subiendo, setSubiendo] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [aviso, setAviso] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const idAlt = `imagen-alt-${scope ? `${scope}-` : ""}${altName}`;

  // Solo avisa de enlaces ya escritos del todo (`https://…`): mientras se
  // teclea o se pega a medias, cualquier cadena sería «no permitida» y el
  // aviso parpadearía en cada pulsación.
  const enlaceNoPermitido =
    /^https?:\/\/\S+$/i.test(value.trim()) && !esImagenOptimizable(value.trim());

  async function manejarArchivo(file: File) {
    setSubiendo(true);
    setError(null);
    setAviso(null);

    const resultado = await subirImagenAlBucket(file, folder);
    if ("error" in resultado) {
      setError(resultado.error);
    } else {
      setValue(resultado.url);
      if (resultado.comprimida) {
        setAviso(
          `Listo. La foto se convirtió a WebP y quedó en ${pesoLegible(resultado.pesoFinal)}.`,
        );
      }
    }

    setSubiendo(false);
    if (fileRef.current) fileRef.current.value = "";
  }

  return (
    <div>
      <span className="mb-1.5 block text-sm font-semibold text-azul-950">
        {label}
        {required && <span className="text-azul-700"> *</span>}
      </span>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-start">
        {/* Vista previa */}
        <div className="flex h-24 w-32 shrink-0 items-center justify-center overflow-hidden rounded-fino border border-acero-200 bg-acero-50">
          {value ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={value} alt="Vista previa" className="h-full w-full object-contain" />
          ) : (
            <IconoFoto className="h-7 w-7 text-acero-400" />
          )}
        </div>

        <div className="min-w-0 flex-1 space-y-2">
          <input
            name={name}
            type="text"
            required={required}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder="https://… (o sube un archivo)"
            aria-label={`Dirección de la imagen: ${label}`}
            className={inputClass}
          />

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              disabled={subiendo}
              className="inline-flex items-center gap-1.5 rounded-fino border border-acero-300 bg-blanco px-3.5 py-2 text-xs font-semibold text-acero-700 transition-colors hover:border-azul-700 hover:text-azul-700 disabled:opacity-60"
            >
              <IconoSubir className="h-4 w-4" />
              {subiendo ? "Subiendo…" : "Subir imagen"}
            </button>
            {value && (
              <button
                type="button"
                onClick={() => {
                  setValue("");
                  setAviso(null);
                  setError(null);
                }}
                className="text-xs font-semibold text-acero-600 transition-colors hover:text-error-500"
              >
                Quitar
              </button>
            )}
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

          {/* Texto alternativo: obligatorio en cuanto hay imagen. */}
          <div>
            <label
              htmlFor={idAlt}
              className="mb-1 block text-xs font-semibold text-azul-950"
            >
              Descripción de la imagen (texto alternativo)
              {value !== "" && <span className="text-azul-700"> *</span>}
            </label>
            <input
              id={idAlt}
              name={altName}
              type="text"
              maxLength={200}
              required={value !== ""}
              defaultValue={defaultAlt ?? ""}
              placeholder="Tablero de control ensamblado en el taller de PIYC"
              className={inputClass}
            />
            <p className="mt-1 text-xs leading-relaxed text-acero-600">
              Describe en pocas palabras lo que se ve. Lo leen en voz alta los
              programas de las personas con discapacidad visual y le sirve a
              Google para entender la foto.
            </p>
          </div>

          {hint && <p className="text-xs leading-relaxed text-acero-600">{hint}</p>}
          <p className="text-xs leading-relaxed text-acero-600">{AYUDA_IMAGEN}</p>

          {aviso && (
            <p className="rounded-fino border border-verde-300 bg-verde-100 px-2.5 py-2 text-xs leading-relaxed text-verde-700">
              {aviso}
            </p>
          )}

          {/*
            ENLACE DE UN HOST NO PERMITIDO
            ------------------------------
            El sitio solo puede mostrar imágenes de su propio almacenamiento y
            de Cloudinary (`src/lib/imagenes.ts`, la misma lista que
            `next.config.ts`). Con otro enlace la página no se rompe, pero la
            CSP bloquea la descarga y el visitante ve un hueco. Sin este aviso,
            quien edita guarda tranquilo y el problema aparece después, en el
            sitio publicado y sin explicación.

            No va en ámbar —esta paleta no tiene ámbar y el rojo es solo de
            error— sino en el azul de marca, que es lo que aquí significa
            «léeme antes de guardar».
          */}
          {enlaceNoPermitido && (
            <p className="rounded-fino border border-azul-300 bg-azul-50 px-2.5 py-2 text-xs leading-relaxed text-azul-900">
              Este enlace no es del almacenamiento del sitio ni de Cloudinary, así
              que lo más probable es que la imagen no llegue a verse. Sube el
              archivo con el botón de arriba, o publícala en Cloudinary
              (cloudinary.com, gratuito) y pega esa dirección.
            </p>
          )}
          {error && (
            <p
              role="alert"
              className="rounded-fino border border-error-300 bg-error-50 px-2.5 py-2 text-xs leading-relaxed text-error-700"
            >
              {error}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
