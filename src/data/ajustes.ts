/**
 * AJUSTES DEL SITIO — RESPALDO ESTÁTICO
 * =====================================
 * Una constante por clave de `site_settings`. Mismo contenido que
 * `supabase/seed/ajustes.sql`, salvo `contact`, que **ya venía sembrada** en
 * `0001_contenido.sql` §6: aquí se replica igual, como red de seguridad para
 * cuando no hay base de datos.
 *
 * Los textos institucionales salen de `docs/PLAN_INICIAL_PIYC.md` §4.3 y §4.4
 * (documentos del Drive de PIYC). Lo que redactó el equipo de la web está
 * marcado como tal y **pendiente de aprobación de Jorge**.
 *
 * ⚠ `mision` y `vision` van **intercambiadas respecto al documento original de
 * PIYC**, por decisión de Cesar (21-sep-2026): en ese documento los dos textos
 * estaban bajo el rótulo contrario. Los rótulos («Misión», «Visión») no se
 * tocaron; lo que se movió fue el cuerpo de cada uno.
 */

import type {
  AjustesContact,
  AjustesHome,
  AjustesNosotros,
  AjustesPaginas,
  AjustesSeo,
} from "@/lib/content-types";

const BUCKET =
  "https://bzrjeduxjkwvtdaohjrh.supabase.co/storage/v1/object/public/site-images";

/* ===================================================================== */
/* contact — replica exacta de la semilla de 0001_contenido.sql §6        */
/* ===================================================================== */

export const contactEstatico: AjustesContact = {
  companyName: "PIYC",
  legalName: "Programación Industrial y Control S.A.S.",
  nit: "901.161.923",
  tagline: "Tu socio confiable en soluciones industriales",
  // «Local 2» va dentro de `street` y de `full` (PIYC, reunión del 23-sep-2026):
  // en esa dirección hay dos locales y el de PIYC es el segundo. `street` es lo
  // que el JSON-LD emite como `streetAddress`, así que los dos campos lo dicen.
  // El mapa NO depende de esto: sale del CID de la ficha (`src/lib/contacto.ts`).
  address: {
    street: "Cl. 33 #5-76, Local 2",
    area: "Comuna 4",
    city: "Cali",
    region: "Valle del Cauca",
    country: "Colombia",
    full: "Cl. 33 #5-76, Local 2, Comuna 4, Cali, Valle del Cauca",
  },
  // Dos números públicos (PIYC, reunión del 23-sep-2026, revierte la decisión
  // del 21-sep): el de la empresa y el de Jorge Castillo. El correo público
  // sigue siendo uno solo. El primero de `phones` es el que se pinta en el nav
  // y en el pie (`telefonoPrincipal`), y `whatsappFormulario` —destino del
  // formulario, regla 5 de AGENTS.md— sigue siendo el de la empresa.
  phones: [
    { label: "+57 321 761 7958", intl: "573217617958" },
    { label: "+57 310 637 3483", intl: "573106373483" },
  ],
  whatsapp: [
    { label: "+57 321 761 7958", intl: "573217617958", person: null, principal: true },
    {
      label: "+57 310 637 3483",
      intl: "573106373483",
      person: "Jorge Castillo",
      principal: false,
    },
  ],
  primaryWhatsApp: "573217617958",
  whatsappFormulario: "573217617958",
  emails: [{ address: "fabian.gaviria@piycsas.com", person: null }],
  social: { instagram: "https://www.instagram.com/piyc_sas/" },
  siteUrl: "https://piycsas.com",
  // Horario confirmado por Cesar contra la ficha de Google del negocio
  // (21-sep-2026). `label` es lo que se pinta en /contacto; `schema` es lo que
  // el JSON-LD emite como `openingHours` del `LocalBusiness`: los dos tienen
  // que decir lo mismo. Sábado y domingo cerrado = simplemente no se listan.
  horario: {
    label: "Lunes a viernes, 8:00 a. m. – 5:00 p. m. · Sábados y domingos, cerrado",
    schema: ["Mo-Fr 08:00-17:00"],
  },
  // Sin `geo`: PIYC no ha confirmado coordenadas y no se inventan (una
  // dirección a medias es peor que ninguna).
};

/* ===================================================================== */
/* home — página de inicio                                                */
/* ===================================================================== */

export const homeEstatico: AjustesHome = {
  hero: {
    eyebrow: "Ingeniería eléctrica · Automatización · Control",
    title: "Automatización industrial, tableros de control e ingeniería eléctrica en Cali",
    subtitle:
      "Somos un equipo de ingenieros especializados en proyectos de ingeniería, montaje y mantenimiento de equipos eléctricos y electrónicos. Automatizamos equipos y ejecutamos obras eléctricas: desde el control de procesos hasta el desarrollo de equipos de óptima calidad.",
    ctaPrimario: { etiqueta: "Ver servicios", href: "/servicios" },
    ctaSecundario: { etiqueta: "Escríbanos por WhatsApp", href: "whatsapp" },
  },
  intro: {
    eyebrow: "Qué hacemos",
    title: "Ingeniería que se queda funcionando",
    body: "PIYC trabaja sobre plantas en producción: procesos que no pueden parar más de lo planeado y equipos que tienen que seguir operando cuando el proyecto termina. Por eso el trabajo empieza en el sitio —levantando lo que hay, midiendo cargas reales y entendiendo la secuencia— antes de proponer un solo equipo.\n\nCubrimos el ciclo completo: el diseño eléctrico y el P&ID, el tablero armado según ese plano, la programación del PLC y la supervisión HMI/SCADA, el montaje electromecánico y la puesta en marcha con el proceso corriendo. Al cerrar entregamos planos as-built, programas documentados y capacitación, porque un sistema que solo puede mantener quien lo instaló es un problema aplazado.",
    image: {
      src: `${BUCKET}/inicio/skid-proceso-inoxidable-900.webp`,
      alt: "Skid de proceso en acero inoxidable con su panel de control, tuberías sanitarias y bomba, instalado en una sala de producción",
      width: 900,
      height: 1200,
    },
    ctaEtiqueta: "Conocer a PIYC",
  },
  proceso: {
    eyebrow: "Cómo trabajamos",
    title: "Cinco etapas, en este orden",
    intro:
      "El orden importa: saltarse el diagnóstico se paga en el montaje, y saltarse la documentación se paga en el primer mantenimiento.",
    pasos: [
      {
        titulo: "Diagnóstico",
        descripcion:
          "Visita a planta: levantamiento de lo instalado, medición de cargas reales y revisión de la secuencia del proceso con quien lo opera.",
      },
      {
        titulo: "Diseño",
        descripcion:
          "Unifilar, cuadro de cargas, P&ID y lista de señales. Se define el alcance, se seleccionan los equipos y se acuerda la ventana de parada.",
      },
      {
        titulo: "Montaje",
        descripcion:
          "Armado del tablero contra plano, canalizaciones, cableado marquillado e instalación de instrumentos y equipos de campo.",
      },
      {
        titulo: "Puesta en marcha",
        descripcion:
          "Pruebas punto a punto, carga del programa, ajuste de lazos de control y arranque con el proceso en operación y el operario presente.",
      },
      {
        titulo: "Soporte",
        descripcion:
          "Entrega de planos as-built, programas y manual, capacitación al personal y acompañamiento para afinar lo que solo se ve produciendo.",
      },
    ],
  },
  seccionServicios: {
    eyebrow: "Portafolio",
    title: "Servicios",
    intro:
      "Nueve servicios para el ciclo completo: diseñar la instalación, armarla, ponerla a producir y sostenerla después.",
    ctaEtiqueta: "Ver los nueve servicios",
  },
  seccionProyectos: {
    eyebrow: "Casos de éxito",
    title: "Proyectos entregados y funcionando",
    intro:
      "Automatizaciones y sistemas de control ejecutados en plantas de producción del Valle del Cauca.",
    ctaEtiqueta: "Ver todos los proyectos",
  },
  seccionValores: {
    eyebrow: "Lo que sostiene el trabajo",
    title: "Nuestros valores",
    intro:
      "Cuatro criterios que se notan en cómo se cotiza, cómo se ejecuta y qué se entrega al final del proyecto.",
  },
  serviciosDestacados: [
    "automatizacion-procesos-industriales",
    "tableros-de-control",
    "diseno-ingenieria-electrica",
    "telemetria",
  ],
  proyectosDestacados: [
    "preparacion-alcohol-jgb",
    "pasteurizador-alival",
    "estacion-cargue-alival",
  ],
  // Franja de logos al final de la portada (PIYC, reunión del 23-sep-2026).
  // Solo clientes con un caso publicado: cada logo lleva a ese caso. Los tres
  // archivos se normalizaron a un mismo lienzo de 320×120 con transparencia
  // —recorte al contenido, alto óptico parejo, sin deformar ni recolorear— y
  // su procedencia está en docs/CONTENIDO.md §«Logos de clientes».
  clientes: {
    eyebrow: "Clientes",
    title: "Plantas que confiaron el proceso",
    intro:
      "Cada logo lleva al caso de éxito de ese cliente: qué se intervino, cómo se hizo y cómo quedó el proceso al entregarlo.",
    logos: [
      {
        nombre: "JGB",
        logo: {
          src: `${BUCKET}/clientes/logo-jgb.webp`,
          alt: "Logo de JGB, cliente de PIYC",
          width: 320,
          height: 120,
        },
        proyectoSlug: "preparacion-alcohol-jgb",
      },
      {
        nombre: "Alival",
        logo: {
          src: `${BUCKET}/clientes/logo-alival.webp`,
          alt: "Logo de Alival, cliente de PIYC",
          width: 320,
          height: 120,
        },
        proyectoSlug: "pasteurizador-alival",
      },
      {
        nombre: "B. Altman",
        logo: {
          src: `${BUCKET}/clientes/logo-b-altman.webp`,
          alt: "Logo de B. Altman, cliente de PIYC",
          width: 320,
          height: 120,
        },
        proyectoSlug: "ingenieria-control-b-altman",
      },
    ],
  },
  cta: {
    title: "¿Tiene un proceso que automatizar o un tablero que rehacer?",
    body: "Cuéntenos qué necesita y con qué restricciones trabaja su planta. Respondemos por WhatsApp y, si hace falta, vamos a verlo en sitio.",
    ctaPrimario: { etiqueta: "Escríbanos por WhatsApp", href: "whatsapp" },
    ctaSecundario: { etiqueta: "Ir al formulario de contacto", href: "/contacto" },
    nota: {
      texto: "También puede",
      enlace: { etiqueta: "revisar el portafolio de servicios", href: "/servicios" },
      textoFinal: "antes de escribirnos.",
    },
  },
};

/* ===================================================================== */
/* nosotros — página /nosotros                                            */
/* ===================================================================== */

export const nosotrosEstatico: AjustesNosotros = {
  hero: {
    eyebrow: "Quiénes somos",
    title: "Ingenieros que trabajan dentro de la planta, no sobre el catálogo",
    subtitle:
      "PROGRAMACIÓN INDUSTRIAL Y CONTROL S.A.S. —PIYC— desarrolla proyectos de ingeniería, montaje y mantenimiento de equipos eléctricos y electrónicos para la industria del Valle del Cauca.",
    // Fondo a sangre de la cabecera: 1920 px + variante de 900 para el celular.
    image: {
      src: `${BUCKET}/cabeceras/montaje-interno-tablero.webp`,
      srcMovil: `${BUCKET}/cabeceras/montaje-interno-tablero-900.webp`,
      alt: "Vista cenital del montaje interno de un tablero: PLC, switch de red, fuente de 24 V, protecciones y borneras numeradas sobre riel",
      width: 1920,
      height: 1081,
    },
  },
  quienesSomos: {
    eyebrow: "La empresa",
    title: "Quiénes somos",
    // Texto de PIYC (documento «4. QUIÉNES SOMOS», versión pulida).
    body: "Somos una empresa integrada por ingenieros altamente calificados, especializados en el desarrollo de proyectos de ingeniería, montaje y mantenimiento de equipos eléctricos y electrónicos. Nos dedicamos a la automatización de equipos, así como a la ejecución de obras eléctricas y electrónicas. Nuestro enfoque abarca desde la automatización y el control hasta el desarrollo de equipos de óptima calidad.\n\nOfrecemos servicios de alta calidad para dar soluciones asertivas, reduciendo el riesgo y dando la seguridad de que nuestra propuesta es la mejor, brindando tranquilidad y respaldo a cada cliente en su proceso de producción.",
    // Recorte 4:5 de la foto del técnico cableando (antes, 1.ª de la galería).
    // La de los dos técnicos con traje de planta se retiró por decisión de
    // Cesar (22-sep-2026) y no se usa en ninguna parte (docs/CONTENIDO.md §2.2).
    image: {
      src: `${BUCKET}/nosotros/tecnico-cableando-tablero-4x5.webp`,
      srcMovil: `${BUCKET}/nosotros/tecnico-cableando-tablero-4x5-900.webp`,
      alt: "Técnico con overol y cofia trabaja en el cableado interno de un tablero de control dentro de una planta de alimentos",
      width: 1184,
      height: 1480,
    },
  },
  // ⚠ Textos intercambiados respecto al documento original de PIYC por decisión
  // de Cesar (21-sep-2026): lo que el documento rotulaba «Visión» describe lo
  // que la empresa hace hoy —eso es la misión— y lo rotulado «Misión» describe
  // a dónde quiere llegar —eso es la visión—. Los rótulos no se movieron.
  mision: {
    title: "Misión",
    body: "Proveer soluciones innovadoras en el desarrollo, el mantenimiento y el control de proyectos de ingeniería, adaptándonos a las necesidades específicas de cada cliente, con estándares de alta calidad y una cultura de mejora continua.",
  },
  vision: {
    title: "Visión",
    body: "Posicionarnos como el proveedor líder de servicios para el sector industrial, reafirmando nuestro profesionalismo al transformar cada idea en soluciones efectivas, con equilibrio entre las necesidades del cliente, el compromiso, los altos estándares de calidad y los resultados.",
  },
  valores: {
    eyebrow: "Cómo trabajamos",
    title: "Nuestros valores",
    intro:
      "Cuatro criterios que se notan en cómo se cotiza, cómo se ejecuta y qué se entrega al final del proyecto.",
  },
  bloqueGaleria: {
    eyebrow: "En obra",
    title: "Nuestro trabajo",
  },
  cta: {
    title: "¿Quiere trabajar con nosotros?",
    body: "Cuéntenos qué necesita su planta y con qué restricciones trabaja. Revisamos el alcance antes de proponer cualquier cosa.",
  },
  // Galería «Nuestro trabajo»: fotos del propio equipo de PIYC en obra
  // (Drive del cliente, carpeta «9. FOTOS»; catálogo en docs/CONTENIDO.md §2).
  // El orden cuenta la historia: primero el trabajo en marcha, después el
  // terminado. Abre la puesta en marcha y no la foto de la chaqueta de PIYC
  // (447 px): si el diseño pinta grande la primera, esa se vería borrosa.
  // Tres fotos salieron el 22-sep-2026 para no repetirse: el técnico cableando
  // pasó a «Quiénes somos», el tablero de doble puerta a la cabecera de
  // /contacto y el tablero inox con PLC compacto a la portada de automatización.
  // Ese mismo día entraron dos que nunca se habían publicado —la HMI en la
  // puerta del tablero (rescatada de las descartadas por resolución) y el
  // instrumento sobre el tanque—, y la galería quedó en nueve: la última sale
  // de un fotograma del video del Drive (docs/CONTENIDO.md §2.4).
  galeria: [
    {
      src: `${BUCKET}/nosotros/puesta-en-marcha-variadores.webp`,
      alt: "Puesta en marcha de un tablero en acero inoxidable con tres variadores de velocidad, con el portátil y el terminal de pruebas sobre la mesa",
      width: 888,
      height: 1920,
    },
    {
      src: `${BUCKET}/nosotros/tecnico-piyc-tablero-inox.webp`,
      alt: "Técnico con la chaqueta de PIYC interviene el cableado de un tablero de control en acero inoxidable",
      width: 447,
      height: 489,
    },
    {
      src: `${BUCKET}/nosotros/programacion-tablero-portatil.webp`,
      alt: "Tablero de control abierto durante la puesta en marcha, con un portátil conectado al PLC para cargar el programa",
      width: 934,
      height: 1920,
    },
    {
      src: `${BUCKET}/nosotros/instrumento-campo-tanque.webp`,
      alt: "Instrumento de proceso con abrazadera sanitaria y cable naranja, instalado sobre la pared de un tanque de acero inoxidable",
      width: 520,
      height: 694,
    },
    {
      src: `${BUCKET}/nosotros/tablero-plc-modular-portatil.webp`,
      alt: "Tablero con PLC modular, protecciones y borneras, con un portátil conectado durante la programación",
      width: 933,
      height: 1920,
    },
    {
      src: `${BUCKET}/nosotros/hmi-puerta-tablero-obra.webp`,
      alt: "Pantalla HMI encendida en la puerta de un tablero recién instalado, que todavía conserva la película protectora de la lámina",
      width: 357,
      height: 497,
    },
    {
      src: `${BUCKET}/nosotros/gabinete-fuerza-armado-900.webp`,
      alt: "Gabinete de fuerza abierto con seccionador, interruptores de caja moldeada y equipo de respaldo en la base",
      width: 900,
      height: 1660,
    },
    {
      src: `${BUCKET}/nosotros/tablero-fuerza-barraje.webp`,
      alt: "Tablero de fuerza abierto con barraje de cobre, interruptores automáticos y bloques de borneras",
      width: 933,
      height: 1920,
    },
    {
      src: `${BUCKET}/nosotros/linea-envasado-sala-produccion.webp`,
      alt: "Línea de envasado y dosificación en operación dentro de una sala de producción, con la máquina cerrada por sus guardas de seguridad",
      width: 1920,
      height: 1080,
      srcMovil: `${BUCKET}/nosotros/linea-envasado-sala-produccion-900.webp`,
    },
  ],
};

/* ===================================================================== */
/* paginas — cabeceras, introducciones y FAQ                              */
/* ===================================================================== */

export const paginasEstatico: AjustesPaginas = {
  servicios: {
    eyebrow: "Portafolio",
    title: "Nueve servicios, cuatro líneas de trabajo",
    subtitle:
      "Ofrecemos servicios de alta calidad para dar soluciones asertivas, reduciendo el riesgo y dando la seguridad de que nuestra propuesta es la mejor, brindando tranquilidad y respaldo a cada cliente en su proceso de producción.",
    intro:
      "La agrupación en cuatro líneas es una forma de leer el portafolio, no un compartimento: la mayoría de los proyectos toca varias a la vez —un tablero nuevo viene con su diseño eléctrico, y una automatización termina con telemetría.",
    image: {
      src: `${BUCKET}/cabeceras/interior-tablero-plc-red.webp`,
      srcMovil: `${BUCKET}/cabeceras/interior-tablero-plc-red-900.webp`,
      alt: "Interior de un tablero en acero inoxidable con PLC modular, switches de red industrial, protecciones y borneras cableadas",
      width: 1920,
      height: 933,
    },
    // FAQ redactada por el equipo de la web. Sin precios, tiempos ni garantías:
    // nada de eso está confirmado por PIYC (regla: no prometer lo que no se sabe).
    faq: [
      {
        pregunta: "¿Atienden plantas que no pueden parar la producción?",
        respuesta:
          "Sí. La ventana de parada es parte del diseño, no un detalle de última hora: se acuerda desde la etapa de ingeniería y el montaje se planea alrededor de ella, dejando para la parada solo lo que obligatoriamente va ahí.",
      },
      {
        pregunta: "¿Trabajan sobre equipos y PLC que ya están instalados?",
        respuesta:
          "Sí. Buena parte de los proyectos son migraciones y repotenciaciones: se conserva la lógica del proceso que ya funciona y se lleva a un controlador vigente, integrándolo por los protocolos que la planta ya usa.",
      },
      {
        pregunta: "¿El programa del PLC y de la HMI queda en manos del cliente?",
        respuesta:
          "Sí. Al cierre se entregan los programas, los planos actualizados a lo realmente construido y el manual de operación. No dejamos candados: quien contrató el sistema tiene que poder mantenerlo o hacerlo mantener por quien decida.",
      },
      {
        pregunta: "¿Hacen solo el diseño, o solo el tablero?",
        respuesta:
          "Los servicios se pueden contratar por separado. También se puede contratar el alcance completo como proyecto llave en mano, con un solo responsable de la ingeniería, el suministro, el montaje y la puesta en marcha.",
      },
      {
        pregunta: "¿En qué zona prestan el servicio?",
        respuesta:
          "La base está en Cali, Valle del Cauca, y desde ahí se atienden proyectos en la región. Para trabajos fuera de la ciudad, escríbanos y lo revisamos según el alcance.",
      },
    ],
    cta: {
      title: "¿No está seguro de qué servicio necesita?",
      body: "Descríbanos el problema —el proceso, el equipo o la falla— y le decimos por dónde se aborda antes de cotizar nada.",
    },
  },
  proyectos: {
    eyebrow: "Casos de éxito",
    title: "Proyectos entregados y funcionando",
    subtitle:
      "Automatizaciones, sistemas de control y proyectos de ingeniería eléctrica ejecutados en plantas de producción del Valle del Cauca.",
    intro:
      "Cada caso describe la situación de partida, lo que se hizo y cómo quedó el proceso después. Las cifras que aparecen son las que midió el mismo proceso del cliente.",
    image: {
      src: `${BUCKET}/cabeceras/cuarto-electrico-tableros.webp`,
      srcMovil: `${BUCKET}/cabeceras/cuarto-electrico-tableros-900.webp`,
      alt: "Cuarto eléctrico con una fila de tableros de control y fuerza montados contra la pared; uno de ellos abierto durante el cableado",
      width: 1920,
      height: 943,
    },
    cta: {
      title: "¿Tiene un proyecto parecido?",
      body: "Cuéntenos qué proceso quiere intervenir y con qué restricciones trabaja su planta.",
    },
  },
  contacto: {
    eyebrow: "Contacto",
    title: "Cuéntenos qué necesita su planta",
    subtitle:
      "Escríbanos por WhatsApp o déjenos los datos del proyecto en el formulario. Respondemos con las preguntas técnicas que hagan falta antes de proponer nada.",
    image: {
      src: `${BUCKET}/cabeceras/tablero-doble-puerta-armado-apaisada.webp`,
      srcMovil: `${BUCKET}/cabeceras/tablero-doble-puerta-armado-apaisada-900.webp`,
      alt: "Tablero de doble puerta abierto y recién armado, con contactores, protecciones y fuentes ordenados por nivel",
      width: 1920,
      height: 1080,
    },
    introFormulario:
      "Al enviar, se abre WhatsApp con el mensaje ya escrito para que solo tenga que darle enviar. No enviamos correos automáticos.",
    notaFormulario:
      "Los datos que escriba aquí se usan únicamente para responder su solicitud. No compartimos su información con terceros ni lo suscribimos a ningún boletín.",
    // FAQ redactada por el equipo de la web. Sin tiempos de respuesta, precios
    // ni garantías: nada de eso lo ha confirmado PIYC.
    faq: [
      {
        pregunta: "¿Qué pasa cuando envío el formulario?",
        respuesta:
          "Se abre WhatsApp con el mensaje ya escrito —sus datos y lo que nos contó— para que solo tenga que darle enviar. El sitio no envía correos automáticos. Si su navegador bloquea la ventana, aparece un enlace para abrirlo a mano.",
      },
      {
        pregunta: "¿Qué información les sirve para dar un alcance?",
        respuesta:
          "Entre más concreto, mejor: qué equipo o proceso es, qué marca y referencia de controlador tiene hoy si lo sabe, qué falla o qué quiere lograr, y si la planta puede parar o no. Con eso le decimos qué falta para cotizar.",
      },
      {
        pregunta: "¿Atienden fuera de Cali?",
        respuesta:
          "La base está en Cali, Valle del Cauca. Para trabajos en otras ciudades escríbanos con el alcance y lo revisamos: depende del tipo de proyecto y del tiempo de montaje en sitio.",
      },
      {
        pregunta: "¿Puedo escribirles directamente por WhatsApp?",
        respuesta:
          "Sí. El botón verde del sitio abre una conversación con nuestro número de WhatsApp, que también aparece en esta página. El formulario existe para que el mensaje llegue con los datos completos desde el primer envío.",
      },
    ],
  },
  proyectoDetalle: {
    notaServicios: "Este caso combinó varios servicios de PIYC. Abajo puede ver cada uno.",
    cta: {
      title: "¿Quiere un resultado parecido en su planta?",
      body: "Escríbanos con los datos de su proceso y revisamos si se puede abordar de la misma forma.",
    },
  },
  servicioDetalle: {
    ctaTexto:
      "Escríbanos con los datos del equipo o del proceso y le decimos qué información hace falta para cotizar.",
  },
  noEncontrada: {
    title: "Esta página no existe",
    body: "El enlace puede estar mal escrito o la página pudo haber cambiado de dirección. Desde aquí puede volver al inicio o ir directo al portafolio de servicios.",
  },
};

/* ===================================================================== */
/* seo — metadatos por ruta                                               */
/* ===================================================================== */

export const seoEstatico: AjustesSeo = {
  defaultTitle: "PIYC — Automatización e ingeniería eléctrica en Cali",
  titleTemplate: "%s | PIYC",
  defaultDescription:
    "Automatización de procesos con PLC y HMI/SCADA, tableros de control y potencia, telemetría y proyectos eléctricos llave en mano en Cali, Valle del Cauca.",
  keywords: [
    "automatización industrial Cali",
    "tableros de control Cali",
    "programación PLC",
    "HMI SCADA",
    "ingeniería eléctrica industrial",
    "telemetría industrial",
    "cuartos fríos Cali",
  ],
  paginas: {
    inicio: {
      title: "PIYC — Automatización e ingeniería eléctrica en Cali",
      description:
        "Automatización de procesos con PLC y HMI/SCADA, tableros de control y potencia, telemetría y proyectos eléctricos llave en mano en Cali, Valle del Cauca.",
    },
    nosotros: {
      title: "Quiénes somos",
      description:
        "PIYC — Programación Industrial y Control S.A.S.: ingenieros dedicados a proyectos de ingeniería, montaje y mantenimiento de equipos eléctricos y electrónicos.",
    },
    servicios: {
      title: "Servicios",
      description:
        "Automatización con PLC, tableros de control y potencia, ingeniería eléctrica, telemetría, telecontrol, proyectos llave en mano, refrigeración y climatización.",
    },
    proyectos: {
      title: "Proyectos",
      description:
        "Casos de éxito de PIYC: automatizaciones, sistemas de control e ingeniería eléctrica entregados en plantas de producción del Valle del Cauca.",
    },
    contacto: {
      title: "Contacto",
      description:
        "Escríbanos por WhatsApp o déjenos los datos de su proyecto. Cl. 33 #5-76, Local 2, Cali. Automatización industrial e ingeniería eléctrica.",
    },
  },
};
