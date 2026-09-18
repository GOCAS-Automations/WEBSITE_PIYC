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

Propuesta en revisión — la fuente de verdad será `src/lib/tokens.ts` (consumido desde Tailwind v4 vía `@theme`). Ningún color escrito a mano en un componente.

## Datos de contacto oficiales

- Razón social: PROGRAMACIÓN INDUSTRIAL Y CONTROL SAS · NIT 901.161.923 · nombre comercial PIYC.
- Eslogan: «Tu socio confiable en soluciones industriales» · dominio `piycsas.com`.
- Ciudad: Cali. Dirección oficial (la de Google): Cl. 33 #5-76, Comuna 4, Cali, Valle del Cauca. Las dos direcciones del Drive (B/ El Porvenir) NO se usan hasta que Jorge las confirme.
- WhatsApp principal, destino del formulario de contacto: +57 321 761 7958.
- WhatsApp secundario: +57 310 637 3483 (Jorge Castillo, fundador).
- Correo visible en el sitio: jorge.castillo@piycsas.com.
- Instagram: https://www.instagram.com/piyc_sas/

## Backend / Supabase

Tres migraciones, no más (detalle y motivo en `docs/PLAN_INICIAL_PIYC.md` §7):

- `0001_contenido.sql` — `profiles`, `site_services`, `site_projects`, `site_values`, `site_settings`. RLS: `SELECT` público solo de lo `published`; escritura solo con `is_content_editor()`. Storage: bucket público `site-images` (`inicio/`, `nosotros/`, `servicios/`, `proyectos/`, `cabeceras/`).
- `0002_jornadas.sql` — `jornadas`, `horarios_mensuales`. `desglose` + `contexto_calculo` + `calculado_at` desde el día uno; se congelan al aprobar. RLS: el empleado ve e inserta solo lo suyo mientras está `pendiente`; el manager ve, aprueba, rechaza y elimina todo.
- `0003_mensajes.sql` — `site_mensajes`. Una sola política: `SELECT` para `is_manager()`. Nunca `INSERT` para `anon` — se inserta desde el servidor con la clave service-role.

Variables de entorno en Vercel: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY` (solo servidor), `NEXT_PUBLIC_SITE_URL`. `SUPABASE_ACCESS_TOKEN` es personal, solo local (CLI / Management API) — nunca en Vercel ni en el repo.

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
13. **El sitio no puede parecerse al de GPI.** Son empresas aliadas que comparten espacio físico. Nada de verde, nada de tema ambiental ("ambiental", hojas, sostenibilidad), otra retícula y ritmo (si GPI usa tarjetas con sombra y hero centrado, PIYC no), otra tipografía. Verificable poniéndolos lado a lado.
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
