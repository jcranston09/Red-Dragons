import {
  Baby,
  BookmarkPlus,
  Plus,
  RotateCcw,
  Save,
  Trash2,
  Undo2,
  Eraser,
  Users,
  X,
} from "lucide-react";
import { useState } from "react";
import { DRAW_TOOLS } from "../data/tools.js";
import { usePlaybook } from "../PlaybookContext.jsx";

export default function Sidebar({ onClose }) {
  const pb = usePlaybook();
  const [formationName, setFormationName] = useState("");

  return (
    <aside className="flex h-full min-h-0 flex-col gap-4 overflow-y-auto scrollbar-thin p-3 pb-[max(1rem,env(safe-area-inset-bottom))] sm:p-4">
      {onClose ? (
        <div className="flex items-center justify-between">
          <h2 className="font-display text-lg font-bold uppercase tracking-wide">Play menu</h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full bg-white/10 p-1.5 text-white/80 hover:bg-white/20"
            aria-label="Close play menu"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ) : null}
      <section className="rounded-2xl border border-white/10 bg-black/35 p-3">
        <label className="text-[10px] font-bold uppercase tracking-[0.18em] text-dragon-lime/80">
          Play name
        </label>
        <input
          value={pb.name}
          onChange={(e) => pb.setName(e.target.value)}
          placeholder="Trips Right — Spot Route"
          className="mt-1.5 w-full rounded-lg border border-white/10 bg-dragon-black/80 px-3 py-2 text-sm font-medium outline-none ring-dragon-gold/60 focus:ring-2"
        />
        <div className="mt-3 grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={pb.savePlay}
            className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-dragon-gold px-3 py-2 text-xs font-bold uppercase tracking-wide text-dragon-black hover:brightness-110"
          >
            <Save className="h-3.5 w-3.5" />
            Save play
          </button>
          <button
            type="button"
            onClick={pb.resetPlay}
            className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-xs font-bold uppercase tracking-wide hover:bg-white/10"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            Reset
          </button>
        </div>
      </section>

      <section>
        <h2 className="mb-2 text-[10px] font-bold uppercase tracking-[0.18em] text-white/50">
          Line to draw
        </h2>
        <div className="grid grid-cols-3 gap-2">
          {DRAW_TOOLS.map((t) => {
            const Icon = t.icon;
            const on = pb.tool === t.id;
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => pb.setTool(t.id)}
                className={`rounded-xl border px-2 py-2 text-left transition ${
                  on
                    ? "border-dragon-gold bg-dragon-gold/15 text-dragon-gold"
                    : "border-white/10 bg-black/30 hover:border-white/25"
                }`}
              >
                <Icon className="mb-1 h-4 w-4" />
                <div className="text-[11px] font-bold leading-tight">{t.label}</div>
                <div className="text-[10px] text-white/50">{t.hint}</div>
              </button>
            );
          })}
        </div>
        <div className="mt-2 grid grid-cols-3 gap-2">
          <button
            type="button"
            onClick={pb.undoPath}
            className="inline-flex items-center justify-center gap-1 rounded-lg border border-white/10 bg-black/30 px-2 py-1.5 text-[10px] font-semibold uppercase hover:bg-white/10"
          >
            <Undo2 className="h-3 w-3" /> Undo
          </button>
          <button
            type="button"
            onClick={pb.deleteSelectedPath}
            className="inline-flex items-center justify-center gap-1 rounded-lg border border-white/10 bg-black/30 px-2 py-1.5 text-[10px] font-semibold uppercase hover:bg-white/10"
          >
            <Eraser className="h-3 w-3" /> Erase
          </button>
          <button
            type="button"
            onClick={pb.clearPaths}
            className="inline-flex items-center justify-center gap-1 rounded-lg border border-red-500/30 bg-red-950/40 px-2 py-1.5 text-[10px] font-semibold uppercase text-red-200 hover:bg-red-900/50"
          >
            <Trash2 className="h-3 w-3" /> Clear
          </button>
        </div>
        <p className="mt-2 text-[11px] leading-snug text-white/45">
          Tap a kid, then tap a named route (Flat, Out, Stop…) to stamp it on the play. Drag a
          player to move. To draw freehand: tap, tap-hold, then drag. Lift to plant a corner.
          DYF has no blocking; dashed lines are tosses and motion only.
        </p>
      </section>

      <section>
        <h2 className="mb-2 text-[10px] font-bold uppercase tracking-[0.18em] text-white/50">
          Ball spot
        </h2>
        <select
          value={String(pb.losYard)}
          onChange={(e) => pb.applyBallSpot(Number(e.target.value))}
          className="w-full rounded-lg border border-white/10 bg-black/40 px-3 py-2 text-sm outline-none"
        >
          {pb.ballSpots.map((s) => (
            <option key={s.id} value={s.yard}>
              {s.label}
            </option>
          ))}
        </select>
      </section>

      <section>
        <h2 className="mb-2 text-[10px] font-bold uppercase tracking-[0.18em] text-white/50">
          Formations
        </h2>
        <p className="mb-2 text-[11px] leading-snug text-white/45">
          Click a look to snap every player to it at the current ball spot. Drag kids, then save that
          alignment as your own button.
        </p>
        <div className="mb-3 rounded-xl border border-white/10 bg-black/30 p-2.5">
          <label className="text-[10px] font-bold uppercase tracking-[0.18em] text-white/50">
            New formation name
          </label>
          <div className="mt-1.5 flex gap-2">
            <input
              value={formationName}
              onChange={(e) => setFormationName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  if (pb.saveFormation(formationName)) setFormationName("");
                }
              }}
              placeholder="e.g. Jet Left"
              className="min-w-0 flex-1 rounded-lg border border-white/10 bg-dragon-black/80 px-3 py-2 text-sm outline-none ring-dragon-gold/60 focus:ring-2"
            />
            <button
              type="button"
              onClick={() => {
                if (pb.saveFormation(formationName)) setFormationName("");
              }}
              className="inline-flex shrink-0 items-center gap-1 rounded-lg bg-dragon-green px-3 py-2 text-[10px] font-bold uppercase tracking-wide text-white hover:brightness-110"
            >
              <BookmarkPlus className="h-3.5 w-3.5" />
              Save
            </button>
          </div>
        </div>
        <div className="flex flex-col gap-1.5">
          {pb.formations.map((f) => {
            const on = pb.activeFormationId === f.id;
            return (
              <div
                key={f.id}
                className={`flex items-stretch gap-1 rounded-xl border ${
                  on
                    ? "border-dragon-gold/60 bg-dragon-gold/15"
                    : "border-white/10 bg-black/30"
                }`}
              >
                <button
                  type="button"
                  onClick={() => pb.applyFormation(f.id)}
                  className="min-w-0 flex-1 px-3 py-2 text-left hover:brightness-110"
                >
                  <div className="flex items-center gap-2">
                    <div className="text-xs font-bold">{f.name}</div>
                    {f.builtin ? (
                      <span className="rounded-full bg-white/10 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide text-white/50">
                        Stock
                      </span>
                    ) : (
                      <span className="rounded-full bg-dragon-lime/15 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide text-dragon-lime">
                        Custom
                      </span>
                    )}
                  </div>
                  <div className="text-[10px] text-white/50">{f.blurb}</div>
                </button>
                {!f.builtin ? (
                  <button
                    type="button"
                    onClick={() => pb.deleteFormation(f.id)}
                    className="px-2 text-white/40 hover:text-red-300"
                    aria-label={`Delete ${f.name}`}
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                ) : null}
              </div>
            );
          })}
        </div>
      </section>

      <section>
        <h2 className="mb-2 flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.18em] text-white/50">
          <Plus className="h-3 w-3" /> Add to field
        </h2>
        <p className="mb-2 text-[10px] text-white/45">6v6 cap. Offense = O (red). Defense = X.</p>
        <div className="mb-2 text-[10px] font-bold uppercase tracking-wider text-red-300">Offense</div>
        <div className="flex flex-wrap gap-1.5">
          {pb.offensePalette.map((p) => (
            <button
              key={p.position}
              type="button"
              onClick={() => pb.addPlayer(p)}
              className="rounded-full bg-red-700 px-2.5 py-1 text-[10px] font-bold text-white hover:bg-red-600"
            >
              {p.label}
            </button>
          ))}
        </div>
        <div className="mb-2 mt-3 flex items-center justify-between">
          <span className="text-[10px] font-bold uppercase tracking-wider text-yellow-300">Defense X&apos;s</span>
          <button
            type="button"
            onClick={() => pb.setShowDefense((v) => !v)}
            className="text-[10px] font-semibold uppercase text-dragon-lime"
          >
            {pb.showDefense ? "Hide" : "Show"}
          </button>
        </div>
        {pb.showDefense ? (
          <div className="flex flex-wrap gap-1.5">
            {pb.defensePalette.map((p) => (
              <button
                key={p.position}
                type="button"
                onClick={() => pb.addPlayer(p)}
                className="rounded-full bg-black px-2.5 py-1 text-[10px] font-bold text-yellow-300 ring-1 ring-yellow-300/60 hover:bg-slate-900"
              >
                {p.label}
              </button>
            ))}
          </div>
        ) : (
          <p className="text-[10px] text-white/40">Turn defense on to place 6 X&apos;s (must start 2 yards off the LOS).</p>
        )}
      </section>

      <section>
        <h2 className="mb-2 flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.18em] text-white/50">
          <Users className="h-3 w-3" /> Saved plays
        </h2>
        {pb.savedPlays.length === 0 ? (
          <p className="rounded-xl border border-dashed border-white/15 px-3 py-4 text-xs text-white/45">
            Nothing saved yet. Name a play and hit Save — it stays in this browser.
          </p>
        ) : (
          <ul className="flex flex-col gap-1.5">
            {pb.savedPlays.map((play) => (
              <li
                key={play.id}
                className={`flex items-center gap-2 rounded-xl border px-2 py-1.5 ${
                  pb.activeSavedId === play.id
                    ? "border-dragon-gold/50 bg-dragon-gold/10"
                    : "border-white/10 bg-black/30"
                }`}
              >
                <button
                  type="button"
                  onClick={() => pb.loadPlay(play.id)}
                  className="min-w-0 flex-1 truncate text-left text-xs font-semibold"
                >
                  {play.name}
                </button>
                <button
                  type="button"
                  onClick={() => pb.deleteSaved(play.id)}
                  className="rounded p-1 text-white/40 hover:bg-white/10 hover:text-red-300"
                  aria-label={`Delete ${play.name}`}
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="rounded-2xl border border-white/10 bg-black/35 p-3">
        <h2 className="mb-2 flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.18em] text-dragon-lime">
          <Baby className="h-3 w-3" /> Kinder legality
        </h2>
        <ul className="space-y-1.5">
          {pb.validations.map((n) => (
            <li
              key={n.text}
              className={`text-[11px] leading-snug ${n.tone === "ok" ? "text-dragon-lime" : "text-amber-200"}`}
            >
              {n.text}
            </li>
          ))}
        </ul>
      </section>
    </aside>
  );
}
