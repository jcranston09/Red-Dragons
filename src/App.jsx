import { useRef, useState } from "react";
import { BookOpen, Check, CornerDownRight, Eraser, PanelRight, PenLine, Route, Trash2, Undo2, X } from "lucide-react";
import Field from "./components/Field.jsx";
import FieldStage from "./components/FieldStage.jsx";
import PlayerToken from "./components/PlayerToken.jsx";
import DrawingCanvas from "./components/DrawingCanvas.jsx";
import Sidebar from "./components/Sidebar.jsx";
import RulesTab from "./components/RulesTab.jsx";
import SuggestionsTab from "./components/SuggestionsTab.jsx";
import RoutePicker from "./components/RoutePicker.jsx";
import { usePlaybook } from "./PlaybookContext.jsx";
import { DRAW_TOOLS } from "./data/tools.js";

const TABS = [
  { id: "designer", label: "Play designer", icon: PenLine },
  { id: "rules", label: "Coach rules", icon: BookOpen },
  { id: "routes", label: "Routes", icon: Route },
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
      const start = prev.points.length <= 1 ? prev.points : prev.points.slice(0, -1);
      const next = { ...prev, points: [...start, point] };
      draftRef.current = next;
      return next;
    });
  }

  function onDrawCut() {
    setDraft((prev) => {
      if (!prev || prev.points.length < 2) return prev;
      const last = prev.points[prev.points.length - 1];
      const prior = prev.points[prev.points.length - 2];
      if (Math.hypot(last.x - prior.x, last.y - prior.y) < 1.2) return prev;
      const next = { ...prev, points: [...prev.points, { ...last }] };
      draftRef.current = next;
      return next;
    });
  }

  function clearDraft() {
    draftRef.current = null;
    setDraft(null);
    setDrawArmedId(null);
  }

  function onDrawRelease() {
    const current = draftRef.current;
    if (!current || current.points.length < 2) {
      clearDraft();
      return;
    }
    onDrawCut();
  }

  function finishDraft() {
    const current = draftRef.current;
    if (current && current.points.length >= 2) {
      pb.addPath(current.type, current.points, current.points[0]);
    }
    clearDraft();
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
                  onExtendMove={onDrawMove}
                  onExtendPlant={onDrawCut}
                />
                {pb.allTokens.map((player) => (
                  <PlayerToken
                    key={player.id}
                    player={player}
                    selected={pb.selectedPlayerId === player.id}
                    drawArmed={drawArmedId === player.id}
                    drawType={drawType}
                    suspendPointers={Boolean(draft)}
                    onMove={pb.moveToken}
                    onSelect={pb.setSelectedPlayerId}
                    onRemove={pb.removePlayer}
                    onDrawStart={onDrawStart}
                    onDrawMove={onDrawMove}
                    onDrawCut={onDrawCut}
                    onDrawEnd={onDrawRelease}
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
              {!draft && pb.selectedPlayerId ? (
                <RoutePicker
                  player={pb.allTokens.find((p) => p.id === pb.selectedPlayerId)}
                  onPick={(routeId) => pb.assignPlayerRoute(pb.selectedPlayerId, routeId)}
                />
              ) : null}
              {draft ? (
                <div className="pointer-events-auto mt-2 flex flex-wrap items-center gap-1.5 rounded-2xl bg-dragon-gold px-2.5 py-2 text-dragon-black shadow-lg">
                  <p className="mr-auto text-[11px] font-bold leading-tight">
                    Lift to plant a corner, then drag the next angle. Tap Done when the route is finished.
                  </p>
                  <button
                    type="button"
                    onClick={onDrawCut}
                    className="inline-flex items-center gap-1 rounded-full bg-black/15 px-2.5 py-1 text-[11px] font-black uppercase"
                  >
                    <CornerDownRight className="h-3 w-3" /> Cut
                  </button>
                  <button
                    type="button"
                    onClick={finishDraft}
                    className="inline-flex items-center gap-1 rounded-full bg-dragon-black px-2.5 py-1 text-[11px] font-black uppercase text-dragon-gold"
                  >
                    <Check className="h-3 w-3" /> Done
                  </button>
                  <button
                    type="button"
                    onClick={clearDraft}
                    className="inline-flex items-center gap-1 rounded-full bg-black/15 px-2.5 py-1 text-[11px] font-black uppercase"
                  >
                    <X className="h-3 w-3" /> Cancel
                  </button>
                </div>
              ) : null}
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
      {tab === "routes" ? (
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
