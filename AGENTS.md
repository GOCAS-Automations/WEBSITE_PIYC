<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# website_PIYC — Sitio de PIYC (piycsas.com)

Plan de arranque completo (histórico): `docs/PLAN_INICIAL_PIYC.md`. Bitácora de sesiones: `docs/MEMORIA.md`. Este archivo es la fuente de verdad viva — no repetir aquí el historial.

## Stack y comandos

- Next.js 16 (App Router, `src/`), React 19, TypeScript, Tailwind CSS v4.
- Supabase — Postgres, Auth y Storage. Proyecto propio de PIYC (migra al de GOCAS más adelante, checklist en `docs/MEMORIA.md`).
- Sin librería de componentes, sin framework de animación, sin gestor de estado.
- `npm run dev` · `npm run build` (siempre antes de commitear) · `npm run lint`.
- Repo: `https://github.com/GOCAS-Automations/WEBSITE_PIYC.git` (organización GOCAS Automations).

## Estructura del sitio y del panel

Sitio público, estático + ISR (`revalidate = 300`), nunca dinámico: `/`, `/nosotros`, `/servicios`, `/servicios/[slug]`, `/proyectos`, `/proyectos/[slug]`, `/contacto`.

Panel `/admin` — cuatro entradas, no más: Dashboard · Contenido del sitio (inicio, nosotros, servicios, proyectos, valores, páginas, ajustes) · Equipo (cuentas, roles, horarios) · Jornadas (registro, aprobación, exportación).

Portal del empleado `/mi-cuenta`: login con marca PIYC, registrar jornada, historial, cambio de contraseña. Quien tiene panel ve además «Ir al panel».

Roles — solo tres, no agregar "por si acaso" (cada rol es una matriz de RLS que hay que probar): `admin` (todo), `coordinador` (todo menos crear/eliminar administradores), `empleado` (solo su portal).

## Marca

Fuente de verdad: `src/lib/tokens.ts` + el bloque `@theme` de `src/app/globals.css` — **se tocan juntos, en el mismo commit**. La paleta por defecto de Tailwind está anulada: ningún color escrito a mano en un componente. Todos los valores se midieron pixel a pixel del logo.

| Familia | Valores | Rol |
| --- | --- | --- |
| `azul-*` | 50 `#F0F4FD` · 100 `#DFE8FB` · 200 `#C2D4F8` · 300 `#8FB1F2` · 500 `#2C63D4` · 600 `#1A4CB6` · **700 `#123B94`** · 800 `#0C2A6B` · 900 `#0A2350` · 950 `#06142F` | Marca y color dominante. 700 = el del logo (botón primario, enlaces, titulares); 950/900 = fondos oscuros; 300 = trazos y detalles sobre oscuro; 50–200 = superficies |
| `verde-*` | 100 `#E5F6D9` · 300 `#A3DC80` · 400 `#77C64B` · **500 `#52AC26`** · 600 `#3A801A` · 700 `#2C6314` | Acento, ~10 % de la superficie: CTA de WhatsApp, indicadores, señal energizada del ladder |
| `acero-*` | 50 `#F4F6F9` · 100 · 200 · **300 `#BFC4CD`** · 400 · 500 · 600 `#56606E` · 700 `#3B434F` | Neutros fríos del engranaje: base clara, bordes, texto secundario (600) |
| `error-*` | 50 · 300 `#F4A8A0` · **500 `#B42318`** · 700 | Solo validación de formularios. No es color de marca |
| `blanco` | `#FFFFFF` | Fondo base de las tarjetas |

Tipografía: **Geist**, familia única para títulos y texto (`--font-geist`; pesos 400/500/600, nunca 700+), con tracking negativo en titulares (`--tracking-titulo` −0,022 em, `--tracking-display` −0,035 em) y escala fija `text-titular-xs…2xl` — nada de mayúsculas espaciadas. Sistema v3 «iOS» — la piel, no la paleta: fondo `lienzo` `#EEF2F9` (`lienzo-alto` `#F7F9FD`) con tarjetas blancas encima; radios `chip` 10 · `control` 12 · `campo` 14 · `tarjeta` 20 · `panel` 28 · `lienzo` 36 · `capsula` (los `fino`/`medio` quedan solo por compatibilidad); sombras en capas con tinte `azul-950` (`sutil`/`tarjeta`/`elevada`/`flotante`), nunca negras; materiales translúcidos con `backdrop-filter` (`material`, `material-fuerte`, `material-oscuro`) y sus utilidades de fondo `fondo-plano`, `fondo-marca`, `fondo-noche`; listas agrupadas (`lista-agrupada` + `fila-agrupada`), botones cápsula, nav en cápsula flotante y `pulsable` para la presión táctil. Tokens de aviso `aviso-50/200/500/700`: **avisar no es informar ni errar** — es el acero llevado a neutro cálido, sin naranja ni ámbar.

Uso: el azul domina y el verde se dosifica (nunca fondo de sección ni de bloque grande). Sobre `verde-500` va texto `azul-950` (6.6:1); **blanco sobre `verde-500` falla** (2.9:1) — si hace falta texto blanco, `verde-600` (4.9:1). Texto verde sobre fondo claro = `verde-700`; sobre fondo oscuro = `verde-400`/`verde-300`. Texto secundario = `acero-600`. Sobre `azul-950` va `blanco`/`acero-100`/`acero-200`. Sin naranja, en ningún caso.

## Datos de contacto oficiales

- Razón social: PROGRAMACIÓN INDUSTRIAL Y CONTROL SAS · NIT 901.161.923 · nombre comercial PIYC.
- Eslogan: «Tu socio confiable en soluciones industriales» · dominio `piycsas.com`.
- Ciudad: Cali. Dirección oficial (la de Google): Cl. 33 #5-76, Comuna 4, Cali, Valle del Cauca.
- Horario de atención: lunes a viernes, 8:00 a. m. – 5:00 p. m.; sábados y domingos, cerrado (`ajustes.contact.horario`: `label` y `schema` dicen lo mismo).
- WhatsApp principal, destino del formulario de contacto: +57 321 761 7958.
- WhatsApp secundario: +57 310 637 3483 (Jorge Castillo, fundador).
- Correo visible en el sitio: jorge.castillo@piycsas.com.
- Instagram: https://www.instagram.com/piyc_sas/

## Backend / Supabase

Cuatro migraciones, no más (detalle y motivo en `docs/PLAN_INICIAL_PIYC.md` §7):

- `0001_contenido.sql` — `profiles`, `site_services`, `site_projects`, `site_values`, `site_settings`. RLS: `SELECT` público solo de lo `published`; escritura solo con `is_content_editor()`. Storage: bucket público `site-images` (`inicio/`, `nosotros/`, `servicios/`, `proyectos/`, `cabeceras/`).
- `0002_jornadas.sql` — `jornadas`, `horarios_mensuales`. `desglose` + `contexto_calculo` + `calculado_at` desde el día uno; se congelan al aprobar. RLS: el empleado ve e inserta solo lo suyo mientras está `pendiente`; el manager ve, aprueba, rechaza y elimina todo.
- `0003_mensajes.sql` — `site_mensajes`. Una sola política: `SELECT` para `is_manager()`. Nunca `INSERT` para `anon` — se inserta desde el servidor con la clave service-role.
- `0004_jornadas_revision.sql` — cierra los dos hallazgos de QA sobre `jornadas`: el trigger `jornadas_proteger_revision` impide en la base que una sesión cambie el estado, el revisor o el desglose de su propia jornada (nadie se revisa a sí mismo, ni un admin; la service-role sigue libre), y la política `jornadas_insert_manager` deja que un manager registre jornadas de otra cuenta **activa** con su propia sesión, siempre `pendiente` y sin desglose — así el panel ya no necesita la clave de servicio para eso.

Variables de entorno en Vercel: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY` (solo servidor), `NEXT_PUBLIC_SITE_URL`, `CONTACT_IP_SALT` (sal del hash de IP del formulario; cadena aleatoria larga). `SUPABASE_ACCESS_TOKEN` es personal, solo local (CLI / Management API) — nunca en Vercel ni en el repo.

`src/lib/content.ts` cae a `src/data/*` si faltan las env vars o falla la consulta: el sitio público nunca queda en blanco por un problema de base de datos. `undefined` ≠ vacío: columna ausente → respaldo estático; columna presente y vacía → decisión del panel, se respeta. Toda server action valida el rol **en el servidor** y llama `revalidatePath`.

## Reglas que no se negocian

1. Un Client Component nunca importa de `components/admin/ui.tsx`. Los componentes de cliente van en `ui-base.tsx` (`"use client"`) y `ui.tsx` los reexporta. Arrastrar `ui.tsx` al navegador hace que, **solo en producción**, la respuesta de una server action del panel no llegue nunca (el botón se queda en «Guardando…»). No se reproduce en desarrollo.
2. La navegación del panel necesita tres piezas juntas: `src/app/admin/loading.tsx`, el componente `PuntoDeCarga` y `prefetch={false}` en todos los `<Link>` de `/admin` (rutas `force-dynamic`). Sin las tres, el panel se siente trabado.
3. RLS de `profiles` solo deja a cada quien leer su propia fila. Cualquier pantalla que muestre compañeros necesita completar con la clave de servicio, y **solo** nombre, apodo y cargo.
4. Un valor exportado desde un módulo `"use client"` no se puede leer en el servidor. Las constantes compartidas viven en `src/lib/*-types.ts`.
5. **El formulario de contacto no envía correo.** El servidor registra el lead en `site_mensajes` (service-role) y el cliente abre `wa.me` con el mensaje prearmado. El número destino sale SIEMPRE de `site_settings`, nunca del payload — tomarlo del formulario convierte el sitio en un relay abierto.
6. Rechazar ≠ eliminar. Decirlo en la interfaz cada vez que se toque esa pantalla. Eliminar lleva doble confirmación.
7. Anti-spam sin terceros: honeypot + 3 segundos mínimos (contra el reloj del visitante, nunca el del servidor) + longitudes máximas + tope por IP. Sin captcha.
8. Nunca exponer una función service-role a `anon`. La clave anónima es pública.
9. `0` nunca se muestra como dato. Si el contador o la métrica no tienen valor, no se pinta la tarjeta.
10. CSP: `script-src` necesita `'unsafe-inline'` (el nonce obliga a renderizado dinámico y mata el ISR). El resto va estricto — ver `next.config.ts`.
11. Cargar una variable de entorno en Vercel no basta: hay que volver a desplegar. Las páginas estáticas deciden en el build.
12. Español de Colombia, con tildes. El cliente lee los textos.
13. **El sitio no puede parecerse al de GPI.** Son empresas aliadas que comparten espacio físico, y GPI se lee verde y gris, con Inter + Manrope. PIYC se lee **azul** a primera vista: el verde del logo entra solo como acento (~10 %), nunca como fondo de sección ni como color de la página. Nada de tema ambiental ("ambiental", hojas, sostenibilidad). Y otro lenguaje de formas: PIYC es estilo iOS —lienzo gris-azulado, tarjetas y paneles de esquina generosa, nav en cápsula flotante, materiales translúcidos, Geist como familia única—, así que «sin tarjetas con sombra» ya **no** aplica; lo que separa a las dos marcas es el color, la retícula y la tipografía. Verificable poniéndolos lado a lado.
14. Toda imagen de contenido se pinta con `ContentImage`, nunca con `next/image` directo (reservado para el chrome: logo del nav/pie, favicon). ≤ 400 KB, WebP, ancho máximo 1920 px. En la base de datos nunca van rutas `/images/` — todo va al bucket o a una URL externa permitida. `images.remotePatterns` de `next.config.ts` y `HOSTS_IMAGEN_OPTIMIZABLES` de `src/lib/imagenes.ts` son la misma lista escrita dos veces: se tocan juntas.
15. `npm run build` limpio antes de cada commit. **Confirmar con Cesar antes de cada `git push`** — repo de organización con más de un miembro mirando. Mensajes de commit en español, describiendo el porqué y no solo el qué.

## Fuera de alcance

Nómina, volante de pago en PDF, calendario de programación, métricas con Recharts. Existen en GPI; aquí no entran. Si PIYC los pide, se cotizan aparte.

## Flujo de trabajo con agentes

- El hilo principal analiza, planea y verifica builds. La ejecución va a subagentes: **Opus** para features y backend, **Sonnet** para arreglos visuales y documentos. Una edición de una línea no amerita agente.
- Grep antes que Read. Buscar el símbolo y leer el rango, no el archivo completo.
- Nunca leer `node_modules/` salvo la guía puntual de Next que haga falta.
- Nunca leer el repo de GPI completo. Solo lo listado en `docs/PLAN_INICIAL_PIYC.md` §2.1.
- No pegar salidas largas en el chat. Un build que falla: leer el error, no volcar los renglones completos.
- Un tema por sesión rinde más que saltar entre panel, SEO y diseño el mismo día.
- No releer un archivo recién editado para verificar. Si `Edit` no falló, el cambio está.
