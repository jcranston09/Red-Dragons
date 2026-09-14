import { useState } from "react";
import { Check, Plus } from "lucide-react";
import DrillDiagram from "./DrillDiagram.jsx";
import { CATEGORIES, DRILL_BANK, drillsInCategory, stationDrills } from "./drillBank.js";
import { newSlotId } from "./schedule.js";

export default function DrillBankPage({ slots, onSlots, coachId }) {
  const [cat, setCat] = useState("all");
  const [picked, setPicked] = useState(null);
  const list = drillsInCategory(cat);

  function addTogether(drillId) {
    onSlots((prev) => [...prev, { id: newSlotId(), type: "together", minutes: 10, drillId }]);
    setPicked(drillId);
  }

  function addStation(drillId, side) {
    const other = stationDrills().find((d) => d.id !== drillId)?.id ?? drillId;
    const jack = side === "jack" ? drillId : other;
    const sara = side === "sara" ? drillId : other;
    onSlots((prev) => [
      ...prev,
      { id: newSlotId(), type: "split", minutes: 10, jack, sara, phase: "run" },
      { id: newSlotId(), type: "split", minutes: 10, jack, sara, phase: "switch" },
    ]);
    setPicked(drillId);
  }

  function putOnExisting(slotId, drillId, side) {
    onSlots((prev) =>
      prev.map((s) => {
        if (s.id !== slotId) return s;
        if (s.type === "together") return { ...s, drillId };
        if (side === "sara") return { ...s, sara: drillId };
        return { ...s, jack: drillId };
      }),
    );
    setPicked(drillId);
  }

  return (
    <div className="space-y-4">
      <div>
        <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-dragon-gold">Drill bank</p>
        <h2 className="font-display text-3xl font-extrabold uppercase">Pick tonight’s work</h2>
        <p className="mt-1 max-w-2xl text-sm text-white/65">
          3rd & 4th grade girls stations: ground balls, passing, shooting, dodges, and small games. Put a drill on Jack’s
          track, Sara’s track, or the full-group clock.
        </p>
      </div>

      <div className="flex flex-wrap gap-1.5">
        <CatChip on={cat === "all"} onClick={() => setCat("all")} label="All" />
        {CATEGORIES.map((c) => (
          <CatChip key={c.id} on={cat === c.id} onClick={() => setCat(c.id)} label={c.label} />
        ))}
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {list.map((d) => (
          <article key={d.id} className="overflow-hidden rounded-3xl border border-white/10 bg-white/[0.03]">
            <div className="h-32">
              <DrillDiagram diagram={d.diagram} compact />
            </div>
            <div className="space-y-2 p-3">
              <p className="text-[10px] font-bold uppercase tracking-wide text-dragon-gold">{d.category}</p>
              <h3 className="font-display text-xl font-extrabold uppercase leading-none">{d.name}</h3>
              <p className="text-xs text-white/60">{d.say}</p>
              {d.station ? (
                <div className="flex flex-wrap gap-1.5">
                  {(coachId === "jack" ? ["jack", "sara"] : ["sara", "jack"]).map((side) => (
                    <MiniBtn
                      key={side}
                      onClick={() => addStation(d.id, side)}
                      label={`${side === "sara" ? "Sara" : "Jack"} + 10 min`}
                    />
                  ))}
                </div>
              ) : (
                <MiniBtn onClick={() => addTogether(d.id)} label="Add to full group" />
              )}
              {slots.length ? (
                <label className="block text-[10px] font-bold uppercase tracking-wide text-white/40">
                  Or drop onto a slot
                  <select
                    className="mt-1 w-full rounded-xl border border-white/10 bg-black/40 px-2 py-1.5 text-xs text-white"
                    defaultValue=""
                    onChange={(e) => {
                      const [slotId, side] = e.target.value.split(":");
                      if (slotId) putOnExisting(slotId, d.id, side);
                      e.target.value = "";
                    }}
                  >
                    <option value="">Choose a slot…</option>
                    {slots.map((s, i) =>
                      s.type === "together" ? (
                        <option key={s.id} value={`${s.id}:both`}>
                          {i + 1}. Full group
                        </option>
                      ) : (
                        [
                          <option key={`${s.id}-s`} value={`${s.id}:sara`}>
                            {i + 1}. Sara’s station
                          </option>,
                          <option key={`${s.id}-j`} value={`${s.id}:jack`}>
                            {i + 1}. Jack’s station
                          </option>,
                        ]
                      ),
                    )}
                  </select>
                </label>
              ) : null}
              {picked === d.id ? (
                <p className="inline-flex items-center gap-1 text-[11px] font-bold text-dragon-gold">
                  <Check className="h-3.5 w-3.5" /> On the plan
                </p>
              ) : null}
            </div>
          </article>
        ))}
      </div>
      <p className="text-[11px] text-white/40">{DRILL_BANK.length} drills in the bank. Station adds include a 10-min switch block so the other group gets the same work.</p>
    </div>
  );
}

function CatChip({ on, onClick, label }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full px-3 py-1.5 text-[11px] font-bold uppercase tracking-wide ${
        on ? "bg-dragon-gold text-dragon-black" : "bg-white/10 text-white/70"
      }`}
    >
      {label}
    </button>
  );
}

function MiniBtn({ onClick, label }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex items-center gap-1 rounded-full bg-white/10 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide hover:bg-white/20"
    >
      <Plus className="h-3 w-3" />
      {label}
    </button>
  );
}
