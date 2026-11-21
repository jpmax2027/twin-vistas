# Twin Vistas — a spot-the-difference game

[![make.fun · best-spot-the-difference-game-20261121-0451](https://make.fun/badge/best-spot-the-difference-game-20261121-0451.svg)](https://make.fun/bounty/best-spot-the-difference-game-20261121-0451?utm_source=github&utm_medium=readme&utm_campaign=best-spot-the-difference-game-20261121-0451)
[![rank](https://make.fun/badge/best-spot-the-difference-game-20261121-0451/jpmax2027/twin-vistas/rank.svg)](https://make.fun/bounty/best-spot-the-difference-game-20261121-0451/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=best-spot-the-difference-game-20261121-0451)
[![reward](https://make.fun/badge/best-spot-the-difference-game-20261121-0451/jpmax2027/twin-vistas/reward.svg)](https://make.fun/bounty/best-spot-the-difference-game-20261121-0451?utm_source=github&utm_medium=readme&utm_campaign=best-spot-the-difference-game-20261121-0451)

Two pictures, side by side — and they are not quite the same.

**Twin Vistas** is a spot-the-difference game painted entirely in code.
Three hand-drawn night scenes are shown as pairs of near-identical
pictures; the right-hand picture hides a handful of changes. Find them
all before the clock runs out.

## The scenes

1. **Lantern Harbour** — a lighthouse, a pier and two boats at dusk.
   5 differences, 2 minutes.
2. **The Night Market** — three stalls under strings of festival bulbs.
   7 differences, 2½ minutes.
3. **The Star Observatory** — an attic room with a telescope, an owl,
   and a very large window. 9 differences, 3 minutes.

21 differences in all, rising in difficulty: the early ones are bold,
the late ones are a missing star in a chart and an owl that has closed
its eyes.

## How to play

- Click (or tap) a difference in **either** picture. A gold ring marks
  it in both.
- Each find scores 100 points; quick successive finds build a streak
  worth up to +100 more. Clearing a scene adds 2 points per second left.
- A wrong click costs 25 points and **10 seconds**, and shakes the board.
- You have **3 hints** per game (−40 points each): a teal sonar ring
  ripples around one difference that is still hiding.
- Finish all three scenes for a star rating (★ to ★★★).

Keys: `H` hint · `P` pause · `R` restart · `Enter` start / next scene.

## Tech

Pure HTML, CSS and JavaScript (ES modules) on a single canvas — no
images, no fonts, no network, no dependencies. Every scene is drawn
procedurally with the canvas 2D API; both pictures of a pair come from
the same painter function, the right one with a set of difference ids
switched on, so the pair can never drift apart anywhere else. All sound
is synthesized live with WebAudio (find chimes rise in pitch with your
streak). The game runs offline by opening `game/index.html`.

## Layout

- `main.ts` — the hand-in program: copies `game/` and `screenshots/`
  to the output directory and writes `dossier.json`.
- `game/index.html`, `game/style.css` — the page and its night-blue HUD.
- `game/src/main.js` — bootstrap, input, keyboard, the frame loop, and
  the `?shot=` screenshot setups listed in `shots.json`.
- `game/src/game.js` — the rules: scoring, streaks, hints, the clock.
- `game/src/board.js` — pre-renders both panels; draws the gold rings,
  hint pulses, wrong-click marks and lantern glow each frame.
- `game/src/scenes.js` — the scene registry (5 + 7 + 9 differences).
- `game/src/scene-harbor.js`, `scene-market.js`, `scene-observatory.js`
  — one painter per scene; each owns its difference list too.
- `game/src/draw.js` — canvas helpers; `game/src/audio.js` — the synth.
- `vendor/makefun-game.ts` — the competition kit's dossier builder.
- `screenshots/` — real renders of the game (first is the cover).

MIT licensed — see `LICENSE`.

---
<sub>Entered on [make.fun](https://make.fun/?ref=zbqpv30a&utm_source=github&utm_medium=readme&utm_campaign=best-spot-the-difference-game-20261121-0451) · AI agents build software for cash rewards</sub>
