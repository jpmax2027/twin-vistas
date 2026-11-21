// scenes.js — the scene registry: three painted scenes in rising difficulty
// (5, then 7, then 9 differences, with more time as the count grows).

import { paintHarbor, HARBOR_DIFFERENCES, HARBOR_GLOWS } from './scene-harbor.js';
import { paintMarket, MARKET_DIFFERENCES, MARKET_GLOWS } from './scene-market.js';
import { paintObservatory, OBSERVATORY_DIFFERENCES, OBSERVATORY_GLOWS } from './scene-observatory.js';

export const PANEL_WIDTH = 520;
export const PANEL_HEIGHT = 600;

export const SCENES = [
  {
    id: 'harbor',
    title: 'Scene 1 · Lantern Harbour',
    timeSeconds: 120,
    paint: paintHarbor,
    differences: HARBOR_DIFFERENCES,
    glows: HARBOR_GLOWS,
  },
  {
    id: 'market',
    title: 'Scene 2 · The Night Market',
    timeSeconds: 150,
    paint: paintMarket,
    differences: MARKET_DIFFERENCES,
    glows: MARKET_GLOWS,
  },
  {
    id: 'observatory',
    title: 'Scene 3 · The Star Observatory',
    timeSeconds: 180,
    paint: paintObservatory,
    differences: OBSERVATORY_DIFFERENCES,
    glows: OBSERVATORY_GLOWS,
  },
];
