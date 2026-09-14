let audioCtx = null;

function ctx() {
  if (!audioCtx) {
    const C = window.AudioContext || window.webkitAudioContext;
    if (!C) return null;
    audioCtx = new C();
  }
  return audioCtx;
}

function tone(frequency, start, duration, type = "square", gain = 0.18) {
  const ac = ctx();
  if (!ac) return;
  const osc = ac.createOscillator();
  const g = ac.createGain();
  osc.type = type;
  osc.frequency.value = frequency;
  g.gain.setValueAtTime(0.0001, start);
  g.gain.exponentialRampToValueAtTime(gain, start + 0.02);
  g.gain.exponentialRampToValueAtTime(0.0001, start + duration);
  osc.connect(g);
  g.connect(ac.destination);
  osc.start(start);
  osc.stop(start + duration + 0.02);
}

export function unlockAudio() {
  const ac = ctx();
  if (ac?.state === "suspended") ac.resume();
}

export function playWarningBeep() {
  const ac = ctx();
  if (!ac) return;
  if (ac.state === "suspended") ac.resume();
  const t = ac.currentTime;
  tone(880, t, 0.18);
}

export function playAlarmBurst() {
  const ac = ctx();
  if (!ac) return;
  if (ac.state === "suspended") ac.resume();
  const t = ac.currentTime;
  tone(660, t, 0.16);
  tone(880, t + 0.18, 0.16);
  tone(1174, t + 0.36, 0.28);
  try {
    navigator.vibrate?.([220, 80, 220, 80, 400]);
  } catch {
    /* ignore */
  }
}
