/**
 * PROYECTOS — RESPALDO ESTÁTICO
 * =============================
 * Mismo contenido que `supabase/seed/proyectos.sql`. `src/lib/content.ts` cae
 * aquí cuando faltan las variables de entorno o falla la consulta: el sitio
 * público nunca queda en blanco por un problema de base de datos.
 *
 * Fuente del contenido: `docs/Copia de INFORME_CASOS DE EXITO.pptx`
 * (diapositivas 8–18). Texto final y notas: `docs/CONTENIDO.md`.
 * Las URL apuntan al bucket público `site-images`.
 *
 * `servicios` NO existe como columna en `site_projects`: vive solo aquí y en
 * `docs/CONTENIDO.md`, para relacionar cada caso con las páginas de servicio.
 */

export type ImagenProyecto = {
  src: string;
  alt: string;
  width: number;
  height: number;
};

export type ProyectoEstatico = {
  slug: string;
  title: string;
  client: string | null;
  description: string;
  /** Párrafos separados por línea en blanco (contexto → solución → resultado). */
  body: string;
  images: {
    cover: string;
    coverAlt: string;
    gallery: ImagenProyecto[];
  };
  sort: number;
  published: boolean;
  /** Slugs de servicio propuestos — validar contra el catálogo de servicios. */
  servicios: string[];
};

export const proyectosEstaticos: ProyectoEstatico[] = [
  {
    slug: "preparacion-alcohol-jgb",
    title: "Automatización de la preparación y dosificación de alcohol",
    client: "JGB — empresa de productos de cuidado personal",
    description: "Diseño P&ID, tablero, PLC e instrumentación para la preparación de alcohol en JGB: de 3 a 8 baches por día.",
    body:
      "JGB necesitaba un sistema de control nuevo para la preparación y dosificación de alcohol en su planta de productos de cuidado personal. El proceso trabajaba por formulación y su rendimiento estaba limitado a 3 baches por día.\n\nPIYC diseñó el P&ID del nuevo sistema de control y suministró el tablero eléctrico, el PLC, el sistema neumático y la instrumentación de campo, además de ejecutar la instalación electromecánica del proyecto. Sobre un PLC Micro800 se programó la lógica de preparación y dosificación por formulación, se desarrolló la HMI de operación y se configuró la instrumentación de campo Endress+Hauser: interruptores de nivel y medición de flujo por efecto Coriolis.\n\nEl resultado lo midió el mismo proceso: de 3 baches por día antes de la automatización se pasó a 8 baches por día después de ella.",
    images: {
      "cover": "https://bzrjeduxjkwvtdaohjrh.supabase.co/storage/v1/object/public/site-images/proyectos/preparacion-alcohol-jgb/caso-preparacion-alcohol-jgb-01.webp",
      "coverAlt": "Pantalla HMI del sistema de preparación de alcohol con los tanques de preparación y dosificación, las bombas y los totalizadores de alcohol y agua",
      "gallery": [
        {
          "src": "https://bzrjeduxjkwvtdaohjrh.supabase.co/storage/v1/object/public/site-images/proyectos/preparacion-alcohol-jgb/caso-preparacion-alcohol-jgb-01.webp",
          "alt": "Pantalla HMI del sistema de preparación de alcohol con los tanques de preparación y dosificación, las bombas y los totalizadores de alcohol y agua",
          "width": 996,
          "height": 745
        },
        {
          "src": "https://bzrjeduxjkwvtdaohjrh.supabase.co/storage/v1/object/public/site-images/proyectos/preparacion-alcohol-jgb/caso-preparacion-alcohol-jgb-02.webp",
          "alt": "Plano P&ID del sistema de alcohol: tanques de preparación, dosificación y almacén, con sus válvulas e instrumentación",
          "width": 1016,
          "height": 629
        },
        {
          "src": "https://bzrjeduxjkwvtdaohjrh.supabase.co/storage/v1/object/public/site-images/proyectos/preparacion-alcohol-jgb/caso-preparacion-alcohol-jgb-03.webp",
          "alt": "Plano eléctrico del tablero de control del sistema de preparación de alcohol",
          "width": 1097,
          "height": 772
        }
      ]
    },
    sort: 10,
    published: true,
    servicios: ["diseno-ingenieria-electrica","automatizacion-procesos-industriales","tableros-de-control","proyectos-llave-en-mano"],
  },
  {
    slug: "pasteurizador-alival",
    title: "Automatización del pasteurizador de 10.000 litros",
    client: "Alival — empresa de productos alimenticios",
    description: "Cambio del sistema de control del pasteurizador de 10.000 L de Alival: PLC Schneider M580, HMI por recetas e instrumentación nueva.",
    body:
      "Alival contrató el cambio del sistema de control y el suministro de materiales para automatizar su pasteurizador de 10.000 litros. Las fotografías del antes muestran con qué venía operando el equipo: válvulas de control desgastadas y una válvula reguladora de presión de aire en mal estado.\n\nPIYC suministró los materiales y ejecutó la automatización del equipo. El control quedó sobre un PLC Schneider M580, con la lógica de pasteurización y termización de los distintos productos programada para trabajar por recetas. Se desarrollaron las pantallas HMI de operación, datos de proceso y selección de receta, y se configuró la instrumentación de campo Endress+Hauser de nivel y presión.\n\nEl pasteurizador quedó operando con instrumentación nueva y con un sistema de control en el que cada producto se selecciona como una receta del sistema.",
    images: {
      "cover": "https://bzrjeduxjkwvtdaohjrh.supabase.co/storage/v1/object/public/site-images/proyectos/pasteurizador-alival/caso-pasteurizador-alival-01.webp",
      "coverAlt": "Pantallas HMI del pasteurizador de 10.000 litros: operación, datos de proceso y selección de recetas",
      "gallery": [
        {
          "src": "https://bzrjeduxjkwvtdaohjrh.supabase.co/storage/v1/object/public/site-images/proyectos/pasteurizador-alival/caso-pasteurizador-alival-01.webp",
          "alt": "Pantallas HMI del pasteurizador de 10.000 litros: operación, datos de proceso y selección de recetas",
          "width": 584,
          "height": 317
        },
        {
          "src": "https://bzrjeduxjkwvtdaohjrh.supabase.co/storage/v1/object/public/site-images/proyectos/pasteurizador-alival/caso-pasteurizador-alival-02.webp",
          "alt": "Válvula de control neumática desgastada del pasteurizador, antes de la intervención",
          "width": 675,
          "height": 724
        },
        {
          "src": "https://bzrjeduxjkwvtdaohjrh.supabase.co/storage/v1/object/public/site-images/proyectos/pasteurizador-alival/caso-pasteurizador-alival-03.webp",
          "alt": "Válvula de control nueva con posicionador, instalada en la línea del pasteurizador",
          "width": 520,
          "height": 694
        },
        {
          "src": "https://bzrjeduxjkwvtdaohjrh.supabase.co/storage/v1/object/public/site-images/proyectos/pasteurizador-alival/caso-pasteurizador-alival-04.webp",
          "alt": "Válvula reguladora de presión de aire oxidada, estado del equipo antes de la automatización",
          "width": 768,
          "height": 730
        },
        {
          "src": "https://bzrjeduxjkwvtdaohjrh.supabase.co/storage/v1/object/public/site-images/proyectos/pasteurizador-alival/caso-pasteurizador-alival-05.webp",
          "alt": "Transmisor digital de campo instalado sobre la tubería del pasteurizador",
          "width": 720,
          "height": 1280
        },
        {
          "src": "https://bzrjeduxjkwvtdaohjrh.supabase.co/storage/v1/object/public/site-images/proyectos/pasteurizador-alival/caso-pasteurizador-alival-06.webp",
          "alt": "Línea de proceso en acero inoxidable del pasteurizador con la instrumentación ya montada",
          "width": 658,
          "height": 493
        }
      ]
    },
    sort: 20,
    published: true,
    servicios: ["automatizacion-procesos-industriales","tableros-de-control","aplicaciones-industriales","proyectos-llave-en-mano"],
  },
  {
    slug: "estacion-cargue-alival",
    title: "Estación de cargue con despacho por medidor y tiquete en línea",
    client: "Alival — empresa de productos alimenticios",
    description: "Automatización del sistema de cargue de Alival: PLC Schneider M241, despacho controlado por medidor y tiquete en línea contra la base de datos.",
    body:
      "El despacho de producto en la estación de cargue de Alival necesitaba quedar controlado y con registro de cada operación.\n\nPIYC diseñó el P&ID del proceso de cargue y la estrategia de control, suministró los equipos y el tablero eléctrico con PLC, y ejecutó la instalación electromecánica del proyecto. El control quedó sobre un PLC Schneider M241, con programación de despacho por baches y conectividad con la base de datos de la planta de Caloto. Se configuró instrumentación de campo Endress+Hauser: interruptores de nivel, transmisor de temperatura y transmisor de flujo electromagnético.\n\nEl despacho quedó controlado por medidor y cada operación genera un tiquete en línea con la placa del vehículo, la cantidad cargada, la temperatura y la fecha y hora.",
    images: {
      "cover": "https://bzrjeduxjkwvtdaohjrh.supabase.co/storage/v1/object/public/site-images/proyectos/estacion-cargue-alival/caso-estacion-cargue-alival-01.webp",
      "coverAlt": "Pantalla HMI de la estación de cargue con el volumen programado, el volumen cargado, el caudal y la temperatura del producto",
      "gallery": [
        {
          "src": "https://bzrjeduxjkwvtdaohjrh.supabase.co/storage/v1/object/public/site-images/proyectos/estacion-cargue-alival/caso-estacion-cargue-alival-01.webp",
          "alt": "Pantalla HMI de la estación de cargue con el volumen programado, el volumen cargado, el caudal y la temperatura del producto",
          "width": 1109,
          "height": 883
        },
        {
          "src": "https://bzrjeduxjkwvtdaohjrh.supabase.co/storage/v1/object/public/site-images/proyectos/estacion-cargue-alival/caso-estacion-cargue-alival-02.webp",
          "alt": "Tablero eléctrico de la estación de cargue con variador Schneider, PLC, protecciones y borneras",
          "width": 681,
          "height": 828
        }
      ]
    },
    sort: 30,
    published: true,
    servicios: ["diseno-ingenieria-electrica","automatizacion-procesos-industriales","telemetria","telecontrol","tableros-de-control","proyectos-llave-en-mano"],
  },
  {
    slug: "ingenieria-control-b-altman",
    title: "Ingeniería eléctrica y sistema de control tipo DCS",
    client: "B. Altman — empresa de alimentos",
    description: "Ingeniería eléctrica, instrumentación y sistema de control tipo DCS para la planta de alimentos B. Altman: del P&ID al software en operación.",
    body:
      "B. Altman encargó a PIYC la ingeniería y el sistema de control de su planta de alimentos, desde el papel hasta el software en operación.\n\nEl trabajo partió del diseño del P&ID y del desarrollo de la ingeniería eléctrica y de control. PIYC ejecutó las instalaciones eléctricas, desarrolló la estrategia de control y programó el software de automatización de la planta.\n\nDel lado del equipamiento, se suministraron, instalaron y calibraron la instrumentación de campo y las válvulas de control; se suministró e instaló el tablero de fuerza y control, y se entregaron el hardware y el software necesarios para implementar el sistema de control tipo DCS.",
    images: {
      "cover": "https://bzrjeduxjkwvtdaohjrh.supabase.co/storage/v1/object/public/site-images/proyectos/ingenieria-control-b-altman/caso-ingenieria-control-b-altman-01.webp",
      "coverAlt": "Gabinete de control armado y cableado para el sistema de control tipo DCS de la planta de alimentos",
      "gallery": [
        {
          "src": "https://bzrjeduxjkwvtdaohjrh.supabase.co/storage/v1/object/public/site-images/proyectos/ingenieria-control-b-altman/caso-ingenieria-control-b-altman-01.webp",
          "alt": "Gabinete de control armado y cableado para el sistema de control tipo DCS de la planta de alimentos",
          "width": 768,
          "height": 1024
        },
        {
          "src": "https://bzrjeduxjkwvtdaohjrh.supabase.co/storage/v1/object/public/site-images/proyectos/ingenieria-control-b-altman/caso-ingenieria-control-b-altman-02.webp",
          "alt": "Pantalla SCADA del proceso, con reactor, homogeneizador y línea de empaque",
          "width": 609,
          "height": 340
        },
        {
          "src": "https://bzrjeduxjkwvtdaohjrh.supabase.co/storage/v1/object/public/site-images/proyectos/ingenieria-control-b-altman/caso-ingenieria-control-b-altman-03.webp",
          "alt": "Plano P&ID del proceso de la planta de alimentos",
          "width": 984,
          "height": 531
        },
        {
          "src": "https://bzrjeduxjkwvtdaohjrh.supabase.co/storage/v1/object/public/site-images/proyectos/ingenieria-control-b-altman/caso-ingenieria-control-b-altman-04.webp",
          "alt": "Plano de distribución de equipos dentro del tablero de fuerza y control",
          "width": 527,
          "height": 375
        }
      ]
    },
    sort: 40,
    published: true,
    servicios: ["diseno-ingenieria-electrica","automatizacion-procesos-industriales","tableros-de-control","aplicaciones-industriales","proyectos-llave-en-mano"],
  },
  {
    slug: "migracion-plc-jgb",
    title: "Migración de PLC M258 a M340 con red Modbus RTU",
    client: "JGB — empresa de productos de cuidado personal",
    description: "Migración del sistema de control de JGB de PLC Schneider M258 a M340, con red Modbus RTU y HMI reprogramada en Vijeo Designer.",
    body:
      "El sistema de control de esta línea de JGB estaba montado sobre un PLC Schneider M258 que había que reemplazar.\n\nPIYC migró todo el sistema de control a un PLC Schneider M340: se reprogramó la lógica del proceso, se configuró la red de control Modbus RTU y se rehizo la HMI en Vijeo Designer.\n\nLa migración cubrió el sistema completo, no solo el cambio de controlador: la operación —incluida la descarga, con control de velocidad de impulsor y de picador y seguimiento del lote— quedó funcionando sobre el equipo nuevo.",
    images: {
      "cover": "https://bzrjeduxjkwvtdaohjrh.supabase.co/storage/v1/object/public/site-images/proyectos/migracion-plc-jgb/caso-migracion-plc-jgb-01.webp",
      "coverAlt": "Pantalla HMI de descarga manual con la velocidad del impulsor y del picador y el seguimiento del lote",
      "gallery": [
        {
          "src": "https://bzrjeduxjkwvtdaohjrh.supabase.co/storage/v1/object/public/site-images/proyectos/migracion-plc-jgb/caso-migracion-plc-jgb-01.webp",
          "alt": "Pantalla HMI de descarga manual con la velocidad del impulsor y del picador y el seguimiento del lote",
          "width": 1134,
          "height": 854
        },
        {
          "src": "https://bzrjeduxjkwvtdaohjrh.supabase.co/storage/v1/object/public/site-images/proyectos/migracion-plc-jgb/caso-migracion-plc-jgb-02.webp",
          "alt": "Configuración del rack del PLC Schneider M340 en Unity Pro",
          "width": 595,
          "height": 228
        }
      ]
    },
    sort: 50,
    published: true,
    servicios: ["automatizacion-procesos-industriales","aplicaciones-industriales"],
  },
  {
    slug: "blanqueado-algodon-jgb",
    title: "Automatización del blanqueado de algodón",
    client: "JGB — empresa de productos de cuidado personal",
    description: "Control del blanqueado de algodón en JGB con PLC Siemens y trabajo por recetas: de 4 a 7 baches por día.",
    body:
      "Antes de la intervención, la preparación del blanqueado de algodón en JGB rendía 4 baches por día.\n\nPIYC configuró un PLC Siemens S1200 y programó el sistema de control de la preparación de blanqueado de algodón para que trabajara por recetas. Se desarrolló la HMI de operación y se configuró la instrumentación de campo Endress+Hauser: nivel por radar guiado, temperatura y presión.\n\nCon el proceso automatizado, la planta pasó de 4 a 7 baches por día.",
    images: {
      "cover": "https://bzrjeduxjkwvtdaohjrh.supabase.co/storage/v1/object/public/site-images/proyectos/blanqueado-algodon-jgb/caso-blanqueado-algodon-jgb-01.webp",
      "coverAlt": "Pantalla HMI Siemens del blanqueado de algodón con nivel, temperatura y presión del proceso",
      "gallery": [
        {
          "src": "https://bzrjeduxjkwvtdaohjrh.supabase.co/storage/v1/object/public/site-images/proyectos/blanqueado-algodon-jgb/caso-blanqueado-algodon-jgb-01.webp",
          "alt": "Pantalla HMI Siemens del blanqueado de algodón con nivel, temperatura y presión del proceso",
          "width": 629,
          "height": 480
        }
      ]
    },
    sort: 60,
    published: true,
    servicios: ["automatizacion-procesos-industriales","aplicaciones-industriales"],
  },
];
