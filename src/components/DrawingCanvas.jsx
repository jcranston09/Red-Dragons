function arrowHead(points) {
  if (points.length < 2) return null;
  const a = points[points.length - 2];
  const b = points[points.length - 1];
  const angle = Math.atan2(b.y - a.y, b.x - a.x);
  const len = 2.1;
  const w = 1.15;
  const x1 = b.x - len * Math.cos(angle) + w * Math.sin(angle);
  const y1 = b.y - len * Math.sin(angle) - w * Math.cos(angle);
  const x2 = b.x - len * Math.cos(angle) - w * Math.sin(angle);
  const y2 = b.y - len * Math.sin(angle) + w * Math.cos(angle);
  return `${b.x},${b.y} ${x1},${y1} ${x2},${y2}`;
}

function toPoints(pts) {
  return pts.map((p) => `${p.x},${p.y}`).join(" ");
}

const PATH_STYLE = {
  route: { stroke: "#f5d90a", dash: undefined, width: 0.85 },
  run: { stroke: "#ffffff", dash: "1.6 1.1", width: 0.75 },
  motion: { stroke: "#7dd3fc", dash: "0.5 1.15", width: 0.7 },
};

export default function DrawingCanvas({ paths, draft, selectedPathId, onSelectPath }) {
  const live = draft ? [...paths, { id: "draft", ...draft }] : paths;

  return (
    <svg
      viewBox="0 0 100 100"
      preserveAspectRatio="none"
      className="pointer-events-none absolute inset-0 z-10 h-full w-full touch-none"
    >
      {live.map((path) => {
        const style = PATH_STYLE[path.type] ?? PATH_STYLE.route;
        const selected = path.id === selectedPathId;
        return (
          <g key={path.id}>
            <polyline
              points={toPoints(path.points)}
              fill="none"
              stroke={selected ? "#ffffff" : style.stroke}
              strokeWidth={selected ? style.width + 0.35 : style.width}
              strokeDasharray={style.dash}
              strokeLinecap="round"
              strokeLinejoin="round"
              vectorEffect="non-scaling-stroke"
            />
            {path.id !== "draft" ? (
              <polyline
                points={toPoints(path.points)}
                fill="none"
                stroke="transparent"
                strokeWidth="6"
                className="pointer-events-auto cursor-pointer"
                onPointerDown={(e) => {
                  e.stopPropagation();
                  onSelectPath(path.id);
                }}
              />
            ) : null}
            {path.points.length >= 2 ? (
              <polygon
                points={arrowHead(path.points)}
                fill={selected ? "#ffffff" : style.stroke}
              />
            ) : null}
          </g>
        );
      })}
    </svg>
  );
}
