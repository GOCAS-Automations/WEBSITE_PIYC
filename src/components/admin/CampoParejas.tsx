"use client";

import { useState } from "react";
import { inputClass } from "./ui-base";
import { IconoMas, IconoPapelera } from "./iconos";

/**
 * LISTA DE PAREJAS «TÍTULO + TEXTO»
 * =================================
 * Los pasos del proceso de la portada, los teléfonos con su dueño, los correos
 * con su persona… cualquier lista de dos campos por fila.
 *
 * Viaja al servidor como **dos `name` repetidos en paralelo** (`nameA` y
 * `nameB`); la server action los vuelve a emparejar con `paresDeListas()`, que
 * descarta las filas sin el primer campo. Nada de JSON escondido en un input:
 * lo que se guarda es exactamente lo que se ve en pantalla.
 */

type Par = { a: string; b: string };

export function CampoParejas({
  label,
  nameA,
  nameB,
  defaultValue,
  placeholderA,
  placeholderB,
  hint,
  textoAgregar = "Agregar",
  etiquetaA = "Título",
  etiquetaB = "Descripción",
  filasB = 2,
}: {
  label: string;
  nameA: string;
  nameB: string;
  defaultValue?: Par[];
  placeholderA?: string;
  placeholderB?: string;
  hint?: string;
  textoAgregar?: string;
  etiquetaA?: string;
  etiquetaB?: string;
  /** 1 = el segundo campo es un `<input>`; más = un `<textarea>`. */
  filasB?: number;
}) {
  const [filas, setFilas] = useState<(Par & { key: number })[]>(() =>
    (defaultValue ?? []).map((par, i) => ({ ...par, key: i })),
  );
  const [siguiente, setSiguiente] = useState(() => (defaultValue?.length ?? 0) + 1);

  function actualizar(key: number, cambio: Partial<Par>) {
    setFilas((prev) =>
      prev.map((fila) => (fila.key === key ? { ...fila, ...cambio } : fila)),
    );
  }

  return (
    <div>
      <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
        <span className="text-sm font-semibold text-azul-950">{label}</span>
        <button
          type="button"
          onClick={() => {
            setFilas((prev) => [...prev, { a: "", b: "", key: siguiente }]);
            setSiguiente((n) => n + 1);
          }}
          className="inline-flex items-center gap-1.5 rounded-fino border border-acero-300 bg-blanco px-3 py-1.5 text-xs font-semibold text-acero-700 transition-colors hover:border-azul-700 hover:text-azul-700"
        >
          <IconoMas className="h-3.5 w-3.5" />
          {textoAgregar}
        </button>
      </div>

      {hint && <p className="mb-3 text-xs leading-relaxed text-acero-600">{hint}</p>}

      {filas.length === 0 ? (
        <p className="rounded-fino border border-dashed border-acero-300 bg-acero-50 px-4 py-5 text-center text-sm text-acero-600">
          Sin elementos. Una lista vacía se respeta: el sitio no pinta esa parte.
        </p>
      ) : (
        <ul className="space-y-3">
          {filas.map((fila, indice) => (
            <li
              key={fila.key}
              className="rounded-fino border border-acero-200 bg-acero-50 p-3"
            >
              <div className="flex items-start gap-2">
                <span
                  aria-hidden="true"
                  className="mt-2.5 w-5 shrink-0 text-right font-mono text-xs text-acero-400"
                >
                  {indice + 1}
                </span>
                <div className="min-w-0 flex-1 space-y-2">
                  <input
                    name={nameA}
                    type="text"
                    value={fila.a}
                    onChange={(e) => actualizar(fila.key, { a: e.target.value })}
                    placeholder={placeholderA}
                    aria-label={`${etiquetaA} ${indice + 1}`}
                    className={inputClass}
                  />
                  {filasB > 1 ? (
                    <textarea
                      name={nameB}
                      rows={filasB}
                      value={fila.b}
                      onChange={(e) => actualizar(fila.key, { b: e.target.value })}
                      placeholder={placeholderB}
                      aria-label={`${etiquetaB} ${indice + 1}`}
                      className={`${inputClass} resize-y`}
                    />
                  ) : (
                    <input
                      name={nameB}
                      type="text"
                      value={fila.b}
                      onChange={(e) => actualizar(fila.key, { b: e.target.value })}
                      placeholder={placeholderB}
                      aria-label={`${etiquetaB} ${indice + 1}`}
                      className={inputClass}
                    />
                  )}
                </div>
                <button
                  type="button"
                  onClick={() =>
                    setFilas((prev) => prev.filter((f) => f.key !== fila.key))
                  }
                  aria-label={`Quitar el elemento ${indice + 1}`}
                  className="mt-0.5 shrink-0 rounded-fino border border-acero-300 bg-blanco p-2 text-acero-600 transition-colors hover:border-error-300 hover:text-error-500"
                >
                  <IconoPapelera className="h-4 w-4" />
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
