/**
 * SERVICIOS — RESPALDO ESTÁTICO
 * =============================
 * Mismo contenido que `supabase/seed/servicios.sql`. `src/lib/content.ts` cae
 * aquí cuando faltan las variables de entorno o falla la consulta: el sitio
 * público nunca queda en blanco por un problema de base de datos.
 *
 * ORIGEN DEL CONTENIDO
 * --------------------
 * Los nueve servicios y sus nombres salen de `docs/PLAN_INICIAL_PIYC.md` §4.4
 * (documento «5. DESCRIPCIÓN PRODUCTOS Y SERVICIOS» del Drive de PIYC). En el
 * documento original cuatro de ellos traen una sola línea; los párrafos de
 * `description` y las listas de `items` los **redactó el equipo de la web** con
 * conocimiento del sector y están **pendientes de que Jorge los apruebe**
 * (ver `docs/CONTENIDO.md` §3).
 *
 * LO QUE NO SE ESCRIBIÓ, A PROPÓSITO
 * ----------------------------------
 * Ni una cifra (años de experiencia, número de proyectos, tiempos de respuesta),
 * ni un nombre de cliente, ni una certificación, ni una marca representada.
 * Nada de eso está confirmado por PIYC. Las normas y protocolos que sí se
 * nombran (IEC 61131-3, Modbus, Profinet, 4–20 mA…) son estándares de la
 * industria, no afiliaciones.
 *
 * FOTOS
 * -----
 * Las URL apuntan al bucket público `site-images`, carpeta `servicios/<slug>/`
 * (inventario en `src/data/imagenes.ts` y `docs/CONTENIDO.md` §2).
 * `refrigeracion-industrial` y `aires-acondicionados` **no tienen ninguna foto**
 * — el PPTX de casos de éxito es todo automatización. La página los resuelve
 * con su gráfico propio; no se les pone una foto de otro servicio.
 */

import type { LineaServicio, Servicio } from "@/lib/content-types";

const BUCKET =
  "https://bzrjeduxjkwvtdaohjrh.supabase.co/storage/v1/object/public/site-images/servicios";

/** Los nueve servicios, en el orden en que se muestran. */
export const serviciosEstaticos: Servicio[] = [
  /* ------------------------------------------------------------------ */
  {
    id: null,
    slug: "automatizacion-procesos-industriales",
    title: "Automatización de procesos industriales",
    navTitle: "Automatización y control",
    iconKey: "automatizacion",
    summary:
      "Control con PLC y supervisión HMI/SCADA para que el proceso trabaje por receta, repita el resultado y deje registro de lo que pasó.",
    description:
      "Automatizar un proceso es convertir una secuencia que hoy depende del criterio del operario en una lógica que se ejecuta igual todas las veces. Levantamos la secuencia real en planta —qué arranca con qué, qué enclavamientos existen, qué se mide y qué se decide con esa medida—, la escribimos en el PLC y la ponemos a la vista del operario en una HMI que muestra el estado del proceso, no una lista de señales.\n\nProgramamos el control en los lenguajes de la norma IEC 61131-3 (escalera, bloques funcionales y texto estructurado según lo que convenga a cada rutina) y lo estructuramos para que otro ingeniero lo pueda leer: rutinas separadas por área, señales con nombre y comentarios en español. Sobre esa base montamos el manejo por formulación o receta, los lazos de control PID, las secuencias de limpieza, los permisivos de seguridad y el registro de alarmas con su marca de tiempo.\n\nLa supervisión HMI/SCADA cierra el trabajo: pantallas de operación, tendencias de las variables que importan, históricos y reportes de producción. Integramos los equipos de campo por los protocolos que ya existen en la planta —Modbus RTU y TCP, Profibus, Profinet, EtherNet/IP— para no obligar a cambiar lo que funciona, y dejamos el respaldo de programas y la documentación en manos del cliente.",
    items: [
      "Levantamiento de la secuencia de proceso y definición de la lista de señales (I/O)",
      "Programación de PLC bajo IEC 61131-3: escalera, bloques funcionales y texto estructurado",
      "Manejo por formulación o receta, lazos PID, enclavamientos y permisivos de seguridad",
      "Desarrollo de pantallas HMI de operación con tendencias, alarmas y eventos fechados",
      "Sistemas SCADA con históricos, reportes de producción y conexión a bases de datos",
      "Integración de equipos por Modbus RTU/TCP, Profibus, Profinet y EtherNet/IP",
      "Migración y actualización de PLC obsoletos conservando la lógica del proceso",
      "Puesta en marcha en sitio, pruebas con el operario y entrega de programas documentados",
    ],
    images: {
      cover: `${BUCKET}/automatizacion-procesos-industriales/hmi-pasteurizador.webp`,
      coverAlt:
        "Pantallas HMI de un pasteurizador: operación, datos de proceso y selección de recetas",
      gallery: [
        {
          src: `${BUCKET}/automatizacion-procesos-industriales/hmi-pasteurizador.webp`,
          alt: "Pantallas HMI de un pasteurizador: operación, datos de proceso y selección de recetas",
          width: 584,
          height: 317,
        },
        {
          src: `${BUCKET}/automatizacion-procesos-industriales/scada-planta-alimentos.webp`,
          alt: "Pantalla SCADA de una planta de alimentos, con reactor, homogeneizador y línea de empaque",
          width: 609,
          height: 340,
        },
      ],
    },
    video: null,
    metaTitle: "Automatización de procesos industriales",
    metaDescription:
      "Control con PLC y supervisión HMI/SCADA para procesos industriales en Cali: lógica por receta, lazos PID, alarmas fechadas e integración con la planta.",
    sort: 10,
    published: true,
  },

  /* ------------------------------------------------------------------ */
  {
    id: null,
    slug: "diseno-ingenieria-electrica",
    title: "Diseño y desarrollo de proyectos de ingeniería eléctrica",
    navTitle: "Ingeniería eléctrica",
    iconKey: "plano",
    summary:
      "Del levantamiento en sitio al plano as-built: unifilares, cuadros de carga, P&ID y memorias que sostienen el montaje y el mantenimiento.",
    description:
      "Un montaje eléctrico sin planos se paga dos veces: primero en la obra, adivinando qué llega a cada borne, y después en cada mantenimiento. Por eso el diseño arranca en la planta: levantamos lo que hay instalado, medimos las cargas reales, revisamos el estado de las canalizaciones y solo entonces dibujamos.\n\nEntregamos el juego completo de documentos con el que se construye y se opera la instalación: diagrama unifilar, cuadro de cargas, cálculo de conductores y de las protecciones que los acompañan, planos de fuerza, de control y de mando, diagramas de conexionado y listas de borneras. Cuando el proyecto tiene proceso, el paquete incluye el P&ID con la instrumentación y la lista de señales, que es la misma que después alimenta la programación del PLC.\n\nEl diseño también decide equipos: arrancadores directos o suaves, variadores de velocidad, transformadores, transferencias y esquemas de puesta a tierra, dimensionados según la carga y no según el catálogo que estaba a mano. Al cierre se actualizan los planos con lo que quedó realmente instalado —el as-built— y se entregan las memorias de cálculo, que son el documento al que se vuelve cuando la planta crece.",
    items: [
      "Levantamiento en sitio y revisión del estado de la instalación existente",
      "Diagrama unifilar, cuadro de cargas y balance de fases",
      "Cálculo de conductores, canalizaciones y coordinación de protecciones",
      "Planos de fuerza, control y mando; diagramas de conexionado y listas de borneras",
      "P&ID del proceso, hoja de instrumentos y lista de señales (I/O)",
      "Selección y dimensionamiento de arrancadores, variadores, transformadores y transferencias",
      "Memorias de cálculo y actualización de planos as-built al cierre del proyecto",
    ],
    images: {
      cover: `${BUCKET}/diseno-ingenieria-electrica/plano-electrico-tablero.webp`,
      coverAlt: "Plano eléctrico de un tablero de control elaborado por PIYC",
      gallery: [
        {
          src: `${BUCKET}/diseno-ingenieria-electrica/plano-electrico-tablero.webp`,
          alt: "Plano eléctrico de un tablero de control elaborado por PIYC",
          width: 1097,
          height: 772,
        },
        {
          src: `${BUCKET}/diseno-ingenieria-electrica/pid-sistema-alcohol.webp`,
          alt: "Plano P&ID de un sistema de preparación y dosificación, con tanques, válvulas e instrumentación",
          width: 1016,
          height: 629,
        },
        {
          src: `${BUCKET}/diseno-ingenieria-electrica/tablero-control-variador-plc.webp`,
          alt: "Tablero eléctrico de control abierto, con variador de velocidad, PLC, protecciones y borneras cableadas",
          width: 681,
          height: 828,
        },
      ],
    },
    video: null,
    metaTitle: "Ingeniería eléctrica y diseño de proyectos",
    metaDescription:
      "Diseño eléctrico en Cali: unifilares, cuadros de carga, cálculo de conductores y protecciones, P&ID, planos de control y memorias as-built.",
    sort: 20,
    published: true,
  },

  /* ------------------------------------------------------------------ */
  {
    id: null,
    slug: "tableros-de-control",
    title: "Ensamble de tableros de control y potencia",
    navTitle: "Tableros de control",
    iconKey: "tablero",
    summary:
      "Tableros armados según plano, con cableado identificado y disipación calculada. Se abren dentro de cinco años y se siguen entendiendo.",
    description:
      "Un tablero bien armado se reconoce con la puerta abierta: los conductores van por canaleta y no por el aire, cada hilo tiene su marquilla, las borneras están numeradas igual que en el plano y hay espacio para crecer. Armamos tableros de control y de potencia a la medida del proyecto, partiendo siempre del diagrama y del cuadro de cargas, no de un gabinete estándar al que después se le hace caber todo.\n\nEl montaje incluye la distribución física dentro del gabinete —separando el circuito de potencia del de control para que el ruido eléctrico no se le meta a las señales análogas—, el cálculo de la disipación de calor y la ventilación o climatización que requiera, y el aterrizaje de pantallas y blindajes. Integramos protecciones, contactores, arrancadores suaves, variadores de velocidad, fuentes, PLC, módulos de entradas y salidas y la instrumentación que el proceso necesite.\n\nAntes de que el tablero salga del taller se prueba: continuidad punto a punto contra el plano, verificación de la lógica de mando, pruebas de aislamiento y rotulado final de puertas y componentes. Se entrega con el plano actualizado a lo que quedó dentro, que es lo que hace que el mantenimiento siguiente dure horas y no días.",
    items: [
      "Diseño de la distribución interna del gabinete y cálculo de disipación de calor",
      "Tableros de control, de potencia y centros de control de motores (CCM)",
      "Montaje de protecciones, contactores, arrancadores suaves y variadores de velocidad",
      "Integración de PLC, módulos de entradas/salidas, fuentes y relés de interposición",
      "Cableado con marquilla por hilo, borneras numeradas y separación potencia/control",
      "Aterrizaje de pantallas y blindajes de las señales análogas y de comunicación",
      "Pruebas punto a punto contra plano, prueba de aislamiento y rotulado final",
      "Entrega con planos actualizados a lo realmente construido",
    ],
    images: {
      cover: `${BUCKET}/tableros-de-control/tablero-control-variador-plc.webp`,
      coverAlt:
        "Tablero eléctrico de control abierto, con variador de velocidad, PLC, protecciones y borneras cableadas",
      gallery: [
        {
          src: `${BUCKET}/tableros-de-control/tablero-control-variador-plc.webp`,
          alt: "Tablero eléctrico de control abierto, con variador de velocidad, PLC, protecciones y borneras cableadas",
          width: 681,
          height: 828,
        },
        {
          src: `${BUCKET}/tableros-de-control/gabinete-control-dcs.webp`,
          alt: "Gabinete de control armado y cableado para un sistema de control tipo DCS",
          width: 768,
          height: 1024,
        },
      ],
    },
    video: null,
    metaTitle: "Tableros de control y potencia a la medida",
    metaDescription:
      "Ensamble de tableros de control, potencia y CCM en Cali: armado según plano, cableado marquillado, pruebas punto a punto y planos as-built.",
    sort: 30,
    published: true,
  },

  /* ------------------------------------------------------------------ */
  {
    id: null,
    slug: "telemetria",
    title: "Telemetría",
    navTitle: "Telemetría",
    iconKey: "telemetria",
    summary:
      "Medir lo que pasa en un punto lejano y verlo donde se decide: caudal, nivel, presión, temperatura y consumo, con histórico y alarmas.",
    description:
      "La telemetría resuelve un problema concreto: el dato existe en campo pero nadie lo ve a tiempo. Un tanque en otra sede, una estación de bombeo al final de una vía, un medidor en la acometida. Instalamos la instrumentación que toma la medida, el equipo que la transmite y el sistema que la guarda y la muestra.\n\nEl trabajo empieza por la medición, porque un dato mal tomado no mejora por viajar rápido: selección e instalación de transmisores de nivel, presión, caudal y temperatura, con su señal de 4–20 mA, su sonda RTD o su salida digital según el caso, y su calibración contra patrón. De ahí la información sube por el medio que el sitio permita —cable, fibra, radio o red celular— usando Modbus, MQTT u otro protocolo abierto, sin quedar amarrada a un fabricante.\n\nEn el otro extremo queda un tablero de lectura: valores al instante, tendencias, totalizadores, comparación entre periodos y alarmas por umbral que avisan antes de que el problema se note en la producción. El histórico es lo que convierte la telemetría en una herramienta de gestión y no en un indicador más: con él se ven consumos, fugas, turnos que difieren y equipos que empiezan a degradarse.",
    items: [
      "Selección, instalación y calibración de transmisores de nivel, presión, caudal y temperatura",
      "Cableado e integración de señales 4–20 mA, RTD Pt100, pulsos y salidas digitales",
      "Estaciones remotas con PLC o RTU alimentadas por red o por panel solar",
      "Transmisión por radio, red celular o red de planta con protocolos abiertos (Modbus, MQTT)",
      "Almacenamiento histórico, totalizadores y comparación entre periodos",
      "Alarmas por umbral y notificación al responsable del proceso",
      "Tableros de lectura en pantalla de planta, computador o dispositivo móvil",
    ],
    images: {
      cover: `${BUCKET}/telemetria/hmi-estacion-cargue.webp`,
      coverAlt:
        "Pantalla HMI de una estación de cargue, con volumen cargado, caudal y temperatura del producto",
      gallery: [
        {
          src: `${BUCKET}/telemetria/hmi-estacion-cargue.webp`,
          alt: "Pantalla HMI de una estación de cargue, con volumen cargado, caudal y temperatura del producto",
          width: 1109,
          height: 883,
        },
        {
          src: `${BUCKET}/telemetria/transmisor-campo-tuberia.webp`,
          alt: "Transmisor digital de campo instalado sobre la tubería de una línea de proceso",
          width: 720,
          height: 1280,
        },
      ],
    },
    video: null,
    metaTitle: "Telemetría industrial y medición remota",
    metaDescription:
      "Telemetría industrial en Cali: instrumentación de campo, estaciones remotas, transmisión por radio o red celular, histórico y alarmas por umbral.",
    sort: 40,
    published: true,
  },

  /* ------------------------------------------------------------------ */
  {
    id: null,
    slug: "telecontrol",
    title: "Telecontrol",
    navTitle: "Telecontrol",
    iconKey: "telecontrol",
    summary:
      "Operar el equipo a distancia con las mismas garantías que en sitio: mando remoto, enclavamientos, permisos por usuario y registro de cada acción.",
    description:
      "El telecontrol es el paso siguiente a la telemetría: además de ver, se actúa. Arrancar una bomba, abrir una válvula, cambiar una consigna o pasar un equipo de automático a manual desde el centro de operación o desde un celular, sin que nadie tenga que desplazarse.\n\nActuar a distancia solo es aceptable si las protecciones viajan con el mando. Por eso los enclavamientos y los permisivos se programan en el PLC de la estación remota, no en la pantalla: si la comunicación se cae, el equipo queda en un estado seguro definido de antemano y no en el último que le ordenaron. Cada comando lleva confirmación, tiempo de espera y verificación de que el equipo respondió; si no respondió, la pantalla lo dice.\n\nEl acceso se controla por usuario y por rol: quién puede ver, quién puede operar y quién puede cambiar parámetros, con registro fechado de cada acción y de quién la hizo. Ese registro sirve tanto para auditar como para entender qué ocurrió cuando algo salió distinto. La conexión se levanta sobre la red que el sitio tenga, con el canal cifrado y la estación remota fuera de internet.",
    items: [
      "Mando remoto de bombas, válvulas, motores y equipos de proceso",
      "Enclavamientos, permisivos y estado seguro programados en el PLC de la estación remota",
      "Confirmación de comando, tiempo de espera y verificación de respuesta del equipo",
      "Cambio remoto de consignas y paso de automático a manual con trazabilidad",
      "Usuarios y roles: quién ve, quién opera y quién cambia parámetros",
      "Registro fechado de cada acción, con el usuario que la ejecutó",
      "Conexión cifrada sobre red de planta, red celular o VPN; sin exponer el PLC a internet",
    ],
    images: {
      cover: `${BUCKET}/telecontrol/scada-planta-alimentos.webp`,
      coverAlt:
        "Pantalla SCADA de una planta de alimentos, con reactor, homogeneizador y línea de empaque",
      gallery: [
        {
          src: `${BUCKET}/telecontrol/scada-planta-alimentos.webp`,
          alt: "Pantalla SCADA de una planta de alimentos, con reactor, homogeneizador y línea de empaque",
          width: 609,
          height: 340,
        },
        {
          src: `${BUCKET}/telecontrol/hmi-estacion-cargue.webp`,
          alt: "Pantalla HMI de una estación de cargue, con volumen cargado, caudal y temperatura del producto",
          width: 1109,
          height: 883,
        },
      ],
    },
    video: null,
    metaTitle: "Telecontrol y operación remota de equipos",
    metaDescription:
      "Telecontrol industrial en Cali: mando remoto de bombas, válvulas y motores con enclavamientos en el PLC, permisos por usuario y registro de cada acción.",
    sort: 50,
    published: true,
  },

  /* ------------------------------------------------------------------ */
  {
    id: null,
    slug: "proyectos-llave-en-mano",
    title: "Venta e instalación de proyectos llave en mano",
    navTitle: "Proyectos llave en mano",
    iconKey: "llave-en-mano",
    summary:
      "Un solo responsable del proyecto completo: ingeniería, suministro, montaje, puesta en marcha y entrega documentada.",
    description:
      "Cuando el diseño lo hace uno, el tablero lo arma otro y el montaje lo ejecuta un tercero, los problemas aparecen en las uniones y nadie los reconoce como propios. En un proyecto llave en mano PIYC asume el alcance completo y responde por el resultado: que el sistema quede funcionando y produciendo.\n\nEl trabajo cubre la ingeniería de detalle, el suministro de tableros, instrumentación, equipos de control y materiales eléctricos, el montaje electromecánico en planta, la programación del control y la supervisión, y la puesta en marcha con el proceso corriendo. Cada etapa se planea contra las paradas de producción disponibles, porque en una planta en operación la ventana de montaje es parte del diseño, no un detalle logístico.\n\nLa entrega no es el arranque: es el arranque más la documentación. Planos as-built, programas del PLC y de la HMI en poder del cliente, manual de operación, capacitación al personal que va a usar el sistema y un periodo de acompañamiento para afinar lo que solo se ve cuando la planta lleva semanas produciendo.",
    items: [
      "Ingeniería de detalle y definición del alcance con el equipo de planta",
      "Suministro de tableros, instrumentación, equipos de control y material eléctrico",
      "Montaje electromecánico: canalizaciones, cableado, instrumentos y equipos",
      "Programación del PLC y desarrollo de la supervisión HMI/SCADA",
      "Planeación del montaje contra las ventanas de parada de producción",
      "Puesta en marcha con el proceso en operación y ajuste de lazos de control",
      "Capacitación al personal y entrega de planos, programas y manual de operación",
      "Acompañamiento posterior al arranque para afinar el sistema en producción",
    ],
    images: {
      cover: `${BUCKET}/proyectos-llave-en-mano/valvula-control-posicionador.webp`,
      coverAlt: "Válvula de control con posicionador neumático instalada en una línea de proceso",
      gallery: [
        {
          src: `${BUCKET}/proyectos-llave-en-mano/valvula-control-posicionador.webp`,
          alt: "Válvula de control con posicionador neumático instalada en una línea de proceso",
          width: 520,
          height: 694,
        },
      ],
    },
    video: null,
    metaTitle: "Proyectos industriales llave en mano",
    metaDescription:
      "Proyectos llave en mano en Cali: ingeniería, suministro, montaje electromecánico, programación, puesta en marcha y entrega documentada.",
    sort: 60,
    published: true,
  },

  /* ------------------------------------------------------------------ */
  {
    id: null,
    slug: "aplicaciones-industriales",
    title: "Aplicaciones industriales",
    navTitle: "Aplicaciones industriales",
    iconKey: "aplicaciones",
    summary:
      "Desarrollos a la medida para lo que ningún equipo de catálogo resuelve: dosificación, pesaje, trazabilidad, bancos de prueba y máquinas especiales.",
    description:
      "Hay necesidades de planta que no tienen un equipo comercial que las cubra: una dosificación con una tolerancia que el proveedor no garantiza, un banco de pruebas para un producto propio, una máquina que hay que adaptar a un empaque nuevo, un registro de trazabilidad que el sistema actual no guarda. Esas son las aplicaciones industriales: desarrollos hechos a la medida del proceso.\n\nEl punto de partida siempre es el mismo: entender el proceso antes de proponer el equipo. Definimos con el cliente qué tiene que hacer la aplicación, con qué exactitud, a qué ritmo y bajo qué condiciones de planta —humedad, lavado, polvo, temperatura, zona clasificada— y solo entonces se dimensionan la mecánica, la instrumentación y el control. Muchas veces la mejor solución no es un equipo nuevo sino intervenir el que ya existe.\n\nEl desarrollo se entrega documentado y con el programa en poder del cliente, sin candados: una aplicación a la medida que solo puede mantener quien la hizo se convierte, con los años, en un problema mayor que el que vino a resolver.",
    items: [
      "Sistemas de dosificación y preparación por formulación con control de tolerancia",
      "Aplicaciones de pesaje, conteo y control de llenado en línea",
      "Bancos de prueba y equipos de ensayo para producto propio",
      "Adaptación y repotenciación de máquinas existentes a nuevos formatos o productos",
      "Trazabilidad de lote, registro de variables críticas y generación de reportes",
      "Selección de instrumentación y actuadores según las condiciones reales de planta",
      "Entrega documentada, con programas abiertos y sin candados de fabricante",
    ],
    images: {
      cover: `${BUCKET}/aplicaciones-industriales/valvula-control-posicionador.webp`,
      coverAlt: "Válvula de control con posicionador neumático instalada en una línea de proceso",
      gallery: [
        {
          src: `${BUCKET}/aplicaciones-industriales/valvula-control-posicionador.webp`,
          alt: "Válvula de control con posicionador neumático instalada en una línea de proceso",
          width: 520,
          height: 694,
        },
        {
          src: `${BUCKET}/aplicaciones-industriales/transmisor-campo-tuberia.webp`,
          alt: "Transmisor digital de campo instalado sobre la tubería de una línea de proceso",
          width: 720,
          height: 1280,
        },
      ],
    },
    video: null,
    metaTitle: "Aplicaciones industriales a la medida",
    metaDescription:
      "Desarrollos industriales a la medida en Cali: dosificación por formulación, pesaje en línea, bancos de prueba, trazabilidad y repotenciación de máquinas.",
    sort: 70,
    published: true,
  },

  /* ------------------------------------------------------------------ */
  {
    id: null,
    slug: "refrigeracion-industrial",
    title: "Refrigeración industrial y cuartos fríos",
    navTitle: "Refrigeración industrial",
    iconKey: "refrigeracion",
    summary:
      "Mantenimiento y control de cuartos fríos y sistemas de refrigeración: sostener la temperatura, registrarla y gastar menos energía haciéndolo.",
    description:
      "En un cuarto frío la temperatura no es un número en una pantalla: es el producto. Una desviación sostenida arruina un lote y, en las plantas de alimentos, además deja un hallazgo en la auditoría. Atendemos el mantenimiento y el control de sistemas de refrigeración industrial y cuartos fríos con ese criterio: primero que la temperatura se sostenga, después que se pueda demostrar.\n\nEl mantenimiento profesional cubre la parte mecánica y la eléctrica del sistema: revisión de compresores, condensadores y evaporadores, limpieza de intercambiadores, verificación de presiones y temperaturas de operación, control de fugas de refrigerante, estado de válvulas de expansión y ciclos de deshielo, y revisión completa del tablero, protecciones y contactores. Un equipo que arranca mal o deshiela a destiempo consume mucho más de lo que debería y se desgasta antes.\n\nEl control es la otra mitad. Instalamos y programamos el sistema de temperatura, alarmas por desviación y registro histórico con marca de tiempo, que es el documento con el que se responde ante una auditoría. Si el cuarto está lejos o desatendido, ese mismo registro se lleva a telemetría y el responsable recibe el aviso apenas la temperatura se sale de rango, no al día siguiente.",
    items: [
      "Mantenimiento preventivo y correctivo de cuartos fríos y sistemas de refrigeración",
      "Revisión de compresores, condensadores, evaporadores y válvulas de expansión",
      "Control de fugas, verificación de presiones y temperaturas de operación",
      "Diagnóstico y reparación del tablero eléctrico, protecciones y contactores del equipo",
      "Ajuste de ciclos de deshielo y de la secuencia de arranque para reducir consumo",
      "Control automático de temperatura con alarmas por desviación",
      "Registro histórico fechado de temperatura, útil como soporte ante auditorías",
      "Monitoreo remoto del cuarto frío con aviso al responsable (ver telemetría)",
    ],
    images: {},
    video: null,
    metaTitle: "Refrigeración industrial y cuartos fríos",
    metaDescription:
      "Mantenimiento de refrigeración industrial y cuartos fríos en Cali: compresores, deshielo, tablero eléctrico, control de temperatura y registro histórico.",
    sort: 80,
    published: true,
  },

  /* ------------------------------------------------------------------ */
  {
    id: null,
    slug: "aires-acondicionados",
    title: "Aires acondicionados",
    navTitle: "Aires acondicionados",
    iconKey: "clima",
    summary:
      "Venta, instalación, reparación y mantenimiento de aire acondicionado, incluidos los equipos que climatizan salas técnicas y tableros.",
    description:
      "Atendemos el aire acondicionado de oficinas, áreas de producción y, sobre todo, de los espacios donde la climatización no es comodidad sino condición de operación: salas de servidores, cuartos de control y tableros eléctricos, donde la temperatura y la humedad definen cuánto dura el equipo que hay adentro.\n\nEl servicio va de la selección a la operación. Dimensionamos el equipo según la carga térmica real del espacio —área, ocupación, equipos instalados, radiación— y no por metro cuadrado a ojo, porque un equipo sobredimensionado enfría en ciclos cortos, deshumidifica mal y se desgasta igual que uno pequeño trabajando de más. Instalamos el equipo con su acometida eléctrica, sus protecciones, la tubería de refrigerante y el drenaje con la pendiente adecuada.\n\nEl mantenimiento periódico es lo que sostiene el consumo bajo y la vida útil larga: lavado de serpentines y filtros, verificación de la carga de refrigerante, revisión de drenajes, medición de consumo del compresor y del ventilador, y ajuste de los controles. En diagnóstico y reparación atendemos tanto la falla mecánica como la eléctrica y la de control, que es de donde viene buena parte de las fallas que se atribuyen al equipo.",
    items: [
      "Cálculo de carga térmica y selección del equipo según el uso real del espacio",
      "Venta e instalación de aire acondicionado en oficinas y áreas de producción",
      "Climatización de salas de servidores, cuartos de control y tableros eléctricos",
      "Montaje de la acometida eléctrica, protecciones, tubería de refrigerante y drenajes",
      "Mantenimiento preventivo: lavado de serpentines y filtros, carga de refrigerante y drenajes",
      "Diagnóstico y reparación de fallas mecánicas, eléctricas y de control",
      "Revisión de consumo del equipo y ajuste de controles para reducir el gasto de energía",
    ],
    images: {},
    video: null,
    metaTitle: "Aires acondicionados: venta y mantenimiento",
    metaDescription:
      "Aire acondicionado en Cali: venta, instalación, reparación y mantenimiento en oficinas, producción, salas de servidores y tableros eléctricos.",
    sort: 90,
    published: true,
  },
];

/**
 * Las cuatro líneas de servicio con las que se agrupan los nueve servicios en
 * el menú y en el hub.
 *
 * ⚠ **Propuesta de la web, pendiente de validar con Jorge.** El documento
 * original de PIYC lista los nueve servicios planos, sin categorías
 * (plan §4.4). La agrupación existe para que el hub y el menú se puedan leer;
 * si Jorge prefiere otra, se cambia solo aquí.
 *
 * No vive en la base: no es contenido editable desde el panel.
 */
export const lineasDeServicio: LineaServicio[] = [
  {
    id: "automatizacion-y-control",
    titulo: "Automatización y control",
    resumen: "Que el proceso trabaje por receta, repita el resultado y deje registro.",
    slugs: ["automatizacion-procesos-industriales", "aplicaciones-industriales"],
  },
  {
    id: "tableros-e-ingenieria-electrica",
    titulo: "Tableros e ingeniería eléctrica",
    resumen: "Del plano al tablero armado y al montaje entregado funcionando.",
    slugs: [
      "diseno-ingenieria-electrica",
      "tableros-de-control",
      "proyectos-llave-en-mano",
    ],
  },
  {
    id: "telemetria-y-telecontrol",
    titulo: "Telemetría y telecontrol",
    resumen: "Ver y operar a distancia lo que está lejos, sin perder las protecciones.",
    slugs: ["telemetria", "telecontrol"],
  },
  {
    id: "refrigeracion-y-climatizacion",
    titulo: "Refrigeración y climatización",
    resumen: "Sostener la temperatura donde el producto o el equipo dependen de ella.",
    slugs: ["refrigeracion-industrial", "aires-acondicionados"],
  },
];
