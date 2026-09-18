# Plan inicial — `website_PIYC`

**Sitio web institucional + panel administrativo + módulo de jornadas para PIYC Programación Industrial y Control S.A.S.**

| | |
|---|---|
| **Cliente** | PIYC Programación Industrial y Control S.A.S. · NIT 901.161.923 |
| **Contacto** | Jorge Castillo, fundador · +57 310 637 3483 · jorge.castillo@piycsas.com |
| **Contrato** | COT-2026-09-PIYC-01 · $2.000.000 COP · 50/50 · **7 días hábiles** |
| **Anticipo** | Cuenta de cobro N° 001 · 2026 — aceptada |
| **Dominio** | `piycsas.com` (propiedad de PIYC, en Google Workspace) |
| **Ejecutor** | Claude Code |
| **Fecha del plan** | 18 de septiembre de 2026 |

---

## 0. Cómo usar este documento

Este es el **plan de arranque**, no la documentación viva del proyecto. Se lee una vez al inicio, se ejecuta, y a partir de ahí la fuente de verdad pasa a ser `AGENTS.md` + `docs/MEMORIA.md` dentro del repo (sección 10).

Orden de lectura para el primer día:

1. Este plan, completo.
2. La sección 12 — **lecciones de GPI** — dos veces. Ahí están los errores que ya costaron días en el proyecto anterior.
3. `node_modules/next/dist/docs/` de la guía que corresponda, antes de escribir código. Next 16 tiene cambios que no están en el entrenamiento del modelo.

No leer el repo de GPI completo. La sección 3 dice exactamente qué archivos se copian; el resto es ruido que quema contexto.

---

## 1. Qué se construye

Tres piezas que trabajan juntas sobre una misma base de datos:

1. **Sitio público** — la cara de PIYC: inicio, nosotros, servicios, proyectos, contacto.
2. **Panel administrativo** — para que PIYC edite ese contenido sin tocar código.
3. **Módulo de jornadas** — registro y control del trabajo en campo, con aprobación y cálculo de horas extra.

El alcance contratado está en `04_Comercial/Cotizacion_PIYC_17sep2026.pdf` (carpeta GOCAS). **Ese PDF manda.** Si algo de este plan lo contradice, gana el PDF; si algo se pide fuera de él, se cotiza aparte.

---

## 2. Decisiones ya tomadas

No volver a discutirlas. Fueron decididas por Cesar el 18-sep-2026.

### 2.1 Proyecto nuevo, no fork de GPI

Se crea un Next.js limpio y se **copian a mano solo los módulos** que valen la pena. Razón: el diseño de PIYC tiene que ser genuinamente distinto del de GPI, y arrancar de un fork empuja a conservar la capa visual "porque ya está". Además GPI arrastra decisiones tomadas para su caso (redirecciones del sitio viejo de GoDaddy, SMTP de secureserver, categorías industrial/ambiental) que en PIYC no aplican.

**Qué se copia de `FREELANCE/GPI/website_GPI`** — lógica, no presentación:

| Origen | Qué es | Cómo se copia |
|---|---|---|
| `src/lib/jornada.ts` | Cálculo de horas extra, recargos, festivos. Módulo puro. | Casi tal cual. Revisar festivos 2026/2027. |
| `src/lib/horarios.ts` | Horario mensual → jornada ordinaria del día. | Tal cual. |
| `src/lib/usuarios.ts` | Login por usuario (correo sintético), etiquetas de nombre. | Cambiar el dominio sintético a `@cuentas.piycsas.com`. |
| `src/lib/slug.ts`, `src/lib/youtube.ts` | Utilidades puras. | Tal cual. |
| `src/lib/supabase/*` | Clientes de Supabase (server, browser, service-role). | Tal cual. |
| `src/lib/imagenes.ts` | Decide si una URL pasa por el optimizador. | Tal cual (ver sección 9). |
| `src/lib/content.ts` | Lectura de contenido con respaldo estático. | Adaptar al modelo de datos de PIYC. |
| `supabase/migrations/0001…0004` | Estructura de contenido, jornadas, horarios, congelado. | **Rehacer consolidadas** en 3 migraciones (sección 7), no copiar las 4. |
| `src/components/admin/*` | Formularios, shell, campo de imagen, punto de carga. | Copiar la mecánica, **rehacer el estilo**. |
| `src/components/jornadas/*` | Tabla, revisión, desglose. | Copiar la mecánica, rehacer el estilo. |

**Qué NO se copia:** ninguna página pública, ningún componente de `src/components/sections/`, ningún dato de `src/data/`, `next.config.ts` completo (solo las partes señaladas en las secciones 8 y 9), nómina, calendario, volante PDF.

### 2.2 Alcance de jornadas: jornadas + horarios mensuales

La cotización cubre registro, consulta con filtros, edición, totales, exportación y acceso por rol. Se suman **horarios mensuales** porque sin ellos el cálculo de horas extra no tiene contra qué comparar: la jornada ordinaria de cada día sale de ahí.

**Fuera de alcance, explícitamente:** nómina, volante de pago en PDF, calendario de programación, métricas con Recharts. Existen en GPI; aquí no entran. Si PIYC los pide, se cotizan aparte.

### 2.3 Diseño: paleta derivada del logo

PIYC no tiene manual de marca. El logo está en el Drive (`Logo PIyC - copia.bmp`). El primer día se extraen sus colores, se arma una paleta industrial y **se le muestra a Cesar antes de aplicarla a todo el sitio**.

**Regla que no se rompe: el sitio de PIYC no puede parecerse al de GPI.** Son empresas aliadas que comparten espacio físico; dos sitios gemelos se notan de inmediato y desprestigian a ambas. Concretamente:

- **Nada de verde.** GPI es verde y gris. PIYC va por otro lado: acero, azul industrial, naranja de seguridad, grafito — lo que dé el logo.
- **Sin tema ambiental.** Ni hojas, ni sostenibilidad, ni "ambiental" en ninguna parte. PIYC es programación industrial y control, punto.
- **Otra retícula y otro ritmo.** Si GPI usa tarjetas con sombra suave y hero centrado, PIYC no. Cambiar la estructura, no solo los colores.
- **Otra tipografía.**

---

## 3. Stack

Igual al de GPI porque está probado en producción, con las versiones al día:

- **Next.js 16** (App Router, carpeta `src/`), **React 19**, **TypeScript**, **Tailwind CSS v4**.
- **Supabase** — PostgreSQL, Auth y Storage. Proyecto propio de PIYC (lo crea Cesar; migrará al de GOCAS cuando entre la mensualidad).
- **nodemailer** para el formulario de contacto. Va en `serverExternalPackages`.
- **Vercel** para el deploy. Cuenta de GOCAS.
- Sin librería de componentes, sin framework de animación, sin gestor de estado. No hacen falta.

```bash
npx create-next-app@latest website_PIYC --typescript --tailwind --app --src-dir --eslint
```

Comandos del proyecto: `npm run dev` · `npm run build` (**siempre antes de commitear**) · `npm run lint`.

**Repo remoto:** `https://github.com/GOCAS-Automations/WEBSITE_PIYC.git` — ya creado, en la organización **GOCAS Automations**, donde el equipo es miembro.

```bash
git remote add origin https://github.com/GOCAS-Automations/WEBSITE_PIYC.git
```

Reglas del repo:

- **Confirmar con Cesar antes de cada `git push`.** Es un repo de organización con más de un miembro mirando.
- `npm run build` limpio **antes** de cada commit. Nada se empuja sin build verde.
- `.env.local` en `.gitignore` desde el primer commit. Ninguna credencial, ninguna clave de Supabase, ninguna contraseña de SMTP en el historial — una vez empujadas quedan ahí aunque después se borren.
- Trabajo en `main` mientras sea un solo desarrollador. Si entra Tomás o Alejandra, ramas por feature y PR.
- Mensajes de commit en español, describiendo el porqué y no solo el qué.

---

## 4. Contenido: qué hay y dónde está

Todo el material lo entregó PIYC en Drive: <https://drive.google.com/drive/folders/1DlaAf5P6R9p4kPoZrUbf0d4CJo4goAd6>

Carpetas: `1. NOMBRE DEL DOMINIO` · `2. LOGO PIYC` · `3. NOMBRE DE LA EMPRESA` · `4. QUIÉNES SOMOS` · `5. DESCRIPCIÓN PRODUCTOS Y SERVICIOS` · `6. INFORMACION DE CONTACTO` · `7. PAGINA DE REFERENCIA` · `8. CUENTAS DE CORREOS ELECTRONICOS` · `9. FOTOS` · más `Copia de INFORME_CASOS DE EXITO.pptx` en la raíz.

Lo esencial ya está extraído abajo, para no volver a bajarlo.

### 4.1 Identidad

- **Razón social:** PROGRAMACIÓN INDUSTRIAL Y CONTROL SAS · NIT 901.161.923
- **Nombre comercial:** PIYC
- **Eslogan:** «Tu socio confiable en soluciones industriales»
- **Dominio:** `piycsas.com`

### 4.2 Contacto

- **WhatsApp:** +57 310 637 3483 (Jorge Castillo) · +57 321 761 7958
- **Correos:** jorge.castillo@piycsas.com · fabian.gaviria@piycsas.com · contabilidad@piycsas.com
- **Direcciones:** Carrera 4B # 30-17, B/ El Porvenir · Calle 29 # 2C-15, B/ El Porvenir
- **Instagram:** <https://www.instagram.com/piyc_sas/>

> ⚠ **La ciudad no aparece en ningún documento del Drive.** Hay que preguntarla antes de escribir el JSON-LD y el pie de página: el `LocalBusiness` con dirección incompleta es peor que sin dirección. No asumir Cali.

### 4.3 Quiénes somos

> Somos una empresa integrada por ingenieros altamente calificados, especializados en el desarrollo de proyectos de ingeniería, montaje y mantenimiento de equipos eléctricos y electrónicos. Nos dedicamos a la automatización de equipos, así como a la ejecución de obras eléctricas y electrónicas. Nuestro enfoque abarca desde la automatización y control hasta el desarrollo de equipos de óptima calidad.

**Visión** (según el documento): proveer soluciones innovadoras en desarrollo, mantenimiento y control de proyectos de ingeniería, adaptándose a las necesidades específicas de cada cliente, con estándares de alta calidad y cultura de mejora continua.

**Misión** (según el documento): posicionarse como el proveedor líder de servicios para el sector industrial, reafirmando su profesionalismo al transformar cada idea en soluciones efectivas, con equilibrio entre las necesidades del cliente, el compromiso, los altos estándares de calidad y los resultados.

> ⚠ **Misión y visión parecen estar intercambiadas** en el documento de PIYC: lo rotulado «visión» describe lo que la empresa hace hoy (misión) y lo rotulado «misión» describe a dónde quiere llegar (visión). **No corregirlo por cuenta propia** — preguntarle a Jorge. Mientras responde, dejarlo tal como lo escribieron ellos.

**Valores** — cuatro, cada uno con su párrafo en el documento:

| Valor | Idea central |
|---|---|
| Integridad | Lazos de confianza, claridad y honestidad en los procesos. |
| Compromiso | Cumplir los parámetros establecidos; los buenos procesos como forma de trabajo. |
| Orientación al cliente | Entender y satisfacer exigencias, acompañamiento real, vínculos duraderos. |
| Innovación | Renovar y potenciar productos y servicios; estar a la vanguardia de la industria. |

> El documento trae **dos versiones de cada bloque**: la original y una reescritura más pulida. **Usar siempre la segunda.**

### 4.4 Servicios

Introducción del portafolio:

> Ofrecemos servicios de alta calidad para dar soluciones asertivas reduciendo el riesgo y dando la seguridad de que nuestra propuesta es la mejor, brindando tranquilidad y respaldo a cada cliente en su proceso de producción.

Servicios declarados:

1. Diseño y desarrollo de proyectos de ingeniería eléctrica
2. Automatización de procesos industriales — control PLC, monitoreo HMI/SCADA
3. Ensamble de tableros de control y potencia
4. Telemetría
5. Telecontrol
6. Venta e instalación de proyectos llave en mano
7. Aplicaciones industriales
8. Refrigeración industrial y cuartos fríos — mantenimiento profesional
9. Aires acondicionados — venta, reparación y mantenimiento

> Son **9 servicios planos, sin categorías**. No replicar el split «industrial / ambiental» de GPI: aquí no existe. Si en el diseño hacen falta grupos, proponer una agrupación propia (por ejemplo *Ingeniería y control* / *Climatización y refrigeración*) y **validarla con Jorge**, no inventarla en silencio.
>
> Los textos 4, 5 y 7 (telemetría, telecontrol, aplicaciones industriales) vienen como una sola línea. Hay que **pedirle a Jorge un párrafo por servicio** o redactarlos y mandárselos a aprobar. Una página de servicio con una sola frase no posiciona en Google ni convence a nadie.

### 4.5 Fotos

**40 archivos** en `9. FOTOS`: 14 PNG (`FOTO 1` a `FOTO 14`) y 25 JPG con nombre de cámara, más un MP4 de 26 MB.

⚠ **Pesan muchísimo**: varias superan 4 MB y el total ronda los 90 MB. Con el optimizador de Vercel apagado (sección 9) se servirían **tal cual**. Antes de subir cualquiera al bucket hay que procesarlas:

```bash
# Objetivo: ≤ 250 KB por foto de contenido, ≤ 400 KB las de hero.
# WebP, ancho máximo 1920 px, calidad 82.
for f in *.png *.jpg; do
  cwebp -q 82 -resize 1920 0 "$f" -o "${f%.*}.webp"
done
```

El MP4 no se sube al bucket: si PIYC quiere video, va a YouTube y se incrusta con el facade sin cookies.

Hay que **catalogar las fotos con Jorge** — cuál es cada proyecto, en qué servicio va cada una. Sin eso el `alt` queda genérico y se pierde el SEO de imagen.

### 4.6 Casos de éxito

`Copia de INFORME_CASOS DE EXITO.pptx` (14 MB) es la fuente de la sección de proyectos. Extraer el texto y las imágenes con `python-pptx`, no a mano:

```python
from pptx import Presentation
prs = Presentation("INFORME_CASOS_DE_EXITO.pptx")
for i, slide in enumerate(prs.slides, 1):
    for shape in slide.shapes:
        if shape.has_text_frame:
            print(i, shape.text_frame.text)
```

De cada caso hay que sacar: título, cliente, qué se hizo, resultado y fotos. Eso alimenta `site_projects` y las páginas `/proyectos/[slug]`.

---

## 5. Arquitectura de información

### 5.1 Sitio público

| Ruta | Contenido |
|---|---|
| `/` | Hero con eslogan, qué hace PIYC, servicios destacados, casos de éxito, valores, CTA de contacto |
| `/nosotros` | Quiénes somos, misión, visión, valores, galería |
| `/servicios` | Hub con los 9 servicios |
| `/servicios/[slug]` | Página por servicio: descripción, ítems, galería, CTA |
| `/proyectos` | Casos de éxito en tarjetas clicables |
| `/proyectos/[slug]` | Página por proyecto: contexto, solución, resultado, galería |
| `/contacto` | Datos, dos direcciones, mapa, formulario con envío real |

Todas estáticas con ISR (`export const revalidate = 300`). El sitio público **nunca** se vuelve dinámico.

### 5.2 Panel — `/admin`

Menú de **cuatro entradas**, no más:

1. **Dashboard** — resumen y accesos rápidos
2. **Contenido del sitio** — hub con tarjetas hacia: inicio, nosotros, servicios, proyectos, valores, páginas, ajustes
3. **Equipo** — cuentas, roles, horarios mensuales
4. **Jornadas** — registro, aprobaciones, exportación

### 5.3 Portal del empleado — `/mi-cuenta`

Login con marca PIYC. Registrar jornada, ver historial, cambiar contraseña. Quien tiene panel ve además el botón «Ir al panel».

### 5.4 Roles

| Rol | Puede |
|---|---|
| `admin` | Todo |
| `coordinador` | Todo menos crear/eliminar administradores |
| `empleado` | Solo su portal de jornadas |

Tres roles. GPI tiene cuatro porque necesitaba un Community Manager; PIYC no lo ha pedido. **No agregar roles "por si acaso"** — cada rol es una matriz de RLS que hay que probar.

---

## 6. Identidad visual — primer entregable

**Antes de maquetar nada**, el día 1:

1. Convertir el BMP del logo a PNG con transparencia y a SVG si se puede vectorizar limpio. Si no, pedirle a Jorge el vectorial.
2. Extraer la paleta dominante del logo.
3. Construir una paleta de 5 colores: base oscura, base clara, un acento, un neutro medio y un color de estado.
4. Elegir dos tipografías vía `next/font` (autoalojadas — nunca `<link>` a Google Fonts, rompe la CSP y suma una petición bloqueante).
5. Montar **una sola pantalla de muestra** — el hero de inicio con la paleta y las tipografías aplicadas — y mandársela a Cesar.

Recién con el visto bueno se maqueta el resto. Hacer 7 páginas y después descubrir que la paleta no gusta es perder dos días de los siete.

Los tokens van en `src/lib/tokens.ts` y se consumen desde Tailwind v4 con `@theme`. Ningún color escrito a mano en un componente.

---

## 7. Modelo de datos

**Tres migraciones**, no once. GPI llegó a once porque fueron once iteraciones en el tiempo; aquí se sabe desde el principio a dónde se va.

### `0001_contenido.sql`

```
profiles            id(uuid,fk auth.users) · username · full_name · role(admin|coordinador|empleado)
                    · cargo · phone · cedula · email_contacto · active · created_at · updated_at
site_services       id · slug(unique) · title · nav_title · icon_key · summary · description
                    · items(jsonb) · images(jsonb) · meta_title · meta_description · sort · published
site_projects       id · slug(unique) · title · client · description · body · images(jsonb)
                    · sort · published
site_values         id · title · description · icon_key · sort
site_settings       key(pk) · value(jsonb) · updated_at
```

Claves de `site_settings`: `home`, `nosotros`, `paginas`, `contact`, `seo`, `jornada_config`.

**RLS:** `SELECT` público solo de lo `published`; escritura solo si `is_content_editor()`.

**Storage:** bucket público `site-images` con carpetas `inicio/`, `nosotros/`, `servicios/`, `proyectos/`, `cabeceras/`.

### `0002_jornadas.sql`

```
jornadas            id · employee_id(fk profiles) · work_order(nullable) · work_date
                    · start_at · end_at · description · observations
                    · status(pendiente|aprobada|rechazada) · review_note · reviewed_by · reviewed_at
                    · desglose(jsonb) · contexto_calculo(jsonb) · calculado_at
horarios_mensuales  id · anio · mes · dias(jsonb) · notas · unique(anio,mes)
```

`desglose` + `contexto_calculo` + `calculado_at` **van desde el día uno**. En GPI llegaron en la migración 0004 y hubo que retro-encajarlos. El desglose se congela al aprobar: corregir un horario después no debe alterar una jornada ya aprobada.

**RLS:** el empleado ve e inserta solo lo suyo mientras está `pendiente`; el manager ve, aprueba, rechaza y elimina todo.

### `0003_mensajes.sql`

```
site_mensajes       id · nombre · empresa · email · telefono · mensaje · enviado · ip_hash · created_at
```

**Una sola política: `SELECT` para `is_manager()`.** Nunca una política de `INSERT` para `anon` — se inserta desde el servidor con la clave service-role.

### Reglas de la capa de datos

- **`src/lib/content.ts` cae en `src/data/*` si no hay env vars o si la consulta falla.** El sitio público nunca queda en blanco por un problema de base de datos.
- **`undefined` ≠ vacío**: columna ausente → migración pendiente → respaldo estático. Columna presente y vacía → decisión del panel → se respeta.
- Toda server action valida rol **en el servidor** y llama `revalidatePath`.

---

## 8. SEO

Se aplica desde el primer commit, no al final.

**Metadata**

- `metadataBase` en el layout raíz.
- `title` con plantilla: `{ default: "PIYC — …", template: "%s | PIYC" }`.
- `description` propia por página. Nada duplicado.
- `alternates.canonical` en todas.
- OpenGraph y Twitter Card con imagen 1200×630 por página.
- `lang="es-CO"`.

**Archivos**

- `src/app/sitemap.ts` — generado desde Supabase, con todos los slugs.
- `src/app/robots.ts` — `Disallow: /admin`, `/mi-cuenta`, `/api`.
- `src/app/manifest.ts`, favicon en todos los tamaños.

**Datos estructurados** (JSON-LD, `<script type="application/ld+json">`)

- `Organization` + `LocalBusiness` en el layout: nombre, logo, las dos direcciones, teléfonos, correo, `sameAs` con Instagram, horario.
- `Service` en cada `/servicios/[slug]`.
- `BreadcrumbList` en las páginas internas.
- `WebSite` con `potentialAction` si hay buscador.

**Contenido**

- Un solo `<h1>` por página, y que diga algo.
- Jerarquía `h2`/`h3` real, no elegida por tamaño de letra.
- `alt` descriptivo en cada imagen — sale del catálogo de fotos con Jorge, no de `"imagen 1"`.
- URLs en español, con guiones, sin tildes: `/servicios/automatizacion-de-procesos-industriales`.
- Texto de enlace con sentido. Nunca «clic aquí».

**Rendimiento** (es factor de posicionamiento)

- `width` y `height` en toda imagen → sin CLS.
- `priority` solo en la imagen del hero.
- `loading="lazy"` en el resto.
- Tipografías con `next/font`, `display: swap`, autoalojadas.
- Presupuesto: **LCP < 2,5 s · CLS < 0,1 · INP < 200 ms** en móvil con 4G simulada. Se mide con Lighthouse antes de entregar.

**Cabeceras de seguridad** — copiar el bloque de `next.config.ts` de GPI (CSP, HSTS, `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy`, `X-Frame-Options`), ajustando los orígenes. Google las valora y cierran vectores reales.

**No aplica de GPI:** las redirecciones 308 del sitio viejo. PIYC no tiene sitio anterior que migrar. **Confirmar con Jorge** si hubo alguno indexado; si lo hubo, hacer el mapeo.

**Al entregar:** dar de alta el sitio en Google Search Console y enviar el sitemap. Es un paso de 10 minutos que casi siempre se olvida.

---

## 9. Imágenes: optimizador apagado

```ts
// next.config.ts
images: {
  unoptimized: true,
  remotePatterns: [
    { protocol: "https", hostname: "**.supabase.co", pathname: "/storage/v1/object/public/**" },
    { protocol: "https", hostname: "res.cloudinary.com", pathname: "/**" },
  ],
},
```

**Por qué:** la cuenta Hobby de GOCAS en Vercel ya agotó su cupo de transformaciones con GPI. Con el optimizador encendido, `/_next/image` devolvería error y las fotos de PIYC se verían rotas. Con `unoptimized` se sirven tal cual desde el bucket: no hay cupo que agotar.

**Lo que esto obliga:**

1. **Comprimir antes de subir.** Ninguna imagen entra al bucket sin pasar por WebP a 1920 px de ancho máximo. Sin optimizador no hay red de seguridad: lo que se sube es lo que descarga el visitante.
2. **`remotePatterns` se conserva** aunque hoy no haga efecto, por si algún día se activa el plan Pro.
3. **Toda imagen de contenido se pinta con `ContentImage`**, nunca con `next/image` directo. `next/image` se reserva para el *chrome* (logo del nav y del pie, favicon).
4. **`HOSTS_IMAGEN_OPTIMIZABLES` de `src/lib/imagenes.ts` y `images.remotePatterns` son la misma lista escrita dos veces: se tocan juntas.**
5. **En la base de datos nunca van rutas `/images/`.** Todo va al bucket o a una URL externa permitida. El panel avisa en ámbar si el usuario pega una URL de un host no permitido — la CSP la bloquearía.

---

## 10. Archivos de contexto y economía de tokens

### `CLAUDE.md` (raíz)

Una línea:

```
@AGENTS.md
```

Así hay un solo archivo de instrucciones y Claude Code lo lee por la referencia. Duplicar el contenido en dos archivos garantiza que se desincronicen.

### `AGENTS.md` (raíz) — la fuente de verdad

Es el archivo que se carga en **cada** sesión, así que cada línea cuesta tokens en cada turno. Máximo ~250 líneas. Estructura:

```markdown
<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know
Esta versión tiene cambios de ruptura. Leer la guía correspondiente en
`node_modules/next/dist/docs/` antes de escribir código.
<!-- END:nextjs-agent-rules -->

# website_PIYC — Sitio de PIYC (piycsas.com)

## Stack y comandos
## Estructura del sitio y del panel
## Marca (paleta, tipografías, tono)
## Datos de contacto oficiales
## Backend / Supabase (tablas, RLS, env vars, migraciones)
## Reglas que no se negocian   ← la sección 12 de este plan
## Flujo de trabajo con agentes
```

**Qué NO va en `AGENTS.md`:** historial de iteraciones. GPI lo hizo y su roadmap creció hasta ocupar la mitad del archivo — se paga en cada sesión y casi nunca se consulta. El historial va en `docs/MEMORIA.md`.

### `docs/MEMORIA.md` — bitácora

Append-only, se lee **solo cuando hace falta**. Una entrada por sesión:

```markdown
## 2026-09-22 · Módulo de jornadas
**Hecho:** migración 0002 aplicada; CRUD de jornadas; aprobación de managers.
**Decisiones:** el desglose se congela al aprobar (`obtenerDesglose()` es la única
lectura válida sobre una jornada guardada).
**Tropiezos:** RLS de `profiles` no deja a un empleado leer a sus compañeros →
se resuelve con la clave de servicio en `mapaDePerfiles()`.
**Siguiente:** exportación CSV y pantalla de horarios.
```

Al cerrar cada sesión: escribir la entrada, y **solo si cambió una regla permanente**, actualizar `AGENTS.md`.

### `docs/` — el resto

- `CONTENIDO.md` — textos e inventario de imágenes. Fuente de verdad del contenido.
- `ADMIN.md` — manual del panel para PIYC. Se escribe al final, es entregable.
- `PLAN_PRUEBAS.md` — checklist de QA.

### Reglas de consumo de tokens

1. **Grep antes que Read.** Buscar el símbolo y leer el rango, no el archivo completo.
2. **Nunca leer `node_modules/`** salvo la guía puntual de Next que haga falta.
3. **Nunca leer el repo de GPI completo.** Solo los archivos de la tabla 2.1.
4. **Delegar en agentes.** El hilo principal analiza, planea y verifica builds. La ejecución va a subagentes: Opus para features y backend, Sonnet para arreglos visuales y documentos. Una edición de una línea no amerita agente.
5. **No pegar salidas largas en el chat.** Un build que falla: leer el error, no volcar los 400 renglones.
6. **Un tema por sesión.** «Hoy jornadas» rinde más que saltar entre panel, SEO y diseño.
7. **No releer un archivo recién editado** para verificar. Si `Edit` no falló, el cambio está.

---

## 11. Plan por fases — 7 días hábiles

El conteo arranca el día hábil siguiente a que el anticipo esté confirmado **y** PIYC haya entregado material y accesos. Si el material llega tarde, el cronograma se corre en la misma proporción (está en la cotización).

### Día 1 — Fundaciones e identidad

- `create-next-app`, repo, estructura de carpetas.
- `CLAUDE.md`, `AGENTS.md`, `docs/MEMORIA.md`.
- `next.config.ts`: cabeceras de seguridad, `images.unoptimized`, `serverExternalPackages`.
- Logo convertido, paleta extraída, tipografías elegidas, `src/lib/tokens.ts`.
- **Entregable: pantalla de muestra del hero → aprobación de Cesar.**
- Proyecto de Supabase creado, `.env.local` cargado, migración `0001` aplicada.

### Día 2 — Contenido y capa de datos

- Extraer el PPTX de casos de éxito; procesar las 40 fotos a WebP; subirlas al bucket.
- `docs/CONTENIDO.md` con todos los textos y el catálogo de imágenes.
- `src/data/*` como respaldo estático; `src/lib/content.ts` con su fallback.
- Semillas de los 9 servicios, los casos de éxito y los 4 valores.

### Día 3 — Sitio público, parte 1

- Layout, header, footer, botón flotante de WhatsApp.
- `/` y `/nosotros` completas.
- SEO base: `metadataBase`, sitemap, robots, JSON-LD de organización.

### Día 4 — Sitio público, parte 2

- `/servicios`, `/servicios/[slug]`, `/proyectos`, `/proyectos/[slug]`.
- `/contacto` con formulario, envío SMTP y respaldo en `site_mensajes` (migración `0003`).
- Mapa embebido, dos direcciones.
- **Entregable: preview en Vercel → revisión de Cesar y de Jorge.**

### Día 5 — Panel administrativo

- Auth con login por usuario; `profiles`; roles.
- `AdminShell`, `loading.tsx`, `PuntoDeCarga`, `prefetch={false}`.
- CRUD de servicios, proyectos, valores, inicio, nosotros, páginas, ajustes.
- Subida de imágenes al bucket con aviso de host no permitido.

### Día 6 — Jornadas

- Migración `0002`.
- `src/lib/jornada.ts` y `src/lib/horarios.ts` adaptados; festivos revisados.
- Portal `/mi-cuenta`: registrar jornada, historial, cambio de contraseña.
- `/admin/jornadas`: listado con filtros, aprobación, rechazo, eliminación con doble confirmación, exportación CSV.
- Pantalla de horarios mensuales.

### Día 7 — QA, ajustes y entrega

- `npm run build` limpio, sin warnings.
- Lighthouse en móvil y escritorio; cumplir el presupuesto de la sección 8.
- Recorrido completo del checklist de `docs/PLAN_PRUEBAS.md`.
- Prueba de punta a punta del formulario y del flujo de jornadas con tres roles.
- `docs/ADMIN.md` y capacitación a PIYC.
- Dominio apuntado, dejando **intactos los MX y SPF de Workspace**.
- Search Console y sitemap.
- **Cuenta de cobro del saldo.**

> **Margen real: cero.** Siete días hábiles para un sitio de 7 páginas más panel más jornadas es ajustado. Si algo se atrasa, lo primero que se recorta es alcance visual de las páginas internas, nunca el QA ni la seguridad. Avisarle a Cesar el mismo día en que se detecte el atraso, no el día 7.

---

## 12. Lecciones de GPI que no hay que redescubrir

Cada una de estas costó horas o días en el proyecto anterior. Van también a `AGENTS.md`.

1. **Un Client Component nunca importa de `components/admin/ui.tsx`.** Los componentes de cliente van en `ui-base.tsx` (`"use client"`), y `ui.tsx` los reexporta. Arrastrar `ui.tsx` al grafo del navegador hace que **en producción** la respuesta de cualquier server action de esa pantalla no llegue nunca: el botón se queda en «Guardando…» aunque el dato ya esté escrito. **En desarrollo no se reproduce.** Se diagnosticó por bisección con `next build` + `next start`.

2. **La navegación del panel necesita tres piezas juntas:** `src/app/admin/loading.tsx`, el componente `PuntoDeCarga` y `prefetch={false}` en todos los `<Link>` del panel. Las rutas de `/admin` son `force-dynamic`; sin frontera de carga el router no confirma la navegación y cada clic cancela el anterior — se siente como que «el panel se traba». No quitar ninguna de las tres.

3. **RLS de `profiles` solo deja a cada quien leer su propia fila.** Cualquier pantalla que muestre nombres de compañeros necesita completar con la clave de servicio, y **solo** nombre, apodo y cargo. Sin eso los compañeros aparecen como «Cuenta eliminada».

4. **Un valor exportado desde un módulo `"use client"` no se puede leer en el servidor.** Las constantes compartidas (opciones de filtros, etiquetas) viven en `src/lib/*-types.ts`.

5. **El destinatario del formulario de contacto sale SIEMPRE de los ajustes, nunca del payload.** Tomarlo del formulario convierte el sitio en un relay abierto de spam.

6. **`mailto:` solo no sirve como respaldo:** no abre nada en equipos sin programa de correo configurado. El respaldo real es el compositor de Gmail en el navegador, con `mailto:` y WhatsApp como secundarios.

7. **Rechazar ≠ eliminar.** Decirlo en la interfaz cada vez que se toque esa pantalla. Eliminar lleva doble confirmación.

8. **Anti-spam sin terceros:** honeypot + 3 segundos mínimos (medidos contra el reloj del visitante, nunca contra el del servidor) + longitudes máximas + tope por IP. Sin captcha.

9. **Nunca exponer una función service-role a `anon`.** La clave anónima es pública.

10. **`0` nunca se muestra como dato.** Si el contador o la métrica no tienen valor, no se pinta la tarjeta.

11. **CSP: `script-src` necesita `'unsafe-inline'`.** La alternativa (nonce) obliga a renderizado dinámico en todas las páginas y mata el ISR. El resto de la CSP sí va estricto.

12. **Cargar una variable de entorno en Vercel no basta: hay que volver a desplegar.** Las páginas estáticas deciden en el build.

13. **Español de Colombia, con tildes.** Textos revisados. El cliente los lee.

---

## 13. Criterios de aceptación

El proyecto está listo para cobrar el saldo cuando:

- [ ] `npm run build` pasa limpio, sin warnings.
- [ ] Las 7 rutas públicas responden 200 en móvil y escritorio, sin errores de consola.
- [ ] Lighthouse móvil: rendimiento ≥ 90, accesibilidad ≥ 95, buenas prácticas ≥ 95, SEO 100.
- [ ] El sitio **no se parece** al de GPI. Verificable poniéndolos lado a lado.
- [ ] `sitemap.xml` lista todas las URLs reales; `robots.txt` bloquea `/admin`, `/mi-cuenta` y `/api`.
- [ ] JSON-LD válido en el validador de resultados enriquecidos de Google.
- [ ] Las 7 cabeceras de seguridad presentes en producción.
- [ ] El formulario envía de verdad y guarda respaldo en `site_mensajes`.
- [ ] Ninguna imagen del bucket supera 400 KB.
- [ ] Todo texto e imagen del sitio es editable desde el panel, sin tocar código.
- [ ] Las tres migraciones aplicadas; RLS probado con los tres roles.
- [ ] El flujo de jornadas funciona de punta a punta: empleado registra → manager aprueba → desglose congelado → CSV exportado y suma correcto en Excel.
- [ ] `docs/ADMIN.md` entregado y PIYC capacitado.
- [ ] Dominio apuntado, HTTPS activo, **correo de Workspace funcionando sin interrupción**.

---

## 14. Pendientes con PIYC

Estas preguntas bloquean partes del trabajo. Mandárselas a Jorge **el día 1**, todas juntas:

1. **¿En qué ciudad están?** No aparece en ningún documento. Bloquea el JSON-LD y el pie de página.
2. **¿Misión y visión están intercambiadas?** El documento las tiene cruzadas.
3. **Un párrafo por servicio** para telemetría, telecontrol y aplicaciones industriales — o aprobación de los que redactemos.
4. **Catálogo de fotos:** qué proyecto o servicio corresponde a cada una.
5. **¿Hubo un sitio web anterior en `piycsas.com`?** Si Google tiene URLs indexadas, hay que redirigirlas.
6. **Logo en vectorial** (SVG o AI). El BMP del Drive no sirve para pantallas de alta densidad.
7. **¿Quién revisa y aprueba** de su lado? Un solo interlocutor (está en las condiciones de la cotización).
8. **Reglas del módulo de jornadas:** horario laboral ordinario, si hay hora de almuerzo descontada, quién aprueba, y si necesitan orden de trabajo obligatoria u opcional.
9. **Cuentas iniciales:** nombres, cédulas, cargos y roles de quienes van a usar el sistema.
10. **Correo del formulario:** ¿a cuál de los tres llegan los mensajes?

---

## 15. Notas de infraestructura

- **Supabase:** por ahora un proyecto propio de PIYC, creado por Cesar con los accesos que dieron. Cuando entre la mensualidad de 40.000 COP/mes, migra al Supabase de GOCAS. **Dejar documentado en `docs/MEMORIA.md` qué habría que mover** (bucket, tablas, usuarios de Auth) para que la migración no sea una arqueología.
- **Vercel:** cuenta de GOCAS, plan Hobby. De ahí viene lo del optimizador apagado.
- **Dominio:** sigue siendo de PIYC. Solo se apuntan los registros DNS. **No tocar MX ni SPF** — de eso depende su correo.
- **Credenciales:** ninguna en el repo, ninguna en un archivo de texto. `.env.local` está en `.gitignore`. La contraseña de la cuenta Google de PIYC **no se guarda**: hay que pedirles una cuenta de administrador delegado con permisos mínimos.
