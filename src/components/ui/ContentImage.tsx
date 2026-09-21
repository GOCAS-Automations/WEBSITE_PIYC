/**
 * ContentImage — LA ÚNICA FORMA DE PINTAR UNA IMAGEN DE CONTENIDO
 * ===============================================================
 * Regla 14 de AGENTS.md: toda foto que venga del contenido (bucket, panel o
 * respaldo estático) se pinta aquí. `next/image` queda reservado para el
 * *chrome* del sitio: logo del encabezado y del pie, favicon.
 *
 * POR QUÉ UN `<img>` Y NO `next/image`
 * ------------------------------------
 * El optimizador está apagado globalmente (`images.unoptimized: true`,
 * plan §9), así que `next/image` ya emite un `<img>` con la URL original: no
 * aporta nada y sí agrega un riesgo real — con una URL de un host que no esté
 * en `remotePatterns`, en desarrollo **lanza durante el render y tumba la
 * página entera**. Desde el panel se puede pegar cualquier URL. Una URL mal
 * pegada no puede tumbar una página.
 *
 * Lo que sí hay que sostener a mano es lo que `next/image` daba gratis:
 *  - `width`/`height` siempre → sin CLS.
 *  - `loading="lazy"` y `decoding="async"` salvo en el LCP (`prioritaria`).
 *  - `object-fit` estable cuando la foto no tiene la proporción del recuadro.
 *
 * LÍMITE DE LAS FOTOS ACTUALES
 * ----------------------------
 * Las del PPTX están incrustadas ya reducidas: la más grande mide 1229 px de
 * ancho (`docs/CONTENIDO.md` §2.4). **No estirarlas a pantalla completa**: van
 * en recuadros de tamaño acorde, dentro de marco, no como fondo del hero.
 */

import { esImagenOptimizable } from "@/lib/imagenes";

type PropsContentImage = {
  src: string | null | undefined;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  /** true solo en la imagen más grande de la mitad superior (el LCP). */
  prioritaria?: boolean;
  /** Proporción del recuadro cuando la foto se recorta: `aspect-[4/3]`… */
  proporcion?: string;
  /** `cover` recorta para llenar; `contain` muestra la foto completa. */
  ajuste?: "cover" | "contain";
  /** Clases del contenedor cuando se usa `proporcion`. */
  claseContenedor?: string;
};

/** Proporción de respaldo cuando la imagen no trae medidas. */
const PROPORCION_POR_DEFECTO = 4 / 3;

export function ContentImage({
  src,
  alt,
  width,
  height,
  className = "",
  prioritaria = false,
  proporcion,
  ajuste = "cover",
  claseContenedor = "",
}: PropsContentImage) {
  if (!src) return null;

  // Sin medidas declaradas se asume 4:3 para reservar el espacio igual: lo que
  // no puede pasar es que el `<img>` salga sin `width`/`height` y desplace el
  // contenido al cargar.
  const anchoFinal = width ?? 1200;
  const altoFinal = height ?? Math.round(anchoFinal / PROPORCION_POR_DEFECTO);

  const clasesImagen = [
    ajuste === "cover" ? "object-cover" : "object-contain",
    proporcion ? "absolute inset-0 size-full" : "h-auto w-full",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  const imagen = (
    /* eslint-disable-next-line @next/next/no-img-element -- ver encabezado: el
       optimizador está apagado y `next/image` lanza con hosts no declarados. */
    <img
      src={src}
      alt={alt}
      width={anchoFinal}
      height={altoFinal}
      loading={prioritaria ? "eager" : "lazy"}
      decoding={prioritaria ? "sync" : "async"}
      fetchPriority={prioritaria ? "high" : undefined}
      className={clasesImagen}
      // Marca de diagnóstico: en el panel sirve para avisar de hosts que la
      // CSP bloquearía. No cambia cómo se ve la imagen.
      data-host-permitido={esImagenOptimizable(src) ? "si" : "no"}
    />
  );

  if (!proporcion) return imagen;

  return (
    <div className={`relative overflow-hidden ${proporcion} ${claseContenedor}`}>{imagen}</div>
  );
}

/**
 * Foto dentro de una tarjeta iOS: esquinas continuas, sombra en capas y un
 * borde interior claro que despega la foto del lienzo. Es el tratamiento
 * estándar de las fotos del sitio — ninguna va suelta ni a sangre.
 *
 * (Antes este marco llevaba filete técnico y marcas de corte en las esquinas;
 * era justo lo que hacía ver antiguo el sitio, sistema v2.)
 */
export function FotoEnmarcada({
  src,
  alt,
  width,
  height,
  prioritaria = false,
  proporcion,
  pie,
  className = "",
}: PropsContentImage & { pie?: string }) {
  if (!src) return null;

  return (
    <figure className={`relative ${className}`}>
      <div className="overflow-hidden rounded-panel bg-blanco p-2 shadow-elevada">
        <ContentImage
          src={src}
          alt={alt}
          width={width}
          height={height}
          prioritaria={prioritaria}
          proporcion={proporcion}
          claseContenedor="rounded-tarjeta bg-acero-100"
        />
      </div>
      {pie ? (
        <figcaption className="mt-3 px-1 text-[13px] leading-snug text-acero-600">
          {pie}
        </figcaption>
      ) : null}
    </figure>
  );
}
