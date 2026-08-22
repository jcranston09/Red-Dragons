import { Play, Route } from "lucide-react";
import { SUGGESTED_PLAYS, playToState } from "../data/suggestedPlays.js";
import { ROUTE_TREE } from "../data/routeTree.js";
import { usePlaybook } from "../PlaybookContext.jsx";
import RouteCard from "./RouteCard.jsx";

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
        Kinder route tree • Kindergarten 5–6 • Coach QB
      </p>
      <h1 className="font-display text-4xl font-extrabold uppercase tracking-wide md:text-5xl">
        Player routes
      </h1>
      <p className="mt-3 max-w-3xl text-sm leading-relaxed text-white/70">
        One job per route. In the play designer, tap a kid and pick a name — the line is added
        from wherever they are lined up. Outs and flats go to the near sideline. Posts and ins
        cut to the middle.
      </p>

      <div className="mb-4 mt-5 flex gap-2 overflow-x-auto pb-1">
        {ROUTE_TREE.map((route) => (
          <a
            key={route.id}
            href={`#route-${route.id}`}
            className="shrink-0 rounded-full bg-white/10 px-3 py-1 text-[11px] font-bold uppercase tracking-wide text-white/80 hover:bg-dragon-gold hover:text-dragon-black"
          >
            {route.name}
          </a>
        ))}
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        {ROUTE_TREE.map((route) => (
          <RouteCard key={route.id} route={route} />
        ))}
      </div>
      <p className="mt-4 flex items-center justify-center gap-2 text-[11px] text-white/40">
        <Route className="h-3.5 w-3.5" />
        Straight lines only • tap a player in the designer to stamp these on a play
      </p>

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
