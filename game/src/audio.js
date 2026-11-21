// audio.js — every sound in Twin Vistas is synthesized with WebAudio:
// no audio files, nothing to load. The context is created lazily on the
// first user gesture, as browsers require.

let ctx = null;
let master = null;

function ensureContext() {
  if (ctx) {
    if (ctx.state === 'suspended') ctx.resume();
    return ctx;
  }
  const AC = window.AudioContext || window.webkitAudioContext;
  if (!AC) return null;
  ctx = new AC();
  master = ctx.createGain();
  master.gain.value = 0.5;
  master.connect(ctx.destination);
  return ctx;
}

// One soft oscillator note with an exponential decay envelope.
function note(freq, at, dur, type = 'sine', gain = 0.5, slideTo = null) {
  const ac = ensureContext();
  if (!ac) return;
  const t0 = ac.currentTime + at;
  const osc = ac.createOscillator();
  const env = ac.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, t0);
  if (slideTo) osc.frequency.exponentialRampToValueAtTime(slideTo, t0 + dur);
  env.gain.setValueAtTime(0.0001, t0);
  env.gain.exponentialRampToValueAtTime(gain, t0 + 0.015);
  env.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
  osc.connect(env);
  env.connect(master);
  osc.start(t0);
  osc.stop(t0 + dur + 0.05);
}

// A bright two-note chime when a difference is found.
export function playFind(streak = 0) {
  const base = 660 + Math.min(streak, 6) * 40;
  note(base, 0, 0.16, 'sine', 0.5);
  note(base * 1.5, 0.07, 0.24, 'sine', 0.45);
  note(base * 2, 0.13, 0.3, 'triangle', 0.25);
}

// A dull, falling buzz for a wrong click.
export function playWrong() {
  note(160, 0, 0.22, 'sawtooth', 0.16, 90);
  note(110, 0.02, 0.24, 'square', 0.1, 70);
}

// A gentle harp ping while a hint ring pulses.
export function playHint() {
  note(880, 0, 0.3, 'sine', 0.3);
  note(1174, 0.1, 0.4, 'sine', 0.22);
}

// A small rising arpeggio for clearing a scene.
export function playSceneClear() {
  [523, 659, 784, 1046].forEach((f, i) => note(f, i * 0.09, 0.34, 'triangle', 0.4));
}

// A warmer, longer fanfare for finishing the whole game.
export function playGameWon() {
  [392, 523, 659, 784, 1046, 1318].forEach((f, i) => note(f, i * 0.11, 0.5, 'triangle', 0.42));
  note(262, 0, 0.9, 'sine', 0.25);
}

// A low two-tone sigh when the clock runs out.
export function playTimeUp() {
  note(330, 0, 0.35, 'sine', 0.35);
  note(220, 0.22, 0.55, 'sine', 0.35);
}

// A quiet tick for the last seconds of a scene.
export function playTick() {
  note(1200, 0, 0.05, 'square', 0.06);
}

// A plain UI click for buttons.
export function playClick() {
  note(520, 0, 0.07, 'triangle', 0.25);
}
