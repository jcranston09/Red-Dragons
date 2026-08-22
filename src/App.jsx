import { useRef, useState } from "react";
import { BookOpen, Eraser, Lightbulb, PanelRight, PenLine, Trash2, Undo2 } from "lucide-react";
import Field from "./components/Field.jsx";
import FieldStage from "./components/FieldStage.jsx";
import PlayerToken from "./components/PlayerToken.jsx";
import DrawingCanvas from "./components/DrawingCanvas.jsx";
import Sidebar from "./components/Sidebar.jsx";
import RulesTab from "./components/RulesTab.jsx";
import SuggestionsTab from "./components/SuggestionsTab.jsx";
import { usePlaybook } from "./PlaybookContext.jsx";
import { DRAW_TOOLS } from "./data/tools.js";

const TABS = [
  { id: "designer", label: "Play designer", icon: PenLine },
  { id: "rules", label: "Coach rules", icon: BookOpen },
  { id: "plays", label: "Suggested plays", icon: Lightbulb },
];

export default function App() {
  const [tab, setTab] = useState("designer");
  const [draft, setDraft] = useState(null);
  const [drawArmedId, setDrawArmedId] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const fieldRef = useRef(null);
  const draftRef = useRef(null);
  const pb = usePlaybook();
  const drawType = DRAW_TOOLS.some((t) => t.id === pb.tool) ? pb.tool : "route";

  function onDrawStart(player, point) {
    const next = { type: drawType, playerId: player.id, points: [point] };
    draftRef.current = next;
    setDraft(next);
    setDrawArmedId(player.id);
  }

  function onDrawMove(point) {
    setDraft((prev) => {
      if (!prev) return prev;
      const last = prev.points[prev.points.length - 1];
      if (Math.hypot(point.x - last.x, point.y - last.y) < 0.4) return prev;
      const next = { ...prev, points: [...prev.points, point] };
      draftRef.current = next;
      return next;
    });
  }

  function onDrawEnd() {
    const current = draftRef.current;
    if (current && current.points.length >= 2) {
      pb.addPath(current.type, current.points, current.points[0]);
    }
    draftRef.current = null;
    setDraft(null);
    setDrawArmedId(null);
  }

  return (
    <div className="flex h-dvh min-h-0 flex-col overflow-hidden bg-dragon-black text-white">
      <header className="safe-header sticky top-0 z-40 shrink-0 border-b border-white/10 bg-dragon-black/90 backdrop-blur">
        <div className="mx-auto flex max-w-[1600px] items-center gap-2 px-3 py-2 md:px-5 landscape:py-1">
          <img
            src="./logo.png"
            alt="Carroll Southlake Red Dragons"
            className="h-10 w-10 rounded-full object-cover ring-2 ring-dragon-gold/80 landscape:h-8 landscape:w-8"
          />
          <div className="min-w-0 flex-1">
            <h1 className="font-display text-lg font-extrabold uppercase leading-none tracking-wide md:text-2xl landscape:text-base">
              Red Dragons Playbook
            </h1>
            <p className="truncate text-[11px] text-white/60 landscape:hidden">
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
                  className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1.5 text-xs font-bold uppercase tracking-wide transition landscape:px-2 landscape:py-1 ${
                    on ? "bg-dragon-gold text-dragon-black" : "text-white/70 hover:text-white"
                  }`}
                >
                  <Icon className="h-3.5 w-3.5" />
                  <span className="hidden md:inline">{t.label}</span>
                </button>
              );
            })}
          </nav>
        </div>
      </header>

      {tab === "designer" ? (
        <main className="relative mx-auto flex min-h-0 w-full flex-1">
          <div className="relative min-h-0 min-w-0 flex-1">
            <FieldStage fieldRef={fieldRef} losYard={pb.losYard}>
              <Field fieldRef={fieldRef} losYard={pb.losYard}>
                <DrawingCanvas
                  paths={pb.paths}
                  draft={draft}
                  selectedPathId={pb.selectedPathId}
                  onSelectPath={pb.setSelectedPathId}
                />
                {pb.allTokens.map((player) => (
                  <PlayerToken
                    key={player.id}
                    player={player}
                    selected={pb.selectedPlayerId === player.id}
                    drawArmed={drawArmedId === player.id}
                    drawType={drawType}
                    onMove={pb.moveToken}
                    onSelect={pb.setSelectedPlayerId}
                    onRemove={pb.removePlayer}
                    onDrawStart={onDrawStart}
                    onDrawMove={onDrawMove}
                    onDrawEnd={onDrawEnd}
                  />
                ))}
              </Field>
            </FieldStage>
            <div className="pointer-events-none absolute inset-x-0 top-0 z-30 p-2 pl-[max(0.5rem,env(safe-area-inset-left))] pr-[max(0.5rem,env(safe-area-inset-right))]">
              <div className="pointer-events-auto flex flex-wrap items-center gap-1 rounded-2xl bg-dragon-black/80 p-1.5 shadow-lg backdrop-blur-sm">
                {DRAW_TOOLS.map((t) => {
                  const Icon = t.icon;
                  const on = drawType === t.id;
                  return (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => pb.setTool(t.id)}
                      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide ${
                        on
                          ? "bg-dragon-gold text-dragon-black"
                          : "bg-white/10 text-white/80"
                      }`}
                    >
                      <Icon className="h-3 w-3" />
                      {t.label}
                    </button>
                  );
                })}
                <button
                  type="button"
                  onClick={pb.undoPath}
                  className="inline-flex items-center gap-1 rounded-full bg-white/10 px-2 py-1 text-[11px] font-semibold uppercase"
                >
                  <Undo2 className="h-3 w-3" /> Undo
                </button>
                <button
                  type="button"
                  onClick={pb.deleteSelectedPath}
                  className="inline-flex items-center gap-1 rounded-full bg-white/10 px-2 py-1 text-[11px] font-semibold uppercase"
                >
                  <Eraser className="h-3 w-3" /> Erase
                </button>
                <button
                  type="button"
                  onClick={pb.clearPaths}
                  className="inline-flex items-center gap-1 rounded-full bg-red-950/70 px-2 py-1 text-[11px] font-semibold uppercase text-red-100"
                >
                  <Trash2 className="h-3 w-3" /> Clear
                </button>
                <button
                  type="button"
                  onClick={() => setMenuOpen(true)}
                  className="ml-auto inline-flex items-center gap-1 rounded-full bg-dragon-gold px-2.5 py-1 text-[11px] font-bold uppercase text-dragon-black xl:hidden"
                >
                  <PanelRight className="h-3 w-3" /> Menu
                </button>
              </div>
            </div>
          </div>
          <div className="hidden h-full w-[22rem] shrink-0 border-l border-white/10 bg-dragon-black xl:block">
            <Sidebar />
          </div>
          {menuOpen ? (
            <div className="absolute inset-0 z-40 xl:hidden">
              <button
                type="button"
                className="absolute inset-0 bg-black/55"
                aria-label="Close play menu"
                onClick={() => setMenuOpen(false)}
              />
              <div className="absolute inset-y-0 right-0 w-[min(22rem,92vw)] bg-dragon-black shadow-2xl">
                <Sidebar onClose={() => setMenuOpen(false)} />
              </div>
            </div>
          ) : null}
        </main>
      ) : null}

      {tab === "rules" ? (
        <div className="min-h-0 flex-1 overflow-auto">
          <RulesTab />
        </div>
      ) : null}
      {tab === "plays" ? (
        <div className="min-h-0 flex-1 overflow-auto">
          <SuggestionsTab onOpenDesigner={() => setTab("designer")} />
        </div>
      ) : null}

      {pb.toast ? (
        <div
          className={`safe-toast fixed z-50 rounded-xl px-4 py-2 text-sm font-semibold shadow-lg ${
            pb.toast.tone === "warn" ? "bg-amber-400 text-black" : "bg-dragon-gold text-dragon-black"
          }`}
        >
          {pb.toast.message}
        </div>
      ) : null}
    </div>
  );
}
