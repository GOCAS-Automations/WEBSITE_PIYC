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

Todas las imágenes salen del PPTX de casos de éxito, procesadas con `sharp`:
WebP, calidad 82, ancho máximo 1920 px, orientación EXIF corregida. **La más pesada
pesa 81 KB**, muy por debajo del tope de 250 KB del plan (§9) — las originales del
PPTX son pequeñas, así que no hubo que bajar calidad en ninguna.

Bucket: `site-images` · `Cache-Control: 31536000` · `Content-Type: image/webp`.
Prefijo público: `https://bzrjeduxjkwvtdaohjrh.supabase.co/storage/v1/object/public/site-images/`.

### 2.1 Fotos de los casos

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

### 2.2 Fotos generales

Diez fotos, subidas a varias carpetas porque una misma imagen sirve en más de un
sitio (el bucket guarda una copia por carpeta; el peso listado es el de cada copia).

| Archivo | Dimensiones | Peso | Carpetas | Uso sugerido |
|---|---|---|---|---|
| `tablero-control-variador-plc.webp` | 681×828 | 65 KB | `inicio/` `servicios/tableros-de-control/` `servicios/diseno-ingenieria-electrica/` | Hero de inicio y páginas de tableros de control e ingeniería eléctrica. |
| `gabinete-control-dcs.webp` | 768×1024 | 81 KB | `inicio/` `servicios/tableros-de-control/` | Inicio y página de ensamble de tableros de control y potencia. |
| `planta-proceso-inoxidable.webp` | 658×493 | 42 KB | `inicio/` `nosotros/` `cabeceras/` | Cabecera ancha, inicio y nosotros. Única foto de planta apaisada disponible. |
| `plano-electrico-tablero.webp` | 1097×772 | 38 KB | `nosotros/` `servicios/diseno-ingenieria-electrica/` | Nosotros y diseño de ingeniería eléctrica. |
| `pid-sistema-alcohol.webp` | 1016×629 | 37 KB | `servicios/diseno-ingenieria-electrica/` | Diseño y desarrollo de proyectos de ingeniería eléctrica. |
| `hmi-pasteurizador.webp` | 584×317 | 28 KB | `servicios/automatizacion-procesos-industriales/` | Automatización de procesos industriales. |
| `scada-planta-alimentos.webp` | 609×340 | 18 KB | `servicios/automatizacion-procesos-industriales/` `servicios/telecontrol/` | Automatización de procesos industriales y telecontrol. |
| `hmi-estacion-cargue.webp` | 1109×883 | 61 KB | `servicios/telemetria/` `servicios/telecontrol/` | Telemetría y telecontrol. |
| `transmisor-campo-tuberia.webp` | 720×1280 | 56 KB | `nosotros/` `servicios/telemetria/` `servicios/aplicaciones-industriales/` | Nosotros, telemetría y aplicaciones industriales. |
| `valvula-control-posicionador.webp` | 520×694 | 42 KB | `servicios/aplicaciones-industriales/` `servicios/proyectos-llave-en-mano/` | Aplicaciones industriales y proyectos llave en mano. |

**Textos alternativos:**

- `tablero-control-variador-plc.webp` — Tablero eléctrico de control abierto, con variador de velocidad Schneider, PLC, protecciones y borneras cableadas
- `gabinete-control-dcs.webp` — Gabinete de control armado y cableado para un sistema de control tipo DCS
- `planta-proceso-inoxidable.webp` — Línea de proceso en acero inoxidable dentro de una planta de alimentos, con tuberías e instrumentación montadas
- `plano-electrico-tablero.webp` — Plano eléctrico de un tablero de control elaborado por PIYC
- `pid-sistema-alcohol.webp` — Plano P&ID de un sistema de preparación y dosificación, con tanques, válvulas e instrumentación
- `hmi-pasteurizador.webp` — Pantallas HMI de un pasteurizador: operación, datos de proceso y selección de recetas
- `scada-planta-alimentos.webp` — Pantalla SCADA de una planta de alimentos, con reactor, homogeneizador y línea de empaque
- `hmi-estacion-cargue.webp` — Pantalla HMI de una estación de cargue, con volumen cargado, caudal y temperatura del producto
- `transmisor-campo-tuberia.webp` — Transmisor digital de campo instalado sobre la tubería de una línea de proceso
- `valvula-control-posicionador.webp` — Válvula de control con posicionador neumático instalada en una línea de proceso

### 2.3 Lo que se descartó

- **Foto de banco de imágenes** (mano con el pulgar arriba, diapositiva 8): es _stock_,
  no es PIYC, y contradice la regla de no parecerse a nadie. Fuera.
- **Diagrama de arquitectura «Configuración HDCS mini»** (diapositiva 16): es material
  de catálogo del fabricante, no obra de PIYC. No se publica.
- **Tres fotos de planta de calidad baja o repetidas** (tubo desgastado a contraluz,
  cableado suelto bajo un bastidor, detalle de tanque): aportan poco y varias repiten
  lo que ya muestra otra foto del mismo caso.

### 2.4 Límite conocido

Las imágenes del PPTX **están incrustadas ya reducidas**: la más grande mide 1229 px de
ancho y la mayoría ronda los 600–1000 px. Sirven para tarjetas y galerías, pero **ninguna
da para una cabecera ancha a pantalla completa** sin verse blanda. Se subió
`cabeceras/planta-proceso-inoxidable.webp` (658×493) como recurso provisional.

Las **40 fotos originales de la carpeta `9. FOTOS` del Drive** (14 PNG + 25 JPG, varias de
más de 4 MB) no se tocaron en esta ronda y son la fuente correcta para cabeceras y para
el hero de inicio. Hay que bajarlas, catalogarlas con Jorge y procesarlas igual que estas.

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

### Los dos servicios sin foto

`refrigeracion-industrial` y `aires-acondicionados` **no tienen ni una imagen**: el PPTX
de casos de éxito es todo automatización de procesos. No se les puso una foto de tablero
prestada de otro servicio —engaña al visitante y arruina el `alt`—. Sus páginas usan
`GraficoServicio`: un panel técnico con el símbolo del servicio y su cajetín, coherente
con el lenguaje visual del sitio. **En cuanto Jorge entregue fotos de refrigeración y de
climatización, se cargan desde el panel y el panel gráfico desaparece solo.**

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
- **Galería**: las tres fotos de `nosotros/`, con visor ampliado accesible.

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
- **Foto**: `inicio/planta-proceso-inoxidable.webp`, en recuadro. Las otras dos fotos de
  `inicio/` quedaron sin usar: son verticales y no caben en el ritmo de la página.

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
