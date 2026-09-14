import { ChevronRight } from "lucide-react";

const SPORTS = [
  {
    href: "#/flag",
    kicker: "DYF Kindergarten • 6v6",
    title: "Flag Football",
    blurb: "Play designer, coach rules, and the Kinder route tree. Draw it, stamp it, run it.",
    meta: "Coach QB • Unlimited runs",
  },
  {
    href: "#/lax",
    kicker: "3rd & 4th Grade • 75 min",
    title: "Girls Lacrosse",
    blurb: "Tonight’s practice plan with a timer on every drill, a picture of the setup, and an alarm when it’s time to rotate.",
    meta: "22 players • 2 coaches",
  },
];

export default function SportHome() {
  return (
    <div className="flex min-h-dvh flex-col bg-[#07140c] text-white">
      <header className="safe-header mx-auto flex w-full max-w-3xl items-center gap-3 px-4 pb-2 pt-4">
        <img
          src="./logo.png"
          alt="Carroll Southlake Red Dragons"
          className="h-12 w-12 rounded-full object-cover ring-2 ring-dragon-gold/80"
        />
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-dragon-gold">Carroll / Southlake</p>
          <h1 className="font-display text-3xl font-extrabold uppercase leading-none tracking-wide">Red Dragons</h1>
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col justify-center px-4 pb-16 pt-6">
        <p className="mb-5 text-sm text-white/70">Pick the sport you’re coaching today.</p>
        <div className="grid gap-4 sm:grid-cols-2">
          {SPORTS.map((sport) => (
            <a
              key={sport.href}
              href={sport.href}
              className="group relative min-h-[16rem] overflow-hidden rounded-3xl border border-white/10 bg-white/[0.04] p-6 shadow-xl transition hover:border-dragon-gold/60 hover:bg-white/[0.07]"
            >
              <div className="pointer-events-none absolute inset-0 turf-bg opacity-20" />
              <div className="relative">
                <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-dragon-gold">{sport.kicker}</p>
                <h2 className="mt-2 font-display text-3xl font-extrabold uppercase leading-none">{sport.title}</h2>
                <p className="mt-3 text-sm leading-relaxed text-white/75">{sport.blurb}</p>
                <p className="mt-4 text-[11px] font-bold uppercase tracking-wide text-white/50">{sport.meta}</p>
                <span className="mt-5 inline-flex items-center gap-1 text-sm font-bold uppercase tracking-wide text-dragon-gold">
                  Open <ChevronRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
                </span>
              </div>
            </a>
          ))}
        </div>
      </main>
    </div>
  );
}
