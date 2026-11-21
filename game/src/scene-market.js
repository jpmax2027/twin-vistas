// scene-market.js — "The Night Market": three stalls under strings of
// festoon lanterns, painted entirely with canvas shapes. Same contract as
// the other painters: `changed` holds the ids of the differences to apply,
// and no branch ever touches the seeded rng, so the panels stay identical
// everywhere except at the seven difference spots.

import { circle, crescent, ellipse, glow, mulberry32, roundedRect, skyGradient, star, starField } from './draw.js';

export const MARKET_DIFFERENCES = [
  { id: 'star', x: 330, y: 60, r: 22, label: 'A bright star has vanished' },
  { id: 'bulb', x: 135, y: 100, r: 22, label: 'One festoon lantern changed colour' },
  { id: 'bunting', x: 239, y: 262, r: 20, label: 'A bunting flag changed colour' },
  { id: 'lantern', x: 262, y: 346, r: 26, label: 'A round lantern became a tall one' },
  { id: 'apples', x: 96, y: 356, r: 28, label: 'One apple is missing from the pile' },
  { id: 'vase', x: 448, y: 330, r: 26, label: 'The tall vase has vanished' },
  { id: 'cat', x: 80, y: 436, r: 30, label: 'The cat has slipped away' },
];

export const MARKET_GLOWS = [
  { x: 225, y: 345, r: 30, color: '#ffb454' },
  { x: 300, y: 345, r: 30, color: '#ff9d5c' },
];

const W = 520;
const H = 600;
const BULB_COLORS = ['#f6a83c', '#e4572e', '#3ec6b8', '#f2e14c', '#9b5de5'];

// A point on a quadratic curve, for hanging bulbs and flags on their strings.
function quadPoint(x0, y0, cx, cy, x1, y1, t) {
  const u = 1 - t;
  return {
    x: u * u * x0 + 2 * u * t * cx + t * t * x1,
    y: u * u * y0 + 2 * u * t * cy + t * t * y1,
  };
}

function festoonString(ctx, x0, y0, cx, cy, x1, y1, changedBulbIndex, bulbChanged) {
  ctx.strokeStyle = '#0a0f1e';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(x0, y0);
  ctx.quadraticCurveTo(cx, cy, x1, y1);
  ctx.stroke();
  for (let i = 1; i <= 11; i++) {
    const t = i / 12;
    const p = quadPoint(x0, y0, cx, cy, x1, y1, t);
    ctx.strokeStyle = '#0a0f1e';
    ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(p.x, p.y + 7); ctx.stroke();
    let color = BULB_COLORS[i % BULB_COLORS.length];
    if (i === changedBulbIndex && bulbChanged) color = '#3ec6b8';
    glow(ctx, p.x, p.y + 14, 15, color, 0.35);
    ctx.fillStyle = color;
    circle(ctx, p.x, p.y + 14, 7);
    ctx.fill();
  }
}

function bunting(ctx, changed) {
  const [x0, y0, cx, cy, x1, y1] = [180, 246, 262, 274, 345, 240];
  ctx.strokeStyle = '#0a0f1e';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(x0, y0);
  ctx.quadraticCurveTo(cx, cy, x1, y1);
  ctx.stroke();
  const flagColors = ['#e4572e', '#f2e14c', '#e4572e', '#3ec6b8', '#9b5de5', '#f6a83c', '#e4572e'];
  for (let i = 0; i < 7; i++) {
    const p = quadPoint(x0, y0, cx, cy, x1, y1, (i + 0.5) / 7);
    let color = flagColors[i];
    if (i === 2 && changed) color = '#9b5de5';
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(p.x - 9, p.y);
    ctx.lineTo(p.x + 9, p.y);
    ctx.lineTo(p.x, p.y + 17);
    ctx.closePath();
    ctx.fill();
  }
}

function awning(ctx, x, y, w, colorA, colorB) {
  const stripeW = w / 6;
  for (let i = 0; i < 6; i++) {
    ctx.fillStyle = i % 2 === 0 ? colorA : colorB;
    ctx.beginPath();
    ctx.moveTo(x + i * stripeW, y + 12);
    ctx.lineTo(x + (i + 1) * stripeW, y + 12);
    ctx.lineTo(x + (i + 1) * stripeW + 4, y + 34);
    ctx.lineTo(x + i * stripeW - 4, y + 34);
    ctx.closePath();
    ctx.fill();
  }
  ctx.fillStyle = 'rgba(0,0,0,0.18)';
  ctx.fillRect(x - 4, y + 30, w + 8, 4);
}

function stallFrame(ctx, x, w) {
  ctx.fillStyle = '#4a3626';
  ctx.fillRect(x + 4, 300, 7, 170);
  ctx.fillRect(x + w - 11, 300, 7, 170);
  // Counter.
  ctx.fillStyle = '#6e4f30';
  ctx.fillRect(x - 4, 428, w + 8, 42);
  ctx.fillStyle = 'rgba(255,220,160,0.2)';
  ctx.fillRect(x - 4, 428, w + 8, 4);
  ctx.fillStyle = '#54382a';
  ctx.fillRect(x - 4, 470, w + 8, 10);
}

function apple(ctx, x, y) {
  ctx.fillStyle = '#c9332b';
  circle(ctx, x, y, 10);
  ctx.fill();
  ctx.strokeStyle = '#4a3626';
  ctx.lineWidth = 2;
  ctx.beginPath(); ctx.moveTo(x, y - 8); ctx.quadraticCurveTo(x + 2, y - 13, x + 5, y - 14); ctx.stroke();
  ctx.fillStyle = '#5d8a48';
  ellipse(ctx, x + 6, y - 11, 5, 2.5);
  ctx.fill();
}

function drawCat(ctx) {
  // A ginger cat sitting upright on its crate, tail curled round its feet.
  ctx.fillStyle = '#d98e4a';
  ellipse(ctx, 80, 440, 17, 15); ctx.fill();
  circle(ctx, 80, 418, 12); ctx.fill();
  ctx.beginPath();
  ctx.moveTo(70, 410); ctx.lineTo(66, 398); ctx.lineTo(78, 406);
  ctx.closePath(); ctx.fill();
  ctx.beginPath();
  ctx.moveTo(90, 410); ctx.lineTo(94, 398); ctx.lineTo(82, 406);
  ctx.closePath(); ctx.fill();
  ctx.strokeStyle = '#d98e4a';
  ctx.lineWidth = 5;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(94, 450);
  ctx.quadraticCurveTo(112, 452, 108, 436);
  ctx.stroke();
  ctx.strokeStyle = 'rgba(120,66,20,0.6)';
  ctx.lineWidth = 3;
  for (const y of [434, 444]) {
    ctx.beginPath(); ctx.moveTo(66, y); ctx.lineTo(94, y); ctx.stroke();
  }
  ctx.fillStyle = '#20301c';
  circle(ctx, 76, 417, 1.8); ctx.fill();
  circle(ctx, 84, 417, 1.8); ctx.fill();
}

function paperLantern(ctx, x, y, tall) {
  ctx.strokeStyle = '#0a0f1e';
  ctx.lineWidth = 2;
  ctx.beginPath(); ctx.moveTo(x, y - 30); ctx.lineTo(x, tall ? y - 20 : y - 14); ctx.stroke();
  ctx.fillStyle = '#e4572e';
  if (tall) {
    roundedRect(ctx, x - 11, y - 20, 22, 44, 9);
    ctx.fill();
    ctx.strokeStyle = 'rgba(120,40,10,0.55)';
    for (const yy of [y - 6, y + 6]) {
      ctx.beginPath(); ctx.moveTo(x - 10, yy); ctx.lineTo(x + 10, yy); ctx.stroke();
    }
  } else {
    ellipse(ctx, x, y, 17, 15);
    ctx.fill();
    ctx.strokeStyle = 'rgba(120,40,10,0.55)';
    for (const dx of [-8, 0, 8]) {
      ctx.beginPath(); ctx.moveTo(x + dx, y - 13); ctx.lineTo(x + dx, y + 13); ctx.stroke();
    }
  }
  ctx.fillStyle = '#ffd97a';
  ctx.fillRect(x - 5, (tall ? y + 24 : y + 15), 10, 5);
}

function vase(ctx, x, yBase, h, color) {
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(x - 5, yBase - h);
  ctx.quadraticCurveTo(x - 13, yBase - h * 0.55, x - 9, yBase);
  ctx.lineTo(x + 9, yBase);
  ctx.quadraticCurveTo(x + 13, yBase - h * 0.55, x + 5, yBase - h);
  ctx.closePath();
  ctx.fill();
  ctx.fillRect(x - 6, yBase - h - 4, 12, 5);
}

export function paintMarket(ctx, changed) {
  const rng = mulberry32(19931107);
  skyGradient(ctx, W, 300, [[0, '#0d1b33'], [1, '#274069']]);
  starField(ctx, rng, 60, 6, 6, W - 12, 190, '#e8ecf7');
  crescent(ctx, 462, 64, 20, '#f2d38a');
  // The named bright star of the difference (its two companions stay).
  ctx.fillStyle = '#ffffff';
  circle(ctx, 312, 84, 2.4); ctx.fill();
  if (!changed.has('star')) star(ctx, 330, 60, 7, '#ffffff');
  circle(ctx, 352, 88, 2.2); ctx.fill();

  // Rooftop silhouettes with seeded lit windows.
  ctx.fillStyle = '#0a1226';
  ctx.beginPath();
  ctx.moveTo(0, 300);
  ctx.lineTo(0, 262); ctx.lineTo(70, 262); ctx.lineTo(70, 246); ctx.lineTo(150, 246);
  ctx.lineTo(150, 268); ctx.lineTo(250, 268); ctx.lineTo(250, 252); ctx.lineTo(340, 252);
  ctx.lineTo(340, 270); ctx.lineTo(430, 270); ctx.lineTo(430, 250); ctx.lineTo(520, 250);
  ctx.lineTo(520, 300);
  ctx.closePath(); ctx.fill();
  ctx.fillStyle = '#ffca7a';
  for (let i = 0; i < 14; i++) {
    const x = 12 + rng() * 490;
    const y = 256 + rng() * 34;
    ctx.globalAlpha = 0.35 + rng() * 0.6;
    ctx.fillRect(x, y, 6, 8);
  }
  ctx.globalAlpha = 1;

  festoonString(ctx, 10, 70, 260, 118, 510, 54, 3, changed.has('bulb'));
  festoonString(ctx, 10, 132, 260, 172, 510, 118, -1, false);
  bunting(ctx, changed.has('bunting'));

  // Ground and its seeded cobbles.
  ctx.fillStyle = '#232038';
  ctx.fillRect(0, 470, W, H - 470);
  ctx.fillStyle = 'rgba(255,255,255,0.06)';
  for (let i = 0; i < 46; i++) {
    const x = rng() * W;
    const y = 486 + rng() * 104;
    ellipse(ctx, x, y, 12 + rng() * 14, 5 + rng() * 3);
    ctx.fill();
  }

  // — Left stall: fruit. —
  stallFrame(ctx, 30, 150);
  awning(ctx, 22, 270, 166, '#c9332b', '#f3e9d2');
  apple(ctx, 70, 378); apple(ctx, 96, 378); apple(ctx, 122, 378);
  apple(ctx, 83, 358); apple(ctx, 109, 358);
  if (!changed.has('apples')) apple(ctx, 96, 338);
  ctx.fillStyle = '#e8912d';
  for (const [x, y] of [[140, 380], [158, 380], [149, 362]]) { circle(ctx, x, y, 9); ctx.fill(); }
  star(ctx, 105, 322, 8, '#f2b544');

  // The cat's crate, in front of the fruit stall.
  ctx.fillStyle = '#7d5a36';
  ctx.fillRect(52, 452, 56, 44);
  ctx.strokeStyle = 'rgba(0,0,0,0.35)';
  ctx.strokeRect(52, 452, 56, 44);
  ctx.beginPath(); ctx.moveTo(52, 452); ctx.lineTo(108, 496); ctx.stroke();
  if (!changed.has('cat')) drawCat(ctx);

  // — Centre stall: paper lanterns. —
  stallFrame(ctx, 195, 140);
  awning(ctx, 187, 270, 156, '#1f7a72', '#f3e9d2');
  ctx.fillStyle = '#4a3626';
  ctx.fillRect(200, 316, 130, 5);
  paperLantern(ctx, 225, 345, false);
  paperLantern(ctx, 262, 346, changed.has('lantern'));
  // A diamond lantern on the right of the bar.
  ctx.save();
  ctx.translate(300, 345);
  ctx.rotate(Math.PI / 4);
  ctx.fillStyle = '#9b5de5';
  ctx.fillRect(-11, -11, 22, 22);
  ctx.restore();
  glow(ctx, 262, 346, 40, '#ff9d5c', 0.3);
  // Small lanterns resting on the counter.
  paperLanternMini(ctx, 216, 424);
  paperLanternMini(ctx, 306, 424);

  // — Right stall: pottery. —
  stallFrame(ctx, 345, 150);
  awning(ctx, 337, 270, 166, '#5b3a8c', '#f3e9d2');
  ctx.fillStyle = '#4a3626';
  ctx.fillRect(352, 344, 136, 5);
  ctx.fillRect(352, 392, 136, 5);
  vase(ctx, 368, 344, 30, '#3ec6b8');
  vase(ctx, 404, 344, 38, '#c9332b');
  if (!changed.has('vase')) vase(ctx, 448, 344, 54, '#e8a33d');
  vase(ctx, 478, 344, 26, '#5d8a48');
  vase(ctx, 372, 392, 24, '#9b5de5');
  vase(ctx, 470, 392, 30, '#3ec6b8');
  // Pots along the counter.
  vase(ctx, 380, 428, 22, '#c9332b');
  vase(ctx, 452, 428, 26, '#5d8a48');
  star(ctx, 420, 322, 8, '#f2b544');
}

function paperLanternMini(ctx, x, y) {
  ctx.fillStyle = '#f2e14c';
  ellipse(ctx, x, y, 10, 8);
  ctx.fill();
}
