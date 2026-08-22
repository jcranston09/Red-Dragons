import { straightenPath } from "../utils/path.js";

function arrowHead(points) {
  if (points.length < 2) return null;
  const a = points[points.length - 2];
  const b = points[points.length - 1];
  const angle = Math.atan2(b.y - a.y, b.x - a.x);
  const len = 3.8;
  const w = 2.15;
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
  route: { stroke: "#f5d90a", dash: undefined, width: 2.35 },
  run: { stroke: "#ffffff", dash: "3.4 2.4", width: 2.15 },
  motion: { stroke: "#7dd3fc", dash: "1.1 2.3", width: 2.05 },
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
        const pts = path.id === "draft" ? path.points ?? [] : straightenPath(path.points);
        return (
          <g key={path.id}>
            <polyline
              points={toPoints(pts)}
              fill="none"
              stroke={selected ? "#ffffff" : style.stroke}
              strokeWidth={selected ? style.width + 0.45 : style.width}
              strokeDasharray={style.dash}
              strokeLinecap="butt"
              strokeLinejoin="miter"
              strokeMiterlimit="3"
            />
            {path.id !== "draft" ? (
              <polyline
                points={toPoints(pts)}
                fill="none"
                stroke="transparent"
                strokeWidth="8"
                className="pointer-events-auto cursor-pointer"
                onPointerDown={(e) => {
                  e.stopPropagation();
                  onSelectPath(path.id);
                }}
              />
            ) : null}
            {pts.slice(1, -1).map((pt, i) => (
              <circle
                key={`${path.id}-v-${i}`}
                cx={pt.x}
                cy={pt.y}
                r="1.15"
                fill={selected ? "#ffffff" : style.stroke}
              />
            ))}
            {pts.length >= 2 ? (
              <polygon
                points={arrowHead(pts)}
                fill={selected ? "#ffffff" : style.stroke}
              />
            ) : null}
          </g>
        );
      })}
    </svg>
  );
}
