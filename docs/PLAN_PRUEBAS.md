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

1. ~~**Autoaprobación en la base de datos.**~~ **RESUELTO** con
   `0004_jornadas_revision.sql` (21-sep-2026). El trigger
   `jornadas_proteger_revision` rechaza cualquier UPDATE con sesión que cambie
   `status`, `review_note`, `reviewed_by`, `reviewed_at` o el congelado de una
   jornada cuyo `employee_id` sea el de quien la hace — da igual el rol. Se
   eligió trigger y no política porque `with check` no distingue columnas: un
   manager sí puede corregir el texto o las horas de su propia jornada, lo que
   no puede es revisarla. La service-role (sin `auth.uid()`) queda fuera, para
   que el servidor siga pudiendo hacer tareas administrativas. Probado en una
   transacción revertida: el coordinador no aprueba la suya (error 42501) pero
   sí la del empleado, y el empleado tampoco se aprueba la suya estando
   pendiente.
2. ~~**`guardarJornadaComoManager` inserta con la clave service-role.**~~
   **RESUELTO** con `0004_jornadas_revision.sql` (21-sep-2026). La política
   `jornadas_insert_manager` deja a un manager insertar jornadas de otra cuenta
   **activa** (helper `private.perfil_activo()`), siempre en `pendiente`, sin
   revisor y sin desglose; la acción del panel volvió al cliente de sesión y ya
   no importa `getServiceRoleSupabase`. Probado: alta a cuenta activa sí, a
   cuenta desactivada no, con estado `aprobada` no, y el empleado sigue
   insertando solo lo suyo.
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
9. ~~**No todo el texto del sitio es editable desde el panel**~~ — **RESUELTO el 21-sep-2026**: esos textos pasaron a `site_settings` con campo en el panel (pantalla «Textos de las páginas» e Inicio/Nosotros). Descripción original:
   Quedan en código los rótulos e intros de las secciones «Servicios» y «Casos
   de éxito» del inicio (`src/app/(sitio)/page.tsx`), la intro de los valores,
   la nota del formulario de `/contacto` y la línea «Este caso combinó varios
   servicios de PIYC» de `/proyectos/[slug]`. `AjustesHome` no tiene campos para
   ellos. Cerrarlo pide ampliar el tipo, la migración de `site_settings` y las
   pantallas del panel: es trabajo de funcionalidad, no de pulido.

## 11. Pasada final — 22-sep-2026

Contra el build de producción en `localhost:4000` (`npm run build && npx next
start -p 4000`). Nada automatizado contra producción. Pasos de publicación en
`docs/DESPLIEGUE.md`.

### 11.1 Imágenes

Se midió el ancho pintado de cada imagen en 1440/1024/768/390: **ninguna foto
se pinta a más de 432 px CSS** (cabeceras 400, «Quiénes somos» y portada 432,
tarjetas 376, carrusel 356) y se servían a 1920 px. Las 14 fotos de obra de
≥ 1000 px de ancho se regeneraron desde el original a **900 px** (`…-900.webp`),
se actualizaron base (`site_settings`, `site_services`, incluida la `cover` en
texto plano), `src/data/*`, semillas e inventario (`docs/CONTENIDO.md` §2), y
las 14 originales se borraron del bucket. Ejemplo: cabecera de `/nosotros`
1920×943 · 85 KB → 900×442 · 28 KB. Las de casos (capturas del PPTX, ≤ 1134 px)
no se tocaron.

### 11.2 Lighthouse móvil

| Ruta | Rend. | Acc. | B.P. | SEO | LCP | CLS |
| --- | --- | --- | --- | --- | --- | --- |
| `/` | 97 | 100 | 100 | 100 | 2,6 s | 0 |
| `/nosotros` | 93 (95 · 90) | 100 | 100 | 100 | 3,2 s | 0 |
| `/servicios` | 94 | 100 | 100 | 100 | 3,1 s | 0 |
| `/servicios/telemetria` | 96 | 100 | 100 | 100 | 2,9 s | 0 |
| `/proyectos/pasteurizador-alival` | 94 | 100 | 100 | 100 | 3,0 s | 0 |
| `/contacto` | 97 | 100 | 100 | 100 | 2,7 s | 0 |

`/nosotros` estaba en 86–89: el LCP móvil **no era la cabecera sino la foto de
«Quiénes somos»**, que iba con `loading="lazy"` (insight «LCP request
discovery»). Con `prioritaria` quedó en 90–95 en tres corridas seguidas.

### 11.3 Panel, roles y jornadas

| # | Prueba | Resultado |
| --- | --- | --- |
| F.1 | Admin sube una imagen al hero (Contenido → Inicio, archivo real al bucket) con su texto alternativo y guarda | Cumple: guardado en 1,6 s; `/` pinta la foto con `fetchpriority="high"` en lugar del diagrama |
| F.2 | Quitar la imagen y guardar | Cumple: vuelve el diagrama del PLC |
| F.3 | Editar un título de sección nuevo («Textos de las páginas» → título del formulario de `/contacto`) y revertir | Cumple: aparece en `/contacto` y al revertir desaparece |
| F.4 | Empleado: ingresa, no ve «Ir al panel», `/admin` lo devuelve a `/mi-cuenta` | Cumple |
| F.5 | Coordinador: el alta de cuentas solo ofrece `coordinador` y `empleado` (el admin ve los tres) | Cumple |
| F.6 | Jornada: empleado registra 8:00–17:00 → coordinador la ve pendiente y la aprueba → desglose congelado | Cumple |
| F.7 | CSV | Cumple: `text/csv`, `sep=;`, 31 columnas, presencia 9 − almuerzo 1 = 8 ordinarias diurnas, revisor y fecha |
| F.8 | Formulario de contacto | Cumple: `/api/contacto` 200 y abre WhatsApp al +57 321 761 7958 (número de `site_settings`, no del payload) |

Limpieza verificada con una segunda consulta: 0 jornadas, 0 filas en
`site_mensajes`, imagen de prueba borrada del bucket, `home.hero.image` en
`null` y ningún texto «QA» en los ajustes.

### 11.4 Revisión visual y accesibilidad

- 9 rutas (7 + ficha sin foto + 404) × 1440/1024/768/390 con capturas.
- **axe: 0 violaciones** en 9 rutas × escritorio/móvil. Foco visible con teclado
  en todo (azul 700; verde 400 sobre fondos oscuros). Consola sin errores ni
  avisos de CSP (el único 404 es el de la propia página 404).
- Nav flotante: no se cruza con el `h1` en ninguna ruta ni ancho. Grupos de
  botones parejos (la 404: tres botones de 184×48). Hoja del menú móvil, pie y
  mapa de `/contacto` (`output=embed`, sin bloqueo de CSP) correctos. Logo SVG
  nítido en nav, pie y login.
- La ficha sin foto (aires acondicionados) pinta el gráfico de respaldo en su
  marco azul noche con la cartela: se lee intencional.
- **Rastro de Jorge Castillo: 0.** Ni `+57 310 637 3483` ni
  `jorge.castillo@piycsas.com` en el HTML servido (incluido el JSON-LD) de las
  9 rutas, `sitemap.xml` ni `robots.txt`. El correo visible es
  `fabian.gaviria@piycsas.com`.

Defectos corregidos:

1. **Fotos verticales descabezadas en el carrusel y los recuadros 4:3**: con el
   recorte centrado se perdía la cabeza de los técnicos y el remate de los
   tableros. `ContentImage` sube el punto de corte al 30 % del alto cuando una
   foto vertical (alto ≥ 1,2 × ancho) va recortada en un recuadro propio.
2. **LCP perezoso en `/nosotros`** (ver 11.2).

Falsos positivos descartados, para no volver a perseguirlos: el
`documentElement.scrollWidth` de `/nosotros` crece con el carril del carrusel,
pero `window.scrollX` no se mueve (ya documentado en `CarrilDeFotos.tsx`); y las
imágenes `lazy` que no llegan a entrar en vista (fin del carrusel, logo del pie)
aparecen «sin cargar» en una captura de página completa, no en el navegador.

### 11.5 Queda abierto

- ~~`/favicon.ico` respondía 404~~ — resuelto: `src/app/favicon.ico` (16/32/48 px) generado desde el isotipo SVG.
  `apple-icon.png`; los navegadores actuales no lo piden). Se cierra con un
  `src/app/favicon.ico`.
- En la ficha sin foto, la columna derecha queda vacía bajo la tarjeta
  «Resumen». No está roto; se llena en cuanto PIYC mande fotos de refrigeración
  y aires (`docs/CONTENIDO.md` §2.4).
- Las imágenes subidas desde el panel no guardan ancho ni alto, así que el
  `<img>` sale con las medidas por defecto de `ContentImage` (1200×900). No
  causa saltos de diseño porque se pintan dentro de un recuadro de proporción
  fija, pero conviene leer las medidas del archivo al subirlo.
