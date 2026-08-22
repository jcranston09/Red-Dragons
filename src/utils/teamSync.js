/** Shared Red Dragons Kinder playbook — last write wins per id, with delete tombstones. */

export function emptyTeamDoc() {
  return {
    v: 1,
    updatedAt: null,
    plays: [],
    formations: [],
    deleted: { plays: {}, formations: {} },
  };
}

export function normalizeTeamDoc(raw) {
  const doc = emptyTeamDoc();
  if (!raw || typeof raw !== "object") return doc;
  doc.updatedAt = typeof raw.updatedAt === "string" ? raw.updatedAt : null;
  doc.plays = Array.isArray(raw.plays) ? raw.plays.filter((p) => p?.id) : [];
  doc.formations = Array.isArray(raw.formations)
    ? raw.formations.filter((f) => f?.id && f?.name && Array.isArray(f.alignment))
    : [];
  doc.deleted = {
    plays: { ...(raw.deleted?.plays ?? {}) },
    formations: { ...(raw.deleted?.formations ?? {}) },
  };
  return doc;
}

function stamp(value) {
  const t = Date.parse(value ?? "");
  return Number.isNaN(t) ? 0 : t;
}

function newer(a, b) {
  return stamp(a) >= stamp(b);
}

function mergeDeleted(local = {}, remote = {}) {
  const out = { ...local };
  for (const [id, ts] of Object.entries(remote)) {
    if (!out[id] || newer(ts, out[id])) out[id] = ts;
  }
  return out;
}

function mergeRecords(local, remote, deletedMap) {
  const map = new Map();
  for (const item of [...remote, ...local]) {
    if (!item?.id) continue;
    const tomb = deletedMap[item.id];
    if (tomb && newer(tomb, item.savedAt)) continue;
    const prev = map.get(item.id);
    if (!prev || newer(item.savedAt, prev.savedAt)) map.set(item.id, item);
  }
  return [...map.values()].sort((a, b) => stamp(b.savedAt) - stamp(a.savedAt));
}

function collapseFormationsByName(list) {
  const byName = new Map();
  for (const item of list) {
    const key = String(item.name ?? "").trim().toLowerCase();
    if (!key) continue;
    const prev = byName.get(key);
    if (!prev || newer(item.savedAt, prev.savedAt)) byName.set(key, item);
  }
  return [...byName.values()].sort((a, b) => stamp(b.savedAt) - stamp(a.savedAt));
}

export function mergeTeamDocs(localRaw, remoteRaw) {
  const local = normalizeTeamDoc(localRaw);
  const remote = normalizeTeamDoc(remoteRaw);
  const deleted = {
    plays: mergeDeleted(local.deleted.plays, remote.deleted.plays),
    formations: mergeDeleted(local.deleted.formations, remote.deleted.formations),
  };
  return {
    v: 1,
    updatedAt: newer(local.updatedAt, remote.updatedAt) ? local.updatedAt : remote.updatedAt,
    plays: mergeRecords(local.plays, remote.plays, deleted.plays),
    formations: collapseFormationsByName(
      mergeRecords(local.formations, remote.formations, deleted.formations),
    ),
    deleted,
  };
}

export function teamDocFingerprint(doc) {
  const n = normalizeTeamDoc(doc);
  const plays = n.plays.map((p) => `${p.id}:${p.savedAt ?? ""}`).sort();
  const formations = n.formations.map((f) => `${f.id}:${f.savedAt ?? ""}`).sort();
  return JSON.stringify({ plays, formations, deleted: n.deleted });
}

export function markDeleted(deleted, kind, id) {
  return {
    plays: { ...(deleted?.plays ?? {}) },
    formations: { ...(deleted?.formations ?? {}) },
    [kind]: {
      ...(deleted?.[kind] ?? {}),
      [id]: new Date().toISOString(),
    },
  };
}
