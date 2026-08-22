import { Spline, CircleDot, Flag } from "lucide-react";

/** Line types drawn with the tap → tap-hold → drag gesture. Dragging a player always moves them. */
export const DRAW_TOOLS = [
  { id: "route", label: "Route", hint: "Straight pass path", icon: Spline },
  { id: "run", label: "Run / pitch", hint: "Straight handoff / toss", icon: CircleDot },
  { id: "motion", label: "Motion", hint: "Straight pre-snap path", icon: Flag },
];

export const HOLD_TO_DRAW_MS = 380;
export const DRAW_MOVE_SLOP_PX = 18;
export const CUT_PAUSE_MS = 320;
export const CUT_SLOP_PX = 16;
