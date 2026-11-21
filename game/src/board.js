// board.js — the canvas board: it pre-renders the two panels of the current
// scene (the right one with every difference applied), then each frame
// draws them with the living layer on top — lantern glow, the gold rings of
// found differences, hint pulses, wrong-click marks and the hover ring.

import { PANEL_WIDTH, PANEL_HEIGHT } from './scenes.js';
import { circle, glow, roundedRect } from './draw.js';

export const BOARD_WIDTH = 1160;
export const BOARD_HEIGHT = 660;

const PANELS = [
  { x: 20, y: 40 },
  { x: 620, y: 40 },
];
const PANEL_RADIUS = 10;

function makePanelCanvas() {
  const c = document.createElement('canvas');
  c.width = PANEL_WIDTH;
  c.height = PANEL_HEIGHT;
  return c;
}

function easeOutBack(t) {
  const c1 = 1.70158;
  const c3 = c1 + 1;
  return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
}

export class Board {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.leftPanel = makePanelCanvas();
    this.rightPanel = makePanelCanvas();
    this.scene = null;
    this.hover = null; // {x, y, panel} in scene coordinates, or null
  }

  // Paint both stills of a scene: left untouched, right with every
  // difference applied. Clicking either picture is scored the same.
  setScene(scene) {
    this.scene = scene;
    const leftCtx = this.leftPanel.getContext('2d');
    leftCtx.clearRect(0, 0, PANEL_WIDTH, PANEL_HEIGHT);
    scene.paint(leftCtx, new Set());
    const rightCtx = this.rightPanel.getContext('2d');
    rightCtx.clearRect(0, 0, PANEL_WIDTH, PANEL_HEIGHT);
    scene.paint(rightCtx, new Set(scene.differences.map((d) => d.id)));
  }

  // Map a mouse/touch event to scene coordinates, or null when the point
  // is outside both pictures.
  eventToScene(event) {
    const rect = this.canvas.getBoundingClientRect();
    const px = ((event.clientX - rect.left) / rect.width) * BOARD_WIDTH;
    const py = ((event.clientY - rect.top) / rect.height) * BOARD_HEIGHT;
    for (let panel = 0; panel < 2; panel++) {
      const o = PANELS[panel];
      if (px >= o.x && px < o.x + PANEL_WIDTH && py >= o.y && py < o.y + PANEL_HEIGHT) {
        return { panel, x: px - o.x, y: py - o.y };
      }
    }
    return null;
  }

  render(state, now) {
    const { ctx } = this;
    ctx.clearRect(0, 0, BOARD_WIDTH, BOARD_HEIGHT);
    ctx.fillStyle = '#0d1326';
    ctx.fillRect(0, 0, BOARD_WIDTH, BOARD_HEIGHT);
    if (!this.scene) return;

    // A wrong click shakes the whole board briefly.
    let shakeX = 0;
    let shakeY = 0;
    if (state.shakeUntil && now < state.shakeUntil) {
      const k = (state.shakeUntil - now) / 250;
      shakeX = Math.sin(now * 0.09) * 5 * k;
      shakeY = Math.cos(now * 0.11) * 3 * k;
    }
    ctx.save();
    ctx.translate(shakeX, shakeY);

    for (let panel = 0; panel < 2; panel++) {
      const o = PANELS[panel];
      ctx.save();
      roundedRect(ctx, o.x, o.y, PANEL_WIDTH, PANEL_HEIGHT, PANEL_RADIUS);
      ctx.clip();
      ctx.drawImage(panel === 0 ? this.leftPanel : this.rightPanel, o.x, o.y);
      this.drawGlows(ctx, o, now);
      this.drawVignette(ctx, o);
      ctx.restore();
      roundedRect(ctx, o.x, o.y, PANEL_WIDTH, PANEL_HEIGHT, PANEL_RADIUS);
      ctx.strokeStyle = 'rgba(242,181,68,0.4)';
      ctx.lineWidth = 2;
      ctx.stroke();
    }

    // A gold diamond in the gutter between the pictures.
    ctx.save();
    ctx.translate(BOARD_WIDTH / 2, BOARD_HEIGHT / 2);
    ctx.rotate(Math.PI / 4);
    ctx.fillStyle = '#f2b544';
    ctx.fillRect(-7, -7, 14, 14);
    ctx.restore();

    for (let panel = 0; panel < 2; panel++) {
      const o = PANELS[panel];
      this.drawMarkers(ctx, o, state, now);
      this.drawHintPulse(ctx, o, state, now);
      this.drawWrongMarks(ctx, o, panel, state, now);
    }
    if (this.hover && state.screen === 'playing') {
      const o = PANELS[this.hover.panel];
      ctx.strokeStyle = 'rgba(255,255,255,0.55)';
      ctx.lineWidth = 2;
      circle(ctx, o.x + this.hover.x, o.y + this.hover.y, 17);
      ctx.stroke();
    }
    ctx.restore();
  }

  drawGlows(ctx, origin, now) {
    for (const g of this.scene.glows) {
      const flicker = 0.82 + 0.18 * Math.sin(now / 340 + g.x * 0.7 + g.y);
      glow(ctx, origin.x + g.x, origin.y + g.y, g.r, g.color, 0.34 * flicker);
    }
  }

  drawVignette(ctx, origin) {
    const g = ctx.createRadialGradient(
      origin.x + PANEL_WIDTH / 2, origin.y + PANEL_HEIGHT / 2, PANEL_HEIGHT * 0.36,
      origin.x + PANEL_WIDTH / 2, origin.y + PANEL_HEIGHT / 2, PANEL_HEIGHT * 0.78,
    );
    g.addColorStop(0, 'rgba(0,0,0,0)');
    g.addColorStop(1, 'rgba(4,6,14,0.28)');
    ctx.fillStyle = g;
    ctx.fillRect(origin.x, origin.y, PANEL_WIDTH, PANEL_HEIGHT);
  }

  // Found differences wear a gold ring on BOTH pictures, popping in with a
  // spring and throwing four little sparkles.
  drawMarkers(ctx, origin, state, now) {
    for (const diff of this.scene.differences) {
      const foundAt = state.found.get(diff.id);
      if (foundAt === undefined) continue;
      const age = Math.min(1, (now - foundAt) / 260);
      const scale = easeOutBack(age);
      const cx = origin.x + diff.x;
      const cy = origin.y + diff.y;
      const r = Math.max(10, diff.r * 0.92 * scale);
      ctx.save();
      ctx.strokeStyle = 'rgba(30,20,4,0.55)';
      ctx.lineWidth = 7;
      circle(ctx, cx, cy, r);
      ctx.stroke();
      ctx.strokeStyle = '#ffc93e';
      ctx.lineWidth = 4;
      circle(ctx, cx, cy, r);
      ctx.stroke();
      if (age < 1) {
        ctx.fillStyle = 'rgba(255,220,120,0.9)';
        for (let i = 0; i < 4; i++) {
          const a = (i * Math.PI) / 2 + 0.4;
          const d = r + 6 + age * 10;
          circle(ctx, cx + Math.cos(a) * d, cy + Math.sin(a) * d, 2.4 * (1 - age) + 0.6);
          ctx.fill();
        }
      }
      ctx.restore();
    }
  }

  // A hint is a slow sonar ring around one unfound difference.
  drawHintPulse(ctx, origin, state, now) {
    const hint = state.hintPulse;
    if (!hint || now > hint.until) return;
    const diff = this.scene.differences.find((d) => d.id === hint.diffId);
    if (!diff) return;
    const t = (now - hint.startedAt) / (hint.until - hint.startedAt);
    const cx = origin.x + diff.x;
    const cy = origin.y + diff.y;
    ctx.save();
    ctx.strokeStyle = `rgba(62,198,184,${0.85 * (1 - t)})`;
    ctx.lineWidth = 3;
    circle(ctx, cx, cy, 12 + t * (diff.r + 26));
    ctx.stroke();
    ctx.strokeStyle = `rgba(62,198,184,${0.5 * (1 - t)})`;
    circle(ctx, cx, cy, 8 + t * (diff.r + 8));
    ctx.stroke();
    ctx.restore();
  }

  // A wrong click leaves a red cross that fades where it landed.
  drawWrongMarks(ctx, origin, panel, state, now) {
    for (const mark of state.wrongMarks) {
      if (mark.panel !== panel) continue;
      const age = (now - mark.at) / 650;
      if (age >= 1) continue;
      const cx = origin.x + mark.x;
      const cy = origin.y + mark.y;
      const s = 11;
      ctx.save();
      ctx.strokeStyle = `rgba(239,100,97,${1 - age})`;
      ctx.lineWidth = 4;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(cx - s, cy - s); ctx.lineTo(cx + s, cy + s);
      ctx.moveTo(cx + s, cy - s); ctx.lineTo(cx - s, cy + s);
      ctx.stroke();
      ctx.restore();
    }
  }
}
