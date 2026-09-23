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
| `SMTP_HOST` `SMTP_PORT` `SMTP_SECURE` `SMTP_USER` `SMTP_PASS` `CONTACT_FROM` `CONTACT_TO` | **Opcionales.** Aviso por correo de los mensajes del formulario. Sin ellas el formulario funciona igual, solo que sin correo. Ver la sección 4. |

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

## 4. Correo del formulario de contacto (opcional)

PIYC pidió que los mensajes del formulario **también lleguen por correo** a
`fabian.gaviria@piycsas.com`, además de quedar en el panel y de abrir WhatsApp.

El sitio ya trae todo hecho: envía por SMTP con `nodemailer`, después de
responderle al visitante. **Sin las variables cargadas no pasa nada** — el
formulario se comporta como siempre, no falla, no avisa y el correo simplemente
no sale. Encenderlo es cargar las variables y **volver a desplegar** (regla 11).

Hay que elegir **una** de las dos opciones. La A no cuesta nada si PIYC ya paga
Workspace; la B es la que aguanta volumen y da registro de entregas.

### Opción A — SMTP de Google Workspace (la más sencilla si ya existe la cuenta)

Sirve si `fabian.gaviria@piycsas.com` es una cuenta de Google Workspace de pago.
**No sirve con un Gmail gratuito con dominio propio ni con un alias.**

Lo que hay que conseguir, en orden:

1. La **cuenta de Workspace** desde la que va a salir el correo. Lo más limpio es
   una cuenta o alias tipo `web@piycsas.com` o `no-responder@piycsas.com`; si no,
   sirve la de Fabián. Hace falta **poder entrar a esa cuenta**.
2. **Verificación en dos pasos activada** en esa cuenta (*myaccount.google.com →
   Seguridad → Verificación en dos pasos*). Sin esto, el paso siguiente ni
   aparece: es el motivo más común de quedarse atascado aquí.
3. Una **contraseña de aplicación**: *myaccount.google.com → Seguridad →
   Contraseñas de aplicaciones* → nombre «Sitio PIYC» → copiar los **16
   caracteres** que muestra. Se ven una sola vez. **No es** la contraseña normal
   de la cuenta, y si el administrador de Workspace tiene bloqueadas las
   contraseñas de aplicación, hay que pedirle que las habilite.
4. Que el administrador de Workspace no tenga bloqueado el SMTP saliente
   (*Admin → Apps → Google Workspace → Gmail → Enrutamiento*). Por defecto está
   permitido.

Valores para Vercel:

| Variable | Valor |
| --- | --- |
| `SMTP_HOST` | `smtp.gmail.com` |
| `SMTP_PORT` | `587` |
| `SMTP_SECURE` | `false` |
| `SMTP_USER` | el correo completo de esa cuenta, p. ej. `web@piycsas.com` |
| `SMTP_PASS` | la contraseña de aplicación de 16 caracteres, sin espacios |
| `CONTACT_FROM` | `PIYC · Sitio web <web@piycsas.com>` (mismo buzón que `SMTP_USER`) |
| `CONTACT_TO` | `fabian.gaviria@piycsas.com` |

**DNS: no se toca nada.** Ni MX, ni SPF, ni DKIM, ni DMARC. El correo sale por el
propio Google, que ya está autorizado en los registros del dominio. Es la ventaja
de esta opción.

Límite: ~2.000 correos al día por cuenta. De sobra para un formulario.

### Opción B — Proveedor de envío (Resend o Brevo)

Conviene si no hay Workspace, si PIYC quiere ver el registro de qué correos
llegaron, o si el volumen crece.

Lo que hay que conseguir:

1. Una **cuenta** en [resend.com](https://resend.com) o [brevo.com](https://brevo.com).
   Los planes gratuitos (3.000 correos/mes en Resend, 300/día en Brevo) sobran.
2. **Verificar el dominio `piycsas.com`** dentro del panel del proveedor. Ahí está
   el único trabajo de verdad, porque **sí hay que agregar registros DNS**.
3. Las **credenciales SMTP** que el panel entrega al terminar (usuario y clave).

**Qué pasa con el DNS. Léalo antes de tocar nada:**

- **Los registros `MX` NO se tocan.** El correo que *recibe* PIYC sigue llegando
  igual. Estos proveedores solo envían.
- Se **agregan** dos o tres registros nuevos, que no existen hoy y no chocan con
  nada: un `TXT` de verificación y uno o dos `CNAME`/`TXT` de **DKIM** (Resend
  pide también un `MX` en un subdominio propio tipo `send.piycsas.com`, que es un
  registro aparte y **no** reemplaza el MX del dominio raíz).
- El **`SPF` sí se modifica, si ya existe**. Esta es la única línea delicada de
  todo el proceso. El dominio tiene hoy un `TXT` que empieza por `v=spf1`; hay que
  **añadirle** el mecanismo del proveedor dentro del mismo registro, no crear un
  segundo `TXT` de SPF (dos registros SPF invalidan los dos y el correo de PIYC
  empezaría a caer en spam). Queda así:

  ```
  Antes : v=spf1 include:_spf.google.com ~all
  Resend: v=spf1 include:_spf.google.com include:amazonses.com ~all
  Brevo : v=spf1 include:_spf.google.com include:spf.brevo.com ~all
  ```

  Si PIYC ya usa Workspace, ese `include:_spf.google.com` **se conserva**: se suma
  el nuevo, no se reemplaza. Si el dominio no tiene SPF todavía, se crea uno con
  solo el del proveedor.
- Si el dominio tiene `DMARC` en `p=reject`, el DKIM del paso 2 es obligatorio,
  no opcional: sin él los avisos rebotan.

Valores para Vercel:

| Variable | Resend | Brevo |
| --- | --- | --- |
| `SMTP_HOST` | `smtp.resend.com` | `smtp-relay.brevo.com` |
| `SMTP_PORT` | `587` | `587` |
| `SMTP_SECURE` | `false` | `false` |
| `SMTP_USER` | `resend` | el login que muestra el panel (un correo) |
| `SMTP_PASS` | la API key (`re_…`) | la *SMTP key* del panel |
| `CONTACT_FROM` | `PIYC · Sitio web <web@piycsas.com>` (del dominio verificado) | igual |
| `CONTACT_TO` | `fabian.gaviria@piycsas.com` | igual |

### En resumen, lo que hay que pedirle a PIYC

- **Opción A:** acceso a una cuenta de Workspace del dominio, con verificación en
  dos pasos, para sacar una contraseña de aplicación. Cero cambios de DNS.
- **Opción B:** cuenta en Resend o Brevo **y** acceso al DNS de `piycsas.com` para
  agregar los registros de verificación y DKIM y para **editar** el SPF existente.
  Los MX no se tocan en ningún caso.

### Al terminar

1. Cargar las variables en Vercel (*Production* y *Preview*).
2. **Redeploy.** Sin eso no se aplican.
3. Enviar un mensaje de prueba desde `/contacto` y comprobar que llega a
   `fabian.gaviria@piycsas.com`; si no llega, mirar *Vercel → Logs*, donde queda
   `[contacto] no se pudo enviar el aviso por correo: …` con el motivo.
4. Responder ese correo de prueba: la respuesta debe ir al correo del visitante
   (va en `Reply-To`), no al buzón del sitio.
5. Borrar de *Panel → Mensajes* la fila de prueba.

## 5. Buscadores

1. [Google Search Console](https://search.google.com/search-console): propiedad de **dominio** `piycsas.com`, verificada con un `TXT` en el DNS (se agrega, no reemplaza a ninguno).
2. *Sitemaps* → enviar `https://piycsas.com/sitemap.xml`.
3. *Inspección de URLs* → solicitar indexación de `/`, `/servicios` y `/contacto`.
4. [Prueba de resultados enriquecidos](https://search.google.com/test/rich-results) con `/`, una ficha de servicio (FAQ + migas) y un caso: sin errores. Es una consulta puntual por URL, no una auditoría en lote.
5. Google Business Profile: que la dirección coincida con la del sitio (Cl. 33 #5-76, Cali).

## 6. Comprobaciones poscarga (a mano, en el navegador)

- [ ] Cabeceras: en DevTools → *Network* → documento `/`, ver `Content-Security-Policy`, `Strict-Transport-Security`, `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, `Referrer-Policy`, `Permissions-Policy`. O `curl -sI https://piycsas.com` una vez.
- [ ] Consola sin errores ni avisos de CSP en `/`, `/nosotros`, `/contacto`.
- [ ] Formulario de `/contacto`: enviar un mensaje real → abre WhatsApp al +57 321 761 7958 con el texto armado y la fila aparece en *Panel → Mensajes*. Borrar esa fila después.
- [ ] Si el correo está encendido (sección 4): ese mismo mensaje llega a `fabian.gaviria@piycsas.com` en menos de un minuto, y al responderlo la respuesta va al visitante.
- [ ] Mapa de `/contacto` visible; fotos cargando desde el bucket.
- [ ] `/mi-cuenta`: ingresar con `admin`, abrir el panel, guardar un cambio pequeño y revertirlo (el botón no se queda en «Guardando…»).
- [ ] Un empleado no entra a `/admin`.
- [ ] `https://www.piycsas.com` y `http://piycsas.com` redirigen a `https://piycsas.com`.
- [ ] `/robots.txt` y `/sitemap.xml` muestran el dominio final, no `localhost` ni `*.vercel.app`.

## 7. Después

- Cualquier cambio de contenido se hace desde el panel; se ve en el sitio en ≤ 5 minutos (ISR).
- Si el sitio público muestra textos viejos tras un cambio de variables, falta el *Redeploy*.
