import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Bell,
  Check,
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  Pause,
  Play,
  RotateCcw,
  TimerReset,
} from "lucide-react";
import DrillDiagram from "./DrillDiagram.jsx";
import { playAlarmBurst, playWarningBeep, unlockAudio } from "./alarm.js";
import { CUES, DRILLS, PRACTICE_META, drillById, formatClock, nextDrill, prevDrill } from "./practicePlan.js";

const NOTES_KEY = "red-dragons-lax-notes-v1";
const REHEARSE_SEC = 15;

function goDrill(id) {
  window.location.hash = id ? `#/lax/${id}` : "#/lax";
}

function loadNotes() {
  try {
    return localStorage.getItem(NOTES_KEY) ?? "";
  } catch {
    return "";
  }
}

export default function LacrosseApp({ drillId, onBack }) {
  const drill = drillId ? drillById(drillId) : null;
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

  const timedDrill = timedId ? drillById(timedId) : null;
  const upcoming = drill ? nextDrill(drill.id) : DRILLS[0];
  const previous = drill ? prevDrill(drill.id) : null;
  const doneMin = useMemo(() => {
    if (!drill) return 0;
    const i = DRILLS.findIndex((d) => d.id === drill.id);
    return DRILLS.slice(0, i).reduce((sum, d) => sum + d.minutes, 0);
  }, [drill]);

  useEffect(() => {
    try {
      localStorage.setItem(NOTES_KEY, notes);
    } catch {
      /* ignore */
    }
  }, [notes]);

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
    unlockAudio();
    stopAlarm();
    warned.current = false;
    const sec = seconds ?? (rehearse ? REHEARSE_SEC : target.minutes * 60);
    setTimedId(target.id);
    setRemaining(sec);
    setRunning(true);
    setPracticeOn(true);
    goDrill(target.id);
  }

  function startPractice() {
    if (practiceOn && timedDrill) {
      goDrill(timedDrill.id);
      if (!running && remaining > 0) {
        unlockAudio();
        setRunning(true);
      }
      return;
    }
    setRehearse(false);
    setPracticeElapsed(0);
    startTimer(DRILLS[0], DRILLS[0].minutes * 60);
  }

  function startRehearsal() {
    setRehearse(true);
    setPracticeElapsed(0);
    startTimer(DRILLS[0], REHEARSE_SEC);
  }

  function addMinute() {
    unlockAudio();
    stopAlarm();
    const id = timedId || drill?.id;
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
    const nxt = timedDrill ? nextDrill(timedDrill.id) : upcoming;
    stopAlarm();
    if (nxt) startTimer(nxt);
  }

  const practiceLeft = Math.max(0, PRACTICE_META.durationMin * 60 - practiceElapsed);
  const drillClock = drill && timedId === drill.id ? remaining : drill ? drill.minutes * 60 : 0;

  return (
    <div className="flex min-h-dvh flex-col bg-[#07140c] text-white">
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
            <p className="truncate text-[11px] text-white/60">{PRACTICE_META.subtitle}</p>
          </div>
          {rehearse ? (
            <span className="hidden rounded-full bg-dragon-gold/20 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-dragon-gold sm:inline">
              Rehearsal
            </span>
          ) : null}
          <PracticeChip
            elapsed={practiceElapsed}
            left={practiceLeft}
            on={practiceOn}
            onStart={startPractice}
          />
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

      <DrillTabs
        drillId={drillId}
        timedId={timedId}
        remaining={remaining}
        running={running}
        alarmOn={alarmOn}
      />

      {timedDrill && timedId !== drillId ? (
        <button
          type="button"
          onClick={() => goDrill(timedId)}
          className="mx-auto mt-2 flex w-[calc(100%-1.5rem)] max-w-6xl items-center justify-between rounded-2xl border border-dragon-gold/40 bg-dragon-gold/10 px-3 py-2 text-left"
        >
          <span className="text-[11px] font-bold uppercase tracking-wide text-dragon-gold">
            Timer on {timedDrill.short}
          </span>
          <span className="font-display text-xl font-extrabold tabular-nums text-dragon-gold">
            {formatClock(remaining)}
          </span>
        </button>
      ) : null}

      <main className="mx-auto w-full max-w-6xl flex-1 px-3 py-4 md:px-5">
        {drill ? (
          <DrillPage
            drill={drill}
            previous={previous}
            upcoming={upcoming}
            remaining={drillClock}
            running={running && timedId === drill.id}
            headerClock={drillClock}
            doneMin={doneMin}
            onStart={() => startTimer(drill)}
            onPause={() => setRunning(false)}
            onReset={() => {
              stopAlarm();
              warned.current = false;
              setTimedId(drill.id);
              setRemaining(drill.minutes * 60);
              setRunning(false);
            }}
            onAddMinute={addMinute}
          />
        ) : (
          <PlanOverview
            notes={notes}
            onNotes={setNotes}
            onStartPractice={startPractice}
            onRehearse={startRehearsal}
            onOpen={goDrill}
            practiceOn={practiceOn}
            elapsed={practiceElapsed}
            rehearse={rehearse}
          />
        )}
      </main>

      {alarmOn ? (
        <AlarmOverlay
          drill={timedDrill}
          next={timedDrill ? nextDrill(timedDrill.id) : null}
          onNext={startNextFromAlarm}
          onSnooze={addMinute}
          onStay={() => stopAlarm()}
        />
      ) : null}
    </div>
  );
}

function PracticeChip({ elapsed, left, on, onStart }) {
  return (
    <button
      type="button"
      onClick={on ? undefined : onStart}
      className="hidden rounded-full bg-white/10 px-3 py-1.5 text-left sm:block"
      title={on ? "Practice clock" : "Start the 75-minute practice clock"}
    >
      <p className="text-[9px] font-bold uppercase tracking-wide text-white/50">Practice</p>
      <p className="font-display text-sm font-extrabold tabular-nums leading-none text-dragon-gold">
        {on ? formatClock(elapsed) : `${PRACTICE_META.durationMin}:00`}
      </p>
      {on ? <p className="text-[9px] text-white/45">{formatClock(left)} left</p> : null}
    </button>
  );
}

function DrillTabs({ drillId, timedId, remaining, running, alarmOn }) {
  return (
    <div className="border-b border-white/10 bg-black/10">
      <div className="mx-auto flex max-w-6xl gap-2 overflow-x-auto px-3 py-2 md:px-5">
        <TabCard
          active={!drillId}
          onClick={() => goDrill(null)}
          label="Plan"
          clock={`${PRACTICE_META.durationMin} min`}
        >
          <div className="flex h-full items-center justify-center bg-[#0b1f12]">
            <ClipboardList className="h-8 w-8 text-dragon-gold" />
          </div>
        </TabCard>
        {DRILLS.map((d) => (
          <TabCard
            key={d.id}
            active={drillId === d.id}
            onClick={() => goDrill(d.id)}
            label={d.short}
            clock={
              timedId === d.id
                ? `${running || alarmOn ? "● " : ""}${formatClock(remaining)}`
                : `${d.minutes} min`
            }
            live={timedId === d.id && (running || alarmOn)}
          >
            <DrillDiagram diagram={d.diagram} compact />
          </TabCard>
        ))}
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

function PlanOverview({ notes, onNotes, onStartPractice, onRehearse, onOpen, practiceOn, elapsed, rehearse }) {
  return (
    <div className="grid gap-4 lg:grid-cols-[1.4fr_0.9fr]">
      <section className="rounded-3xl border border-white/10 bg-white/[0.03] p-4 md:p-5">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-dragon-gold">Tonight’s plan</p>
            <h2 className="font-display text-3xl font-extrabold uppercase">75-minute practice</h2>
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
        <p className="mt-2 text-[11px] text-white/40">
          Rehearse runs every drill at 15 seconds so you can hear the rotate alarm before the girls arrive.
        </p>

        <dl className="mt-4 grid grid-cols-2 gap-2 text-sm sm:grid-cols-4">
          <Stat label="Roster" value={`${PRACTICE_META.roster}`} />
          <Stat label="Coaches" value={`${PRACTICE_META.coaches}`} />
          <Stat label="Per line" value="3–4 girls" />
          <Stat label="Stations" value="Split A / B" />
        </dl>

        <ol className="mt-4 divide-y divide-white/10">
          {DRILLS.map((d, i) => (
            <li key={d.id}>
              <button type="button" onClick={() => onOpen(d.id)} className="flex w-full items-center gap-3 py-3 text-left hover:bg-white/[0.03]">
                <span className="w-14 shrink-0 font-display text-lg font-extrabold tabular-nums text-dragon-gold">
                  {d.clock.split("–")[0]}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate font-bold">{d.name}</span>
                  <span className="block text-[11px] uppercase tracking-wide text-white/50">
                    {d.minutes} min • {d.group} • {d.coach}
                  </span>
                </span>
                <span className="hidden h-12 w-20 overflow-hidden rounded-xl sm:block">
                  <DrillDiagram diagram={d.diagram} compact />
                </span>
                <ChevronRight className="h-4 w-4 shrink-0 text-white/40" />
                <span className="sr-only">Open drill {i + 1}</span>
              </button>
            </li>
          ))}
        </ol>
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
          <h3 className="font-display text-xl font-extrabold uppercase">Bring</h3>
          <ul className="mt-2 space-y-1 text-sm text-white/75">
            {PRACTICE_META.equipment.map((item) => (
              <li key={item}>• {item}</li>
            ))}
          </ul>
        </section>
        <section className="rounded-3xl border border-white/10 bg-white/[0.03] p-4">
          <h3 className="font-display text-xl font-extrabold uppercase">Coach notes</h3>
          <p className="mt-1 text-[11px] text-white/45">Stays on this phone. Who’s out, who needs extra GB reps, weather.</p>
          <textarea
            value={notes}
            onChange={(e) => onNotes(e.target.value)}
            rows={6}
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

function DrillPage({
  drill,
  previous,
  upcoming,
  remaining,
  running,
  headerClock,
  doneMin,
  onStart,
  onPause,
  onReset,
  onAddMinute,
}) {
  const live = running || remaining !== drill.minutes * 60;

  return (
    <div className="grid gap-4 lg:grid-cols-[1.15fr_0.85fr]">
      <section className="space-y-3">
        <div className="overflow-hidden rounded-3xl border border-white/10">
          <DrillDiagram diagram={drill.diagram} />
        </div>
        <div className="flex gap-2">
          <NavChip disabled={!previous} onClick={() => previous && goDrill(previous.id)} icon={ChevronLeft} label={previous ? previous.short : "Start"} />
          <NavChip disabled={!upcoming} onClick={() => upcoming && goDrill(upcoming.id)} icon={ChevronRight} label={upcoming ? upcoming.short : "Done"} flip />
        </div>
      </section>

      <section className="rounded-3xl border border-white/10 bg-white/[0.03] p-4 md:p-5">
        <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-dragon-gold">
          {drill.clock} • {drill.group} • {drill.coach}
        </p>
        <h2 className="mt-1 font-display text-3xl font-extrabold uppercase leading-none">{drill.name}</h2>
        <p className="mt-2 rounded-2xl bg-dragon-gold/15 px-3 py-2 text-sm font-semibold text-dragon-gold">“{drill.say}”</p>

        <div className="mt-4 rounded-3xl bg-black/40 px-4 py-5 text-center">
          <p className="text-[11px] font-bold uppercase tracking-wide text-white/45">{live ? "Time left" : "This drill"}</p>
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
                label={live && remaining > 0 ? "Resume" : `Start ${formatClock(drill.minutes * 60)}`}
                primary
              />
            )}
            <TimerBtn onClick={onReset} icon={RotateCcw} label="Reset" />
            <TimerBtn onClick={onAddMinute} icon={TimerReset} label="+1 min" />
          </div>
          <p className="mt-3 text-[11px] text-white/40">
            Alarm + vibrate when it hits 0. One-minute warning beep. Practice clock starts with the first timer.
          </p>
        </div>

        <Progress doneMin={doneMin} minutes={drill.minutes} />

        <Block title="Set it" items={drill.setup} />
        <Block title="How" items={drill.how} numbered />
        <Block title="Watch for" items={drill.focus} />
      </section>
    </div>
  );
}

function Progress({ doneMin, minutes }) {
  const total = PRACTICE_META.durationMin;
  const start = (doneMin / total) * 100;
  const width = (minutes / total) * 100;
  return (
    <div className="mt-4">
      <div className="mb-1 flex justify-between text-[10px] font-bold uppercase tracking-wide text-white/40">
        <span>Practice</span>
        <span>
          min {doneMin}–{doneMin + minutes} of {total}
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

function AlarmOverlay({ drill, next, onNext, onSnooze, onStay }) {
  return (
    <div className="lax-alarm-overlay fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
      <div className="lax-alarm-pulse w-full max-w-md rounded-3xl border-2 border-dragon-gold bg-[#1a0a0a] p-6 text-center shadow-2xl">
        <Bell className="mx-auto h-10 w-10 text-dragon-gold" />
        <p className="mt-2 text-[11px] font-bold uppercase tracking-[0.2em] text-dragon-gold">Time — rotate</p>
        <h2 className="mt-1 font-display text-4xl font-extrabold uppercase leading-none">{drill?.short ?? "Drill"} is over</h2>
        <p className="mt-3 text-sm text-white/70">Move the girls to the next drill. Alarm keeps sounding until you tap.</p>
        {next ? (
          <p className="mt-2 text-sm font-bold text-white">
            Next: {next.name} <span className="text-white/50">({next.minutes} min • {next.coach})</span>
          </p>
        ) : (
          <p className="mt-2 text-sm font-bold text-dragon-gold">Practice complete. High-fives.</p>
        )}
        <div className="mt-5 flex flex-col gap-2">
          {next ? (
            <button
              type="button"
              onClick={onNext}
              className="rounded-full bg-dragon-gold px-4 py-3 text-sm font-extrabold uppercase tracking-wide text-dragon-black"
            >
              Start next • {next.short}
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
