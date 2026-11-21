// game.js — the rules of Twin Vistas: three scenes of rising difficulty,
// a countdown per scene, streaks for quick successive finds, a time penalty
// for wrong clicks, three hints a game, and a star rating at the end.

import { SCENES } from './scenes.js';
import {
  playClick, playFind, playGameWon, playHint, playSceneClear, playTick, playTimeUp, playWrong,
} from './audio.js';

export const FIND_POINTS = 100;
export const WRONG_TIME_PENALTY = 10;
export const WRONG_POINT_PENALTY = 25;
export const HINT_COST = 40;
export const HINTS_PER_GAME = 3;
export const STREAK_WINDOW_MS = 9000;

export class Game {
  // hud: the page elements to keep up to date; onScreen: called whenever
  // the screen changes so main.js can show or hide the banner.
  constructor(board, hud, onScreen) {
    this.board = board;
    this.hud = hud;
    this.onScreen = onScreen;
    this.screen = 'title'; // title | playing | paused | sceneClear | won | lost
    this.sceneIndex = 0;
    this.found = new Map(); // diff id -> performance.now() when found
    this.score = 0;
    this.streak = 0;
    this.lastFindAt = 0;
    this.mistakes = 0;
    this.totalFound = 0;
    this.hintsLeft = HINTS_PER_GAME;
    this.hintPulse = null; // {diffId, startedAt, until}
    this.wrongMarks = [];
    this.shakeUntil = 0;
    this.timeLeft = 0;
    this.lastTickSecond = -1;
    this.frozen = false; // screenshot setups freeze the clock
  }

  get scene() {
    return SCENES[this.sceneIndex];
  }

  get remaining() {
    return this.scene.differences.length - this.found.size;
  }

  setScreen(screen) {
    this.screen = screen;
    this.onScreen(screen, this);
    this.updateHud();
  }

  startGame(now) {
    this.score = 0;
    this.mistakes = 0;
    this.totalFound = 0;
    this.hintsLeft = HINTS_PER_GAME;
    this.loadScene(0);
    this.setScreen('playing');
    this.announce(`Find ${this.scene.differences.length} differences. Scene 1 of ${SCENES.length}.`);
    void now;
  }

  loadScene(index) {
    this.sceneIndex = index;
    this.found = new Map();
    this.streak = 0;
    this.lastFindAt = 0;
    this.hintPulse = null;
    this.wrongMarks = [];
    this.timeLeft = this.scene.timeSeconds;
    this.lastTickSecond = -1;
    this.board.setScene(this.scene);
    this.updateHud();
  }

  nextScene() {
    this.loadScene(this.sceneIndex + 1);
    this.setScreen('playing');
    this.announce(`Scene ${this.sceneIndex + 1} of ${SCENES.length}. Find ${this.scene.differences.length} differences.`);
  }

  // A click (already mapped to scene coordinates) on either picture.
  clickAt(point, now) {
    if (this.screen !== 'playing' || !point) return;
    // A difference may claim extra hit zones (the lighthouse beam claims
    // two along its length); score by slack — how far inside a zone the
    // click landed — so overlapping zones go to the best fit.
    let best = null;
    let bestSlack = Infinity;
    for (const diff of this.scene.differences) {
      if (this.found.has(diff.id)) continue;
      let slack = Math.hypot(point.x - diff.x, point.y - diff.y) - diff.r;
      for (const zone of diff.also ?? []) {
        slack = Math.min(slack, Math.hypot(point.x - zone.x, point.y - zone.y) - zone.r);
      }
      if (slack <= 0 && slack < bestSlack) {
        best = diff;
        bestSlack = slack;
      }
    }
    if (best) this.registerFind(best, now);
    else this.registerWrong(point, now);
  }

  registerFind(diff, now) {
    this.found.set(diff.id, now);
    this.totalFound += 1;
    this.streak = now - this.lastFindAt <= STREAK_WINDOW_MS ? this.streak + 1 : 1;
    this.lastFindAt = now;
    const streakBonus = Math.min(100, Math.max(0, this.streak - 1) * 25);
    this.score += FIND_POINTS + streakBonus;
    playFind(this.streak);
    if (this.remaining === 0) {
      const timeBonus = Math.round(this.timeLeft) * 2;
      this.score += timeBonus;
      if (this.sceneIndex === SCENES.length - 1) {
        playGameWon();
        this.setScreen('won');
        this.announce(`You found every difference! Final score ${this.score}.`);
      } else {
        playSceneClear();
        this.lastSceneBonus = timeBonus;
        this.setScreen('sceneClear');
        this.announce(`Scene clear! Time bonus ${timeBonus}.`);
      }
    } else {
      this.announce(`Found: ${diff.label}. ${this.remaining} to go.`);
    }
    this.updateHud();
  }

  registerWrong(point, now) {
    this.mistakes += 1;
    this.streak = 0;
    this.score = Math.max(0, this.score - WRONG_POINT_PENALTY);
    this.timeLeft = Math.max(0, this.timeLeft - WRONG_TIME_PENALTY);
    this.wrongMarks.push({ x: point.x, y: point.y, panel: point.panel, at: now });
    this.shakeUntil = now + 250;
    playWrong();
    this.announce(`Not there — ${WRONG_TIME_PENALTY} seconds lost.`);
    if (this.timeLeft <= 0) this.lose();
    this.updateHud();
  }

  useHint(now) {
    if (this.screen !== 'playing' || this.hintsLeft <= 0) return;
    const unfound = this.scene.differences.filter((d) => !this.found.has(d.id));
    if (unfound.length === 0) return;
    const pick = unfound[Math.floor(Math.random() * unfound.length)];
    this.hintsLeft -= 1;
    this.score = Math.max(0, this.score - HINT_COST);
    this.hintPulse = { diffId: pick.id, startedAt: now, until: now + 1700 };
    playHint();
    this.announce('A hint ripples somewhere in the pictures.');
    this.updateHud();
  }

  togglePause() {
    if (this.screen === 'playing') {
      this.setScreen('paused');
      this.announce('Paused.');
    } else if (this.screen === 'paused') {
      this.setScreen('playing');
      this.announce('Resumed.');
    }
  }

  lose() {
    playTimeUp();
    this.setScreen('lost');
    this.announce(`Time's up. You found ${this.totalFound} differences in all.`);
  }

  // Advance the clock. Called every animation frame with seconds elapsed.
  tick(dt, now) {
    if (this.screen === 'playing' && !this.frozen) {
      this.timeLeft -= dt;
      const whole = Math.ceil(this.timeLeft);
      if (whole !== this.lastTickSecond) {
        this.lastTickSecond = whole;
        if (whole <= 10 && whole > 0) playTick();
        this.updateHud();
      }
      if (this.timeLeft <= 0) {
        this.timeLeft = 0;
        this.lose();
      }
    }
    const cutoff = now - 700;
    if (this.wrongMarks.some((m) => m.at < cutoff)) {
      this.wrongMarks = this.wrongMarks.filter((m) => m.at >= cutoff);
    }
    if (this.hintPulse && now > this.hintPulse.until) this.hintPulse = null;
  }

  // What the banner button does depends on the screen it belongs to.
  bannerAction(now) {
    playClick();
    if (this.screen === 'title' || this.screen === 'won' || this.screen === 'lost') this.startGame(now);
    else if (this.screen === 'sceneClear') this.nextScene();
    else if (this.screen === 'paused') this.togglePause();
  }

  starRating() {
    if (this.score >= 2400) return 3;
    if (this.score >= 1600) return 2;
    return 1;
  }

  announce(message) {
    if (this.hud.status) this.hud.status.textContent = message;
  }

  updateHud() {
    const h = this.hud;
    if (!h.foundCount) return;
    const total = this.scene.differences.length;
    h.roundName.textContent = this.scene.title;
    h.foundCount.textContent = `${this.found.size} of ${total} found`;
    h.toGo.textContent = this.remaining > 0 ? `${this.remaining} to go` : 'all found!';
    const t = Math.max(0, Math.ceil(this.timeLeft));
    h.clock.textContent = `${Math.floor(t / 60)}:${String(t % 60).padStart(2, '0')}`;
    const frac = this.scene.timeSeconds > 0 ? Math.max(0, this.timeLeft / this.scene.timeSeconds) : 0;
    h.timerBar.style.width = `${frac * 100}%`;
    h.timerStat.classList.toggle('low', this.screen === 'playing' && this.timeLeft <= 20);
    h.score.textContent = String(this.score);
    h.streak.textContent = this.streak >= 2 ? `streak ×${this.streak}` : '';
    h.hintsLeft.textContent = String(this.hintsLeft);
    h.hintBtn.disabled = this.screen !== 'playing' || this.hintsLeft <= 0;
    h.pauseBtn.textContent = this.screen === 'paused' ? 'Resume' : 'Pause';
    h.pauseBtn.disabled = !(this.screen === 'playing' || this.screen === 'paused');
  }

  // Arrange a fixed position for screenshots: a real game state, rendered
  // by the same code, with the clock held still.
  setupShot({ sceneIndex, foundIds, score, timeLeft, screen }) {
    this.loadScene(sceneIndex);
    const base = performance.now() - 1200;
    foundIds.forEach((id, i) => this.found.set(id, base + i * 90));
    this.totalFound = foundIds.length;
    this.score = score;
    this.timeLeft = timeLeft;
    this.frozen = true;
    this.setScreen(screen);
    this.updateHud();
  }
}
