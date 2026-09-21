/**
 * Diagrama escalera (ladder, IEC 61131-3) ilustrativo para el hero de inicio.
 * Tramos energizados en verde PIYC; el resto en azul claro a media opacidad.
 * Colores solo por clases de token (fill-… y stroke-…), nada escrito a mano.
 */

const Y_A = 64; // Renglón 001: arranque / paro con enclavamiento
const Y_ENCLAVE = 120;
const Y_B = 196; // Renglón 002: nivel + temporizador → bomba
const Y_C = 282; // Renglón 003: piloto de marcha

const RIEL_IZQ = 40;
const RIEL_DER = 456;
const BOBINA = 400; // centro de las bobinas
const C1 = 96; // primera columna de contactos
const C2 = 188; // segunda columna (renglón 001)
const J1 = 60; // uniones del enclavamiento
const J2 = 148;

const activo = "stroke-verde-500";
const inactivo = "stroke-azul-300/45";

function Contacto({
  x,
  y,
  energizado,
  cerrado = false,
}: {
  x: number;
  y: number;
  energizado: boolean;
  /** Normalmente cerrado: lleva la diagonal. */
  cerrado?: boolean;
}) {
  const trazo = energizado ? activo : inactivo;
  return (
    <g className={trazo} strokeWidth={2.5}>
      <path d={`M${x} ${y - 12}V${y + 12}M${x + 16} ${y - 12}V${y + 12}`} />
      {cerrado ? <path d={`M${x - 3} ${y + 12}L${x + 19} ${y - 12}`} strokeWidth={1.75} /> : null}
    </g>
  );
}

function Bobina({ y, energizada }: { y: number; energizada: boolean }) {
  const trazo = energizada ? activo : inactivo;
  return (
    <g>
      {energizada ? <circle cx={BOBINA} cy={y} r={17} className="fill-verde-500/15" /> : null}
      <path
        className={trazo}
        strokeWidth={2.5}
        fill="none"
        d={`M${BOBINA - 6} ${y - 12}Q${BOBINA - 16} ${y} ${BOBINA - 6} ${y + 12}M${BOBINA + 6} ${y - 12}Q${BOBINA + 16} ${y} ${BOBINA + 6} ${y + 12}`}
      />
    </g>
  );
}

function Etiqueta({
  x,
  y,
  marca,
  descripcion,
}: {
  x: number;
  y: number;
  marca: string;
  descripcion?: string;
}) {
  return (
    <g textAnchor="middle">
      <text x={x} y={y - 20} className="fill-acero-200 text-[11px] font-semibold tabular-nums">
        {marca}
      </text>
      {descripcion ? (
        <text x={x} y={y + 27} className="fill-acero-400 text-[9.5px] font-medium uppercase tracking-[0.08em]">
          {descripcion}
        </text>
      ) : null}
    </g>
  );
}

export function DiagramaEscalera({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 480 326"
      role="img"
      aria-labelledby="diagrama-titulo diagrama-desc"
      className={className}
      fill="none"
      strokeLinecap="square"
    >
      <title id="diagrama-titulo">Diagrama escalera ilustrativo de un PLC</title>
      <desc id="diagrama-desc">
        Tres renglones de lógica: arranque y paro de un motor con enclavamiento, control de una
        bomba por nivel con temporizador, y un piloto que indica que el motor está en marcha.
      </desc>

      {/* Rieles de alimentación */}
      <g className="text-[10px] font-semibold" textAnchor="middle">
        <text x={RIEL_IZQ} y={14} className="fill-acero-400">
          L+
        </text>
        <text x={RIEL_DER} y={14} className="fill-acero-400">
          M
        </text>
      </g>
      <path d={`M${RIEL_IZQ} 22V316`} className={activo} strokeWidth={3} />
      <path d={`M${RIEL_DER} 22V316`} className={inactivo} strokeWidth={3} />

      {/* Números de renglón */}
      <g className="fill-acero-400 text-[9px] font-medium tabular-nums">
        <text x={6} y={Y_A + 3}>001</text>
        <text x={6} y={Y_B + 3}>002</text>
        <text x={6} y={Y_C + 3}>003</text>
      </g>

      {/* ── Renglón 001 ─────────────────────────────── */}
      <g strokeWidth={2}>
        <path d={`M${RIEL_IZQ} ${Y_A}H${C1}`} className={activo} />
        <path d={`M${C1 + 16} ${Y_A}H${C2}`} className={activo} />
        <path d={`M${C2 + 16} ${Y_A}H${BOBINA - 10}`} className={activo} />
        <path d={`M${BOBINA + 10} ${Y_A}H${RIEL_DER}`} className={inactivo} />
        {/* Enclavamiento */}
        <path d={`M${J1} ${Y_A}V${Y_ENCLAVE}H${C1}M${C1 + 16} ${Y_ENCLAVE}H${J2}V${Y_A}`} className={activo} />
      </g>
      <circle cx={J1} cy={Y_A} r={3.5} className="fill-verde-500" />
      <circle cx={J2} cy={Y_A} r={3.5} className="fill-verde-500" />
      <Contacto x={C1} y={Y_A} energizado={false} />
      <Contacto x={C1} y={Y_ENCLAVE} energizado />
      <Contacto x={C2} y={Y_A} energizado cerrado />
      <Bobina y={Y_A} energizada />
      <Etiqueta x={C1 + 8} y={Y_A} marca="I0.0" descripcion="Arranque" />
      <text x={C1 + 8} y={Y_ENCLAVE + 27} textAnchor="middle" className="fill-acero-200 text-[11px] font-semibold">
        Q0.0
      </text>
      <Etiqueta x={C2 + 8} y={Y_A} marca="I0.1" descripcion="Paro" />
      <Etiqueta x={BOBINA} y={Y_A} marca="Q0.0" descripcion="Motor" />

      {/* ── Renglón 002 ─────────────────────────────── */}
      <g strokeWidth={2}>
        <path d={`M${RIEL_IZQ} ${Y_B}H${C1}`} className={activo} />
        <path d={`M${C1 + 16} ${Y_B}H180M272 ${Y_B}H${BOBINA - 10}M${BOBINA + 10} ${Y_B}H${RIEL_DER}`} className={inactivo} />
      </g>
      <Contacto x={C1} y={Y_B} energizado={false} />
      <rect x={180} y={Y_B - 26} width={92} height={60} className="fill-azul-900 stroke-azul-300/45" strokeWidth={1.75} />
      <g textAnchor="middle">
        <text x={226} y={Y_B - 34} className="fill-acero-200 text-[11px] font-semibold">
          T1
        </text>
        <text x={226} y={Y_B - 6} className="fill-acero-200 text-[12px] font-semibold tracking-[0.06em]">
          TON
        </text>
        <text x={226} y={Y_B + 24} className="fill-acero-400 text-[9.5px] font-medium">
          PT = 5 s
        </text>
      </g>
      <g className="fill-acero-400 text-[8.5px] font-medium">
        <text x={185} y={Y_B + 3}>IN</text>
        <text x={267} y={Y_B + 3} textAnchor="end">
          Q
        </text>
      </g>
      <Bobina y={Y_B} energizada={false} />
      <Etiqueta x={C1 + 8} y={Y_B} marca="I0.2" descripcion="Nivel" />
      <Etiqueta x={BOBINA} y={Y_B} marca="Q0.1" descripcion="Bomba" />

      {/* ── Renglón 003 ─────────────────────────────── */}
      <g strokeWidth={2}>
        <path d={`M${RIEL_IZQ} ${Y_C}H${C1}M${C1 + 16} ${Y_C}H${BOBINA - 10}`} className={activo} />
        <path d={`M${BOBINA + 10} ${Y_C}H${RIEL_DER}`} className={inactivo} />
      </g>
      <Contacto x={C1} y={Y_C} energizado />
      <Bobina y={Y_C} energizada />
      <Etiqueta x={C1 + 8} y={Y_C} marca="Q0.0" descripcion="Motor" />
      <Etiqueta x={BOBINA} y={Y_C} marca="Q0.2" descripcion="Piloto" />

      {/* Flujo de corriente animado (se oculta con movimiento reducido) */}
      <g
        className="animate-flujo stroke-verde-300/70 motion-reduce:hidden"
        strokeWidth={2}
        strokeDasharray="4 24"
        strokeLinecap="round"
      >
        <path d={`M${RIEL_IZQ} ${Y_A}H${J1}V${Y_ENCLAVE}H${J2}V${Y_A}H${BOBINA - 10}`} />
        <path d={`M${RIEL_IZQ} ${Y_C}H${BOBINA - 10}`} />
        <path d={`M${RIEL_IZQ} ${Y_B}H${C1}`} />
      </g>
    </svg>
  );
}
