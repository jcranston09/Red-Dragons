export const PRACTICE_META = {
  title: "Girls Lacrosse",
  subtitle: "3rd & 4th Grade • 75 minutes",
  roster: 22,
  coaches: 2,
  durationMin: 75,
  format: "High-rep split stations. Keep lines to 3–4 girls.",
  equipment: ["Cones (3 per line + weave)", "Balls (pile + 1 per relay team)", "Sticks in every hand", "Goal / 8-meter fan"],
};

export const CUES = [
  { id: "box", text: "Stick in the box — head up by the ear, not at the hip." },
  { id: "lines", text: "3–4 girls per line. No waiting around." },
  { id: "effort", text: "Praise the sprint to loose balls and the sharp cut." },
];

export const DRILLS = [
  {
    id: "warmup",
    name: "Dynamic Warm-Up",
    short: "Warm-Up",
    minutes: 10,
    clock: "0:00–0:10",
    group: "Full group",
    coach: "Both coaches",
    setup: ["15-yard strip of field", "Sticks in hand", "Full roster together"],
    how: [
      "High knees & butt kicks — 2 min, across 15 yards.",
      "Side shuffles & carioca — 2 min, facing sideways.",
      "Walking lunges with a twist — 2 min.",
      "Leg swings & inchworms — 2 min. Use sticks for balance.",
      "Arm circles & cradle motion — 2 min. Stick overhead.",
    ],
    focus: ["Heart rate up", "Hips, shoulders, wrists", "Cradle the stick from the first minute"],
    say: "Sticks in the box. Move together. We cradle from the first minute.",
    diagram: "warmup",
  },
  {
    id: "scoop",
    name: "3-Cone Scoop & Accelerate",
    short: "3-Cone Scoop",
    minutes: 15,
    clock: "0:10–0:25",
    group: "Station A",
    coach: "Coach 1",
    setup: [
      "3 parallel lines, 3–4 girls each",
      "3 cones per line, 5 yards apart",
      "Coach with a pile of balls at the start",
    ],
    how: [
      "Coach rolls a ground ball past the second cone.",
      "Girl sprints, gets low (two butts down), scoops on the run — do not stop.",
      "Cradle through the cones, switching hands.",
      "Come back around the last cone and pass to the teammate who just finished (she goes to the end of the line after the catch).",
    ],
    focus: ["Run through the ball", "Protected cradle right after the scoop", "Switch hands"],
    say: "Two butts down. Scoop on the run. Do not stop.",
    diagram: "scoop",
  },
  {
    id: "give-go",
    name: "Give-and-Go Drive to Net",
    short: "Give & Go",
    minutes: 10,
    clock: "0:25–0:35",
    group: "Station B",
    coach: "Coach 2",
    setup: [
      "Coach at the top of the 8-meter fan with a bucket of balls",
      "Line of girls 15 yards out on the wing",
      "Goalie or empty net",
    ],
    how: [
      "Girl passes to the coach, then cuts toward the goal.",
      "Coach hits her in stride on the return pass.",
      "She shoots on goal.",
    ],
    focus: ["Catch in stride", "Sharp cut, change of direction", "Throw ahead of the cutter"],
    say: "Pass, cut hard, catch in stride, shoot.",
    diagram: "giveGo",
  },
  {
    id: "scramble",
    name: "Ground Ball Scramble",
    short: "1v1 GB",
    minutes: 10,
    clock: "0:35–0:45",
    group: "Station A",
    coach: "Coach 1",
    setup: ["Two lines side-by-side, 5 yards behind the coach", "Open space in front for the 1v1"],
    how: [
      "Coach rolls a loose ball between the lines and yells Go.",
      "Both girls sprint. Winner boxes out, scoops, and protects.",
      "Then either score on goal or pass back to the coach while the other girl applies light pressure.",
    ],
    focus: ["Boxing out", "Body position", "Clear space under pressure"],
    say: "Win the body first. Box out. Scoop. Protect.",
    diagram: "scramble",
  },
  {
    id: "fastbreak",
    name: "2v1 Fast Break",
    short: "2v1",
    minutes: 10,
    clock: "0:45–0:55",
    group: "Station B",
    coach: "Coach 2",
    setup: ["Two attackers, one defender", "Coach throws the entry pass"],
    how: [
      "Coach feeds the offense. Offense must make one pass.",
      "Tell the defender: play the girl with the ball. Do not hover in the middle of both.",
      "The girl who shoots then stays on as defense. The others rotate.",
    ],
    focus: ["Draw the defender", "Quick decision", "Off-ball spacing"],
    say: "One pass. Draw the defender. Do not hover in the middle.",
    diagram: "fastbreak",
  },
  {
    id: "relay",
    name: "Ground Ball Relay",
    short: "Relay",
    minutes: 10,
    clock: "0:55–1:05",
    group: "Full group • 4 teams",
    coach: "Both coaches",
    setup: ["4 even teams", "Weave cone course in front of each line", "One ball per team"],
    how: [
      "Race: scoop, cradle through the weave, pass back to the next girl in front of the line.",
      "Next girl goes. First team finished wins.",
    ],
    focus: ["Scoop on the run", "Cradle through traffic", "Clean pass to the next teammate"],
    say: "Race. Scoop, weave, pass. First team done wins.",
    diagram: "relay",
  },
  {
    id: "west-genny",
    name: "West Genny 3v2",
    short: "3v2",
    minutes: 10,
    clock: "1:05–1:15",
    group: "Full field",
    coach: "Both coaches",
    setup: [
      "2 teams",
      "3 lines on each side at GLE (goal line extended)",
      "Whole field",
    ],
    how: [
      "Offense sends 3. Defense sends 2.",
      "Two passes must be made.",
      "Last girl to touch the ball is out. The other two offense become defense.",
      "Old defense goes to the back of the lines. 3 new girls come out on offense.",
    ],
    focus: ["Defense get back in the hole", "Offensive fast break", "Keep it moving"],
    say: "Three vs two. Two passes. Shooter is out. Defense get back in the hole.",
    diagram: "westGenny",
  },
];

export function drillById(id) {
  return DRILLS.find((d) => d.id === id) ?? null;
}

export function nextDrill(id) {
  const i = DRILLS.findIndex((d) => d.id === id);
  if (i < 0 || i >= DRILLS.length - 1) return null;
  return DRILLS[i + 1];
}

export function prevDrill(id) {
  const i = DRILLS.findIndex((d) => d.id === id);
  if (i <= 0) return null;
  return DRILLS[i - 1];
}

export function formatClock(totalSeconds) {
  const s = Math.max(0, Math.ceil(totalSeconds));
  const m = Math.floor(s / 60);
  const r = s % 60;
  return `${m}:${String(r).padStart(2, "0")}`;
}
