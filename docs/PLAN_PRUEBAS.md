# Plan de pruebas — `website_PIYC`

Checklist de QA reutilizable. Se corre entero antes de cada entrega y, recortado,
antes de cada despliegue grande. Los criterios de aceptación del contrato están
en `docs/PLAN_INICIAL_PIYC.md` §13; aquí está **cómo** se verifica cada uno.

**Última pasada: 21 de septiembre de 2026** (Next 16.3.5, build de producción
servido con `npx next start -p 3500`). Resultado de esa pasada anotado en cada
punto.

---

## 0. Regla que no se negocia

**Toda herramienta automatizada —Lighthouse, Puppeteer, `curl` en bucle, axe—
corre SOLO contra `localhost`.** Nunca contra `piycsas.com` ni contra una URL de
previsualización de Vercel: el tráfico anómalo ya provocó un bloqueo del
firewall de Vercel en otro proyecto de GOCAS.

## 1. Cómo montar el entorno de prueba

```bash
npm run build          # tiene que terminar sin warnings
npx next start -p 3500 # 3500 y no 3000: deja libre el de desarrollo
```

Las herramientas de auditoría viven fuera del repo, en
`C:/Users/cesar/AppData/Local/Temp/claude/piyc-tools` (`puppeteer-core`,
`lighthouse`, `axe-core`). **Nunca se instalan en el proyecto.** El navegador es
Edge: `C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe`
(`CHROME_PATH` para Lighthouse).

Al terminar, apagar el servidor del puerto 3500.

---

## 2. Rutas públicas

| # | Qué se comprueba | Cómo | 21-sep-2026 |
| --- | --- | --- | --- |
| 2.1 | Las 7 rutas responden 200 en escritorio (1440 px) y móvil (390 px) | Puppeteer contra `/`, `/nosotros`, `/servicios`, `/servicios/[slug]`, `/proyectos`, `/proyectos/[slug]`, `/contacto` | Cumple |
| 2.2 | Sin errores de consola ni violaciones de CSP | Escuchar `console`, `pageerror` y `requestfailed`. **Ignorar** los `ERR_ABORTED` de peticiones `?_rsc=`: son prefetch cancelados de Next, no errores | Cumple |
| 2.3 | Un solo `<h1>` por página y que diga algo | Contar `h1` en el DOM renderizado | Cumple |
| 2.4 | Jerarquía de encabezados sin saltos (`h2` → `h4` prohibido) | Recorrer `h1..h6` en orden de documento | Cumple |
| 2.5 | Ningún `h2` repite literalmente el `h1` | Comparar cadenas | Cumple — antes fallaba en `/servicios/telemetria`, `/telecontrol`, `/aplicaciones-industriales` y `/aires-acondicionados`, donde `title` y `navTitle` son la misma cadena |
| 2.6 | `alt` en toda imagen, y `width`/`height` en toda imagen | Recorrer `img` | Cumple |
| 2.7 | Sin scroll horizontal a 390 px | `scrollWidth > innerWidth` | Cumple |
| 2.8 | Ningún enlace interno da 404 | Recolectar todos los `href` internos de las 7 rutas y pedirlos uno a uno | Cumple — 20 URL, todas 200; una ruta inventada da 404 |

## 3. SEO

| # | Qué se comprueba | Cómo | 21-sep-2026 |
| --- | --- | --- | --- |
| 3.1 | `sitemap.xml` lista todas las URL reales y ninguna de más | `curl /sitemap.xml` y comparar con los slugs publicados | Cumple — 20 URL: 5 fijas + 9 servicios + 6 proyectos |
| 3.2 | `robots.txt` bloquea `/admin`, `/mi-cuenta` y `/api`, y apunta al sitemap | `curl /robots.txt` | Cumple |
| 3.3 | `/admin` y `/mi-cuenta` con `noindex, nofollow` | `curl` y buscar `<meta name="robots">` | Cumple |
| 3.4 | `canonical` y OpenGraph en las 7 rutas | Leer `link[rel=canonical]` y `meta[property^=og:]` | Cumple |
| 3.5 | `lang="es-CO"` | Leer `documentElement.lang` | Cumple |
| 3.6 | JSON-LD sintácticamente válido | `JSON.parse` de cada `script[type="application/ld+json"]` | Cumple |
| 3.7 | JSON-LD coherente con los datos oficiales | Revisar a ojo el `@graph`: razón social, NIT, dirección de Google, WhatsApp principal, correo visible, Instagram | Cumple — `Organization` + `ElectricalContractor` + `WebSite` en el layout, `BreadcrumbList` y `Service` en las internas, `FAQPage` donde hay preguntas. `openingHours` y `geo` **no se emiten** porque PIYC no los ha confirmado: eso es lo correcto, no un hueco |
| 3.8 | Sin «clic aquí» ni texto de enlace vacío | Revisión manual del texto de los enlaces | Cumple |

**Pendiente de producción (no verificable en local):** validar el JSON-LD en la
herramienta de resultados enriquecidos de Google, dar de alta el sitio en Search
Console y enviar el sitemap.

## 4. Cabeceras de seguridad

Se piden con `curl -D - -o /dev/null http://localhost:3500/`. Las siete tienen
que estar:

`Strict-Transport-Security` · `X-Content-Type-Options` · `Referrer-Policy` ·
`X-Frame-Options` · `Permissions-Policy` · `Content-Security-Policy` ·
`X-DNS-Prefetch-Control`

**21-sep-2026: cumple, las siete.** `script-src` lleva `'unsafe-inline'` a
propósito (regla 10 de `AGENTS.md`: el nonce obliga a renderizado dinámico y
mata el ISR); el resto de la política va estricta, con `frame-ancestors 'none'`,
`object-src 'none'` y `form-action` limitado a `'self'`, `wa.me` y
`api.whatsapp.com`.

## 5. Lighthouse

Cinco páginas representativas, móvil y escritorio, contra `localhost:3500`.
Metas: **rendimiento ≥ 90 · accesibilidad ≥ 95 · buenas prácticas ≥ 95 ·
SEO 100**.

Los números de rendimiento oscilan ±5 puntos entre corridas según lo que esté
haciendo la máquina. Si una página baja de 90, **repetir la medición con el
equipo en reposo** antes de dar por bueno el hallazgo: en esta pasada
`/proyectos/pasteurizador-alival` marcó 84 en una corrida con otro navegador
trabajando en paralelo y 93 al repetirla sola.

### Antes de las correcciones

| Preset | Ruta | Rend. | Acc. | B.P. | SEO |
| --- | --- | --- | --- | --- | --- |
| móvil | `/` | 95 | 96 | 100 | 100 |
| móvil | `/servicios` | 94 | 96 | 100 | 100 |
| móvil | `/servicios/telemetria` | 93 | 96 | 100 | 100 |
| móvil | `/proyectos/pasteurizador-alival` | 94 | 96 | 100 | 100 |
| móvil | `/contacto` | 95 | **91** | 100 | 100 |
| escritorio | `/` | 100 | 96 | 100 | 100 |
| escritorio | `/servicios` | 100 | 96 | 100 | 100 |
| escritorio | `/servicios/telemetria` | 99 | 96 | 100 | 100 |
| escritorio | `/proyectos/pasteurizador-alival` | 99 | 96 | 100 | 100 |
| escritorio | `/contacto` | 100 | **91** | 100 | 100 |

### Después

| Preset | Ruta | Rend. | Acc. | B.P. | SEO | LCP | CLS |
| --- | --- | --- | --- | --- | --- | --- | --- |
| móvil | `/` | 98 | 100 | 100 | 100 | 2,3 s | 0 |
| móvil | `/servicios` | 94 | 100 | 100 | 100 | 3,1 s | 0 |
| móvil | `/servicios/telemetria` | 90 | 100 | 100 | 100 | 3,6 s | 0 |
| móvil | `/proyectos/pasteurizador-alival` | 93 | 100 | 100 | 100 | 3,3 s | 0 |
| móvil | `/contacto` | 94 | 100 | 100 | 100 | 3,1 s | 0 |
| escritorio | `/` | 100 | 100 | 100 | 100 | 0,6 s | 0 |
| escritorio | `/servicios` | 100 | 100 | 100 | 100 | 0,7 s | 0 |
| escritorio | `/servicios/telemetria` | 100 | 100 | 100 | 100 | 0,7 s | 0 |
| escritorio | `/proyectos/pasteurizador-alival` | 98 | 100 | 100 | 100 | 1,1 s | 0 |
| escritorio | `/contacto` | 100 | 100 | 100 | 100 | 0,7 s | 0 |

Las dos rutas que faltaban para cubrir las siete, medidas aparte:

| Preset | Ruta | Rend. | Acc. | B.P. | SEO | LCP | CLS |
| --- | --- | --- | --- | --- | --- | --- | --- |
| móvil | `/nosotros` | 91 | 100 | 100 | 100 | 3,5 s | 0 |
| móvil | `/proyectos` | 93 | 100 | 100 | 100 | 3,3 s | 0 |
| escritorio | `/nosotros` | 100 | 100 | 100 | 100 | 0,7 s | 0 |
| escritorio | `/proyectos` | 100 | 100 | 100 | 100 | 0,8 s | 0 |

**CLS 0 en las catorce medidas** (toda imagen lleva `width`/`height`). El LCP móvil
está en 2,3–3,6 s con la red 4G simulada de Lighthouse; el presupuesto del plan
(< 2,5 s) se cumple en el inicio y se pasa por poco en las internas, donde el
LCP es la foto de cabecera servida desde el bucket de Supabase **sin
optimizador** (regla de `docs/PLAN_INICIAL_PIYC.md` §9). En producción, con la
CDN de Vercel y el bucket cacheado, el número mejora; medirlo de nuevo con datos
de campo antes de tocar nada.

## 6. Accesibilidad

### 6.1 Automática — axe-core

Se inyecta `axe-core` en las 7 rutas × 2 anchos con las etiquetas `wcag2a`,
`wcag2aa`, `wcag21a`, `wcag21aa` y `best-practice`. **Meta: cero violaciones.**

**21-sep-2026: 0 violaciones** (antes: 40 nodos — contraste, listas de
definición mal formadas y contenido fuera de landmarks).

### 6.2 Manual — teclado y movimiento

| Qué | Cómo | 21-sep-2026 |
| --- | --- | --- |
| Menú móvil | Llegar al botón con Tab, abrir con Enter, tabular dentro, cerrar con Escape | Cumple: `aria-expanded` cambia, Escape cierra y devuelve el foco al botón |
| `aria-current` | El enlace de la sección actual lo lleva, en escritorio y en el menú móvil | Cumple |
| Galería | Enter abre el visor, ← → cambian de foto, Inicio/Fin van a los extremos, Escape cierra y devuelve el foco a la miniatura | Cumple; el visor es `<dialog>` modal, así que el foco queda atrapado de fábrica |
| Preguntas frecuentes | `<details>`/`<summary>` nativos: Enter y Espacio alternan | Cumple |
| Formulario de contacto | Cada campo con su `<label for>`; los errores del servidor llegan con `aria-invalid` + `aria-describedby` apuntando al `<p id="error-…">`; el bloque de resultado es `aria-live="polite"` y recibe el foco | Cumple |
| Foco visible | Tabular por el sitio y mirar el contorno | Cumple: 2 px `azul-700` sobre claro y `verde-400` dentro de `.sobre-oscuro`. Ojo al medir con script: `transition-colors` anima `outline-color`, hay que esperar ~300 ms o se lee el color de partida |
| `prefers-reduced-motion` | Emular `reduce` y comprobar que las animaciones se apagan | Cumple: `animation-duration` ~0 con una sola iteración, `scroll-behavior: auto` |

## 7. Marca, imágenes y alcance

| # | Qué se comprueba | Cómo | 21-sep-2026 |
| --- | --- | --- | --- |
| 7.1 | Ningún color escrito a mano fuera de `tokens.ts` / `globals.css` | `grep -rE "#[0-9a-fA-F]{3,8}"`, `rgb(`, `hsl(`, y clases `bg-[#…]`/`text-[#…]` sobre `src/` | Cumple: cero ocurrencias fuera de los dos archivos de tokens y de `opengraph-image.tsx` |
| 7.2 | Nada pesado servido desde `public/` | `ls -l public/**` | Cumple: solo los dos logos, 23 KB y 22 KB |
| 7.3 | Ninguna imagen del bucket supera 400 KB | Revisar el bucket `site-images` | Cumple (≤ 81 KB, verificado aparte) |
| 7.4 | `ContentImage` para toda imagen de contenido; `next/image` solo para el chrome | `grep "from \"next/image\""` | Cumple: solo en `Encabezado`, `PieDePagina` y `mi-cuenta` (logos) |
| 7.5 | En la base de datos nunca van rutas `/images/` | `grep "\"/images/"` sobre `src/data` y `src/lib` | Cumple |
| 7.6 | `images.remotePatterns` y `HOSTS_IMAGEN_OPTIMIZABLES` dicen lo mismo | Comparar `next.config.ts` con `src/lib/imagenes.ts` | Cumple: `**.supabase.co/storage/v1/object/public/**` y `res.cloudinary.com` en ambos |
| 7.7 | Sin rastro de lo que está fuera de alcance | `grep -i "nomina\|volante\|desprendible\|recharts"` | Cumple: cero. Los aciertos de «calendario» son el calendario laboral mensual de `horarios_mensuales`, que sí está en alcance |

## 8. Seguridad

| # | Qué se comprueba | Cómo | 21-sep-2026 |
| --- | --- | --- | --- |
| 8.1 | La clave service-role no llega al cliente | Buscar `SUPABASE_SERVICE_ROLE_KEY` en `src/` y seguir quién importa `lib/supabase/admin.ts`; ninguno puede ser `"use client"` ni ser importado desde uno | Cumple: la variable aparece en 2 módulos de servidor, sin prefijo `NEXT_PUBLIC_`; ninguno de los 22 módulos `"use client"` la alcanza ni directa ni transitivamente |
| 8.2 | Toda server action valida el rol en el servidor | Leer cada `actions.ts`: la primera línea tiene que ser `getContentEditorOrNull()`, `getManagerOrNull()` o `getActiveSession()` | Cumple |
| 8.3 | Los route handlers también | `/admin/jornadas/exportar` exige manager y responde 403; `/api/contacto` es público a propósito | Cumple |
| 8.4 | Ninguna acción confía en un rol o un id del `FormData` | Buscar `formData.get("role")`, `("id")`, `("employee_id")` y ver que siempre se revalidan contra la fila real | Cumple |
| 8.5 | Nadie escala privilegios | Con `coordinador`, intentar crear un admin y editar la cuenta `admin` | Ver §9 |
| 8.6 | Nadie aprueba su propia jornada | Con `coordinador`, crearse una jornada y darle aprobar | Ver §9 — antes se podía; ahora la acción lo rechaza |
| 8.7 | `/api/contacto` no acepta el número destino del payload | `POST` con campos `whatsapp`/`destino`/`to` inventados y ver qué número devuelve | Cumple: devolvió siempre el oficial de `site_settings`; el tipo `PayloadContacto` ni siquiera tiene campo de destino |
| 8.8 | Antispam | Cuatro `POST` a `/api/contacto`: con honeypot lleno, con `transcurridoMs` < 3000, con un cuerpo de 40 KB y uno normal | Cumple: honeypot → 200 mudo sin guardar; < 3 s → 429; 40 KB → 413; normal → guarda una fila. Reservas en §10 |
| 8.9 | `dangerouslySetInnerHTML` solo en `JsonLd.tsx`, y con escape | `grep` | Cumple |
| 8.10 | Sin redirecciones abiertas | Revisar cada `redirect()` y `router.replace()` | Cumple: todos literales; el proxy borra el query string antes de redirigir |

## 9. Panel, portal y jornadas

Se prueban contra el build de producción con las tres cuentas de
`material/credenciales-iniciales.txt` (**el archivo no está en el repo y las
contraseñas no se escriben en ningún reporte**).

| # | Qué se comprueba | 21-sep-2026 |
| --- | --- | --- |
| 9.1 | Ingreso de los tres roles por usuario (no por correo) | Cumple: los tres entran |
| 9.2 | `empleado` no ve «Ir al panel» y `/admin` lo rebota | Cumple: sin enlace al panel y `/admin` devuelve a `/mi-cuenta` |
| 9.3 | `coordinador` no puede crear ni eliminar administradores | Cumple: en `/admin/equipo/nueva` el desplegable de rol solo ofrece `coordinador` y `empleado` (el `admin` lo ve con los tres), y abrir la ficha de la cuenta `admin` como coordinador rebota a `/admin/equipo` |
| 9.4 | Guardar un ajuste desde el panel se refleja en el sitio público (el botón nunca se queda en «Guardando…») | Cumple: se cambió el rótulo del hero, apareció en la portada y volvió a su valor original («Ingeniería eléctrica · Automatización · Control»). Sin botones colgados |
| 9.5 | Jornada de punta a punta: empleado registra → manager aprueba → desglose congelado | Cumple: `empleado.prueba` registró una jornada de 8:00 a 17:00, `coordinador.prueba` la aprobó y la ficha pasó a mostrar el desglose con la marca «Congelado al aprobar» |
| 9.6 | CSV exportado, con la jornada dentro y las columnas numéricas sumando | Cumple: 31 columnas, `sep=;` para Excel en español, presencia 9 − almuerzo 1 = trabajadas 8 = ordinaria diurna 8, con revisor y fecha de revisión |
| 9.7 | Un manager no puede aprobar su propia jornada | Cumple: `coordinador.prueba` se registró una jornada y al darle aprobar la jornada siguió en `pendiente`. **Antes de esta pasada sí se podía** |
| 9.8 | El panel se usa a 390 px | Cumple con una pega menor: cero scroll horizontal del documento y cero solapes en las 15 pantallas revisadas; la barra de navegación del panel se desplaza dentro de su propia franja, que es el comportamiento buscado. se corrigieron en la misma pasada dos defectos: el botón «Desactivar» de `/admin/equipo` quedaba **encima** del chip del rol (la columna de texto se encogía por debajo de su contenido) y la línea «Sesión de … (usuario) ROL» del encabezado se cortaba por 7 px en todas las pantallas. Quedan dos rozaduras que no son fallos: la barra de secciones del panel solo muestra dos de las cuatro entradas y hay que deslizarla (sin ninguna pista visual de que se desliza), y la plantilla semanal de `/admin/jornadas/horarios` se corta a mitad de columna con scroll interno |

**Limpieza obligatoria:** toda jornada de prueba se elimina y todo ajuste tocado
vuelve a su valor original antes de cerrar la sesión de QA. Lo mismo con las
filas que deje el formulario de contacto: los `POST` de prueba de §8.8 escriben
en `site_mensajes` y hay que borrarlas (`DELETE` por `id` con la clave
service-role, nunca un borrado por rango).

## 10. Lo que queda abierto

Cosas detectadas que no se arreglaron en esta pasada, con el motivo:

1. **Autoaprobación en la base de datos.** La acción del panel ya impide que un
   manager apruebe su propia jornada, pero la RLS de `0002_jornadas.sql` sigue
   permitiéndolo a quien llame la API REST con la clave anónima y una sesión de
   coordinador. Cerrarlo del todo pide un trigger o una condición
   `employee_id <> auth.uid()` en la política — es decir, una migración nueva.
2. **`guardarJornadaComoManager` inserta con la clave service-role**, saltándose
   la RLS. Hoy no es explotable (va detrás de `getManagerOrNull()` y valida que
   la cuenta destino exista y esté activa), pero lo correcto es una política
   `jornadas_insert_manager` y volver al cliente de sesión. También es migración.
3. **Sin barrera de compilación `server-only`.** El guard de `admin.ts` es de
   ejecución: si mañana alguien importa ese módulo desde un componente de
   cliente, el error sale en el navegador y no en el build. Se cierra con
   `npm i server-only` y un `import "server-only"` en `admin.ts`, `server.ts`,
   `lib/admin/lecturas.ts` y `lib/jornadas-lecturas.ts` — añade una dependencia,
   así que se decide aparte.
4. **El mínimo de 3 segundos del formulario lo declara el cliente.** Es
   deliberado (con el reloj del servidor, el ISR daría falsos positivos), pero
   significa que el único freno real contra un bot dirigido es el tope por IP.
5. **Nonce de CSP solo en las rutas dinámicas.** `/admin` y `/mi-cuenta` ya son
   `force-dynamic`: se les podría poner nonce desde `src/proxy.ts` sin tocar el
   ISR del sitio público y quitarles el `'unsafe-inline'`. Mejora real, cambio
   de arquitectura pequeño pero no trivial.
6. **Texto repetido entre páginas.** Hay párrafos idénticos en `/servicios` y
   `/nosotros`, el mismo `alt` en cinco imágenes distintas, y dos respuestas de
   preguntas frecuentes casi iguales que además se emiten como `FAQPage`. No se
   tocó porque es contenido del cliente, no una errata. Conviene pasárselo a
   Jorge junto con la palabra **«baches»** (por lotes/batches), que viene tal
   cual del PPTX de casos de éxito.
7. **Botón flotante de WhatsApp a media página.** Ya no tapa la franja del hero
   ni el pie, pero a mitad de scroll sigue quedando encima de la esquina
   inferior derecha del contenido. Es inherente al patrón; si molesta, la
   alternativa es moverlo al canalón derecho y dejarlo solo con el icono.
8. **Panel a 390 px: dos afordancias que faltan.** La barra de secciones del
   panel se desliza pero no lo parece (solo se ven «Dashboard» y «Contenido del
   sitio»; «Equipo» y «Jornadas» quedan fuera), y la plantilla semanal de
   `/admin/jornadas/horarios` se corta a mitad de columna. Las dos se usan, pero
   piden un desvanecido en el borde o media columna asomando. Es diseño, no
   arreglo de una línea.
9. **No todo el texto del sitio es editable desde el panel** (criterio de §13).
   Quedan en código los rótulos e intros de las secciones «Servicios» y «Casos
   de éxito» del inicio (`src/app/(sitio)/page.tsx`), la intro de los valores,
   la nota del formulario de `/contacto` y la línea «Este caso combinó varios
   servicios de PIYC» de `/proyectos/[slug]`. `AjustesHome` no tiene campos para
   ellos. Cerrarlo pide ampliar el tipo, la migración de `site_settings` y las
   pantallas del panel: es trabajo de funcionalidad, no de pulido.
