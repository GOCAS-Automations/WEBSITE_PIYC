/**
 * SEO — METADATA Y DATOS ESTRUCTURADOS
 * ====================================
 * Módulo puro (sin React). Arma los objetos `Metadata` de Next y los bloques
 * JSON-LD del sitio a partir de la capa de contenido, para que nada de esto se
 * escriba dos veces en las páginas.
 *
 * Reglas que aplica:
 *  - `alternates.canonical` en todas las páginas (ruta relativa: `metadataBase`
 *    del layout raíz la resuelve).
 *  - `title` ≤ 60 caracteres y `description` ≤ 155 (se recortan por palabra).
 *  - OpenGraph y Twitter Card con la imagen 1200×630 del sitio.
 *  - JSON-LD: `Organization` + `LocalBusiness` + `WebSite` en el layout del
 *    sitio, `Service` en cada servicio, `BreadcrumbList` en las internas.
 *  - **Nada inventado**: horario y coordenadas solo se emiten si están en
 *    `site_settings.contact`. Una dirección a medias es peor que ninguna.
 */

import type { Metadata } from "next";
import type { AjustesContact, MetadatosPagina } from "@/lib/content-types";

/**
 * 53 y no 60: el layout raíz le agrega el sufijo « | PIYC» (7 caracteres) a
 * todas las páginas menos al inicio, que usa `title.absolute`. Así el título
 * que ve Google queda en 60 contando el sufijo.
 */
export const LARGO_MAXIMO_TITULO = 53;
export const LARGO_MAXIMO_DESCRIPCION = 155;

/** URL base del sitio, sin barra final. */
export function urlSitio(): string {
  const url = process.env.NEXT_PUBLIC_SITE_URL || "https://piycsas.com";
  return url.replace(/\/+$/, "");
}

/** URL absoluta a partir de una ruta del sitio. */
export function urlAbsoluta(ruta: string): string {
  return `${urlSitio()}${ruta.startsWith("/") ? ruta : `/${ruta}`}`;
}

/** Recorta por palabra y cierra con «…» solo si hubo que recortar. */
export function recortar(texto: string, maximo: number): string {
  const limpio = texto.replace(/\s+/g, " ").trim();
  if (limpio.length <= maximo) return limpio;
  const corte = limpio.slice(0, maximo - 1);
  const ultimoEspacio = corte.lastIndexOf(" ");
  return `${(ultimoEspacio > maximo * 0.6 ? corte.slice(0, ultimoEspacio) : corte).trim()}…`;
}

/* ===================================================================== */
/* Metadata                                                               */
/* ===================================================================== */

type OpcionesMetadata = {
  /** Título de la pestaña. El layout raíz le agrega « | PIYC». */
  titulo: string;
  descripcion: string;
  /** Ruta del sitio: `/servicios/telemetria`. */
  ruta: string;
  /** Imagen OG propia. Si falta, se usa la del sitio (`/opengraph-image`). */
  imagen?: string;
  /** `article` para las páginas de detalle; `website` para el resto. */
  tipo?: "website" | "article";
};

/** Arma la `Metadata` de una página con canonical, OG y Twitter Card. */
export function metadataDePagina({
  titulo,
  descripcion,
  ruta,
  imagen,
  tipo = "website",
}: OpcionesMetadata): Metadata {
  const title = recortar(titulo, LARGO_MAXIMO_TITULO);
  const description = recortar(descripcion, LARGO_MAXIMO_DESCRIPCION);
  const images = imagen ? [{ url: imagen }] : undefined;

  return {
    title,
    description,
    alternates: { canonical: ruta },
    openGraph: {
      type: tipo,
      url: ruta,
      title,
      description,
      ...(images ? { images } : {}),
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      ...(images ? { images } : {}),
    },
  };
}

/** Mezcla los metadatos de `site_settings.seo` con los de respaldo. */
export function metadatosPagina(
  desdeAjustes: MetadatosPagina | undefined,
  respaldo: { titulo: string; descripcion: string },
): { titulo: string; descripcion: string; imagen?: string } {
  return {
    titulo: desdeAjustes?.title?.trim() || respaldo.titulo,
    descripcion: desdeAjustes?.description?.trim() || respaldo.descripcion,
    imagen: desdeAjustes?.ogImage?.trim() || undefined,
  };
}

/* ===================================================================== */
/* JSON-LD                                                                */
/* ===================================================================== */

/** Un bloque JSON-LD ya listo para serializar. */
export type BloqueJsonLd = Record<string, unknown>;

const ID_ORGANIZACION = "#organizacion";
const ID_SITIO = "#sitio";

function telefonosDe(contacto: AjustesContact): string[] {
  const numeros = [
    ...(contacto.phones ?? []).map((telefono) => telefono.intl),
    ...(contacto.whatsapp ?? []).map((numero) => numero.intl),
  ]
    .map((intl) => (intl ? `+${intl.replace(/\D/g, "")}` : ""))
    .filter((intl) => intl.length > 3);

  return [...new Set(numeros)];
}

function direccionPostal(contacto: AjustesContact): BloqueJsonLd | null {
  const direccion = contacto.address;
  if (!direccion?.street || !direccion.city) return null;
  return {
    "@type": "PostalAddress",
    streetAddress: direccion.street,
    addressLocality: direccion.city,
    ...(direccion.region ? { addressRegion: direccion.region } : {}),
    addressCountry: "CO",
  };
}

/** Los siete días, en el orden de schema.org y con la abreviatura que usa `openingHours`. */
const DIAS_SCHEMA = [
  ["Mo", "Monday"],
  ["Tu", "Tuesday"],
  ["We", "Wednesday"],
  ["Th", "Thursday"],
  ["Fr", "Friday"],
  ["Sa", "Saturday"],
  ["Su", "Sunday"],
] as const;

/**
 * `["Mo-Fr 08:00-17:00"]` → un `OpeningHoursSpecification` por tramo, que es la
 * forma que documenta Google para `LocalBusiness`. Un día que no aparece en
 * ningún tramo es un día cerrado: no se emite nada para él.
 *
 * Un tramo mal escrito se ignora en silencio en vez de romper la página: el
 * panel ya lo valida al guardar (`guardarContacto`), y un JSON-LD sin horario
 * es mucho menos grave que un sitio caído.
 */
function horarioEspecificado(contacto: AjustesContact): BloqueJsonLd[] {
  const tramos = contacto.horario?.schema ?? [];
  const salida: BloqueJsonLd[] = [];

  for (const tramo of tramos) {
    const partes = /^([A-Za-z]{2})(?:-([A-Za-z]{2}))? (\d{2}:\d{2})-(\d{2}:\d{2})$/.exec(
      tramo.trim(),
    );
    if (!partes) continue;

    const [, desde, hasta, abre, cierra] = partes;
    const inicio = DIAS_SCHEMA.findIndex(([corto]) => corto === desde);
    if (inicio < 0) continue;
    const fin = hasta ? DIAS_SCHEMA.findIndex(([corto]) => corto === hasta) : inicio;
    if (fin < inicio) continue;

    salida.push({
      "@type": "OpeningHoursSpecification",
      dayOfWeek: DIAS_SCHEMA.slice(inicio, fin + 1).map(([, largo]) => largo),
      opens: abre,
      closes: cierra,
    });
  }

  return salida;
}

function perfilesSociales(contacto: AjustesContact): string[] {
  return Object.values(contacto.social ?? {}).filter(
    (url): url is string => typeof url === "string" && url.startsWith("http"),
  );
}

/**
 * `Organization` + `LocalBusiness` + `WebSite`, los tres del layout del sitio.
 * `LocalBusiness` solo se emite si hay dirección completa.
 */
export function jsonLdSitio(contacto: AjustesContact): BloqueJsonLd {
  const base = urlSitio();
  const telefonos = telefonosDe(contacto);
  const direccion = direccionPostal(contacto);
  const sameAs = perfilesSociales(contacto);
  const correo = contacto.emails?.[0]?.address;
  const horarios = horarioEspecificado(contacto);
  const logo = `${base}/brand/logo-piyc.png`;

  const organizacion: BloqueJsonLd = {
    "@type": "Organization",
    "@id": `${base}/${ID_ORGANIZACION}`,
    name: contacto.companyName ?? "PIYC",
    legalName: contacto.legalName,
    url: base,
    logo,
    image: logo,
    ...(contacto.tagline ? { slogan: contacto.tagline } : {}),
    ...(contacto.nit ? { taxID: contacto.nit } : {}),
    ...(telefonos.length ? { telephone: telefonos[0] } : {}),
    ...(correo ? { email: correo } : {}),
    ...(direccion ? { address: direccion } : {}),
    ...(sameAs.length ? { sameAs } : {}),
  };

  const bloques: BloqueJsonLd[] = [organizacion];

  // LocalBusiness: solo con dirección completa. El horario sale de la ficha de
  // Google del negocio; `geo` sigue sin confirmar y por eso no se emite.
  if (direccion) {
    bloques.push({
      "@type": "ElectricalContractor",
      "@id": `${base}/#negocio`,
      name: contacto.companyName ?? "PIYC",
      url: base,
      image: logo,
      parentOrganization: { "@id": `${base}/${ID_ORGANIZACION}` },
      address: direccion,
      ...(telefonos.length ? { telephone: telefonos[0] } : {}),
      ...(correo ? { email: correo } : {}),
      ...(contacto.geo
        ? {
            geo: {
              "@type": "GeoCoordinates",
              latitude: contacto.geo.lat,
              longitude: contacto.geo.lng,
            },
          }
        : {}),
      ...(horarios.length ? { openingHoursSpecification: horarios } : {}),
      areaServed: { "@type": "AdministrativeArea", name: "Valle del Cauca, Colombia" },
    });
  }

  bloques.push({
    "@type": "WebSite",
    "@id": `${base}/${ID_SITIO}`,
    url: base,
    name: contacto.companyName ?? "PIYC",
    inLanguage: "es-CO",
    publisher: { "@id": `${base}/${ID_ORGANIZACION}` },
  });

  return { "@context": "https://schema.org", "@graph": bloques };
}

/** `Service` de una página de servicio. */
export function jsonLdServicio(opciones: {
  nombre: string;
  descripcion: string;
  ruta: string;
  contacto: AjustesContact;
  alcances?: string[];
}): BloqueJsonLd {
  const base = urlSitio();
  const { nombre, descripcion, ruta, contacto, alcances = [] } = opciones;

  return {
    "@context": "https://schema.org",
    "@type": "Service",
    name: nombre,
    description: recortar(descripcion, 300),
    url: urlAbsoluta(ruta),
    serviceType: nombre,
    provider: { "@id": `${base}/${ID_ORGANIZACION}` },
    areaServed: { "@type": "AdministrativeArea", name: "Valle del Cauca, Colombia" },
    ...(contacto.address?.city ? { availableChannel: { "@type": "ServiceChannel", serviceUrl: urlAbsoluta("/contacto") } } : {}),
    ...(alcances.length
      ? {
          hasOfferCatalog: {
            "@type": "OfferCatalog",
            name: `Alcances de ${nombre}`,
            itemListElement: alcances.map((alcance) => ({
              "@type": "Offer",
              itemOffered: { "@type": "Service", name: alcance },
            })),
          },
        }
      : {}),
  };
}

/** Una miga: etiqueta + ruta. La última no lleva enlace en la interfaz. */
export type Miga = { etiqueta: string; href: string };

/** `BreadcrumbList` de una página interna. */
export function jsonLdMigas(migas: readonly Miga[]): BloqueJsonLd {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: migas.map((miga, indice) => ({
      "@type": "ListItem",
      position: indice + 1,
      name: miga.etiqueta,
      item: urlAbsoluta(miga.href),
    })),
  };
}

/** `FAQPage` a partir de las preguntas frecuentes de una página. */
export function jsonLdFaq(
  preguntas: readonly { pregunta: string; respuesta: string }[],
): BloqueJsonLd | null {
  if (preguntas.length === 0) return null;
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: preguntas.map(({ pregunta, respuesta }) => ({
      "@type": "Question",
      name: pregunta,
      acceptedAnswer: { "@type": "Answer", text: respuesta },
    })),
  };
}
