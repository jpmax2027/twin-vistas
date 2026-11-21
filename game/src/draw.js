// draw.js — small canvas helpers shared by every scene painter.
// Everything here is deterministic: the seeded random generator lets a scene
// scatter stars or wave strokes that land identically on both panels, so the
// only pixels that ever differ are the deliberate differences.

export const TAU = Math.PI * 2;

// mulberry32: a tiny seeded PRNG. Same seed, same stream, every time.
export function mulberry32(seed) {
  let a = seed >>> 0;
  return function next() {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function clamp(value, lo, hi) {
  return Math.min(hi, Math.max(lo, value));
}

export function lerp(a, b, t) {
  return a + (b - a) * t;
}

// Rounded-rectangle path (does not fill or stroke by itself).
export function roundedRect(ctx, x, y, w, h, r) {
  const rad = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + rad, y);
  ctx.lineTo(x + w - rad, y);
  ctx.arcTo(x + w, y, x + w, y + rad, rad);
  ctx.lineTo(x + w, y + h - rad);
  ctx.arcTo(x + w, y + h, x + w - rad, y + h, rad);
  ctx.lineTo(x + rad, y + h);
  ctx.arcTo(x, y + h, x, y + h - rad, rad);
  ctx.lineTo(x, y + rad);
  ctx.arcTo(x, y, x + rad, y, rad);
  ctx.closePath();
}

export function circle(ctx, x, y, r) {
  ctx.beginPath();
  ctx.arc(x, y, r, 0, TAU);
}

export function ellipse(ctx, x, y, rx, ry) {
  ctx.beginPath();
  ctx.ellipse(x, y, rx, ry, 0, 0, TAU);
}

// A soft radial glow, the kind a lantern or a lamp throws.
export function glow(ctx, x, y, r, color, alpha) {
  const g = ctx.createRadialGradient(x, y, 0, x, y, r);
  g.addColorStop(0, color);
  g.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.fillStyle = g;
  ctx.fillRect(x - r, y - r, r * 2, r * 2);
  ctx.restore();
}

// A five-pointed star centred on (x, y).
export function star(ctx, x, y, r, color) {
  ctx.save();
  ctx.fillStyle = color;
  ctx.beginPath();
  for (let i = 0; i < 10; i++) {
    const rad = i % 2 === 0 ? r : r * 0.45;
    const a = -Math.PI / 2 + (i * Math.PI) / 5;
    const px = x + Math.cos(a) * rad;
    const py = y + Math.sin(a) * rad;
    if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
  }
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

// A crescent moon drawn as a true crescent (two arcs), lit from the right.
export function crescent(ctx, x, y, r, color) {
  ctx.save();
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(x, y, r, Math.PI * 0.5, Math.PI * 1.5, false);
  ctx.arc(x + r * 0.45, y, r * 0.82, Math.PI * 1.5, Math.PI * 0.5, true);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

// A plump cartoon cloud: three overlapping humps on a flat base.
export function cloud(ctx, x, y, w, color) {
  ctx.save();
  ctx.fillStyle = color;
  ellipse(ctx, x, y, w * 0.5, w * 0.16); ctx.fill();
  circle(ctx, x - w * 0.26, y - w * 0.08, w * 0.2); ctx.fill();
  circle(ctx, x + w * 0.05, y - w * 0.14, w * 0.26); ctx.fill();
  circle(ctx, x + w * 0.3, y - w * 0.06, w * 0.18); ctx.fill();
  ctx.restore();
}

// A seagull silhouette: two shallow arcs meeting in the middle.
export function gull(ctx, x, y, w, color) {
  ctx.save();
  ctx.strokeStyle = color;
  ctx.lineWidth = Math.max(2, w * 0.07);
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.arc(x - w * 0.25, y + w * 0.1, w * 0.26, Math.PI * 1.15, Math.PI * 1.95);
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(x + w * 0.25, y + w * 0.1, w * 0.26, Math.PI * 1.05, Math.PI * 1.85);
  ctx.stroke();
  ctx.restore();
}

// Vertical colour wash between two y stops.
export function skyGradient(ctx, w, h, stops) {
  const g = ctx.createLinearGradient(0, 0, 0, h);
  for (const [at, color] of stops) g.addColorStop(at, color);
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, w, h);
  return g;
}

// Scatter `count` tiny stars over a rectangle with the seeded rng.
export function starField(ctx, rng, count, x, y, w, h, color) {
  ctx.save();
  ctx.fillStyle = color;
  for (let i = 0; i < count; i++) {
    const sx = x + rng() * w;
    const sy = y + rng() * h;
    const r = 0.7 + rng() * 1.5;
    ctx.globalAlpha = 0.35 + rng() * 0.6;
    circle(ctx, sx, sy, r);
    ctx.fill();
  }
  ctx.restore();
}
