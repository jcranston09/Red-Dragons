import { useRef } from "react";

const TEAM_STYLES = {
  offense: {
    wrap: "bg-gradient-to-b from-red-600 to-red-800 text-white ring-2 ring-white",
    letter: "O",
  },
  defense: {
    wrap: "bg-gradient-to-b from-slate-800 to-black text-white ring-2 ring-yellow-300",
    letter: "X",
  },
};

export default function PlayerToken({ player, selected, tool, onMove, onSelect, onRemove }) {
  const dragging = useRef(false);
  const origin = useRef({ x: 0, y: 0, px: 0, py: 0 });
  const nodeRef = useRef(null);

  const isCoach = player.position === "QB";
  const style = TEAM_STYLES[player.team] ?? TEAM_STYLES.offense;

  function fieldEl() {
    return nodeRef.current?.closest('[role="application"]');
  }

  function onPointerDown(e) {
    if (tool !== "select") return;
    e.preventDefault();
    e.stopPropagation();
    onSelect?.(player.id);
    dragging.current = true;
    origin.current = { x: e.clientX, y: e.clientY, px: player.x, py: player.y };
    e.currentTarget.setPointerCapture(e.pointerId);
  }

  function onPointerMove(e) {
    if (!dragging.current) return;
    const field = fieldEl();
    if (!field) return;
    const rect = field.getBoundingClientRect();
    const dx = ((e.clientX - origin.current.x) / rect.width) * 100;
    const dy = ((e.clientY - origin.current.y) / rect.height) * 100;
    onMove(player.id, origin.current.px + dx, origin.current.py + dy);
  }

  function onPointerUp(e) {
    dragging.current = false;
    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch {
      /* already released */
    }
  }

  return (
    <div
      ref={nodeRef}
      className={`absolute z-20 -translate-x-1/2 -translate-y-1/2 touch-none select-none ${
        tool === "select" ? "" : "pointer-events-none"
      }`}
      style={{ left: `${player.x}%`, top: `${player.y}%` }}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
    >
      <button
        type="button"
        className={[
          "relative flex h-10 w-10 items-center justify-center rounded-full shadow-token transition-transform",
          style.wrap,
          isCoach ? "h-12 w-12 ring-4 ring-dragon-gold" : "",
          selected ? "scale-110 ring-4 ring-white" : "",
          tool === "select" ? "cursor-grab active:cursor-grabbing" : "cursor-default",
        ].join(" ")}
        aria-label={`${player.label} ${player.team}`}
      >
        <span className="absolute -top-0.5 text-[9px] font-black opacity-50">{style.letter}</span>
        <span className={`relative font-display font-extrabold leading-none ${isCoach ? "text-[10px]" : "text-xs"}`}>
          {isCoach ? "QB" : player.label}
        </span>
      </button>
      <div
        className={[
          "mt-0.5 whitespace-nowrap text-center text-[9px] font-bold uppercase tracking-wide drop-shadow",
          isCoach ? "text-dragon-gold" : "text-white",
        ].join(" ")}
      >
        {isCoach ? "Coach QB" : player.label}
      </div>
      {selected && tool === "select" ? (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onRemove(player.id);
          }}
          className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-black text-[10px] text-white ring-1 ring-white"
          aria-label={`Remove ${player.label}`}
        >
          ×
        </button>
      ) : null}
    </div>
  );
}
