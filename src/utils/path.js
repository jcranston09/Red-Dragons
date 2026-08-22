/** Collapse a freehand scribble into straight playbook segments. */
export function straightenPath(points, minAngleDeg = 26, minDist = 1.1) {
  if (!points || points.length <= 2) return points ?? [];
  const out = [points[0]];
  for (let i = 1; i < points.length - 1; i += 1) {
    const prev = out[out.length - 1];
    const curr = points[i];
    const next = points[i + 1];
    if (Math.hypot(curr.x - prev.x, curr.y - prev.y) < minDist) continue;
    const a1 = Math.atan2(curr.y - prev.y, curr.x - prev.x);
    const a2 = Math.atan2(next.y - curr.y, next.x - curr.x);
    let delta = Math.abs(a2 - a1);
    if (delta > Math.PI) delta = 2 * Math.PI - delta;
    if (delta > (minAngleDeg * Math.PI) / 180) out.push(curr);
  }
  const last = points[points.length - 1];
  const tail = out[out.length - 1];
  if (Math.hypot(last.x - tail.x, last.y - tail.y) >= minDist) out.push(last);
  else out[out.length - 1] = last;
  return out;
}
