/**
 * CAPA DE CONTENIDO DEL SITIO PÚBLICO
 * ===================================
 * Única puerta por la que las páginas leen contenido. Lee de Supabase y
 * **cae al respaldo estático de `src/data/*`** cuando faltan las variables de
 * entorno o la consulta falla: el sitio público nunca queda en blanco por un
 * problema de base de datos (plan §7).
 *
 * DOS REGLAS QUE SE APLICAN EN TODO EL ARCHIVO
 * --------------------------------------------
 * 1. **`undefined` ≠ vacío.** Si la base no trae la clave (columna ausente,
 *    ajuste sin sembrar, consulta caída) → respaldo estático. Si la base trae
 *    la clave con valor vacío (`""`, `[]`) → es una decisión del panel y se
 *    respeta: la sección simplemente no se pinta.
 * 2. **Nunca lanza.** Cualquier error se registra y devuelve el respaldo. Una
 *    página pública no puede romperse por la base de datos.
 *
 * ESTÁTICO + ISR
 * --------------
 * Usa el cliente ANÓNIMO sin cookies (`getPublicSupabase`), para que las
 * páginas sigan siendo estáticas: tocar `cookies()` forzaría render dinámico y
 * mataría el ISR. La revalidación la declara cada página (`revalidate = 300`).
 *
 * `cache()` de React deduplica las lecturas dentro de un mismo render: una
 * página que pide servicios tres veces hace una sola consulta.
 */

import { cache } from "react";
import { getPublicSupabase } from "@/lib/supabase/server";
import { slugify } from "@/lib/slug";
import type {
  AjustesContact,
  AjustesHome,
  AjustesNosotros,
  AjustesPaginas,
  AjustesPorClave,
  AjustesSeo,
  BloqueImagenes,
  ClaveAjustes,
  ImagenContenido,
  LineaServicio,
  Proyecto,
  Servicio,
  Valor,
  VideoContenido,
} from "@/lib/content-types";
import { lineasDeServicio, serviciosEstaticos } from "@/data/servicios";
import { valoresEstaticos } from "@/data/valores";
import { proyectosEstaticos } from "@/data/proyectos";
import {
  contactEstatico,
  homeEstatico,
  nosotrosEstatico,
  paginasEstatico,
  seoEstatico,
} from "@/data/ajustes";

/* ===================================================================== */
/* Utilidades de normalización                                            */
/* ===================================================================== */

/** Registra el problema una sola vez y sigue con el respaldo. */
function avisar(donde: string, error: unknown): void {
  // Visible en el log del build y del servidor.
  console.warn(`[content] ${donde}: se usa el respaldo estático.`, error);
}

function textoODefecto(valor: unknown, defecto = ""): string {
  return typeof valor === "string" ? valor : defecto;
}

function esObjeto(valor: unknown): valor is Record<string, unknown> {
  return typeof valor === "object" && valor !== null && !Array.isArray(valor);
}

/** `items` de `site_services`: solo cadenas no vacías. */
function normalizarItems(valor: unknown): string[] {
  if (!Array.isArray(valor)) return [];
  return valor
    .map((item) => (typeof item === "string" ? item.trim() : ""))
    .filter((item) => item.length > 0);
}

function normalizarImagen(valor: unknown): ImagenContenido | null {
  if (!esObjeto(valor)) return null;
  const src = textoODefecto(valor.src).trim();
  if (!src) return null;
  const srcMovil = textoODefecto(valor.srcMovil).trim();
  return {
    src,
    alt: textoODefecto(valor.alt),
    width: typeof valor.width === "number" ? valor.width : undefined,
    height: typeof valor.height === "number" ? valor.height : undefined,
    // Variante de ~900 px para `srcset` (la genera el panel al subir).
    ...(srcMovil ? { srcMovil } : {}),
  };
}

/** Bloque `images` de servicios y proyectos. */
function normalizarImagenes(valor: unknown): BloqueImagenes {
  if (!esObjeto(valor)) return {};
  const cover = textoODefecto(valor.cover).trim();
  const galeriaCruda = Array.isArray(valor.gallery) ? valor.gallery : [];
  const gallery = galeriaCruda
    .map(normalizarImagen)
    .filter((imagen): imagen is ImagenContenido => imagen !== null);

  return {
    ...(cover ? { cover } : {}),
    ...(typeof valor.coverAlt === "string" ? { coverAlt: valor.coverAlt } : {}),
    ...(Array.isArray(valor.gallery) ? { gallery } : {}),
  };
}

function normalizarVideo(valor: unknown): VideoContenido | null {
  if (!esObjeto(valor)) return null;
  const url = textoODefecto(valor.url).trim();
  if (!url) return null;
  if (valor.visible === false) return null;
  return {
    url,
    titulo: textoODefecto(valor.titulo) || undefined,
    descripcion: textoODefecto(valor.descripcion) || undefined,
    visible: true,
  };
}

/** Parte un texto en párrafos: línea en blanco = párrafo nuevo. */
export function enParrafos(texto: string | null | undefined): string[] {
  if (!texto) return [];
  return texto
    .split(/\n\s*\n/)
    .map((parrafo) => parrafo.trim())
    .filter((parrafo) => parrafo.length > 0);
}

/** Galería completa: la portada primero, si no está ya dentro. */
export function galeriaCompleta(images: BloqueImagenes): ImagenContenido[] {
  const galeria = images.gallery ?? [];
  if (!images.cover) return galeria;
  if (galeria.some((imagen) => imagen.src === images.cover)) return galeria;
  return [{ src: images.cover, alt: images.coverAlt ?? "" }, ...galeria];
}

/* ===================================================================== */
/* Servicios                                                              */
/* ===================================================================== */

type FilaServicio = {
  id: string;
  slug: string;
  title: string;
  nav_title: string | null;
  icon_key: string | null;
  summary: string | null;
  description: string | null;
  items: unknown;
  images: unknown;
  video: unknown;
  meta_title: string | null;
  meta_description: string | null;
  sort: number;
  published: boolean;
  updated_at: string | null;
};

function normalizarServicio(fila: FilaServicio): Servicio {
  const title = textoODefecto(fila.title);
  return {
    id: fila.id,
    slug: fila.slug || slugify(title),
    title,
    navTitle: textoODefecto(fila.nav_title) || title,
    iconKey: fila.icon_key,
    summary: textoODefecto(fila.summary),
    description: textoODefecto(fila.description),
    items: normalizarItems(fila.items),
    images: normalizarImagenes(fila.images),
    video: normalizarVideo(fila.video),
    metaTitle: fila.meta_title,
    metaDescription: fila.meta_description,
    sort: typeof fila.sort === "number" ? fila.sort : 0,
    published: fila.published !== false,
    updatedAt: textoODefecto(fila.updated_at) || null,
  };
}

/** Los servicios publicados, ordenados. Respaldo: `src/data/servicios.ts`. */
export const getServicios = cache(async (): Promise<Servicio[]> => {
  const supabase = getPublicSupabase();
  if (!supabase) return serviciosEstaticos;

  try {
    const { data, error } = await supabase
      .from("site_services")
      .select(
        "id, slug, title, nav_title, icon_key, summary, description, items, images, video, meta_title, meta_description, sort, published, updated_at",
      )
      .eq("published", true)
      .order("sort", { ascending: true });

    if (error) throw error;
    // Tabla vacía = migración sembrada a medias, no una decisión del panel.
    if (!data || data.length === 0) return serviciosEstaticos;

    return (data as FilaServicio[]).map(normalizarServicio);
  } catch (error) {
    avisar("getServicios", error);
    return serviciosEstaticos;
  }
});

export const getServicio = cache(async (slug: string): Promise<Servicio | null> => {
  const servicios = await getServicios();
  return servicios.find((servicio) => servicio.slug === slug) ?? null;
});

/** Servicios en el orden de una lista de slugs, ignorando los que no existan. */
export async function getServiciosPorSlug(slugs: readonly string[]): Promise<Servicio[]> {
  const servicios = await getServicios();
  const porSlug = new Map(servicios.map((servicio) => [servicio.slug, servicio]));
  return slugs
    .map((slug) => porSlug.get(slug))
    .filter((servicio): servicio is Servicio => servicio !== undefined);
}

/* ===================================================================== */
/* Proyectos                                                              */
/* ===================================================================== */

type FilaProyecto = {
  id: string;
  slug: string;
  title: string;
  client: string | null;
  description: string | null;
  body: string | null;
  images: unknown;
  sort: number;
  published: boolean;
  updated_at: string | null;
};

function normalizarProyecto(fila: FilaProyecto): Proyecto {
  const title = textoODefecto(fila.title);
  return {
    id: fila.id,
    slug: fila.slug || slugify(title),
    title,
    client: fila.client,
    description: textoODefecto(fila.description),
    body: textoODefecto(fila.body),
    images: normalizarImagenes(fila.images),
    sort: typeof fila.sort === "number" ? fila.sort : 0,
    published: fila.published !== false,
    updatedAt: textoODefecto(fila.updated_at) || null,
  };
}

/** Respaldo estático de proyectos, ya con la forma de `Proyecto`. */
function proyectosDeRespaldo(): Proyecto[] {
  return proyectosEstaticos.map((proyecto) => ({
    id: null,
    slug: proyecto.slug,
    title: proyecto.title,
    client: proyecto.client,
    description: proyecto.description,
    body: proyecto.body,
    images: proyecto.images,
    sort: proyecto.sort,
    published: proyecto.published,
    updatedAt: null,
  }));
}

export const getProyectos = cache(async (): Promise<Proyecto[]> => {
  const supabase = getPublicSupabase();
  if (!supabase) return proyectosDeRespaldo();

  try {
    const { data, error } = await supabase
      .from("site_projects")
      .select("id, slug, title, client, description, body, images, sort, published, updated_at")
      .eq("published", true)
      .order("sort", { ascending: true });

    if (error) throw error;
    if (!data || data.length === 0) return proyectosDeRespaldo();

    return (data as FilaProyecto[]).map(normalizarProyecto);
  } catch (error) {
    avisar("getProyectos", error);
    return proyectosDeRespaldo();
  }
});

export const getProyecto = cache(async (slug: string): Promise<Proyecto | null> => {
  const proyectos = await getProyectos();
  return proyectos.find((proyecto) => proyecto.slug === slug) ?? null;
});

/**
 * Proyectos relacionados con un servicio.
 *
 * `site_projects` **no tiene columna de servicios** (`docs/CONTENIDO.md` §7):
 * la relación vive en el campo `servicios` del respaldo estático y se cruza por
 * slug con lo que devuelva la base. Si algún día se agrega la columna, este es
 * el único lugar que hay que cambiar.
 */
export async function getProyectosDeServicio(slugServicio: string): Promise<Proyecto[]> {
  const slugsRelacionados = new Set(
    proyectosEstaticos
      .filter((proyecto) => proyecto.servicios.includes(slugServicio))
      .map((proyecto) => proyecto.slug),
  );
  if (slugsRelacionados.size === 0) return [];

  const proyectos = await getProyectos();
  return proyectos.filter((proyecto) => slugsRelacionados.has(proyecto.slug));
}

/** Anterior y siguiente dentro del listado, para navegar entre casos. */
export async function getVecinosDeProyecto(
  slug: string,
): Promise<{ anterior: Proyecto | null; siguiente: Proyecto | null }> {
  const proyectos = await getProyectos();
  const indice = proyectos.findIndex((proyecto) => proyecto.slug === slug);
  if (indice === -1) return { anterior: null, siguiente: null };
  return {
    anterior: indice > 0 ? proyectos[indice - 1] : null,
    siguiente: indice < proyectos.length - 1 ? proyectos[indice + 1] : null,
  };
}

/* ===================================================================== */
/* Valores                                                                */
/* ===================================================================== */

type FilaValor = {
  id: string;
  title: string;
  description: string | null;
  icon_key: string | null;
  sort: number;
  published: boolean;
};

export const getValores = cache(async (): Promise<Valor[]> => {
  const supabase = getPublicSupabase();
  if (!supabase) return valoresEstaticos;

  try {
    const { data, error } = await supabase
      .from("site_values")
      .select("id, title, description, icon_key, sort, published")
      .eq("published", true)
      .order("sort", { ascending: true });

    if (error) throw error;
    if (!data || data.length === 0) return valoresEstaticos;

    return (data as FilaValor[]).map((fila) => ({
      id: fila.id,
      title: textoODefecto(fila.title),
      description: textoODefecto(fila.description),
      iconKey: fila.icon_key,
      sort: typeof fila.sort === "number" ? fila.sort : 0,
      published: fila.published !== false,
    }));
  } catch (error) {
    avisar("getValores", error);
    return valoresEstaticos;
  }
});

/* ===================================================================== */
/* Ajustes (`site_settings`)                                              */
/* ===================================================================== */

const RESPALDO_AJUSTES: AjustesPorClave = {
  home: homeEstatico,
  nosotros: nosotrosEstatico,
  paginas: paginasEstatico,
  contact: contactEstatico,
  seo: seoEstatico,
};

/**
 * Mezcla superficial respaldo ← base, clave por clave del primer nivel.
 *
 * Aplica la regla `undefined` ≠ vacío: la clave que la base no trae se toma
 * del respaldo; la que trae —aunque sea `""` o `[]`— gana, porque es una
 * decisión del panel. `null` también gana: es «bórralo».
 */
function mezclarAjustes<T extends object>(respaldo: T, deLaBase: unknown): T {
  if (!esObjeto(deLaBase)) return respaldo;

  const resultado: Record<string, unknown> = { ...(respaldo as Record<string, unknown>) };
  for (const [clave, valor] of Object.entries(deLaBase)) {
    if (valor === undefined) continue;
    resultado[clave] = valor;
  }
  return resultado as T;
}

/** Lee TODAS las claves públicas de `site_settings` en una sola consulta. */
const getTodosLosAjustes = cache(async (): Promise<AjustesPorClave> => {
  const supabase = getPublicSupabase();
  if (!supabase) return RESPALDO_AJUSTES;

  try {
    const { data, error } = await supabase
      .from("site_settings")
      .select("key, value")
      .in("key", ["home", "nosotros", "paginas", "contact", "seo"]);

    if (error) throw error;

    const porClave = new Map((data ?? []).map((fila) => [fila.key, fila.value]));

    return {
      home: mezclarAjustes(homeEstatico, porClave.get("home")),
      nosotros: mezclarAjustes(nosotrosEstatico, porClave.get("nosotros")),
      paginas: mezclarAjustes(paginasEstatico, porClave.get("paginas")),
      contact: mezclarAjustes(contactEstatico, porClave.get("contact")),
      seo: mezclarAjustes(seoEstatico, porClave.get("seo")),
    };
  } catch (error) {
    avisar("getAjustes", error);
    return RESPALDO_AJUSTES;
  }
});

/** El JSON de una clave de `site_settings`, ya mezclado con el respaldo. */
export async function getAjustes<K extends ClaveAjustes>(clave: K): Promise<AjustesPorClave[K]> {
  const ajustes = await getTodosLosAjustes();
  return ajustes[clave];
}

/** Atajos, para no repetir el genérico en cada página. */
export const getContacto = (): Promise<AjustesContact> => getAjustes("contact");
export const getHome = (): Promise<AjustesHome> => getAjustes("home");

/* ===================================================================== */
/* Líneas de servicio                                                     */
/* ===================================================================== */

/**
 * Frase de UNA línea de cada línea de servicio, para la franja bajo el hero
 * del inicio. Respaldo de `home.lineasServicio`: vive aquí y no en
 * `src/data/servicios.ts` porque es texto de presentación de la portada.
 *
 * ≤ 45 caracteres: la franja la pinta en una sola línea en escritorio y
 * tableta (las frases largas de `lineasDeServicio.resumen` se partían en dos
 * y se veían raras — Cesar, sep-2026). Mismo sentido que la frase larga.
 */
export const RESUMENES_CORTOS_DE_LINEA: Readonly<Record<string, string>> = {
  "automatizacion-y-control": "Procesos por receta, repetibles y con registro",
  "tableros-e-ingenieria-electrica": "Del plano al tablero montado y funcionando",
  "telemetria-y-telecontrol": "Operar a distancia sin perder protecciones",
  "refrigeracion-y-climatizacion": "Temperatura estable para producto y equipos",
};

/** Largo máximo de la frase corta. El panel lo usa como `maxLength`. */
export const LARGO_RESUMEN_CORTO = 48;

/**
 * Aplica los textos del panel (`home.lineasServicio`) a las líneas del
 * código. El JSON de la base no se da por bueno: se ignora lo que no tenga
 * forma de `{ id, titulo?, resumen? }`.
 *  - `titulo` vacío o ausente → el de fábrica (una línea necesita nombre).
 *  - `resumen` ausente → respaldo; presente y vacío → decisión del panel, la
 *    franja pinta solo el nombre.
 */
export function aplicarTextosDeLinea(
  lineas: readonly LineaServicio[],
  textos: unknown,
): LineaServicio[] {
  const porId = new Map<string, { titulo?: unknown; resumen?: unknown }>();
  if (Array.isArray(textos)) {
    for (const texto of textos) {
      if (esObjeto(texto) && typeof texto.id === "string") porId.set(texto.id, texto);
    }
  }

  return lineas.map((linea) => {
    const delPanel = porId.get(linea.id);
    const titulo = typeof delPanel?.titulo === "string" ? delPanel.titulo.trim() : "";
    const resumenCorto =
      typeof delPanel?.resumen === "string"
        ? delPanel.resumen.trim()
        : (RESUMENES_CORTOS_DE_LINEA[linea.id] ?? linea.resumen);
    return { ...linea, titulo: titulo || linea.titulo, resumenCorto };
  });
}

/** Las líneas de servicio con los textos del panel ya aplicados. */
export const getLineasDeServicio = cache(async (): Promise<LineaServicio[]> => {
  const home = await getHome();
  return aplicarTextosDeLinea(lineasDeServicio, home.lineasServicio);
});

/** Primera foto de un servicio (galería o portada), o `null` si no tiene. */
export function primeraFotoDe(images: BloqueImagenes): ImagenContenido | null {
  return galeriaCompleta(images)[0] ?? null;
}
export const getNosotros = (): Promise<AjustesNosotros> => getAjustes("nosotros");
export const getPaginas = (): Promise<AjustesPaginas> => getAjustes("paginas");
export const getSeo = (): Promise<AjustesSeo> => getAjustes("seo");
