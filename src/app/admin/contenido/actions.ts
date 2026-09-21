"use server";

/**
 * SERVER ACTIONS — CONTENIDO DEL SITIO
 * ====================================
 * Servicios, proyectos, valores y las cinco claves de `site_settings`
 * (`home`, `nosotros`, `paginas`, `contact`, `seo`).
 *
 * LO QUE HACE TODA ACCIÓN DE ESTE ARCHIVO, SIN EXCEPCIÓN
 * ------------------------------------------------------
 *  1. **Valida el rol en el servidor** (`getContentEditorOrNull`). Que el botón
 *     no se pinte no es una barrera: cualquiera puede llamar a la acción.
 *  2. **Valida la entrada** y devuelve un mensaje en español que dice qué pasó
 *     y qué hacer, no el error de Postgres.
 *  3. Escribe con el cliente de SESIÓN, nunca con la service-role: así la RLS
 *     (`private.is_content_editor()`) sigue siendo la última palabra.
 *  4. **`revalidatePath` de las rutas públicas afectadas** — si no, el cambio
 *     se guarda pero el sitio sigue sirviendo la versión de ISR hasta cinco
 *     minutos después.
 *  5. Devuelve un `ActionState` tipado. Nunca lanza: el formulario pinta el
 *     mensaje.
 *
 * `undefined` ≠ vacío (plan §7): un campo que se deja vacío se guarda como
 * vacío —es una decisión de quien edita y se respeta—, no se borra la clave
 * para que «vuelva el respaldo».
 */

import { revalidatePath } from "next/cache";
import { getContentEditorOrNull } from "@/lib/supabase/auth";
import { slugify } from "@/lib/slug";
import { youtubeId } from "@/lib/youtube";
import {
  bool,
  fail,
  int,
  lista,
  ok,
  paresDeListas,
  text,
  textOrNull,
  SIN_PERMISO,
} from "@/lib/admin/formulario";
import { LIMITES_CONTENIDO, type ActionState } from "@/lib/admin-types";
import type { Json } from "@/lib/supabase/database.types";
import type {
  AjustesContact,
  AjustesHome,
  AjustesNosotros,
  AjustesPaginas,
  AjustesSeo,
  BloqueImagenes,
  ImagenContenido,
  VideoContenido,
} from "@/lib/content-types";

/* ================================================================== */
/* Revalidación                                                        */
/* ================================================================== */

/**
 * Las páginas públicas son estáticas con ISR (`revalidate = 300`): sin esto,
 * un cambio guardado tarda hasta cinco minutos en verse. Se revalida de más a
 * propósito —es barato— antes que dejarse una ruta.
 */
function revalidarSitio(...rutas: string[]) {
  for (const ruta of rutas) revalidatePath(ruta);
}

function revalidarServicios() {
  revalidarSitio("/", "/servicios", "/contacto");
  // Las páginas de detalle son un segmento dinámico: se revalida el patrón.
  revalidatePath("/servicios/[slug]", "page");
  revalidatePath("/admin/contenido/servicios");
}

function revalidarProyectos() {
  revalidarSitio("/", "/proyectos");
  revalidatePath("/proyectos/[slug]", "page");
  revalidatePath("/admin/contenido/proyectos");
}

function revalidarValores() {
  revalidarSitio("/", "/nosotros");
  revalidatePath("/admin/contenido/valores");
}

/* ================================================================== */
/* Helpers comunes                                                     */
/* ================================================================== */

/** Traduce los errores de Postgres que quien edita PUEDE resolver. */
function mensajeDeError(error: { message?: string; code?: string }): string {
  const mensaje = error.message ?? "";
  if (error.code === "23505" || /duplicate key|already exists/i.test(mensaje)) {
    return "Ya existe otro elemento con esa dirección (slug). Cámbiala por una distinta y vuelve a guardar.";
  }
  if (/row-level security|not authorized|permission denied/i.test(mensaje)) {
    return "Tu cuenta no tiene permiso para guardar esto. Si crees que es un error, avisa al administrador.";
  }
  return "No se pudo guardar. Inténtalo de nuevo; si vuelve a fallar, copia este detalle y pásaselo a quien administra el sitio: " + mensaje;
}

/**
 * Bloque `images` tal como lo guarda la base: portada + galería. Se arma desde
 * los campos del formulario (`cover`, `cover_alt`, `gallery_src[]`,
 * `gallery_alt[]`).
 */
function bloqueImagenesDeFormulario(formData: FormData): BloqueImagenes {
  const bloque: BloqueImagenes = {};
  const cover = text(formData, "cover");
  if (cover !== "") {
    bloque.cover = cover;
    bloque.coverAlt = text(formData, "cover_alt");
  }
  const gallery: ImagenContenido[] = paresDeListas(
    formData,
    "gallery_src",
    "gallery_alt",
  ).map(({ a, b }) => ({ src: a, alt: b }));
  if (gallery.length > 0) bloque.gallery = gallery;
  return bloque;
}

/** Una imagen suelta (`{src, alt}`) o `undefined` si no se puso ninguna. */
function imagenDeFormulario(
  formData: FormData,
  campo: string,
  campoAlt: string,
): ImagenContenido | undefined {
  const src = text(formData, campo);
  if (src === "") return undefined;
  return { src, alt: text(formData, campoAlt) };
}

/** Slug propuesto desde el título si quien edita no escribió uno. */
function slugDeFormulario(formData: FormData, titulo: string): string {
  const escrito = text(formData, "slug");
  return slugify(escrito !== "" ? escrito : titulo).slice(
    0,
    LIMITES_CONTENIDO.slug,
  );
}

/* ================================================================== */
/* SERVICIOS                                                           */
/* ================================================================== */

/**
 * Crea o edita un servicio. Con `id` vacío, crea.
 *
 * El VIDEO se guarda como `null` cuando no hay URL, no como un objeto vacío:
 * la capa pública lee `null` como «este servicio no tiene video» y así no se
 * pinta un reproductor en blanco.
 */
export async function guardarServicio(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const session = await getContentEditorOrNull();
  if (!session) return SIN_PERMISO;

  const id = text(formData, "id");
  const title = text(formData, "title");
  if (title === "") return fail("El título del servicio es obligatorio.");

  const slug = slugDeFormulario(formData, title);
  if (slug === "")
    return fail(
      "No se pudo armar la dirección del servicio a partir del título. Escribe una a mano en el campo «Dirección».",
    );

  const urlVideo = text(formData, "video_url");
  let video: VideoContenido | null = null;
  if (urlVideo !== "") {
    if (youtubeId(urlVideo) === "")
      return fail(
        "El enlace del video no parece de YouTube. Copia la dirección desde la barra del navegador o desde el botón «Compartir» de YouTube (algo como https://youtu.be/…).",
      );
    video = {
      url: urlVideo,
      titulo: text(formData, "video_titulo"),
      descripcion: text(formData, "video_descripcion"),
      visible: bool(formData, "video_visible", false),
    };
  }

  const payload = {
    slug,
    title,
    nav_title: textOrNull(formData, "nav_title"),
    icon_key: textOrNull(formData, "icon_key"),
    summary: textOrNull(formData, "summary"),
    description: textOrNull(formData, "description"),
    items: lista(formData, "items"),
    images: bloqueImagenesDeFormulario(formData),
    video,
    meta_title: textOrNull(formData, "meta_title"),
    meta_description: textOrNull(formData, "meta_description"),
    sort: int(formData, "sort"),
    published: bool(formData, "published"),
  };

  const { error } = id
    ? await session.supabase.from("site_services").update(payload).eq("id", id)
    : await session.supabase.from("site_services").insert(payload);

  if (error) return fail(mensajeDeError(error));

  revalidarServicios();
  return ok(
    id
      ? "Servicio guardado. Los cambios se ven en el sitio en pocos minutos."
      : `Servicio «${title}» creado. Ya está en /servicios/${slug}.`,
  );
}

export async function eliminarServicio(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const session = await getContentEditorOrNull();
  if (!session) return SIN_PERMISO;

  const id = text(formData, "id");
  if (!id) return fail("Falta el identificador del servicio.");

  const { error } = await session.supabase.from("site_services").delete().eq("id", id);
  if (error) return fail(mensajeDeError(error));

  revalidarServicios();
  return ok("Servicio eliminado.");
}

/* ================================================================== */
/* PROYECTOS                                                           */
/* ================================================================== */

export async function guardarProyecto(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const session = await getContentEditorOrNull();
  if (!session) return SIN_PERMISO;

  const id = text(formData, "id");
  const title = text(formData, "title");
  if (title === "") return fail("El título del proyecto es obligatorio.");

  const slug = slugDeFormulario(formData, title);
  if (slug === "")
    return fail(
      "No se pudo armar la dirección del proyecto a partir del título. Escribe una a mano en el campo «Dirección».",
    );

  const payload = {
    slug,
    title,
    client: textOrNull(formData, "client"),
    description: textOrNull(formData, "description"),
    body: textOrNull(formData, "body"),
    images: bloqueImagenesDeFormulario(formData),
    sort: int(formData, "sort"),
    published: bool(formData, "published"),
  };

  const { error } = id
    ? await session.supabase.from("site_projects").update(payload).eq("id", id)
    : await session.supabase.from("site_projects").insert(payload);

  if (error) return fail(mensajeDeError(error));

  revalidarProyectos();
  return ok(
    id
      ? "Proyecto guardado. Los cambios se ven en el sitio en pocos minutos."
      : `Proyecto «${title}» creado. Ya está en /proyectos/${slug}.`,
  );
}

export async function eliminarProyecto(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const session = await getContentEditorOrNull();
  if (!session) return SIN_PERMISO;

  const id = text(formData, "id");
  if (!id) return fail("Falta el identificador del proyecto.");

  const { error } = await session.supabase.from("site_projects").delete().eq("id", id);
  if (error) return fail(mensajeDeError(error));

  revalidarProyectos();
  return ok("Proyecto eliminado.");
}

/* ================================================================== */
/* VALORES                                                             */
/* ================================================================== */

export async function guardarValor(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const session = await getContentEditorOrNull();
  if (!session) return SIN_PERMISO;

  const id = text(formData, "id");
  const title = text(formData, "title");
  if (title === "") return fail("El nombre del valor es obligatorio.");

  const payload = {
    title,
    description: textOrNull(formData, "description"),
    icon_key: textOrNull(formData, "icon_key"),
    sort: int(formData, "sort"),
    published: bool(formData, "published"),
  };

  const { error } = id
    ? await session.supabase.from("site_values").update(payload).eq("id", id)
    : await session.supabase.from("site_values").insert(payload);

  if (error) return fail(mensajeDeError(error));

  revalidarValores();
  return ok(id ? "Valor guardado." : `Valor «${title}» creado.`);
}

export async function eliminarValor(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const session = await getContentEditorOrNull();
  if (!session) return SIN_PERMISO;

  const id = text(formData, "id");
  if (!id) return fail("Falta el identificador del valor.");

  const { error } = await session.supabase.from("site_values").delete().eq("id", id);
  if (error) return fail(mensajeDeError(error));

  revalidarValores();
  return ok("Valor eliminado.");
}

/* ================================================================== */
/* AJUSTES (`site_settings`)                                           */
/* ================================================================== */

type ClaveEditable = "home" | "nosotros" | "paginas" | "contact" | "seo";

/**
 * Lee la clave, le aplica `mutar` al JSON y lo vuelve a escribir con `upsert`.
 *
 * SE GUARDA BLOQUE A BLOQUE, NO LA CLAVE ENTERA
 * ---------------------------------------------
 * Cada formulario del panel toca una parte del JSON (el hero de la portada, la
 * misión…). Si cada uno escribiera la clave completa, guardar el hero borraría
 * todo lo demás en cuanto dos personas editaran a la vez —o en cuanto se
 * añadiera un bloque nuevo que ese formulario no conoce—. Leer, fusionar y
 * escribir cuesta una consulta más y evita ese agujero.
 */
async function actualizarAjuste<T extends object>(
  clave: ClaveEditable,
  mutar: (actual: T) => T,
): Promise<ActionState> {
  const session = await getContentEditorOrNull();
  if (!session) return SIN_PERMISO;

  const { data } = await session.supabase
    .from("site_settings")
    .select("value")
    .eq("key", clave)
    .maybeSingle();

  const actual =
    data?.value && typeof data.value === "object" && !Array.isArray(data.value)
      ? (data.value as T)
      : ({} as T);

  const nuevo = mutar({ ...actual });

  const { error } = await session.supabase
    .from("site_settings")
    // El tipo generado de la columna es `Json`; los tipos de `content-types.ts`
    // son objetos planos serializables, así que el `cast` es seguro y evita
    // tener que duplicar cada forma como `Json`.
    .upsert({ key: clave, value: nuevo as unknown as Json }, { onConflict: "key" });

  if (error) return fail(mensajeDeError(error));
  return ok("Cambios guardados. Se ven en el sitio en pocos minutos.");
}

/* --- Inicio ------------------------------------------------------- */

export async function guardarInicioHero(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const estado = await actualizarAjuste<AjustesHome>("home", (home) => ({
    ...home,
    hero: {
      eyebrow: text(formData, "eyebrow"),
      title: text(formData, "title"),
      subtitle: text(formData, "subtitle"),
      ctaPrimario: {
        etiqueta: text(formData, "cta1_etiqueta"),
        href: text(formData, "cta1_href"),
      },
      ctaSecundario: {
        etiqueta: text(formData, "cta2_etiqueta"),
        href: text(formData, "cta2_href"),
      },
    },
  }));
  if (estado.status === "success") revalidarSitio("/");
  return estado;
}

export async function guardarInicioIntro(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const estado = await actualizarAjuste<AjustesHome>("home", (home) => ({
    ...home,
    intro: {
      eyebrow: text(formData, "eyebrow"),
      title: text(formData, "title"),
      body: text(formData, "body"),
      image: imagenDeFormulario(formData, "cover", "cover_alt"),
      ctaEtiqueta: text(formData, "cta_etiqueta"),
    },
  }));
  if (estado.status === "success") revalidarSitio("/");
  return estado;
}

/**
 * Encabezado de una de las dos franjas de listado de la portada (servicios y
 * casos de éxito): rótulo, título, párrafo de entrada y texto del enlace.
 *
 * La franja se llama por su clave en un campo oculto, validada contra la lista:
 * sin eso, un formulario manipulado escribiría cualquier clave del JSON.
 */
const FRANJAS_INICIO = ["seccionServicios", "seccionProyectos"] as const;
type FranjaInicio = (typeof FRANJAS_INICIO)[number];

export async function guardarInicioFranja(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const franja = text(formData, "franja") as FranjaInicio;
  if (!(FRANJAS_INICIO as readonly string[]).includes(franja))
    return fail("Esa franja de la portada no existe.");

  const estado = await actualizarAjuste<AjustesHome>("home", (home) => ({
    ...home,
    [franja]: {
      eyebrow: text(formData, "eyebrow"),
      title: text(formData, "title"),
      intro: text(formData, "intro"),
      ctaEtiqueta: text(formData, "cta_etiqueta"),
    },
  }));
  if (estado.status === "success") revalidarSitio("/");
  return estado;
}

/** Rótulo, título e introducción del bloque de valores **de la portada**. */
export async function guardarInicioValores(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const estado = await actualizarAjuste<AjustesHome>("home", (home) => ({
    ...home,
    seccionValores: {
      eyebrow: text(formData, "eyebrow"),
      title: text(formData, "title"),
      intro: text(formData, "intro"),
    },
  }));
  if (estado.status === "success") revalidarSitio("/");
  return estado;
}

export async function guardarInicioProceso(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const pasos = paresDeListas(formData, "paso_titulo", "paso_descripcion").map(
    ({ a, b }) => ({ titulo: a, descripcion: b }),
  );
  const estado = await actualizarAjuste<AjustesHome>("home", (home) => ({
    ...home,
    proceso: {
      eyebrow: text(formData, "eyebrow"),
      title: text(formData, "title"),
      intro: text(formData, "intro"),
      pasos,
    },
  }));
  if (estado.status === "success") revalidarSitio("/");
  return estado;
}

/**
 * Slugs destacados en la portada.
 *
 * Una lista VACÍA es una decisión válida («no quiero esa franja») y se respeta;
 * por eso se guarda el arreglo vacío en vez de borrar el campo, que haría
 * volver el respaldo estático (plan §7).
 */
export async function guardarInicioDestacados(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const estado = await actualizarAjuste<AjustesHome>("home", (home) => ({
    ...home,
    serviciosDestacados: lista(formData, "servicio"),
    proyectosDestacados: lista(formData, "proyecto"),
  }));
  if (estado.status === "success") revalidarSitio("/");
  return estado;
}

export async function guardarInicioCierre(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const estado = await actualizarAjuste<AjustesHome>("home", (home) => ({
    ...home,
    cta: {
      title: text(formData, "title"),
      body: text(formData, "body"),
      ctaPrimario: {
        etiqueta: text(formData, "cta1_etiqueta"),
        href: text(formData, "cta1_href"),
      },
      ctaSecundario: {
        etiqueta: text(formData, "cta2_etiqueta"),
        href: text(formData, "cta2_href"),
      },
      nota: {
        texto: text(formData, "nota_texto"),
        enlace: {
          etiqueta: text(formData, "nota_enlace_etiqueta"),
          href: text(formData, "nota_enlace_href"),
        },
        textoFinal: text(formData, "nota_texto_final"),
      },
    },
  }));
  if (estado.status === "success") revalidarSitio("/");
  return estado;
}

/* --- Nosotros ----------------------------------------------------- */

export async function guardarNosotrosHero(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const estado = await actualizarAjuste<AjustesNosotros>("nosotros", (n) => ({
    ...n,
    hero: {
      eyebrow: text(formData, "eyebrow"),
      title: text(formData, "title"),
      subtitle: text(formData, "subtitle"),
      image: imagenDeFormulario(formData, "cover", "cover_alt"),
    },
  }));
  if (estado.status === "success") revalidarSitio("/nosotros");
  return estado;
}

export async function guardarNosotrosQuienes(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const estado = await actualizarAjuste<AjustesNosotros>("nosotros", (n) => ({
    ...n,
    quienesSomos: {
      eyebrow: text(formData, "eyebrow"),
      title: text(formData, "title"),
      body: text(formData, "body"),
      image: imagenDeFormulario(formData, "cover", "cover_alt"),
    },
  }));
  if (estado.status === "success") revalidarSitio("/nosotros", "/");
  return estado;
}

/**
 * Misión y visión.
 *
 * ⚠ Se guardan **tal como los rotuló PIYC** (plan §4.3: los textos parecen
 * intercambiados, pero no se corrigen por cuenta propia). El panel edita cada
 * uno por su rótulo y el sitio los pinta con ese mismo rótulo.
 */
export async function guardarNosotrosMisionVision(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const estado = await actualizarAjuste<AjustesNosotros>("nosotros", (n) => ({
    ...n,
    mision: {
      title: text(formData, "mision_title"),
      body: text(formData, "mision_body"),
    },
    vision: {
      title: text(formData, "vision_title"),
      body: text(formData, "vision_body"),
    },
  }));
  if (estado.status === "success") revalidarSitio("/nosotros");
  return estado;
}

export async function guardarNosotrosValores(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const estado = await actualizarAjuste<AjustesNosotros>("nosotros", (n) => ({
    ...n,
    valores: {
      eyebrow: text(formData, "eyebrow"),
      title: text(formData, "title"),
      intro: text(formData, "intro"),
    },
  }));
  if (estado.status === "success") revalidarSitio("/nosotros", "/");
  return estado;
}

/** Franja de cierre de `/nosotros`. */
export async function guardarNosotrosCierre(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const estado = await actualizarAjuste<AjustesNosotros>("nosotros", (n) => ({
    ...n,
    cta: { title: text(formData, "title"), body: text(formData, "body") },
  }));
  if (estado.status === "success") revalidarSitio("/nosotros");
  return estado;
}

export async function guardarNosotrosGaleria(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const galeria: ImagenContenido[] = paresDeListas(
    formData,
    "gallery_src",
    "gallery_alt",
  ).map(({ a, b }) => ({ src: a, alt: b }));

  const estado = await actualizarAjuste<AjustesNosotros>("nosotros", (n) => ({
    ...n,
    galeria,
    bloqueGaleria: {
      eyebrow: text(formData, "galeria_eyebrow"),
      title: text(formData, "galeria_title"),
    },
  }));
  if (estado.status === "success") revalidarSitio("/nosotros");
  return estado;
}

/* --- Textos de las páginas internas -------------------------------- */

const PAGINAS_CON_CABECERA = ["servicios", "proyectos", "contacto"] as const;
type PaginaConCabecera = (typeof PAGINAS_CON_CABECERA)[number];

/**
 * Cabecera (rótulo, título, bajada, foto e introducción) de una página interna.
 * La página viaja en el campo oculto `pagina`, y se valida contra la lista: sin
 * eso, un formulario manipulado escribiría cualquier clave del JSON.
 */
export async function guardarCabeceraPagina(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const pagina = text(formData, "pagina") as PaginaConCabecera;
  if (!(PAGINAS_CON_CABECERA as readonly string[]).includes(pagina))
    return fail("Esa página no existe.");

  const estado = await actualizarAjuste<AjustesPaginas>("paginas", (p) => ({
    ...p,
    [pagina]: {
      ...(p[pagina] ?? {}),
      eyebrow: text(formData, "eyebrow"),
      title: text(formData, "title"),
      subtitle: text(formData, "subtitle"),
      intro: text(formData, "intro"),
      image: imagenDeFormulario(formData, "cover", "cover_alt"),
    },
  }));

  if (estado.status === "success") {
    revalidarSitio(`/${pagina}`);
  }
  return estado;
}

/**
 * Franja de cierre de `/servicios` o `/proyectos` (el título y el párrafo; los
 * dos botones son siempre los mismos y no se editan).
 */
const PAGINAS_CON_CIERRE = ["servicios", "proyectos"] as const;
type PaginaConCierre = (typeof PAGINAS_CON_CIERRE)[number];

export async function guardarCierrePagina(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const pagina = text(formData, "pagina") as PaginaConCierre;
  if (!(PAGINAS_CON_CIERRE as readonly string[]).includes(pagina))
    return fail("Esa página no existe.");

  const estado = await actualizarAjuste<AjustesPaginas>("paginas", (p) => ({
    ...p,
    [pagina]: {
      ...(p[pagina] ?? {}),
      cta: { title: text(formData, "title"), body: text(formData, "body") },
    },
  }));
  if (estado.status === "success") revalidarSitio(`/${pagina}`);
  return estado;
}

/** Los dos párrafos que acompañan al formulario de `/contacto`. */
export async function guardarTextosFormulario(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const estado = await actualizarAjuste<AjustesPaginas>("paginas", (p) => ({
    ...p,
    contacto: {
      ...(p.contacto ?? {}),
      introFormulario: text(formData, "intro_formulario"),
      notaFormulario: text(formData, "nota_formulario"),
    },
  }));
  if (estado.status === "success") revalidarSitio("/contacto");
  return estado;
}

/**
 * Preguntas frecuentes de `/servicios` o `/contacto`.
 *
 * Una lista vacía es una decisión válida («no quiero preguntas en esta
 * página») y se respeta: el bloque simplemente no se pinta, y tampoco se emite
 * el `FAQPage` en los datos estructurados.
 */
const PAGINAS_CON_FAQ = ["servicios", "contacto"] as const;
type PaginaConFaq = (typeof PAGINAS_CON_FAQ)[number];

export async function guardarFaqPagina(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const pagina = text(formData, "pagina") as PaginaConFaq;
  if (!(PAGINAS_CON_FAQ as readonly string[]).includes(pagina))
    return fail("Esa página no existe.");

  const faq = paresDeListas(formData, "pregunta", "respuesta").map(({ a, b }) => ({
    pregunta: a,
    respuesta: b,
  }));

  const estado = await actualizarAjuste<AjustesPaginas>("paginas", (p) => ({
    ...p,
    [pagina]: { ...(p[pagina] ?? {}), faq },
  }));
  if (estado.status === "success") revalidarSitio(`/${pagina}`);
  return estado;
}

/**
 * Textos que se repiten en TODAS las fichas de caso y de servicio. No son de
 * un caso concreto, por eso no están en su ficha sino aquí.
 */
export async function guardarPlantillasDeFicha(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const estado = await actualizarAjuste<AjustesPaginas>("paginas", (p) => ({
    ...p,
    proyectoDetalle: {
      notaServicios: text(formData, "nota_servicios"),
      cta: {
        title: text(formData, "proyecto_cta_title"),
        body: text(formData, "proyecto_cta_body"),
      },
    },
    servicioDetalle: { ctaTexto: text(formData, "servicio_cta_body") },
  }));
  if (estado.status === "success") {
    revalidatePath("/proyectos/[slug]", "page");
    revalidatePath("/servicios/[slug]", "page");
  }
  return estado;
}

export async function guardarPaginaNoEncontrada(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const estado = await actualizarAjuste<AjustesPaginas>("paginas", (p) => ({
    ...p,
    noEncontrada: {
      title: text(formData, "title"),
      body: text(formData, "body"),
    },
  }));
  if (estado.status === "success") revalidarSitio("/");
  return estado;
}

/* --- Contacto ------------------------------------------------------ */

/** Solo dígitos, como los quiere `wa.me` y `tel:`. */
function soloDigitos(valor: string): string {
  return valor.replace(/\D/g, "");
}

/**
 * Datos de contacto.
 *
 * REGLA 5 DE `AGENTS.md`: `whatsappFormulario` es **el destino del formulario
 * público**. Se edita aquí, en los ajustes, y el servidor lo lee SIEMPRE de
 * aquí — nunca del payload del formulario de contacto. Por eso este campo lleva
 * validación propia: un número vacío o con letras dejaría los leads sin destino.
 */
export async function guardarContacto(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const whatsappFormulario = soloDigitos(text(formData, "whatsapp_formulario"));
  if (whatsappFormulario.length < 10)
    return fail(
      "El WhatsApp que recibe los mensajes del formulario debe llevar el indicativo del país y tener al menos 10 dígitos (por ejemplo, 573217617958). Sin él, quien escriba desde el sitio no le llega a nadie.",
    );

  const primaryWhatsApp = soloDigitos(text(formData, "whatsapp_principal"));
  const telefonos = lista(formData, "telefono").map((label) => ({
    label,
    intl: soloDigitos(label),
  }));
  const whatsapps = paresDeListas(formData, "whatsapp_label", "whatsapp_persona").map(
    ({ a, b }) => ({
      label: a,
      intl: soloDigitos(a),
      person: b === "" ? null : b,
      principal: soloDigitos(a) === primaryWhatsApp,
    }),
  );
  const correos = paresDeListas(formData, "correo", "correo_persona").map(
    ({ a, b }) => ({ address: a, person: b === "" ? null : b }),
  );

  const calle = text(formData, "calle");
  const barrio = text(formData, "barrio");
  const ciudad = text(formData, "ciudad");
  const region = text(formData, "region");
  const completa = text(formData, "direccion_completa");

  const horarioTexto = text(formData, "horario");
  // `Mo-Fr 08:00-17:00, Sa 08:00-12:00` → ["Mo-Fr 08:00-17:00","Sa 08:00-12:00"].
  const horarioSchema = text(formData, "horario_schema")
    .split(",")
    .map((tramo) => tramo.trim())
    .filter(Boolean);
  const TRAMO_HORARIO = /^(Mo|Tu|We|Th|Fr|Sa|Su)(-(Mo|Tu|We|Th|Fr|Sa|Su))? ([01]\d|2[0-3]):[0-5]\d-([01]\d|2[0-3]):[0-5]\d$/;
  const tramoMalo = horarioSchema.find((tramo) => !TRAMO_HORARIO.test(tramo));
  if (tramoMalo !== undefined)
    return fail(
      `«${tramoMalo}» no es un tramo de horario válido para Google. Se escribe con los días en inglés abreviado y las horas de 24 h, por ejemplo «Mo-Fr 08:00-17:00». Varios tramos van separados por coma.`,
    );

  const estado = await actualizarAjuste<AjustesContact>("contact", (c) => {
    const nuevo: AjustesContact = {
      ...c,
      companyName: text(formData, "company_name") || c.companyName,
      legalName: text(formData, "legal_name") || c.legalName,
      nit: text(formData, "nit") || c.nit,
      tagline: text(formData, "tagline"),
      address: {
        street: calle,
        area: barrio,
        city: ciudad,
        region,
        country: "Colombia",
        full: completa !== "" ? completa : [calle, barrio, ciudad, region].filter(Boolean).join(", "),
      },
      phones: telefonos,
      whatsapp: whatsapps,
      primaryWhatsApp: primaryWhatsApp || whatsappFormulario,
      whatsappFormulario,
      emails: correos,
      social: {
        ...(c.social ?? {}),
        instagram: text(formData, "instagram"),
      },
      siteUrl: text(formData, "site_url") || c.siteUrl,
    };

    // `undefined` ≠ vacío (plan §7). En estos dos campos la diferencia importa
    // de verdad, porque el sitio público tiene un respaldo para cuando FALTAN:
    // sin `mapsQuery` usa la dirección completa, y sin `horario` no pinta
    // ninguno ni lo emite en el JSON-LD. Guardar `""` les quitaría ese respaldo
    // y dejaría un mapa vacío o un horario en blanco. Por eso, vacío = se borra
    // la clave.
    const mapsQuery = text(formData, "maps_query");
    if (mapsQuery !== "") nuevo.mapsQuery = mapsQuery;
    else delete nuevo.mapsQuery;

    // El horario visible y el que lee Google son el mismo dato escrito de dos
    // formas: se guardan y se borran juntos. Sin `label` no hay horario que
    // mostrar, así que la clave entera se va.
    if (horarioTexto !== "") {
      nuevo.horario = { label: horarioTexto };
      if (horarioSchema.length > 0) nuevo.horario.schema = horarioSchema;
    } else delete nuevo.horario;

    return nuevo;
  });

  if (estado.status === "success") {
    revalidarSitio("/", "/contacto", "/nosotros", "/servicios", "/proyectos");
    revalidatePath("/", "layout");
  }
  return estado;
}

/* --- SEO ----------------------------------------------------------- */

export async function guardarSeo(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const estado = await actualizarAjuste<AjustesSeo>("seo", (seo) => ({
    ...seo,
    defaultTitle: text(formData, "default_title"),
    titleTemplate: text(formData, "title_template"),
    defaultDescription: text(formData, "default_description"),
    ogImage: text(formData, "og_image"),
    keywords: lista(formData, "keyword"),
    googleSiteVerification: text(formData, "google_verification"),
    paginas: {
      ...(seo.paginas ?? {}),
      inicio: {
        title: text(formData, "inicio_title"),
        description: text(formData, "inicio_description"),
      },
      nosotros: {
        title: text(formData, "nosotros_title"),
        description: text(formData, "nosotros_description"),
      },
      servicios: {
        title: text(formData, "servicios_title"),
        description: text(formData, "servicios_description"),
      },
      proyectos: {
        title: text(formData, "proyectos_title"),
        description: text(formData, "proyectos_description"),
      },
      contacto: {
        title: text(formData, "contacto_title"),
        description: text(formData, "contacto_description"),
      },
    },
  }));

  if (estado.status === "success") {
    revalidarSitio("/", "/nosotros", "/servicios", "/proyectos", "/contacto");
    revalidatePath("/", "layout");
  }
  return estado;
}
