import { useRef, useState } from "react";
import { CUT_PAUSE_MS, CUT_SLOP_PX, DRAW_MOVE_SLOP_PX, HOLD_TO_DRAW_MS } from "../data/tools.js";
import { pointOnField } from "../utils/pointer.js";

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

export default function PlayerToken({
  player,
  selected,
  drawArmed,
  drawType = "route",
  suspendPointers = false,
  onMove,
  onSelect,
  onRemove,
  onDrawStart,
  onDrawMove,
  onDrawCut,
  onDrawEnd,
}) {
  const nodeRef = useRef(null);
  const gesture = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [holding, setHolding] = useState(false);

  const isCoach = player.position === "QB";
  const style = TEAM_STYLES[player.team] ?? TEAM_STYLES.offense;

  function fieldEl() {
    return nodeRef.current?.closest('[role="application"]');
  }

  function clearHold() {
    const g = gesture.current;
    if (g?.holdTimer) {
      clearTimeout(g.holdTimer);
      g.holdTimer = null;
    }
    setHolding(false);
  }

  function clearCut() {
    const g = gesture.current;
    if (g?.cutTimer) {
      clearTimeout(g.cutTimer);
      g.cutTimer = null;
    }
  }

  function onPointerDown(e) {
    if (e.pointerType === "mouse" && e.button !== 0) return;
    e.preventDefault();
    e.stopPropagation();
    const wasSelected = selected;
    onSelect?.(player.id);
    const g = {
      pointerId: e.pointerId,
      startX: e.clientX,
      startY: e.clientY,
      originPx: player.x,
      originPy: player.y,
      wasSelected,
      armed: false,
      drawing: false,
      moved: false,
      fromHandle: false,
      holdTimer: null,
      cutTimer: null,
      lastX: e.clientX,
      lastY: e.clientY,
    };
    gesture.current = g;
    setIsDragging(true);
    e.currentTarget.setPointerCapture(e.pointerId);

    if (wasSelected) {
      setHolding(true);
      g.holdTimer = setTimeout(() => {
        if (!gesture.current || gesture.current.moved) return;
        gesture.current.armed = true;
        gesture.current.drawing = true;
        setHolding(false);
        onDrawStart?.(player, { x: player.x, y: player.y });
        try {
          navigator.vibrate?.(12);
        } catch {
          /* iOS Safari ignores vibrate */
        }
      }, HOLD_TO_DRAW_MS);
    }
  }

  function onHandleDown(e) {
    if (e.pointerType === "mouse" && e.button !== 0) return;
    e.preventDefault();
    e.stopPropagation();
    onSelect?.(player.id);
    gesture.current = {
      pointerId: e.pointerId,
      startX: e.clientX,
      startY: e.clientY,
      originPx: player.x,
      originPy: player.y,
      wasSelected: true,
      armed: true,
      drawing: true,
      moved: false,
      fromHandle: true,
      holdTimer: null,
      cutTimer: null,
      lastX: e.clientX,
      lastY: e.clientY,
    };
    setIsDragging(true);
    e.currentTarget.setPointerCapture(e.pointerId);
    onDrawStart?.(player, { x: player.x, y: player.y });
  }

  function onPointerMove(e) {
    const g = gesture.current;
    if (!g || e.pointerId !== g.pointerId) return;
    const dist = Math.hypot(e.clientX - g.startX, e.clientY - g.startY);
    if (dist > DRAW_MOVE_SLOP_PX) g.moved = true;

    if (g.armed || g.fromHandle) {
      const pt = pointOnField(e, fieldEl());
      g.drawing = true;
      onDrawMove?.(pt);
      const travel = Math.hypot(e.clientX - g.lastX, e.clientY - g.lastY);
      if (travel > CUT_SLOP_PX) {
        clearCut();
        g.lastX = e.clientX;
        g.lastY = e.clientY;
      } else if (!g.cutTimer) {
        g.cutTimer = setTimeout(() => {
          if (!gesture.current) return;
          gesture.current.cutTimer = null;
          onDrawCut?.();
        }, CUT_PAUSE_MS);
      }
      return;
    }

    if (g.moved) clearHold();
    const field = fieldEl();
    if (!field) return;
    const rect = field.getBoundingClientRect();
    const dx = ((e.clientX - g.startX) / rect.width) * 100;
    const dy = ((e.clientY - g.startY) / rect.height) * 100;
    onMove(player.id, g.originPx + dx, g.originPy + dy);
  }

  function onPointerUp(e) {
    const g = gesture.current;
    if (g && e.pointerId !== g.pointerId) return;
    const drawing = Boolean(g?.drawing || (g?.armed && g?.moved));
    clearHold();
    clearCut();
    if (drawing) onDrawEnd?.();
    gesture.current = null;
    setIsDragging(false);
    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch {
      /* already released */
    }
  }

  const showDrawChrome = selected && !isDragging;

  return (
    <div
      ref={nodeRef}
      className={`absolute z-20 -translate-x-1/2 -translate-y-1/2 touch-none select-none ${
        isDragging ? "" : "transition-[left,top] duration-300 ease-out"
      } ${suspendPointers && !isDragging ? "pointer-events-none" : ""}`}
      style={{ left: `${player.x}%`, top: `${player.y}%` }}
      onContextMenu={(e) => e.preventDefault()}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
    >
      {showDrawChrome ? (
        <button
          type="button"
          onPointerDown={onHandleDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
          className="absolute left-1/2 top-0 z-30 flex min-h-[28px] -translate-x-1/2 -translate-y-[calc(100%+6px)] items-center rounded-full bg-dragon-gold px-3 py-1 text-[10px] font-black uppercase tracking-wide text-dragon-black shadow-token"
          aria-label={`Draw ${drawType} from ${player.label}`}
        >
          Draw {drawType === "run" ? "run" : drawType}
        </button>
      ) : null}

      <div
        className={[
          "relative flex h-11 w-11 items-center justify-center rounded-full shadow-token transition-transform sm:h-10 sm:w-10",
          style.wrap,
          isCoach ? "h-12 w-12 ring-4 ring-dragon-gold sm:h-12 sm:w-12" : "",
          selected ? "scale-110 ring-4 ring-white" : "",
          drawArmed ? "ring-4 ring-dragon-gold scale-125" : "",
          holding ? "hold-pulse" : "",
          "cursor-grab active:cursor-grabbing",
        ].join(" ")}
        role="button"
        aria-label={`${player.label} ${player.team}`}
      >
        <span className="absolute -top-0.5 text-[9px] font-black opacity-50">{style.letter}</span>
        <span className={`relative font-display font-extrabold leading-none ${isCoach ? "text-[10px]" : "text-xs"}`}>
          {isCoach ? "QB" : player.label}
        </span>
        {holding ? <span className="hold-ring" aria-hidden="true" /> : null}
      </div>
      <div
        className={[
          "mt-0.5 whitespace-nowrap text-center text-[9px] font-bold uppercase tracking-wide drop-shadow",
          isCoach ? "text-dragon-gold" : "text-white",
        ].join(" ")}
      >
        {isCoach ? "Coach QB" : player.label}
      </div>
      {selected && !isDragging ? (
        <button
          type="button"
          onPointerDown={(e) => e.stopPropagation()}
          onClick={(e) => {
            e.stopPropagation();
            onRemove(player.id);
          }}
          className="absolute -right-3 top-5 flex h-6 w-6 items-center justify-center rounded-full bg-black text-[11px] text-white ring-1 ring-white"
          aria-label={`Remove ${player.label}`}
        >
          ×
        </button>
      ) : null}
    </div>
  );
}
