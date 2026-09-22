"use client";

/**
 * GALERÍA CON VISOR AMPLIADO
 * ==========================
 * El visor se monta sobre `<dialog>` + `showModal()`, que resuelve de fábrica
 * tres cosas que a mano salen mal:
 *  - **Foco atrapado** dentro del diálogo mientras está abierto.
 *  - **Esc cierra** (evento `cancel`), sin escuchar `keydown` global.
 *  - El resto de la página queda inerte para lectores de pantalla.
 *
 * Lo que sí hay que poner a mano:
 *  - ← y → para moverse entre fotos, y Inicio/Fin para ir a los extremos.
 *  - Devolver el foco a la miniatura desde la que se abrió (`showModal` lo
 *    hace al cerrar solo si el elemento sigue en el DOM; se fuerza igual).
 *  - Clic en el fondo para cerrar, distinguiéndolo del clic en la imagen.
 *
 * Es Client Component porque necesita estado y foco. No importa nada de
 * `components/admin/*` (regla 1 de AGENTS.md).
 */

import { useCallback, useEffect, useId, useRef, useState } from "react";
import type { ImagenContenido } from "@/lib/content-types";
import { ContentImage } from "@/components/ui/ContentImage";
import { IconoCerrar, IconoFlecha } from "@/components/ui/iconos";
import { CarrilDeFotos } from "./CarrilDeFotos";

export function Galeria({
  imagenes,
  titulo = "Galería",
  columnas = 3,
  vista = "rejilla",
  anticipadas = 0,
  className = "",
}: {
  imagenes: readonly ImagenContenido[];
  titulo?: string;
  columnas?: 2 | 3 | 4;
  /**
   * `"rejilla"`: mosaico de miniaturas (el de siempre).
   * `"carrusel"`: carril horizontal con `scroll-snap`, flechas y contador.
   */
  vista?: "rejilla" | "carrusel";
  /** Diapositivas del carrusel que se cargan de entrada. Ver `CarrilDeFotos`. */
  anticipadas?: number;
  className?: string;
}) {
  const [abierta, setAbierta] = useState<number | null>(null);
  const dialogoRef = useRef<HTMLDialogElement>(null);
  const disparadorRef = useRef<HTMLButtonElement | null>(null);
  const idTitulo = useId();

  const cerrar = useCallback(() => {
    dialogoRef.current?.close();
  }, []);

  const mover = useCallback(
    (delta: number) => {
      setAbierta((actual) => {
        if (actual === null) return actual;
        const siguiente = (actual + delta + imagenes.length) % imagenes.length;
        return siguiente;
      });
    },
    [imagenes.length],
  );

  // Abrir/cerrar el <dialog> siguiendo el estado.
  useEffect(() => {
    const dialogo = dialogoRef.current;
    if (!dialogo) return;

    if (abierta !== null && !dialogo.open) {
      dialogo.showModal();
    } else if (abierta === null && dialogo.open) {
      dialogo.close();
    }
  }, [abierta]);

  // Esc y cierre nativo: sincronizar el estado y devolver el foco.
  useEffect(() => {
    const dialogo = dialogoRef.current;
    if (!dialogo) return;

    const alCerrar = () => {
      setAbierta(null);
      disparadorRef.current?.focus();
    };
    dialogo.addEventListener("close", alCerrar);
    return () => dialogo.removeEventListener("close", alCerrar);
  }, []);

  // Flechas, Inicio y Fin dentro del visor.
  useEffect(() => {
    if (abierta === null) return;

    const alPulsar = (evento: KeyboardEvent) => {
      if (evento.key === "ArrowRight") {
        evento.preventDefault();
        mover(1);
      } else if (evento.key === "ArrowLeft") {
        evento.preventDefault();
        mover(-1);
      } else if (evento.key === "Home") {
        evento.preventDefault();
        setAbierta(0);
      } else if (evento.key === "End") {
        evento.preventDefault();
        setAbierta(imagenes.length - 1);
      }
    };

    document.addEventListener("keydown", alPulsar);
    return () => document.removeEventListener("keydown", alPulsar);
  }, [abierta, mover, imagenes.length]);

  if (imagenes.length === 0) return null;

  // En móvil, dos columnas solo si el número de fotos es par: con impar, la
  // última quedaba sola en su fila, media rejilla vacía al lado.
  const movil = imagenes.length % 2 === 0 ? "grid-cols-2 " : "";
  const clasesColumnas = {
    2: "sm:grid-cols-2",
    3: `${movil}sm:grid-cols-3`,
    4: `${movil}sm:grid-cols-2 lg:grid-cols-4`,
  }[columnas];

  const actual = abierta !== null ? imagenes[abierta] : null;
  const hayVarias = imagenes.length > 1;

  const abrir = (indice: number, boton: HTMLButtonElement) => {
    disparadorRef.current = boton;
    setAbierta(indice);
  };

  return (
    <div className={className}>
      {vista === "carrusel" ? (
        <CarrilDeFotos
          imagenes={imagenes}
          titulo={titulo}
          alAbrir={abrir}
          anticipadas={anticipadas}
        />
      ) : (
        <ul className={`grid gap-3 ${clasesColumnas}`}>
          {imagenes.map((imagen, indice) => (
            <li key={`${imagen.src}-${indice}`}>
              <button
                type="button"
                onClick={(evento) => abrir(indice, evento.currentTarget)}
                // `relative`: contiene al `sr-only` de abajo, que es
                // `position:absolute` (ver la nota de `CarrilDeFotos`).
                className="pulsable group relative block w-full cursor-zoom-in rounded-tarjeta bg-blanco p-1.5 shadow-tarjeta hover:shadow-elevada"
              >
                <ContentImage
                  src={imagen.src}
                  alt={imagen.alt}
                  width={imagen.width}
                  height={imagen.height}
                  srcMovil={imagen.srcMovil}
                  sizes="(min-width: 640px) 34vw, 50vw"
                  proporcion="aspect-[4/3]"
                  claseContenedor="rounded-chip bg-acero-100"
                />
                <span className="sr-only">Ampliar: {imagen.alt || `imagen ${indice + 1}`}</span>
              </button>
            </li>
          ))}
        </ul>
      )}

      <dialog
        ref={dialogoRef}
        aria-labelledby={idTitulo}
        className="material-oscuro sobre-oscuro m-0 h-dvh max-h-none w-screen max-w-none p-0 text-blanco backdrop:bg-azul-950/70 backdrop:backdrop-blur-material"
        onClick={(evento) => {
          // Cierra solo si el clic fue en el fondo del diálogo, no en su contenido.
          if (evento.target === dialogoRef.current) cerrar();
        }}
      >
        <div className="flex h-dvh flex-col">
          <div className="flex items-center justify-between gap-4 border-b border-separador-claro px-4 py-3 lg:px-6">
            <p id={idTitulo} className="text-[17px] font-semibold">
              {titulo}
              {hayVarias && abierta !== null ? (
                <span className="ml-3 text-sm font-medium tabular-nums text-acero-300">
                  {abierta + 1} / {imagenes.length}
                </span>
              ) : null}
            </p>
            <button
              type="button"
              onClick={cerrar}
              className="pulsable inline-flex size-10 items-center justify-center rounded-capsula bg-relleno-claro text-acero-200 hover:bg-azul-800 hover:text-blanco"
            >
              <IconoCerrar className="size-5" />
              <span className="sr-only">Cerrar el visor</span>
            </button>
          </div>

          <div className="flex min-h-0 flex-1 items-center justify-center p-4 lg:p-8">
            {actual ? (
              <ContentImage
                src={actual.src}
                alt={actual.alt}
                width={actual.width}
                height={actual.height}
                ajuste="contain"
                prioritaria
                className="max-h-full w-auto max-w-full rounded-tarjeta object-contain shadow-elevada"
              />
            ) : null}
          </div>

          {actual?.alt ? (
            <p className="border-t border-separador-claro px-4 py-3 text-center text-[13px] leading-snug text-acero-300 lg:px-6">
              {actual.alt}
            </p>
          ) : null}

          {hayVarias ? (
            <div className="flex items-center justify-between gap-4 border-t border-separador-claro px-4 py-3 lg:px-6">
              {/* Los dos botones van a los extremos, pero son un grupo: mismo
                  alto y mismo ancho mínimo para que se lean parejos. */}
              <button
                type="button"
                onClick={() => mover(-1)}
                className="pulsable inline-flex h-11 min-w-[8.5rem] items-center justify-center gap-2 rounded-capsula bg-relleno-claro px-5 text-sm font-semibold text-acero-200 hover:bg-azul-800 hover:text-blanco"
              >
                <IconoFlecha className="size-4 rotate-180" />
                Anterior
              </button>
              <button
                type="button"
                onClick={() => mover(1)}
                className="pulsable inline-flex h-11 min-w-[8.5rem] items-center justify-center gap-2 rounded-capsula bg-relleno-claro px-5 text-sm font-semibold text-acero-200 hover:bg-azul-800 hover:text-blanco"
              >
                Siguiente
                <IconoFlecha className="size-4" />
              </button>
            </div>
          ) : null}
        </div>
      </dialog>
    </div>
  );
}
