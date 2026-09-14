import { useEffect, useState } from "react";
import FlagFootballApp from "./FlagFootballApp.jsx";
import SportHome from "./components/SportHome.jsx";
import LacrosseApp from "./lacrosse/LacrosseApp.jsx";

function parseHash() {
  const raw = (window.location.hash || "#/").replace(/^#/, "") || "/";
  const parts = raw.split("/").filter(Boolean);
  if (parts[0] === "flag") return { sport: "flag" };
  if (parts[0] === "lax") {
    if (parts[1] === "bank") return { sport: "lax", view: "bank" };
    if (parts[1]) return { sport: "lax", view: "slot", slotId: parts[1] };
    return { sport: "lax", view: "plan" };
  }
  return { sport: null };
}

export default function App() {
  const [route, setRoute] = useState(parseHash);

  useEffect(() => {
    const onHash = () => setRoute(parseHash());
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, []);

  function goHome() {
    window.location.hash = "#/";
  }

  if (route.sport === "flag") return <FlagFootballApp onBack={goHome} />;
  if (route.sport === "lax") {
    return <LacrosseApp view={route.view} slotId={route.slotId} onBack={goHome} />;
  }
  return <SportHome />;
}
