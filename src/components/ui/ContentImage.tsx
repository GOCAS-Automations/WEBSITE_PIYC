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
 *  - `srcset` cuando la imagen trae su variante angosta (`srcMovil`, ~900 px):
 *    sin optimizador nadie redimensiona al vuelo, y un celular no tiene por
 *    qué bajar la foto de 1920 px de un fondo de cabecera.
 *
 * TRES FORMAS DE PINTAR
 * ---------------------
 *  - `ContentImage`: la pieza base (recuadro con proporción o imagen suelta).
 *  - `FotoDeFondo`: foto a sangre que cubre a su padre, bajo un velo
 *    (cabeceras de página). Es la LCP de las páginas internas.
 *  - `FotoDeColumna`: la foto de una sección de texto + foto. En escritorio se
 *    estira al alto de la columna de texto (empieza con el rótulo y termina con
 *    el último párrafo o botón); en móvil tiene proporción fija.
 */

import { esImagenOptimizable } from "@/lib/imagenes";
import type { ImagenContenido } from "@/lib/content-types";

type PropsContentImage = {
  src: string | null | undefined;
  alt: string;
  width?: number;
  height?: number;
  /** Variante angosta (~900 px) de la misma foto. Con ella se emite `srcset`. */
  srcMovil?: string;
  /** `sizes` del `srcset`. Solo cuenta si hay `srcMovil`. */
  sizes?: string;
  className?: string;
  /** true solo en la imagen más grande de la mitad superior (el LCP). */
  prioritaria?: boolean;
  /**
   * Carga inmediata SIN prioridad de red. Para las primeras diapositivas de un
   * carrusel: se quiere que estén listas al deslizar, pero no compiten con el
   * LCP de la página. `prioritaria` manda sobre esto.
   */
  anticipada?: boolean;
  /** Proporción del recuadro cuando la foto se recorta: `aspect-[4/3]`… */
  proporcion?: string;
  /** `cover` recorta para llenar; `contain` muestra la foto completa. */
  ajuste?: "cover" | "contain";
  /** Clases del contenedor cuando se usa `proporcion`. */
  claseContenedor?: string;
};

/** Proporción de respaldo cuando la imagen no trae medidas. */
const PROPORCION_POR_DEFECTO = 4 / 3;

/** Ancho de la variante angosta que genera el panel al subir. */
const ANCHO_MOVIL = 900;

/**
 * Atributos comunes del `<img>`: medidas (sin CLS), carga y `srcset`.
 *
 * El `srcset` solo se emite cuando la foto grande es realmente más ancha que
 * la variante: dos candidatos del mismo ancho no le dan al navegador nada que
 * elegir. Si la imagen no declara su ancho y trae `srcMovil`, se asume la de
 * 1920 px que prepara el panel (sin medida, el descriptor `w` no existe).
 */
function atributosDeImagen({
  src,
  width,
  height,
  srcMovil,
  sizes,
  prioritaria,
  anticipada,
}: {
  src: string;
  width?: number;
  height?: number;
  srcMovil?: string;
  sizes?: string;
  prioritaria: boolean;
  anticipada: boolean;
}) {
  // Sin medidas declaradas se asume 4:3 para reservar el espacio igual: lo que
  // no puede pasar es que el `<img>` salga sin `width`/`height` y desplace el
  // contenido al cargar.
  const anchoFinal = width ?? (srcMovil ? 1920 : 1200);
  const altoFinal = height ?? Math.round(anchoFinal / PROPORCION_POR_DEFECTO);
  const conVariante = Boolean(srcMovil) && anchoFinal > ANCHO_MOVIL;

  return {
    src,
    width: anchoFinal,
    height: altoFinal,
    srcSet: conVariante ? `${srcMovil} ${ANCHO_MOVIL}w, ${src} ${anchoFinal}w` : undefined,
    sizes: conVariante ? (sizes ?? "100vw") : undefined,
    loading: prioritaria || anticipada ? ("eager" as const) : ("lazy" as const),
    decoding: prioritaria ? ("sync" as const) : ("async" as const),
    fetchPriority: prioritaria ? ("high" as const) : undefined,
    // Marca de diagnóstico: en el panel sirve para avisar de hosts que la
    // CSP bloquearía. No cambia cómo se ve la imagen.
    "data-host-permitido": esImagenOptimizable(src) ? "si" : "no",
  };
}

export function ContentImage({
  src,
  alt,
  width,
  height,
  srcMovil,
  sizes,
  className = "",
  prioritaria = false,
  anticipada = false,
  proporcion,
  ajuste = "cover",
  claseContenedor = "",
}: PropsContentImage) {
  if (!src) return null;

  // Una foto VERTICAL metida en un recuadro apaisado se recorta por arriba y
  // por abajo, y con el recorte centrado lo primero que se pierde es la cabeza
  // de quien trabaja o el remate del tablero — justo el sujeto. Se sube el
  // punto de corte al 30 % del alto, que es donde cae el sujeto en las fotos de
  // obra de PIYC. Solo aplica al recorte (`cover`) dentro de un recuadro de
  // medida propia (`proporcion`): sin recuadro no hay recorte que corregir.
  const recorteAlto =
    ajuste === "cover" && proporcion && height && width && height >= width * 1.2
      ? "object-[center_30%]"
      : "";

  const clasesImagen = [
    ajuste === "cover" ? "object-cover" : "object-contain",
    proporcion ? "absolute inset-0 size-full" : "h-auto w-full",
    recorteAlto,
    className,
  ]
    .filter(Boolean)
    .join(" ");

  const imagen = (
    /* eslint-disable-next-line @next/next/no-img-element -- ver encabezado: el
       optimizador está apagado y `next/image` lanza con hosts no declarados. */
    <img
      alt={alt}
      className={clasesImagen}
      {...atributosDeImagen({ src, width, height, srcMovil, sizes, prioritaria, anticipada })}
    />
  );

  if (!proporcion) return imagen;

  return (
    <div className={`relative overflow-hidden ${proporcion} ${claseContenedor}`}>{imagen}</div>
  );
}

/**
 * Foto a sangre que cubre a su padre (que tiene que ser `relative`). Es el
 * fondo de las cabeceras: va siempre bajo un velo y, en las páginas internas,
 * es la imagen LCP — por eso es un `<img>` real y no un `background-image`
 * (el navegador no descubre un fondo CSS hasta tener la hoja de estilos, y no
 * se le puede dar prioridad ni `srcset`).
 *
 * `desenfocar` suaviza las capturas de pantalla (HMI de los casos): son de
 * ~1229 px y a sangre se les notaría el píxel; con el velo y un desenfoque
 * leve se leen como textura. Se escala un poco para que el borde desenfocado
 * no deje un halo claro en los lados.
 */
export function FotoDeFondo({
  imagen,
  prioritaria = false,
  desenfocar = false,
  className = "",
}: {
  imagen: ImagenContenido;
  prioritaria?: boolean;
  desenfocar?: boolean;
  className?: string;
}) {
  const recorte =
    imagen.width && imagen.height && imagen.height >= imagen.width * 1.2
      ? "object-[center_35%]"
      : "object-center";

  return (
    /* eslint-disable-next-line @next/next/no-img-element -- ver encabezado. */
    <img
      alt={imagen.alt}
      className={`absolute inset-0 size-full object-cover ${recorte} ${
        desenfocar ? "scale-110 blur-[3px]" : ""
      } ${className}`}
      {...atributosDeImagen({
        src: imagen.src,
        width: imagen.width,
        height: imagen.height,
        srcMovil: imagen.srcMovil,
        sizes: "100vw",
        prioritaria,
        anticipada: false,
      })}
    />
  );
}

/**
 * Foto de una sección de texto + foto.
 *
 * ALINEACIÓN CON LA COLUMNA DE TEXTO
 * ----------------------------------
 * Va como hijo DIRECTO de una rejilla (`lg:grid-cols-12`) con el
 * `align-items: stretch` por defecto: la celda toma el alto de la fila, que lo
 * pone la columna de texto, y la foto (absoluta, `object-cover`) lo llena. Así
 * su borde superior queda a la altura del rótulo y el inferior a la del último
 * párrafo o botón. `altoMinimo` evita una foto enana si el texto es muy corto.
 *
 * En móvil y tableta la rejilla es de una columna: ahí manda `proporcionMovil`.
 * Sin marco blanco ni pie de foto: el `alt` sigue describiéndola para quien no
 * la ve, y el marco desplazaba el borde de la foto 8 px respecto al texto.
 */
export function FotoDeColumna({
  imagen,
  prioritaria = false,
  proporcionMovil = "aspect-[4/3] sm:aspect-[16/10]",
  altoMinimo = "lg:min-h-[22rem]",
  ajuste = "cover",
  className = "",
  claseMarco = "bg-acero-100",
}: {
  imagen: ImagenContenido;
  prioritaria?: boolean;
  proporcionMovil?: string;
  altoMinimo?: string;
  ajuste?: "cover" | "contain";
  /** Clases de la celda: columnas de la rejilla, orden… */
  className?: string;
  /** Fondo del recuadro (se ve en `contain` o mientras carga la foto). */
  claseMarco?: string;
}) {
  return (
    <ContentImage
      src={imagen.src}
      alt={imagen.alt}
      width={imagen.width}
      height={imagen.height}
      srcMovil={imagen.srcMovil}
      sizes="(min-width: 1024px) 42vw, 100vw"
      prioritaria={prioritaria}
      ajuste={ajuste}
      proporcion={`${proporcionMovil} lg:aspect-auto lg:h-full ${altoMinimo}`}
      claseContenedor={`rounded-panel shadow-elevada ring-1 ring-separador ${claseMarco} ${className}`}
    />
  );
}
