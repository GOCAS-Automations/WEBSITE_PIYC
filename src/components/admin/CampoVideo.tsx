"use client";

import { useState } from "react";
import { esVideoPermitido } from "@/lib/imagenes";
import { inputClass } from "./ui-base";

/**
 * CAMPO DE VIDEO DE FONDO
 * =======================
 * Una URL de archivo `.mp4` o `.webm`, nada más. **No sube el archivo**: los
 * videos pesan de más para el bucket de imágenes (`site-images` solo acepta
 * tipos de imagen), así que el archivo se sube por otra vía y aquí se pega su
 * dirección.
 *
 * El aviso es lo importante: el sitio solo puede reproducir archivos de su
 * propio almacenamiento o de Cloudinary (`src/lib/imagenes.ts`, la misma lista
 * que `media-src` de la CSP en `next.config.ts`). Un enlace de YouTube o de
 * Drive es una PÁGINA, no un archivo: el navegador no lo puede poner de fondo.
 * Sin este aviso, quien edita guarda tranquilo y el problema aparece después,
 * en el sitio publicado y sin explicación. La server action vuelve a validar
 * lo mismo antes de escribir: esto es solo para no perder el viaje.
 */
export function CampoVideo({
  label,
  name,
  defaultValue,
  hint,
  scope,
  className = "",
}: {
  label: string;
  name: string;
  defaultValue?: string | null;
  hint?: string;
  scope?: string;
  className?: string;
}) {
  const [value, setValue] = useState(defaultValue ?? "");
  const id = `campo-${scope ? `${scope}-` : ""}${name}`;
  const escrito = value.trim();

  // Solo avisa de enlaces ya escritos del todo: mientras se teclea, cualquier
  // cadena sería «no permitida» y el aviso parpadearía en cada pulsación.
  const noSirve = /^https?:\/\/\S+$/i.test(escrito) && !esVideoPermitido(escrito);

  return (
    <div className={`block ${className}`}>
      <label htmlFor={id} className="mb-2 block text-[13px] font-semibold text-acero-600">
        {label}
      </label>
      <input
        id={id}
        name={name}
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="https://….supabase.co/storage/v1/object/public/site-images/inicio/portada.mp4"
        className={inputClass}
      />
      {hint && <span className="mt-1 block text-xs leading-relaxed text-acero-600">{hint}</span>}
      {noSirve && (
        <p className="mt-2 rounded-control bg-azul-50 px-3 py-2 text-xs leading-relaxed text-azul-900">
          Esta dirección no va a funcionar. Tiene que ser un archivo terminado en{" "}
          <strong>.mp4</strong> o <strong>.webm</strong>, guardado en el almacenamiento
          del sitio o en Cloudinary. Un enlace de YouTube, Vimeo o Google Drive no sirve:
          son páginas web, no archivos de video.
        </p>
      )}
    </div>
  );
}
