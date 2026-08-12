"use strict";

const GAME_CONFIG = {
  canvasWidth: 360,
  canvasHeight: 520,
  groundY: 430,
  playerX: 72,
  courseLength: 12000,

  baseSpeed: 178,
  boostSpeed: 356,
  boostScoreMultiplier: 2,
  itemScoreAffectedByBoost: true,

  gravity: 950,
  jumpVelocity: -590,
  jumpCutVelocity: -260,
  maxLife: 3,
  invincibleMs: 1100,
  cancelBoostOnDamage: true,

  runScoreRate: 0.13,
  lifeBonus: {
    1: 500,
    2: 1000,
    3: 1500
  },

  player: {
    width: 48,
    height: 56,
    hitbox: {
      offsetX: 10,
      offsetY: 8,
      width: 28,
      height: 46
    },
    animationFps: 8,
    runFrames: 4
  },

  background: {
    loop: true,
    scrollFactor: 0.35
  },

  itemSize: 26,
  finishLabel: "ESCAPE",
  placeholderLabel: "TEMP"
};
