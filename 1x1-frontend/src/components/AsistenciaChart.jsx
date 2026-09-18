import "./AsistenciaChart.css";

const ALTO = 150;
const ANCHO_MIN = 220;
const ESPACIO_POR_PUNTO = 56;
const PAD_IZQ = 30;
const PAD_DER = 26;
const PAD_SUP = 26;
const PAD_INF = 22;
const VALORES_EJE_Y = [0, 25, 50, 75, 100];

function AsistenciaChart({ semanas }) {
  const datos = semanas
    .filter((s) => s.dias.length > 0)
    .map((s) => ({
      semana: s.numero,
      porcentaje: Math.round(
        (s.dias.filter((d) => d.completado).length / s.dias.length) * 100
      ),
    }));

  if (datos.length === 0) {
    return (
      <p className="historial-peso__vacio">
        Todavía no hay datos de asistencia.
      </p>
    );
  }

  const ancho = Math.max(
    ANCHO_MIN,
    PAD_IZQ + PAD_DER + (datos.length - 1) * ESPACIO_POR_PUNTO
  );

  const escalaX = (i) =>
    datos.length === 1
      ? ancho / 2
      : PAD_IZQ + (i * (ancho - PAD_IZQ - PAD_DER)) / (datos.length - 1);

  const escalaY = (valor) =>
    ALTO - PAD_INF - (valor / 100) * (ALTO - PAD_SUP - PAD_INF);

  const puntos = datos.map((d, i) => ({
    ...d,
    x: escalaX(i),
    y: escalaY(d.porcentaje),
  }));

  const lineaPath = puntos
    .map((p, i) => `${i === 0 ? "M" : "L"} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`)
    .join(" ");

  let flecha = null;
  if (puntos.length > 1) {
    const ultimo = puntos[puntos.length - 1];
    const anterior = puntos[puntos.length - 2];
    const dx = ultimo.x - anterior.x;
    const dy = ultimo.y - anterior.y;
    const largo = Math.hypot(dx, dy) || 1;
    const extension = 16;
    flecha = {
      x1: ultimo.x,
      y1: ultimo.y,
      x2: ultimo.x + (dx / largo) * extension,
      y2: ultimo.y + (dy / largo) * extension,
    };
  }

  return (
    <div className="asistencia-chart__scroll">
      <svg
        className="asistencia-chart__svg"
        viewBox={`0 0 ${ancho} ${ALTO}`}
        width={ancho}
        height={ALTO}
        role="img"
        aria-label="Gráfico de porcentaje de asistencia por semana"
      >
        <defs>
          <marker
            id="asistencia-chart-flecha"
            markerWidth="7"
            markerHeight="7"
            refX="3.5"
            refY="3.5"
            orient="auto"
          >
            <path d="M0,0 L7,3.5 L0,7 Z" className="asistencia-chart__flecha" />
          </marker>
        </defs>

        {VALORES_EJE_Y.map((v) => (
          <g key={v}>
            <line
              x1={PAD_IZQ}
              x2={ancho - PAD_DER}
              y1={escalaY(v)}
              y2={escalaY(v)}
              className="asistencia-chart__grid"
            />
            <text
              x={PAD_IZQ - 8}
              y={escalaY(v) + 3}
              textAnchor="end"
              className="asistencia-chart__eje-y"
            >
              {v}
            </text>
          </g>
        ))}

        <path d={lineaPath} className="asistencia-chart__linea" fill="none" />

        {flecha && (
          <line
            x1={flecha.x1}
            y1={flecha.y1}
            x2={flecha.x2}
            y2={flecha.y2}
            className="asistencia-chart__linea"
            markerEnd="url(#asistencia-chart-flecha)"
          />
        )}

        {puntos.map((p) => (
          <g key={p.semana}>
            <title>{`Semana ${p.semana}: ${p.porcentaje}% de asistencia`}</title>
            <text
              x={p.x}
              y={p.y - 11}
              textAnchor="middle"
              className="asistencia-chart__etiqueta"
            >
              {p.porcentaje}%
            </text>
            <circle cx={p.x} cy={p.y} r="4.5" className="asistencia-chart__punto" />
            <text
              x={p.x}
              y={ALTO - 5}
              textAnchor="middle"
              className="asistencia-chart__eje-x"
            >
              S{p.semana}
            </text>
          </g>
        ))}
      </svg>
    </div>
  );
}

export default AsistenciaChart;
