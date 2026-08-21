/** DYF 6v6 flag field: 30 yards wide, 53 yards long, 5-yard end zones. */
export const FIELD_WIDTH_YARDS = 30;
export const FIELD_LENGTH_YARDS = 53;
export const ENDZONE_YARDS = 5;
export const PLAYING_FIELD_YARDS = FIELD_LENGTH_YARDS - ENDZONE_YARDS * 2; // 43
export const MIDFIELD_YARD = PLAYING_FIELD_YARDS / 2; // 21.5
export const DEFENSE_CUSHION_YARDS = 2;
export const COACH_POCKET_YARDS = 1;

export const OFFENSE_POSITIONS = [
  { position: "QB", label: "COACH QB", team: "offense" },
  { position: "C", label: "C", team: "offense" },
  { position: "RB", label: "RB", team: "offense" },
  { position: "WR1", label: "WR1", team: "offense" },
  { position: "WR2", label: "WR2", team: "offense" },
  { position: "WR3", label: "WR3", team: "offense" },
  { position: "TE", label: "TE", team: "offense" },
];

export const DEFENSE_POSITIONS = [
  { position: "CB1", label: "CB1", team: "defense" },
  { position: "CB2", label: "CB2", team: "defense" },
  { position: "LB1", label: "LB1", team: "defense" },
  { position: "LB2", label: "LB2", team: "defense" },
  { position: "S1", label: "S1", team: "defense" },
  { position: "S2", label: "S2", team: "defense" },
];

/** Convert field yards to canvas percentages. Own goal line is yard 0 (bottom). */
export function toPct(xYard, yardFromOwnGoal) {
  return {
    x: (xYard / FIELD_WIDTH_YARDS) * 100,
    y: 100 - ((ENDZONE_YARDS + yardFromOwnGoal) / FIELD_LENGTH_YARDS) * 100,
  };
}

export function pctToYards(xPct, yPct) {
  const yardFromOwnGoal = FIELD_LENGTH_YARDS * (1 - yPct / 100) - ENDZONE_YARDS;
  const xYard = (xPct / 100) * FIELD_WIDTH_YARDS;
  return { xYard, yardFromOwnGoal };
}

export function losYPct(losYard) {
  return toPct(15, losYard).y;
}

export function uid(prefix = "id") {
  return `${prefix}-${Math.random().toString(36).slice(2, 9)}`;
}

export function dist(a, b) {
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  return Math.hypot(dx, dy);
}

export function nearestPlayer(point, players, maxDist = 6) {
  let best = null;
  let bestD = maxDist;
  for (const p of players) {
    const d = dist(point, p);
    if (d < bestD) {
      best = p;
      bestD = d;
    }
  }
  return best;
}

function slot(position, label, xYard, dy, team = "offense") {
  return {
    id: `off-${String(position).toLowerCase()}`,
    position,
    label,
    team,
    xYard,
    dy,
  };
}

/** Rebuild absolute field % coords from a formation alignment at the current LOS. */
export function playersFromAlignment(alignment, losYard) {
  return (alignment ?? []).map((entry) => ({
    id: entry.id || `off-${String(entry.position).toLowerCase()}`,
    position: entry.position,
    label: entry.label,
    team: entry.team ?? "offense",
    ...toPct(entry.xYard, losYard + entry.dy),
  }));
}

/** Snapshot current tokens as offsets from the LOS so the look works at any ball spot. */
export function alignmentFromPlayers(players, losYard) {
  return players.map((p) => {
    const { xYard, yardFromOwnGoal } = pctToYards(p.x, p.y);
    return {
      id: p.id,
      position: p.position,
      label: p.label,
      team: p.team,
      xYard,
      dy: yardFromOwnGoal - losYard,
    };
  });
}

export function shiftPlayersByYards(players, deltaYards) {
  return players.map((p) => {
    const { xYard, yardFromOwnGoal } = pctToYards(p.x, p.y);
    return { ...p, ...toPct(xYard, yardFromOwnGoal + deltaYards) };
  });
}

export function shiftPathsByYards(paths, deltaYards) {
  return paths.map((path) => ({
    ...path,
    points: path.points.map((pt) => {
      const { xYard, yardFromOwnGoal } = pctToYards(pt.x, pt.y);
      return toPct(xYard, yardFromOwnGoal + deltaYards);
    }),
  }));
}

function player(id, position, label, xYard, yYard, team = "offense") {
  return { id, position, label, team, ...toPct(xYard, yYard) };
}

export const SPREAD_ALIGNMENT = [
  slot("C", "C", 15, 0),
  slot("WR1", "WR1", 2.8, 0),
  slot("WR2", "WR2", 27.2, 0),
  slot("QB", "COACH QB", 15, -1),
  slot("RB", "RB", 11.2, -2.4),
  slot("WR3", "WR3", 20.6, -1.1),
];

/** Standard Kinder 6-player look: 3 on the LOS (C + two WRs), Coach QB in the 1x1 pocket. */
export function defaultOffense(losYard = 5) {
  return playersFromAlignment(SPREAD_ALIGNMENT, losYard);
}

export function defaultDefense(losYard = 5) {
  const dlos = losYard + DEFENSE_CUSHION_YARDS;
  return [
    player("def-cb1", "CB1", "CB1", 3.5, dlos + 0.4, "defense"),
    player("def-cb2", "CB2", "CB2", 26.5, dlos + 0.4, "defense"),
    player("def-lb1", "LB1", "LB1", 10.5, dlos, "defense"),
    player("def-lb2", "LB2", "LB2", 19.5, dlos, "defense"),
    player("def-s1", "S1", "S1", 11, dlos + 7, "defense"),
    player("def-s2", "S2", "S2", 19, dlos + 7, "defense"),
  ];
}

export const STOCK_FORMATIONS = [
  {
    id: "spread",
    name: "Spread (3 on LOS)",
    blurb: "WRs split both sidelines. C + WR1 + WR2 on the line. Slot WR3. RB offset.",
    builtin: true,
    alignment: SPREAD_ALIGNMENT,
  },
  {
    id: "tripsRight",
    name: "Trips Right",
    blurb: "All three WRs to the right. C + two trips WRs on the LOS.",
    builtin: true,
    alignment: [
      slot("C", "C", 12.5, 0),
      slot("WR1", "WR1", 21.2, 0),
      slot("WR2", "WR2", 24.6, 0),
      slot("QB", "COACH QB", 12.5, -1),
      slot("RB", "RB", 9.2, -2.2),
      slot("WR3", "WR3", 27.6, -0.9),
    ],
  },
  {
    id: "tripsLeft",
    name: "Trips Left",
    blurb: "Mirror trips. Three kids on the left — one-word call: 'that way'.",
    builtin: true,
    alignment: [
      slot("C", "C", 17.5, 0),
      slot("WR1", "WR1", 8.8, 0),
      slot("WR2", "WR2", 5.4, 0),
      slot("QB", "COACH QB", 17.5, -1),
      slot("RB", "RB", 20.8, -2.2),
      slot("WR3", "WR3", 2.4, -0.9),
    ],
  },
  {
    id: "bunchRight",
    name: "Bunch Right",
    blurb: "Tight cluster on the right. Kids remember 'stay together, then go'.",
    builtin: true,
    alignment: [
      slot("C", "C", 12, 0),
      slot("WR1", "WR1", 19.6, 0),
      slot("WR2", "WR2", 21.8, 0),
      slot("QB", "COACH QB", 12, -1),
      slot("RB", "RB", 8.8, -2.2),
      slot("WR3", "WR3", 23.4, -0.9),
    ],
  },
  {
    id: "iBack",
    name: "I-Back (Run)",
    blurb: "RB stacked directly behind Coach QB for dive / draw. Still 3 on the LOS.",
    builtin: true,
    alignment: [
      slot("C", "C", 15, 0),
      slot("WR1", "WR1", 3.2, 0),
      slot("WR2", "WR2", 26.8, 0),
      slot("QB", "COACH QB", 15, -1),
      slot("RB", "RB", 15, -3.3),
      slot("WR3", "WR3", 21.2, -1.1),
    ],
  },
];

export const FORMATIONS = Object.fromEntries(STOCK_FORMATIONS.map((f) => [f.id, f]));

export const BALL_SPOTS = [
  { id: "own5", label: "Own 5 (start of possession)", yard: 5 },
  { id: "own1", label: "Own 1 (after Kinder 'safety')", yard: 1 },
  { id: "mid", label: "Midfield (first-down line)", yard: MIDFIELD_YARD },
  { id: "plus10", label: "Opponent 10 (2-pt look)", yard: PLAYING_FIELD_YARDS - 10 },
  { id: "plus5", label: "Opponent 5 (1-pt / goal line)", yard: PLAYING_FIELD_YARDS - 5 },
];
