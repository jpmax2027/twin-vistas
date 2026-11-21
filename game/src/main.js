// main.js — bootstrap: build the board and the game, wire the mouse, the
// touch screen, the keyboard and the HUD buttons, run the frame loop, and
// honour the ?shot= setups that shots.json uses for the entry's screenshots
// (each names a real game state, rendered by this same code).

import { Board } from './board.js';
import { Game } from './game.js';
import { SCENES } from './scenes.js';

const $ = (id) => document.getElementById(id);

const canvas = $('board');
const board = new Board(canvas);

const hud = {
  roundName: $('round-name'),
  foundCount: $('found-count'),
  toGo: $('to-go'),
  clock: $('clock'),
  timerBar: $('timer-bar'),
  timerStat: $('timer-stat'),
  score: $('score'),
  streak: $('streak'),
  hintsLeft: $('hints-left'),
  hintBtn: $('hint-btn'),
  pauseBtn: $('pause-btn'),
  status: $('status'),
};

const banner = $('banner');
const bannerTitle = $('banner-title');
const bannerText = $('banner-text');
const bannerBtn = $('banner-btn');

function starLine(n) {
  return '★'.repeat(n) + '☆'.repeat(3 - n);
}

function showBanner(screen, game) {
  if (screen === 'playing') {
    banner.hidden = true;
    return;
  }
  banner.hidden = false;
  if (screen === 'title') {
    bannerTitle.textContent = 'Twin Vistas';
    bannerText.textContent =
      'Two pictures, side by side — and they are not quite the same.\n' +
      'Three scenes: a harbour at dusk, a night market, and a star observatory.\n' +
      'Find 5, then 7, then 9 differences before the clock runs out.\n' +
      'A wrong click costs 10 seconds. You have 3 hints. Good hunting!';
    bannerBtn.textContent = 'Start spotting';
  } else if (screen === 'paused') {
    bannerTitle.textContent = 'Paused';
    bannerText.textContent = 'The clock is held. Take a breath.';
    bannerBtn.textContent = 'Resume';
  } else if (screen === 'sceneClear') {
    bannerTitle.textContent = 'Scene clear!';
    bannerText.textContent =
      `Every difference found, with a time bonus of ${game.lastSceneBonus ?? 0}.\n` +
      `Score so far: ${game.score}. Next: ${SCENES[game.sceneIndex + 1].title}, ` +
      `${SCENES[game.sceneIndex + 1].differences.length} differences to find.`;
    bannerBtn.textContent = 'Next scene';
  } else if (screen === 'won') {
    bannerTitle.textContent = 'You found them all!';
    bannerText.textContent =
      `${starLine(game.starRating())}\n` +
      `All 21 differences across the three scenes.\n` +
      `Final score: ${game.score} · wrong clicks: ${game.mistakes}`;
    bannerBtn.textContent = 'Play again';
  } else if (screen === 'lost') {
    bannerTitle.textContent = "Time's up!";
    bannerText.textContent =
      `You found ${game.totalFound} differences in all.\n` +
      `Score: ${game.score}. The rest are still hiding — try again!`;
    bannerBtn.textContent = 'Try again';
  }
}

const game = new Game(board, hud, showBanner);
game.loadScene(0);
game.setScreen('title');

canvas.addEventListener('pointerdown', (event) => {
  const point = board.eventToScene(event);
  game.clickAt(point, performance.now());
});
canvas.addEventListener('pointermove', (event) => {
  board.hover = board.eventToScene(event);
});
canvas.addEventListener('pointerleave', () => {
  board.hover = null;
});

hud.hintBtn.addEventListener('click', () => game.useHint(performance.now()));
hud.pauseBtn.addEventListener('click', () => game.togglePause());
$('restart-btn').addEventListener('click', () => game.startGame(performance.now()));
bannerBtn.addEventListener('click', () => game.bannerAction(performance.now()));

window.addEventListener('keydown', (event) => {
  if (event.repeat) return;
  const key = event.key.toLowerCase();
  if (key === 'h') game.useHint(performance.now());
  else if (key === 'p') game.togglePause();
  else if (key === 'r') game.startGame(performance.now());
  else if (key === 'enter' || key === ' ') {
    if (game.screen !== 'playing') {
      event.preventDefault();
      game.bannerAction(performance.now());
    }
  }
});

// Screenshot setups (see shots.json): ?shot=<name> arranges a real state.
const SHOTS = {
  cover: { sceneIndex: 1, foundIds: ['bulb', 'lantern', 'cat'], score: 430, timeLeft: 87, screen: 'playing' },
  harbor: { sceneIndex: 0, foundIds: ['moon', 'buoy'], score: 260, timeLeft: 74, screen: 'playing' },
  observatory: { sceneIndex: 2, foundIds: ['comet', 'owl', 'rug', 'plant'], score: 1150, timeLeft: 121, screen: 'playing' },
  victory: {
    sceneIndex: 2,
    foundIds: SCENES[2].differences.map((d) => d.id),
    score: 2870, timeLeft: 43, screen: 'won',
  },
};
const shotName = new URLSearchParams(window.location.search).get('shot');
if (shotName && SHOTS[shotName]) game.setupShot(SHOTS[shotName]);

let last = performance.now();
function frame(now) {
  const dt = Math.min(0.05, (now - last) / 1000);
  last = now;
  game.tick(dt, now);
  board.render(game, now);
  requestAnimationFrame(frame);
}
requestAnimationFrame(frame);
