/**
 * TIPOS Y CONSTANTES DEL PANEL — módulo PURO
 * ==========================================
 * Sin React, sin `next/*`, sin Supabase, sin `"use client"`.
 *
 * Existe por la regla 4 de `AGENTS.md`: un valor exportado desde un módulo
 * `"use client"` no se puede leer en el servidor. Todo lo que comparten los
 * Server Components del panel y sus formularios de cliente (estados de acción,
 * etiquetas, rutas, formas de fila) vive aquí.
 *
 * La forma del CONTENIDO público (servicios, proyectos, valores y el JSON de
 * cada clave de `site_settings`) NO se redefine aquí: es `src/lib/content-types.ts`,
 * que escribe el agente del sitio público y que este panel consume tal cual.
 * Los formularios editan exactamente esas formas.
 */

import type {
  AjustesContact,
  AjustesHome,
  AjustesNosotros,
  AjustesPaginas,
  AjustesSeo,
  BloqueImagenes,
  ClaveAjustes,
  VideoContenido,
} from "@/lib/content-types";
import type { UserRole } from "@/lib/supabase/roles";

/* ===================================================================== */
/* 1. Estado de una server action                                         */
/* ===================================================================== */

export type ActionStatus = "idle" | "success" | "error";

export interface ActionState {
  status: ActionStatus;
  message?: string;
}

export const idleState: ActionState = { status: "idle" };

/**
 * Estado extendido para las acciones que generan una contraseña. El panel la
 * muestra UNA sola vez: no se puede volver a consultar, solo restablecer.
 */
export interface CredentialState extends ActionState {
  credential?: {
    /** Con lo que la persona ingresa: su USUARIO. */
    usuario: string;
    password: string;
    kind: "created" | "reset";
  };
}

export const idleCredentialState: CredentialState = { status: "idle" };

/* ===================================================================== */
/* 2. Filas del contenido, tal como las edita el panel                    */
/*    Son la fila de la base normalizada (no la forma pública): el panel   */
/*    edita columnas, no el modelo ya resuelto con sus respaldos.          */
/* ===================================================================== */

export interface ServicioRow {
  id: string;
  slug: string;
  title: string;
  nav_title: string | null;
  icon_key: string | null;
  summary: string | null;
  description: string | null;
  items: string[];
  images: BloqueImagenes;
  video: VideoContenido | null;
  meta_title: string | null;
  meta_description: string | null;
  sort: number;
  published: boolean;
}

export interface ProyectoRow {
  id: string;
  slug: string;
  title: string;
  client: string | null;
  description: string | null;
  body: string | null;
  images: BloqueImagenes;
  sort: number;
  published: boolean;
}

export interface ValorRow {
  id: string;
  title: string;
  description: string | null;
  icon_key: string | null;
  sort: number;
  published: boolean;
}

/** Un lead de `/contacto`. Solo lectura: la tabla no tiene UPDATE ni DELETE. */
export interface MensajeRow {
  id: string;
  nombre: string;
  empresa: string;
  email: string | null;
  telefono: string;
  servicio: string | null;
  mensaje: string;
  canal: string;
  destino: string | null;
  created_at: string;
}

/** Una cuenta del portal (`profiles`). */
export interface PerfilRow {
  id: string;
  email: string;
  username: string | null;
  full_name: string;
  role: UserRole;
  cargo: string | null;
  phone: string | null;
  cedula: string | null;
  email_contacto: string | null;
  active: boolean;
  created_at: string | null;
}

/** El video vacío con el que arranca el bloque de un servicio nuevo. */
export const videoVacio: VideoContenido = {
  url: "",
  titulo: "",
  descripcion: "",
  visible: false,
};

/* ===================================================================== */
/* 3. Ajustes que edita el panel                                          */
/* ===================================================================== */

/** Lo que devuelve la lectura de ajustes del panel: una entrada por clave. */
export interface AjustesDelPanel {
  home: AjustesHome;
  nosotros: AjustesNosotros;
  paginas: AjustesPaginas;
  contact: AjustesContact;
  seo: AjustesSeo;
}

export type { ClaveAjustes };

/* ===================================================================== */
/* 4. Navegación del panel                                                */
/* ===================================================================== */

/**
 * CUATRO ENTRADAS, NO MÁS (plan §5.2). Todo lo demás cuelga de ellas.
 * Las rutas de contenido viven bajo `/admin/contenido/...`; esta lista es la
 * que deja iluminada la entrada «Contenido del sitio» estando en cualquiera de
 * sus pantallas.
 */
export const RUTAS_CONTENIDO = [
  "/admin/contenido",
  "/admin/mensajes",
] as const;

/** Carpetas del bucket `site-images` (0001_contenido.sql §5). */
export const CARPETAS_IMAGEN = [
  "inicio",
  "nosotros",
  "servicios",
  "proyectos",
  "cabeceras",
] as const;

export type CarpetaImagen = (typeof CARPETAS_IMAGEN)[number];

/* ===================================================================== */
/* 5. Reglas de las imágenes (las aplica `CampoImagen`)                   */
/* ===================================================================== */

/**
 * TOPE DE PESO — regla 14 de `AGENTS.md`.
 * El optimizador de Next está apagado (`images.unoptimized`), así que lo que se
 * sube es exactamente lo que descarga el visitante: no hay red de seguridad.
 */
export const PESO_MAXIMO_IMAGEN = 400 * 1024;
export const ANCHO_MAXIMO_IMAGEN = 1920;

/** Tipos que acepta el bucket (`allowed_mime_types` de la migración 0001). */
export const TIPOS_IMAGEN_ACEPTADOS = [
  "image/webp",
  "image/jpeg",
  "image/png",
  "image/avif",
] as const;

/* ===================================================================== */
/* 6. Longitudes de los campos de texto del panel                         */
/* ===================================================================== */

export const LIMITES_CONTENIDO = {
  titulo: 160,
  navTitulo: 60,
  slug: 80,
  resumen: 300,
  metaTitle: 60,
  metaDescription: 160,
  alt: 200,
} as const;

/** Mínimo de la contraseña. Coincide con lo configurado en Supabase Auth. */
export const PASSWORD_MINIMO = 10;
