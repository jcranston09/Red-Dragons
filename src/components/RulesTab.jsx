import {
  AlertTriangle,
  Baby,
  BookOpen,
  Clock,
  Target,
  Trophy,
  Users,
} from "lucide-react";
import { COACH_RULES, QUICK_CHART } from "../data/rules.js";

const ICONS = { Baby, Clock, Target, Users, Trophy, AlertTriangle };

export default function RulesTab() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-6 pb-16">
      <header className="mb-6 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-dragon-gold">
            2026 DYF Flag Rule Book
          </p>
          <h1 className="font-display text-4xl font-extrabold uppercase tracking-wide md:text-5xl">
            Coach&apos;s game-day rules
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-white/70">
            {COACH_RULES.format} • {COACH_RULES.division} • Field {COACH_RULES.field}. This is the
            slice of the rule book that actually changes what you call, how you line up, and how you
            manage 5- and 6-year-olds with an adult quarterback.
          </p>
        </div>
        <div className="flex items-center gap-2 rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-xs text-white/70">
          <BookOpen className="h-4 w-4 text-dragon-gold" />
          Source: 2026 DYF Flag Rules, 6v6 format
        </div>
      </header>

      <div className="mb-8 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
        {QUICK_CHART.map((row) => (
          <div key={row.label} className="rounded-xl border border-white/10 bg-black/35 px-3 py-2.5">
            <div className="text-[10px] font-bold uppercase tracking-wider text-white/45">{row.label}</div>
            <div className="text-sm font-semibold text-white">{row.value}</div>
          </div>
        ))}
      </div>

      <div className="space-y-6">
        {COACH_RULES.sections.map((section) => {
          const Icon = ICONS[section.icon] ?? BookOpen;
          return (
            <section
              key={section.id}
              className={`overflow-hidden rounded-2xl border ${
                section.highlight
                  ? "border-dragon-gold/40 bg-gradient-to-br from-dragon-gold/10 to-black/40"
                  : "border-white/10 bg-black/35"
              }`}
            >
              <header className="flex items-center gap-3 border-b border-white/10 px-4 py-3">
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-dragon-green/40 text-dragon-gold">
                  <Icon className="h-4 w-4" />
                </span>
                <h2 className="font-display text-2xl font-bold uppercase tracking-wide">{section.title}</h2>
              </header>
              <ul className="divide-y divide-white/5">
                {section.items.map((item) => (
                  <li key={item.rule} className="grid gap-2 px-4 py-3 md:grid-cols-[1.1fr_1.4fr]">
                    <p className="text-sm font-semibold text-white">{item.rule}</p>
                    <p className="text-sm text-white/65">{item.why}</p>
                  </li>
                ))}
              </ul>
            </section>
          );
        })}
      </div>
    </div>
  );
}
