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
  PoliticaDatos,
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
    fondo: {
      tipo: "imagen" as const,
      imagen: {
        src: `${BUCKET}/inicio/hero-linea-envasado.webp`,
        alt: "Línea de envasado y dosificación en operación dentro de una sala de producción",
        width: 1920,
        height: 1080,
        srcMovil: `${BUCKET}/inicio/hero-linea-envasado-900.webp`,
      },
    },
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
  // El logo con `proyectoSlug` lleva al caso de ese cliente; el que no lo
  // tiene se pinta sin enlace hasta que haya caso. Los cinco archivos se
  // normalizaron a un mismo lienzo de 320×120 con transparencia
  // —recorte al contenido, alto óptico parejo, sin deformar ni recolorear— y
  // su procedencia está en docs/CONTENIDO.md §«Logos de clientes».
  clientes: {
    eyebrow: "Clientes",
    title: "Plantas que confiaron el proceso",
    intro:
      "Plantas de alimentos, empaques y manufactura que confiaron su proceso a PIYC. Donde hay caso publicado, el logo lleva a él.",
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
      // Sin `proyectoSlug`: todavía no hay caso publicado con ellos, así que el
      // logo se pinta sin enlace hasta que PIYC le asigne uno desde el panel.
      {
        nombre: "Nestlé",
        logo: {
          src: `${BUCKET}/clientes/logo-nestle.webp`,
          alt: "Logo de Nestlé, cliente de PIYC",
          width: 320,
          height: 120,
        },
      },
      {
        nombre: "Litoplas",
        logo: {
          src: `${BUCKET}/clientes/logo-litoplas.webp`,
          alt: "Logo de Litoplas, cliente de PIYC",
          width: 320,
          height: 120,
        },
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
  ],
};

/* ===================================================================== */
/* Política de tratamiento de datos personales                            */
/* ===================================================================== */

/**
 * RESPALDO ESTÁTICO DE LA POLÍTICA DE TRATAMIENTO DE DATOS
 * ========================================================
 * Redactada para PIYC contra la **Ley 1581 de 2012** y el **Decreto 1074 de
 * 2015** (art. 2.2.2.25.3.1, contenido mínimo de la política). No es copia de
 * ninguna plantilla y solo describe lo que el sitio hace de verdad.
 *
 * NINGÚN DATO DE CONTACTO VA ESCRITO AQUÍ. La razón social, el NIT, la
 * dirección, el teléfono, el correo y el horario entran por marcadores
 * (`{razonSocial}`, `{nit}`, `{direccion}`, `{telefono}`, `{correo}`,
 * `{horario}`, `{ciudad}`, `{sitio}`) que `src/lib/politica-datos.ts` sustituye
 * con lo que haya en `site_settings.contact`. Si PIYC cambia de sede o de
 * correo, la política cambia sola.
 *
 * Una línea que empieza por «- » se pinta como viñeta; una línea en blanco
 * separa párrafos. Es todo lo que el formato entiende, a propósito.
 *
 * ⚠ PENDIENTE DE APROBACIÓN DE PIYC: el plazo de conservación de los leads
 * (dos años desde el último contacto) es una decisión de negocio, no un
 * mandato legal; y queda por confirmar con su contadora si PIYC supera los
 * 100.000 UVT en activos, que es lo que obligaría a registrar las bases de
 * datos ante la SIC (no aplica a la mayoría de empresas de este tamaño).
 */
function politicaDatosEstatica(): PoliticaDatos {
  return {
    eyebrow: "Datos personales",
    title: "Política de tratamiento de datos personales",
    subtitle:
      "Qué datos suyos recogemos, para qué los usamos, cuánto los guardamos y cómo puede pedirnos que los conozcamos, corrijamos o eliminemos.",
    vigenteDesde: "2026-09-29",
    version: "1.0",
    intro:
      "Esta política se expide en cumplimiento de la Ley 1581 de 2012 y del Decreto 1074 de 2015, que son las normas que regulan la protección de datos personales en Colombia. Está escrita para que se entienda sin ser abogado: si algo no le queda claro, escríbanos y se lo explicamos.",
    etiquetaCasilla: "Autorizo el tratamiento de mis datos personales conforme a la",
    enlaceCasilla: "política de tratamiento de datos de PIYC",
    avisoPortal:
      "Los datos de su cuenta y el registro de sus jornadas se tratan conforme a la política de tratamiento de datos personales de PIYC.",
    secciones: [
      {
        titulo: "Quién responde por sus datos",
        cuerpo: `{razonSocial} —en adelante PIYC—, identificada con NIT {nit} y domiciliada en {direccion}, es la responsable del tratamiento de los datos personales que se recogen a través de este sitio web y de las herramientas internas de la empresa.

La atención de peticiones, consultas y reclamos sobre datos personales está a cargo de la administración de PIYC, y el canal para dirigirse a ella es el correo {correo} y la línea {telefono}. El horario de atención es {horario}.`,
      },
      {
        titulo: "Qué datos recogemos y por dónde",
        cuerpo: `Recogemos únicamente los datos que usted nos entrega. No compramos bases de datos, no seguimos su navegación por otros sitios y no armamos perfiles suyos.

Por el formulario de contacto de este sitio recogemos:
- Su nombre.
- La empresa en la que trabaja.
- Su teléfono.
- Su correo electrónico, que es opcional.
- El servicio de interés, si escoge uno de la lista.
- El mensaje que usted escriba.

Junto a cada mensaje guardamos la fecha y la hora, el número de WhatsApp al que se dirigió la consulta y un valor derivado de su dirección IP mediante una función criptográfica con una clave que solo conoce nuestro servidor. Ese valor no permite reconstruir su dirección IP: sirve para limitar cuántos mensajes se pueden enviar por hora desde una misma conexión y frenar los envíos automatizados.

Si prefiere escribirnos directamente por WhatsApp, esa conversación ocurre dentro de la aplicación y se rige además por las condiciones de su proveedor.

De las personas que trabajan en PIYC tratamos, en el portal interno del equipo, el nombre, el documento de identidad, el cargo, el teléfono, el usuario de acceso y el registro de las jornadas trabajadas con sus horas y su estado de aprobación. Esa información la usa exclusivamente la empresa.`,
      },
      {
        titulo: "Para qué usamos sus datos",
        cuerpo: `Los datos que nos deja por el formulario se usan para:
- Responder su solicitud y hacerle las preguntas técnicas necesarias para entenderla.
- Preparar y enviarle la cotización o la propuesta del servicio por el que preguntó.
- Dar seguimiento a esa solicitud y conservar el histórico de la conversación con su empresa.
- Llevar el registro interno de las solicitudes que llegan por el sitio.

Los datos del personal se usan para administrar la relación laboral, liquidar las horas trabajadas y cumplir las obligaciones laborales, contables y tributarias que la ley nos impone.

No usamos sus datos para publicidad masiva, ni los vendemos, alquilamos o cedemos a terceros con fines comerciales. Si algún día quisiéramos enviarle comunicaciones comerciales distintas de la respuesta a su solicitud, se lo pediríamos aparte.`,
      },
      {
        titulo: "Con qué autorización los tratamos",
        cuerpo: `La base del tratamiento es su autorización previa, expresa e informada, que usted otorga al marcar la casilla que aparece en el formulario antes de enviarlo. Si esa casilla no está marcada, el formulario no se envía y no guardamos nada.

De cada autorización dejamos constancia de la fecha y la hora en que se otorgó y de la versión de esta política que estaba publicada en ese momento, para poder demostrar qué texto fue el que usted aceptó.

En el caso del personal, además de su autorización, el tratamiento se apoya en la relación laboral y en las obligaciones legales que se derivan de ella.

Usted puede revocar su autorización en cualquier momento y pedir que eliminemos sus datos, salvo cuando exista un deber legal o contractual que nos obligue a conservarlos.`,
      },
      {
        titulo: "Cuánto tiempo los conservamos",
        cuerpo: `Los mensajes recibidos por el formulario se conservan mientras la solicitud siga viva y, después, hasta dos años contados desde el último contacto, que es el tiempo en el que una consulta comercial todavía puede retomarse. Cumplido ese plazo, o antes si usted lo solicita, el mensaje se elimina.

Los datos del personal se conservan mientras dure el vínculo laboral y, terminado este, por el tiempo que exigen las normas laborales, contables y tributarias.

Nuestras bases de datos permanecen vigentes mientras PIYC desarrolle su objeto social y sean necesarias para las finalidades descritas en esta política. El criterio es siempre el mismo: ningún dato se guarda más allá de lo que hace falta para la finalidad que lo justificó.`,
      },
      {
        titulo: "Con quién se comparten",
        cuerpo: `Sus datos no se entregan a terceros para que los usen por su cuenta. Solo intervienen los proveedores que nos prestan la infraestructura del sitio, que actúan como encargados del tratamiento y siguen nuestras instrucciones:
- El proveedor de alojamiento del sitio web, que sirve las páginas y mantiene los registros técnicos de acceso.
- El proveedor de la base de datos y del almacenamiento, donde queda guardado el mensaje del formulario y la información del portal del equipo.
- WhatsApp, únicamente si usted decide continuar la conversación por ese medio: en ese caso el mensaje viaja por esa aplicación.

Los servidores de esos proveedores están fuera de Colombia. Al autorizar el tratamiento usted autoriza también esa transmisión internacional, que se hace con proveedores que aplican estándares de seguridad equiparables a los que exige la normativa colombiana.

También podemos entregar información cuando la solicite una autoridad judicial o administrativa competente en ejercicio de sus funciones.`,
      },
      {
        titulo: "Cookies y medición",
        cuerpo: `Este sitio no usa cookies de publicidad, de analítica ni de redes sociales, y no tiene rastreadores de terceros. Por eso no verá un aviso de cookies: no hay nada que consentir.

Las únicas cookies propias que se instalan son las de sesión del portal del equipo y del panel de administración. Se crean cuando alguien inicia sesión, sirven para mantener esa sesión abierta y se eliminan al cerrarla. Son técnicamente necesarias y no siguen su navegación. Si usted solo visita el sitio público, no se instala ninguna.

La página de contacto incluye un mapa de Google incrustado para mostrar dónde quedamos. Ese recuadro lo sirve Google y, al cargarse, ese proveedor recibe su dirección IP y aplica sus propias condiciones. En nuestras comprobaciones ese mapa no instala cookies en su navegador, pero es contenido de un tercero y su comportamiento no depende de nosotros. La dirección también está escrita en el texto de la página, por si prefiere no cargar el mapa.`,
      },
      {
        titulo: "Datos de niñas, niños y adolescentes",
        cuerpo: `El sitio y los servicios de PIYC se dirigen a empresas y a personas mayores de edad. No recogemos de manera deliberada datos de menores de edad, y el formulario no los solicita.

Si llegáramos a recibir datos de un menor sin autorización de su representante legal, los eliminaremos tan pronto lo advirtamos. Si usted cree que eso ocurrió, escríbanos a {correo}.`,
      },
      {
        titulo: "Sus derechos como titular",
        cuerpo: `Como titular de sus datos personales usted puede:
- Conocer qué datos suyos tenemos y cómo los estamos usando.
- Actualizarlos cuando hayan cambiado.
- Rectificarlos cuando estén incompletos, sean inexactos o induzcan a error.
- Solicitar su supresión cuando ya no se necesiten para la finalidad autorizada o cuando considere que el tratamiento no respeta la ley.
- Revocar la autorización que nos dio.
- Ser informado, cuando lo pida, sobre el uso que le hemos dado a sus datos.
- Presentar quejas ante la Superintendencia de Industria y Comercio, que es la autoridad de protección de datos en Colombia, una vez haya agotado el trámite de consulta o reclamo ante nosotros.

Estos derechos los ejerce el titular, sus causahabientes, su representante o apoderado, o quien actúe por estipulación a favor de otro. Para atender la solicitud necesitamos poder verificar quién la presenta.`,
      },
      {
        titulo: "Cómo ejercer sus derechos y en cuánto respondemos",
        cuerpo: `Escríbanos a {correo} con el asunto «Protección de datos» e indíquenos su nombre, un dato de contacto, qué solicita y, si lo recuerda, la fecha aproximada en que nos escribió. También puede comunicarse al {telefono} y le indicamos cómo formalizar la solicitud; siempre la dejamos por escrito para poder darle trazabilidad. Atendemos en el horario {horario}.

Los plazos son los que fija la ley:
- Consultas, para saber qué datos tenemos y cómo los usamos: respondemos en un término máximo de diez (10) días hábiles contados desde que recibimos la solicitud. Si no nos fuera posible, se lo informamos con los motivos y la fecha en que la atenderemos, que no superará los cinco (5) días hábiles siguientes al vencimiento del primer término.
- Reclamos, para corregir, actualizar o suprimir datos o para revocar la autorización: respondemos en un término máximo de quince (15) días hábiles contados desde el día siguiente a la fecha en que lo recibimos. Si no nos fuera posible, se lo informamos con los motivos y la fecha en que lo atenderemos, que no superará los ocho (8) días hábiles siguientes al vencimiento del primer término.

Si el reclamo llega incompleto, dentro de los cinco (5) días siguientes le pediremos que lo complete; si pasan dos meses sin que recibamos respuesta, entenderemos que desistió. Si el reclamo debe atenderlo otra persona o entidad, se lo trasladamos dentro de los dos (2) días hábiles siguientes y se lo informamos.

Presentar una consulta o un reclamo no tiene ningún costo para usted.`,
      },
      {
        titulo: "Cómo protegemos la información",
        cuerpo: `Aplicamos medidas razonables para que sus datos no se pierdan ni queden al alcance de quien no debe: acceso con usuario y contraseña, permisos por rol, reglas de acceso en la propia base de datos y conexión cifrada en todo el sitio. Solo el personal de PIYC que necesita la información para su trabajo puede consultarla.

Ningún sistema es infalible. Si llegara a ocurrir un incidente que afecte sus datos, actuaremos para contenerlo y daremos los avisos que la ley exija.`,
      },
      {
        titulo: "Cambios en esta política",
        cuerpo: `Podemos actualizar esta política cuando cambien nuestros servicios, nuestras herramientas o la normativa aplicable. La versión vigente es siempre la publicada en esta misma página, con su número de versión y su fecha de entrada en vigencia al comienzo.

Si el cambio afecta de forma sustancial la finalidad del tratamiento, se lo comunicaremos antes de aplicarlo y, cuando la ley lo exija, le pediremos una autorización nueva.`,
      },
    ],
  };
}

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
      // No dice «no compartimos su información con terceros» a secas, como
      // antes: la política reconoce que hay proveedores de infraestructura y
      // que WhatsApp interviene si el visitante sigue por ahí. La nota del
      // formulario y la política tienen que decir lo mismo.
      "Los datos que escriba aquí se usan únicamente para responder su solicitud. No los vendemos ni los cedemos con fines comerciales, y no lo suscribimos a ningún boletín.",
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
  tratamientoDatos: politicaDatosEstatica(),
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
