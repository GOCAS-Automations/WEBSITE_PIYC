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
 * DOS VERSIONES DE CADA FOTO
 * --------------------------
 * Sin optimizador tampoco hay quien sirva una foto más chica al celular: sin
 * ayuda, un teléfono descargaría los 1920 px del fondo de una cabecera. Por eso,
 * si la foto mide más de 900 px de ancho, se genera además una **variante de
 * 900 px** (≤ ~100 KB) que sube junto a la principal con el mismo nombre más
 * `-900`. Su URL vuelve como `urlMovil` y el formulario la guarda en
 * `srcMovil`, que el sitio usa en el `srcset`. Si la variante falla, la foto
 * principal queda igual de bien subida: el sitio sirve entonces solo `src`.
 *
 * También vuelven `width` y `height` reales de la principal: el sitio los usa
 * para reservar el espacio de la foto antes de que cargue (sin saltos).
 *
 * Quitar o cambiar una foto en el panel NO borra archivos del bucket, ni la
 * principal ni la variante: nunca se hizo, y una foto puede estar en uso en
 * otra pantalla. La limpieza de huérfanas es manual (`docs/CONTENIDO.md` §2).
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

/** Ancho de la variante para celular (`srcMovil`). */
const ANCHO_VARIANTE = 900;
/** Tope orientativo de la variante: a 900 px, una foto ronda 40–90 KB. */
const PESO_MAXIMO_VARIANTE = 100 * 1024;

/**
 * Un año: cada archivo lleva una marca de tiempo en el nombre y nunca se
 * reescribe (`upsert: false`), así que su contenido no cambia jamás. Con una
 * hora, el navegador volvía a pedir cada foto —y los fondos de 1920 px— una y
 * otra vez. Es el mismo valor que tienen las fotos subidas a mano al bucket.
 */
const CACHE_UN_ANO = "31536000";

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
  | {
      url: string;
      /** Variante de 900 px. Ausente si la foto ya era angosta o si no se pudo subir. */
      urlMovil?: string;
      /** Medidas reales de la principal. Ausentes si el navegador no pudo leer la foto. */
      width?: number;
      height?: number;
      pesoFinal: number;
      pesoMovil?: number;
      comprimida: boolean;
    }
  | { error: string };

/**
 * Lee el archivo a un bitmap sin pasar por el DOM (rápido y sin fugas).
 * `from-image` aplica la orientación EXIF, para que una foto de celular tomada
 * en vertical no quede acostada; si el navegador no conoce la opción, se lee
 * sin ella antes de rendirse.
 */
async function aBitmap(file: File): Promise<ImageBitmap | null> {
  try {
    return await createImageBitmap(file, { imageOrientation: "from-image" });
  } catch {
    try {
      return await createImageBitmap(file);
    } catch {
      return null;
    }
  }
}

/** Pinta `fuente` en un canvas nuevo de `ancho` × `alto`. */
function lienzo(
  fuente: CanvasImageSource,
  ancho: number,
  alto: number,
): HTMLCanvasElement | null {
  const canvas = document.createElement("canvas");
  canvas.width = ancho;
  canvas.height = alto;
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";
  ctx.drawImage(fuente, 0, 0, ancho, alto);
  return canvas;
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
 * Codifica el canvas a WebP bajando la calidad por pasos hasta entrar en
 * `tope`. El último intento se devuelve aunque no entre: quien llama decide si
 * avisa. `null` si el navegador no sabe codificar WebP (Safari devuelve un PNG
 * en su lugar, y subirlo disfrazado de WebP sería peor que no comprimir).
 */
async function aWebp(
  canvas: HTMLCanvasElement,
  calidades: readonly number[],
  tope: number,
): Promise<Blob | null> {
  let blob: Blob | null = null;
  for (const calidad of calidades) {
    blob = await canvasABlob(canvas, calidad);
    if (!blob || blob.type !== "image/webp") return null;
    if (blob.size <= tope) return blob;
  }
  return blob;
}

type Versiones = {
  principal: Blob;
  ancho: number;
  alto: number;
  /** Variante de 900 px, o `null` si la foto no pasa de 900 px o no se pudo. */
  movil: Blob | null;
};

/**
 * Genera la principal (≤ `ANCHO_MAXIMO_IMAGEN`, ≤ `PESO_MAXIMO_IMAGEN`) y la
 * variante de 900 px. La variante se pinta desde la principal ya reducida, no
 * desde el original: reducir por pasos deja la foto más limpia. Devuelve
 * `null` si el navegador no pudo procesar la imagen (entonces se sube el
 * original y el tope de peso se aplica tal cual).
 */
async function comprimir(file: File): Promise<Versiones | null> {
  const bitmap = await aBitmap(file);
  if (!bitmap) return null;

  try {
    const escala = Math.min(1, ANCHO_MAXIMO_IMAGEN / bitmap.width);
    const ancho = Math.max(1, Math.round(bitmap.width * escala));
    const alto = Math.max(1, Math.round(bitmap.height * escala));

    const grande = lienzo(bitmap, ancho, alto);
    if (!grande) return null;
    const principal = await aWebp(
      grande,
      [0.86, 0.78, 0.7, 0.6, 0.5],
      PESO_MAXIMO_IMAGEN,
    );
    if (!principal) return null;

    let movil: Blob | null = null;
    if (ancho > ANCHO_VARIANTE) {
      const altoMovil = Math.max(1, Math.round((alto * ANCHO_VARIANTE) / ancho));
      const chico = lienzo(grande, ANCHO_VARIANTE, altoMovil);
      if (chico) {
        movil = await aWebp(
          chico,
          [0.8, 0.74, 0.68, 0.62, 0.56],
          PESO_MAXIMO_VARIANTE,
        );
      }
    }

    return { principal, ancho, alto, movil };
  } finally {
    bitmap.close();
  }
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

  const versiones = await comprimir(file);
  const cuerpo: Blob = versiones?.principal ?? file;
  const tipo = versiones ? "image/webp" : file.type;

  if (!versiones && !(TIPOS_IMAGEN_ACEPTADOS as readonly string[]).includes(tipo)) {
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

  // La marca de tiempo evita pisar una foto anterior con el mismo nombre. La
  // variante comparte nombre y marca: así se reconocen como pareja en el bucket.
  const base = `${folder}/${Date.now()}-${nombreSeguro(file.name)}`;
  const extension = versiones ? "webp" : (file.name.split(".").pop() ?? "jpg");
  const bucket = supabase.storage.from(SITE_IMAGES_BUCKET);

  const { data, error } = await bucket.upload(`${base}.${extension}`, cuerpo, {
    cacheControl: CACHE_UN_ANO,
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

  // La variante sube DESPUÉS de la principal: si la principal falla no queda
  // una variante suelta en el bucket. Si falla la variante, no se avisa: la
  // foto ya está arriba y el sitio simplemente sirve la principal.
  let urlMovil: string | undefined;
  if (versiones?.movil) {
    const movil = await bucket.upload(`${base}-900.webp`, versiones.movil, {
      cacheControl: CACHE_UN_ANO,
      upsert: false,
      contentType: "image/webp",
    });
    if (!movil.error && movil.data) {
      urlMovil = bucket.getPublicUrl(movil.data.path).data.publicUrl;
    }
  }

  return {
    url: bucket.getPublicUrl(data.path).data.publicUrl,
    urlMovil,
    width: versiones?.ancho,
    height: versiones?.alto,
    pesoFinal: cuerpo.size,
    pesoMovil: urlMovil ? versiones?.movil?.size : undefined,
    comprimida: Boolean(versiones) && cuerpo.size < file.size,
  };
}
