import { createContext, useContext, useId } from "react";

const MarkerCtx = createContext("lax-arrow");

function Player({ x, y, fill = "#dc2626", label, r = 10 }) {
  return (
    <g>
      <circle cx={x} cy={y} r={r} fill={fill} stroke="#fff" strokeWidth="2" />
      {label ? (
        <text x={x} y={y + 1} textAnchor="middle" dominantBaseline="middle" fill="#fff" fontSize="8" fontWeight="800">
          {label}
        </text>
      ) : null}
    </g>
  );
}

function Cone({ x, y }) {
  return <polygon points={`${x},${y - 8} ${x - 6},${y + 6} ${x + 6},${y + 6}`} fill="#f97316" stroke="#fff" strokeWidth="1" />;
}

function Ball({ x, y }) {
  return <circle cx={x} cy={y} r="4.5" fill="#fff" stroke="#111" strokeWidth="1" />;
}

function Arrow({ d, color = "#f5d90a" }) {
  const markerId = useContext(MarkerCtx);
  return (
    <path
      d={d}
      fill="none"
      stroke={color}
      strokeWidth="3"
      markerEnd={`url(#${markerId})`}
      strokeLinejoin="round"
      strokeLinecap="round"
    />
  );
}

function FieldFrame({ children }) {
  const markerId = `lax-arrow-${useId().replace(/:/g, "")}`;
  return (
    <svg viewBox="0 0 320 200" className="h-full w-full" aria-hidden="true">
      <defs>
        <marker id={markerId} markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto">
          <path d="M0,0 L8,4 L0,8 Z" fill="#f5d90a" />
        </marker>
      </defs>
      <MarkerCtx.Provider value={markerId}>
        <rect x="0" y="0" width="320" height="200" fill="#157a3a" />
        <rect x="8" y="8" width="304" height="184" fill="none" stroke="rgba(255,255,255,0.35)" strokeWidth="2" />
        {children}
      </MarkerCtx.Provider>
    </svg>
  );
}

function WarmupDiagram() {
  return (
    <FieldFrame>
      <line x1="40" y1="100" x2="280" y2="100" stroke="rgba(255,255,255,0.25)" strokeWidth="2" strokeDasharray="6 6" />
      <Arrow d="M50 80 L250 80" />
      <Arrow d="M250 120 L50 120" />
      <Player x="70" y="80" label="1" />
      <Player x="120" y="80" label="2" />
      <Player x="70" y="120" label="3" />
      <Player x="160" y="100" fill="#f5d90a" label="C" />
      <text x="160" y="28" textAnchor="middle" fill="#f5d90a" fontSize="12" fontWeight="800">
        15 YARDS
      </text>
    </FieldFrame>
  );
}

function ScoopDiagram() {
  const lines = [70, 160, 250];
  return (
    <FieldFrame>
      {lines.map((x) => (
        <g key={x}>
          <Cone x={x} y="70" />
          <Cone x={x} y="110" />
          <Cone x={x} y="150" />
          <Player x={x} y="178" />
          <Arrow d={`M${x} 168 L${x} 58`} />
        </g>
      ))}
      <Ball x="160" y="95" />
      <Player x="30" y="100" fill="#f5d90a" label="C" />
      <text x="160" y="28" textAnchor="middle" fill="#fff" fontSize="11" fontWeight="800">
        3 LINES • SWITCH HANDS • PASS BACK
      </text>
    </FieldFrame>
  );
}

function GiveGoDiagram() {
  return (
    <FieldFrame>
      <ellipse cx="268" cy="100" rx="28" ry="52" fill="none" stroke="rgba(255,255,255,0.5)" strokeWidth="2" />
      <rect x="292" y="78" width="12" height="44" fill="#fff" opacity="0.85" />
      <Player x="70" y="150" label="G" />
      <Player x="150" y="70" fill="#f5d90a" label="C" />
      <Arrow d="M80 140 L145 80" />
      <Arrow d="M160 80 L230 100" />
      <Player x="220" y="108" label="G" />
      <Ball x="148" y="78" />
      <text x="140" y="28" textAnchor="middle" fill="#fff" fontSize="11" fontWeight="800">
        PASS • CUT • CATCH • SHOOT
      </text>
    </FieldFrame>
  );
}

function ScrambleDiagram() {
  return (
    <FieldFrame>
      <Player x="110" y="170" label="1" />
      <Player x="210" y="170" label="2" />
      <Player x="160" y="120" fill="#f5d90a" label="C" />
      <Ball x="160" y="55" />
      <Arrow d="M110 158 L150 70" />
      <Arrow d="M210 158 L170 70" />
      <text x="160" y="28" textAnchor="middle" fill="#fff" fontSize="11" fontWeight="800">
        1v1 GROUND BALL • BOX OUT
      </text>
    </FieldFrame>
  );
}

function FastBreakDiagram() {
  return (
    <FieldFrame>
      <ellipse cx="268" cy="100" rx="24" ry="46" fill="none" stroke="rgba(255,255,255,0.45)" strokeWidth="2" />
      <rect x="290" y="80" width="12" height="40" fill="#fff" opacity="0.85" />
      <Player x="70" y="70" label="A1" />
      <Player x="70" y="140" label="A2" />
      <Player x="170" y="105" fill="#111" label="D" />
      <Player x="40" y="105" fill="#f5d90a" label="C" />
      <Arrow d="M85 70 L230 90" />
      <Arrow d="M85 140 L230 120" />
      <Ball x="90" y="72" />
      <text x="150" y="28" textAnchor="middle" fill="#fff" fontSize="11" fontWeight="800">
        DRAW THE BALL-GIRL • ONE PASS • SHOOT
      </text>
    </FieldFrame>
  );
}

function RelayDiagram() {
  const xs = [55, 125, 195, 265];
  return (
    <FieldFrame>
      {xs.map((x, i) => (
        <g key={x}>
          <Cone x={x} y="60" />
          <Cone x={x + 14} y="95" />
          <Cone x={x} y="130" />
          <Player x={x} y="175" label={String(i + 1)} />
          <Arrow d={`M${x} 165 C ${x - 18} 130, ${x + 22} 95, ${x} 50`} />
        </g>
      ))}
      <text x="160" y="28" textAnchor="middle" fill="#fff" fontSize="11" fontWeight="800">
        4 TEAMS • SCOOP • WEAVE • PASS
      </text>
    </FieldFrame>
  );
}

function WestGennyDiagram() {
  return (
    <FieldFrame>
      <rect x="18" y="78" width="10" height="44" fill="#fff" opacity="0.8" />
      <rect x="292" y="78" width="10" height="44" fill="#fff" opacity="0.8" />
      <ellipse cx="48" cy="100" rx="22" ry="40" fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="1.5" />
      <ellipse cx="272" cy="100" rx="22" ry="40" fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="1.5" />
      <Player x="90" y="55" label="O" />
      <Player x="90" y="100" label="O" />
      <Player x="90" y="145" label="O" />
      <Player x="200" y="80" fill="#111" label="X" />
      <Player x="200" y="120" fill="#111" label="X" />
      <Arrow d="M105 100 L250 100" />
      <text x="160" y="28" textAnchor="middle" fill="#fff" fontSize="11" fontWeight="800">
        3v2 • TWO PASSES • SHOOTER IS OUT
      </text>
      <text x="160" y="188" textAnchor="middle" fill="rgba(255,255,255,0.7)" fontSize="10" fontWeight="700">
        GLE LINES BOTH ENDS
      </text>
    </FieldFrame>
  );
}

const DIAGRAMS = {
  warmup: WarmupDiagram,
  scoop: ScoopDiagram,
  giveGo: GiveGoDiagram,
  scramble: ScrambleDiagram,
  fastbreak: FastBreakDiagram,
  relay: RelayDiagram,
  westGenny: WestGennyDiagram,
};

export default function DrillDiagram({ diagram, compact = false }) {
  const Pic = DIAGRAMS[diagram] ?? WarmupDiagram;
  return (
    <div className={`overflow-hidden rounded-2xl turf-bg ${compact ? "h-full w-full" : "aspect-[320/200] w-full"}`}>
      <Pic />
    </div>
  );
}
