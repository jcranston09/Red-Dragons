import { useEffect, useState } from "react";
import FlagFootballApp from "./FlagFootballApp.jsx";
import SportHome from "./components/SportHome.jsx";
import LacrosseApp from "./lacrosse/LacrosseApp.jsx";

function parseHash() {
  const raw = (window.location.hash || "#/").replace(/^#/, "") || "/";
  const parts = raw.split("/").filter(Boolean);
  if (parts[0] === "flag") return { sport: "flag" };
  if (parts[0] === "lax") return { sport: "lax", drillId: parts[1] || null };
  return { sport: null, drillId: null };
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
  if (route.sport === "lax") return <LacrosseApp drillId={route.drillId} onBack={goHome} />;
  return <SportHome />;
}
