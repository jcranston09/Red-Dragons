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

/**
 * Arrow at the last point. scaleX/scaleY convert viewBox units to visual units so a
 * stretched field (100×100 over 30×53) still points along the painted line.
 * The polyline is trimmed so the tip sits on the true end, not in the thick stroke.
 */
export function routeArrow(points, { length = 4, width = 2.2, scaleX = 1, scaleY = 1 } = {}) {
  if (!points || points.length < 2) return { line: points ?? [], head: "" };
  const a = points[points.length - 2];
  const b = points[points.length - 1];
  const vdx = (b.x - a.x) * scaleX;
  const vdy = (b.y - a.y) * scaleY;
  const vis = Math.hypot(vdx, vdy);
  if (vis < 1e-4) return { line: points, head: "" };
  const angle = Math.atan2(vdy, vdx);
  const len = Math.min(length, vis * 0.58);
  const w = width * (len / length);
  const cos = Math.cos(angle);
  const sin = Math.sin(angle);
  const backX = b.x - (len * cos) / scaleX;
  const backY = b.y - (len * sin) / scaleY;
  const x1 = backX + (w * sin) / scaleX;
  const y1 = backY - (w * cos) / scaleY;
  const x2 = backX - (w * sin) / scaleX;
  const y2 = backY + (w * cos) / scaleY;
  return {
    line: [...points.slice(0, -1), { x: backX, y: backY }],
    head: `${b.x},${b.y} ${x1},${y1} ${x2},${y2}`,
  };
}
