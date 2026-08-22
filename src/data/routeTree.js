import { FIELD_WIDTH_YARDS, pctToYards, toPct } from "../utils/field.js";

/**
 * Kinder route tree. Catalog cards use absolute yard marks (x 0–30, down from LOS).
 * Designer assignment uses `relative` { dx, down } from the selected player's spot.
 * +dx = toward the near sideline; −dx = toward the middle. Apply flips on the left hash
 * unless `mirror` is false (Sweeps keep the direction you picked).
 */
export const ROUTE_TREE = [
  {
    id: "flat",
    name: "Flat",
    also: "Throw to the sideline, now",
    player: { label: "WR", x: 20, behind: 0 },
    type: "route",
    points: [
      { x: 20, down: 0 },
      { x: 20, down: 2 },
      { x: 27.5, down: 3.5 },
    ],
    relative: [
      { dx: 0, down: 0 },
      { dx: 0, down: 2 },
      { dx: 7.5, down: 3.5 },
    ],
    kidJob: "Take two steps, then run to the sideline and look at Coach.",
  },
  {
    id: "out",
    name: "Out",
    also: "Stem, then cut to the sideline",
    player: { label: "WR", x: 21, behind: 0 },
    type: "route",
    points: [
      { x: 21, down: 0 },
      { x: 21, down: 8 },
      { x: 28, down: 8 },
    ],
    relative: [
      { dx: 0, down: 0 },
      { dx: 0, down: 8 },
      { dx: 7, down: 8 },
    ],
    kidJob: "Run 8 steps straight. Stop. Run to the sideline. Hands up.",
  },
  {
    id: "stop",
    name: "5-Yard Stop",
    shortName: "5-Yd Stop",
    also: "Hitch",
    player: { label: "WR", x: 21, behind: 0 },
    type: "route",
    points: [
      { x: 21, down: 0 },
      { x: 21, down: 5 },
    ],
    relative: [
      { dx: 0, down: 0 },
      { dx: 0, down: 5 },
    ],
    kidJob: "Run 5 yards, stop, and look at Coach.",
  },
  {
    id: "go",
    name: "Go",
    also: "Streak",
    player: { label: "WR", x: 21, behind: 0 },
    type: "route",
    points: [
      { x: 21, down: 0 },
      { x: 21, down: 15 },
    ],
    relative: [
      { dx: 0, down: 0 },
      { dx: 0, down: 15 },
    ],
    kidJob: "Run straight as fast as you can. Do not stop. Look back at Coach.",
  },
  {
    id: "sweep-left",
    name: "RB Sweep Left",
    shortName: "Sweep L",
    also: "Wheel left",
    player: { label: "RB", x: 17, behind: 2.5 },
    type: "run",
    mirror: false,
    points: [
      { x: 17, down: -2.5 },
      { x: 6, down: 0.5 },
      { x: 3, down: 12 },
    ],
    relative: [
      { dx: 0, down: 0 },
      { dx: -11, down: 3 },
      { dx: -14, down: 14.5 },
    ],
    kidJob: "Take the toss, run to the left sideline, then turn up the field.",
  },
  {
    id: "sweep-right",
    name: "RB Sweep Right",
    shortName: "Sweep R",
    also: "Wheel right",
    player: { label: "RB", x: 13, behind: 2.5 },
    type: "run",
    mirror: false,
    points: [
      { x: 13, down: -2.5 },
      { x: 24, down: 0.5 },
      { x: 27, down: 12 },
    ],
    relative: [
      { dx: 0, down: 0 },
      { dx: 11, down: 3 },
      { dx: 14, down: 14.5 },
    ],
    kidJob: "Take the toss, run to the right sideline, then turn up the field.",
  },
  {
    id: "post",
    name: "Post",
    also: "Stem, then cut to the middle",
    player: { label: "WR", x: 22, behind: 0 },
    type: "route",
    points: [
      { x: 22, down: 0 },
      { x: 22, down: 8 },
      { x: 16, down: 16 },
    ],
    relative: [
      { dx: 0, down: 0 },
      { dx: 0, down: 8 },
      { dx: -6, down: 16 },
    ],
    kidJob: "Run 8 steps straight, then cut toward the middle of the field.",
  },
  {
    id: "in",
    name: "In",
    also: "Dig",
    player: { label: "WR", x: 22, behind: 0 },
    type: "route",
    points: [
      { x: 22, down: 0 },
      { x: 22, down: 10 },
      { x: 12, down: 10 },
    ],
    relative: [
      { dx: 0, down: 0 },
      { dx: 0, down: 10 },
      { dx: -10, down: 10 },
    ],
    kidJob: "Run 10 steps straight. Stop. Run across the middle. Hands up.",
  },
  {
    id: "quick",
    name: "Quick",
    also: "Step to Coach",
    player: { label: "WR", x: 21, behind: 0 },
    type: "route",
    points: [
      { x: 21, down: 0 },
      { x: 20, down: 0 },
    ],
    relative: [
      { dx: 0, down: 0 },
      { dx: -1, down: 0 },
    ],
    kidJob: "Take one step toward Coach on the line. Do not run downfield.",
  },
];

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

/** Stamp a named route onto a token. Outs/flats go to the near sideline. */
export function applyRouteToPlayer(player, route) {
  const { xYard, yardFromOwnGoal } = pctToYards(player.x, player.y);
  const side = route.mirror === false ? 1 : xYard < FIELD_WIDTH_YARDS / 2 ? -1 : 1;
  const steps = route.relative ?? [{ dx: 0, down: 0 }];
  return steps.map(({ dx, down }) => {
    const x = clamp(xYard + dx * side, 0.8, FIELD_WIDTH_YARDS - 0.8);
    const y = clamp(yardFromOwnGoal + down, -4.5, 47);
    return toPct(x, y);
  });
}

export function routeById(id) {
  return ROUTE_TREE.find((route) => route.id === id) ?? null;
}

export function playerCanTakeRoute(player) {
  return Boolean(player && player.team === "offense" && player.position !== "QB");
}
