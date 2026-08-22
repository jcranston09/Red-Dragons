import { Route } from "lucide-react";
import { ROUTE_TREE, playerCanTakeRoute } from "../data/routeTree.js";

export default function RoutePicker({ player, onPick }) {
  if (!player) return null;

  if (!playerCanTakeRoute(player)) {
    return (
      <div className="pointer-events-auto mt-2 rounded-2xl bg-dragon-black/80 px-3 py-2 text-[11px] font-semibold text-white/75 shadow-lg backdrop-blur-sm">
        {player.position === "QB"
          ? "Coach QB is not eligible. Tap a kid, then pick their route."
          : "Tap an offensive player to add a named route."}
      </div>
    );
  }

  return (
    <div className="pointer-events-auto mt-2 rounded-2xl bg-dragon-black/85 p-2 shadow-lg backdrop-blur-sm">
      <p className="mb-1.5 flex items-center gap-1.5 px-1 text-[11px] font-bold uppercase tracking-wide text-dragon-gold">
        <Route className="h-3.5 w-3.5" />
        {player.label} — tap a route to add it
      </p>
      <div className="flex flex-wrap gap-1">
        {ROUTE_TREE.map((route) => (
          <button
            key={route.id}
            type="button"
            onClick={() => onPick(route.id)}
            className="rounded-full bg-white/10 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide text-white hover:bg-dragon-gold hover:text-dragon-black"
          >
            {route.shortName ?? route.name}
          </button>
        ))}
      </div>
    </div>
  );
}
