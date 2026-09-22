/**
 * LECTURAS DEL PANEL — solo servidor
 * ==================================
 * Todas usan el cliente ligado a la SESIÓN (`getServerSupabase`), así que el
 * alcance lo decide la RLS: un editor de contenido ve también lo oculto, un
 * empleado no vería nada. Aquí no se filtra por rol a mano; la barrera es la
 * base, y cada página vuelve a exigir el rol con `requireContentEditor()` /
 * `requireManager()`.
 *
 * Si Supabase no responde, todas devuelven vacío y la pantalla muestra su
 * estado vacío en vez de romperse. El panel NO cae al respaldo estático de
 * `src/data/*`: eso es cosa del sitio público (`src/lib/content.ts`). Aquí
 * mostrar datos que no están en la base sería mentirle a quien edita.
 *
 * `undefined` ≠ vacío (plan §7): una columna ausente se normaliza al valor
 * neutro, nunca a un contenido inventado.
 */

import { getServerSupabase } from "@/lib/supabase/server";
import { getServiceRoleSupabase } from "@/lib/supabase/admin";
import { normalizeRole } from "@/lib/supabase/roles";
import { usuarioDesdeEmail } from "@/lib/usuarios";
import type {
  AjustesDelPanel,
  MensajeRow,
  PerfilRow,
  ProyectoRow,
  ServicioRow,
  ValorRow,
} from "@/lib/admin-types";
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

/* ------------------------------------------------------------------ */
/* Normalizadores                                                      */
/* ------------------------------------------------------------------ */

function esObjeto(valor: unknown): valor is Record<string, unknown> {
  return typeof valor === "object" && valor !== null && !Array.isArray(valor);
}

function texto(valor: unknown): string {
  return typeof valor === "string" ? valor : "";
}

/** Texto no vacío o `null`. */
function textoOrNull(valor: unknown): string | null {
  const v = texto(valor).trim();
  return v === "" ? null : v;
}

function listaDeTextos(valor: unknown): string[] {
  if (!Array.isArray(valor)) return [];
  return valor
    .map((item) => (typeof item === "string" ? item.trim() : ""))
    .filter((item) => item !== "");
}

function galeria(valor: unknown): ImagenContenido[] {
  if (!Array.isArray(valor)) return [];
  return valor.flatMap((item) => {
    if (!esObjeto(item)) return [];
    const src = texto(item.src).trim();
    if (src === "") return [];
    const imagen: ImagenContenido = { src, alt: texto(item.alt) };
    // La variante de 900 px viaja con la foto: si el formulario no la recibe,
    // al guardar se perdería.
    const srcMovil = texto(item.srcMovil).trim();
    if (srcMovil !== "") imagen.srcMovil = srcMovil;
    if (typeof item.width === "number") imagen.width = item.width;
    if (typeof item.height === "number") imagen.height = item.height;
    return [imagen];
  });
}

function bloqueImagenes(valor: unknown): BloqueImagenes {
  if (!esObjeto(valor)) return {};
  const bloque: BloqueImagenes = {};
  const cover = texto(valor.cover).trim();
  if (cover !== "") bloque.cover = cover;
  const coverAlt = texto(valor.coverAlt);
  if (coverAlt !== "") bloque.coverAlt = coverAlt;
  const lista = galeria(valor.gallery);
  if (lista.length > 0) bloque.gallery = lista;
  return bloque;
}

function video(valor: unknown): VideoContenido | null {
  if (!esObjeto(valor)) return null;
  const url = texto(valor.url).trim();
  if (url === "") return null;
  return {
    url,
    titulo: texto(valor.titulo),
    descripcion: texto(valor.descripcion),
    visible: valor.visible === true,
  };
}

/** `published` ausente se lee como `true`: así lo declara la columna. */
function publicado(valor: unknown): boolean {
  return valor !== false;
}

function entero(valor: unknown): number {
  const n = Number(valor);
  return Number.isFinite(n) ? Math.trunc(n) : 0;
}

/* ------------------------------------------------------------------ */
/* Contenido                                                           */
/* ------------------------------------------------------------------ */

export async function listServicios(): Promise<ServicioRow[]> {
  const supabase = await getServerSupabase();
  if (!supabase) return [];
  const { data } = await supabase
    .from("site_services")
    .select("*")
    .order("sort", { ascending: true })
    // Desempate estable: con el mismo orden, la paginación no puede repartir
    // las filas distinto en cada consulta.
    .order("created_at", { ascending: true });
  if (!data) return [];

  return data.map((row) => ({
    id: String(row.id),
    slug: texto(row.slug),
    title: texto(row.title),
    nav_title: textoOrNull(row.nav_title),
    icon_key: textoOrNull(row.icon_key),
    summary: textoOrNull(row.summary),
    description: textoOrNull(row.description),
    items: listaDeTextos(row.items),
    images: bloqueImagenes(row.images),
    video: video(row.video),
    meta_title: textoOrNull(row.meta_title),
    meta_description: textoOrNull(row.meta_description),
    sort: entero(row.sort),
    published: publicado(row.published),
  }));
}

export async function getServicio(id: string): Promise<ServicioRow | null> {
  const todos = await listServicios();
  return todos.find((s) => s.id === id) ?? null;
}

export async function listProyectos(): Promise<ProyectoRow[]> {
  const supabase = await getServerSupabase();
  if (!supabase) return [];
  const { data } = await supabase
    .from("site_projects")
    .select("*")
    .order("sort", { ascending: true })
    .order("created_at", { ascending: true });
  if (!data) return [];

  return data.map((row) => ({
    id: String(row.id),
    slug: texto(row.slug),
    title: texto(row.title),
    client: textoOrNull(row.client),
    description: textoOrNull(row.description),
    body: textoOrNull(row.body),
    images: bloqueImagenes(row.images),
    sort: entero(row.sort),
    published: publicado(row.published),
  }));
}

export async function getProyecto(id: string): Promise<ProyectoRow | null> {
  const todos = await listProyectos();
  return todos.find((p) => p.id === id) ?? null;
}

export async function listValores(): Promise<ValorRow[]> {
  const supabase = await getServerSupabase();
  if (!supabase) return [];
  const { data } = await supabase
    .from("site_values")
    .select("*")
    .order("sort", { ascending: true })
    .order("created_at", { ascending: true });
  if (!data) return [];

  return data.map((row) => ({
    id: String(row.id),
    title: texto(row.title),
    description: textoOrNull(row.description),
    icon_key: textoOrNull(row.icon_key),
    sort: entero(row.sort),
    published: publicado(row.published),
  }));
}

export async function getValor(id: string): Promise<ValorRow | null> {
  const todos = await listValores();
  return todos.find((v) => v.id === id) ?? null;
}

/* ------------------------------------------------------------------ */
/* Ajustes (`site_settings`)                                           */
/* ------------------------------------------------------------------ */

/**
 * Las cinco claves públicas, de una sola consulta. Una clave que todavía no
 * exista se devuelve como `{}`: el formulario la muestra vacía y al guardar la
 * crea (`upsert`). Los tipos vienen de `content-types.ts`, que es el contrato
 * con el sitio público: los formularios editan exactamente esas formas.
 */
export async function getAjustes(): Promise<AjustesDelPanel> {
  const vacio: AjustesDelPanel = {
    home: {},
    nosotros: {},
    paginas: {},
    contact: {},
    seo: {},
  };

  const supabase = await getServerSupabase();
  if (!supabase) return vacio;

  const { data } = await supabase
    .from("site_settings")
    .select("key, value")
    .in("key", ["home", "nosotros", "paginas", "contact", "seo"]);
  if (!data) return vacio;

  const porClave = new Map<string, Record<string, unknown>>();
  for (const fila of data) {
    porClave.set(String(fila.key), esObjeto(fila.value) ? fila.value : {});
  }

  return {
    home: (porClave.get("home") ?? {}) as AjustesHome,
    nosotros: (porClave.get("nosotros") ?? {}) as AjustesNosotros,
    paginas: (porClave.get("paginas") ?? {}) as AjustesPaginas,
    contact: (porClave.get("contact") ?? {}) as AjustesContact,
    seo: (porClave.get("seo") ?? {}) as AjustesSeo,
  };
}

/* ------------------------------------------------------------------ */
/* Mensajes del formulario de contacto                                 */
/* ------------------------------------------------------------------ */

/** Los leads más recientes primero. Solo lectura (RLS: SELECT para managers). */
export async function listMensajes(limite = 200): Promise<MensajeRow[]> {
  const supabase = await getServerSupabase();
  if (!supabase) return [];
  const { data } = await supabase
    .from("site_mensajes")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(limite);
  if (!data) return [];

  return data.map((row) => ({
    id: String(row.id),
    nombre: texto(row.nombre),
    empresa: texto(row.empresa),
    email: textoOrNull(row.email),
    telefono: texto(row.telefono),
    servicio: textoOrNull(row.servicio),
    mensaje: texto(row.mensaje),
    canal: texto(row.canal) || "whatsapp",
    destino: textoOrNull(row.destino),
    created_at: texto(row.created_at),
  }));
}

/* ------------------------------------------------------------------ */
/* Cuentas del equipo                                                  */
/* ------------------------------------------------------------------ */

function filaAPerfil(row: Record<string, unknown>): PerfilRow {
  const email = texto(row.email);
  return {
    id: String(row.id),
    email,
    username: textoOrNull(row.username) ?? usuarioDesdeEmail(email),
    full_name: textoOrNull(row.full_name) ?? email,
    role: normalizeRole(row.role),
    cargo: textoOrNull(row.cargo),
    phone: textoOrNull(row.phone),
    cedula: textoOrNull(row.cedula),
    email_contacto: textoOrNull(row.email_contacto),
    active: row.active !== false,
    created_at: textoOrNull(row.created_at),
  };
}

/**
 * Todas las cuentas, ordenadas por nombre.
 *
 * La RLS de `profiles` deja a un manager leerlas todas, así que aquí basta el
 * cliente de sesión (regla 3: completar con la service-role es solo para las
 * pantallas que le muestran compañeros a quien NO es manager, y entonces solo
 * nombre, apodo y cargo — ver `nombresDeCompaneros`).
 */
export async function listPerfiles(): Promise<PerfilRow[]> {
  const supabase = await getServerSupabase();
  if (!supabase) return [];
  try {
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .order("full_name", { ascending: true });
    if (error || !data) return [];
    return data.map((row) => filaAPerfil(row as Record<string, unknown>));
  } catch {
    return [];
  }
}

export async function getPerfil(id: string): Promise<PerfilRow | null> {
  const supabase = await getServerSupabase();
  if (!supabase) return null;
  try {
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", id)
      .maybeSingle();
    if (error || !data) return null;
    return filaAPerfil(data as Record<string, unknown>);
  } catch {
    return null;
  }
}

/**
 * NOMBRE Y CARGO DE UN PUÑADO DE CUENTAS — regla 3 de `AGENTS.md`.
 *
 * La RLS de `profiles` solo deja a cada quien leer SU fila, así que cualquier
 * pantalla que le muestre compañeros a alguien que no es manager (el histórico
 * de jornadas de un empleado, por ejemplo) los vería como «cuenta eliminada».
 * Se completa con la clave de servicio y **solo** con nombre y cargo: ni
 * cédula, ni teléfono, ni correo.
 *
 * Queda listo para el agente de jornadas; el panel de contenido no lo necesita.
 */
export async function nombresDeCompaneros(
  ids: readonly string[],
): Promise<Map<string, { nombre: string; cargo: string | null }>> {
  const mapa = new Map<string, { nombre: string; cargo: string | null }>();
  const unicos = Array.from(new Set(ids.filter((id) => id !== "")));
  if (unicos.length === 0) return mapa;

  const admin = getServiceRoleSupabase();
  if (!admin) return mapa;

  const { data } = await admin
    .from("profiles")
    .select("id, full_name, cargo")
    .in("id", unicos);
  if (!data) return mapa;

  for (const fila of data) {
    mapa.set(String(fila.id), {
      nombre: textoOrNull(fila.full_name) ?? "Cuenta sin nombre",
      cargo: textoOrNull(fila.cargo),
    });
  }
  return mapa;
}

/* ------------------------------------------------------------------ */
/* Contadores del dashboard                                            */
/* ------------------------------------------------------------------ */

export interface ContadoresPanel {
  servicios: number;
  serviciosOcultos: number;
  proyectos: number;
  proyectosOcultos: number;
  valores: number;
  mensajes: number;
  /** Leads de los últimos 7 días. */
  mensajesRecientes: number;
  cuentas: number;
  cuentasInactivas: number;
}

/**
 * Los contadores del dashboard, en paralelo.
 *
 * Regla 9: `0` nunca se pinta como dato. Quien los consume decide no dibujar la
 * tarjeta; aquí se devuelve el número tal cual, que es lo honesto.
 */
export async function getContadores(): Promise<ContadoresPanel> {
  const supabase = await getServerSupabase();
  const vacios: ContadoresPanel = {
    servicios: 0,
    serviciosOcultos: 0,
    proyectos: 0,
    proyectosOcultos: 0,
    valores: 0,
    mensajes: 0,
    mensajesRecientes: 0,
    cuentas: 0,
    cuentasInactivas: 0,
  };
  if (!supabase) return vacios;

  const haceUnaSemana = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
  const contar = (tabla: "site_services" | "site_projects" | "site_values") =>
    supabase.from(tabla).select("id", { count: "exact", head: true });

  try {
    const [
      servicios,
      serviciosOcultos,
      proyectos,
      proyectosOcultos,
      valores,
      mensajes,
      mensajesRecientes,
      cuentas,
      cuentasInactivas,
    ] = await Promise.all([
      contar("site_services"),
      contar("site_services").eq("published", false),
      contar("site_projects"),
      contar("site_projects").eq("published", false),
      contar("site_values"),
      supabase.from("site_mensajes").select("id", { count: "exact", head: true }),
      supabase
        .from("site_mensajes")
        .select("id", { count: "exact", head: true })
        .gte("created_at", haceUnaSemana),
      supabase.from("profiles").select("id", { count: "exact", head: true }),
      supabase
        .from("profiles")
        .select("id", { count: "exact", head: true })
        .eq("active", false),
    ]);

    return {
      servicios: servicios.count ?? 0,
      serviciosOcultos: serviciosOcultos.count ?? 0,
      proyectos: proyectos.count ?? 0,
      proyectosOcultos: proyectosOcultos.count ?? 0,
      valores: valores.count ?? 0,
      mensajes: mensajes.count ?? 0,
      mensajesRecientes: mensajesRecientes.count ?? 0,
      cuentas: cuentas.count ?? 0,
      cuentasInactivas: cuentasInactivas.count ?? 0,
    };
  } catch {
    return vacios;
  }
}
