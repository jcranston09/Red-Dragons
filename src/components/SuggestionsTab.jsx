import { Ban, Check, Lightbulb, Play, ShieldAlert } from "lucide-react";
import { PLAY_ANALYSIS, SUGGESTED_PLAYS, playToState } from "../data/suggestedPlays.js";
import { usePlaybook } from "../PlaybookContext.jsx";

const TYPE_COLOR = {
  run: "bg-emerald-500/20 text-emerald-300",
  pass: "bg-sky-500/20 text-sky-300",
};

export default function SuggestionsTab({ onOpenDesigner }) {
  const pb = usePlaybook();

  function openPlay(play) {
    pb.loadExternalPlay(playToState(play));
    onOpenDesigner();
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-6 pb-16">
      <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-dragon-gold">
        Playbook analysis • Kindergarten 5–6 • Coach QB
      </p>
      <h1 className="font-display text-4xl font-extrabold uppercase tracking-wide md:text-5xl">
        {PLAY_ANALYSIS.headline}
      </h1>
      <p className="mt-3 max-w-3xl text-sm leading-relaxed text-white/70">{PLAY_ANALYSIS.summary}</p>

      <div className="mt-6 grid gap-3 md:grid-cols-2 lg:grid-cols-3">
        {PLAY_ANALYSIS.pillars.map((p) => (
          <article key={p.title} className="rounded-2xl border border-white/10 bg-black/35 p-4">
            <Lightbulb className="mb-2 h-4 w-4 text-dragon-gold" />
            <h2 className="font-display text-xl font-bold uppercase">{p.title}</h2>
            <p className="mt-1 text-sm text-white/65">{p.body}</p>
          </article>
        ))}
      </div>

      <section className="mt-8 grid gap-4 lg:grid-cols-[1.4fr_1fr]">
        <div className="rounded-2xl border border-red-500/25 bg-red-950/20 p-4">
          <h2 className="mb-3 flex items-center gap-2 font-display text-2xl font-bold uppercase">
            <Ban className="h-5 w-5 text-red-400" /> Do not install
          </h2>
          <ul className="space-y-2">
            {PLAY_ANALYSIS.avoid.map((item) => (
              <li key={item} className="flex gap-2 text-sm text-red-100/80">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-red-400" />
                {item}
              </li>
            ))}
          </ul>
        </div>
        <div className="space-y-4">
          <div className="rounded-2xl border border-white/10 bg-black/35 p-4">
            <h2 className="mb-2 flex items-center gap-2 font-display text-xl font-bold uppercase">
              <Check className="h-4 w-4 text-dragon-lime" /> Playing-time rotation
            </h2>
            <p className="text-sm text-white/70">{PLAY_ANALYSIS.rotation}</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-black/35 p-4">
            <h2 className="mb-2 flex items-center gap-2 font-display text-xl font-bold uppercase">
              <ShieldAlert className="h-4 w-4 text-yellow-300" /> Defense reminder
            </h2>
            <p className="text-sm text-white/70">{PLAY_ANALYSIS.defenseNote}</p>
          </div>
        </div>
      </section>

      <h2 className="mb-4 mt-10 font-display text-3xl font-extrabold uppercase tracking-wide">
        Suggested plays that fit this rule book
      </h2>
      <div className="grid gap-4 md:grid-cols-2">
        {SUGGESTED_PLAYS.map((play) => (
          <article
            key={play.id}
            className="flex flex-col rounded-2xl border border-white/10 bg-black/35 p-4"
          >
            <div className="flex flex-wrap items-center gap-2">
              <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${TYPE_COLOR[play.type]}`}>
                {play.type}
              </span>
              <span className="rounded-full bg-white/10 px-2 py-0.5 text-[10px] font-bold uppercase text-white/70">
                {play.difficulty}
              </span>
              <span className="rounded-full bg-white/10 px-2 py-0.5 text-[10px] font-bold uppercase text-white/70">
                {play.formation}
              </span>
            </div>
            <h3 className="mt-2 font-display text-2xl font-bold uppercase">{play.name}</h3>
            <p className="mt-1 text-sm text-white/70">{play.why}</p>
            <div className="mt-3">
              <h4 className="text-[10px] font-bold uppercase tracking-wider text-dragon-gold">How to coach it</h4>
              <ul className="mt-1 space-y-1">
                {play.coaching.map((c) => (
                  <li key={c} className="text-xs text-white/65">
                    • {c}
                  </li>
                ))}
              </ul>
            </div>
            <div className="mt-3 rounded-xl bg-black/40 p-3">
              <h4 className="text-[10px] font-bold uppercase tracking-wider text-white/50">Kid jobs (one sentence)</h4>
              <dl className="mt-1 grid grid-cols-1 gap-1 sm:grid-cols-2">
                {Object.entries(play.kidsJobs).map(([pos, job]) => (
                  <div key={pos}>
                    <dt className="text-[10px] font-bold uppercase text-dragon-lime">{pos}</dt>
                    <dd className="text-[11px] text-white/70">{job}</dd>
                  </div>
                ))}
              </dl>
            </div>
            <button
              type="button"
              onClick={() => openPlay(play)}
              className="mt-4 inline-flex items-center justify-center gap-2 rounded-lg bg-dragon-gold px-3 py-2 text-xs font-bold uppercase tracking-wide text-dragon-black hover:brightness-110"
            >
              <Play className="h-3.5 w-3.5" /> Open in play designer
            </button>
          </article>
        ))}
      </div>
    </div>
  );
}
