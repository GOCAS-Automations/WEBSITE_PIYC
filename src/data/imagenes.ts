/**
 * FOTOS GENERALES DEL SITIO — INVENTARIO
 * ======================================
 * Fotos reales de PIYC tomadas en obra, del Drive del cliente (carpeta
 * «9. FOTOS»), procesadas a WebP (≤ 250 KB, lado mayor ≤ 1920 px, con la
 * orientación EXIF ya aplicada) y subidas al bucket público `site-images`.
 *
 * ⚠ Regla de reparto: una misma foto vive en UNA sola sección del sitio. Si
 * aparece dos veces en esta lista, algo se duplicó. Las capturas de HMI, SCADA
 * y planos no están aquí: pertenecen a los casos de éxito (`site_projects`),
 * que son de donde salieron.
 *
 * Este módulo es un inventario legible: ningún componente lo importa. Lo que el
 * sitio pinta sale de `site_settings` y `site_services`, con respaldo estático en
 * `ajustes.ts` y `servicios.ts`. El catálogo completo —incluidas las fotos
 * descartadas y el porqué— está en `docs/CONTENIDO.md` §2.
 */

export type FotoGeneral = {
  url: string;
  alt: string;
  width: number;
  height: number;
  /** Dónde se usa hoy. */
  uso: string;
};

export const imagenesGenerales: FotoGeneral[] = [
  {
    url: "https://bzrjeduxjkwvtdaohjrh.supabase.co/storage/v1/object/public/site-images/cabeceras/cuarto-electrico-tableros.webp",
    alt: "Cuarto eléctrico con una fila de tableros de control y fuerza montados contra la pared; uno de ellos abierto durante el cableado",
    width: 1920,
    height: 943,
    uso: "cabeceras/ — Cabecera de /nosotros.",
  },
  {
    url: "https://bzrjeduxjkwvtdaohjrh.supabase.co/storage/v1/object/public/site-images/cabeceras/interior-tablero-plc-red.webp",
    alt: "Interior de un tablero en acero inoxidable con PLC modular, switches de red industrial, protecciones y borneras cableadas",
    width: 1920,
    height: 933,
    uso: "cabeceras/ — Cabecera de /servicios.",
  },
  {
    url: "https://bzrjeduxjkwvtdaohjrh.supabase.co/storage/v1/object/public/site-images/cabeceras/montaje-interno-tablero.webp",
    alt: "Vista cenital del montaje interno de un tablero: PLC, switch de red, fuente de 24 V, protecciones y borneras numeradas sobre riel",
    width: 1920,
    height: 1081,
    uso: "cabeceras/ — Cabecera de /proyectos.",
  },
  {
    url: "https://bzrjeduxjkwvtdaohjrh.supabase.co/storage/v1/object/public/site-images/inicio/skid-proceso-inoxidable.webp",
    alt: "Skid de proceso en acero inoxidable con su panel de control, tuberías sanitarias y bomba, instalado en una sala de producción",
    width: 1440,
    height: 1920,
    uso: "inicio/ — Bloque «Qué hacemos» de la portada.",
  },
  {
    url: "https://bzrjeduxjkwvtdaohjrh.supabase.co/storage/v1/object/public/site-images/nosotros/equipo-planta-alimentos.webp",
    alt: "Dos técnicos con traje y cofia de planta revisan el programa en un portátil apoyado sobre el tablero, dentro de una sala de producción",
    width: 1440,
    height: 1920,
    uso: "nosotros/ — Bloque «Quiénes somos».",
  },
  {
    url: "https://bzrjeduxjkwvtdaohjrh.supabase.co/storage/v1/object/public/site-images/nosotros/tecnico-cableando-tablero.webp",
    alt: "Técnico con overol y cofia trabaja en el cableado interno de un tablero de control dentro de una planta de alimentos",
    width: 888,
    height: 1920,
    uso: "nosotros/ — Galería «Nuestro trabajo», posición 1.",
  },
  {
    url: "https://bzrjeduxjkwvtdaohjrh.supabase.co/storage/v1/object/public/site-images/nosotros/tecnico-piyc-tablero-inox.webp",
    alt: "Técnico con la chaqueta de PIYC interviene el cableado de un tablero de control en acero inoxidable",
    width: 447,
    height: 489,
    uso: "nosotros/ — Galería «Nuestro trabajo», posición 2.",
  },
  {
    url: "https://bzrjeduxjkwvtdaohjrh.supabase.co/storage/v1/object/public/site-images/nosotros/programacion-tablero-portatil.webp",
    alt: "Tablero de control abierto durante la puesta en marcha, con un portátil conectado al PLC para cargar el programa",
    width: 934,
    height: 1920,
    uso: "nosotros/ — Galería «Nuestro trabajo», posición 3.",
  },
  {
    url: "https://bzrjeduxjkwvtdaohjrh.supabase.co/storage/v1/object/public/site-images/nosotros/puesta-en-marcha-variadores.webp",
    alt: "Puesta en marcha de un tablero en acero inoxidable con tres variadores de velocidad, con el portátil y el terminal de pruebas sobre la mesa",
    width: 888,
    height: 1920,
    uso: "nosotros/ — Galería «Nuestro trabajo», posición 4.",
  },
  {
    url: "https://bzrjeduxjkwvtdaohjrh.supabase.co/storage/v1/object/public/site-images/nosotros/tablero-plc-modular-portatil.webp",
    alt: "Tablero con PLC modular, protecciones y borneras, con un portátil conectado durante la programación",
    width: 933,
    height: 1920,
    uso: "nosotros/ — Galería «Nuestro trabajo», posición 5.",
  },
  {
    url: "https://bzrjeduxjkwvtdaohjrh.supabase.co/storage/v1/object/public/site-images/nosotros/tablero-doble-puerta-armado.webp",
    alt: "Tablero de doble puerta recién armado, con contactores, fuentes y borneras ordenadas por nivel",
    width: 1440,
    height: 1920,
    uso: "nosotros/ — Galería «Nuestro trabajo», posición 6.",
  },
  {
    url: "https://bzrjeduxjkwvtdaohjrh.supabase.co/storage/v1/object/public/site-images/nosotros/gabinete-fuerza-armado.webp",
    alt: "Gabinete de fuerza abierto con seccionador, interruptores de caja moldeada y equipo de respaldo en la base",
    width: 1041,
    height: 1920,
    uso: "nosotros/ — Galería «Nuestro trabajo», posición 7.",
  },
  {
    url: "https://bzrjeduxjkwvtdaohjrh.supabase.co/storage/v1/object/public/site-images/nosotros/tablero-inox-plc-siemens.webp",
    alt: "Tablero en acero inoxidable con PLC compacto, switch de red y borneras; guantes dieléctricos colgados en la puerta",
    width: 1080,
    height: 1920,
    uso: "nosotros/ — Galería «Nuestro trabajo», posición 8.",
  },
  {
    url: "https://bzrjeduxjkwvtdaohjrh.supabase.co/storage/v1/object/public/site-images/nosotros/tablero-fuerza-barraje.webp",
    alt: "Tablero de fuerza abierto con barraje de cobre, interruptores automáticos y bloques de borneras",
    width: 933,
    height: 1920,
    uso: "nosotros/ — Galería «Nuestro trabajo», posición 9.",
  },
  {
    url: "https://bzrjeduxjkwvtdaohjrh.supabase.co/storage/v1/object/public/site-images/servicios/automatizacion-procesos-industriales/tablero-inox-plc-borneras.webp",
    alt: "Tablero de automatización en acero inoxidable con PLC compacto, fuente de 24 V y borneras identificadas una a una",
    width: 888,
    height: 1920,
    uso: "servicios/automatizacion-procesos-industriales/ — Portada del servicio y primera de su galería.",
  },
  {
    url: "https://bzrjeduxjkwvtdaohjrh.supabase.co/storage/v1/object/public/site-images/servicios/automatizacion-procesos-industriales/tablero-plc-compacto-red.webp",
    alt: "Tablero con PLC compacto, switch de red industrial y fuente conmutada, cableado y marquillado",
    width: 889,
    height: 1920,
    uso: "servicios/automatizacion-procesos-industriales/ — Galería del servicio.",
  },
  {
    url: "https://bzrjeduxjkwvtdaohjrh.supabase.co/storage/v1/object/public/site-images/servicios/tableros-de-control/tablero-doble-puerta-terminado.webp",
    alt: "Tablero de doble puerta terminado, con rejillas de ventilación y visor, listo para despacho",
    width: 1440,
    height: 1920,
    uso: "servicios/tableros-de-control/ — Portada del servicio y primera de su galería.",
  },
  {
    url: "https://bzrjeduxjkwvtdaohjrh.supabase.co/storage/v1/object/public/site-images/servicios/tableros-de-control/tablero-plc-modular-reles.webp",
    alt: "Tablero de gran formato con PLC modular, bancos de relés de interposición y borneras, con los planos abiertos durante el montaje",
    width: 1440,
    height: 1920,
    uso: "servicios/tableros-de-control/ — Galería del servicio.",
  },
  {
    url: "https://bzrjeduxjkwvtdaohjrh.supabase.co/storage/v1/object/public/site-images/servicios/diseno-ingenieria-electrica/tablero-potencia-interruptores.webp",
    alt: "Interior de un tablero de potencia con seccionador de entrada e interruptores de caja moldeada sobre el barraje",
    width: 865,
    height: 1920,
    uso: "servicios/diseno-ingenieria-electrica/ — Portada del servicio y primera de su galería.",
  },
  {
    url: "https://bzrjeduxjkwvtdaohjrh.supabase.co/storage/v1/object/public/site-images/servicios/diseno-ingenieria-electrica/tableros-cuarto-electrico.webp",
    alt: "Dos tableros cerrados instalados en un cuarto eléctrico, con ventilación forzada y panel de medición en la puerta",
    width: 934,
    height: 1920,
    uso: "servicios/diseno-ingenieria-electrica/ — Galería del servicio.",
  },
  {
    url: "https://bzrjeduxjkwvtdaohjrh.supabase.co/storage/v1/object/public/site-images/servicios/telemetria/tablero-pared-sala-proceso.webp",
    alt: "Tablero rotulado montado en pared junto al visor de la sala de proceso, con la canalización llevada al equipo",
    width: 1126,
    height: 1920,
    uso: "servicios/telemetria/ — Portada del servicio y primera de su galería.",
  },
  {
    url: "https://bzrjeduxjkwvtdaohjrh.supabase.co/storage/v1/object/public/site-images/servicios/telecontrol/tablero-variadores-velocidad.webp",
    alt: "Interior de un tablero con variadores de velocidad de distintas potencias, PLC modular y protecciones",
    width: 1440,
    height: 1920,
    uso: "servicios/telecontrol/ — Portada del servicio y primera de su galería.",
  },
  {
    url: "https://bzrjeduxjkwvtdaohjrh.supabase.co/storage/v1/object/public/site-images/servicios/proyectos-llave-en-mano/linea-empaque-planta.webp",
    alt: "Línea de transporte y empaque montada dentro de una planta, con el área aislada durante la obra",
    width: 1920,
    height: 934,
    uso: "servicios/proyectos-llave-en-mano/ — Portada del servicio y primera de su galería.",
  },
  {
    url: "https://bzrjeduxjkwvtdaohjrh.supabase.co/storage/v1/object/public/site-images/servicios/aplicaciones-industriales/tablero-servodrives.webp",
    alt: "Tablero de control con PLC, arrancadores y servoaccionamientos montados sobre la placa de fondo",
    width: 864,
    height: 1920,
    uso: "servicios/aplicaciones-industriales/ — Portada del servicio y primera de su galería.",
  },
  {
    url: "https://bzrjeduxjkwvtdaohjrh.supabase.co/storage/v1/object/public/site-images/servicios/aplicaciones-industriales/gabinete-terminado-taller.webp",
    alt: "Gabinete metálico terminado en el taller, con rejillas de ventilación y base de zócalo",
    width: 865,
    height: 1920,
    uso: "servicios/aplicaciones-industriales/ — Galería del servicio.",
  },
  {
    url: "https://bzrjeduxjkwvtdaohjrh.supabase.co/storage/v1/object/public/site-images/servicios/refrigeracion-industrial/montaje-techo-sala-paneles.webp",
    alt: "Dos técnicos sobre un andamio instalan equipos en el techo de una sala con paneles aislantes y difusores",
    width: 1920,
    height: 1440,
    uso: "servicios/refrigeracion-industrial/ — Portada del servicio y primera de su galería.",
  },
];
