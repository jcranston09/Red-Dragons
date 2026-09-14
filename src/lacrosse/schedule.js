import { DRILL_BANK, drillById } from "./drillBank.js";

export const COACHES = [
  { id: "jack", name: "Jack" },
  { id: "sara", name: "Sara" },
];

export const COACH_IDS = ["jack", "sara", "both"];

export const PRACTICE_META = {
  title: "Girls Lacrosse",
  subtitle: "3rd & 4th Grade • Jack & Sara",
  roster: 22,
  coaches: 2,
  format: "Split stations. Jack and Sara run at the same time. 10 minutes, then groups switch.",
  equipment: ["Cones (3 per line + weave)", "Balls (pile + 1 per relay team)", "Sticks in every hand", "Goal / 8-meter fan"],
};

export const CUES = [
  { id: "box", text: "Stick in the box — head up by the ear, not at the hip." },
  { id: "lines", text: "3–4 girls per line. No waiting around." },
  { id: "effort", text: "Praise the sprint to loose balls and the sharp cut." },
  { id: "split", text: "Half the girls with Jack, half with Sara. When the alarm hits, switch groups." },
];

export const SCHEDULE_KEY = "red-dragons-lax-schedule-v2";
export const COACH_KEY = "red-dragons-lax-who-v1";

export function defaultSchedule() {
  return [
    { id: "wu", type: "together", minutes: 10, drillId: "warmup" },
    { id: "st1", type: "split", minutes: 10, jack: "give-go", sara: "scoop", phase: "run" },
    { id: "st1s", type: "split", minutes: 10, jack: "give-go", sara: "scoop", phase: "switch" },
    { id: "st2", type: "split", minutes: 10, jack: "fastbreak", sara: "ones-gb", phase: "run" },
    { id: "st2s", type: "split", minutes: 10, jack: "fastbreak", sara: "ones-gb", phase: "switch" },
    { id: "rel", type: "together", minutes: 10, drillId: "relay" },
    { id: "wg", type: "together", minutes: 10, drillId: "west-genny" },
    { id: "end", type: "together", minutes: 5, drillId: "huddle" },
  ];
}

export function formatClock(totalSeconds) {
  const s = Math.max(0, Math.ceil(totalSeconds));
  const m = Math.floor(s / 60);
  const r = s % 60;
  return `${m}:${String(r).padStart(2, "0")}`;
}

export function formatRange(startMin, endMin) {
  const fmt = (n) => {
    const h = Math.floor(n / 60);
    const m = n % 60;
    return `${h}:${String(m).padStart(2, "0")}`;
  };
  return `${fmt(startMin)}–${fmt(endMin)}`;
}

export function withClocks(slots) {
  let min = 0;
  return slots.map((s) => {
    const startMin = min;
    min += s.minutes;
    return { ...s, startMin, endMin: min, clock: formatRange(startMin, min) };
  });
}

export function practiceMinutes(slots) {
  return slots.reduce((n, s) => n + s.minutes, 0);
}

function drillExists(id) {
  return Boolean(id && drillById(id));
}

export function sanitizeSchedule(raw) {
  if (!Array.isArray(raw) || raw.length === 0) return defaultSchedule();
  const clean = raw
    .map((s, i) => {
      const minutes = Number(s.minutes) > 0 ? Number(s.minutes) : 10;
      const id = typeof s.id === "string" && s.id ? s.id : `slot-${i}`;
      if (s.type === "split") {
        const jack = drillExists(s.jack) ? s.jack : "give-go";
        const sara = drillExists(s.sara) ? s.sara : "scoop";
        const phase = s.phase === "switch" ? "switch" : "run";
        return { id, type: "split", minutes, jack, sara, phase };
      }
      const drillId = drillExists(s.drillId) ? s.drillId : "warmup";
      return { id, type: "together", minutes, drillId };
    })
    .filter(Boolean);
  return clean.length ? clean : defaultSchedule();
}

export function loadSchedule() {
  try {
    const raw = JSON.parse(localStorage.getItem(SCHEDULE_KEY) || "null");
    return sanitizeSchedule(raw);
  } catch {
    return defaultSchedule();
  }
}

export function saveSchedule(slots) {
  try {
    localStorage.setItem(SCHEDULE_KEY, JSON.stringify(slots));
  } catch {
    /* ignore */
  }
}

export function loadCoach() {
  try {
    const v = localStorage.getItem(COACH_KEY);
    if (v === "jack" || v === "sara" || v === "both") return v;
  } catch {
    /* ignore */
  }
  return null;
}

export function saveCoach(id) {
  try {
    localStorage.setItem(COACH_KEY, id);
  } catch {
    /* ignore */
  }
}

export function slotById(slots, id) {
  return withClocks(slots).find((s) => s.id === id) ?? null;
}

export function nextSlot(slots, id) {
  const timed = withClocks(slots);
  const i = timed.findIndex((s) => s.id === id);
  if (i < 0 || i >= timed.length - 1) return null;
  return timed[i + 1];
}

export function prevSlot(slots, id) {
  const timed = withClocks(slots);
  const i = timed.findIndex((s) => s.id === id);
  if (i <= 0) return null;
  return timed[i - 1];
}

export function drillForSlot(slot, coachId) {
  if (!slot) return null;
  if (slot.type === "together") return drillById(slot.drillId);
  if (coachId === "sara") return drillById(slot.sara);
  if (coachId === "jack") return drillById(slot.jack);
  return drillById(slot.jack);
}

export function otherCoachDrill(slot, coachId) {
  if (!slot || slot.type !== "split") return null;
  if (coachId === "jack") return drillById(slot.sara);
  if (coachId === "sara") return drillById(slot.jack);
  return drillById(slot.sara);
}

export function slotTitle(slot, coachId) {
  const drill = drillForSlot(slot, coachId);
  if (!drill) return "Slot";
  if (slot.type === "split" && slot.phase === "switch") return `${drill.short} · switch`;
  return drill.short;
}

export function slotLabel(slot, coachId) {
  if (slot.type === "together") {
    const d = drillById(slot.drillId);
    return { title: d?.name ?? "Together", detail: "Full group · both coaches" };
  }
  const mine = drillForSlot(slot, coachId);
  const theirs = otherCoachDrill(slot, coachId);
  const otherName = coachId === "sara" ? "Jack" : "Sara";
  const phase = slot.phase === "switch" ? "Switch groups · same drills" : "Stations · split";
  if (coachId === "both") {
    return {
      title: `${drillById(slot.sara)?.short ?? "Sara"}  |  ${drillById(slot.jack)?.short ?? "Jack"}`,
      detail: `${phase} · Sara · Jack`,
    };
  }
  return {
    title: mine?.name ?? "Station",
    detail: `${phase} · ${otherName} has ${theirs?.short ?? "her drill"}`,
  };
}

export function newSlotId() {
  return `slot-${Math.random().toString(36).slice(2, 8)}`;
}

export function catalogCount() {
  return DRILL_BANK.length;
}
