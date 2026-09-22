/**
 * CONTRATO DE DATOS DEL CONTENIDO DEL SITIO
 * =========================================
 * Este archivo es la **fuente de verdad compartida** entre el sitio público
 * (`src/lib/content.ts`, `src/app/(sitio)/**`) y el panel (`/admin`). Define:
 *
 *  1. La forma normalizada de `site_services`, `site_projects` y `site_values`.
 *  2. La forma exacta del JSON de cada clave de `site_settings`
 *     (`home`, `nosotros`, `paginas`, `contact`, `seo`).
 *
 * REGLAS
 * ------
 * - Módulo **puro**: sin React, sin `next/*`, sin `"use client"`. Lo importan
 *   tanto Server Components como los formularios del panel (regla 4 de
 *   AGENTS.md: un valor exportado desde un módulo `"use client"` no se puede
 *   leer en el servidor).
 * - `undefined` ≠ vacío (plan §7). Un campo opcional que llega `undefined`
 *   significa «la base no lo trae» → respaldo estático. Un campo presente y
 *   vacío (`""`, `[]`) es una **decisión del panel** y se respeta.
 * - `contact` ya tiene semilla en la base (`0001_contenido.sql` §6): esta forma
 *   la describe, no la cambia. El destino del formulario sale SIEMPRE de
 *   `contact.whatsappFormulario`, nunca del payload (regla 5 de AGENTS.md).
 * - Las URL de imagen son del bucket `site-images` o de un host permitido
 *   (`src/lib/imagenes.ts`). Nunca rutas `/images/...` (regla 14).
 */

/* ===================================================================== */
/* 1. Piezas comunes                                                      */
/* ===================================================================== */

/** Imagen de contenido. `width`/`height` evitan CLS; se piden siempre. */
export type ImagenContenido = {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  /**
   * Variante angosta (~900 px de ancho) de la misma foto, para `srcset`. Con el
   * optimizador de Vercel apagado no hay quien redimensione al vuelo: sin esta
   * variante, un celular descarga la foto de 1920 px de un fondo de cabecera.
   * Ausente = se sirve solo `src`. El panel la genera sola al subir.
   */
  srcMovil?: string;
};

/**
 * Bloque `images` de servicios y proyectos (columna `jsonb`).
 * `{ "cover": "url", "coverAlt": "...", "gallery": [{ "src", "alt", "width", "height" }] }`
 */
export type BloqueImagenes = {
  cover?: string;
  coverAlt?: string;
  gallery?: ImagenContenido[];
};

/**
 * Video de YouTube (columna `video`, `jsonb` anulable).
 * `null` = sin video. El id se deriva de la URL al leer (`src/lib/youtube.ts`).
 */
export type VideoContenido = {
  url: string;
  titulo?: string;
  descripcion?: string;
  visible?: boolean;
};

/** Enlace genérico (CTA de una franja, botón de un bloque). */
export type EnlaceContenido = {
  etiqueta: string;
  href: string;
};

/* ===================================================================== */
/* 2. Servicios — `site_services`                                         */
/* ===================================================================== */

/**
 * Las nueve claves de icono admitidas. El componente que las pinta
 * (`src/components/ui/iconos-servicio.tsx`) cae a un icono genérico si llega
 * una clave desconocida: el panel puede escribir cualquier texto sin romper.
 */
export const CLAVES_ICONO_SERVICIO = [
  "plano", // diseño de ingeniería eléctrica
  "automatizacion", // PLC / HMI / SCADA
  "tablero", // ensamble de tableros
  "telemetria", // medición remota
  "telecontrol", // mando remoto
  "llave-en-mano", // proyecto completo
  "aplicaciones", // aplicaciones industriales a la medida
  "refrigeracion", // refrigeración industrial y cuartos fríos
  "clima", // aires acondicionados
] as const;

export type ClaveIconoServicio = (typeof CLAVES_ICONO_SERVICIO)[number];

/** Un servicio, ya normalizado desde la fila de `site_services`. */
export type Servicio = {
  /** Identificador de la fila. `null` cuando viene del respaldo estático. */
  id: string | null;
  /** Parte final de la URL: `/servicios/{slug}`. Sin tildes, con guiones. */
  slug: string;
  /** Título de la página y de la tarjeta (`<h1>`). */
  title: string;
  /** Título corto para el menú y las migas. Si falta, se usa `title`. */
  navTitle: string;
  /** Clave de icono; `null` = icono genérico. */
  iconKey: string | null;
  /** Una o dos frases para la tarjeta del hub y la metadescripción de respaldo. */
  summary: string;
  /** Cuerpo de la página: párrafos separados por línea en blanco (`\n\n`). */
  description: string;
  /** Alcances concretos del servicio. 5–8 ítems. */
  items: string[];
  images: BloqueImagenes;
  video: VideoContenido | null;
  /** ≤ 60 caracteres. Si falta, se arma con `title`. */
  metaTitle: string | null;
  /** ≤ 155 caracteres. Si falta, se usa `summary`. */
  metaDescription: string | null;
  sort: number;
  published: boolean;
  /**
   * Última modificación en la base (ISO 8601). Ausente en el respaldo
   * estático — por eso es opcional: `src/data/*` no lo escribe. La usa el
   * sitemap como `lastModified` real.
   */
  updatedAt?: string | null;
};

/**
 * Agrupación de los nueve servicios en cuatro líneas, para el menú y el hub.
 * **Propuesta de PIYC-web, pendiente de validar con Jorge** (plan §4.4: los
 * nueve servicios son planos, sin categorías, en el documento original).
 * La agrupación vive en el código; el nombre de cada línea y su frase corta
 * de la portada se editan en el panel (`home.lineasServicio`).
 */
export type LineaServicio = {
  id: string;
  titulo: string;
  /** Una frase que explica qué resuelve la línea (entrada de la línea en `/servicios`). */
  resumen: string;
  /**
   * Frase de UNA sola línea para la franja bajo el hero del inicio (≤ 45
   * caracteres). La completa `src/lib/content.ts` con lo del panel
   * (`home.lineasServicio`) o su respaldo; ausente en `src/data`.
   */
  resumenCorto?: string;
  /** Slugs en el orden en que se pintan. */
  slugs: string[];
};

/**
 * Textos editables de una línea de servicio (`home.lineasServicio`). La
 * agrupación —qué servicios van en cada línea— sigue en el código; el panel
 * solo cambia cómo se llama cada línea y su frase corta de la portada.
 */
export type TextosLineaServicio = {
  /** `id` de la línea en `lineasDeServicio` (código). */
  id: string;
  /** Nombre de la línea. Vacío = el de fábrica (la línea necesita nombre). */
  titulo?: string;
  /** Frase de una sola línea para la franja del inicio. Vacío = no se pinta. */
  resumen?: string;
};

/* ===================================================================== */
/* 3. Proyectos — `site_projects`                                         */
/* ===================================================================== */

/** Un caso de éxito, ya normalizado desde la fila de `site_projects`. */
export type Proyecto = {
  id: string | null;
  slug: string;
  title: string;
  /** Cliente o sector. `null` cuando no se puede nombrar. */
  client: string | null;
  /** Descripción corta (tarjeta) y metadescripción de respaldo. */
  description: string;
  /**
   * Descripción larga de la página: párrafos separados por línea en blanco
   * (contexto → solución → resultado). Vacío = se usa `description`.
   */
  body: string;
  images: BloqueImagenes;
  sort: number;
  published: boolean;
  /** Última modificación en la base (ISO 8601). Ausente en el respaldo. */
  updatedAt?: string | null;
};

/* ===================================================================== */
/* 4. Valores — `site_values`                                             */
/* ===================================================================== */

/** Claves de icono de los cuatro valores de PIYC. */
export const CLAVES_ICONO_VALOR = [
  "integridad",
  "compromiso",
  "cliente",
  "innovacion",
] as const;

export type ClaveIconoValor = (typeof CLAVES_ICONO_VALOR)[number];

export type Valor = {
  id: string | null;
  title: string;
  description: string;
  iconKey: string | null;
  sort: number;
  published: boolean;
};

/* ===================================================================== */
/* 5. Ajustes — `site_settings`                                           */
/*    Una entrada por clave. Todos los campos son OPCIONALES: la capa de   */
/*    contenido completa con el respaldo estático lo que la base no trae.  */
/* ===================================================================== */

/** Las claves públicas de `site_settings` que consume el sitio. */
export const CLAVES_AJUSTES = ["home", "nosotros", "paginas", "contact", "seo"] as const;
export type ClaveAjustes = (typeof CLAVES_AJUSTES)[number];

/* --- 5.1 `contact` — ya sembrada en 0001_contenido.sql § 6 ------------- */

export type DireccionContacto = {
  street?: string;
  area?: string;
  city?: string;
  region?: string;
  country?: string;
  /** Línea completa, como se muestra y como se manda a Google Maps. */
  full?: string;
};

export type TelefonoContacto = {
  /** Como se muestra: «+57 321 761 7958». */
  label: string;
  /** Solo dígitos, con indicativo: «573217617958». Para `tel:` y `wa.me`. */
  intl: string;
};

export type WhatsAppContacto = TelefonoContacto & {
  /** A quién pertenece la línea. `null` = número general de la empresa. */
  person?: string | null;
  principal?: boolean;
};

export type CorreoContacto = {
  address: string;
  person?: string | null;
};

/**
 * Horario de atención. **Solo se pinta si está presente.** El horario vigente
 * (lunes a viernes de 8:00 a. m. a 5:00 p. m.) salió de la ficha de Google del
 * negocio; cualquier otro dato se confirma antes de escribirlo.
 */
export type HorarioContacto = {
  /** Texto legible: «Lunes a viernes, 8:00 a. m. – 5:00 p. m.». */
  label?: string;
  /**
   * Formato schema.org `openingHours`: `["Mo-Fr 08:00-17:00"]`. Ausente = no se
   * emite en el JSON-LD. Tiene que decir lo mismo que `label`.
   */
  schema?: string[];
};

/** Coordenadas del `LocalBusiness`. Solo si se tienen con certeza. */
export type GeoContacto = {
  lat: number;
  lng: number;
};

export type AjustesContact = {
  companyName?: string;
  legalName?: string;
  nit?: string;
  tagline?: string;
  address?: DireccionContacto;
  phones?: TelefonoContacto[];
  whatsapp?: WhatsAppContacto[];
  /** Número del botón flotante y de los CTA. Solo dígitos. */
  primaryWhatsApp?: string;
  /**
   * DESTINO DEL FORMULARIO DE CONTACTO. Solo dígitos.
   * Regla 5 de AGENTS.md: el servidor lo lee de aquí y **nunca** del payload.
   */
  whatsappFormulario?: string;
  emails?: CorreoContacto[];
  social?: {
    instagram?: string;
    facebook?: string;
    linkedin?: string;
    youtube?: string;
  };
  /** URL canónica del sitio. Respaldo: `NEXT_PUBLIC_SITE_URL`. */
  siteUrl?: string;
  /** Campos añadidos por el sitio público; ausentes en la semilla inicial. */
  horario?: HorarioContacto;
  geo?: GeoContacto;
  /** Consulta para el iframe de Google Maps. Si falta, se usa `address.full`. */
  mapsQuery?: string;
};

/* --- 5.2 `home` — página de inicio ------------------------------------ */

/**
 * Encabezado de una franja de la portada: rótulo pequeño, título, párrafo de
 * entrada y el texto del enlace que lleva al listado completo. La dirección de
 * ese enlace NO se edita (siempre es `/servicios` o `/proyectos`): lo que
 * cambia es cómo se llama.
 */
export type EncabezadoFranja = {
  eyebrow?: string;
  title?: string;
  intro?: string;
  /** Texto del enlace «ver todos». Vacío = no se pinta el enlace. */
  ctaEtiqueta?: string;
};

export type AjustesHome = {
  hero?: {
    /** Línea corta sobre el título («Cali, Valle del Cauca»). */
    eyebrow?: string;
    /** `<h1>` de la portada. */
    title?: string;
    subtitle?: string;
    ctaPrimario?: EnlaceContenido;
    ctaSecundario?: EnlaceContenido;
    /**
     * Imagen principal de la portada, dentro del marco de la derecha.
     * **Ausente = se pinta el diagrama de escalera** (el respaldo en código).
     * Es la imagen LCP del sitio: se sirve sin `lazy`, con `fetchpriority` alto
     * y con medidas explícitas.
     */
    image?: ImagenContenido;
  };
  /** Bloque «qué hace PIYC», debajo del hero. */
  intro?: {
    eyebrow?: string;
    title?: string;
    /** Párrafos separados por línea en blanco. */
    body?: string;
    image?: ImagenContenido;
    /** Texto del enlace a `/nosotros`. Vacío = no se pinta. */
    ctaEtiqueta?: string;
  };
  /** Franja del proceso de trabajo: diagnóstico → … → soporte. */
  proceso?: {
    eyebrow?: string;
    title?: string;
    intro?: string;
    pasos?: { titulo: string; descripcion: string }[];
  };
  /** Rótulo, título, intro y enlace de la franja de servicios de la portada. */
  seccionServicios?: EncabezadoFranja;
  /** Lo mismo para la franja de casos de éxito. */
  seccionProyectos?: EncabezadoFranja;
  /** Rótulo, título e intro del bloque de valores **en la portada**. Los de
   *  `/nosotros` viven en `AjustesNosotros.valores`: son dos textos distintos. */
  seccionValores?: { eyebrow?: string; title?: string; intro?: string };
  /**
   * Nombre y frase corta de cada una de las cuatro líneas de servicio (franja
   * bajo el hero). El nombre se usa también en `/servicios` y en las fichas.
   * Ausente = respaldo en `src/lib/content.ts`.
   */
  lineasServicio?: TextosLineaServicio[];
  /** Slugs destacados. Vacío = no se pinta la sección; ausente = respaldo. */
  serviciosDestacados?: string[];
  proyectosDestacados?: string[];
  /** Franja de cierre. */
  cta?: {
    title?: string;
    body?: string;
    ctaPrimario?: EnlaceContenido;
    ctaSecundario?: EnlaceContenido;
    /**
     * Frase pequeña bajo el cierre, con un enlace en medio. Se parte en tres
     * para poder editarla sin escribir HTML: `texto` + enlace + `textoFinal`.
     */
    nota?: {
      texto?: string;
      enlace?: EnlaceContenido;
      textoFinal?: string;
    };
  };
};

/* --- 5.3 `nosotros` — página /nosotros -------------------------------- */

/**
 * ⚠ `mision` y `vision` quedaron **intercambiadas respecto al documento
 * original de PIYC** (decisión de Cesar, 21-sep-2026): el texto que ese
 * documento rotulaba «Visión» describe lo que la empresa hace hoy, y el
 * rotulado «Misión» describe a dónde quiere llegar. El panel edita cada campo
 * por su rótulo; el sitio los pinta con ese mismo rótulo.
 */
export type AjustesNosotros = {
  hero?: {
    eyebrow?: string;
    title?: string;
    subtitle?: string;
    image?: ImagenContenido;
  };
  /** «Quiénes somos»: párrafos separados por línea en blanco. */
  quienesSomos?: {
    /** Rótulo pequeño sobre el título del bloque. */
    eyebrow?: string;
    title?: string;
    body?: string;
    image?: ImagenContenido;
  };
  mision?: { title?: string; body?: string };
  vision?: { title?: string; body?: string };
  /**
   * Foto entre las tarjetas de misión y visión (se estira al alto de ellas:
   * mejor vertical). Ausente = la primera foto de la galería que no esté ya en
   * la cabecera ni en «Quiénes somos».
   */
  imagenMisionVision?: ImagenContenido;
  /** Rótulo, título e introducción del bloque de valores (los valores van en `site_values`). */
  valores?: { eyebrow?: string; title?: string; intro?: string };
  /** Galería de la página. Vacía = no se pinta. */
  galeria?: ImagenContenido[];
  /** Rótulo, título y entradilla del bloque de galería (las fotos van en `galeria`). */
  bloqueGaleria?: { eyebrow?: string; title?: string; intro?: string };
  /** Franja de cierre de `/nosotros`. */
  cta?: { title?: string; body?: string };
};

/* --- 5.4 `paginas` — cabeceras y bloques sueltos por ruta -------------- */

/** Cabecera de una página interna (título, bajada y foto de fondo). */
export type CabeceraPagina = {
  eyebrow?: string;
  title?: string;
  subtitle?: string;
  image?: ImagenContenido;
};

export type PreguntaFrecuente = {
  pregunta: string;
  respuesta: string;
};

/** Franja de cierre de una página interna. Los botones son siempre los mismos. */
export type CierrePagina = { title?: string; body?: string };

export type AjustesPaginas = {
  servicios?: CabeceraPagina & {
    /** Párrafo de entrada del hub, bajo el `<h1>`. */
    intro?: string;
    /** FAQ del hub de servicios. Vacía = no se pinta. */
    faq?: PreguntaFrecuente[];
    cta?: CierrePagina;
  };
  proyectos?: CabeceraPagina & { intro?: string; cta?: CierrePagina };
  contacto?: CabeceraPagina & {
    intro?: string;
    /** Párrafo sobre el formulario: qué pasa al enviarlo. */
    introFormulario?: string;
    /** Texto bajo el formulario: qué se hace con los datos. */
    notaFormulario?: string;
    /** Títulos de los tres bloques de la página. Vacío = se usa el de fábrica. */
    tituloDatos?: string;
    tituloFormulario?: string;
    tituloMapa?: string;
    faq?: PreguntaFrecuente[];
  };
  /**
   * Textos de la plantilla `/proyectos/[slug]`. No son de un caso concreto:
   * se repiten en todos, por eso no viven en `site_projects`.
   */
  proyectoDetalle?: {
    /** Frase bajo la ficha cuando el caso tiene servicios asociados. */
    notaServicios?: string;
    cta?: CierrePagina;
    /**
     * Títulos de las secciones de la ficha. Vacío o ausente = el de fábrica;
     * no se dejan vacíos de verdad porque cada sección necesita un nombre
     * accesible (`aria-labelledby`).
     */
    tituloCuerpo?: string;
    tituloGaleria?: string;
    tituloServicios?: string;
  };
  /** Textos de la plantilla `/servicios/[slug]`. El título del cierre lo arma
   *  el sitio con el nombre del servicio. */
  servicioDetalle?: {
    ctaTexto?: string;
    tituloAlcance?: string;
    tituloIncluye?: string;
    tituloGaleria?: string;
    tituloCasos?: string;
    tituloOtros?: string;
  };
  /** Página 404. */
  noEncontrada?: { title?: string; body?: string };
};

/* --- 5.5 `seo` — metadatos por ruta ----------------------------------- */

export type MetadatosPagina = {
  /** ≤ 60 caracteres. */
  title?: string;
  /** ≤ 155 caracteres. */
  description?: string;
  /** Imagen OG propia (1200×630). Si falta, se usa la del sitio. */
  ogImage?: string;
};

export type AjustesSeo = {
  /** Título por defecto y plantilla del resto de páginas. */
  defaultTitle?: string;
  titleTemplate?: string;
  defaultDescription?: string;
  /** Imagen OG del sitio (1200×630). */
  ogImage?: string;
  /** Palabras clave del sitio. Informativas; no se emiten como `<meta keywords>`. */
  keywords?: string[];
  /** Verificación de Google Search Console (`google-site-verification`). */
  googleSiteVerification?: string;
  /** Metadatos por ruta. Las páginas de detalle usan los de su fila. */
  paginas?: {
    inicio?: MetadatosPagina;
    nosotros?: MetadatosPagina;
    servicios?: MetadatosPagina;
    proyectos?: MetadatosPagina;
    contacto?: MetadatosPagina;
  };
};

/* --- 5.6 Mapa de claves → forma --------------------------------------- */

/** El tipo del valor de cada clave de `site_settings`. */
export type AjustesPorClave = {
  home: AjustesHome;
  nosotros: AjustesNosotros;
  paginas: AjustesPaginas;
  contact: AjustesContact;
  seo: AjustesSeo;
};

/* ===================================================================== */
/* 6. Paquete de contenido del sitio                                      */
/* ===================================================================== */

/**
 * Todo lo que una página pública puede necesitar. `src/lib/content.ts`
 * expone lecturas sueltas (`getServicios()`, `getAjustes("home")`…); este tipo
 * es el agregado que usan el sitemap y las páginas que cruzan varias tablas.
 */
export type ContenidoSitio = {
  servicios: Servicio[];
  proyectos: Proyecto[];
  valores: Valor[];
  contact: AjustesContact;
};

/* ===================================================================== */
/* 7. Formulario de contacto — contrato cliente ↔ servidor                */
/* ===================================================================== */

/** Longitudes máximas. Coinciden con los `check` de `site_mensajes`. */
export const LIMITES_CONTACTO = {
  nombre: 120,
  empresa: 120,
  telefono: 40,
  email: 160,
  servicio: 120,
  mensaje: 2000,
} as const;

/** Segundos mínimos entre que se pinta el formulario y se envía (anti-spam). */
export const SEGUNDOS_MINIMOS_FORMULARIO = 3;

/** Tope de envíos por IP y ventana (anti-spam, regla 7 de AGENTS.md). */
export const TOPE_POR_IP = { envios: 5, minutos: 60 } as const;

export type PayloadContacto = {
  nombre: string;
  empresa: string;
  telefono: string;
  /** Opcional: el sitio no envía correo, pero sirve para responder. */
  email?: string;
  /** Título del servicio de interés, tal como lo eligió el visitante. */
  servicio?: string;
  mensaje: string;
  /** Honeypot: debe llegar vacío. Si trae algo, es un bot. */
  sitioWeb?: string;
  /** Milisegundos desde que el visitante abrió el formulario (su propio reloj). */
  transcurridoMs?: number;
};

export type RespuestaContacto =
  | {
      ok: true;
      /** Enlace `wa.me` prearmado que el cliente abre. */
      whatsappUrl: string;
      /** `false` = el lead no se pudo guardar, pero WhatsApp igual se abre. */
      guardado: boolean;
    }
  | {
      ok: false;
      /** Mensaje para mostrarle al visitante, en español. */
      error: string;
      /** Campos con problema, para marcarlos en el formulario. */
      campos?: Partial<Record<keyof PayloadContacto, string>>;
    };
