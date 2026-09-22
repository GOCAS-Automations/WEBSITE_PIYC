/**
 * FOTOS GENERALES DEL SITIO — INVENTARIO
 * ======================================
 * Fotos reales de PIYC tomadas en obra, del Drive del cliente (carpeta
 * «9. FOTOS»), procesadas a WebP con la orientación EXIF ya aplicada y subidas
 * al bucket público `site-images` (`Cache-Control` de un año: una foto que
 * cambia, cambia de nombre).
 *
 * Dos tamaños, según dónde se pinta (`docs/CONTENIDO.md` §2):
 * - **Fondos a sangre** (cabeceras de página y portada de cada servicio):
 *   1920 px de ancho —o lo que dé el original— y una variante de 900 px con
 *   sufijo `-900` que va en `srcMovil`. Son apaisadas.
 * - **Lo demás** (galerías, «Quiénes somos», portada): ~900 px de ancho, que
 *   cubre el mayor ancho pintado con pantalla de alta densidad.
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

const BUCKET =
  "https://bzrjeduxjkwvtdaohjrh.supabase.co/storage/v1/object/public/site-images";

export type FotoGeneral = {
  url: string;
  /** Variante de 900 px de la misma foto (solo los fondos a sangre). */
  movil?: string;
  alt: string;
  width: number;
  height: number;
  /** Dónde se usa hoy. */
  uso: string;
};

export const imagenesGenerales: FotoGeneral[] = [
  /* --- Cabeceras de página: fondo a sangre ---------------------------- */
  {
    url: `${BUCKET}/cabeceras/montaje-interno-tablero.webp`,
    movil: `${BUCKET}/cabeceras/montaje-interno-tablero-900.webp`,
    alt: "Vista cenital del montaje interno de un tablero: PLC, switch de red, fuente de 24 V, protecciones y borneras numeradas sobre riel",
    width: 1920,
    height: 1081,
    uso: "cabeceras/ — Cabecera de /nosotros.",
  },
  {
    url: `${BUCKET}/cabeceras/interior-tablero-plc-red.webp`,
    movil: `${BUCKET}/cabeceras/interior-tablero-plc-red-900.webp`,
    alt: "Interior de un tablero en acero inoxidable con PLC modular, switches de red industrial, protecciones y borneras cableadas",
    width: 1920,
    height: 933,
    uso: "cabeceras/ — Cabecera de /servicios.",
  },
  {
    url: `${BUCKET}/cabeceras/cuarto-electrico-tableros.webp`,
    movil: `${BUCKET}/cabeceras/cuarto-electrico-tableros-900.webp`,
    alt: "Cuarto eléctrico con una fila de tableros de control y fuerza montados contra la pared; uno de ellos abierto durante el cableado",
    width: 1920,
    height: 943,
    uso: "cabeceras/ — Cabecera de /proyectos.",
  },
  {
    url: `${BUCKET}/cabeceras/tablero-doble-puerta-armado-apaisada.webp`,
    movil: `${BUCKET}/cabeceras/tablero-doble-puerta-armado-apaisada-900.webp`,
    alt: "Tablero de doble puerta abierto y recién armado, con contactores, protecciones y fuentes ordenados por nivel",
    width: 1920,
    height: 1080,
    uso: "cabeceras/ — Cabecera de /contacto (recorte 16:9 de una vertical).",
  },

  /* --- Inicio y Nosotros ---------------------------------------------- */
  {
    url: `${BUCKET}/inicio/skid-proceso-inoxidable-900.webp`,
    alt: "Skid de proceso en acero inoxidable con su panel de control, tuberías sanitarias y bomba, instalado en una sala de producción",
    width: 900,
    height: 1200,
    uso: "inicio/ — Bloque «Qué hacemos» de la portada.",
  },
  {
    url: `${BUCKET}/nosotros/tecnico-cableando-tablero-4x5.webp`,
    movil: `${BUCKET}/nosotros/tecnico-cableando-tablero-4x5-900.webp`,
    alt: "Técnico con overol y cofia trabaja en el cableado interno de un tablero de control dentro de una planta de alimentos",
    width: 1184,
    height: 1480,
    uso: "nosotros/ — Bloque «Quiénes somos» (recorte 4:5).",
  },
  {
    url: `${BUCKET}/nosotros/puesta-en-marcha-variadores.webp`,
    alt: "Puesta en marcha de un tablero en acero inoxidable con tres variadores de velocidad, con el portátil y el terminal de pruebas sobre la mesa",
    width: 888,
    height: 1920,
    uso: "nosotros/ — Galería «Nuestro trabajo», posición 1.",
  },
  {
    url: `${BUCKET}/nosotros/tecnico-piyc-tablero-inox.webp`,
    alt: "Técnico con la chaqueta de PIYC interviene el cableado de un tablero de control en acero inoxidable",
    width: 447,
    height: 489,
    uso: "nosotros/ — Galería «Nuestro trabajo», posición 2.",
  },
  {
    url: `${BUCKET}/nosotros/programacion-tablero-portatil.webp`,
    alt: "Tablero de control abierto durante la puesta en marcha, con un portátil conectado al PLC para cargar el programa",
    width: 934,
    height: 1920,
    uso: "nosotros/ — Galería «Nuestro trabajo», posición 3.",
  },
  {
    url: `${BUCKET}/nosotros/tablero-plc-modular-portatil.webp`,
    alt: "Tablero con PLC modular, protecciones y borneras, con un portátil conectado durante la programación",
    width: 933,
    height: 1920,
    uso: "nosotros/ — Galería «Nuestro trabajo», posición 4.",
  },
  {
    url: `${BUCKET}/nosotros/gabinete-fuerza-armado-900.webp`,
    alt: "Gabinete de fuerza abierto con seccionador, interruptores de caja moldeada y equipo de respaldo en la base",
    width: 900,
    height: 1660,
    uso: "nosotros/ — Galería «Nuestro trabajo», posición 5.",
  },
  {
    url: `${BUCKET}/nosotros/tablero-fuerza-barraje.webp`,
    alt: "Tablero de fuerza abierto con barraje de cobre, interruptores automáticos y bloques de borneras",
    width: 933,
    height: 1920,
    uso: "nosotros/ — Galería «Nuestro trabajo», posición 6.",
  },

  /* --- Servicios: la primera de cada uno es apaisada (fondo de la ficha) */
  {
    url: `${BUCKET}/servicios/automatizacion-procesos-industriales/tablero-inox-plc-compacto-apaisada.webp`,
    movil: `${BUCKET}/servicios/automatizacion-procesos-industriales/tablero-inox-plc-compacto-apaisada-900.webp`,
    alt: "Tablero en acero inoxidable con PLC compacto, switch de red, protecciones y borneras cableadas",
    width: 1836,
    height: 1033,
    uso: "servicios/automatizacion-procesos-industriales/ — Portada del servicio y primera de su galería.",
  },
  {
    url: `${BUCKET}/servicios/automatizacion-procesos-industriales/tablero-inox-plc-borneras.webp`,
    alt: "Tablero de automatización en acero inoxidable con PLC compacto, fuente de 24 V y borneras identificadas una a una",
    width: 888,
    height: 1920,
    uso: "servicios/automatizacion-procesos-industriales/ — Galería del servicio.",
  },
  {
    url: `${BUCKET}/servicios/automatizacion-procesos-industriales/tablero-plc-compacto-red.webp`,
    alt: "Tablero con PLC compacto, switch de red industrial y fuente conmutada, cableado y marquillado",
    width: 889,
    height: 1920,
    uso: "servicios/automatizacion-procesos-industriales/ — Galería del servicio.",
  },
  {
    url: `${BUCKET}/servicios/diseno-ingenieria-electrica/tablero-potencia-interruptores-apaisada.webp`,
    movil: `${BUCKET}/servicios/diseno-ingenieria-electrica/tablero-potencia-interruptores-apaisada-900.webp`,
    alt: "Interior de un tablero de potencia con el seccionador de entrada y cuatro interruptores de caja moldeada",
    width: 1920,
    height: 1080,
    uso: "servicios/diseno-ingenieria-electrica/ — Portada del servicio y primera de su galería.",
  },
  {
    url: `${BUCKET}/servicios/diseno-ingenieria-electrica/tableros-cuarto-electrico.webp`,
    alt: "Dos tableros cerrados instalados en un cuarto eléctrico, con ventilación forzada y panel de medición en la puerta",
    width: 934,
    height: 1920,
    uso: "servicios/diseno-ingenieria-electrica/ — Galería del servicio.",
  },
  {
    url: `${BUCKET}/servicios/tableros-de-control/tablero-plc-modular-reles-apaisada.webp`,
    movil: `${BUCKET}/servicios/tableros-de-control/tablero-plc-modular-reles-apaisada-900.webp`,
    alt: "Tablero de gran formato abierto, con PLC modular, bancos de relés de interposición y protecciones",
    width: 1920,
    height: 1080,
    uso: "servicios/tableros-de-control/ — Portada del servicio y primera de su galería.",
  },
  {
    url: `${BUCKET}/servicios/tableros-de-control/tablero-doble-puerta-terminado-900.webp`,
    alt: "Tablero de doble puerta terminado, con rejillas de ventilación y visor, listo para despacho",
    width: 900,
    height: 1200,
    uso: "servicios/tableros-de-control/ — Galería del servicio.",
  },
  {
    url: `${BUCKET}/servicios/telemetria/tablero-pared-sala-proceso-apaisada.webp`,
    movil: `${BUCKET}/servicios/telemetria/tablero-pared-sala-proceso-apaisada-900.webp`,
    alt: "Tablero rotulado montado en pared junto al visor de la sala de proceso, con la canalización llevada al equipo",
    width: 1920,
    height: 1080,
    uso: "servicios/telemetria/ — Portada del servicio y única de su galería.",
  },
  {
    url: `${BUCKET}/servicios/telecontrol/tablero-variadores-velocidad-apaisada.webp`,
    movil: `${BUCKET}/servicios/telecontrol/tablero-variadores-velocidad-apaisada-900.webp`,
    alt: "Interior de un tablero con variadores de velocidad de distintas potencias, PLC modular y protecciones",
    width: 1920,
    height: 1080,
    uso: "servicios/telecontrol/ — Portada del servicio y única de su galería.",
  },
  {
    url: `${BUCKET}/servicios/proyectos-llave-en-mano/linea-empaque-planta.webp`,
    movil: `${BUCKET}/servicios/proyectos-llave-en-mano/linea-empaque-planta-900.webp`,
    alt: "Línea de transporte y empaque montada dentro de una planta, con el área aislada durante la obra",
    width: 1920,
    height: 934,
    uso: "servicios/proyectos-llave-en-mano/ — Portada del servicio y única de su galería.",
  },
  {
    url: `${BUCKET}/servicios/aplicaciones-industriales/tablero-servodrives-apaisada.webp`,
    movil: `${BUCKET}/servicios/aplicaciones-industriales/tablero-servodrives-apaisada-900.webp`,
    alt: "Tablero de control abierto con PLC, arrancadores y servoaccionamientos montados sobre la placa de fondo",
    width: 1468,
    height: 826,
    uso: "servicios/aplicaciones-industriales/ — Portada del servicio y primera de su galería.",
  },
  {
    url: `${BUCKET}/servicios/aplicaciones-industriales/gabinete-terminado-taller.webp`,
    alt: "Gabinete metálico terminado en el taller, con rejillas de ventilación y base de zócalo",
    width: 865,
    height: 1920,
    uso: "servicios/aplicaciones-industriales/ — Galería del servicio.",
  },
  {
    url: `${BUCKET}/servicios/refrigeracion-industrial/montaje-techo-sala-paneles.webp`,
    movil: `${BUCKET}/servicios/refrigeracion-industrial/montaje-techo-sala-paneles-900.webp`,
    alt: "Dos técnicos sobre un andamio instalan equipos en el techo de una sala con paneles aislantes y difusores",
    width: 1920,
    height: 1440,
    uso: "servicios/refrigeracion-industrial/ — Portada del servicio y única de su galería.",
  },
];
