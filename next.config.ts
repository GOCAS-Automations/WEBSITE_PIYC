import type { NextConfig } from "next";

const isDev = process.env.NODE_ENV === "development";

/**
 * ============================================================
 *  POLÍTICAS DE SEGURIDAD (cabeceras HTTP)
 * ============================================================
 *
 * Se aplican a TODAS las rutas desde `headers()`. Vercel ya emite y renueva el
 * certificado TLS; `Strict-Transport-Security` es lo que obliga al navegador a
 * no volver a hablar en HTTP con el dominio.
 *
 * ── Sobre la Content-Security-Policy ────────────────────────
 * Estricta en todo menos en `script-src`, que necesita `'unsafe-inline'`. El
 * motivo es arquitectónico, no un descuido:
 *
 *   · La alternativa recomendada (nonce + `'strict-dynamic'` generado en
 *     `proxy.ts`) **obliga a renderizado dinámico en todas las páginas**: el
 *     nonce se inyecta durante el SSR de cada petición, así que ISR y el
 *     prerenderizado estático quedan deshabilitados (documentado en
 *     `node_modules/next/dist/docs/01-app/02-guides/content-security-policy.md`).
 *   · El sitio público es deliberadamente estático + ISR (`revalidate = 300`)
 *     y no inyecta HTML de terceros ni contenido de usuarios sin escapar, que
 *     es el vector que un CSP estricto de scripts mitiga. Si algún día se
 *     necesita, la vía es aplicar nonce solo a `/admin` y `/mi-cuenta` (ya son
 *     `force-dynamic`) desde `proxy.ts`, dejando el sitio público estático.
 */

/**
 * Host de Supabase, derivado de `NEXT_PUBLIC_SUPABASE_URL` para no repetir el
 * proyecto a mano en la CSP. Si la variable no está presente en build (por
 * ejemplo en una previsualización sin configurar) cae a `*.supabase.co`.
 */
function obtenerHostSupabase(): string {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (url) {
    try {
      return new URL(url).hostname;
    } catch {
      // URL inválida: cae al respaldo de abajo.
    }
  }
  return "*.supabase.co";
}

const HOST_SUPABASE = obtenerHostSupabase();
const SUPABASE_HTTPS = `https://${HOST_SUPABASE}`;
const SUPABASE_WSS = `wss://${HOST_SUPABASE}`;

const contentSecurityPolicy = [
  "default-src 'self'",

  // Next.js emite scripts de arranque en línea (flight data, hidratación).
  // `'unsafe-eval'` solo en desarrollo (React lo usa para reconstruir stacks
  // de error); en producción no se permite.
  `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ""}`,
  "script-src-elem 'self' 'unsafe-inline'",

  // React escribe atributos `style` en línea.
  "style-src 'self' 'unsafe-inline'",
  "style-src-attr 'unsafe-inline'",

  // Imágenes propias, data:/blob: (previsualización de subidas en /admin), el
  // bucket público `site-images` de Supabase, Cloudinary (respaldo para URLs
  // externas permitidas) y las miniaturas del facade de YouTube sin cookies.
  `img-src 'self' data: blob: ${SUPABASE_HTTPS} https://res.cloudinary.com https://i.ytimg.com`,

  // next/font autoaloja las tipografías en /_next/static/media.
  "font-src 'self' data:",

  // Sesión, contenido y subida de imágenes a Supabase (incl. Realtime por wss).
  `connect-src 'self' ${SUPABASE_HTTPS} ${SUPABASE_WSS}${isDev ? " ws://localhost:* http://localhost:*" : ""}`,

  // Los dos embeds que el sitio usa: mapa de Google (dirección oficial de
  // Cali) y el facade de YouTube sin cookies.
  "frame-src https://www.youtube-nocookie.com https://www.google.com https://maps.google.com",

  "media-src 'self'",
  "worker-src 'self' blob:",
  "manifest-src 'self'",

  // Nadie puede meter este sitio en un iframe ajeno (anti-clickjacking).
  "frame-ancestors 'none'",
  "object-src 'none'",
  "base-uri 'self'",

  // El formulario de contacto no envía correo: registra el lead en
  // `site_mensajes` (server action con service-role) y el cliente abre
  // `wa.me` con el mensaje prearmado. El número destino sale siempre de
  // `site_settings`, nunca del payload.
  "form-action 'self' https://wa.me https://api.whatsapp.com",

  // Fuerza a https cualquier subrecurso que se colara por http. Solo en
  // producción: sobre `http://localhost` esta directiva rompe CSS/fuentes en
  // Safari, que no exime a localhost como sí hace Chromium.
  ...(isDev ? [] : ["upgrade-insecure-requests"]),
].join("; ");

const securityHeaders = [
  {
    // HSTS: 2 años para ESTE host. Deliberadamente SIN `includeSubDomains` ni
    // `preload`: el dominio vive en Google Workspace y no hay certeza de qué
    // subdominios usa (autodiscover, etc.). Forzar HTTPS ahí sin confirmarlo
    // podría afectar el correo corporativo de PIYC. Endurecer solo tras
    // verificar en hstspreload.org.
    key: "Strict-Transport-Security",
    value: "max-age=63072000",
  },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "X-DNS-Prefetch-Control", value: "on" },
  {
    // Respaldo para navegadores sin `frame-ancestors`.
    key: "X-Frame-Options",
    value: "DENY",
  },
  {
    // El sitio no necesita ninguna de estas capacidades del dispositivo.
    key: "Permissions-Policy",
    value: [
      "camera=()",
      "microphone=()",
      "geolocation=()",
      "payment=()",
      "usb=()",
      "midi=()",
      "magnetometer=()",
      "browsing-topics=()",
    ].join(", "),
  },
  { key: "Content-Security-Policy", value: contentSecurityPolicy },
];

const nextConfig: NextConfig = {
  // No anunciar la versión del framework.
  poweredByHeader: false,

  images: {
    /**
     * OPTIMIZADOR DE IMÁGENES: APAGADO GLOBALMENTE
     * =============================================
     * La cuenta Hobby de GOCAS en Vercel ya agotó su cupo de transformaciones
     * de imagen con GPI. Con el optimizador encendido, `/_next/image`
     * devolvería error y las fotos de PIYC se verían rotas. Con
     * `unoptimized` se sirven tal cual desde su origen: no hay cupo que
     * agotar. A cambio, TODA imagen debe subirse ya comprimida (WebP,
     * ≤ 1920 px, ≤ 400 KB) — no hay red de seguridad del optimizador.
     *
     * `remotePatterns` se conserva sin efecto hoy, por si el plan Pro se
     * activa algún día y el optimizador se reenciende.
     *
     * Esta lista y `HOSTS_IMAGEN_OPTIMIZABLES` de `src/lib/imagenes.ts` son
     * la misma lista escrita dos veces: SE TOCAN JUNTAS.
     */
    unoptimized: true,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
        pathname: "/**",
      },
    ],
  },

  async headers() {
    return [
      {
        // Todas las rutas, incluidos los assets estáticos.
        source: "/:path*",
        headers: securityHeaders,
      },
    ];
  },
};

export default nextConfig;
