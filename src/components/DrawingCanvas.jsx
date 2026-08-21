import { useRef, useState } from "react";

function arrowHead(points, color) {
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

export default function DrawingCanvas({ paths, tool, selectedPathId, onComplete, onSelectPath }) {
  const svgRef = useRef(null);
  const [draft, setDraft] = useState(null);
  const drawing = useRef(false);

  function relPoint(e) {
    const svg = svgRef.current;
    const rect = svg.getBoundingClientRect();
    return {
      x: ((e.clientX - rect.left) / rect.width) * 100,
      y: ((e.clientY - rect.top) / rect.height) * 100,
    };
  }

  function onPointerDown(e) {
    if (tool === "select" || tool === "erase") {
      return;
    }
    e.preventDefault();
    const p = relPoint(e);
    drawing.current = true;
    setDraft({ type: tool, points: [p] });
    e.currentTarget.setPointerCapture(e.pointerId);
  }

  function onPointerMove(e) {
    if (!drawing.current) return;
    const p = relPoint(e);
    setDraft((prev) => {
      if (!prev) return prev;
      const last = prev.points[prev.points.length - 1];
      if (Math.hypot(p.x - last.x, p.y - last.y) < 0.45) return prev;
      return { ...prev, points: [...prev.points, p] };
    });
  }

  function onPointerUp(e) {
    if (!drawing.current) return;
    drawing.current = false;
    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch {
      /* noop */
    }
    setDraft((prev) => {
      if (prev && prev.points.length >= 2) {
        onComplete(prev.type, prev.points, prev.points[0]);
      }
      return null;
    });
  }

  const live = draft ? [...paths, { id: "draft", ...draft }] : paths;

  return (
    <svg
      ref={svgRef}
      viewBox="0 0 100 100"
      preserveAspectRatio="none"
      className={`absolute inset-0 z-10 h-full w-full ${
        tool === "select" ? "pointer-events-none" : "pointer-events-auto cursor-crosshair"
      } touch-none`}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
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
            {/* fat invisible stroke for hit target */}
            {path.id !== "draft" ? (
              <polyline
                points={toPoints(path.points)}
                fill="none"
                stroke="transparent"
                strokeWidth="4"
                className="pointer-events-auto cursor-pointer"
                onPointerDown={(e) => {
                  e.stopPropagation();
                  onSelectPath(path.id);
                }}
              />
            ) : null}
            {path.points.length >= 2 ? (
              <polygon
                points={arrowHead(path.points, style.stroke)}
                fill={selected ? "#ffffff" : style.stroke}
              />
            ) : null}
          </g>
        );
      })}
    </svg>
  );
}
