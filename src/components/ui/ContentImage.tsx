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
 * Marco de plano: la foto dentro de un recuadro con filete y marcas de corte
 * en las esquinas. Es el tratamiento estándar de las fotos del sitio — ninguna
 * va suelta ni a sangre.
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
      <MarcasDeCorte />
      <div className="border border-acero-300 bg-blanco p-1.5">
        <ContentImage
          src={src}
          alt={alt}
          width={width}
          height={height}
          prioritaria={prioritaria}
          proporcion={proporcion}
          claseContenedor="bg-acero-100"
        />
      </div>
      {pie ? (
        <figcaption className="mt-2.5 border-l-2 border-acero-300 pl-3 text-[13px] leading-snug text-acero-600">
          {pie}
        </figcaption>
      ) : null}
    </figure>
  );
}

/** Marcas de corte en las esquinas, como en un plano impreso. */
export function MarcasDeCorte({ className = "" }: { className?: string }) {
  const comun = `pointer-events-none absolute size-3.5 border-acero-400 ${className}`;
  return (
    <>
      <span aria-hidden="true" className={`${comun} -left-1.5 -top-1.5 border-l-2 border-t-2`} />
      <span aria-hidden="true" className={`${comun} -right-1.5 -top-1.5 border-r-2 border-t-2`} />
      <span aria-hidden="true" className={`${comun} -bottom-1.5 -left-1.5 border-b-2 border-l-2`} />
      <span aria-hidden="true" className={`${comun} -bottom-1.5 -right-1.5 border-b-2 border-r-2`} />
    </>
  );
}
