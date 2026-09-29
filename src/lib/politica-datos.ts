/**
 * POLÍTICA DE TRATAMIENTO DE DATOS — LECTURAS Y FORMATO
 * =====================================================
 * Módulo **puro** (sin React, sin `next/*`): lo usan la página pública, el
 * pie, el portal del equipo y el endpoint del formulario.
 *
 * DOS COSAS QUE RESUELVE
 * ----------------------
 * 1. **Los marcadores.** El texto de la política se edita desde el panel, y
 *    ahí no se escriben datos de contacto: se escriben marcadores que aquí se
 *    sustituyen con lo que haya en `site_settings.contact`. Si PIYC cambia de
 *    sede, de correo o de teléfono, la política cambia sola y nadie tiene que
 *    acordarse de editarla. Un marcador sin dato se borra junto con el espacio
 *    que lo precede, para no dejar un hueco raro en la frase.
 * 2. **El formato del cuerpo.** Línea en blanco = párrafo nuevo; una línea que
 *    empieza por «- » es una viñeta. Nada más, a propósito: quien edita la
 *    política no tiene por qué aprender Markdown, y un texto legal no necesita
 *    negritas ni tablas.
 *
 * LA VERSIÓN ACEPTADA
 * -------------------
 * `versionDePolitica()` es lo que se guarda junto a cada autorización del
 * formulario. La ley pide poder probar **qué** autorizó el titular, y para eso
 * hace falta saber qué texto estaba publicado ese día.
 */

import type { AjustesContact, PoliticaDatos, SeccionPolitica } from "@/lib/content-types";
import { correoPrincipal, direccionEnLinea, telefonoPrincipal } from "@/lib/contacto";

/* ===================================================================== */
/* Marcadores                                                             */
/* ===================================================================== */

/**
 * Los marcadores que entiende el cuerpo de la política. Esta lista es la que
 * se le explica a PIYC en `docs/ADMIN.md`: si se añade uno, se añade allí.
 */
export const MARCADORES_POLITICA = [
  "{razonSocial}",
  "{nombreComercial}",
  "{nit}",
  "{direccion}",
  "{ciudad}",
  "{correo}",
  "{telefono}",
  "{horario}",
  "{sitio}",
] as const;

/** Valor de cada marcador a partir de `site_settings.contact`. */
function valoresDeContacto(contacto: AjustesContact): Record<string, string> {
  const telefono = telefonoPrincipal(contacto);
  return {
    "{razonSocial}": contacto.legalName ?? "",
    "{nombreComercial}": contacto.companyName ?? "",
    "{nit}": contacto.nit ?? "",
    "{direccion}": direccionEnLinea(contacto),
    "{ciudad}": contacto.address?.city ?? "",
    "{correo}": correoPrincipal(contacto),
    "{telefono}": telefono?.label ?? "",
    "{horario}": contacto.horario?.label ?? "",
    "{sitio}": (contacto.siteUrl ?? "").replace(/^https?:\/\//, "").replace(/\/+$/, ""),
  };
}

/**
 * Sustituye los marcadores de un texto. Un marcador sin valor desaparece con
 * el espacio que lo precede: «en la línea {telefono}.» sin teléfono queda «en
 * la línea.», feo pero legible, y nunca «{telefono}» a la vista del público.
 */
export function resolverMarcadores(texto: string, contacto: AjustesContact): string {
  const valores = valoresDeContacto(contacto);
  return texto
    .replace(/ ?\{[a-zA-Z]+\}/g, (coincidencia) => {
      const clave = coincidencia.trim();
      if (!(clave in valores)) return coincidencia;
      const valor = valores[clave];
      if (!valor) return "";
      return coincidencia.startsWith(" ") ? ` ${valor}` : valor;
    })
    .replace(/[ \t]{2,}/g, " ");
}

/** Las secciones con los marcadores ya sustituidos y sin las que estén vacías. */
export function seccionesDePolitica(
  politica: PoliticaDatos | undefined,
  contacto: AjustesContact,
): SeccionPolitica[] {
  return (politica?.secciones ?? [])
    .filter((seccion) => seccion.titulo.trim() !== "" && seccion.cuerpo.trim() !== "")
    .map((seccion) => ({
      titulo: resolverMarcadores(seccion.titulo, contacto),
      cuerpo: resolverMarcadores(seccion.cuerpo, contacto),
    }));
}

/* ===================================================================== */
/* Formato del cuerpo                                                     */
/* ===================================================================== */

export type BloquePolitica =
  | { tipo: "parrafo"; texto: string }
  | { tipo: "lista"; items: string[] };

const VINETA = /^[-•]\s+/;

/**
 * Parte el cuerpo de una sección en párrafos y listas.
 *
 * Una línea que empieza por «- » es una viñeta; las demás son texto corrido, y
 * las líneas seguidas se unen con un espacio. **La lista no necesita una línea
 * en blanco delante**: quien edita escribe «…recogemos:» y debajo las viñetas,
 * que es como se escribe de forma natural, y el bloque se parte solo.
 */
export function bloquesDeCuerpo(cuerpo: string): BloquePolitica[] {
  return cuerpo
    .split(/\n\s*\n/)
    .map((bloque) => bloque.trim())
    .filter((bloque) => bloque !== "")
    .flatMap((bloque) => {
      const salida: BloquePolitica[] = [];
      let parrafo: string[] = [];
      let items: string[] = [];

      const cerrarParrafo = () => {
        if (parrafo.length > 0) salida.push({ tipo: "parrafo", texto: parrafo.join(" ") });
        parrafo = [];
      };
      const cerrarLista = () => {
        if (items.length > 0) salida.push({ tipo: "lista", items });
        items = [];
      };

      for (const cruda of bloque.split("\n")) {
        const linea = cruda.trim();
        if (linea === "") continue;
        if (VINETA.test(linea)) {
          cerrarParrafo();
          items.push(linea.replace(VINETA, ""));
        } else {
          cerrarLista();
          parrafo.push(linea);
        }
      }
      cerrarParrafo();
      cerrarLista();
      return salida;
    });
}

/* ===================================================================== */
/* Vigencia y versión                                                     */
/* ===================================================================== */

const MESES = [
  "enero",
  "febrero",
  "marzo",
  "abril",
  "mayo",
  "junio",
  "julio",
  "agosto",
  "septiembre",
  "octubre",
  "noviembre",
  "diciembre",
] as const;

/**
 * «29 de septiembre de 2026» a partir de `2026-09-29`. Se parte la cadena a
 * mano en vez de usar `new Date()`: una fecha ISO sin hora se interpreta en
 * UTC y en Colombia (UTC−5) se pintaría el día anterior.
 */
export function fechaEnLetras(iso: string | undefined): string {
  if (!iso) return "";
  const partes = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso.trim());
  if (!partes) return iso.trim();
  const [, anio, mes, dia] = partes;
  const indice = Number(mes) - 1;
  if (indice < 0 || indice > 11) return iso.trim();
  return `${Number(dia)} de ${MESES[indice]} de ${anio}`;
}

/**
 * LO QUE SE GUARDA JUNTO A CADA AUTORIZACIÓN.
 * La versión si la hay; si no, la fecha de vigencia, que identifica el texto
 * igual de bien. Cadena vacía = la política no tiene ni una ni otra, y
 * entonces no se guarda versión (la marca de tiempo sigue guardándose).
 */
export function versionDePolitica(politica: PoliticaDatos | undefined): string {
  const version = politica?.version?.trim();
  if (version) return version;
  return politica?.vigenteDesde?.trim() ?? "";
}

/* ===================================================================== */
/* Textos de la casilla del formulario                                    */
/* ===================================================================== */

/** Respaldo de la casilla si el panel deja los dos campos vacíos. */
export const CASILLA_POR_DEFECTO = {
  etiqueta: "Autorizo el tratamiento de mis datos personales conforme a la",
  enlace: "política de tratamiento de datos de PIYC",
} as const;

export function textosDeCasilla(politica: PoliticaDatos | undefined): {
  etiqueta: string;
  enlace: string;
} {
  return {
    etiqueta: politica?.etiquetaCasilla?.trim() || CASILLA_POR_DEFECTO.etiqueta,
    enlace: politica?.enlaceCasilla?.trim() || CASILLA_POR_DEFECTO.enlace,
  };
}
