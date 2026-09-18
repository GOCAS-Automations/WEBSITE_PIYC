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
