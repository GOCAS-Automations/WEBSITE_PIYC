/**
 * IMÁGENES DE CONTENIDO — QUÉ URL PUEDE PASAR POR `next/image`
 * ===========================================================
 * Módulo puro (sin React, sin `next/*`): lo usan el componente `ContentImage` y
 * el panel (aviso en ámbar cuando se pega una URL de un host no permitido).
 *
 * EL PROBLEMA QUE RESUELVE
 * ------------------------
 * Desde el panel se puede **pegar la URL de cualquier imagen de internet**.
 * `next/image` solo acepta hosts declarados en `images.remotePatterns`
 * (`next.config.ts`); con uno que no esté en la lista, en desarrollo lanza
 * durante el render (la página entera se cae) y en producción la foto queda
 * rota. **Una URL mal pegada no puede tumbar una página.**
 *
 * LA REGLA
 * --------
 * Si la URL es de un host permitido, se trata como imagen del sitio. Si no, se
 * pinta `unoptimized` (un `<img>` normal, sin validación del loader). La foto
 * se ve si la CSP (`img-src`) permite ese host; si no, se ve el hueco. En los
 * dos casos **la página funciona**.
 *
 * Hoy el optimizador está apagado (`images.unoptimized: true`, plan §9: la
 * cuenta Hobby de Vercel ya agotó su cupo de transformaciones), pero la lista se
 * mantiene para el día en que se encienda y para el aviso del panel.
 *
 * En la base de datos nunca van rutas `/images/...`: todo va al bucket
 * `site-images` o a Cloudinary, los dos caminos permitidos de punta a punta.
 */

/** Rutas del propio sitio (`/logo.svg`…): siempre válidas para `next/image`. */
function esRutaLocal(src: string): boolean {
  return src.startsWith("/") && !src.startsWith("//");
}

/**
 * Hosts permitidos. Es LA MISMA LISTA que `images.remotePatterns` de
 * `next.config.ts` (y que `img-src` de la CSP), escrita dos veces:
 * **si se toca una, hay que tocar la otra.**
 *   { protocol: "https", hostname: "**.supabase.co", pathname: "/storage/v1/object/public/**" }
 *   { protocol: "https", hostname: "res.cloudinary.com", pathname: "/**" }
 */
export const HOSTS_IMAGEN_OPTIMIZABLES = [
  { host: /\.supabase\.co$/, ruta: "/storage/v1/object/public/" },
  { host: /^res\.cloudinary\.com$/, ruta: "/" },
] as const;

/**
 * ¿Puede esta URL pasar por `next/image` sin `unoptimized`?
 *
 * Ante la duda (URL vacía o que no se puede interpretar) devuelve `false`: es
 * el lado seguro, porque `unoptimized` nunca lanza.
 */
export function esImagenOptimizable(src: string | null | undefined): boolean {
  if (!src) return false;
  if (esRutaLocal(src)) return true;

  let url: URL;
  try {
    url = new URL(src);
  } catch {
    return false;
  }
  if (url.protocol !== "https:") return false;

  return HOSTS_IMAGEN_OPTIMIZABLES.some(
    ({ host, ruta }) => host.test(url.hostname) && url.pathname.startsWith(ruta),
  );
}

/* ===================================================================== */
/* Video de fondo del hero                                                */
/* ===================================================================== */

/**
 * Formatos que el sitio sirve como fondo del hero. Son los dos que reproducen
 * todos los navegadores actuales sin plugin ni transcodificación.
 */
export const EXTENSIONES_VIDEO = [".mp4", ".webm"] as const;

/**
 * ¿Puede el sitio reproducir este video de fondo?
 *
 * Mismos hosts que las imágenes (`media-src` de la CSP es la misma lista que
 * `img-src`) más la extensión: un enlace de YouTube o de Drive **no** sirve
 * aquí —son páginas, no archivos— y quedaría en un hueco negro. Lo usan la
 * server action del panel y el aviso del formulario, para que la regla se
 * escriba una sola vez.
 */
export function esVideoPermitido(src: string | null | undefined): boolean {
  if (!src) return false;
  const sinConsulta = src.split(/[?#]/)[0]?.toLowerCase() ?? "";
  const extensionValida = EXTENSIONES_VIDEO.some((ext) => sinConsulta.endsWith(ext));
  return extensionValida && esImagenOptimizable(src);
}
