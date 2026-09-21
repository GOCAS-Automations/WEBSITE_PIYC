"use client";

/**
 * SUBIDA DE IMÁGENES AL BUCKET `site-images`
 * ==========================================
 * Lo usan los dos campos que aceptan foto (`CampoImagen` y `CampoGaleria`),
 * para que las dos suban IGUAL: misma carpeta, mismo saneado de nombre, misma
 * compresión y misma URL pública devuelta.
 *
 * SE COMPRIME EN EL NAVEGADOR, NO SE RECHAZA Y YA
 * -----------------------------------------------
 * El optimizador de Next está apagado (`images.unoptimized`, plan §9: la cuenta
 * Hobby de Vercel agotó su cupo de transformaciones), así que **lo que se sube
 * es exactamente lo que descarga el visitante**: no hay red de seguridad. La
 * regla 14 pide WebP, ≤ 1920 px de ancho y ≤ 400 KB.
 *
 * Decirle a quien edita «tu foto pesa 4 MB, comprímela» es mandarlo a buscar un
 * programa que no tiene. Aquí la foto se redimensiona y se convierte a WebP con
 * un `<canvas>` ANTES de subir, bajando la calidad por pasos hasta que entra en
 * el tope. Solo si ni al mínimo entra (fotos enormes con muchísimo detalle) se
 * devuelve un mensaje que explica exactamente qué hacer.
 *
 * Las carpetas son las cinco del bucket (`inicio/`, `nosotros/`, `servicios/`,
 * `proyectos/`, `cabeceras/`) y las fija cada pantalla con la prop `folder`:
 * mantenerlas ordenadas es lo que permite que PIYC reconozca sus propias fotos
 * cuando entre al almacenamiento.
 */

import { getBrowserSupabase } from "@/lib/supabase/client";
import { SITE_IMAGES_BUCKET } from "@/lib/supabase/config";
import {
  ANCHO_MAXIMO_IMAGEN,
  PESO_MAXIMO_IMAGEN,
  TIPOS_IMAGEN_ACEPTADOS,
} from "@/lib/admin-types";

/** Nombre de archivo apto para una URL: sin tildes, sin espacios, corto. */
export function nombreSeguro(nombre: string): string {
  return nombre
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/\.[^.]+$/, "") // se le pone .webp al final
    .replace(/[^a-zA-Z0-9._-]/g, "-")
    .toLowerCase()
    .slice(-50)
    .replace(/^-+|-+$/g, "") || "imagen";
}

/** Peso legible: «1,8 MB». */
export function pesoLegible(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1).replace(".", ",")} MB`;
}

export type ResultadoSubida =
  | { url: string; pesoFinal: number; comprimida: boolean }
  | { error: string };

/** Lee el archivo a un bitmap sin pasar por el DOM (rápido y sin fugas). */
async function aBitmap(file: File): Promise<ImageBitmap | null> {
  try {
    return await createImageBitmap(file);
  } catch {
    return null;
  }
}

function canvasABlob(
  canvas: HTMLCanvasElement,
  calidad: number,
): Promise<Blob | null> {
  return new Promise((resolve) => {
    canvas.toBlob((blob) => resolve(blob), "image/webp", calidad);
  });
}

/**
 * Redimensiona a `ANCHO_MAXIMO_IMAGEN` como mucho y convierte a WebP bajando la
 * calidad por pasos hasta entrar en `PESO_MAXIMO_IMAGEN`. Devuelve `null` si el
 * navegador no pudo procesar la imagen (entonces se sube el original y el tope
 * de peso se aplica tal cual).
 */
async function comprimir(file: File): Promise<Blob | null> {
  const bitmap = await aBitmap(file);
  if (!bitmap) return null;

  const escala = Math.min(1, ANCHO_MAXIMO_IMAGEN / bitmap.width);
  const ancho = Math.max(1, Math.round(bitmap.width * escala));
  const alto = Math.max(1, Math.round(bitmap.height * escala));

  const canvas = document.createElement("canvas");
  canvas.width = ancho;
  canvas.height = alto;
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    bitmap.close();
    return null;
  }
  ctx.drawImage(bitmap, 0, 0, ancho, alto);
  bitmap.close();

  for (const calidad of [0.86, 0.78, 0.7, 0.6, 0.5]) {
    const blob = await canvasABlob(canvas, calidad);
    if (!blob) return null;
    if (blob.size <= PESO_MAXIMO_IMAGEN) return blob;
    // El último intento se devuelve igual: quien llama decide si avisa.
    if (calidad === 0.5) return blob;
  }
  return null;
}

export async function subirImagenAlBucket(
  file: File,
  folder: string,
): Promise<ResultadoSubida> {
  const supabase = getBrowserSupabase();
  if (!supabase) {
    return {
      error:
        "El panel no está conectado a la base de datos, así que no se puede subir la imagen. Avisa a quien administra el sitio.",
    };
  }

  if (!file.type.startsWith("image/")) {
    return {
      error:
        "Ese archivo no es una imagen. Sube un JPG, un PNG o un WebP (los PDF y los documentos no sirven como foto).",
    };
  }

  const comprimida = await comprimir(file);
  const cuerpo: Blob = comprimida ?? file;
  const tipo = comprimida ? "image/webp" : file.type;

  if (!comprimida && !(TIPOS_IMAGEN_ACEPTADOS as readonly string[]).includes(tipo)) {
    return {
      error:
        "Ese formato de imagen no se admite. Guárdala como JPG, PNG o WebP y vuelve a intentarlo.",
    };
  }

  if (cuerpo.size > PESO_MAXIMO_IMAGEN) {
    return {
      error: `La imagen pesa ${pesoLegible(
        cuerpo.size,
      )} y el máximo son ${pesoLegible(
        PESO_MAXIMO_IMAGEN,
      )}. Ya se comprimió todo lo que se podía sin que se vea mal. Recórtala o redúcela a 1920 píxeles de ancho antes de subirla (en squoosh.app, gratis y sin instalar nada: abre la foto, elige WebP y baja la calidad hasta que el peso quede por debajo del tope).`,
    };
  }

  // La marca de tiempo evita pisar una foto anterior con el mismo nombre.
  const extension = comprimida ? "webp" : (file.name.split(".").pop() ?? "jpg");
  const path = `${folder}/${Date.now()}-${nombreSeguro(file.name)}.${extension}`;

  const { data, error } = await supabase.storage
    .from(SITE_IMAGES_BUCKET)
    .upload(path, cuerpo, {
      cacheControl: "3600",
      upsert: false,
      contentType: tipo,
    });

  if (error || !data) {
    const mensaje = error?.message ?? "";
    if (/row-level security|not authorized|403/i.test(mensaje)) {
      return {
        error:
          "Tu cuenta no tiene permiso para subir imágenes. Solo el administrador y el coordinador pueden hacerlo.",
      };
    }
    return { error: mensaje || "No se pudo subir la imagen. Inténtalo otra vez." };
  }

  const {
    data: { publicUrl },
  } = supabase.storage.from(SITE_IMAGES_BUCKET).getPublicUrl(data.path);

  return {
    url: publicUrl,
    pesoFinal: cuerpo.size,
    comprimida: Boolean(comprimida) && cuerpo.size < file.size,
  };
}
