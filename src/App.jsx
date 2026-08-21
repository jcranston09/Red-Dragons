import { useRef, useState } from "react";
import { BookOpen, Lightbulb, PenLine } from "lucide-react";
import Field from "./components/Field.jsx";
import PlayerToken from "./components/PlayerToken.jsx";
import DrawingCanvas from "./components/DrawingCanvas.jsx";
import Sidebar from "./components/Sidebar.jsx";
import RulesTab from "./components/RulesTab.jsx";
import SuggestionsTab from "./components/SuggestionsTab.jsx";
import { usePlaybook } from "./PlaybookContext.jsx";

const TABS = [
  { id: "designer", label: "Play designer", icon: PenLine },
  { id: "rules", label: "Coach rules", icon: BookOpen },
  { id: "plays", label: "Suggested plays", icon: Lightbulb },
];

export default function App() {
  const [tab, setTab] = useState("designer");
  const fieldRef = useRef(null);
  const pb = usePlaybook();

  return (
    <div className="min-h-dvh bg-dragon-black text-white">
      <header className="sticky top-0 z-40 border-b border-white/10 bg-dragon-black/90 backdrop-blur">
        <div className="mx-auto flex max-w-[1600px] items-center gap-3 px-3 py-2.5 md:px-5">
          <img
            src="./logo.png"
            alt="Carroll Southlake Red Dragons"
            className="h-11 w-11 rounded-full object-cover ring-2 ring-dragon-gold/80"
          />
          <div className="min-w-0 flex-1">
            <h1 className="font-display text-xl font-extrabold uppercase leading-none tracking-wide md:text-2xl">
              Red Dragons Playbook
            </h1>
            <p className="truncate text-[11px] text-white/60">
              DYF Kindergarten • 6v6 Flag • Coach QB • Unlimited runs
            </p>
          </div>
          <nav className="flex gap-1 rounded-full bg-white/5 p-1">
            {TABS.map((t) => {
              const Icon = t.icon;
              const on = tab === t.id;
              return (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setTab(t.id)}
                  className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold uppercase tracking-wide transition ${
                    on ? "bg-dragon-gold text-dragon-black" : "text-white/70 hover:text-white"
                  }`}
                >
                  <Icon className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">{t.label}</span>
                </button>
              );
            })}
          </nav>
        </div>
      </header>

      {tab === "designer" ? (
        <main className="mx-auto grid max-w-[1600px] grid-cols-1 lg:grid-cols-[minmax(0,1fr)_22rem]">
          <section className="px-3 py-4 md:px-5">
            <Field fieldRef={fieldRef} losYard={pb.losYard}>
              <DrawingCanvas
                paths={pb.paths}
                tool={pb.tool}
                selectedPathId={pb.selectedPathId}
                onComplete={pb.addPath}
                onSelectPath={pb.setSelectedPathId}
              />
              {pb.allTokens.map((player) => (
                <PlayerToken
                  key={player.id}
                  player={player}
                  selected={pb.selectedPlayerId === player.id}
                  tool={pb.tool}
                  onMove={pb.moveToken}
                  onSelect={pb.setSelectedPlayerId}
                  onRemove={pb.removePlayer}
                />
              ))}
            </Field>
          </section>
          <Sidebar />
        </main>
      ) : null}

      {tab === "rules" ? <RulesTab /> : null}
      {tab === "plays" ? <SuggestionsTab onOpenDesigner={() => setTab("designer")} /> : null}

      {pb.toast ? (
        <div
          className={`fixed bottom-4 right-4 z-50 rounded-xl px-4 py-2 text-sm font-semibold shadow-lg ${
            pb.toast.tone === "warn" ? "bg-amber-400 text-black" : "bg-dragon-gold text-dragon-black"
          }`}
        >
          {pb.toast.message}
        </div>
      ) : null}
    </div>
  );
}
