/**
 * FOTOS GENERALES DEL SITIO — INVENTARIO
 * ======================================
 * Fotos reales de PIYC extraídas de `docs/Copia de INFORME_CASOS DE EXITO.pptx`,
 * procesadas a WebP (≤ 250 KB, ancho máx. 1920 px) y subidas al bucket público
 * `site-images`. Una misma foto puede vivir en varias carpetas del bucket: aquí
 * hay una entrada por carpeta, con la URL que corresponde usar en cada sitio.
 *
 * Sirven de respaldo mientras el panel no tenga fotos cargadas. El inventario
 * legible (con pesos y origen) está en `docs/CONTENIDO.md`.
 */

export type FotoGeneral = {
  url: string;
  alt: string;
  width: number;
  height: number;
  /** Dónde se sugiere usarla. */
  uso: string;
};

export const imagenesGenerales: FotoGeneral[] = [
  {
    url: "https://bzrjeduxjkwvtdaohjrh.supabase.co/storage/v1/object/public/site-images/inicio/tablero-control-variador-plc.webp",
    alt: "Tablero eléctrico de control abierto, con variador de velocidad Schneider, PLC, protecciones y borneras cableadas",
    width: 681,
    height: 828,
    uso: "inicio/ — Hero de inicio y páginas de tableros de control e ingeniería eléctrica.",
  },
  {
    url: "https://bzrjeduxjkwvtdaohjrh.supabase.co/storage/v1/object/public/site-images/servicios/tableros-de-control/tablero-control-variador-plc.webp",
    alt: "Tablero eléctrico de control abierto, con variador de velocidad Schneider, PLC, protecciones y borneras cableadas",
    width: 681,
    height: 828,
    uso: "servicios/tableros-de-control/ — Hero de inicio y páginas de tableros de control e ingeniería eléctrica.",
  },
  {
    url: "https://bzrjeduxjkwvtdaohjrh.supabase.co/storage/v1/object/public/site-images/servicios/diseno-ingenieria-electrica/tablero-control-variador-plc.webp",
    alt: "Tablero eléctrico de control abierto, con variador de velocidad Schneider, PLC, protecciones y borneras cableadas",
    width: 681,
    height: 828,
    uso: "servicios/diseno-ingenieria-electrica/ — Hero de inicio y páginas de tableros de control e ingeniería eléctrica.",
  },
  {
    url: "https://bzrjeduxjkwvtdaohjrh.supabase.co/storage/v1/object/public/site-images/inicio/gabinete-control-dcs.webp",
    alt: "Gabinete de control armado y cableado para un sistema de control tipo DCS",
    width: 768,
    height: 1024,
    uso: "inicio/ — Inicio y página de ensamble de tableros de control y potencia.",
  },
  {
    url: "https://bzrjeduxjkwvtdaohjrh.supabase.co/storage/v1/object/public/site-images/servicios/tableros-de-control/gabinete-control-dcs.webp",
    alt: "Gabinete de control armado y cableado para un sistema de control tipo DCS",
    width: 768,
    height: 1024,
    uso: "servicios/tableros-de-control/ — Inicio y página de ensamble de tableros de control y potencia.",
  },
  {
    url: "https://bzrjeduxjkwvtdaohjrh.supabase.co/storage/v1/object/public/site-images/inicio/planta-proceso-inoxidable.webp",
    alt: "Línea de proceso en acero inoxidable dentro de una planta de alimentos, con tuberías e instrumentación montadas",
    width: 658,
    height: 493,
    uso: "inicio/ — Cabecera ancha, inicio y nosotros. Única foto de planta apaisada disponible.",
  },
  {
    url: "https://bzrjeduxjkwvtdaohjrh.supabase.co/storage/v1/object/public/site-images/nosotros/planta-proceso-inoxidable.webp",
    alt: "Línea de proceso en acero inoxidable dentro de una planta de alimentos, con tuberías e instrumentación montadas",
    width: 658,
    height: 493,
    uso: "nosotros/ — Cabecera ancha, inicio y nosotros. Única foto de planta apaisada disponible.",
  },
  {
    url: "https://bzrjeduxjkwvtdaohjrh.supabase.co/storage/v1/object/public/site-images/cabeceras/planta-proceso-inoxidable.webp",
    alt: "Línea de proceso en acero inoxidable dentro de una planta de alimentos, con tuberías e instrumentación montadas",
    width: 658,
    height: 493,
    uso: "cabeceras/ — Cabecera ancha, inicio y nosotros. Única foto de planta apaisada disponible.",
  },
  {
    url: "https://bzrjeduxjkwvtdaohjrh.supabase.co/storage/v1/object/public/site-images/nosotros/plano-electrico-tablero.webp",
    alt: "Plano eléctrico de un tablero de control elaborado por PIYC",
    width: 1097,
    height: 772,
    uso: "nosotros/ — Nosotros y diseño de ingeniería eléctrica.",
  },
  {
    url: "https://bzrjeduxjkwvtdaohjrh.supabase.co/storage/v1/object/public/site-images/servicios/diseno-ingenieria-electrica/plano-electrico-tablero.webp",
    alt: "Plano eléctrico de un tablero de control elaborado por PIYC",
    width: 1097,
    height: 772,
    uso: "servicios/diseno-ingenieria-electrica/ — Nosotros y diseño de ingeniería eléctrica.",
  },
  {
    url: "https://bzrjeduxjkwvtdaohjrh.supabase.co/storage/v1/object/public/site-images/servicios/diseno-ingenieria-electrica/pid-sistema-alcohol.webp",
    alt: "Plano P&ID de un sistema de preparación y dosificación, con tanques, válvulas e instrumentación",
    width: 1016,
    height: 629,
    uso: "servicios/diseno-ingenieria-electrica/ — Diseño y desarrollo de proyectos de ingeniería eléctrica.",
  },
  {
    url: "https://bzrjeduxjkwvtdaohjrh.supabase.co/storage/v1/object/public/site-images/servicios/automatizacion-procesos-industriales/hmi-pasteurizador.webp",
    alt: "Pantallas HMI de un pasteurizador: operación, datos de proceso y selección de recetas",
    width: 584,
    height: 317,
    uso: "servicios/automatizacion-procesos-industriales/ — Automatización de procesos industriales.",
  },
  {
    url: "https://bzrjeduxjkwvtdaohjrh.supabase.co/storage/v1/object/public/site-images/servicios/automatizacion-procesos-industriales/scada-planta-alimentos.webp",
    alt: "Pantalla SCADA de una planta de alimentos, con reactor, homogeneizador y línea de empaque",
    width: 609,
    height: 340,
    uso: "servicios/automatizacion-procesos-industriales/ — Automatización de procesos industriales y telecontrol.",
  },
  {
    url: "https://bzrjeduxjkwvtdaohjrh.supabase.co/storage/v1/object/public/site-images/servicios/telecontrol/scada-planta-alimentos.webp",
    alt: "Pantalla SCADA de una planta de alimentos, con reactor, homogeneizador y línea de empaque",
    width: 609,
    height: 340,
    uso: "servicios/telecontrol/ — Automatización de procesos industriales y telecontrol.",
  },
  {
    url: "https://bzrjeduxjkwvtdaohjrh.supabase.co/storage/v1/object/public/site-images/servicios/telemetria/hmi-estacion-cargue.webp",
    alt: "Pantalla HMI de una estación de cargue, con volumen cargado, caudal y temperatura del producto",
    width: 1109,
    height: 883,
    uso: "servicios/telemetria/ — Telemetría y telecontrol.",
  },
  {
    url: "https://bzrjeduxjkwvtdaohjrh.supabase.co/storage/v1/object/public/site-images/servicios/telecontrol/hmi-estacion-cargue.webp",
    alt: "Pantalla HMI de una estación de cargue, con volumen cargado, caudal y temperatura del producto",
    width: 1109,
    height: 883,
    uso: "servicios/telecontrol/ — Telemetría y telecontrol.",
  },
  {
    url: "https://bzrjeduxjkwvtdaohjrh.supabase.co/storage/v1/object/public/site-images/nosotros/transmisor-campo-tuberia.webp",
    alt: "Transmisor digital de campo instalado sobre la tubería de una línea de proceso",
    width: 720,
    height: 1280,
    uso: "nosotros/ — Nosotros, telemetría y aplicaciones industriales.",
  },
  {
    url: "https://bzrjeduxjkwvtdaohjrh.supabase.co/storage/v1/object/public/site-images/servicios/telemetria/transmisor-campo-tuberia.webp",
    alt: "Transmisor digital de campo instalado sobre la tubería de una línea de proceso",
    width: 720,
    height: 1280,
    uso: "servicios/telemetria/ — Nosotros, telemetría y aplicaciones industriales.",
  },
  {
    url: "https://bzrjeduxjkwvtdaohjrh.supabase.co/storage/v1/object/public/site-images/servicios/aplicaciones-industriales/transmisor-campo-tuberia.webp",
    alt: "Transmisor digital de campo instalado sobre la tubería de una línea de proceso",
    width: 720,
    height: 1280,
    uso: "servicios/aplicaciones-industriales/ — Nosotros, telemetría y aplicaciones industriales.",
  },
  {
    url: "https://bzrjeduxjkwvtdaohjrh.supabase.co/storage/v1/object/public/site-images/servicios/aplicaciones-industriales/valvula-control-posicionador.webp",
    alt: "Válvula de control con posicionador neumático instalada en una línea de proceso",
    width: 520,
    height: 694,
    uso: "servicios/aplicaciones-industriales/ — Aplicaciones industriales y proyectos llave en mano.",
  },
  {
    url: "https://bzrjeduxjkwvtdaohjrh.supabase.co/storage/v1/object/public/site-images/servicios/proyectos-llave-en-mano/valvula-control-posicionador.webp",
    alt: "Válvula de control con posicionador neumático instalada en una línea de proceso",
    width: 520,
    height: 694,
    uso: "servicios/proyectos-llave-en-mano/ — Aplicaciones industriales y proyectos llave en mano.",
  },
];
