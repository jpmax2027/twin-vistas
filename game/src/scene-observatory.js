// scene-observatory.js — "The Star Observatory": a candlelit attic room with
// a great arched window, a brass telescope and an owl on the bookshelf.
// Same painter contract as the other scenes: `changed` flips the difference
// spots, and seeded scatter is spent before any branch is taken.

import { circle, crescent, ellipse, glow, mulberry32, roundedRect, star, starField } from './draw.js';

export const OBSERVATORY_DIFFERENCES = [
  { id: 'comet', x: 322, y: 112, r: 30, label: 'The comet has vanished' },
  { id: 'clock', x: 452, y: 150, r: 32, label: "The clock's hands moved from nine to three" },
  { id: 'owl', x: 76, y: 166, r: 24, label: 'The owl has closed its eyes' },
  { id: 'lamp', x: 260, y: 60, r: 30, label: 'The pendant lamp has gone out' },
  { id: 'plant', x: 176, y: 306, r: 22, label: 'The plant on the sill has vanished' },
  { id: 'book', x: 74, y: 310, r: 20, label: 'A book spine changed from green to red' },
  { id: 'chart', x: 428, y: 388, r: 20, label: 'A star is missing from the star chart' },
  { id: 'candle', x: 462, y: 372, r: 22, label: 'The candle has blown out' },
  { id: 'rug', x: 260, y: 530, r: 34, label: "The rug's medallion changed colour" },
];

export const OBSERVATORY_GLOWS = [
  { x: 318, y: 110, r: 58, color: '#aebfff' },
];

const W = 520;
const H = 600;

function drawWindow(ctx, changed) {
  // The night sky inside the arch, clipped to the arch's own shape.
  ctx.save();
  ctx.beginPath();
  ctx.moveTo(158, 336);
  ctx.lineTo(158, 150);
  ctx.arc(260, 150, 102, Math.PI, 0);
  ctx.lineTo(362, 336);
  ctx.closePath();
  ctx.clip();
  const sky = ctx.createLinearGradient(0, 40, 0, 336);
  sky.addColorStop(0, '#0e1830');
  sky.addColorStop(1, '#2a3a66');
  ctx.fillStyle = sky;
  ctx.fillRect(150, 40, 220, 300);
  const rng = mulberry32(777);
  starField(ctx, rng, 46, 162, 56, 196, 240, '#e8ecf7');
  crescent(ctx, 318, 110, 19, '#f2d38a');
  if (!changed.has('comet')) {
    const tail = ctx.createLinearGradient(330, 118, 282, 88);
    tail.addColorStop(0, 'rgba(220,235,255,0.85)');
    tail.addColorStop(1, 'rgba(220,235,255,0)');
    ctx.fillStyle = tail;
    ctx.beginPath();
    ctx.moveTo(330, 112);
    ctx.lineTo(282, 88);
    ctx.lineTo(288, 104);
    ctx.lineTo(326, 122);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = '#eef4ff';
    circle(ctx, 328, 114, 5);
    ctx.fill();
  }
  // Mullions: one vertical, one horizontal bar.
  ctx.fillStyle = '#4a3626';
  ctx.fillRect(256, 48, 8, 288);
  ctx.fillRect(158, 206, 204, 7);
  ctx.restore();
  // The arch frame itself.
  ctx.strokeStyle = '#4a3626';
  ctx.lineWidth = 10;
  ctx.beginPath();
  ctx.moveTo(158, 336);
  ctx.lineTo(158, 150);
  ctx.arc(260, 150, 102, Math.PI, 0);
  ctx.lineTo(362, 336);
  ctx.stroke();
  // Sill.
  ctx.fillStyle = '#54382a';
  ctx.fillRect(146, 336, 228, 12);
}

function drawPlant(ctx) {
  ctx.fillStyle = '#b0613a';
  ctx.beginPath();
  ctx.moveTo(166, 318);
  ctx.lineTo(186, 318);
  ctx.lineTo(183, 336);
  ctx.lineTo(169, 336);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = '#5d8a48';
  ctx.lineWidth = 3;
  ctx.lineCap = 'round';
  for (const [dx, dy] of [[-8, -14], [0, -18], [8, -13]]) {
    ctx.beginPath();
    ctx.moveTo(176, 318);
    ctx.quadraticCurveTo(176 + dx / 2, 318 + dy / 2, 176 + dx, 318 + dy);
    ctx.stroke();
  }
  ctx.fillStyle = '#6fa055';
  ellipse(ctx, 168, 304, 5, 3); ctx.fill();
  ellipse(ctx, 176, 300, 5, 3); ctx.fill();
  ellipse(ctx, 184, 305, 5, 3); ctx.fill();
}

function drawBookshelf(ctx, changed) {
  ctx.fillStyle = '#4a3626';
  ctx.fillRect(24, 190, 106, 282);
  ctx.fillStyle = '#2c1e12';
  ctx.fillRect(31, 197, 92, 268);
  const shelfYs = [272, 352, 432];
  const rows = [
    ['#b03a30', '#3f7d4e', '#c9963c', '#4a5d9e', '#7a4a7e', '#b03a30'],
    ['#4a5d9e', '#c9963c', 'BOOK', '#3f7d4e', '#b03a30', '#7a4a7e'],
    ['#7a4a7e', '#b03a30', '#4a5d9e', '#c9963c', '#3f7d4e', '#4a5d9e'],
  ];
  rows.forEach((row, ri) => {
    const top = ri === 0 ? 204 : shelfYs[ri - 1] + 8;
    let x = 36;
    row.forEach((color, ci) => {
      const w = 11 + ((ri * 3 + ci) % 3) * 2;
      const h = 52 + ((ri + ci) % 3) * 5;
      let fill = color;
      if (color === 'BOOK') fill = changed.has('book') ? '#b03a30' : '#3f7d4e';
      ctx.fillStyle = fill;
      ctx.fillRect(x, top + (62 - h), w, h);
      ctx.fillStyle = 'rgba(255,240,200,0.5)';
      ctx.fillRect(x, top + (62 - h) + 6, w, 3);
      x += w + 3;
    });
    ctx.fillStyle = '#4a3626';
    ctx.fillRect(31, top + 62, 92, 7);
  });
}

function drawOwl(ctx, eyesOpen) {
  ctx.fillStyle = '#8a6f4d';
  ellipse(ctx, 76, 172, 17, 20); ctx.fill();
  circle(ctx, 76, 152, 13); ctx.fill();
  ctx.beginPath();
  ctx.moveTo(65, 143); ctx.lineTo(62, 132); ctx.lineTo(72, 140);
  ctx.closePath(); ctx.fill();
  ctx.beginPath();
  ctx.moveTo(87, 143); ctx.lineTo(90, 132); ctx.lineTo(80, 140);
  ctx.closePath(); ctx.fill();
  ctx.fillStyle = '#a5875f';
  ellipse(ctx, 76, 176, 10, 13); ctx.fill();
  if (eyesOpen) {
    ctx.fillStyle = '#f2c14e';
    circle(ctx, 71, 152, 4.4); ctx.fill();
    circle(ctx, 81, 152, 4.4); ctx.fill();
    ctx.fillStyle = '#14100a';
    circle(ctx, 71, 152, 2.1); ctx.fill();
    circle(ctx, 81, 152, 2.1); ctx.fill();
  } else {
    ctx.strokeStyle = '#3a2c1a';
    ctx.lineWidth = 2;
    ctx.beginPath(); ctx.arc(71, 150, 3.6, 0.15 * Math.PI, 0.85 * Math.PI); ctx.stroke();
    ctx.beginPath(); ctx.arc(81, 150, 3.6, 0.15 * Math.PI, 0.85 * Math.PI); ctx.stroke();
  }
  ctx.fillStyle = '#e8a33d';
  ctx.beginPath();
  ctx.moveTo(73, 158); ctx.lineTo(79, 158); ctx.lineTo(76, 162);
  ctx.closePath(); ctx.fill();
  // Perch: the top of the bookshelf.
  ctx.fillStyle = '#4a3626';
  ctx.fillRect(52, 192, 48, 6);
}

function drawClock(ctx, threeOClock) {
  ctx.fillStyle = '#4a3626';
  circle(ctx, 452, 150, 32); ctx.fill();
  ctx.fillStyle = '#f3e9d2';
  circle(ctx, 452, 150, 26); ctx.fill();
  ctx.strokeStyle = '#8a7a5c';
  ctx.lineWidth = 1.5;
  for (let i = 0; i < 12; i++) {
    const a = (i * Math.PI) / 6;
    ctx.beginPath();
    ctx.moveTo(452 + Math.cos(a) * 21, 150 + Math.sin(a) * 21);
    ctx.lineTo(452 + Math.cos(a) * 24.5, 150 + Math.sin(a) * 24.5);
    ctx.stroke();
  }
  ctx.strokeStyle = '#2c2115';
  ctx.lineCap = 'round';
  // Minute hand always points up (o'clock); the hour hand is the difference.
  ctx.lineWidth = 3;
  ctx.beginPath(); ctx.moveTo(452, 150); ctx.lineTo(452, 131); ctx.stroke();
  ctx.lineWidth = 4.5;
  ctx.beginPath();
  ctx.moveTo(452, 150);
  if (threeOClock) ctx.lineTo(467, 150); else ctx.lineTo(437, 150);
  ctx.stroke();
  ctx.fillStyle = '#b03a30';
  circle(ctx, 452, 150, 3.4); ctx.fill();
}

function drawTelescope(ctx) {
  ctx.save();
  ctx.translate(246, 438);
  ctx.rotate(0.62);
  const tube = ctx.createLinearGradient(0, -13, 0, 13);
  tube.addColorStop(0, '#e0aa4e');
  tube.addColorStop(0.5, '#c9963c');
  tube.addColorStop(1, '#8a6420');
  ctx.fillStyle = tube;
  roundedRect(ctx, -118, -13, 168, 26, 10);
  ctx.fill();
  ctx.fillStyle = '#6e4f16';
  ctx.fillRect(-30, -14, 10, 28);
  ctx.fillRect(28, -14, 8, 28);
  ctx.fillStyle = '#2c2115';
  roundedRect(ctx, 48, -6, 16, 12, 4);
  ctx.fill();
  ctx.restore();
  // Tripod.
  ctx.strokeStyle = '#4a3626';
  ctx.lineWidth = 6;
  ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(246, 452); ctx.lineTo(214, 528); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(246, 452); ctx.lineTo(252, 532); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(246, 452); ctx.lineTo(284, 524); ctx.stroke();
  ctx.fillStyle = '#2c2115';
  circle(ctx, 246, 448, 9); ctx.fill();
}

function drawDesk(ctx, changed) {
  // Desk body.
  ctx.fillStyle = '#54382a';
  ctx.fillRect(352, 428, 156, 12);
  ctx.fillRect(360, 440, 10, 62);
  ctx.fillRect(490, 440, 10, 62);
  ctx.fillStyle = 'rgba(255,220,160,0.16)';
  ctx.fillRect(352, 428, 156, 3);
  // Star chart: a tilted sheet with a small constellation.
  ctx.save();
  ctx.translate(415, 408);
  ctx.rotate(-0.06);
  ctx.fillStyle = '#e9dfc4';
  ctx.fillRect(-38, -22, 76, 44);
  ctx.strokeStyle = '#8a7a5c';
  ctx.strokeRect(-38, -22, 76, 44);
  const pts = [[-26, 8], [-12, -8], [4, 2], [16, -12], [28, 4]];
  ctx.strokeStyle = 'rgba(60,70,110,0.7)';
  ctx.lineWidth = 1.2;
  ctx.beginPath();
  pts.forEach(([x, y], i) => (i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y)));
  ctx.stroke();
  ctx.fillStyle = '#31406e';
  pts.forEach(([x, y], i) => {
    if (changed.has('chart') && i === 3) return;
    circle(ctx, x, y, 2.6);
    ctx.fill();
  });
  ctx.restore();
  // Ink pot and quill.
  ctx.fillStyle = '#1c2438';
  roundedRect(ctx, 372, 414, 14, 12, 3);
  ctx.fill();
  ctx.strokeStyle = '#e8ecf7';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(380, 414);
  ctx.quadraticCurveTo(392, 398, 402, 400);
  ctx.stroke();
  // A stack of two books.
  ctx.fillStyle = '#4a5d9e';
  ctx.fillRect(452, 418, 40, 10);
  ctx.fillStyle = '#b03a30';
  ctx.fillRect(456, 408, 34, 10);
}

function drawCandle(ctx, lit) {
  // Holder and candle on the desk's right end.
  ctx.fillStyle = '#8a6420';
  ellipse(ctx, 462, 426, 13, 4); ctx.fill();
  ctx.fillRect(459, 404, 6, 20);
  ctx.fillStyle = '#f0e6ce';
  ctx.fillRect(454, 380, 16, 26);
  ctx.fillStyle = '#e2d3ac';
  ctx.fillRect(454, 380, 16, 5);
  if (lit) {
    glow(ctx, 462, 366, 30, '#ffb454', 0.65);
    ctx.fillStyle = '#ffca7a';
    ctx.beginPath();
    ctx.moveTo(462, 354);
    ctx.quadraticCurveTo(468, 366, 462, 374);
    ctx.quadraticCurveTo(456, 366, 462, 354);
    ctx.fill();
    ctx.fillStyle = '#fff3c4';
    circle(ctx, 462, 368, 2.6); ctx.fill();
  } else {
    ctx.strokeStyle = '#2c2115';
    ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(462, 380); ctx.lineTo(462, 372); ctx.stroke();
    ctx.strokeStyle = 'rgba(200,200,210,0.5)';
    ctx.beginPath();
    ctx.moveTo(462, 370);
    ctx.quadraticCurveTo(458, 360, 463, 350);
    ctx.stroke();
  }
}

export function paintObservatory(ctx, changed) {
  // Wall and floor.
  const wall = ctx.createLinearGradient(0, 0, 0, 490);
  wall.addColorStop(0, '#1d2542');
  wall.addColorStop(1, '#141a30');
  ctx.fillStyle = wall;
  ctx.fillRect(0, 0, W, 490);
  ctx.fillStyle = '#3a2a20';
  ctx.fillRect(0, 490, W, H - 490);
  ctx.strokeStyle = 'rgba(0,0,0,0.35)';
  ctx.lineWidth = 2;
  for (let x = 40; x < W; x += 64) {
    ctx.beginPath(); ctx.moveTo(x, 492); ctx.lineTo(x - 14, 600); ctx.stroke();
  }
  ctx.fillStyle = 'rgba(0,0,0,0.3)';
  ctx.fillRect(0, 486, W, 5);

  drawWindow(ctx, changed);
  if (!changed.has('plant')) drawPlant(ctx);

  // Pendant lamp from the ceiling.
  ctx.strokeStyle = '#0d1120';
  ctx.lineWidth = 3;
  ctx.beginPath(); ctx.moveTo(260, 0); ctx.lineTo(260, 40); ctx.stroke();
  if (!changed.has('lamp')) glow(ctx, 260, 66, 54, '#ffb454', 0.55);
  ctx.fillStyle = changed.has('lamp') ? '#3a415a' : '#c9963c';
  ctx.beginPath();
  ctx.moveTo(232, 66);
  ctx.lineTo(288, 66);
  ctx.lineTo(268, 40);
  ctx.lineTo(252, 40);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = changed.has('lamp') ? '#59617c' : '#ffe9a8';
  circle(ctx, 260, 68, 6);
  ctx.fill();

  drawBookshelf(ctx, changed);
  drawOwl(ctx, !changed.has('owl'));
  drawClock(ctx, changed.has('clock'));

  // A framed star picture on the right wall.
  ctx.fillStyle = '#4a3626';
  ctx.fillRect(392, 226, 96, 66);
  ctx.fillStyle = '#16224a';
  ctx.fillRect(398, 232, 84, 54);
  star(ctx, 420, 252, 5, '#e8ecf7');
  star(ctx, 448, 266, 4, '#e8ecf7');
  star(ctx, 462, 246, 3.4, '#e8ecf7');
  ctx.strokeStyle = 'rgba(232,236,247,0.6)';
  ctx.lineWidth = 1;
  ctx.beginPath(); ctx.moveTo(420, 252); ctx.lineTo(448, 266); ctx.lineTo(462, 246); ctx.stroke();

  // The rug with its medallion.
  ctx.fillStyle = '#6e2f35';
  ellipse(ctx, 260, 532, 178, 44); ctx.fill();
  ctx.strokeStyle = '#d9a441';
  ctx.lineWidth = 3;
  ellipse(ctx, 260, 532, 160, 36); ctx.stroke();
  ctx.fillStyle = changed.has('rug') ? '#3ec6b8' : '#d9a441';
  ctx.save();
  ctx.translate(260, 530);
  ctx.rotate(Math.PI / 4);
  ctx.fillRect(-17, -17, 34, 34);
  ctx.restore();
  ctx.fillStyle = '#6e2f35';
  circle(ctx, 260, 530, 8); ctx.fill();

  drawTelescope(ctx);
  drawDesk(ctx, changed);
  drawCandle(ctx, !changed.has('candle'));
}
