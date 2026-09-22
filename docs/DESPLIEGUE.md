# Despliegue en Vercel — piycsas.com

Pasos para publicar el sitio. **Ninguna auditoría automatizada (Lighthouse, axe,
CDP, capturas en lote) contra producción**: ya provocó un bloqueo del firewall de
Vercel. Todo eso se corre contra `localhost` con `npm run build && npx next start`.

## 1. Proyecto en Vercel

1. *Add New → Project → Import Git Repository* → `GOCAS-Automations/WEBSITE_PIYC`, rama `main`.
2. Framework: **Next.js** (lo detecta solo). Build `npm run build`, salida por defecto, Node 20 o superior.
3. Antes del primer despliegue, en *Settings → Environment Variables* (Production y Preview):

| Variable | Propósito |
| --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | URL del proyecto de Supabase. Pública. |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Clave anónima. Pública: la protege la RLS. |
| `SUPABASE_SERVICE_ROLE_KEY` | Clave de servicio. **Solo servidor**, nunca con prefijo `NEXT_PUBLIC_`. Registra los mensajes del formulario y completa los datos del equipo. |
| `NEXT_PUBLIC_SITE_URL` | `https://piycsas.com`, sin barra final. Alimenta `metadataBase`, canónicas, sitemap y OpenGraph. |
| `CONTACT_IP_SALT` | Cadena aleatoria larga (≥ 32 caracteres). Sal del hash de IP del tope de envíos del formulario. |

- `SUPABASE_ACCESS_TOKEN` **NO va en Vercel**: es un token personal para la CLI, vence y no lo usa el sitio.
- Cambiar o agregar una variable **no basta: hay que volver a desplegar** (*Deployments → ⋯ → Redeploy*). Las páginas estáticas deciden en el build.

## 2. Dominio `piycsas.com`

1. *Settings → Domains* → agregar `piycsas.com` y `www.piycsas.com` (este redirige al primero).
2. En el DNS del registrador crear **solo** lo que Vercel muestre en esa pantalla. Lo habitual:
   - `A` · `@` → `76.76.21.21`
   - `CNAME` · `www` → `cname.vercel-dns.com`
3. **No tocar** los registros de Google Workspace: `MX`, el `TXT` de SPF (`v=spf1 include:_spf.google.com ~all`), el `TXT` de DKIM (`google._domainkey`) ni el de DMARC. Si ya existe un `A` en `@` apuntando a otro sitio, se reemplaza solo ese.
4. Esperar el certificado (candado verde en *Domains*) antes de anunciar el sitio.

## 3. Supabase

1. *Authentication → URL Configuration*: **Site URL** = `https://piycsas.com`; **Redirect URLs** = `https://piycsas.com/**` (y la URL `*.vercel.app` del proyecto si se usará para revisar).
2. Cuentas: cada persona cambia su contraseña provisional en «Mi cuenta → Cambiar mi contraseña» (mínimo 10 caracteres) antes de la entrega.
3. Borrar `coordinador.prueba` y `empleado.prueba` desde el panel: *Equipo → abrir la ficha → Eliminar* (doble confirmación). Comprobar que no dejan jornadas.

## 4. Buscadores

1. [Google Search Console](https://search.google.com/search-console): propiedad de **dominio** `piycsas.com`, verificada con un `TXT` en el DNS (se agrega, no reemplaza a ninguno).
2. *Sitemaps* → enviar `https://piycsas.com/sitemap.xml`.
3. *Inspección de URLs* → solicitar indexación de `/`, `/servicios` y `/contacto`.
4. [Prueba de resultados enriquecidos](https://search.google.com/test/rich-results) con `/`, una ficha de servicio (FAQ + migas) y un caso: sin errores. Es una consulta puntual por URL, no una auditoría en lote.
5. Google Business Profile: que la dirección coincida con la del sitio (Cl. 33 #5-76, Cali).

## 5. Comprobaciones poscarga (a mano, en el navegador)

- [ ] Cabeceras: en DevTools → *Network* → documento `/`, ver `Content-Security-Policy`, `Strict-Transport-Security`, `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, `Referrer-Policy`, `Permissions-Policy`. O `curl -sI https://piycsas.com` una vez.
- [ ] Consola sin errores ni avisos de CSP en `/`, `/nosotros`, `/contacto`.
- [ ] Formulario de `/contacto`: enviar un mensaje real → abre WhatsApp al +57 321 761 7958 con el texto armado y la fila aparece en *Panel → Mensajes*. Borrar esa fila después.
- [ ] Mapa de `/contacto` visible; fotos cargando desde el bucket.
- [ ] `/mi-cuenta`: ingresar con `admin`, abrir el panel, guardar un cambio pequeño y revertirlo (el botón no se queda en «Guardando…»).
- [ ] Un empleado no entra a `/admin`.
- [ ] `https://www.piycsas.com` y `http://piycsas.com` redirigen a `https://piycsas.com`.
- [ ] `/robots.txt` y `/sitemap.xml` muestran el dominio final, no `localhost` ni `*.vercel.app`.

## 6. Después

- Cualquier cambio de contenido se hace desde el panel; se ve en el sitio en ≤ 5 minutos (ISR).
- Si el sitio público muestra textos viejos tras un cambio de variables, falta el *Redeploy*.
