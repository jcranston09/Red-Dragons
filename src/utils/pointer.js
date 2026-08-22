export function pointOnField(event, fieldEl) {
  if (!fieldEl) return { x: 0, y: 0 };
  const rect = fieldEl.getBoundingClientRect();
  const w = rect.width || 1;
  const h = rect.height || 1;
  return {
    x: ((event.clientX - rect.left) / w) * 100,
    y: ((event.clientY - rect.top) / h) * 100,
  };
}
