import { Route } from "lucide-react";
import { ROUTE_TREE } from "../data/routeTree.js";
import RouteCard from "./RouteCard.jsx";

export default function RoutesTab() {
  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col px-3 py-4 pb-16 sm:px-4">
      <header className="mb-4 text-center">
        <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-dragon-gold">
          Kinder route tree
        </p>
        <h1 className="font-display text-3xl font-extrabold uppercase tracking-wide md:text-4xl">
          Player routes
        </h1>
        <p className="mt-1 text-sm text-white/65">
          One job per route. Scroll to see each picture. Player starts on the line of scrimmage
          (RB starts in the backfield on Sweep).
        </p>
      </header>
      <div className="mb-4 flex gap-2 overflow-x-auto pb-1 scrollbar-thin">
        {ROUTE_TREE.map((route) => (
          <a
            key={route.id}
            href={`#route-${route.id}`}
            className="shrink-0 rounded-full bg-white/10 px-3 py-1 text-[11px] font-bold uppercase tracking-wide text-white/80 hover:bg-dragon-gold hover:text-dragon-black"
          >
            {route.name}
          </a>
        ))}
      </div>
      <div className="flex flex-col gap-5 snap-y snap-mandatory">
        {ROUTE_TREE.map((route) => (
          <RouteCard key={route.id} route={route} />
        ))}
      </div>
      <p className="mt-6 flex items-center justify-center gap-2 text-[11px] text-white/40">
        <Route className="h-3.5 w-3.5" />
        Straight lines only • pause to cut when you draw these in the designer
      </p>
    </div>
  );
}
