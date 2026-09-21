"use client";

import { useState } from "react";
import { botonChico, botonSecundario, inputClass } from "./ui-base";
import { IconoMas, IconoPapelera } from "./iconos";

/**
 * LISTA DE TEXTOS CORTOS
 * ======================
 * Los alcances de un servicio (`site_services.items`), los pasos del proceso de
 * la página de inicio… cualquier lista de frases sueltas.
 *
 * Viaja al servidor como un `name` repetido: la server action la recompone con
 * `lista()` de `src/lib/admin/formulario.ts`, que además descarta las vacías.
 * Nada de JSON escondido en un input: si el formulario se envía sin JavaScript,
 * lo que se guarda sigue siendo exactamente lo que se ve en pantalla.
 */
export function CampoLista({
  label,
  name,
  defaultValue,
  hint,
  placeholder = "Escribe un ítem",
  maxLength = 200,
  textoAgregar = "Agregar ítem",
}: {
  label: string;
  name: string;
  defaultValue?: string[];
  hint?: string;
  placeholder?: string;
  maxLength?: number;
  textoAgregar?: string;
}) {
  const [items, setItems] = useState<{ valor: string; key: number }[]>(() =>
    (defaultValue ?? []).map((valor, i) => ({ valor, key: i })),
  );
  const [siguiente, setSiguiente] = useState(
    () => (defaultValue?.length ?? 0) + 1,
  );

  function agregar() {
    setItems((prev) => [...prev, { valor: "", key: siguiente }]);
    setSiguiente((n) => n + 1);
  }

  return (
    <div>
      <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
        <span className="text-[15px] font-semibold text-azul-950">{label}</span>
        <button
          type="button"
          onClick={agregar}
          className={`${botonSecundario} ${botonChico}`}
        >
          <IconoMas className="h-3.5 w-3.5" />
          {textoAgregar}
        </button>
      </div>

      {hint && <p className="mb-3 text-xs leading-relaxed text-acero-600">{hint}</p>}

      {items.length === 0 ? (
        <p className="rounded-tarjeta bg-relleno px-4 py-6 text-center text-sm text-acero-600">
          Sin elementos. Una lista vacía se respeta: el sitio no pinta esa
          sección.
        </p>
      ) : (
        <ul className="space-y-2">
          {items.map((item, indice) => (
            <li key={item.key} className="flex items-center gap-2">
              <span
                aria-hidden="true"
                className="w-6 shrink-0 text-right font-mono text-xs text-acero-400"
              >
                {indice + 1}
              </span>
              <input
                name={name}
                type="text"
                maxLength={maxLength}
                value={item.valor}
                onChange={(e) =>
                  setItems((prev) =>
                    prev.map((it) =>
                      it.key === item.key ? { ...it, valor: e.target.value } : it,
                    ),
                  )
                }
                placeholder={placeholder}
                aria-label={`${label}, elemento ${indice + 1}`}
                className={inputClass}
              />
              <button
                type="button"
                onClick={() =>
                  setItems((prev) => prev.filter((it) => it.key !== item.key))
                }
                aria-label={`Quitar el elemento ${indice + 1}`}
                className="shrink-0 rounded-control bg-relleno p-2 text-acero-600 transition duration-200 ease-ios hover:bg-error-50 hover:text-error-500"
              >
                <IconoPapelera className="h-4 w-4" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
