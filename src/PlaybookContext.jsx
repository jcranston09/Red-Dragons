import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import {
  BALL_SPOTS,
  DEFENSE_POSITIONS,
  OFFENSE_POSITIONS,
  STOCK_FORMATIONS,
  alignmentFromPlayers,
  defaultDefense,
  defaultOffense,
  losYPct,
  nearestPlayer,
  pctToYards,
  playersFromAlignment,
  shiftPathsByYards,
  shiftPlayersByYards,
  uid,
} from "./utils/field.js";
import { straightenPath } from "./utils/path.js";
import { applyRouteToPlayer, playerCanTakeRoute, routeById } from "./data/routeTree.js";

const STORAGE_KEY = "red-dragons-k-playbook-v1";
const CURRENT_KEY = "red-dragons-k-current-v1";
const FORMATIONS_KEY = "red-dragons-k-formations-v1";

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

function loadCustomFormations() {
  try {
    const raw = localStorage.getItem(FORMATIONS_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed)
      ? parsed.filter((f) => f?.id && f?.name && Array.isArray(f.alignment))
      : [];
  } catch {
    return [];
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
  const [tool, setTool] = useState("route");
  const [selectedPathId, setSelectedPathId] = useState(null);
  const [selectedPlayerId, setSelectedPlayerId] = useState(null);
  const [savedPlays, setSavedPlays] = useState(loadSaved);
  const [activeSavedId, setActiveSavedId] = useState(initial?.activeSavedId ?? null);
  const [customFormations, setCustomFormations] = useState(loadCustomFormations);
  const [activeFormationId, setActiveFormationId] = useState(initial?.activeFormationId ?? "spread");
  const [lineupRev, setLineupRev] = useState(0);
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
      activeFormationId,
    };
    localStorage.setItem(CURRENT_KEY, JSON.stringify(snapshot));
  }, [name, losYard, players, defense, showDefense, paths, activeSavedId, activeFormationId]);

  const persistSaved = useCallback((next) => {
    setSavedPlays(next);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  }, []);

  const persistCustomFormations = useCallback((next) => {
    setCustomFormations(next);
    localStorage.setItem(FORMATIONS_KEY, JSON.stringify(next));
  }, []);

  const allFormations = useMemo(
    () => [...STOCK_FORMATIONS, ...customFormations],
    [customFormations],
  );

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

  const assignPlayerRoute = useCallback(
    (playerId, routeId) => {
      const player = players.find((p) => p.id === playerId);
      const route = routeById(routeId);
      if (!player || !route) return;
      if (!playerCanTakeRoute(player)) {
        flash("Tap a kid to give them a route — Coach QB is not eligible.", "warn");
        return;
      }
      const points = applyRouteToPlayer(player, route);
      if (points.length < 2) return;
      const next = {
        id: uid("path"),
        type: route.type === "run" ? "run" : "route",
        playerId,
        routeId: route.id,
        points,
      };
      setPaths((prev) => [...prev.filter((p) => p.playerId !== playerId), next]);
      setSelectedPathId(next.id);
      flash(`${route.name} added for ${player.label}`);
    },
    [players, flash],
  );

  const addPath = useCallback((type, points, startPoint) => {
    if (!points || points.length < 2) return;
    const straight = straightenPath(points);
    if (straight.length < 2) return;
    const anchor = nearestPlayer(startPoint ?? straight[0], allTokens, 8);
    const next = {
      id: uid("path"),
      type,
      playerId: anchor?.id ?? null,
      points: straight,
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
    setActiveFormationId("spread");
    setLineupRev((n) => n + 1);
    flash("Reset to standard spread formation");
    return next;
  }, [name, flash]);

  const applyFormation = useCallback(
    (formationId) => {
      const f = allFormations.find((item) => item.id === formationId);
      if (!f) {
        flash("Could not find that formation", "warn");
        return;
      }
      const nextPlayers = playersFromAlignment(f.alignment, losYard);
      if (!nextPlayers.length) {
        flash("That formation has no players to line up", "warn");
        return;
      }
      setPlayers(nextPlayers);
      setDefense(defaultDefense(losYard));
      setPaths([]);
      setSelectedPathId(null);
      setSelectedPlayerId(null);
      setActiveFormationId(f.id);
      setLineupRev((n) => n + 1);
      flash(`Lined up in ${f.name}`);
    },
    [allFormations, losYard, flash],
  );

  const saveFormation = useCallback(
    (rawName) => {
      const playName = String(rawName ?? "").trim();
      if (!playName) {
        flash("Name the formation first", "warn");
        return false;
      }
      if (!players.length) {
        flash("Put players on the field before saving a formation", "warn");
        return false;
      }
      const stockHit = STOCK_FORMATIONS.find(
        (f) => f.name.toLowerCase() === playName.toLowerCase(),
      );
      if (stockHit) {
        flash("That name is a built-in formation. Pick a different name.", "warn");
        return false;
      }
      const alignment = alignmentFromPlayers(players, losYard);
      const existing = customFormations.find(
        (f) => f.name.toLowerCase() === playName.toLowerCase(),
      );
      const record = {
        id: existing?.id ?? uid("formation"),
        name: playName,
        blurb: "Custom look saved from the field",
        builtin: false,
        alignment,
        savedAt: new Date().toISOString(),
      };
      const next = existing
        ? customFormations.map((f) => (f.id === existing.id ? record : f))
        : [...customFormations, record];
      persistCustomFormations(next);
      setActiveFormationId(record.id);
      flash(existing ? `Updated formation “${playName}”` : `Saved formation “${playName}”`);
      return true;
    },
    [players, losYard, customFormations, persistCustomFormations, flash],
  );

  const deleteFormation = useCallback(
    (id) => {
      const target = customFormations.find((f) => f.id === id);
      if (!target) return;
      persistCustomFormations(customFormations.filter((f) => f.id !== id));
      if (activeFormationId === id) setActiveFormationId(null);
      flash(`Deleted formation “${target.name}”`);
    },
    [customFormations, persistCustomFormations, activeFormationId, flash],
  );

  const applyBallSpot = useCallback(
    (yard) => {
      const nextYard = Number(yard);
      if (Number.isNaN(nextYard)) return;
      const delta = nextYard - losYard;
      setLosYard(nextYard);
      if (delta !== 0) {
        setPlayers((prev) => shiftPlayersByYards(prev, delta));
        setPaths((prev) => shiftPathsByYards(prev, delta));
        setLineupRev((n) => n + 1);
      }
      setDefense(defaultDefense(nextYard));
      const label =
        nextYard === 21.5 ? "midfield" : `${nextYard}-yard`;
      flash(`Ball spotted at the ${label} line`);
    },
    [losYard, flash],
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
      setActiveFormationId(null);
      setLineupRev((n) => n + 1);
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
      setActiveFormationId(null);
      setLineupRev((n) => n + 1);
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
    lineupRev,
    moveToken,
    assignPlayerRoute,
    addPath,
    undoPath,
    clearPaths,
    deleteSelectedPath,
    resetPlay,
    applyFormation,
    saveFormation,
    deleteFormation,
    applyBallSpot,
    savePlay,
    loadPlay,
    loadExternalPlay,
    deleteSaved,
    addPlayer,
    removePlayer,
    validations,
    formations: allFormations,
    activeFormationId,
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
