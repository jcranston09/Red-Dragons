export const COACH_RULES = {
  division: "Kindergarten (5–6 year olds)",
  format: "DYF 2026 Flag • 6v6",
  field: "30 yards wide × 53 yards long (5-yard end zones)",
  sections: [
    {
      id: "kinder",
      title: "Kindergarten-only rules",
      icon: "Baby",
      highlight: true,
      items: [
        {
          rule: "Coach Quarterback is the 6th offensive player",
          why: "You are in the play. You snap-count, hand the ball off, and throw — the kids are the other five.",
        },
        {
          rule: "Coach QB must stay in a 1 yard × 1 yard pocket",
          why: "You cannot scramble, roll out, or run. Design every play so the throw or handoff happens from that tiny box.",
        },
        {
          rule: "No pump fakes. Ball must stay visible. No hiding a kid behind you",
          why: "You may fake a handoff, but the defense has to see the ball at all times. Do not shield a runner.",
        },
        {
          rule: "Coach QB is not eligible",
          why: "You cannot catch a backwards pass or throw-back. Laterals go to kids only.",
        },
        {
          rule: "Unlimited runs — there is no 'No Run Zone'",
          why: "Unlike 1st & 2nd grade, you may run from anywhere, including the 5-yard line and extra points. Lean on the run with 5–6 year olds.",
        },
        {
          rule: "No safeties. A tackle in the end zone spots the ball at the 1-yard line",
          why: "Do not treat a sack in the end zone like a 2-point score against you. Next play is 1st-and-goal from the 1? No — next play at the 1, same possession rules.",
        },
        {
          rule: "Mercy: if you lead by 16+, you must sub in a Kid QB",
          why: "Have one kid who has practiced a simple snap/handoff so you are not scrambling when the rule kicks in.",
        },
        {
          rule: "One coach on the field for offense AND one for defense",
          why: "Defensive coach must be behind the safeties and out of the play before the snap.",
        },
      ],
    },
    {
      id: "clock",
      title: "Game format, clock, and downs",
      icon: "Clock",
      items: [
        {
          rule: "Two 20-minute running-clock halves, 5-minute halftime",
          why: "Clock only stops for timeouts, injuries, and change of possession — except the last minute of each half.",
        },
        {
          rule: "Every possession starts at the 5-yard line after scores, punts, and to open a half",
          why: "Your opening play of a series is almost always from own 5. Practice that spot more than any other.",
        },
        {
          rule: "3 downs to reach midfield, then 4 downs to score",
          why: "You may go for it on 4th to cross midfield or 'punt' (defense starts at their 5). Failed 4th = defense gets the ball at the spot.",
        },
        {
          rule: "35-second play clock. After a timeout, play starts on the whistle",
          why: "Call the play in the huddle, get lined up, and snap. Kids this age need one word: 'Dive', 'Sweep', 'Hitch'.",
        },
        {
          rule: "5-second sack count: 1 Mississippi … 4 Mississippi, SACK",
          why: "The count starts on the snap for every play. If you have not handed off, lateraled, or thrown, it is a sack and the ball stays at the LOS.",
        },
        {
          rule: "Two 30-second timeouts per half",
          why: "Last minute: clock also stops on incompletions, out of bounds, change of possession, and penalties.",
        },
        {
          rule: "All players must play a minimum of 5 plays per half",
          why: "Build a rotation into the play sheet so the same four kids are not on every snap.",
        },
      ],
    },
    {
      id: "ball",
      title: "Who can do what with the ball",
      icon: "Target",
      items: [
        {
          rule: "NO rushing the quarterback unless there is a handoff, lateral, or backwards pass",
          why: "If you keep the ball and throw from the pocket, the defense cannot cross the LOS. The fastest way to get sacked is a fake handoff — that releases the rush.",
        },
        {
          rule: "The Center cannot take a handoff from the QB",
          why: "Never call a center sneak or 'give to C'. Snap and hand to the RB or a motion WR.",
        },
        {
          rule: "The first person to touch the ball from the snap is the QB",
          why: "On a Kid QB series (mercy rule), whoever first touches it is the QB and cannot cross the LOS as a runner in 1st/2nd — in Kinder the Coach QB simply cannot leave the pocket.",
        },
        {
          rule: "All players are eligible — except the Coach QB in Kinder",
          why: "WRs, RB, TE, and even the Center may catch a forward pass. Use the center on a pop pass only if the kid can handle it.",
        },
        {
          rule: "Forward pass may be underhand or overhand",
          why: "A two-hand chest toss or underhand flip is a legal pass and is often more catchable for 5–6 year olds than a spiral.",
        },
        {
          rule: "Laterals / backwards passes are allowed; sack count does not reset; defense MAY then cross the LOS",
          why: "A pitch or bubble is a live-ball run for the defense. Teach the kid to catch and go immediately.",
        },
        {
          rule: "If the ball hits the ground on a lateral or fumble, spot it there (no live recoveries)",
          why: "Bad pitches are just a loss of yards, not a turnover. Still, keep tosses short.",
        },
        {
          rule: "Bad snap: QB may field it",
          why: "Coach QB should expect low/high snaps. Secure it inside the pocket; do not chase it outside the 1×1.",
        },
        {
          rule: "Ball is spotted where the FLAG is pulled, not where the ball is",
          why: "Teach kids to run north-south. Diving/leaping and flag guarding (including stiff arms) are fouls.",
        },
      ],
    },
    {
      id: "formation",
      title: "Formation, motion, and contact",
      icon: "Users",
      items: [
        {
          rule: "3 players must be on the LOS (the Center counts as 1) or it is Illegal Formation",
          why: "Default: Center + two wideouts on the line. Slot and RB off the ball. 5 yards + replay the down.",
        },
        {
          rule: "Only one player in motion at a time",
          why: "Jet motion is great for this age. Two kids moving = illegal motion, 5 yards, replay.",
        },
        {
          rule: "NO tackling, NO picks, NO blocking",
          why: "Do not draw blocking assignments. 'Screens' are just tosses — the WR must run after the catch with no convoy.",
        },
        {
          rule: "Defense starts 2 yards off the LOS (goal line if the ball is at the +1)",
          why: "Your first 2 yards after the snap are free space. Short hitches and dives win immediately.",
        },
        {
          rule: "Both flags must be on the hips before the snap or that player is ineligible",
          why: "Sideline check: flags on, on the hips, not in the hand. If flags fall off during the play, the runner is down by touch.",
        },
        {
          rule: "One foot in bounds on a catch; no other body part out at the same time",
          why: "Throw inside the numbers. Sideline fades are low-percentage for this age.",
        },
        {
          rule: "Pee-Wee size football for all divisions",
          why: "Use the same ball in practice that you will use on Saturday.",
        },
      ],
    },
    {
      id: "scoring",
      title: "Scoring",
      icon: "Trophy",
      items: [
        { rule: "Touchdown = 6 points", why: "Every possession starts at the 5 after a score." },
        {
          rule: "Extra point from the 5-yard line = 1 point",
          why: "In Kinder you MAY run this. In 1st/2nd the no-run zone applies here — not your problem yet.",
        },
        { rule: "Extra point from the 10-yard line = 2 points", why: "Same: run or pass. Keep PAT calls as simple as base plays." },
        {
          rule: "Safety = 2 points — but NOT in Kindergarten",
          why: "Kinder: play at the 1-yard line instead. 1st & 2nd: 2 points and the other team gets the ball.",
        },
      ],
    },
    {
      id: "penalties",
      title: "Penalties coaches actually cause (or must teach)",
      icon: "AlertTriangle",
      items: [
        { rule: "False start — 5 yards, replay", why: "Kids jump. Use a consistent cadence and a visual ('when I tap C')." },
        { rule: "Illegal formation — 5 yards, replay", why: "Count three on the LOS every huddle break." },
        { rule: "Illegal motion (two in motion) — 5 yards, replay", why: "Only the jet player moves." },
        { rule: "Illegal run — 5 yards, loss of down", why: "Does not apply to Kinder unlimited runs; still never hand to the Center." },
        { rule: "Blocking — spot foul, loss of down", why: "Teach 'hands on flags, not on people.' No convoys, no shoving." },
        { rule: "Leaping — spot foul, loss of down", why: "No diving over kids. Run around." },
        { rule: "Flag guarding / stiff arm — 5 from the spot, loss of down", why: "Ball in two hands, flags exposed." },
        { rule: "Offensive PI — 10 yards, replay", why: "No pushing off. No picks — that's also illegal." },
        { rule: "Delay of game — clock stops, 5 yards", why: "35-second clock. Script the first 8 plays." },
        { rule: "No intentional grounding penalty", why: "If the pocket is collapsing (after a fake/lateral), throw it away." },
        { rule: "Illegal rushing — 5 yards, replay (offense may decline)", why: "Know when you released the rush (handoff / fake / backward pass)." },
        { rule: "Inadvertent tackle from behind with a clear path — automatic TD", why: "Play through the whistle; don't argue, just know the rule." },
        { rule: "Games cannot end on a defensive penalty", why: "Untimed down after yardage is assessed." },
      ],
    },
  ],
};

export const QUICK_CHART = [
  { label: "Players on field", value: "6v6" },
  { label: "Your QB", value: "Adult coach (1×1 pocket)" },
  { label: "Runs", value: "Unlimited" },
  { label: "Sack count", value: "5 seconds" },
  { label: "Play clock", value: "35 seconds" },
  { label: "Downs to midfield", value: "3 (4th to go or punt)" },
  { label: "Downs to score", value: "4 after midfield" },
  { label: "Start spot", value: "Own 5-yard line" },
  { label: "On the LOS", value: "3 (Center counts)" },
  { label: "Motion", value: "One player" },
  { label: "Blocking / picks", value: "Illegal" },
  { label: "Rush the QB", value: "Only after H.O. / lateral / backward pass" },
];
