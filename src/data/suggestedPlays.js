import { defaultDefense, toPct, uid } from "../utils/field.js";

function P(id, position, label, xYard, yYard, team = "offense") {
  return { id, position, label, team, ...toPct(xYard, yYard) };
}

function path(type, playerId, yardsPoints) {
  return {
    id: uid("path"),
    type,
    playerId,
    points: yardsPoints.map(([x, y]) => toPct(x, y)),
  };
}

const LOS = 5;

const spreadPlayers = [
  P("off-c", "C", "C", 15, LOS),
  P("off-wr1", "WR1", "WR1", 3.5, LOS),
  P("off-wr2", "WR2", "WR2", 26.5, LOS),
  P("off-qb", "QB", "COACH QB", 15, LOS - 1),
  P("off-rb", "RB", "RB", 11.5, LOS - 2.2),
  P("off-wr3", "WR3", "WR3", 20.8, LOS - 1),
];

const tripsRightPlayers = [
  P("off-c", "C", "C", 14.2, LOS),
  P("off-wr1", "WR1", "WR1", 3.2, LOS),
  P("off-wr2", "WR2", "WR2", 22.5, LOS),
  P("off-qb", "QB", "COACH QB", 14.2, LOS - 1),
  P("off-rb", "RB", "RB", 11, LOS - 2),
  P("off-wr3", "WR3", "WR3", 26.8, LOS - 0.8),
];

const iBackPlayers = [
  P("off-c", "C", "C", 15, LOS),
  P("off-wr1", "WR1", "WR1", 4, LOS),
  P("off-wr2", "WR2", "WR2", 26, LOS),
  P("off-qb", "QB", "COACH QB", 15, LOS - 1),
  P("off-rb", "RB", "RB", 15, LOS - 3),
  P("off-wr3", "WR3", "WR3", 20.5, LOS - 1),
];

const bunchRightPlayers = [
  P("off-c", "C", "C", 13.5, LOS),
  P("off-wr1", "WR1", "WR1", 3.5, LOS),
  P("off-wr2", "WR2", "WR2", 21.2, LOS),
  P("off-qb", "QB", "COACH QB", 13.5, LOS - 1),
  P("off-rb", "RB", "RB", 10.5, LOS - 2),
  P("off-wr3", "WR3", "WR3", 24.2, LOS - 0.7),
];

export const SUGGESTED_PLAYS = [
  {
    id: "rb-dive",
    name: "RB Dive",
    type: "run",
    difficulty: "Start here",
    formation: "I-Back",
    why: "Unlimited runs, no rush until the handoff, and a 5–6 year old only has one job: take the ball and run straight. Defense lines up 2 yards off the ball, so the first steps are free.",
    coaching: [
      "RB starts directly behind Coach QB. On 'go', RB takes two steps forward and receives the ball in the stomach.",
      "Coach QB: ball always visible, stay in the 1×1 pocket, no pump fake.",
      "WRs: take 3 steps downfield and STOP. Do not block (illegal). They are decoys only.",
      "Center snaps and stays still — Center cannot take a handoff.",
    ],
    kidsJobs: {
      "COACH QB": "Snap, turn, hand to RB, freeze.",
      C: "Snap the ball. Do not run with it.",
      RB: "Take the ball and run to the far end zone. Flags out, no stiff arm.",
      WR1: "Run 5 yards and stop.",
      WR2: "Run 5 yards and stop.",
      WR3: "Run 5 yards and stop.",
    },
    losYard: LOS,
    showDefense: false,
    players: iBackPlayers,
    paths: [
      path("run", "off-qb", [
        [15, 4],
        [15, 2.2],
      ]),
      path("run", "off-rb", [
        [15, 2],
        [15, 5],
        [15, 14],
      ]),
      path("route", "off-wr1", [
        [4, 5],
        [4, 10],
      ]),
      path("route", "off-wr2", [
        [26, 5],
        [26, 10],
      ]),
      path("route", "off-wr3", [
        [20.5, 4],
        [20.5, 10],
      ]),
    ],
  },
  {
    id: "toss-sweep",
    name: "Toss Sweep Right",
    type: "run",
    difficulty: "Easy",
    formation: "Spread",
    why: "A lateral/backwards pitch is legal, and Kinder has unlimited runs. The cost: the defense MAY cross the LOS as soon as you pitch. Keep the toss short so the RB is already running.",
    coaching: [
      "This is a BACKWARD pass. Sack count does not reset and the rush is live.",
      "Pitch now — do not hold the ball. 5-second count is already going.",
      "RB must catch on the run and get to the sideline. No blocking convoy — WR2 just clears out.",
      "If the pitch hits the ground it is spotted there, not a turnover.",
    ],
    kidsJobs: {
      "COACH QB": "Snap, immediate short pitch to RB. Stay in the pocket.",
      C: "Snap and freeze.",
      RB: "Step right, catch the toss, run to the numbers, then up the field.",
      WR2: "Run straight 8 yards (clear-out). Do not block.",
      WR3: "Run to the sideline 4 yards (clear-out).",
      WR1: "Run 5 yards and stop — backside decoy.",
    },
    losYard: LOS,
    showDefense: false,
    players: spreadPlayers,
    paths: [
      path("run", "off-qb", [
        [15, 4],
        [12.2, 3.2],
      ]),
      path("run", "off-rb", [
        [11.5, 2.8],
        [18, 3.2],
        [24, 6],
        [26, 13],
      ]),
      path("route", "off-wr2", [
        [26.5, 5],
        [27, 13],
      ]),
      path("route", "off-wr3", [
        [20.8, 4],
        [25, 8],
      ]),
      path("route", "off-wr1", [
        [3.5, 5],
        [3.5, 10],
      ]),
    ],
  },
  {
    id: "jet-sweep",
    name: "Jet Sweep Left",
    type: "run",
    difficulty: "Easy",
    formation: "Spread",
    why: "Only one player may be in motion. Jet gives a 5–6 year old a running start before the handoff. Defense still cannot rush until the exchange.",
    coaching: [
      "WR2 starts in motion BEFORE the snap — one player only.",
      "Snap as WR2 crosses the Center. Hand the ball to the hip, do not make them slow down.",
      "If you fake the jet, the defense can rush — so this version is a LIVE handoff, not a fake.",
      "RB and other WRs are statues / short decoy routes. No picks, no blocks.",
    ],
    kidsJobs: {
      WR2: "Start jogging left. Take the ball on the run. Go to the left sideline, then up.",
      "COACH QB": "Watch WR2. Snap as they cross you. Hand off. Stay in the 1×1.",
      C: "Snap when Coach says 'go'.",
      RB: "Take a step as if you might get the ball, then freeze.",
      WR1: "Run 6 yards up the left sideline (clear-out).",
      WR3: "Run 5 yards and stop.",
    },
    losYard: LOS,
    showDefense: false,
    players: spreadPlayers,
    paths: [
      path("motion", "off-wr2", [
        [26.5, 5],
        [20, 4.6],
        [15.4, 4.4],
      ]),
      path("run", "off-wr2", [
        [15.2, 4.3],
        [8, 4.5],
        [3, 7],
        [3, 14],
      ]),
      path("route", "off-wr1", [
        [3.5, 5],
        [2.8, 11],
      ]),
      path("route", "off-wr3", [
        [20.8, 4],
        [20.8, 10],
      ]),
      path("run", "off-rb", [
        [11.5, 2.8],
        [13, 3.5],
      ]),
    ],
  },
  {
    id: "spot-hitches",
    name: "Trips Right — Spot Route",
    type: "pass",
    difficulty: "Easy",
    formation: "Trips Right",
    why: "5-second throw clock. Kids this age cannot run option routes. A 'spot' is: run 5 yards, stop, look at Coach. Defense starts 2 yards off the ball, so the throw is almost a swing pass.",
    coaching: [
      "Do NOT fake a handoff — that releases the rush. Just catch the snap and throw.",
      "Underhand or two-hand push pass is legal and more catchable.",
      "Throw to the first kid who stops and looks. There is no read tree.",
      "3 on the LOS: WR1, C, WR2. WR3 is the slot off the ball.",
    ],
    kidsJobs: {
      WR2: "Run 5 steps, STOP, hands up.",
      WR3: "Run 4 steps, STOP, hands up.",
      WR1: "Run 5 steps, STOP (backside).",
      RB: "Take 2 steps to the flat and turn around — dump-off if everyone else is covered.",
      "COACH QB": "Catch, 1-step, throw. No pump fake. Stay in the pocket.",
      C: "Snap. You are eligible, but this play is not for you.",
    },
    losYard: LOS,
    showDefense: false,
    players: tripsRightPlayers,
    paths: [
      path("route", "off-wr2", [
        [22.5, 5],
        [22.5, 10],
      ]),
      path("route", "off-wr3", [
        [26.8, 4.2],
        [27.2, 8.5],
      ]),
      path("route", "off-wr1", [
        [3.2, 5],
        [3.2, 10],
      ]),
      path("route", "off-rb", [
        [11, 3],
        [7, 4.5],
        [5, 6],
      ]),
    ],
  },
  {
    id: "slants",
    name: "Quick Slants",
    type: "pass",
    difficulty: "Next step",
    formation: "Spread",
    why: "A slant is still one job: two steps and cut toward Coach. Works against 5–6 year olds who sit on the outside. Throw immediately — 5 seconds is shorter than it sounds.",
    coaching: [
      "Inside foot first, then break at 45° toward the middle.",
      "Throw before the child finishes the cut. Lead them with an underhand toss.",
      "No picks: the slot (WR3) slants the OTHER way or sits, so kids do not collide (illegal pick).",
      "If it is not there at '2 Mississippi', throw the RB flat.",
    ],
    kidsJobs: {
      WR1: "Two steps, cut toward the middle, hands up.",
      WR2: "Two steps, cut toward the middle, hands up.",
      WR3: "Sit at 4 yards in the hole (do not cross WR2).",
      RB: "Check-release to the left flat.",
      "COACH QB": "Catch and throw. No fake handoff unless you want the rush.",
      C: "Snap and get small — balls may come over your head.",
    },
    losYard: LOS,
    showDefense: false,
    players: spreadPlayers,
    paths: [
      path("route", "off-wr1", [
        [3.5, 5],
        [3.8, 7.5],
        [9, 11],
      ]),
      path("route", "off-wr2", [
        [26.5, 5],
        [26, 7.5],
        [20.5, 11],
      ]),
      path("route", "off-wr3", [
        [20.8, 4],
        [21, 8.5],
      ]),
      path("route", "off-rb", [
        [11.5, 2.8],
        [6, 3.5],
        [4.5, 6],
      ]),
    ],
  },
  {
    id: "all-go",
    name: "All Go (Everybody Run)",
    type: "pass",
    difficulty: "Easy",
    formation: "Spread",
    why: "The only route a Kindergartner never forgets: run to the end zone. Use it when you need a chunk play or when kids are overthinking. Throw to the kid who is actually looking back.",
    coaching: [
      "Tell them 'run to the far cone and look at Coach at 10 yards.'",
      "You still only have 5 seconds. This is a one-step throw, not a hold-and-hope.",
      "Pick one receiver before the snap. Do not scan the whole field.",
      "RB stays as an outlet in the flat if the gos are covered.",
    ],
    kidsJobs: {
      WR1: "Run as fast as you can straight. Look back when Coach yells your name.",
      WR2: "Same, right sideline.",
      WR3: "Same, up the right hash.",
      RB: "Go to the left flat and watch Coach.",
      "COACH QB": "Pre-pick a WR. Throw on time. Stay in the 1×1.",
      C: "Snap.",
    },
    losYard: LOS,
    showDefense: false,
    players: spreadPlayers,
    paths: [
      path("route", "off-wr1", [
        [3.5, 5],
        [3.2, 18],
      ]),
      path("route", "off-wr2", [
        [26.5, 5],
        [26.8, 18],
      ]),
      path("route", "off-wr3", [
        [20.8, 4],
        [20.5, 18],
      ]),
      path("route", "off-rb", [
        [11.5, 2.8],
        [5, 4],
        [4, 8],
      ]),
    ],
  },
  {
    id: "pa-hitch",
    name: "Fake Dive → Hitch",
    type: "pass",
    difficulty: "Next step",
    formation: "I-Back",
    why: "A fake handoff is legal if the ball stays visible and you do not pump fake or hide a kid. The tradeoff is huge: the defense CAN rush. Only use this if you throw in the first second after the fake.",
    coaching: [
      "Show the ball to the RB, pull it, throw the hitch. One motion, not a pump.",
      "If the rush comes, get rid of it — there is no intentional grounding penalty.",
      "RB must 'sell' by running 4 yards with empty hands — that is not blocking if they do not contact anyone.",
      "Do not use this while leading by 16+ if you have already had to go to Kid QB.",
    ],
    kidsJobs: {
      RB: "Run at the Center like Dive. Do not take the ball. Keep going 4 yards.",
      WR1: "Run 5 yards, STOP, hands up.",
      WR2: "Run 5 yards, STOP, hands up.",
      WR3: "Run 5 yards, STOP.",
      "COACH QB": "Fake to RB (ball visible), throw hitch. No pump. Pocket.",
      C: "Snap.",
    },
    losYard: LOS,
    showDefense: false,
    players: iBackPlayers,
    paths: [
      path("run", "off-rb", [
        [15, 2],
        [15, 9],
      ]),
      path("route", "off-wr1", [
        [4, 5],
        [4, 10],
      ]),
      path("route", "off-wr2", [
        [26, 5],
        [26, 10],
      ]),
      path("route", "off-wr3", [
        [20.5, 4],
        [20.5, 10],
      ]),
    ],
  },
  {
    id: "bubble",
    name: "Bubble Toss to WR3",
    type: "run",
    difficulty: "Easy",
    formation: "Spread",
    why: "A backwards toss to the slot. Same rules as the sweep: defense can rush after the pitch. For little kids it is easier than a forward pass because they see the ball coming from the side.",
    coaching: [
      "WR3 takes one step BACK (bubble), then faces Coach, then runs after the catch.",
      "This is not a screen — blocking is illegal. Other WRs must not touch defenders.",
      "Throw/pitch immediately on the snap.",
      "If WR3 is not a confident catcher, use Toss Sweep to the RB instead.",
    ],
    kidsJobs: {
      WR3: "One step back, catch, run to the right pylon. Flags exposed.",
      "COACH QB": "Snap and pitch. Do not hold it.",
      WR2: "Run 8 yards straight. Do not block the CB.",
      WR1: "Run 5 and stop.",
      RB: "Stay home as if it were a dive (decoy).",
      C: "Snap.",
    },
    losYard: LOS,
    showDefense: false,
    players: spreadPlayers,
    paths: [
      path("run", "off-qb", [
        [15, 4],
        [18.5, 3.6],
      ]),
      path("route", "off-wr3", [
        [20.8, 4],
        [21.5, 2.8],
        [24, 4],
        [27, 10],
      ]),
      path("route", "off-wr2", [
        [26.5, 5],
        [27, 13],
      ]),
      path("route", "off-wr1", [
        [3.5, 5],
        [3.5, 10],
      ]),
    ],
  },
  {
    id: "bunch-smash",
    name: "Bunch Right — Short & Far",
    type: "pass",
    difficulty: "Next step",
    formation: "Bunch Right",
    why: "Bunch lets you tell three kids 'go together, then one stops and one keeps running.' Still no picks — they cannot bump defenders. Pre-pick the short throw 90% of the time.",
    coaching: [
      "Inside bunch player: 4-yard hitch. Outside: 8-yard go. Middle: 5-yard out.",
      "Throw the hitch. The go is a decoy unless the corner squats.",
      "Keep bunch legal: WR1 and C still on the LOS so you have 3 on the line (WR2 is the third).",
      "One-word call: 'Bunch-short'.",
    ],
    kidsJobs: {
      WR2: "4 yards, STOP, hands up (the throw).",
      WR3: "Run to the corner of the end zone. Look back once.",
      WR1: "5-yard hitch backside.",
      RB: "Left flat outlet.",
      "COACH QB": "Throw the stopper. Pocket. No fake.",
      C: "Snap. You are the third lineman.",
    },
    losYard: LOS,
    showDefense: false,
    players: bunchRightPlayers,
    paths: [
      path("route", "off-wr2", [
        [21.2, 5],
        [21.2, 9],
      ]),
      path("route", "off-wr3", [
        [24.2, 4.3],
        [27, 14],
      ]),
      path("route", "off-wr1", [
        [3.5, 5],
        [3.5, 10],
      ]),
      path("route", "off-rb", [
        [10.5, 3],
        [5.5, 4],
        [4, 6.5],
      ]),
    ],
  },
  {
    id: "goal-line-dive",
    name: "Goal Line Dive (1-pt / +5)",
    type: "run",
    difficulty: "Start here",
    formation: "I-Back",
    why: "Kinder may RUN from the 5-yard extra-point spot (1st & 2nd cannot). The highest-percentage PAT for 5–6 year olds is the same dive you already practiced.",
    coaching: [
      "Ball spot: opponent 5 for 1 point, opponent 10 for 2 points. Same play.",
      "Do not get cute. Dive, flags out, north-south.",
      "If you lead by 16+, Kid QB must be in — practice this handoff with that child too.",
    ],
    kidsJobs: {
      RB: "Take the ball, run through the Center's back, do not dive/leap.",
      "COACH QB": "Handoff. Pocket.",
      WR1: "3 steps and stop.",
      WR2: "3 steps and stop.",
      WR3: "3 steps and stop.",
      C: "Snap. Do not take the ball.",
    },
    losYard: 38,
    showDefense: false,
    players: [
      P("off-c", "C", "C", 15, 38),
      P("off-wr1", "WR1", "WR1", 4, 38),
      P("off-wr2", "WR2", "WR2", 26, 38),
      P("off-qb", "QB", "COACH QB", 15, 37),
      P("off-rb", "RB", "RB", 15, 35),
      P("off-wr3", "WR3", "WR3", 20.5, 37),
    ],
    paths: [
      path("run", "off-rb", [
        [15, 35],
        [15, 42],
      ]),
      path("route", "off-wr1", [
        [4, 38],
        [4, 41],
      ]),
      path("route", "off-wr2", [
        [26, 38],
        [26, 41],
      ]),
    ],
  },
];

export const PLAY_ANALYSIS = {
  headline: "What the 2026 DYF Kindergarten rule book is actually telling you to call",
  summary:
    "This is 6v6 on a 30×53 field (5-yard end zones) with an adult Coach Quarterback counting as the sixth offensive player. The kids are 5 and 6. The rules give you unlimited runs, a frozen 1×1 coaching pocket, a 5-second sack count, no blocking, no picks, and no rush until you hand off, fake a handoff, pitch, or throw backwards. The playbook below is built around those constraints — not around 11-on-11 youth football.",
  pillars: [
    {
      title: "Run first — the rule book wants you to",
      body: "Kindergarten is the only DYF flag division with unlimited runs and no No-Run Zone, including extra points from the 5. Defense must line up 2 yards off the ball and cannot rush until the exchange. A dive and a jet sweep are higher-percentage than any pass a 5-year-old has to catch in traffic.",
    },
    {
      title: "One job per kid",
      body: "Do not install option routes, hot reads, or mesh. A Kindergartner can remember 'run to the cone and stop' or 'take the ball and run to the sideline.' Every suggested play has a one-sentence job for each of the five kids.",
    },
    {
      title: "Protect the 5-second clock and the pocket",
      body: "The sack count starts on the snap for every play (1 Mississippi … SACK). Coach QB cannot leave a 1×1 pocket, cannot pump fake, and cannot hide a player. If you fake a handoff, you have released the rush — so fakes are only paired with a throw that is already in the air.",
    },
    {
      title: "Never draw blocking",
      body: "No blocking, no picks, no leaping, no flag guarding. 'Screens' in this league are just pitches. Receivers who are not getting the ball should clear out or freeze, not contact anyone. Illegal blocking is a spot foul and a loss of down.",
    },
    {
      title: "Stay legal before the snap",
      body: "3 on the LOS (Center counts), only one player in motion, flags on hips, 35-second play clock. Failed 4th down is a turnover at the spot; a 'punt' gives them the ball at their 5. Script from your own 5 — that is where every series starts.",
    },
  ],
  avoid: [
    "QB scramble / rollout / bootleg — Coach must stay in the 1×1 pocket.",
    "Pump fake — illegal in Kinder.",
    "Center sneak or any handoff to the Center — illegal.",
    "Throwback to Coach QB — Coach is not eligible.",
    "Blocking screens, picks, or 'convoy' sweeps.",
    "Two kids in motion (jet + a shifting TE).",
    "Complex RPO reads. You have 5 seconds and 5-year-olds.",
    "Four-verticals hold-the-ball shots. Pre-pick a receiver or don't call Go.",
  ],
  rotation:
    "Every child must play 5 snaps per half. Keep Dive, Spot, and Jet as your 'everybody can run this' package so substitutions do not require a new install. If you go up 16, a Kid QB must enter — practice one Dive and one Hitch with that child as QB.",
  defenseNote:
    "You may place defensive X's on the board to teach spacing. Defense starts 2 yards off the LOS. They cannot cross until a handoff, fake handoff, or backward pass. Defensive coach must stand behind the safeties and be out of the play before the snap.",
};

export function playToState(play) {
  return {
    name: play.name,
    losYard: play.losYard ?? 5,
    players: play.players.map((p) => ({ ...p })),
    paths: play.paths.map((p) => ({
      ...p,
      id: uid("path"),
      points: p.points.map((pt) => ({ ...pt })),
    })),
    showDefense: Boolean(play.showDefense),
    defense: defaultDefense(play.losYard ?? 5),
  };
}
