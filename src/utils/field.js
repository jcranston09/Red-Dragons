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

function player(id, position, label, xYard, yYard, team = "offense") {
  return { id, position, label, team, ...toPct(xYard, yYard) };
}

/** Standard Kinder 6-player look: 3 on the LOS (C + two WRs), Coach QB in the 1x1 pocket. */
export function defaultOffense(losYard = 5) {
  const los = losYard;
  return [
    player("off-c", "C", "C", 15, los),
    player("off-wr1", "WR1", "WR1", 3.5, los),
    player("off-wr2", "WR2", "WR2", 26.5, los),
    player("off-qb", "QB", "COACH QB", 15, los - 1),
    player("off-rb", "RB", "RB", 11.5, los - 2.2),
    player("off-wr3", "WR3", "WR3", 20.8, los - 1),
  ];
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

export const FORMATIONS = {
  spread: {
    id: "spread",
    name: "Spread (3 on LOS)",
    blurb: "C + WR1 + WR2 on the line. Slot WR3. RB offset. Legal Kinder look.",
    players: (los) => defaultOffense(los),
  },
  tripsRight: {
    id: "tripsRight",
    name: "Trips Right",
    blurb: "C, TE, and backside WR on the LOS. Two receivers stacked right.",
    players: (los) => [
      player("off-c", "C", "C", 14.2, los),
      player("off-wr1", "WR1", "WR1", 3.2, los),
      player("off-wr2", "WR2", "WR2", 22.5, los),
      player("off-qb", "QB", "COACH QB", 14.2, los - 1),
      player("off-rb", "RB", "RB", 11, los - 2),
      player("off-wr3", "WR3", "WR3", 26.8, los - 0.8),
    ],
  },
  tripsLeft: {
    id: "tripsLeft",
    name: "Trips Left",
    blurb: "Mirror trips. Puts three 5-6 year olds on one side for a simple 'run that way' call.",
    players: (los) => [
      player("off-c", "C", "C", 15.8, los),
      player("off-wr1", "WR1", "WR1", 7.5, los),
      player("off-wr2", "WR2", "WR2", 26.8, los),
      player("off-qb", "QB", "COACH QB", 15.8, los - 1),
      player("off-rb", "RB", "RB", 19, los - 2),
      player("off-wr3", "WR3", "WR3", 3.2, los - 0.8),
    ],
  },
  bunchRight: {
    id: "bunchRight",
    name: "Bunch Right",
    blurb: "Tight cluster — kids only need to remember 'stay together, then go'.",
    players: (los) => [
      player("off-c", "C", "C", 13.5, los),
      player("off-wr1", "WR1", "WR1", 3.5, los),
      player("off-wr2", "WR2", "WR2", 21.2, los),
      player("off-qb", "QB", "COACH QB", 13.5, los - 1),
      player("off-rb", "RB", "RB", 10.5, los - 2),
      player("off-wr3", "WR3", "WR3", 24.2, los - 0.7),
    ],
  },
  iBack: {
    id: "iBack",
    name: "I-Back (Run)",
    blurb: "RB directly behind Coach QB for dive / draw. Still 3 on the LOS.",
    players: (los) => [
      player("off-c", "C", "C", 15, los),
      player("off-wr1", "WR1", "WR1", 4, los),
      player("off-wr2", "WR2", "WR2", 26, los),
      player("off-qb", "QB", "COACH QB", 15, los - 1),
      player("off-rb", "RB", "RB", 15, los - 3),
      player("off-wr3", "WR3", "WR3", 20.5, los - 1),
    ],
  },
};

export const BALL_SPOTS = [
  { id: "own5", label: "Own 5 (start of possession)", yard: 5 },
  { id: "own1", label: "Own 1 (after Kinder 'safety')", yard: 1 },
  { id: "mid", label: "Midfield (first-down line)", yard: MIDFIELD_YARD },
  { id: "plus10", label: "Opponent 10 (2-pt look)", yard: PLAYING_FIELD_YARDS - 10 },
  { id: "plus5", label: "Opponent 5 (1-pt / goal line)", yard: PLAYING_FIELD_YARDS - 5 },
];
