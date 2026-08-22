import { ENDZONE_YARDS, FIELD_LENGTH_YARDS, FIELD_WIDTH_YARDS, PLAYING_FIELD_YARDS, losYPct, toPct } from "../utils/field.js";

function yardToY(yardFromOwnGoal) {
  return toPct(0, yardFromOwnGoal).y;
}

export default function Field({ fieldRef, children, losYard }) {
  const losY = losYPct(losYard);
  const cushionY = losYPct(losYard + 2);
  const midY = yardToY(PLAYING_FIELD_YARDS / 2);
  const ownGoal = yardToY(0);
  const farGoal = yardToY(PLAYING_FIELD_YARDS);

  const fiveYardLines = [];
  for (let yds = 5; yds < PLAYING_FIELD_YARDS; yds += 5) {
    fiveYardLines.push(yds);
  }

  const hashTicks = [];
  for (let yds = 1; yds < PLAYING_FIELD_YARDS; yds += 1) {
    if (yds % 5 === 0) continue;
    hashTicks.push(yds);
  }

  return (
    <div
      ref={fieldRef}
      className="field-frame relative overflow-hidden rounded-[10px] turf-bg"
      role="application"
      aria-label="DYF 6v6 flag football field, 30 yards by 53 yards"
      onContextMenu={(e) => e.preventDefault()}
    >
      <svg
        viewBox="0 0 300 530"
        className="pointer-events-none absolute inset-0 h-full w-full"
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        <defs>
          <pattern id="ezStripes" width="18" height="18" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
            <rect width="18" height="18" fill="rgba(0,0,0,0.12)" />
            <rect width="9" height="18" fill="rgba(245,217,10,0.09)" />
          </pattern>
        </defs>

        {/* End zones */}
        <rect x="0" y="0" width="300" height="50" fill="rgba(7,20,12,0.35)" />
        <rect x="0" y="0" width="300" height="50" fill="url(#ezStripes)" />
        <rect x="0" y="480" width="300" height="50" fill="rgba(7,20,12,0.35)" />
        <rect x="0" y="480" width="300" height="50" fill="url(#ezStripes)" />

        {/* Sidelines / end lines already via CSS frame; goal lines */}
        <line x1="0" y1="50" x2="300" y2="50" stroke="#fff" strokeWidth="2.4" />
        <line x1="0" y1="480" x2="300" y2="480" stroke="#fff" strokeWidth="2.4" />

        {fiveYardLines.map((yds) => {
          const y = (1 - (ENDZONE_YARDS + yds) / FIELD_LENGTH_YARDS) * 530;
          const isMid = Math.abs(yds - PLAYING_FIELD_YARDS / 2) < 0.1;
          return (
            <g key={yds}>
              <line
                x1="0"
                y1={y}
                x2="300"
                y2={y}
                stroke={isMid ? "#f5d90a" : "rgba(255,255,255,0.88)"}
                strokeWidth={isMid ? 2.6 : 1.4}
              />
            </g>
          );
        })}

        {hashTicks.map((yds) => {
          const y = (1 - (ENDZONE_YARDS + yds) / FIELD_LENGTH_YARDS) * 530;
          const hashes = [72, 228];
          return hashes.map((x) => (
            <g key={`${yds}-${x}`}>
              <line x1={x - 7} y1={y} x2={x + 7} y2={y} stroke="rgba(255,255,255,0.55)" strokeWidth="1.1" />
              <line x1={8} y1={y} x2={18} y2={y} stroke="rgba(255,255,255,0.4)" strokeWidth="1" />
              <line x1={282} y1={y} x2={292} y2={y} stroke="rgba(255,255,255,0.4)" strokeWidth="1" />
            </g>
          ));
        })}

        {/* Yard numbers: 5 / 10 / 15 / 20 from each goal on a 43-yard field */}
        {[5, 10, 15, 20, PLAYING_FIELD_YARDS - 20, PLAYING_FIELD_YARDS - 15, PLAYING_FIELD_YARDS - 10, PLAYING_FIELD_YARDS - 5]
          .map((yds) => {
            const y = (1 - (ENDZONE_YARDS + yds) / FIELD_LENGTH_YARDS) * 530;
            const shown = Math.round(Math.min(yds, PLAYING_FIELD_YARDS - yds));
            const label = String(shown).padStart(2, " ");
            return (
              <g key={`num-${yds}`}>
                <text
                  x="38"
                  y={y + 5}
                  fill="rgba(255,255,255,0.78)"
                  fontSize="16"
                  fontFamily="Barlow Condensed, sans-serif"
                  fontWeight="800"
                  letterSpacing="1"
                >
                  {label}
                </text>
                <text
                  x="248"
                  y={y + 5}
                  fill="rgba(255,255,255,0.78)"
                  fontSize="16"
                  fontFamily="Barlow Condensed, sans-serif"
                  fontWeight="800"
                  letterSpacing="1"
                >
                  {label}
                </text>
              </g>
            );
          })}

        <text
          x="150"
          y="32"
          textAnchor="middle"
          fill="rgba(245,217,10,0.85)"
          fontFamily="Barlow Condensed, sans-serif"
          fontSize="22"
          fontWeight="800"
          letterSpacing="6"
        >
          SCORE
        </text>
        <text
          x="150"
          y="512"
          textAnchor="middle"
          fill="rgba(255,255,255,0.8)"
          fontFamily="Barlow Condensed, sans-serif"
          fontSize="20"
          fontWeight="800"
          letterSpacing="5"
        >
          RED DRAGONS
        </text>
      </svg>

      {/* Midfield first-down marker */}
      <div
        className="pointer-events-none absolute left-0 right-0 z-[1] border-t-2 border-dashed border-dragon-gold/80"
        style={{ top: `${midY}%` }}
      >
        <span className="absolute left-1/2 top-0 -translate-x-1/2 -translate-y-1/2 rounded bg-dragon-gold px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-dragon-black">
          Midfield / 1st down
        </span>
      </div>

      {/* LOS */}
      <div
        className="pointer-events-none absolute left-0 right-0 z-[1] h-0.5 bg-yellow-300 shadow-[0_0_12px_#f5d90a]"
        style={{ top: `${losY}%` }}
      >
        <span className="absolute -left-0 top-1/2 -translate-y-1/2 rounded-r bg-yellow-300 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide text-dragon-black">
          LOS
        </span>
      </div>

      {/* 2-yard defensive cushion */}
      <div
        className="pointer-events-none absolute left-0 right-0 z-[1] border-t border-dotted border-white/50"
        style={{ top: `${cushionY}%` }}
      >
        <span className="absolute right-1 top-0 -translate-y-1/2 rounded bg-black/50 px-1 text-[8px] uppercase tracking-wide text-white/80">
          Def +2
        </span>
      </div>

      {/* Goal line labels */}
      <div
        className="pointer-events-none absolute left-2 z-[1] text-[9px] font-bold uppercase tracking-widest text-white/60"
        style={{ top: `calc(${farGoal}% + 4px)` }}
      >
        Goal
      </div>
      <div
        className="pointer-events-none absolute left-2 z-[1] text-[9px] font-bold uppercase tracking-widest text-white/60"
        style={{ top: `calc(${ownGoal}% - 14px)` }}
      >
        Own goal
      </div>

      <div className="pointer-events-none absolute bottom-2 left-1/2 z-[1] -translate-x-1/2 rounded-full bg-black/45 px-2 py-0.5 text-[9px] uppercase tracking-wider text-white/70">
        {FIELD_WIDTH_YARDS} yd × {FIELD_LENGTH_YARDS} yd • EZ {ENDZONE_YARDS} • 6v6
      </div>

      {children}
    </div>
  );
}
