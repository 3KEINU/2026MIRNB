"use strict";

const GAME_CONFIG = {
  canvasWidth: 360,
  canvasHeight: 520,
  fontFamily: "BestTenDOT, Trebuchet MS, sans-serif",
  layout: {
    preserveCanvasAspect: true,
    maxAppWidth: 900
  },
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
    height: 80,
    hitbox: {
      offsetX: 13,
      offsetY: 18,
      width: 24,
      height: 58
    },
    animationFps: 8,
    boostAnimationFps: 12,
    runFrames: 2
  },

  background: {
    loop: true,
    scrollFactor: 0.35,
    groundScrollFactor: 1,
    windows: {
      enabled: true,
      scrollFactor: 0.72,
      farScrollFactor: 0.16,
      loopWidth: 760,
      tintAlpha: 0.22,
      entries: [
        {
          frame: "blue",
          x: 380,
          y: 150,
          width: 120,
          height: 150,
          tint: "#3aa6ff"
        },
        {
          frame: "pink",
          x: 690,
          y: 185,
          width: 120,
          height: 150,
          tint: "#ff5cc8"
        }
      ]
    }
  },

  secretMode: {
    title: "みりんのハートにBダッシュ",
    courseLength: 12000,
    baseSpeed: 245,
    boostSpeed: 430,
    boostScoreMultiplier: 2,
    itemScoreAffectedByBoost: true,
    gravity: 950,
    jumpVelocity: -590,
    jumpCutVelocity: -260,
    maxLife: 1,
    invincibleMs: 0,
    cancelBoostOnDamage: true,
    backgroundKey: "secret",
    backgroundFallbackKey: "normal",
    titleBgmKey: "titleSecret",
    playBgmKey: "playSecret",
    bgmFallback: {
      title: "title",
      play: "play"
    },
    finishLabel: "HEART"
  },

  itemSize: 26,
  finishLabel: "ESCAPE",
  placeholderLabel: "TEMP"
};
