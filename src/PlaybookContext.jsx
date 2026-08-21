import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import {
  BALL_SPOTS,
  DEFENSE_POSITIONS,
  FORMATIONS,
  OFFENSE_POSITIONS,
  defaultDefense,
  defaultOffense,
  losYPct,
  nearestPlayer,
  pctToYards,
  uid,
} from "./utils/field.js";

const STORAGE_KEY = "red-dragons-k-playbook-v1";
const CURRENT_KEY = "red-dragons-k-current-v1";

const PlaybookContext = createContext(null);

function emptyPlay(name = "New Play") {
  return {
    name,
    losYard: 5,
    players: defaultOffense(5),
    paths: [],
    showDefense: false,
    defense: defaultDefense(5),
    selectedPathId: null,
    selectedPlayerId: null,
  };
}

function loadSaved() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function loadCurrent() {
  try {
    const raw = localStorage.getItem(CURRENT_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function PlaybookProvider({ children }) {
  const initial = loadCurrent();
  const [name, setName] = useState(initial?.name ?? "Spread — New Play");
  const [losYard, setLosYard] = useState(initial?.losYard ?? 5);
  const [players, setPlayers] = useState(initial?.players ?? defaultOffense(5));
  const [defense, setDefense] = useState(initial?.defense ?? defaultDefense(5));
  const [showDefense, setShowDefense] = useState(initial?.showDefense ?? false);
  const [paths, setPaths] = useState(initial?.paths ?? []);
  const [tool, setTool] = useState("select");
  const [selectedPathId, setSelectedPathId] = useState(null);
  const [selectedPlayerId, setSelectedPlayerId] = useState(null);
  const [savedPlays, setSavedPlays] = useState(loadSaved);
  const [activeSavedId, setActiveSavedId] = useState(initial?.activeSavedId ?? null);
  const [toast, setToast] = useState(null);

  const flash = useCallback((message, tone = "ok") => {
    setToast({ message, tone, id: uid("toast") });
  }, []);

  useEffect(() => {
    if (!toast) return undefined;
    const t = setTimeout(() => setToast(null), 2400);
    return () => clearTimeout(t);
  }, [toast]);

  useEffect(() => {
    const snapshot = {
      name,
      losYard,
      players,
      defense,
      showDefense,
      paths,
      activeSavedId,
    };
    localStorage.setItem(CURRENT_KEY, JSON.stringify(snapshot));
  }, [name, losYard, players, defense, showDefense, paths, activeSavedId]);

  const persistSaved = useCallback((next) => {
    setSavedPlays(next);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  }, []);

  const allTokens = useMemo(
    () => (showDefense ? [...players, ...defense] : players),
    [players, defense, showDefense],
  );

  const moveToken = useCallback((id, x, y) => {
    const clamp = (v) => Math.min(98, Math.max(2, v));
    const nx = clamp(x);
    const ny = clamp(y);
    setPlayers((prev) => prev.map((p) => (p.id === id ? { ...p, x: nx, y: ny } : p)));
    setDefense((prev) => prev.map((p) => (p.id === id ? { ...p, x: nx, y: ny } : p)));
  }, []);

  const addPath = useCallback((type, points, startPoint) => {
    if (!points || points.length < 2) return;
    const anchor = nearestPlayer(startPoint ?? points[0], allTokens, 8);
    const next = {
      id: uid("path"),
      type,
      playerId: anchor?.id ?? null,
      points,
    };
    setPaths((prev) => [...prev, next]);
    setSelectedPathId(next.id);
  }, [allTokens]);

  const undoPath = useCallback(() => {
    setPaths((prev) => prev.slice(0, -1));
    setSelectedPathId(null);
  }, []);

  const clearPaths = useCallback(() => {
    setPaths([]);
    setSelectedPathId(null);
  }, []);

  const deleteSelectedPath = useCallback(() => {
    if (!selectedPathId) {
      undoPath();
      return;
    }
    setPaths((prev) => prev.filter((p) => p.id !== selectedPathId));
    setSelectedPathId(null);
  }, [selectedPathId, undoPath]);

  const resetPlay = useCallback(() => {
    const next = emptyPlay(name || "New Play");
    setLosYard(5);
    setPlayers(defaultOffense(5));
    setDefense(defaultDefense(5));
    setPaths([]);
    setSelectedPathId(null);
    setSelectedPlayerId(null);
    setActiveSavedId(null);
    flash("Reset to standard spread formation");
    return next;
  }, [name, flash]);

  const applyFormation = useCallback(
    (formationId) => {
      const f = FORMATIONS[formationId];
      if (!f) return;
      setPlayers(f.players(losYard));
      setDefense(defaultDefense(losYard));
      setPaths([]);
      setSelectedPathId(null);
      flash(`Lined up in ${f.name}`);
    },
    [losYard, flash],
  );

  const applyBallSpot = useCallback(
    (yard) => {
      setLosYard(yard);
      setPlayers(defaultOffense(yard));
      setDefense(defaultDefense(yard));
      setPaths([]);
      flash(`Ball spotted at the ${yard === 21.5 ? "midfield" : `${yard}-yard`} line`);
    },
    [flash],
  );

  const savePlay = useCallback(() => {
    const playName = name.trim() || "Untitled Play";
    const record = {
      id: activeSavedId ?? uid("play"),
      name: playName,
      savedAt: new Date().toISOString(),
      losYard,
      players,
      defense,
      showDefense,
      paths,
    };
    const next = activeSavedId
      ? savedPlays.map((p) => (p.id === activeSavedId ? record : p))
      : [record, ...savedPlays];
    persistSaved(next);
    setActiveSavedId(record.id);
    setName(playName);
    flash(activeSavedId ? "Play updated" : "Play saved to this device");
  }, [
    name,
    activeSavedId,
    losYard,
    players,
    defense,
    showDefense,
    paths,
    savedPlays,
    persistSaved,
    flash,
  ]);

  const loadPlay = useCallback(
    (id) => {
      const record = savedPlays.find((p) => p.id === id);
      if (!record) return;
      setName(record.name);
      setLosYard(record.losYard ?? 5);
      setPlayers(record.players);
      setDefense(record.defense ?? defaultDefense(record.losYard ?? 5));
      setShowDefense(Boolean(record.showDefense));
      setPaths(record.paths ?? []);
      setActiveSavedId(record.id);
      setSelectedPathId(null);
      flash(`Loaded “${record.name}”`);
    },
    [savedPlays, flash],
  );

  const loadExternalPlay = useCallback(
    (state) => {
      setName(state.name);
      setLosYard(state.losYard ?? 5);
      setPlayers(state.players);
      setDefense(state.defense ?? defaultDefense(state.losYard ?? 5));
      setShowDefense(Boolean(state.showDefense));
      setPaths(state.paths ?? []);
      setActiveSavedId(null);
      setSelectedPathId(null);
      setTool("select");
      flash(`Opened “${state.name}” in the designer`);
    },
    [flash],
  );

  const deleteSaved = useCallback(
    (id) => {
      const next = savedPlays.filter((p) => p.id !== id);
      persistSaved(next);
      if (activeSavedId === id) setActiveSavedId(null);
      flash("Play deleted");
    },
    [savedPlays, persistSaved, activeSavedId, flash],
  );

  const addPlayer = useCallback(
    (spec) => {
      const team = spec.team;
      const list = team === "defense" ? defense : players;
      if (list.length >= 6) {
        flash("6v6 — already 6 players on that side. Remove one first.", "warn");
        return;
      }
      if (list.some((p) => p.position === spec.position)) {
        flash(`${spec.label} is already on the field`, "warn");
        return;
      }
      const spawn = { ...spec, id: uid(team === "defense" ? "def" : "off"), x: 50, y: 78 };
      if (team === "defense") setDefense((prev) => [...prev, spawn]);
      else setPlayers((prev) => [...prev, spawn]);
      setSelectedPlayerId(spawn.id);
    },
    [players, defense, flash],
  );

  const removePlayer = useCallback(
    (id) => {
      setPlayers((prev) => prev.filter((p) => p.id !== id));
      setDefense((prev) => prev.filter((p) => p.id !== id));
      setPaths((prev) => prev.filter((p) => p.playerId !== id));
      if (selectedPlayerId === id) setSelectedPlayerId(null);
    },
    [selectedPlayerId],
  );

  const validations = useMemo(() => {
    const notes = [];
    const offense = players.filter((p) => p.team === "offense");
    const losY = losYPct(losYard);
    const onLos = offense.filter((p) => Math.abs(p.y - losY) < 1.4);
    if (onLos.length < 3) {
      notes.push({
        tone: "warn",
        text: `Illegal formation risk: ${onLos.length} on the LOS (need 3; Center counts).`,
      });
    }
    const qb = offense.find((p) => p.position === "QB");
    const c = offense.find((p) => p.position === "C");
    if (qb && c) {
      const qbYds = pctToYards(qb.x, qb.y);
      const cYds = pctToYards(c.x, c.y);
      const dx = Math.abs(qbYds.xYard - cYds.xYard);
      const dy = Math.abs(qbYds.yardFromOwnGoal - (losYard - 1));
      if (dx > 1.25 || dy > 1.25) {
        notes.push({
          tone: "warn",
          text: "Coach QB is outside the 1×1 pocket (Kinder rule).",
        });
      }
    }
    const motions = paths.filter((p) => p.type === "motion");
    if (motions.length > 1) {
      notes.push({
        tone: "warn",
        text: "Only one player may be in motion. Extra motion paths will draw a flag.",
      });
    }
    const centerHandoff = paths.some((p) => {
      const pl = offense.find((x) => x.id === p.playerId);
      return pl?.position === "C" && (p.type === "run" || p.type === "motion");
    });
    if (centerHandoff) {
      notes.push({
        tone: "warn",
        text: "Center cannot take a handoff from the QB.",
      });
    }
    if (offense.length !== 6) {
      notes.push({
        tone: "warn",
        text: `Offense has ${offense.length} players (need 6, including Coach QB).`,
      });
    }
    if (notes.length === 0) {
      notes.push({ tone: "ok", text: "Look is legal for DYF Kindergarten 6v6." });
    }
    return notes;
  }, [players, paths, losYard]);

  const value = {
    name,
    setName,
    losYard,
    players,
    defense,
    showDefense,
    setShowDefense,
    paths,
    tool,
    setTool,
    selectedPathId,
    setSelectedPathId,
    selectedPlayerId,
    setSelectedPlayerId,
    savedPlays,
    activeSavedId,
    toast,
    allTokens,
    moveToken,
    addPath,
    undoPath,
    clearPaths,
    deleteSelectedPath,
    resetPlay,
    applyFormation,
    applyBallSpot,
    savePlay,
    loadPlay,
    loadExternalPlay,
    deleteSaved,
    addPlayer,
    removePlayer,
    validations,
    formations: FORMATIONS,
    ballSpots: BALL_SPOTS,
    offensePalette: OFFENSE_POSITIONS,
    defensePalette: DEFENSE_POSITIONS,
  };

  return <PlaybookContext.Provider value={value}>{children}</PlaybookContext.Provider>;
}

export function usePlaybook() {
  const ctx = useContext(PlaybookContext);
  if (!ctx) throw new Error("usePlaybook must be used inside PlaybookProvider");
  return ctx;
}
