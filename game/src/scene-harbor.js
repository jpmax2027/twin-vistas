// scene-harbor.js — "Lantern Harbour": a lighthouse, a pier and two boats at
// dusk, painted entirely with canvas shapes. paint() draws the base picture;
// the ids in `changed` flip the five difference spots to their other state.
// Seeded scatter (stars, wave strokes) is drawn before any branch and never
// uses the rng inside a branch, so both panels match except at the spots.

import { TAU, mulberry32, circle, crescent, cloud, glow, gull, roundedRect, skyGradient, starField } from './draw.js';

export const HARBOR_DIFFERENCES = [
  { id: 'lamp', x: 105, y: 167, r: 38, also: [{ x: 190, y: 165, r: 36 }, { x: 272, y: 162, r: 32 }], label: 'The lighthouse lamp has gone out' },
  { id: 'moon', x: 430, y: 92, r: 42, label: 'The full moon became a crescent' },
  { id: 'gull', x: 392, y: 176, r: 26, label: 'One gull has flown away' },
  { id: 'flag', x: 284, y: 298, r: 26, label: "The sailboat's flag is missing" },
  { id: 'buoy', x: 150, y: 520, r: 26, label: 'The buoy changed from red to green' },
];

export const HARBOR_GLOWS = [
  { x: 215, y: 388, r: 34, color: '#ffb454' },
  { x: 325, y: 388, r: 34, color: '#ffb454' },
  { x: 435, y: 388, r: 34, color: '#ffb454' },
];

const W = 520;
const H = 600;
const HORIZON = 385;

// The moon, pre-drawn on a tile so the crescent can be punched out cleanly.
function moonTile(crescentMoon) {
  const tile = document.createElement('canvas');
  tile.width = 96; tile.height = 96;
  const c = tile.getContext('2d');
  circle(c, 48, 48, 34);
  c.fillStyle = '#f5eeda';
  c.fill();
  c.fillStyle = 'rgba(190,180,150,0.55)';
  circle(c, 36, 38, 7); c.fill();
  circle(c, 58, 58, 5); c.fill();
  circle(c, 62, 32, 4); c.fill();
  if (crescentMoon) {
    c.globalCompositeOperation = 'destination-out';
    circle(c, 68, 38, 30);
    c.fill();
    c.globalCompositeOperation = 'source-over';
  }
  return tile;
}

function drawLighthouse(ctx, lampOn) {
  // Tower: a tapered stack with two red bands, clipped to its own outline.
  ctx.save();
  ctx.beginPath();
  ctx.moveTo(76, 356);
  ctx.lineTo(134, 356);
  ctx.lineTo(122, 196);
  ctx.lineTo(88, 196);
  ctx.closePath();
  ctx.clip();
  ctx.fillStyle = '#e9e1cb';
  ctx.fillRect(70, 190, 70, 170);
  ctx.fillStyle = '#c8452c';
  ctx.fillRect(70, 296, 70, 26);
  ctx.fillRect(70, 240, 70, 26);
  ctx.restore();
  ctx.strokeStyle = 'rgba(20,24,44,0.35)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(76, 356); ctx.lineTo(88, 196);
  ctx.moveTo(134, 356); ctx.lineTo(122, 196);
  ctx.stroke();

  // Gallery and lamp room.
  ctx.fillStyle = '#232a44';
  ctx.fillRect(78, 184, 54, 12);
  ctx.fillStyle = '#20263e';
  ctx.fillRect(88, 152, 34, 32);
  if (lampOn) {
    // The beam: a long soft wedge reaching out over the water.
    const beam = ctx.createLinearGradient(110, 0, 345, 0);
    beam.addColorStop(0, 'rgba(255,236,170,0.5)');
    beam.addColorStop(1, 'rgba(255,236,170,0)');
    ctx.fillStyle = beam;
    ctx.beginPath();
    ctx.moveTo(108, 160);
    ctx.lineTo(345, 108);
    ctx.lineTo(345, 222);
    ctx.lineTo(108, 176);
    ctx.closePath();
    ctx.fill();
    glow(ctx, 105, 168, 52, '#ffdf8a', 0.75);
    ctx.fillStyle = '#fff3c4';
    ctx.fillRect(94, 158, 22, 20);
  } else {
    ctx.fillStyle = '#2c3554';
    ctx.fillRect(94, 158, 22, 20);
    ctx.fillStyle = '#171e33';
    circle(ctx, 105, 168, 3);
    ctx.fill();
  }
  // Roof.
  ctx.fillStyle = '#c8452c';
  ctx.beginPath();
  ctx.moveTo(82, 152);
  ctx.lineTo(128, 152);
  ctx.lineTo(105, 132);
  ctx.closePath();
  ctx.fill();
}

function drawPier(ctx) {
  // Posts first, then the deck over their tops.
  ctx.fillStyle = '#43301d';
  for (const x of [190, 280, 370, 470]) ctx.fillRect(x, 458, 10, 52);
  ctx.fillStyle = '#6b4a2f';
  ctx.fillRect(148, 444, 372, 18);
  ctx.strokeStyle = 'rgba(0,0,0,0.25)';
  ctx.lineWidth = 2;
  for (let x = 178; x < 520; x += 30) {
    ctx.beginPath(); ctx.moveTo(x, 446); ctx.lineTo(x, 460); ctx.stroke();
  }
  ctx.fillStyle = 'rgba(255,220,160,0.25)';
  ctx.fillRect(148, 444, 372, 3);
  // Lantern posts along the pier.
  for (const x of [215, 325, 435]) {
    ctx.fillStyle = '#2c2115';
    ctx.fillRect(x - 2, 396, 4, 50);
    ctx.fillStyle = '#20263e';
    roundedRect(ctx, x - 8, 378, 16, 20, 3);
    ctx.fill();
    ctx.fillStyle = '#ffca7a';
    ctx.fillRect(x - 5, 382, 10, 12);
  }
  // Crates and a barrel stacked at the pier's near end.
  ctx.fillStyle = '#7d5a36';
  ctx.fillRect(164, 410, 38, 34);
  ctx.fillRect(204, 418, 32, 26);
  ctx.strokeStyle = 'rgba(0,0,0,0.3)';
  ctx.strokeRect(164, 410, 38, 34);
  ctx.beginPath(); ctx.moveTo(164, 410); ctx.lineTo(202, 444); ctx.stroke();
  ctx.fillStyle = '#5d7a8c';
  ellipsePath(ctx, 252, 444, 13, 5);
  ctx.fillRect(239, 414, 26, 30);
  ellipsePath(ctx, 252, 414, 13, 5);
}

function ellipsePath(ctx, x, y, rx, ry) {
  ctx.beginPath();
  ctx.ellipse(x, y, rx, ry, 0, 0, TAU);
  ctx.fill();
}

function drawSailboat(ctx, withFlag) {
  // Reflection smear under the hull.
  ctx.fillStyle = 'rgba(10,18,38,0.5)';
  ctx.fillRect(232, 500, 84, 8);
  // Mast and sails.
  ctx.strokeStyle = '#3a2c1c';
  ctx.lineWidth = 4;
  ctx.beginPath(); ctx.moveTo(272, 470); ctx.lineTo(272, 294); ctx.stroke();
  ctx.fillStyle = '#efe6d0';
  ctx.beginPath();
  ctx.moveTo(278, 308); ctx.lineTo(278, 450); ctx.lineTo(320, 450);
  ctx.closePath(); ctx.fill();
  ctx.fillStyle = '#ddd2ba';
  ctx.beginPath();
  ctx.moveTo(266, 320); ctx.lineTo(266, 442); ctx.lineTo(236, 452);
  ctx.closePath(); ctx.fill();
  if (withFlag) {
    ctx.fillStyle = '#d84f3f';
    ctx.beginPath();
    ctx.moveTo(272, 292); ctx.lineTo(298, 298); ctx.lineTo(272, 305);
    ctx.closePath(); ctx.fill();
  }
  // Hull.
  ctx.fillStyle = '#7a4a2a';
  ctx.beginPath();
  ctx.moveTo(220, 468);
  ctx.lineTo(324, 468);
  ctx.lineTo(307, 495);
  ctx.lineTo(237, 495);
  ctx.closePath(); ctx.fill();
  ctx.fillStyle = '#96603a';
  ctx.fillRect(220, 468, 104, 6);
}

function drawRowboat(ctx) {
  ctx.fillStyle = '#5d3f24';
  ctx.beginPath();
  ctx.moveTo(398, 506);
  ctx.lineTo(488, 506);
  ctx.lineTo(471, 525);
  ctx.lineTo(413, 525);
  ctx.closePath(); ctx.fill();
  // The fisherman: a quiet silhouette with a rod.
  ctx.fillStyle = '#141c30';
  circle(ctx, 441, 488, 7); ctx.fill();
  ctx.beginPath();
  ctx.moveTo(433, 506);
  ctx.quadraticCurveTo(441, 492, 449, 506);
  ctx.closePath(); ctx.fill();
  ctx.strokeStyle = '#141c30';
  ctx.lineWidth = 2;
  ctx.beginPath(); ctx.moveTo(448, 498); ctx.lineTo(478, 484); ctx.stroke();
}

function drawBuoy(ctx, x, y, color) {
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(x - 11, y + 12);
  ctx.lineTo(x + 11, y + 12);
  ctx.lineTo(x + 6, y - 8);
  ctx.lineTo(x - 6, y - 8);
  ctx.closePath(); ctx.fill();
  ctx.fillStyle = '#f3e9d2';
  ctx.fillRect(x - 8, y - 1, 16, 5);
  ctx.strokeStyle = color;
  ctx.lineWidth = 3;
  circle(ctx, x, y - 14, 4);
  ctx.stroke();
}

export function paintHarbor(ctx, changed) {
  const rng = mulberry32(20261121);
  // Sky and its seeded stars.
  skyGradient(ctx, W, HORIZON + 2, [[0, '#131c3e'], [0.5, '#2c3560'], [0.8, '#7a4a63'], [1, '#c96f4a']]);
  starField(ctx, rng, 80, 6, 8, W - 12, 250, '#e8ecf7');

  ctx.drawImage(moonTile(changed.has('moon')), 430 - 48, 92 - 48);
  cloud(ctx, 118, 84, 150, 'rgba(26,32,60,0.92)');
  cloud(ctx, 302, 152, 116, 'rgba(26,32,60,0.85)');

  // Distant headland on the right.
  ctx.fillStyle = '#141b36';
  ctx.beginPath();
  ctx.moveTo(372, HORIZON);
  ctx.quadraticCurveTo(440, 318, 520, 330);
  ctx.lineTo(520, HORIZON);
  ctx.closePath(); ctx.fill();

  // Sea, its moon glitter and seeded wave strokes.
  const sea = ctx.createLinearGradient(0, HORIZON, 0, H);
  sea.addColorStop(0, '#27335c');
  sea.addColorStop(0.25, '#1a2c52');
  sea.addColorStop(1, '#0a142e');
  ctx.fillStyle = sea;
  ctx.fillRect(0, HORIZON, W, H - HORIZON);
  ctx.strokeStyle = 'rgba(255,196,110,0.5)';
  ctx.lineWidth = 2;
  for (let i = 0; i < 22; i++) {
    const y = 398 + rng() * 165;
    const x = 430 + (rng() - 0.5) * (30 + (y - 398) * 0.35);
    const len = 6 + rng() * 16;
    ctx.globalAlpha = 0.16 + rng() * 0.4;
    ctx.beginPath(); ctx.moveTo(x - len / 2, y); ctx.lineTo(x + len / 2, y); ctx.stroke();
  }
  ctx.strokeStyle = 'rgba(190,210,240,0.35)';
  for (let i = 0; i < 30; i++) {
    const x = rng() * W;
    const y = HORIZON + 14 + rng() * (H - HORIZON - 30);
    const len = 10 + rng() * 22;
    ctx.globalAlpha = 0.1 + rng() * 0.25;
    ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + len, y); ctx.stroke();
  }
  ctx.globalAlpha = 1;

  // The rocky point the lighthouse stands on.
  ctx.fillStyle = '#0d1330';
  ctx.beginPath();
  ctx.moveTo(0, 470);
  ctx.lineTo(0, 356);
  ctx.quadraticCurveTo(60, 330, 110, 344);
  ctx.quadraticCurveTo(168, 330, 196, 372);
  ctx.quadraticCurveTo(210, 420, 188, 470);
  ctx.closePath(); ctx.fill();
  ctx.fillStyle = 'rgba(120,130,180,0.25)';
  ctx.beginPath();
  ctx.moveTo(0, 356);
  ctx.quadraticCurveTo(60, 330, 110, 344);
  ctx.quadraticCurveTo(150, 336, 178, 360);
  ctx.quadraticCurveTo(110, 352, 60, 356);
  ctx.quadraticCurveTo(24, 360, 0, 372);
  ctx.closePath(); ctx.fill();

  drawLighthouse(ctx, !changed.has('lamp'));
  drawPier(ctx);
  drawSailboat(ctx, !changed.has('flag'));
  drawRowboat(ctx);
  drawBuoy(ctx, 150, 520, changed.has('buoy') ? '#3fae6a' : '#d84f3f');
  drawBuoy(ctx, 452, 558, '#e8a33d');

  const gullColor = 'rgba(215,223,239,0.9)';
  gull(ctx, 350, 150, 34, gullColor);
  if (!changed.has('gull')) gull(ctx, 392, 176, 30, gullColor);
  gull(ctx, 318, 198, 26, gullColor);
}
