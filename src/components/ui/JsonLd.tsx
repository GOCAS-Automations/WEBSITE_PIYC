/**
 * JsonLd — datos estructurados en el HTML.
 *
 * `JSON.stringify` puede producir `</script>` dentro de una cadena y cerrar la
 * etiqueta antes de tiempo (vector de inyección si el texto viene del panel).
 * Por eso se escapa `<`, `>` y `&` a su forma unicode: el JSON sigue siendo
 * válido y el navegador no ve ninguna etiqueta.
 *
 * La CSP permite scripts en línea (`'unsafe-inline'`, regla 10 de AGENTS.md:
 * el nonce obligaría a render dinámico y mataría el ISR), así que estos
 * bloques se sirven sin problema desde una página estática.
 */

const ESCAPES: Record<string, string> = {
  "<": "\\u003c",
  ">": "\\u003e",
  "&": "\\u0026",
};

export function JsonLd({ datos }: { datos: Record<string, unknown> | null }) {
  if (!datos) return null;

  const json = JSON.stringify(datos).replace(/[<>&]/g, (caracter) => ESCAPES[caracter]);

  return (
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: json }} />
  );
}
