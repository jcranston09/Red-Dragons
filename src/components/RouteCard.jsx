import { routeArrow } from "../utils/path.js";

const VIEW_W = 300;
const VIEW_H = 270;
const MARGIN_X = 18;
const PLAY_W = VIEW_W - MARGIN_X * 2;
const LOS_Y = 208;
const YD = 9.2;
const PLAYER_R = 16;

function toXY(xYard, down) {
  return {
    x: MARGIN_X + (xYard / 30) * PLAY_W,
    y: LOS_Y - down * YD,
  };
}

export default function RouteCard({ route }) {
  const start = toXY(route.player.x, -route.player.behind);
  const pts = route.points.map((p) => toXY(p.x, p.down));
  const arrow = routeArrow(pts, { length: 16, width: 8 });
  const pointStr = arrow.line.map((p) => `${p.x},${p.y}`).join(" ");
  const isRun = route.type === "run";
  const color = isRun ? "#ffffff" : "#f5d90a";

  return (
    <article
      id={`route-${route.id}`}
      className="flex snap-start flex-col overflow-hidden rounded-3xl border border-white/10 bg-black/40"
    >
      <header className="border-b border-white/10 px-4 py-3 text-center">
        <h2 className="font-display text-3xl font-extrabold uppercase tracking-wide md:text-4xl">
          {route.name}
        </h2>
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-dragon-gold">
          {route.also}
        </p>
      </header>
      <div className="turf-bg relative aspect-[300/270] w-full">
        <svg viewBox={`0 0 ${VIEW_W} ${VIEW_H}`} className="h-full w-full" aria-hidden="true">
          <line
            x1={MARGIN_X}
            y1={LOS_Y}
            x2={VIEW_W - MARGIN_X}
            y2={LOS_Y}
            stroke="#f5d90a"
            strokeWidth="3"
          />
          <text
            x={MARGIN_X + 4}
            y={LOS_Y + 14}
            fill="#f5d90a"
            fontSize="9"
            fontWeight="800"
            fontFamily="Barlow Condensed, sans-serif"
          >
            LOS
          </text>
          {[5, 10, 15].map((yd) => (
            <g key={yd}>
              <line
                x1={MARGIN_X}
                y1={LOS_Y - yd * YD}
                x2={VIEW_W - MARGIN_X}
                y2={LOS_Y - yd * YD}
                stroke="rgba(255,255,255,0.28)"
                strokeWidth="1"
              />
              <text
                x={MARGIN_X + 4}
                y={LOS_Y - yd * YD - 4}
                fill="rgba(255,255,255,0.55)"
                fontSize="8"
                fontWeight="700"
                fontFamily="Barlow Condensed, sans-serif"
              >
                {yd}
              </text>
            </g>
          ))}
          <line x1={MARGIN_X} y1="12" x2={MARGIN_X} y2={VIEW_H - 8} stroke="rgba(255,255,255,0.45)" strokeWidth="2" />
          <line
            x1={VIEW_W - MARGIN_X}
            y1="12"
            x2={VIEW_W - MARGIN_X}
            y2={VIEW_H - 8}
            stroke="rgba(255,255,255,0.45)"
            strokeWidth="2"
          />
          <circle
            cx={start.x}
            cy={start.y}
            r={PLAYER_R}
            fill="#b91c1c"
            stroke="#fff"
            strokeWidth="3"
          />
          <text
            x={start.x}
            y={start.y + 1}
            textAnchor="middle"
            dominantBaseline="middle"
            fill="#fff"
            fontSize="11"
            fontWeight="800"
            fontFamily="Barlow Condensed, sans-serif"
          >
            {route.player.label}
          </text>
          <polyline
            points={pointStr}
            fill="none"
            stroke={color}
            strokeWidth="6"
            strokeDasharray={isRun ? "10 7" : undefined}
            strokeLinejoin="miter"
            strokeLinecap="butt"
          />
          {pts.slice(1, -1).map((pt, i) => (
            <circle key={i} cx={pt.x} cy={pt.y} r="3.2" fill={color} />
          ))}
          {arrow.head ? <polygon points={arrow.head} fill={color} /> : null}
        </svg>
      </div>
      <p className="px-4 py-3 text-center text-sm text-white/75">{route.kidJob}</p>
    </article>
  );
}
