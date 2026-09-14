import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Bell,
  Check,
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  Library,
  Pause,
  Play,
  RotateCcw,
  TimerReset,
} from "lucide-react";
import DrillDiagram from "./DrillDiagram.jsx";
import DrillBankPage from "./DrillBankPage.jsx";
import { playAlarmBurst, playWarningBeep, unlockAudio } from "./alarm.js";
import { DRILL_BANK, drillById, stationDrills, togetherDrills } from "./drillBank.js";
import {
  CUES,
  PRACTICE_META,
  defaultSchedule,
  drillForSlot,
  formatClock,
  loadCoach,
  loadSchedule,
  nextSlot,
  otherCoachDrill,
  practiceMinutes,
  prevSlot,
  saveCoach,
  saveSchedule,
  slotById,
  slotLabel,
  slotTitle,
  withClocks,
} from "./schedule.js";

const NOTES_KEY = "red-dragons-lax-notes-v1";
const REHEARSE_SEC = 15;

function goPlan() {
  window.location.hash = "#/lax";
}
function goBank() {
  window.location.hash = "#/lax/bank";
}
function goSlot(id) {
  window.location.hash = id ? `#/lax/${id}` : "#/lax";
}

function loadNotes() {
  try {
    return localStorage.getItem(NOTES_KEY) ?? "";
  } catch {
    return "";
  }
}

export default function LacrosseApp({ view = "plan", slotId, onBack }) {
  const [coachId, setCoachId] = useState(loadCoach);
  const [slots, setSlots] = useState(loadSchedule);
  const [notes, setNotes] = useState(loadNotes);
  const [practiceElapsed, setPracticeElapsed] = useState(0);
  const [practiceOn, setPracticeOn] = useState(false);
  const [timedId, setTimedId] = useState(null);
  const [remaining, setRemaining] = useState(0);
  const [running, setRunning] = useState(false);
  const [alarmOn, setAlarmOn] = useState(false);
  const [rehearse, setRehearse] = useState(false);
  const warned = useRef(false);
  const alarmTick = useRef(null);
  const wake = useRef(null);

  const timedSlots = useMemo(() => withClocks(slots), [slots]);
  const totalMin = practiceMinutes(slots);
  const slot = slotId ? slotById(slots, slotId) : null;
  const who = coachId ?? "both";
  const drill = drillForSlot(slot, who);
  const partner = otherCoachDrill(slot, who);
  const timedSlot = timedId ? slotById(slots, timedId) : null;
  const timedDrill = drillForSlot(timedSlot, who);
  const upcoming = slot ? nextSlot(slots, slot.id) : timedSlots[0];
  const previous = slot ? prevSlot(slots, slot.id) : null;
  const doneMin = slot?.startMin ?? 0;

  useEffect(() => saveSchedule(slots), [slots]);
  useEffect(() => {
    try {
      localStorage.setItem(NOTES_KEY, notes);
    } catch {
      /* ignore */
    }
  }, [notes]);

  function pickCoach(id) {
    setCoachId(id);
    saveCoach(id);
  }

  useEffect(() => {
    if (!practiceOn) return undefined;
    const id = window.setInterval(() => setPracticeElapsed((n) => n + 1), 1000);
    return () => window.clearInterval(id);
  }, [practiceOn]);

  const stopAlarm = useCallback(() => {
    setAlarmOn(false);
    if (alarmTick.current) {
      window.clearInterval(alarmTick.current);
      alarmTick.current = null;
    }
  }, []);

  const fireAlarm = useCallback(() => {
    setAlarmOn(true);
    setRunning(false);
    playAlarmBurst();
    if (alarmTick.current) window.clearInterval(alarmTick.current);
    alarmTick.current = window.setInterval(() => playAlarmBurst(), 2200);
  }, []);

  useEffect(() => {
    if (!running) return undefined;
    const id = window.setInterval(() => {
      setRemaining((sec) => {
        if (sec <= 0) return 0;
        const next = sec - 1;
        if (next === 60 && !warned.current) {
          warned.current = true;
          playWarningBeep();
        }
        if (next <= 0) {
          window.setTimeout(() => fireAlarm(), 0);
          return 0;
        }
        return next;
      });
    }, 1000);
    return () => window.clearInterval(id);
  }, [running, fireAlarm]);

  useEffect(() => {
    let released = false;
    async function lock() {
      try {
        wake.current = await navigator.wakeLock?.request("screen");
      } catch {
        /* phones without permission */
      }
    }
    if (running) lock();
    else {
      wake.current?.release?.();
      wake.current = null;
    }
    return () => {
      if (!released) wake.current?.release?.();
      released = true;
    };
  }, [running]);

  useEffect(() => () => stopAlarm(), [stopAlarm]);

  function startTimer(target, seconds = null) {
    if (!target) return;
    unlockAudio();
    stopAlarm();
    warned.current = false;
    const sec = seconds ?? (rehearse ? REHEARSE_SEC : target.minutes * 60);
    setTimedId(target.id);
    setRemaining(sec);
    setRunning(true);
    setPracticeOn(true);
    goSlot(target.id);
  }

  function startPractice() {
    if (practiceOn && timedSlot) {
      goSlot(timedSlot.id);
      if (!running && remaining > 0) {
        unlockAudio();
        setRunning(true);
      }
      return;
    }
    setRehearse(false);
    setPracticeElapsed(0);
    const first = timedSlots[0];
    if (first) startTimer(first, first.minutes * 60);
  }

  function startRehearsal() {
    setRehearse(true);
    setPracticeElapsed(0);
    if (timedSlots[0]) startTimer(timedSlots[0], REHEARSE_SEC);
  }

  function addMinute() {
    unlockAudio();
    stopAlarm();
    const id = timedId || slot?.id;
    if (id) setTimedId(id);
    setRemaining((n) => {
      const next = Math.max(0, n) + 60;
      warned.current = next > 60;
      return next;
    });
    setRunning(true);
    setPracticeOn(true);
  }

  function startNextFromAlarm() {
    const nxt = timedSlot ? nextSlot(slots, timedSlot.id) : upcoming;
    stopAlarm();
    if (nxt) startTimer(nxt);
  }

  function patchSlot(id, patch) {
    setSlots((prev) => {
      const i = prev.findIndex((s) => s.id === id);
      if (i < 0) return prev;
      const next = prev.map((s, idx) => (idx === i ? { ...s, ...patch } : s));
      const cur = next[i];
      const after = next[i + 1];
      if (cur.type === "split" && cur.phase === "run" && after?.type === "split" && after.phase === "switch") {
        next[i + 1] = { ...after, jack: cur.jack, sara: cur.sara, minutes: cur.minutes };
      }
      return next;
    });
  }

  const practiceLeft = Math.max(0, totalMin * 60 - practiceElapsed);
  const slotClock = slot && timedId === slot.id ? remaining : slot ? slot.minutes * 60 : 0;

  return (
    <div className="flex min-h-dvh flex-col bg-[#07140c] text-white">
      {!coachId ? <WhoGate onPick={pickCoach} /> : null}

      <header className="safe-header border-b border-white/10 bg-black/20">
        <div className="mx-auto flex max-w-6xl items-center gap-2 px-3 py-2 md:px-5">
          <img
            src="./logo.png"
            alt="Carroll Southlake Red Dragons"
            className="h-10 w-10 rounded-full object-cover ring-2 ring-dragon-gold/80"
          />
          <div className="min-w-0 flex-1">
            <h1 className="font-display text-lg font-extrabold uppercase leading-none tracking-wide md:text-2xl">
              {PRACTICE_META.title}
            </h1>
            <p className="truncate text-[11px] text-white/60">
              {who === "jack" ? "Jack’s track" : who === "sara" ? "Sara’s track" : "Full board"} · {totalMin} min
            </p>
          </div>
          <WhoSwitch value={who} onChange={pickCoach} />
          {rehearse ? (
            <span className="hidden rounded-full bg-dragon-gold/20 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-dragon-gold sm:inline">
              Rehearsal
            </span>
          ) : null}
          <PracticeChip elapsed={practiceElapsed} left={practiceLeft} on={practiceOn} totalMin={totalMin} onStart={startPractice} />
          {onBack ? (
            <button
              type="button"
              onClick={onBack}
              className="rounded-full bg-white/10 px-2.5 py-1.5 text-[11px] font-bold uppercase tracking-wide text-white/80 hover:bg-white/20"
            >
              Sports
            </button>
          ) : null}
        </div>
      </header>

      <SlotTabs
        view={view}
        slotId={slotId}
        slots={timedSlots}
        coachId={who}
        timedId={timedId}
        remaining={remaining}
        running={running}
        alarmOn={alarmOn}
        totalMin={totalMin}
      />

      {timedSlot && timedId !== slotId && view === "slot" ? (
        <button
          type="button"
          onClick={() => goSlot(timedId)}
          className="mx-auto mt-2 flex w-[calc(100%-1.5rem)] max-w-6xl items-center justify-between rounded-2xl border border-dragon-gold/40 bg-dragon-gold/10 px-3 py-2 text-left"
        >
          <span className="text-[11px] font-bold uppercase tracking-wide text-dragon-gold">
            Timer on {slotTitle(timedSlot, who)}
          </span>
          <span className="font-display text-xl font-extrabold tabular-nums text-dragon-gold">{formatClock(remaining)}</span>
        </button>
      ) : null}

      <main className="mx-auto w-full max-w-6xl flex-1 px-3 py-4 md:px-5">
        {view === "bank" ? (
          <DrillBankPage slots={slots} onSlots={setSlots} coachId={who} />
        ) : slot && drill ? (
          <SlotPage
            slot={slot}
            drill={drill}
            partner={partner}
            coachId={who}
            previous={previous}
            upcoming={upcoming}
            remaining={slotClock}
            running={running && timedId === slot.id}
            headerClock={slotClock}
            doneMin={doneMin}
            totalMin={totalMin}
            onStart={() => startTimer(slot)}
            onPause={() => setRunning(false)}
            onReset={() => {
              stopAlarm();
              warned.current = false;
              setTimedId(slot.id);
              setRemaining(slot.minutes * 60);
              setRunning(false);
            }}
            onAddMinute={addMinute}
          />
        ) : (
          <PlanOverview
            slots={timedSlots}
            coachId={who}
            notes={notes}
            onNotes={setNotes}
            onStartPractice={startPractice}
            onRehearse={startRehearsal}
            onOpen={goSlot}
            practiceOn={practiceOn}
            elapsed={practiceElapsed}
            rehearse={rehearse}
            totalMin={totalMin}
            onPatch={patchSlot}
            onResetPlan={() => setSlots(defaultSchedule())}
          />
        )}
      </main>

      {alarmOn ? (
        <AlarmOverlay
          slot={timedSlot}
          drill={timedDrill}
          partner={otherCoachDrill(timedSlot, who)}
          coachId={who}
          next={timedSlot ? nextSlot(slots, timedSlot.id) : null}
          onNext={startNextFromAlarm}
          onSnooze={addMinute}
          onStay={() => stopAlarm()}
        />
      ) : null}
    </div>
  );
}

function WhoGate({ onPick }) {
  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/80 p-4">
      <div className="w-full max-w-md rounded-3xl border border-white/10 bg-[#0b1f12] p-6 text-center">
        <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-dragon-gold">Girls lacrosse</p>
        <h2 className="mt-1 font-display text-4xl font-extrabold uppercase">Who’s coaching?</h2>
        <p className="mt-2 text-sm text-white/65">We’ll show your 10-minute track. Jack and Sara run stations at the same time.</p>
        <div className="mt-5 grid gap-2">
          <button type="button" onClick={() => onPick("sara")} className="rounded-2xl bg-dragon-gold px-4 py-3 font-extrabold uppercase tracking-wide text-dragon-black">
            I’m Sara
          </button>
          <button type="button" onClick={() => onPick("jack")} className="rounded-2xl bg-white px-4 py-3 font-extrabold uppercase tracking-wide text-dragon-black">
            I’m Jack
          </button>
          <button type="button" onClick={() => onPick("both")} className="rounded-2xl bg-white/10 px-4 py-3 text-sm font-bold uppercase tracking-wide">
            Full board (both tracks)
          </button>
        </div>
      </div>
    </div>
  );
}

function WhoSwitch({ value, onChange }) {
  return (
    <div className="flex rounded-full bg-white/10 p-0.5 text-[10px] font-extrabold uppercase tracking-wide">
      {[
        { id: "sara", label: "Sara" },
        { id: "jack", label: "Jack" },
        { id: "both", label: "Both" },
      ].map((c) => (
        <button
          key={c.id}
          type="button"
          onClick={() => onChange(c.id)}
          className={`rounded-full px-2 py-1 ${value === c.id ? "bg-dragon-gold text-dragon-black" : "text-white/70"}`}
        >
          {c.label}
        </button>
      ))}
    </div>
  );
}

function PracticeChip({ elapsed, left, on, onStart, totalMin }) {
  return (
    <button type="button" onClick={on ? undefined : onStart} className="hidden rounded-full bg-white/10 px-3 py-1.5 text-left sm:block">
      <p className="text-[9px] font-bold uppercase tracking-wide text-white/50">Practice</p>
      <p className="font-display text-sm font-extrabold tabular-nums leading-none text-dragon-gold">
        {on ? formatClock(elapsed) : `${totalMin}:00`}
      </p>
      {on ? <p className="text-[9px] text-white/45">{formatClock(left)} left</p> : null}
    </button>
  );
}

function SlotTabs({ view, slotId, slots, coachId, timedId, remaining, running, alarmOn, totalMin }) {
  return (
    <div className="border-b border-white/10 bg-black/10">
      <div className="mx-auto flex max-w-6xl gap-2 overflow-x-auto px-3 py-2 md:px-5">
        <TabCard active={view === "plan"} onClick={goPlan} label="Plan" clock={`${totalMin} min`}>
          <div className="flex h-full items-center justify-center bg-[#0b1f12]">
            <ClipboardList className="h-8 w-8 text-dragon-gold" />
          </div>
        </TabCard>
        <TabCard active={view === "bank"} onClick={goBank} label="Bank" clock={`${DRILL_BANK.length} drills`}>
          <div className="flex h-full items-center justify-center bg-[#0b1f12]">
            <Library className="h-8 w-8 text-dragon-gold" />
          </div>
        </TabCard>
        {slots.map((s) => {
          const live = timedId === s.id && (running || alarmOn);
          return (
            <TabCard
              key={s.id}
              active={view === "slot" && slotId === s.id}
              onClick={() => goSlot(s.id)}
              label={slotTitle(s, coachId)}
              clock={timedId === s.id ? `${live ? "● " : ""}${formatClock(remaining)}` : `${s.minutes} min`}
              live={live}
            >
              {s.type === "split" && coachId === "both" ? (
                <div className="grid h-full grid-cols-2">
                  <DrillDiagram diagram={drillById(s.sara)?.diagram} compact />
                  <DrillDiagram diagram={drillById(s.jack)?.diagram} compact />
                </div>
              ) : (
                <DrillDiagram diagram={drillForSlot(s, coachId)?.diagram} compact />
              )}
            </TabCard>
          );
        })}
      </div>
    </div>
  );
}

function TabCard({ active, onClick, label, clock, children, live }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-[7.5rem] shrink-0 overflow-hidden rounded-2xl border text-left transition ${
        active ? "border-dragon-gold ring-2 ring-dragon-gold/40" : "border-white/10 hover:border-white/30"
      }`}
    >
      <div className="h-[4.4rem]">{children}</div>
      <div className={`px-2 py-1.5 ${active ? "bg-dragon-gold text-dragon-black" : "bg-black/40"}`}>
        <p className="truncate text-[11px] font-extrabold uppercase leading-tight">{label}</p>
        <p className={`text-[10px] font-bold tabular-nums ${active ? "text-dragon-black/70" : live ? "text-dragon-gold" : "text-white/50"}`}>
          {clock}
        </p>
      </div>
    </button>
  );
}

function PlanOverview({
  slots,
  coachId,
  notes,
  onNotes,
  onStartPractice,
  onRehearse,
  onOpen,
  practiceOn,
  elapsed,
  rehearse,
  totalMin,
  onPatch,
  onResetPlan,
}) {
  const stations = stationDrills();
  const groupDrills = togetherDrills();
  const runSplits = slots.filter((s) => s.type === "split" && s.phase !== "switch");
  const saraLine = [...new Set(runSplits.map((s) => drillById(s.sara)?.short).filter(Boolean))].join(" · ");
  const jackLine = [...new Set(runSplits.map((s) => drillById(s.jack)?.short).filter(Boolean))].join(" · ");

  return (
    <div className="grid gap-4 lg:grid-cols-[1.4fr_0.9fr]">
      <section className="rounded-3xl border border-white/10 bg-white/[0.03] p-4 md:p-5">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-dragon-gold">Tonight’s plan</p>
            <h2 className="font-display text-3xl font-extrabold uppercase">{totalMin}-minute practice</h2>
            <p className="mt-1 text-sm text-white/65">{PRACTICE_META.format}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={onStartPractice}
              className="inline-flex items-center gap-2 rounded-full bg-dragon-gold px-4 py-2.5 text-sm font-extrabold uppercase tracking-wide text-dragon-black"
            >
              <Play className="h-4 w-4" fill="currentColor" />
              {practiceOn && !rehearse ? `Resume • ${formatClock(elapsed)}` : "Start practice"}
            </button>
            <button
              type="button"
              onClick={onRehearse}
              className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2.5 text-sm font-extrabold uppercase tracking-wide text-white"
            >
              <Bell className="h-4 w-4" />
              Rehearse 15s
            </button>
          </div>
        </div>

        <dl className="mt-4 grid grid-cols-2 gap-2 text-sm sm:grid-cols-4">
          <Stat label="Roster" value="22" />
          <Stat label="Sara" value={saraLine || "—"} />
          <Stat label="Jack" value={jackLine || "—"} />
          <Stat label="Stations" value="10 min" />
        </dl>
        <p className="mt-2 text-[11px] text-white/40">
          First practice is loaded. Change any slot from the lists, or open the Bank tab to browse every drill.
        </p>

        <ol className="mt-3 divide-y divide-white/10">
          {slots.map((s) => {
            const copy = slotLabel(s, coachId);
            return (
              <li key={s.id} className="py-3">
                <div className="flex items-start gap-3">
                  <button type="button" onClick={() => onOpen(s.id)} className="flex min-w-0 flex-1 items-start gap-3 text-left">
                    <span className="w-14 shrink-0 font-display text-lg font-extrabold tabular-nums text-dragon-gold">
                      {s.clock.split("–")[0]}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block font-bold">{copy.title}</span>
                      <span className="block text-[11px] uppercase tracking-wide text-white/50">
                        {s.minutes} min · {copy.detail}
                      </span>
                    </span>
                    <span className="hidden h-12 w-20 overflow-hidden rounded-xl sm:block">
                      <DrillDiagram diagram={drillForSlot(s, coachId)?.diagram} compact />
                    </span>
                    <ChevronRight className="mt-2 h-4 w-4 shrink-0 text-white/40" />
                  </button>
                </div>
                {s.type === "together" ? (
                  <select
                    value={s.drillId}
                    onChange={(e) => onPatch(s.id, { drillId: e.target.value })}
                    className="mt-2 w-full rounded-xl border border-white/10 bg-black/40 px-2 py-1.5 text-xs"
                  >
                    {groupDrills.concat(stations).map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.name}
                      </option>
                    ))}
                  </select>
                ) : (
                  <div className="mt-2 grid gap-2 sm:grid-cols-2">
                    <label className="text-[10px] font-bold uppercase tracking-wide text-white/40">
                      Sara
                      <select
                        value={s.sara}
                        onChange={(e) => onPatch(s.id, { sara: e.target.value })}
                        className="mt-1 w-full rounded-xl border border-white/10 bg-black/40 px-2 py-1.5 text-xs text-white"
                      >
                        {stations.map((d) => (
                          <option key={d.id} value={d.id}>
                            {d.name}
                          </option>
                        ))}
                      </select>
                    </label>
                    <label className="text-[10px] font-bold uppercase tracking-wide text-white/40">
                      Jack
                      <select
                        value={s.jack}
                        onChange={(e) => onPatch(s.id, { jack: e.target.value })}
                        className="mt-1 w-full rounded-xl border border-white/10 bg-black/40 px-2 py-1.5 text-xs text-white"
                      >
                        {stations.map((d) => (
                          <option key={d.id} value={d.id}>
                            {d.name}
                          </option>
                        ))}
                      </select>
                    </label>
                  </div>
                )}
              </li>
            );
          })}
        </ol>
        <button type="button" onClick={onResetPlan} className="mt-3 text-[11px] font-bold uppercase tracking-wide text-white/45 hover:text-white">
          Reset to first practice
        </button>
      </section>

      <aside className="space-y-4">
        <section className="rounded-3xl border border-white/10 bg-white/[0.03] p-4">
          <h3 className="font-display text-xl font-extrabold uppercase">Say it all practice</h3>
          <ul className="mt-3 space-y-2">
            {CUES.map((c) => (
              <li key={c.id} className="flex gap-2 text-sm text-white/80">
                <Check className="mt-0.5 h-4 w-4 shrink-0 text-dragon-gold" />
                {c.text}
              </li>
            ))}
          </ul>
        </section>
        <section className="rounded-3xl border border-white/10 bg-white/[0.03] p-4">
          <h3 className="font-display text-xl font-extrabold uppercase">Tracks</h3>
          <p className="mt-2 text-sm text-white/75">
            <strong className="text-white">Sara:</strong> {saraLine || "pick from the bank"}.
          </p>
          <p className="mt-1 text-sm text-white/75">
            <strong className="text-white">Jack:</strong> {jackLine || "pick from the bank"}.
          </p>
          <p className="mt-2 text-xs text-white/50">After each 10-minute station the alarm means switch groups, not a new drill.</p>
        </section>
        <section className="rounded-3xl border border-white/10 bg-white/[0.03] p-4">
          <h3 className="font-display text-xl font-extrabold uppercase">Coach notes</h3>
          <textarea
            value={notes}
            onChange={(e) => onNotes(e.target.value)}
            rows={5}
            placeholder="Tap to jot a note…"
            className="mt-3 w-full resize-y rounded-2xl border border-white/10 bg-black/30 p-3 text-sm text-white placeholder:text-white/30 focus:border-dragon-gold/50 focus:outline-none"
          />
        </section>
      </aside>
    </div>
  );
}

function Stat({ label, value }) {
  return (
    <div className="rounded-2xl bg-black/25 px-3 py-2">
      <dt className="text-[10px] font-bold uppercase tracking-wide text-white/45">{label}</dt>
      <dd className="font-display text-lg font-extrabold leading-tight">{value}</dd>
    </div>
  );
}

function SlotPage({
  slot,
  drill,
  partner,
  coachId,
  previous,
  upcoming,
  remaining,
  running,
  headerClock,
  doneMin,
  totalMin,
  onStart,
  onPause,
  onReset,
  onAddMinute,
}) {
  const live = running || remaining !== slot.minutes * 60;
  const otherName = coachId === "sara" ? "Jack" : "Sara";
  const nextDrill = upcoming ? drillForSlot(upcoming, coachId) : null;

  return (
    <div className="grid gap-4 lg:grid-cols-[1.15fr_0.85fr]">
      <section className="space-y-3">
        {slot.type === "split" && coachId === "both" ? (
          <div className="grid gap-2 sm:grid-cols-2">
            <div>
              <p className="mb-1 text-[10px] font-bold uppercase tracking-wide text-dragon-gold">Sara</p>
              <div className="overflow-hidden rounded-3xl border border-white/10">
                <DrillDiagram diagram={drillById(slot.sara)?.diagram} />
              </div>
            </div>
            <div>
              <p className="mb-1 text-[10px] font-bold uppercase tracking-wide text-dragon-gold">Jack</p>
              <div className="overflow-hidden rounded-3xl border border-white/10">
                <DrillDiagram diagram={drillById(slot.jack)?.diagram} />
              </div>
            </div>
          </div>
        ) : (
          <div className="overflow-hidden rounded-3xl border border-white/10">
            <DrillDiagram diagram={drill.diagram} />
          </div>
        )}
        <div className="flex gap-2">
          <NavChip
            disabled={!previous}
            onClick={() => previous && goSlot(previous.id)}
            icon={ChevronLeft}
            label={previous ? slotTitle(previous, coachId) : "Start"}
          />
          <NavChip
            disabled={!upcoming}
            onClick={() => upcoming && goSlot(upcoming.id)}
            icon={ChevronRight}
            label={upcoming ? slotTitle(upcoming, coachId) : "Done"}
            flip
          />
        </div>
      </section>

      <section className="rounded-3xl border border-white/10 bg-white/[0.03] p-4 md:p-5">
        <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-dragon-gold">
          {slot.clock} · {slot.minutes} min · {slot.type === "split" ? (slot.phase === "switch" ? "Switch groups" : "Stations") : "Full group"}
        </p>
        <h2 className="mt-1 font-display text-3xl font-extrabold uppercase leading-none">{drill.name}</h2>
        {partner ? (
          <p className="mt-2 text-sm text-white/60">
            {otherName} is running <span className="font-bold text-white">{partner.name}</span> at the same time.
          </p>
        ) : null}
        {slot.phase === "switch" ? (
          <p className="mt-2 rounded-2xl bg-white/10 px-3 py-2 text-sm">Same drill. Send your group to the other coach. Take theirs. 10 more minutes.</p>
        ) : null}
        <p className="mt-2 rounded-2xl bg-dragon-gold/15 px-3 py-2 text-sm font-semibold text-dragon-gold">“{drill.say}”</p>

        <div className="mt-4 rounded-3xl bg-black/40 px-4 py-5 text-center">
          <p className="text-[11px] font-bold uppercase tracking-wide text-white/45">{live ? "Time left" : "This station"}</p>
          <p className="font-display text-7xl font-extrabold tabular-nums leading-none text-dragon-gold" aria-live="polite">
            {formatClock(headerClock)}
          </p>
          <div className="mt-4 flex flex-wrap justify-center gap-2">
            {running ? (
              <TimerBtn onClick={onPause} icon={Pause} label="Pause" />
            ) : (
              <TimerBtn
                onClick={onStart}
                icon={Play}
                label={live && remaining > 0 ? "Resume" : `Start ${formatClock(slot.minutes * 60)}`}
                primary
              />
            )}
            <TimerBtn onClick={onReset} icon={RotateCcw} label="Reset" />
            <TimerBtn onClick={onAddMinute} icon={TimerReset} label="+1 min" />
          </div>
        </div>

        <Progress doneMin={doneMin} minutes={slot.minutes} totalMin={totalMin} />
        <Block title="Set it" items={drill.setup} />
        <Block title="How" items={drill.how} numbered />
        <Block title="Watch for" items={drill.focus} />
        {nextDrill ? <p className="mt-4 text-xs text-white/45">On deck: {nextDrill.name}</p> : null}
      </section>
    </div>
  );
}

function Progress({ doneMin, minutes, totalMin }) {
  const start = totalMin ? (doneMin / totalMin) * 100 : 0;
  const width = totalMin ? (minutes / totalMin) * 100 : 0;
  return (
    <div className="mt-4">
      <div className="mb-1 flex justify-between text-[10px] font-bold uppercase tracking-wide text-white/40">
        <span>Practice</span>
        <span>
          min {doneMin}–{doneMin + minutes} of {totalMin}
        </span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-white/10">
        <div className="h-full rounded-full bg-dragon-gold" style={{ marginLeft: `${start}%`, width: `${width}%` }} />
      </div>
    </div>
  );
}

function Block({ title, items, numbered }) {
  return (
    <div className="mt-4">
      <h3 className="text-[11px] font-bold uppercase tracking-[0.16em] text-white/45">{title}</h3>
      {numbered ? (
        <ol className="mt-1 list-decimal space-y-1 pl-5 text-sm text-white/85">
          {items.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ol>
      ) : (
        <ul className="mt-1 space-y-1 text-sm text-white/85">
          {items.map((item) => (
            <li key={item}>• {item}</li>
          ))}
        </ul>
      )}
    </div>
  );
}

function NavChip({ disabled, onClick, icon: Icon, label, flip }) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={`flex flex-1 items-center gap-1 rounded-2xl border border-white/10 bg-white/[0.04] px-3 py-2 text-sm font-bold disabled:opacity-30 ${flip ? "justify-end" : ""}`}
    >
      {!flip ? <Icon className="h-4 w-4" /> : null}
      {label}
      {flip ? <Icon className="h-4 w-4" /> : null}
    </button>
  );
}

function TimerBtn({ onClick, icon: Icon, label, primary }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-2 text-xs font-extrabold uppercase tracking-wide ${
        primary ? "bg-dragon-gold text-dragon-black" : "bg-white/10 text-white"
      }`}
    >
      <Icon className="h-3.5 w-3.5" />
      {label}
    </button>
  );
}

function AlarmOverlay({ slot, drill, partner, coachId, next, onNext, onSnooze, onStay }) {
  const nxtDrill = next ? drillForSlot(next, coachId) : null;
  const switchNow = slot?.phase === "run" && next?.phase === "switch";
  return (
    <div className="lax-alarm-overlay fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
      <div className="lax-alarm-pulse w-full max-w-md rounded-3xl border-2 border-dragon-gold bg-[#1a0a0a] p-6 text-center shadow-2xl">
        <Bell className="mx-auto h-10 w-10 text-dragon-gold" />
        <p className="mt-2 text-[11px] font-bold uppercase tracking-[0.2em] text-dragon-gold">
          {switchNow ? "Time — switch groups" : "Time — rotate"}
        </p>
        <h2 className="mt-1 font-display text-4xl font-extrabold uppercase leading-none">
          {switchNow ? "Send them across" : `${drill?.short ?? "Drill"} is over`}
        </h2>
        <p className="mt-3 text-sm text-white/70">
          {switchNow
            ? `Keep ${drill?.short}. Take the other group. ${partner ? `Other coach stays on ${partner.short}.` : ""}`
            : "Move to the next slot. Alarm keeps sounding until you tap."}
        </p>
        {nxtDrill ? (
          <p className="mt-2 text-sm font-bold text-white">
            Next: {nxtDrill.name} <span className="text-white/50">({next.minutes} min)</span>
          </p>
        ) : (
          <p className="mt-2 text-sm font-bold text-dragon-gold">Practice complete. High-fives.</p>
        )}
        <div className="mt-5 flex flex-col gap-2">
          {nxtDrill ? (
            <button
              type="button"
              onClick={onNext}
              className="rounded-full bg-dragon-gold px-4 py-3 text-sm font-extrabold uppercase tracking-wide text-dragon-black"
            >
              Start next · {nxtDrill.short}
            </button>
          ) : null}
          <button type="button" onClick={onSnooze} className="rounded-full bg-white/10 px-4 py-3 text-sm font-bold uppercase tracking-wide">
            +1 minute
          </button>
          <button type="button" onClick={onStay} className="text-xs font-bold uppercase tracking-wide text-white/50">
            Dismiss, stay here
          </button>
        </div>
      </div>
    </div>
  );
}
