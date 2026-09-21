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
