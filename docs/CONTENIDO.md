# Contenido del sitio — fuente de verdad

Este archivo es **el texto final** que va a la base de datos y al respaldo estático.
Si un texto se cambia aquí, hay que cambiarlo también en `supabase/seed/*.sql` y en
`src/data/*.ts`; si se cambia en el panel, hay que traerlo aquí. No es un borrador.

- **Casos de éxito:** redactados a partir de `docs/Copia de INFORME_CASOS DE EXITO.pptx`
  (19 diapositivas; los casos están en la 8 a la 18). Semilla: `supabase/seed/proyectos.sql`,
  aplicada en Supabase. Respaldo: `src/data/proyectos.ts`.
- **Imágenes:** todas procesadas a WebP y subidas al bucket público `site-images`.
  Inventario completo más abajo. Respaldo de las generales: `src/data/imagenes.ts`.
- Las secciones **Servicios**, **Nosotros** e **Inicio** quedan con encabezado y vacías:
  las llena otro agente.

---

## 1. Casos de éxito

Seis casos. El PPTX nunca dice "proyecto X para el cliente Y": rotula cada lámina con
frases tipo «EMPRESA DE PRODUCTOS CUIDADO PERSONAL JGB». Los nombres de cliente que
aparecen abajo salen de esos rótulos y de los logotipos visibles en las capturas de HMI
(Alival, B·Altman). **Cesar confirmó el 21-sep-2026 que los clientes SÍ se nombran**:
los seis casos se publican con `client` puesto. La regla que sigue en pie es la otra —
**no se publica nada que no esté en los documentos de PIYC**: ni una cifra, ni una
marca, ni un modelo, ni un resultado que no salga del PPTX.

### Automatización de la preparación y dosificación de alcohol

- **slug:** `preparacion-alcohol-jgb`
- **Cliente:** JGB — empresa de productos de cuidado personal
- **Servicios relacionados:** `diseno-ingenieria-electrica` · `automatizacion-procesos-industriales` · `tableros-de-control` · `proyectos-llave-en-mano`
- **Diapositivas de origen:** S10, S9

**Descripción** (tarjeta y `meta description`, 107 caracteres):

> Diseño P&ID, tablero, PLC e instrumentación para la preparación de alcohol en JGB: de 3 a 8 baches por día.

**Cuerpo:**

> JGB necesitaba un sistema de control nuevo para la preparación y dosificación de alcohol en su planta de productos de cuidado personal. El proceso trabajaba por formulación y su rendimiento estaba limitado a 3 baches por día.
>
> PIYC diseñó el P&ID del nuevo sistema de control y suministró el tablero eléctrico, el PLC, el sistema neumático y la instrumentación de campo, además de ejecutar la instalación electromecánica del proyecto. Sobre un PLC Micro800 se programó la lógica de preparación y dosificación por formulación, se desarrolló la HMI de operación y se configuró la instrumentación de campo E&H: interruptores de nivel y medición de flujo por efecto Coriolis.
>
> El resultado lo midió el mismo proceso: de 3 baches por día antes de la automatización se pasó a 8 baches por día después de ella.

**Fotos** (`proyectos/preparacion-alcohol-jgb/`, la primera es la portada):

| # | Archivo | Dimensiones | Peso | `alt` |
|---|---|---|---|---|
| 1 | `caso-preparacion-alcohol-jgb-01.webp` | 996×745 | 58 KB | Pantalla HMI del sistema de preparación de alcohol con los tanques de preparación y dosificación, las bombas y los totalizadores de alcohol y agua |
| 2 | `caso-preparacion-alcohol-jgb-02.webp` | 1016×629 | 37 KB | Plano P&ID del sistema de alcohol: tanques de preparación, dosificación y almacén, con sus válvulas e instrumentación |
| 3 | `caso-preparacion-alcohol-jgb-03.webp` | 1097×772 | 38 KB | Plano eléctrico del tablero de control del sistema de preparación de alcohol |

### Automatización del pasteurizador de 10.000 litros

- **slug:** `pasteurizador-alival`
- **Cliente:** Alival — empresa de productos alimenticios
- **Servicios relacionados:** `automatizacion-procesos-industriales` · `tableros-de-control` · `aplicaciones-industriales` · `proyectos-llave-en-mano`
- **Diapositivas de origen:** S13, S11, S12

**Descripción** (tarjeta y `meta description`, 131 caracteres):

> Cambio del sistema de control del pasteurizador de 10.000 L de Alival: PLC Schneider M580, HMI por recetas e instrumentación nueva.

**Cuerpo:**

> Alival contrató el cambio del sistema de control y el suministro de materiales para automatizar su pasteurizador de 10.000 litros. Las fotografías del antes muestran con qué venía operando el equipo: válvulas de control desgastadas y una válvula reguladora de presión de aire en mal estado.
>
> PIYC suministró los materiales y ejecutó la automatización del equipo. El control quedó sobre un PLC Schneider M580, con la lógica de pasteurización y termización de los distintos productos programada para trabajar por recetas. Se desarrollaron las pantallas HMI de operación, datos de proceso y selección de receta, y se configuró la instrumentación de campo E&H de nivel y presión.
>
> El pasteurizador quedó operando con instrumentación nueva y con un sistema de control en el que cada producto se selecciona como una receta del sistema.

**Fotos** (`proyectos/pasteurizador-alival/`, la primera es la portada):

| # | Archivo | Dimensiones | Peso | `alt` |
|---|---|---|---|---|
| 1 | `caso-pasteurizador-alival-01.webp` | 584×317 | 28 KB | Pantallas HMI del pasteurizador de 10.000 litros: operación, datos de proceso y selección de recetas |
| 2 | `caso-pasteurizador-alival-02.webp` | 675×724 | 42 KB | Válvula de control neumática desgastada del pasteurizador, antes de la intervención |
| 3 | `caso-pasteurizador-alival-03.webp` | 520×694 | 42 KB | Válvula de control nueva con posicionador, instalada en la línea del pasteurizador |
| 4 | `caso-pasteurizador-alival-04.webp` | 768×730 | 30 KB | Válvula reguladora de presión de aire oxidada, estado del equipo antes de la automatización |
| 5 | `caso-pasteurizador-alival-05.webp` | 720×1280 | 56 KB | Transmisor digital de campo instalado sobre la tubería del pasteurizador |
| 6 | `caso-pasteurizador-alival-06.webp` | 658×493 | 42 KB | Línea de proceso en acero inoxidable del pasteurizador con la instrumentación ya montada |

### Estación de cargue con despacho por medidor y tiquete en línea

- **slug:** `estacion-cargue-alival`
- **Cliente:** Alival — empresa de productos alimenticios
- **Servicios relacionados:** `diseno-ingenieria-electrica` · `automatizacion-procesos-industriales` · `telemetria` · `telecontrol` · `tableros-de-control` · `proyectos-llave-en-mano`
- **Diapositivas de origen:** S14

**Descripción** (tarjeta y `meta description`, 143 caracteres):

> Automatización del sistema de cargue de Alival: PLC Schneider M241, despacho controlado por medidor y tiquete en línea contra la base de datos.

**Cuerpo:**

> El despacho de producto en la estación de cargue de Alival necesitaba quedar controlado y con registro de cada operación.
>
> PIYC diseñó el P&ID del proceso de cargue y la estrategia de control, suministró los equipos y el tablero eléctrico con PLC, y ejecutó la instalación electromecánica del proyecto. El control quedó sobre un PLC Schneider M241, con programación de despacho por baches y conectividad con la base de datos de la planta de Caloto. Se configuró instrumentación de campo E&H: interruptores de nivel, transmisor de temperatura y transmisor de flujo electromagnético.
>
> El despacho quedó controlado por medidor y cada operación genera un tiquete en línea con la placa del vehículo, la cantidad cargada, la temperatura y la fecha y hora.

**Fotos** (`proyectos/estacion-cargue-alival/`, la primera es la portada):

| # | Archivo | Dimensiones | Peso | `alt` |
|---|---|---|---|---|
| 1 | `caso-estacion-cargue-alival-01.webp` | 1109×883 | 61 KB | Pantalla HMI de la estación de cargue con el volumen programado, el volumen cargado, el caudal y la temperatura del producto |
| 2 | `caso-estacion-cargue-alival-02.webp` | 681×828 | 65 KB | Tablero eléctrico de la estación de cargue con variador Schneider, PLC, protecciones y borneras |

### Ingeniería eléctrica y sistema de control tipo DCS

- **slug:** `ingenieria-control-b-altman`
- **Cliente:** B. Altman — empresa de alimentos
- **Servicios relacionados:** `diseno-ingenieria-electrica` · `automatizacion-procesos-industriales` · `tableros-de-control` · `aplicaciones-industriales` · `proyectos-llave-en-mano`
- **Diapositivas de origen:** S16, S15

**Descripción** (tarjeta y `meta description`, 141 caracteres):

> Ingeniería eléctrica, instrumentación y sistema de control tipo DCS para la planta de alimentos B. Altman: del P&ID al software en operación.

**Cuerpo:**

> B. Altman encargó a PIYC la ingeniería y el sistema de control de su planta de alimentos, desde el papel hasta el software en operación.
>
> El trabajo partió del diseño del P&ID y del desarrollo de la ingeniería eléctrica y de control. PIYC ejecutó las instalaciones eléctricas, desarrolló la estrategia de control y programó el software de automatización de la planta.
>
> Del lado del equipamiento, se suministraron, instalaron y calibraron la instrumentación de campo y las válvulas de control; se suministró e instaló el tablero de fuerza y control, y se entregaron el hardware y el software necesarios para implementar el sistema de control tipo DCS.

**Fotos** (`proyectos/ingenieria-control-b-altman/`, la primera es la portada):

| # | Archivo | Dimensiones | Peso | `alt` |
|---|---|---|---|---|
| 1 | `caso-ingenieria-control-b-altman-01.webp` | 768×1024 | 81 KB | Gabinete de control armado y cableado para el sistema de control tipo DCS de la planta de alimentos |
| 2 | `caso-ingenieria-control-b-altman-02.webp` | 609×340 | 18 KB | Pantalla SCADA del proceso, con reactor, homogeneizador y línea de empaque |
| 3 | `caso-ingenieria-control-b-altman-03.webp` | 984×531 | 37 KB | Plano P&ID del proceso de la planta de alimentos |
| 4 | `caso-ingenieria-control-b-altman-04.webp` | 527×375 | 27 KB | Plano de distribución de equipos dentro del tablero de fuerza y control |

### Migración de PLC M258 a M340 con red Modbus RTU

- **slug:** `migracion-plc-jgb`
- **Cliente:** JGB — empresa de productos de cuidado personal
- **Servicios relacionados:** `automatizacion-procesos-industriales` · `aplicaciones-industriales`
- **Diapositivas de origen:** S17

**Descripción** (tarjeta y `meta description`, 126 caracteres):

> Migración del sistema de control de JGB de PLC Schneider M258 a M340, con red Modbus RTU y HMI reprogramada en Vijeo Designer.

**Cuerpo:**

> El sistema de control de esta línea de JGB estaba montado sobre un PLC Schneider M258 que había que reemplazar.
>
> PIYC migró todo el sistema de control a un PLC Schneider M340: se reprogramó la lógica del proceso, se configuró la red de control Modbus RTU y se rehizo la HMI en Vijeo Designer.
>
> La migración cubrió el sistema completo, no solo el cambio de controlador: la operación —incluida la descarga, con control de velocidad de impulsor y de picador y seguimiento del lote— quedó funcionando sobre el equipo nuevo.

**Fotos** (`proyectos/migracion-plc-jgb/`, la primera es la portada):

| # | Archivo | Dimensiones | Peso | `alt` |
|---|---|---|---|---|
| 1 | `caso-migracion-plc-jgb-01.webp` | 1134×854 | 55 KB | Pantalla HMI de descarga manual con la velocidad del impulsor y del picador y el seguimiento del lote |
| 2 | `caso-migracion-plc-jgb-02.webp` | 595×228 | 14 KB | Configuración del rack del PLC Schneider M340 en Unity Pro |

### Automatización del blanqueado de algodón

- **slug:** `blanqueado-algodon-jgb`
- **Cliente:** JGB — empresa de productos de cuidado personal
- **Servicios relacionados:** `automatizacion-procesos-industriales` · `aplicaciones-industriales`
- **Diapositivas de origen:** S18

**Descripción** (tarjeta y `meta description`, 104 caracteres):

> Control del blanqueado de algodón en JGB con PLC Siemens y trabajo por recetas: de 4 a 7 baches por día.

**Cuerpo:**

> Antes de la intervención, la preparación del blanqueado de algodón en JGB rendía 4 baches por día.
>
> PIYC configuró un PLC Siemens S1200 y programó el sistema de control de la preparación de blanqueado de algodón para que trabajara por recetas. Se desarrolló la HMI de operación y se configuró la instrumentación de campo E&H: nivel por radar guiado, temperatura y presión.
>
> Con el proceso automatizado, la planta pasó de 4 a 7 baches por día.

**Fotos** (`proyectos/blanqueado-algodon-jgb/`, la primera es la portada):

| # | Archivo | Dimensiones | Peso | `alt` |
|---|---|---|---|---|
| 1 | `caso-blanqueado-algodon-jgb-01.webp` | 629×480 | 59 KB | Pantalla HMI Siemens del blanqueado de algodón con nivel, temperatura y presión del proceso |

---

## 2. Inventario de imágenes

Dos orígenes distintos, y **no se mezclan**:

1. **Capturas del PPTX de casos de éxito** (HMI, SCADA, planos eléctricos y P&ID).
   Son el material de cada proyecto y viven **solo** en `site_projects` — §2.1.
2. **Fotos de obra del Drive del cliente**, carpeta `9. FOTOS` (14 PNG + 25 JPG +
   1 MP4 que no se usa). Son las fotos reales del equipo de PIYC trabajando y
   llenan inicio, nosotros, servicios y cabeceras — §2.2 y §2.3.

**Regla de reparto (21-sep-2026, Cesar):** una misma foto aparece en **una sola
sección**. La única relación permitida es proyecto ↔ tarjeta de ese proyecto. Se
verifica con una consulta que cruza `site_settings`, `site_services.images` y
`site_projects.images` buscando URL repetidas; hoy da cero.

Proceso: `sharp` → WebP, orientación EXIF aplicada. Dos tamaños según dónde se
pinta la foto:

- **Fondos a sangre** — cabeceras de /nosotros, /servicios, /proyectos y
  /contacto, y la portada (`cover` = primera de la galería) de cada servicio.
  Desde el **22-sep-2026** las cabeceras de las páginas internas llevan la foto
  de fondo a todo el ancho, bajo un velo oscuro, en vez de en un recuadro de
  400 px. Por eso van a **1920 px de ancho** (calidad 70; la más pesada, 169 KB)
  con una **variante de 900 px** y sufijo `-900` (≤ 80 KB; la más pesada,
  66 KB) que se guarda en `srcMovil` para el `srcset`: con el optimizador de
  Vercel apagado, sin ella el celular descargaría la de 1920. Todas son
  **apaisadas**: las cinco del lote que ya lo eran van en cuadro completo; las
  demás son un recorte 16:9 de una vertical, siempre desde el original y nunca
  ampliado (dos originales no llegan a 1920 de ancho: automatización queda en
  1836 px y aplicaciones industriales en 1468 px). Para las cinco apaisadas se
  reutilizó la versión de 900 px que ya estaba en el bucket: es el mismo cuadro.
- **Lo demás** — galerías, «Quiénes somos» y la portada: **~900 px de ancho**
  (calidad 82), que cubre 2,1× el mayor ancho pintado (432 px) y el DPR 2,6
  del móvil de Lighthouse. «Quiénes somos» es la excepción: recorte 4:5 al
  ancho del original (1184 px, 176 KB) más su variante de 900 px (97 KB).

El `Cache-Control` de un año obliga a que una foto que cambia **cambie de
nombre**: por eso los recortes nuevos llevan `-apaisada` o `-4x5`.

**Subida desde el panel (22-sep-2026).** Al subir una foto, el navegador
genera la principal (WebP, ≤ 1920 px, ≤ 400 KB) y, si la foto mide más de
900 px de ancho, una variante de 900 px (≤ ~100 KB) con el mismo nombre más
`-900`. Suben las dos juntas y se guardan `src`, `srcMovil`, `width` y
`height` reales. Quitar o reemplazar una foto en el panel no borra archivos
del bucket (nunca lo hizo): lo que quede sin uso se limpia a mano con la
consulta de huérfanas.

Bucket: `site-images` · `Cache-Control: 31536000` · `Content-Type: image/webp`.
Prefijo público: `https://bzrjeduxjkwvtdaohjrh.supabase.co/storage/v1/object/public/site-images/`.
56 archivos en total: 18 capturas de casos + 38 de obra (25 fotos en uso, 13
de ellas con su variante de 900 px). Cero huérfanas y cero URL repetidas entre
secciones al 22-sep-2026.

### 2.1 Capturas de los casos de éxito

No se tocaron: son de los proyectos y se quedan ahí.

| Ruta en el bucket | Dimensiones | Peso |
|---|---|---|
| `proyectos/preparacion-alcohol-jgb/caso-preparacion-alcohol-jgb-01.webp` | 996×745 | 58 KB |
| `proyectos/preparacion-alcohol-jgb/caso-preparacion-alcohol-jgb-02.webp` | 1016×629 | 37 KB |
| `proyectos/preparacion-alcohol-jgb/caso-preparacion-alcohol-jgb-03.webp` | 1097×772 | 38 KB |
| `proyectos/pasteurizador-alival/caso-pasteurizador-alival-01.webp` | 584×317 | 28 KB |
| `proyectos/pasteurizador-alival/caso-pasteurizador-alival-02.webp` | 675×724 | 42 KB |
| `proyectos/pasteurizador-alival/caso-pasteurizador-alival-03.webp` | 520×694 | 42 KB |
| `proyectos/pasteurizador-alival/caso-pasteurizador-alival-04.webp` | 768×730 | 30 KB |
| `proyectos/pasteurizador-alival/caso-pasteurizador-alival-05.webp` | 720×1280 | 56 KB |
| `proyectos/pasteurizador-alival/caso-pasteurizador-alival-06.webp` | 658×493 | 42 KB |
| `proyectos/estacion-cargue-alival/caso-estacion-cargue-alival-01.webp` | 1109×883 | 61 KB |
| `proyectos/estacion-cargue-alival/caso-estacion-cargue-alival-02.webp` | 681×828 | 65 KB |
| `proyectos/ingenieria-control-b-altman/caso-ingenieria-control-b-altman-01.webp` | 768×1024 | 81 KB |
| `proyectos/ingenieria-control-b-altman/caso-ingenieria-control-b-altman-02.webp` | 609×340 | 18 KB |
| `proyectos/ingenieria-control-b-altman/caso-ingenieria-control-b-altman-03.webp` | 984×531 | 37 KB |
| `proyectos/ingenieria-control-b-altman/caso-ingenieria-control-b-altman-04.webp` | 527×375 | 27 KB |
| `proyectos/migracion-plc-jgb/caso-migracion-plc-jgb-01.webp` | 1134×854 | 55 KB |
| `proyectos/migracion-plc-jgb/caso-migracion-plc-jgb-02.webp` | 595×228 | 14 KB |
| `proyectos/blanqueado-algodon-jgb/caso-blanqueado-algodon-jgb-01.webp` | 629×480 | 59 KB |

### 2.2 Catálogo de las fotos del Drive — las 26 que se publican

Las 39 fotos de `9. FOTOS` se miraron una por una. Estas 26 quedaron dentro;
una de ellas se retiró después por decisión de Cesar (22-sep-2026), así que hoy
se usan **25**. El `alt` describe **solo lo que se ve**: no hay nombres de
clientes ni de plantas, porque el Drive no dice de dónde es cada foto.

| Original | Qué muestra | Calidad | Uso asignado | `alt` |
|---|---|---|---|---|
| `20210707_100235.jpg` | Cuarto eléctrico con una fila de tableros montados; uno abierto | Nítida, apaisada 3648×1792, luz pareja. La mejor panorámica del lote | Cabecera de /proyectos (fondo) → `cabeceras/cuarto-electrico-tableros.webp` (1920×943, 67 KB) + `-900` (900×442, 28 KB) | Cuarto eléctrico con una fila de tableros de control y fuerza montados contra la pared; uno de ellos abierto durante el cableado |
| `20210902_153937.jpg` | Interior de tablero inox: PLC modular, switches Ethernet, protecciones, borneras | Excelente, apaisada 5664×2752, muy nítida | Cabecera de /servicios (fondo) → `cabeceras/interior-tablero-plc-red.webp` (1920×933, 159 KB) + `-900` (900×437, 66 KB) | Interior de un tablero en acero inoxidable con PLC modular, switches de red industrial, protecciones y borneras cableadas |
| `20221126_175003.jpg` | Vista cenital del montaje interno de un tablero sobre la placa de fondo | Muy nítida, apaisada 4624×2604 | Cabecera de /nosotros (fondo) → `cabeceras/montaje-interno-tablero.webp` (1920×1081, 118 KB) + `-900` (900×507, 50 KB) | Vista cenital del montaje interno de un tablero: PLC, switch de red, fuente de 24 V, protecciones y borneras numeradas sobre riel |
| `20220316_093100.jpg` | Skid de proceso inox con panel de control, tuberías sanitarias y bomba | Excelente, vertical 3468×4624, buena luz de sala | Inicio · bloque «Qué hacemos» → `inicio/skid-proceso-inoxidable-900.webp` (900×1200, 81 KB) | Skid de proceso en acero inoxidable con su panel de control, tuberías sanitarias y bomba, instalado en una sala de producción |
| `20210609_110056.jpg` | Dos técnicos con traje y cofia revisan el programa en un portátil, en planta | Buena, vertical 4248×5664 | **Retirada por decisión de Cesar, 22-sep-2026.** No se usa en ninguna parte del sitio; su archivo (`nosotros/equipo-planta-alimentos-900.webp`) se borró del bucket. El original sigue en el Drive | — |
| `20220211_111636.jpg` | Técnico con overol y cofia cableando el interior de un tablero | Nítida, vertical 1184×2560. Resolución justa pero suficiente | Nosotros · bloque «Quiénes somos» → `nosotros/tecnico-cableando-tablero-4x5.webp` (recorte 4:5, 1184×1480, 176 KB) + `-900` (900×1125, 97 KB) | Técnico con overol y cofia trabaja en el cableado interno de un tablero de control dentro de una planta de alimentos |
| `FOTO 10.png` | Técnico con chaqueta de PIYC interviniendo un tablero inox | Baja: 447×489, del PPTX. Se acepta por ser la única con la marca puesta | Nosotros · galería «Nuestro trabajo» (2.ª) → `nosotros/tecnico-piyc-tablero-inox.webp` (447×489, 32 KB) | Técnico con la chaqueta de PIYC interviene el cableado de un tablero de control en acero inoxidable |
| `20210519_125533.jpg` | Tablero abierto con portátil conectado durante la puesta en marcha | Correcta, vertical 1588×3264, luz mixta | Nosotros · galería «Nuestro trabajo» (3.ª) → `nosotros/programacion-tablero-portatil.webp` (934×1920, 142 KB) | Tablero de control abierto durante la puesta en marcha, con un portátil conectado al PLC para cargar el programa |
| `20220313_162115.jpg` | Tablero inox con tres variadores; portátil y terminal de pruebas en la mesa | Nítida, vertical 1184×2560 | Nosotros · galería «Nuestro trabajo» (1.ª) → `nosotros/puesta-en-marcha-variadores.webp` (888×1920, 158 KB) | Puesta en marcha de un tablero en acero inoxidable con tres variadores de velocidad, con el portátil y el terminal de pruebas sobre la mesa |
| `20210708_171743.jpg` | Tablero con PLC modular y portátil conectado para cargar el programa | Buena, vertical 2752×5664 | Nosotros · galería «Nuestro trabajo» (4.ª) → `nosotros/tablero-plc-modular-portatil.webp` (933×1920, 92 KB) | Tablero con PLC modular, protecciones y borneras, con un portátil conectado durante la programación |
| `20211220_210055.jpg` | Tablero de doble puerta recién armado, con todo ordenado por nivel | Buena, vertical 3000×4000. Foto de taller, nocturna pero pareja | Cabecera de /contacto (fondo) → `cabeceras/tablero-doble-puerta-armado-apaisada.webp` (recorte 16:9, 1920×1080, 73 KB) + `-900` (900×506, 30 KB) | Tablero de doble puerta abierto y recién armado, con contactores, protecciones y fuentes ordenados por nivel |
| `20220920_090936.jpg` | Gabinete de fuerza abierto con seccionador, interruptores y equipo de respaldo | Buena, vertical 2346×4326, luz de taller nuevo | Nosotros · galería «Nuestro trabajo» (5.ª) → `nosotros/gabinete-fuerza-armado-900.webp` (900×1660, 81 KB) | Gabinete de fuerza abierto con seccionador, interruptores de caja moldeada y equipo de respaldo en la base |
| `20221214_133340.jpg` | Tablero inox con PLC compacto, switch y borneras; guantes dieléctricos | Buena, vertical 1836×3264 | Servicio `automatizacion-procesos-industriales` (portada, fondo) → `servicios/automatizacion-procesos-industriales/tablero-inox-plc-compacto-apaisada.webp` (recorte 16:9, 1836×1033, 122 KB) + `-900` (48 KB) | Tablero en acero inoxidable con PLC compacto, switch de red, protecciones y borneras cableadas |
| `20210603_115417.jpg` | Tablero de fuerza abierto con barraje de cobre e interruptores | Buena, vertical 2752×5664 | Nosotros · galería «Nuestro trabajo» (6.ª) → `nosotros/tablero-fuerza-barraje.webp` (933×1920, 147 KB) | Tablero de fuerza abierto con barraje de cobre, interruptores automáticos y bloques de borneras |
| `20211230_164318.jpg` | Tablero inox con PLC compacto, fuente de 24 V y borneras marcadas una a una | Nítida, vertical 1184×2560 | Servicio `automatizacion-procesos-industriales` (galería, 2.ª) → `servicios/automatizacion-procesos-industriales/tablero-inox-plc-borneras.webp` (888×1920, 182 KB) | Tablero de automatización en acero inoxidable con PLC compacto, fuente de 24 V y borneras identificadas una a una |
| `20220128_145701.jpg` | Tablero con PLC compacto, switch de red y fuente conmutada | Aceptable, vertical 948×2048. La de menor resolución de los JPG | Servicio `automatizacion-procesos-industriales` (galería, 3.ª) → `servicios/automatizacion-procesos-industriales/tablero-plc-compacto-red.webp` (889×1920, 103 KB) | Tablero con PLC compacto, switch de red industrial y fuente conmutada, cableado y marquillado |
| `20211220_210218.jpg` | Tablero de doble puerta cerrado y terminado, con rejillas y visor | Buena, vertical 3000×4000 | Servicio `tableros-de-control` (galería, 2.ª) → `servicios/tableros-de-control/tablero-doble-puerta-terminado-900.webp` (900×1200, 35 KB) | Tablero de doble puerta terminado, con rejillas de ventilación y visor, listo para despacho |
| `20211022_104107.jpg` | Tablero grande con PLC modular, bancos de relés y los planos abiertos | Buena, vertical 3000×4000 | Servicio `tableros-de-control` (portada, fondo) → `servicios/tableros-de-control/tablero-plc-modular-reles-apaisada.webp` (recorte 16:9, 1920×1080, 169 KB) + `-900` (56 KB) | Tablero de gran formato abierto, con PLC modular, bancos de relés de interposición y protecciones |
| `20220822_221050.jpg` | Interior de tablero de potencia: seccionador e interruptores de caja moldeada | Nítida aunque oscura, vertical 2084×4624 | Servicio `diseno-ingenieria-electrica` (portada, fondo) → `servicios/diseno-ingenieria-electrica/tablero-potencia-interruptores-apaisada.webp` (recorte 16:9, 1920×1080, 84 KB) + `-900` (30 KB) | Interior de un tablero de potencia con el seccionador de entrada y cuatro interruptores de caja moldeada |
| `20210603_115506.jpg` | Dos tableros cerrados instalados en un cuarto eléctrico | Correcta, vertical 1588×3264. Encuadre plano, sirve de acompañamiento | Servicio `diseno-ingenieria-electrica` (galería, 2.ª) → `servicios/diseno-ingenieria-electrica/tableros-cuarto-electrico.webp` (934×1920, 28 KB) | Dos tableros cerrados instalados en un cuarto eléctrico, con ventilación forzada y panel de medición en la puerta |
| `20220920_091002.jpg` | Tablero rotulado montado en pared, junto al visor de la sala de proceso | Buena, vertical 2316×3949 | Servicio `telemetria` (portada, fondo) → `servicios/telemetria/tablero-pared-sala-proceso-apaisada.webp` (recorte 16:9, 1920×1080, 36 KB) + `-900` (13 KB) | Tablero rotulado montado en pared junto al visor de la sala de proceso, con la canalización llevada al equipo |
| `20211107_095706.jpg` | Interior de tablero con variadores de distintas potencias y PLC modular | Aceptable, vertical 2448×3264. Algo oscura | Servicio `telecontrol` (portada, fondo) → `servicios/telecontrol/tablero-variadores-velocidad-apaisada.webp` (recorte 16:9, 1920×1080, 118 KB) + `-900` (38 KB) | Interior de un tablero con variadores de velocidad de distintas potencias, PLC modular y protecciones |
| `20210923_161629.jpg` | Línea de transporte y empaque montada en planta, con el área aislada | Media: apaisada 3264×1588, pero a contraluz y con el plástico de obra | Servicio `proyectos-llave-en-mano` (portada, fondo) → `servicios/proyectos-llave-en-mano/linea-empaque-planta.webp` (1920×934, 100 KB) + `-900` (900×438, 48 KB) | Línea de transporte y empaque montada dentro de una planta, con el área aislada durante la obra |
| `20220817_154311.jpg` | Tablero con PLC, arrancadores y servoaccionamientos sobre la placa de fondo | Buena, vertical 1468×3264 | Servicio `aplicaciones-industriales` (portada, fondo) → `servicios/aplicaciones-industriales/tablero-servodrives-apaisada.webp` (recorte 16:9 al ancho del original, 1468×826, 65 KB) + `-900` (35 KB) | Tablero de control abierto con PLC, arrancadores y servoaccionamientos montados sobre la placa de fondo |
| `20220822_220427.jpg` | Gabinete metálico terminado en el taller, con rejillas y zócalo | Correcta, vertical 2084×4624. Foto de producto, poco contexto | Servicio `aplicaciones-industriales` (galería, 2.ª) → `servicios/aplicaciones-industriales/gabinete-terminado-taller.webp` (865×1920, 39 KB) | Gabinete metálico terminado en el taller, con rejillas de ventilación y base de zócalo |
| `20220326_164241.jpg` | Dos técnicos sobre un andamio instalando en el techo de una sala con paneles aislantes | Media: apaisada 3264×2448, luz pobre. Única del lote compatible con refrigeración | Servicio `refrigeracion-industrial` (portada, fondo) → `servicios/refrigeracion-industrial/montaje-techo-sala-paneles.webp` (1920×1440, 115 KB) + `-900` (900×675, 50 KB) | Dos técnicos sobre un andamio instalan equipos en el techo de una sala con paneles aislantes y difusores |

### 2.3 Las 13 fotos descartadas, y por qué

**Nueve son de banco de imágenes**, no de PIYC. Publicarlas contradice todo lo que
dice el sitio sobre trabajar dentro de la planta, y una de ellas ya venía con el
logo de PIYC encima, que es peor:

- `FOTO 1.png`, `FOTO 8.png` — sala de control futurista con monitores azules (_stock_).
- `FOTO 2.png` — figurines de obreros en miniatura sobre una placa base (_stock_).
- `FOTO 3.png` — ilustración vectorial isométrica de una línea de producción.
- `FOTO 4.png` — manos con guante reparando una placa base (_stock_).
- `FOTO 5.png` — detalle de cableado de servoaccionamientos (_stock_).
- `FOTO 6.png` — operario de espaldas en una sala de control (_stock_).
- `FOTO 9.png` — la misma `FOTO 6` con el logo de PIYC superpuesto. Fuera.
- `FOTO 7.png` — unidades condensadoras en una azotea (_stock_). Es la **única**
  imagen de aire acondicionado del material, y aun así no se usa: es comprada.

**Cuatro son fotos reales pero irrecuperables por resolución** (los PNG del PPTX
se guardaron reducidos; ninguno pasa de 629 px):

- `FOTO 11.png` (351×629) y `FOTO 14.png` (375×505) — la misma escena existe en
  alta resolución (`20211230_164318.jpg` y `20221214_133340.jpg`). Se usan esas.
- `FOTO 12.png` (281×498) y `FOTO 13.png` (357×497) — HMI en la puerta de un
  gabinete; 281 px de ancho no dan ni para una tarjeta.

Aparte de esas 13, la carpeta trae `20220216_162823.mp4`, que tampoco entra: es
video, y el sitio no tiene reproductor propio (`site_services.video` solo acepta
YouTube).

`FOTO 10.png` (447×489) **sí entra**, a pesar de su tamaño: es la única donde se
ve la chaqueta de PIYC puesta. Va en la galería de nosotros, que la pinta chica.

### 2.4 Lo que sigue faltando

- **Aire acondicionado: cero fotos propias.** El servicio queda con
  `images = '{}'` — la regla 9 de `AGENTS.md` prefiere no pintar nada antes que
  pintar de relleno. Hay que pedirle a PIYC fotos de un montaje de climatización.
- **Refrigeración industrial: una sola**, y de montaje general (andamio, techo,
  paneles aislantes). Faltan fotos de cuartos fríos terminados, evaporadores y
  unidades condensadoras.
- **Retratos del equipo:** no hay ni una foto posada del equipo ni del taller de
  PIYC. Todo lo que hay es obra en sitio.
- **Fotos apaisadas:** solo cinco de las 39, y ya están todas en uso como
  fondo. Las demás cabeceras y portadas de servicio son recortes 16:9 de
  verticales. Si PIYC manda fotos nuevas, lo que más falta son **apaisadas de
  gente trabajando** (para /nosotros y /contacto) y de **planta en proceso**.
- **Galería de /nosotros:** quedó en seis fotos (el 22-sep-2026 salieron tres
  para no repetir: ver la tabla). La única con la chaqueta de PIYC mide 447 px.

---

## 3. Servicios

Nueve servicios publicados. Respaldo estático en `src/data/servicios.ts`, semilla en
`supabase/seed/servicios.sql` (generada desde el TypeScript: los dos son el mismo
contenido) y filas en `site_services`.

| # | Slug | Título | Línea | Foto |
|---|---|---|---|---|
| 01 | `automatizacion-procesos-industriales` | Automatización de procesos industriales | Automatización y control | sí (2) |
| 02 | `aplicaciones-industriales` | Aplicaciones industriales | Automatización y control | sí (2) |
| 03 | `diseno-ingenieria-electrica` | Diseño y desarrollo de proyectos de ingeniería eléctrica | Tableros e ingeniería eléctrica | sí (3) |
| 04 | `tableros-de-control` | Ensamble de tableros de control y potencia | Tableros e ingeniería eléctrica | sí (2) |
| 05 | `proyectos-llave-en-mano` | Venta e instalación de proyectos llave en mano | Tableros e ingeniería eléctrica | sí (1) |
| 06 | `telemetria` | Telemetría | Telemetría y telecontrol | sí (2) |
| 07 | `telecontrol` | Telecontrol | Telemetría y telecontrol | sí (2) |
| 08 | `refrigeracion-industrial` | Refrigeración industrial y cuartos fríos | Refrigeración y climatización | **no** |
| 09 | `aires-acondicionados` | Aires acondicionados | Refrigeración y climatización | **no** |

### Qué se redactó y qué hay que aprobar

Del documento de PIYC salieron **solo los nombres** de los nueve servicios y el párrafo
introductorio del portafolio (plan §4.4). Todo lo demás —el resumen de cada tarjeta, los
dos o tres párrafos de la página y la lista de 5 a 8 alcances— **lo redactó el equipo de
la web** con conocimiento del sector. **Jorge tiene que leerlo y aprobarlo antes de
publicar el dominio.**

Lo que deliberadamente **no** se escribió, porque PIYC no lo ha confirmado:

- Ninguna cifra: años de experiencia, número de proyectos, tiempos de respuesta.
- Ningún cliente fuera de los seis casos del PPTX.
- Ninguna certificación ni sistema de gestión.
- Ninguna marca representada ni distribuida. Las que se nombran en los **casos**
  (Schneider, Siemens, E&H…) salen del PPTX y se escriben como él las escribe; en las
  páginas de **servicio** no se nombra ninguna.
- Ningún precio, plazo ni garantía, tampoco en la FAQ.

Lo que sí se nombra son normas y protocolos de uso común en el sector —IEC 61131-3,
Modbus RTU/TCP, Profibus, Profinet, EtherNet/IP, MQTT, 4–20 mA, RTD Pt100—: son
estándares abiertos, no afiliaciones ni representaciones.

### Agrupación en cuatro líneas — PENDIENTE DE VALIDAR

El documento original lista los nueve servicios **planos, sin categorías** (plan §4.4).
Para que el menú y el hub se pudieran leer se propusieron cuatro líneas:
**Automatización y control · Tableros e ingeniería eléctrica · Telemetría y telecontrol ·
Refrigeración y climatización**. Viven en `lineasDeServicio` (`src/data/servicios.ts`),
no en la base: no son contenido editable desde el panel. Si Jorge prefiere otra
agrupación se cambia solo ahí.

### Refrigeración y climatización: el hueco que queda

Tras repartir las fotos del Drive (§2), `refrigeracion-industrial` quedó con **una
sola** —el montaje en el techo de una sala con paneles aislantes— y
`aires-acondicionados` **sigue sin ninguna**. Las 39 fotos del cliente son casi
todas de tableros y automatización; de climatización no hay nada propio, y la
única imagen de condensadoras del material es de banco de imágenes (§2.3).

A ninguno de los dos se le puso una foto de tablero prestada de otro servicio:
engaña al visitante y arruina el `alt`. `aires-acondicionados` sigue usando
un panel de marca con el ícono del servicio (en la cabecera y en su fila del hub),
coherente con el lenguaje visual del sitio—. **En cuanto Jorge entregue fotos de
cuartos fríos y de climatización, se cargan desde el panel y el panel gráfico
desaparece solo.**

Lo mismo pasa con los casos: no hay un solo proyecto de refrigeración ni de aire
acondicionado publicado, y son dos de los nueve servicios que se ofrecen (ver §6.8).

### FAQ

Cinco preguntas en `/servicios` y cuatro en `/contacto`, en
`site_settings.paginas.{servicios,contacto}.faq`. Redactadas por el equipo de la web,
sin precios, plazos ni garantías. Se emiten además como `FAQPage` (JSON-LD).

---

## 4. Nosotros

Contenido en `site_settings.nosotros` (respaldo: `nosotrosEstatico` de
`src/data/ajustes.ts`). Los valores van aparte, en `site_values`.

- **Quiénes somos**: texto de PIYC (documento «4. QUIÉNES SOMOS», versión pulida), más el
  párrafo introductorio del portafolio como segundo párrafo. No se inventó nada.
- **Misión y visión**: los textos de PIYC, pasados a primera persona del plural.
  ⚠ **Intercambiadas respecto al documento original de PIYC por decisión de Cesar
  (21-sep-2026):** lo que el documento rotulaba «Visión» describe lo que la empresa hace
  hoy —proveer soluciones innovadoras en desarrollo, mantenimiento y control de
  proyectos de ingeniería— y por eso quedó como **Misión**; lo rotulado «Misión»
  describe a dónde quiere llegar —posicionarse como el proveedor líder del sector
  industrial— y por eso quedó como **Visión**. Se movieron los cuerpos, no los rótulos,
  y no se reescribió el contenido.
  - **Misión** (sitio y base): «Proveer soluciones innovadoras en el desarrollo, el
    mantenimiento y el control de proyectos de ingeniería, adaptándonos a las
    necesidades específicas de cada cliente, con estándares de alta calidad y una
    cultura de mejora continua.»
  - **Visión** (sitio y base): «Posicionarnos como el proveedor líder de servicios para
    el sector industrial, reafirmando nuestro profesionalismo al transformar cada idea
    en soluciones efectivas, con equilibrio entre las necesidades del cliente, el
    compromiso, los altos estándares de calidad y los resultados.»
- **Valores**: los cuatro de PIYC con su idea central del documento; **el párrafo de cada
  uno lo redactó el equipo de la web** y hay que aprobarlo.
- **Titular de la cabecera** («Ingenieros que trabajan dentro de la planta, no sobre el
  catálogo»): redactado por la web. Es el texto más opinado de la página; si a Jorge no le
  suena, se cambia desde el panel.
- **Galería «Nuestro trabajo»**: nueve fotos de obra propias (§2.2), en un orden que
  cuenta la historia —primero la gente trabajando, después el trabajo terminado—.
  Ninguna se repite en otra sección del sitio.

---

## 5. Inicio

Contenido en `site_settings.home` (respaldo: `homeEstatico`).

- **Hero**: eslogan oficial + el texto de «Quiénes somos» resumido. El panel de la derecha
  es un **diagrama de escalera ilustrativo**, dibujado por la web; su cajetín dice
  «Esquema: Ilustrativo» justamente para que nadie lo lea como un proyecto real.
- **Franja de líneas de servicio**: las cuatro líneas propuestas (ver §3).
- **«Ingeniería que se queda funcionando»**: redactado por la web a partir de lo que dicen
  los casos de éxito. Sin cifras.
- **Proceso de trabajo** (diagnóstico → diseño → montaje → puesta en marcha → soporte):
  redactado por la web. Describe cómo se trabaja según lo que muestran los seis casos del
  PPTX, pero **PIYC no lo ha escrito en ninguna parte**: es lo segundo que Jorge debería
  revisar, después de los servicios.
- **Destacados**: cuatro servicios y tres casos, elegidos en `home.serviciosDestacados` y
  `home.proyectosDestacados`. Editables desde el panel.
- **Foto**: `inicio/skid-proceso-inoxidable-900.webp`, en recuadro — un skid de proceso con
  su panel de control, del Drive del cliente (§2.2). Es la única foto de la portada:
  `inicio/` no guarda nada más, para que no se acumule material sin usar.

---

## 6. Preguntas abiertas para Jorge

Todo lo de abajo salió del PPTX tal cual; nada se completó a ojo. Son las decisiones
que no puede tomar quien redacta.

1. ~~**¿Se pueden nombrar los clientes?**~~ **RESUELTO (Cesar, 21-sep-2026):** sí. Los
   seis casos se publican con el nombre del cliente —JGB, Alival y B. Altman— tal como
   los rotula el PPTX. Lo que no se publica es nada que no esté en los documentos de
   PIYC.
2. **¿Y las capturas de HMI?** Varias muestran el logotipo del cliente (Alival, B·Altman,
   JGB) y nombres de planta («Estación Cargue Cumbal»). Con los clientes ya nombrados
   (punto 1), lo único abierto aquí es el nombre de planta del punto 3.
3. **«Planta Caloto» vs. «Cumbal».** El texto del caso de cargue habla de conectividad
   con la base de datos «en planta caloto»; la HMI de la misma lámina dice «ESTACIÓN
   CARGUE CUMBAL». Se dejó Caloto porque es lo que dice el texto. ¿Cuál es?
4. **«PLC Siemens S1200».** Así está escrito en la fuente; casi con seguridad es un
   **S7-1200**. Se dejó tal cual para no inventar referencias. Confirmar.
5. ~~**«E&H» se escribió como «Endress+Hauser»**~~ **CORREGIDO (21-sep-2026):** la
   expansión no aparece en el PPTX, así que los cuerpos vuelven a decir **«E&H»**, tal
   como lo trae la fuente. Si Jorge confirma la marca, se escribe completa.
6. **Baches por día.** Dos casos traen cifras (3→8 y 4→7 baches/día). Son los únicos
   números duros del PPTX y se publicaron tal cual. ¿Siguen vigentes? ¿Se pueden decir?
7. **Fechas.** El PPTX no fecha ningún proyecto. Los planos traen «2020» en el cajetín,
   pero eso no se puede dar por fecha del caso. Si PIYC quiere mostrar año, hay que pedirlo.
8. **¿Faltan casos?** El PPTX solo cubre automatización de procesos. No hay un solo caso
   de refrigeración industrial, cuartos fríos ni aires acondicionados, que son tres de los
   nueve servicios. Un sitio que los ofrece sin mostrar un solo trabajo se nota.

---

## 7. Nota técnica: columna que falta

`site_projects` **no tiene columna para los servicios relacionados**. La relación
caso ↔ servicio existe hoy solo en `src/data/proyectos.ts` (campo `servicios`) y en
este documento; desde el panel no se puede editar.

Si esa relación tiene que ser editable o servir para filtrar `/proyectos` por servicio,
hace falta una migración nueva: lo más simple sería `services text[] not null default '{}'`
en `site_projects`. **No se alteró el esquema desde la semilla** — queda reportado.
