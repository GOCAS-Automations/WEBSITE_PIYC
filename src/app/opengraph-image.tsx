/**
 * IMAGEN OPENGRAPH DEL SITIO — 1200×630
 * =====================================
 * Se genera en el build con `ImageResponse` y los tokens de `src/lib/tokens.ts`
 * (ningún color escrito a mano). Al ser un archivo de convención de Next, se
 * aplica a todas las páginas que no declaren la suya.
 *
 * El logo se incrusta como data URI leído del disco: `ImageResponse` no
 * resuelve rutas relativas del sitio, y así la imagen no depende de que el
 * dominio esté en pie cuando un buscador la pida.
 *
 * Sin tipografía personalizada a propósito: cargar Barlow Condensed obligaría
 * a una descarga de red durante el build, que es justo lo que rompe los builds
 * en CI. La composición se sostiene con la retícula, el color y el logo.
 */

import { readFileSync } from "node:fs";
import { join } from "node:path";
import { ImageResponse } from "next/og";
import { colores } from "@/lib/tokens";

export const alt =
  "PIYC — Automatización industrial, tableros de control e ingeniería eléctrica en Cali";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Imagen() {
  // `ImageResponse` no rasteriza SVG con gradientes: aquí va el PNG grande
  // derivado del SVG, que además llega nítido al tamaño de la tarjeta.
  const logo = readFileSync(
    join(process.cwd(), "public", "brand", "logo-piyc-oscuro@2000.png"),
  );
  const logoDataUri = `data:image/png;base64,${logo.toString("base64")}`;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: colores.azul[950],
          // Retícula de plano, en el mismo paso de 40 px.
          backgroundImage: `linear-gradient(to right, ${colores.azul[800]} 1px, transparent 1px), linear-gradient(to bottom, ${colores.azul[800]} 1px, transparent 1px)`,
          backgroundSize: "40px 40px",
          padding: "64px 72px",
        }}
      >
        {/* Filete de acento arriba */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: 10,
            background: colores.verde[500],
            display: "flex",
          }}
        />

        <div style={{ display: "flex", alignItems: "center", gap: 28 }}>
          {/* eslint-disable-next-line @next/next/no-img-element -- ImageResponse no admite next/image. */}
          <img src={logoDataUri} alt="" width={330} height={140} />
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 16,
              fontSize: 22,
              letterSpacing: 4,
              textTransform: "uppercase",
              color: colores.acero[300],
              fontWeight: 600,
            }}
          >
            <div style={{ width: 16, height: 16, background: colores.verde[500], display: "flex" }} />
            Ingeniería eléctrica · Automatización · Control
          </div>

          <div
            style={{
              display: "flex",
              fontSize: 62,
              lineHeight: 1.08,
              fontWeight: 700,
              color: colores.blanco,
              maxWidth: 980,
            }}
          >
            Automatización industrial, tableros de control e ingeniería eléctrica
          </div>

          <div
            style={{
              display: "flex",
              borderLeft: `6px solid ${colores.azul[300]}`,
              paddingLeft: 20,
              fontSize: 30,
              color: colores.acero[200],
            }}
          >
            Tu socio confiable en soluciones industriales · Cali, Valle del Cauca
          </div>
        </div>
      </div>
    ),
    size,
  );
}
