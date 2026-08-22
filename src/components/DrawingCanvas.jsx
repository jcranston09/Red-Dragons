import { useRef } from "react";
import { FIELD_LENGTH_YARDS, FIELD_WIDTH_YARDS } from "../utils/field.js";
import { routeArrow, straightenPath } from "../utils/path.js";

const ARROW_SCALE = {
  scaleX: FIELD_WIDTH_YARDS / 100,
  scaleY: FIELD_LENGTH_YARDS / 100,
};

function toPoints(pts) {
  return pts.map((p) => `${p.x},${p.y}`).join(" ");
}

const PATH_STYLE = {
  route: { stroke: "#f5d90a", dash: undefined, width: 2.35 },
  run: { stroke: "#ffffff", dash: "3.4 2.4", width: 2.15 },
  motion: { stroke: "#7dd3fc", dash: "1.1 2.3", width: 2.05 },
};

export default function DrawingCanvas({
  paths,
  draft,
  selectedPathId,
  onSelectPath,
  onExtendMove,
  onExtendPlant,
}) {
  const svgRef = useRef(null);
  const extending = useRef(false);
  const live = draft ? [...paths, { id: "draft", ...draft }] : paths;

  function relPoint(e) {
    const svg = svgRef.current;
    if (!svg) return { x: 0, y: 0 };
    const rect = svg.getBoundingClientRect();
    return {
      x: ((e.clientX - rect.left) / rect.width) * 100,
      y: ((e.clientY - rect.top) / rect.height) * 100,
    };
  }

  function onPointerDown(e) {
    if (!draft) return;
    e.preventDefault();
    extending.current = true;
    e.currentTarget.setPointerCapture(e.pointerId);
    onExtendMove?.(relPoint(e));
  }

  function onPointerMove(e) {
    if (!extending.current) return;
    onExtendMove?.(relPoint(e));
  }

  function onPointerUp(e) {
    if (!extending.current) return;
    extending.current = false;
    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch {
      /* already released */
    }
    onExtendPlant?.();
  }

  return (
    <svg
      ref={svgRef}
      viewBox="0 0 100 100"
      preserveAspectRatio="none"
      className={`absolute inset-0 z-10 h-full w-full touch-none ${
        draft ? "pointer-events-auto cursor-crosshair" : "pointer-events-none"
      }`}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
    >
      {live.map((path) => {
        const style = PATH_STYLE[path.type] ?? PATH_STYLE.route;
        const selected = path.id === selectedPathId;
        const pts = path.id === "draft" ? path.points ?? [] : straightenPath(path.points);
        const stopEnd = path.endCap === "circle" || path.routeId === "stop";
        const arrow = stopEnd ? { line: pts, head: "" } : routeArrow(pts, { length: 2.1, width: 1.15, ...ARROW_SCALE });
        const linePts = path.id === "draft" ? pts : arrow.line;
        const tip = pts[pts.length - 1];
        const ink = selected ? "#ffffff" : style.stroke;
        return (
          <g key={path.id}>
            <polyline
              points={toPoints(linePts)}
              fill="none"
              stroke={ink}
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
                r={1.15}
                fill={ink}
              />
            ))}
            {path.id !== "draft" && stopEnd && tip ? (
              <circle cx={tip.x} cy={tip.y} r="1.55" fill={ink} stroke="#07140c" strokeWidth="0.35" />
            ) : path.id !== "draft" && arrow.head ? (
              <polygon points={arrow.head} fill={ink} />
            ) : null}
          </g>
        );
      })}
    </svg>
  );
}
