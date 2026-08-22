import { Spline, CircleDot, Flag } from "lucide-react";

/** Line types drawn with the tap → tap-hold → drag gesture. Dragging a player always moves them. */
export const DRAW_TOOLS = [
  { id: "route", label: "Route", hint: "Solid pass path", icon: Spline },
  { id: "run", label: "Run / pitch", hint: "Dashed handoff or toss", icon: CircleDot },
  { id: "motion", label: "Motion", hint: "One player pre-snap", icon: Flag },
];

export const HOLD_TO_DRAW_MS = 380;
export const DRAW_MOVE_SLOP_PX = 18;
