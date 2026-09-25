# Memoria — website_PIYC

Bitácora **append-only** del proyecto. Se agrega una entrada al cerrar cada sesión de trabajo, nunca se reescriben las anteriores. Se lee solo cuando hace falta — no es carga obligatoria de cada turno (eso es `AGENTS.md`).

Formato de cada entrada:

```markdown
## AAAA-MM-DD · Tema de la sesión

**Hecho:** qué se construyó o cambió.
**Decisiones:** qué se decidió y por qué, si no quedó ya en AGENTS.md.
**Tropiezos:** qué costó tiempo y cómo se resolvió.
**Siguiente:** qué sigue.
```

Si algo de una sesión cambia una **regla permanente** del proyecto, esa regla se refleja también en `AGENTS.md` — aquí solo queda el registro de que pasó.

---

## Migración futura al Supabase de GOCAS

El proyecto de Supabase de PIYC es propio (creado por Cesar con los accesos que dio Jorge). Cuando entre la mensualidad de GOCAS (40.000 COP/mes), migra al Supabase de GOCAS. Checklist provisional — completar y tachar cuando se ejecute cada paso, no antes:

- [ ] Bucket `site-images` (con sus carpetas: `inicio/`, `nosotros/`, `servicios/`, `proyectos/`, `cabeceras/`) copiado al proyecto de GOCAS.
- [ ] Tablas y datos (`profiles`, `site_services`, `site_projects`, `site_values`, `site_settings`, `jornadas`, `horarios_mensuales`, `site_mensajes`) migradas con sus políticas RLS.
- [ ] Usuarios de Auth (cuentas de `/admin` y `/mi-cuenta`) recreados o migrados en el proyecto de GOCAS, con las mismas contraseñas o un reseteo coordinado con PIYC.
- [ ] Variables de entorno actualizadas en Vercel (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`) apuntando al proyecto nuevo.
- [ ] Redeploy en Vercel después de actualizar las variables — cargarlas no basta, las páginas estáticas deciden en el build.
- [ ] Proyecto viejo de Supabase (el de PIYC) dado de baja solo después de confirmar que el sitio en producción funciona contra el nuevo.

---

<!-- Las entradas de sesión se agregan debajo de esta línea, la más reciente al final. -->

## 2026-09-18 · Día 1 — Fundaciones, backend e identidad

**Hecho:** Next 16.3.5 + React 19 + Tailwind v4; `next.config.ts` con cabeceras de seguridad e `images.unoptimized`; `AGENTS.md`, `CLAUDE.md`, esta bitácora. Migraciones 0001–0003 aplicadas (las tres de una vez: el access token personal vence el 25-sep). Advisor de seguridad en 0; matriz de roles probada en transacción revertida. Auth: registro público desactivado, contraseña mínima 10. Logo procesado a PNG (claro y oscuro), paleta y tipografías en `src/lib/tokens.ts` + `@theme`; hero de muestra en `/` (capturas en `PIYC/muestras/`).
**Decisiones:**
- Contacto solo por WhatsApp (sin SMTP/nodemailer). `site_mensajes` es registro de leads; destino = `site_settings.contact.whatsappFormulario`, nunca el payload.
- Dirección oficial la de Google (Cl. 33 #5-76, Cali); las dos de El Porvenir del Drive quedan fuera hasta que Jorge confirme.
- Helpers `is_manager`/`is_content_editor`/`is_admin` en esquema `private` (no expuesto por la API). El rol sale de `app_metadata`, nunca de `user_metadata`; cuenta sin rol nace empleado inactivo. El primer admin se activa por SQL.
- Paleta sin verde en la interfaz; el verde existe solo dentro del logo (no se altera). Tailwind sin paleta por defecto: solo colores de marca (`bg-blanco`, no `bg-white`).
- `jornada_config`: recargo dominical 0,90 (Ley 2466/2025, desde jul-2026) — confirmar con PIYC o su contador.
**Tropiezos:** el BMP del logo mide 250×121 px, no se vectoriza limpio. Edge headless no baja de ~500 px de ancho: capturas móviles por CDP con `puppeteer-core` fuera del repo.
**Siguiente:** visto bueno de la paleta → día 2 (PPTX de casos de éxito, fotos a WebP, `CONTENIDO.md`, semillas). Pendientes con Jorge: logo vectorial, misión/visión, textos de telemetría/telecontrol/aplicaciones, catálogo de fotos, reglas de jornada, cuentas iniciales, agrupación de servicios en 4 líneas. `site_url` de Auth a `https://piycsas.com` al apuntar el dominio.

## 2026-09-20/21 · Construcción completa: sitio, panel, jornadas, marca y QA

**Hecho:** paleta v2 derivada solo del logo (azul domina, verde acento, sin naranja). Seis casos de éxito extraídos del PPTX con 28 fotos WebP en el bucket. Sitio público completo (7 rutas, ISR, formulario → `site_mensajes` + `wa.me`, SEO, JSON-LD). Panel: ingreso por usuario, 3 roles, CRUD de contenido, equipo, mensajes. Jornadas: registro, aprobación, horarios mensuales, CSV; 23 pruebas unitarias (`npm test`). Documento de identidad de marca en `docs/marca/` (18 hojas, HTML + PDF). `docs/ADMIN.md` verificado contra el código, `docs/PLAN_PRUEBAS.md` con Lighthouse (accesibilidad 100, SEO 100, rendimiento móvil 90–98).
**Decisiones:**
- Alcance reiterado por Cesar: solo landing, panel de contenido y jornadas. Nada de nómina, volante, calendario ni métricas de GPI.
- Migración **0004** (cuarta, fuera del plan de tres) por seguridad: nadie se revisa su propia jornada (trigger) y el manager inserta a nombre de cuentas activas con su sesión (sin service-role).
- El recargo dominical/festivo sale de la ley por fecha (0,80 → 0,90 el 1-jul-2026 → 1,00 el 1-jul-2027), no del ajuste. Festivos generados por función (19 en 2026 y 2027).
- Sitio en trato de **usted**. Los textos sembrados viven en `site_settings`: corregir solo el código no basta.
- Heros de página tipográficos: la foto más grande del PPTX mide 1229 px; no se estiran a pantalla completa.
- La sal del `ip_hash` del formulario es `CONTACT_IP_SALT` (ya no cae a la service-role): crearla en Vercel.
**Tropiezos:** en Tailwind v4 `utilities` va después de `components`: un `display:none` en `components` no le gana a `inline-flex`. `x-forwarded-for` se lee del último elemento o de `x-vercel-forwarded-for`, nunca del primero. El primer `<form>` del panel es «Cerrar sesión» (ojo en pruebas automatizadas).
**Siguiente:** bajar las 40 fotos originales del Drive (faltan fotos de refrigeración, cuartos fríos y aires; ninguna actual sirve de cabecera ancha). Respuestas de Jorge (lista en `docs/PLAN_PRUEBAS.md` y `docs/CONTENIDO.md` §6). Antes de entregar: borrar `coordinador.prueba` y `empleado.prueba`, variables en Vercel + deploy, `site_url` de Auth, dominio sin tocar MX/SPF, Search Console.

## 2026-09-21/22 · Rediseño estilo iOS, manual del sitio y marca v2.0

**Hecho:** Cesar descartó el primer diseño por «verse antiguo». Rediseño completo (sitio, panel, portal, jornadas): nav en cápsula flotante (sin barra de datos arriba), hoja de menú en móvil, Geist como familia única, radios 10–36 px, sombras en capas, materiales translúcidos, listas agrupadas, barra de pestañas inferior en el panel móvil. Paleta del logo intacta. Lighthouse móvil 96–99 / 100 / 100 / 100; axe sin violaciones. Identidad de marca v2.0 (22 hojas) y `docs/manual/Manual_del_Sitio_PIYC.pdf` (30 hojas, sistema v2 de GOCAS, sin credenciales). `docs/ADMIN.md` recontrastado contra el código (22 correcciones).
**Decisiones de Cesar:**
- Se nombran los clientes del material entregado (JGB, Alival, B. Altman); no se publica nada que no esté en los documentos de PIYC (E&H queda sin expandir).
- Misión y visión intercambiadas respecto al documento original (venían cruzadas).
- Reglas de jornada = las de GPI (ya coincidían campo por campo, incluido el umbral de almuerzo de 6 h). Se conservan las correcciones técnicas/legales de PIYC.
- Horario oficial L–V 8:00 a. m.–5:00 p. m. (ficha de Google); en el panel hay dos campos: texto visible y «Horario para Google» (JSON-LD).
- Las direcciones de El Porvenir del Drive no se usan.
- Cuentas iniciales: `admin`, `jorge.castillo` (admin), `coordinador.prueba`, `empleado.prueba`. Contraseñas solo en `PIYC/material/credenciales-iniciales.txt` (fuera del repo); nunca en manuales. PIYC crea las demás.
- Todo lo visual (textos, títulos, descripciones, imágenes) debe seguir siendo editable desde el panel.
**Tropiezos:** `ui.tsx` (servidor) importaba cadenas de clase desde `ui-base.tsx` (`"use client"`) y recibía una referencia de cliente: un botón salía sin estilo. Las clases compartidas viven ahora en `src/components/admin/clases.ts` (módulo neutro) — es la regla 4. `backdrop-filter` no sobrevive a la impresión en PDF: en documentos se simula con blanco translúcido sobre degradado. Un reinicio del PC cortó dos agentes; se reanudaron con SendMessage sin perder trabajo.
**Siguiente:** push (pendiente de autorización), fotos originales del Drive, logo vectorial (o redibujarlo en SVG), despliegue en Vercel con las 5 variables, borrar las cuentas `.prueba` antes de entregar.

## 2026-09-22 · Última tanda antes de publicar

**Hecho:** logo redibujado en SVG (claro, oscuro, isotipos, PNG de 2000 px; favicon.ico/icon.svg desde el isotipo). Fotos originales del Drive catalogadas (26 publicables, 13 descartadas: 9 de banco de imágenes y 4 ilegibles), repartidas por sección sin repetir; bucket limpio (solo imágenes referenciadas). Fotos LCP a 900 px. Nav al ancho del contenido, `GrupoDeBotones` (botones de un grupo con igual ancho y alto), flotante de WhatsApp solo ícono, carrusel horizontal en Nosotros, imagen del hero editable desde el panel (vacía = diagrama), View Transitions entre rutas, SEO cerrado (ItemList/CollectionPage, Article, FAQPage, lastModified real, OG en todas). Manual v1.1 y marca v2.1. `docs/DESPLIEGUE.md` con los pasos de publicación. Lighthouse móvil 93–97 / 100 / 100 / 100.
**Decisiones de Cesar:** correo público fabian.gaviria@piycsas.com; **el contacto de Jorge Castillo no se publica** (ni teléfono ni correo, tampoco en capturas de documentos). Contraseñas provisionales sencillas en `material/credenciales-iniciales.txt` (fuera del repo) — cambiarlas antes o en la entrega.
**Tropiezos:** los botones apilados medían distinto porque `flex-wrap` dimensiona cada línea por separado: se resolvió con rejilla `auto-cols-fr` sobre contenedor `w-fit`. Declarar `openGraph` en una página desplaza el `opengraph-image` de archivo. Con el optimizador apagado, una foto de 1920 px en un hueco de 342 px hundía el LCP: las imágenes se suben al tamaño que se pintan (~2×). Una búsqueda de texto no detecta datos personales dentro de capturas: revisar las imágenes de los documentos a ojo. Dos cortes por límite de uso de la API; los agentes se reanudaron con SendMessage.
**Siguiente:** autorización de push → Vercel según `docs/DESPLIEGUE.md` → dominio → Search Console. Pendiente de PIYC: fotos de refrigeración y aires acondicionados, aprobación de textos redactados, visto bueno del logo redibujado.

## 2026-09-22 · Primera revisión en producción

**Hecho:** pie compacto (sin listas de servicios ni casos); franja de cierre en dos columnas centradas; sin pies de foto y fotos estiradas al alto de su columna (`FotoDeColumna`); `/nosotros` en zigzag con par de fotos escalonado y misión · foto · visión; cabeceras internas con foto a sangre y velo (`CabeceraInterna`, LCP con `srcSet` cuando hay `srcMovil`); franja de líneas del inicio en una tarjeta al ancho del contenido con frases de una línea editables (`home.lineasServicio`); hub de `/servicios` por líneas con foto que alterna de lado y filas con miniatura; fichas sin tarjeta «Resumen» (datos en cápsulas de la cabecera). Panel: el punto de carga de `EnlacePrimario` ya no reserva espacio; la subida genera la variante de 900 px (`srcMovil`) y guarda `width`/`height` reales.
**Decisiones:** foto de dos técnicos de «Quiénes somos» retirada por Cesar (no se usa en ningún lado; original en `material/`). Fondos de cabecera en 1920 + 900 px. Regla nueva: **una foto no se repite dentro de una misma página** (la de la cabecera no vuelve junto al texto ni en la galería; la grande de una línea no vuelve como miniatura).
**Tropiezos:** cambiar la base afecta producción al instante (ISR 5 min) aunque el código nuevo no esté desplegado: coordinar el push con los cambios de datos. Las capturas de página completa con `loading="lazy"` muestran cajas grises si no se hace scroll antes: no confundirlas con fotos rotas.
**Siguiente:** revisión de Cesar en producción tras el push; fotos de refrigeración y aires de PIYC; retroalimentación de PIYC.

## 2026-09-22 (tarde) · Segunda revisión en producción

**Hecho:** el «hueco» en ventanas de ~600–900 px no era una rejilla mal armada: los `<span class="sr-only">` del carrusel y de la galería eran `position:absolute` sin ancestro posicionado, se anclaban al bloque inicial y su texto `nowrap` estiraba el `scrollWidth` del documento hasta 1932 px. Arreglado con `relative` en el botón de cada diapositiva y `.sr-only { contain: paint }` en `globals.css`. Bloque «La empresa» como `Collage` (dos fotos en un solo marco, o una, o marcador). Galería de `/nosotros` en 9 fotos (una sale de un fotograma del único video del Drive, con `ffmpeg`). Hub: línea 2 con tablero armado; línea 3 con el tablero de variadores (no hay ninguna foto de telecontrol en el material). `MarcadorDeMarca` (superficie azul con logo y cápsula «Foto pendiente») para donde falte foto: hoy solo `aires-acondicionados`. Mapa de `/contacto` por CID (`maps?cid=4032448001106595686&output=embed`): muestra el nombre del negocio; `mapsEmbedUrl` y `mapsPlaceUrl` editables en el panel.
**Decisión de Cesar (22-sep-2026):** protocolo de dos velocidades en `AGENTS.md` §Flujo de trabajo — cambio pequeño (≤ 3 archivos, sin lógica) lo hace el hilo principal con verificación proporcional; ronda grande va a subagentes. Y ante falta de fotos: primero material real sin usar, luego marcador con el logo, repetir solo como último recurso.
**Tropiezos:** una captura de página completa con `loading="lazy"` muestra cajas grises que no son fotos rotas; y Chromium no rasteriza iframes de otro origen fuera del viewport, así que el mapa se verifica con captura aparte. `muestras/` ya pesa 269 MB dentro de OneDrive: conviene podarla.
**Siguiente:** revisión de PIYC. Pedirles fotos de telecontrol, refrigeración y aires acondicionados.

## 2026-09-23 · Ajustes tras la reunión con PIYC

**Hecho:** dirección con «Local 2» y vuelve el teléfono de Jorge Castillo como segundo número público (el formulario sigue al 321 761 7958). Franja de logos de clientes al final del inicio (JGB · Alival · B. Altman, de sus sitios oficiales, normalizados y editables desde el panel); cada logo enlaza a su caso. Hero del inicio sin diagrama: fondo a sangre con **imagen o video** intercambiables desde el panel (`home.hero.fondo`, `CampoVideo` nuevo; `media-src` de la CSP ampliado al bucket). Valores fuera de la portada, siguen en `/nosotros`. Aviso por correo del formulario con `nodemailer` dentro de `after()`, apagado si faltan las variables. Botón de eliminar jornada retirado del panel (RLS intacta). CSV: tildes arregladas.
**Decisiones:** el correo del formulario es **aviso**, no canal: primero el lead y WhatsApp, el correo después y sin bloquear. Destino, siempre de ajustes o entorno.
**Tropiezos:** el CSV no fallaba por codificación sino por la línea `sep=;`: Excel entra por la ruta de importación con directiva de separador y **descarta el BOM**, releyendo en ANSI. BOM y `sep=` son excluyentes; en Windows es-CO el `;` ya es el separador de listas.
**Pendiente:** credenciales SMTP (Workspace con contraseña de aplicación, o Resend/Brevo con DNS); decidir si el empleado sigue pudiendo borrar su jornada pendiente desde `/mi-cuenta`; indexar en Search Console.

## 2026-09-23 (tarde) · Clientes y hero provisional

**Hecho:** Nestlé y Litoplas se suman a la franja de clientes (cinco logos, de sus sitios oficiales, normalizados al mismo lienzo de 320×120); los dos nuevos van **sin caso**, así que se pintan sin enlace hasta que PIYC les asigne uno desde el panel. Los logos pasan a **color** —el gris los apagaba— con el puntero solo agrandándolos, y la fila quedó centrada. El hero del inicio sin fondo cargado muestra ahora la pantalla azul de marca con el logo y la cápsula «Imagen pendiente», el mismo marcador del resto del sitio, para que PIYC la reemplace por foto o video desde el panel.
**Detalles:** el `intro` de la franja prometía que cada logo lleva a su caso; se reescribió porque ya no es cierto para todos. El logo de Nestlé se reescaló (contenido 85×88 → 100×104): su masa óptica quedaba por debajo de la de los otros cuatro.

## 2026-09-25 · Foto real en el hero

**Hecho:** el hero del inicio deja de mostrar el marcador azul: lleva la toma apaisada de la línea de envasado (1920×1080 + variante de 900), que estaba en la galería de «Nuestro trabajo». Se copió a `inicio/hero-linea-envasado.webp`, salió de la galería —que vuelve a ocho— y se borraron los archivos viejos de `nosotros/`: una foto no se repite entre secciones. El marcador sigue en el código como respaldo para cuando no haya fondo cargado.
**Ojo:** `SUPABASE_ACCESS_TOKEN` **venció** (era el personal de 7 días). La Management API ya no responde; los cambios de datos se hacen con la clave de servicio por PostgREST (`@supabase/supabase-js`), que es lo que usa el sitio. Para volver a correr SQL hace falta un token nuevo o el editor SQL del panel de Supabase.
