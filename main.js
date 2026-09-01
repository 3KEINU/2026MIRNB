"use strict";

const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const scoreLabel = document.getElementById("scoreLabel");
const lifeLabel = document.getElementById("lifeLabel");
const titleScreen = document.getElementById("titleScreen");
const consoleScreen = document.getElementById("consoleScreen");
const secretTitleScreen = document.getElementById("secretTitleScreen");
const storyScreen = document.getElementById("storyScreen");
const creditsScreen = document.getElementById("creditsScreen");
const resultScreen = document.getElementById("resultScreen");
const consoleDisplay = document.getElementById("consoleDisplay");
const storyBody = document.getElementById("storyBody");
const creditsBody = document.getElementById("creditsBody");
const resultStatus = document.getElementById("resultStatus");
const resultBirthday = document.getElementById("resultBirthday");
const resultScore = document.getElementById("resultScore");
const resultLife = document.getElementById("resultLife");
const resultItems = document.getElementById("resultItems");
const resultHint = document.getElementById("resultHint");
const consoleHintText = document.getElementById("consoleHintText");
const consoleCallLayer = document.getElementById("consoleCallLayer");
const consoleCallMirin = document.getElementById("consoleCallMirin");
const consoleCallBdash = document.getElementById("consoleCallBdash");
const startButton = document.getElementById("startButton");
const secretStartButton = document.getElementById("secretStartButton");
const normalModeButton = document.getElementById("normalModeButton");
const consoleButton = document.getElementById("consoleButton");
const consoleBackButton = document.getElementById("consoleBackButton");
const storyButton = document.getElementById("storyButton");
const creditsButton = document.getElementById("creditsButton");
const secretStoryButton = document.getElementById("secretStoryButton");
const storyBackButton = document.getElementById("storyBackButton");
const creditsBackButton = document.getElementById("creditsBackButton");
const retryButton = document.getElementById("retryButton");
const titleButton = document.getElementById("titleButton");
const jumpButton = document.getElementById("jumpButton");
const boostButton = document.getElementById("boostButton");
const app = document.querySelector(".app");
const consoleDevice = document.querySelector(".console-device");
const consoleArtboard = document.querySelector(".console-artboard");

const cfg = GAME_CONFIG;
const assets = createAssetStore(ASSET_MANIFEST);
const audio = createAudioStore(ASSET_MANIFEST.audio);

const input = {
  boostHeld: false
};

const canvasView = {
  preserveAspect: true,
  scale: 1,
  offsetX: 0,
  offsetY: 0
};

const scratchCanvases = new Map();

const SECRET_COMMAND = ["UP", "UP", "DOWN", "DOWN", "A", "B", "A", "B"];
const SECRET_SYMBOLS = {
  UP: "↑",
  DOWN: "↓",
  LEFT: "←",
  RIGHT: "→",
  A: "A",
  B: "B"
};
const CONSOLE_HINTS = [
  {
    text: "みりんの…",
    positions: [
      { x: 33, y: 28 },
      { x: 36, y: 64 },
      { x: 40, y: 22 }
    ]
  },
  {
    text: "ハートに…",
    positions: [
      { x: 70, y: 30 },
      { x: 66, y: 68 },
      { x: 76, y: 56 }
    ]
  }
];
const CONSOLE_SUCCESS_TIMING = {
  bdashDelay: 850,
  finishDelay: 2050
};

const game = {
  mode: "title",
  playMode: "normal",
  storyReturnMode: "normal",
  lastTime: 0,
  titleProgress: 0,
  introTimer: 0,
  goalExitTimer: 0,
  goalRenderProgress: 0,
  backgroundOffset: 0,
  progress: 0,
  score: 0,
  itemScore: 0,
  runScore: 0,
  lifeBonus: 0,
  itemsCollected: 0,
  life: cfg.maxLife,
  invincibleTimer: 0,
  resultWasClear: false,
  player: {
    x: cfg.playerX,
    y: cfg.groundY - cfg.player.height,
    vy: 0,
    grounded: true,
    damageFlash: 0
  },
  obstacles: [],
  items: []
};

let consoleHistory = [];
let consoleHintTimer = null;
let consoleHintIndex = 0;
let consoleIncorrectTimer = null;
let consoleSuccessTimers = [];
let renderProgressOverride = null;

storyBody.textContent = STORY_TEXT;
creditsBody.textContent = CREDITS_TEXT;
syncAppHeight();
resizeCanvas();
resetGame();
showTitle();
requestAnimationFrame(loop);

window.addEventListener("resize", syncLayout);
if (window.visualViewport) {
  window.visualViewport.addEventListener("resize", syncLayout);
  window.visualViewport.addEventListener("scroll", syncLayout);
}
window.addEventListener("keydown", onKeyDown);
window.addEventListener("keyup", onKeyUp);
window.addEventListener("blur", () => setBoost(false));
document.addEventListener("contextmenu", (event) => event.preventDefault());

startButton.addEventListener("click", () => startGame("normal"));
secretStartButton.addEventListener("click", () => startGame("secret"));
normalModeButton.addEventListener("click", showTitle);
consoleButton.addEventListener("pointerdown", (event) => {
  event.preventDefault();
  showConsole();
});
consoleBackButton.addEventListener("click", showTitle);
retryButton.addEventListener("click", () => startGame(game.playMode));
titleButton.addEventListener("click", showResultTitle);
storyButton.addEventListener("click", showStory);
creditsButton.addEventListener("click", showCredits);
secretStoryButton.addEventListener("click", () => showStory("secret"));
storyBackButton.addEventListener("click", showStoryBack);
creditsBackButton.addEventListener("click", showTitle);
document.querySelectorAll("[data-console-input]").forEach((button) => {
  button.addEventListener("pointerdown", (event) => {
    event.preventDefault();
    pressConsoleButton(button.dataset.consoleInput);
  });
});
jumpButton.addEventListener("pointerdown", (event) => {
  event.preventDefault();
  jump();
});
jumpButton.addEventListener("pointerup", (event) => {
  event.preventDefault();
  endJump();
});
jumpButton.addEventListener("pointercancel", (event) => {
  event.preventDefault();
  endJump();
});
jumpButton.addEventListener("pointerleave", (event) => {
  event.preventDefault();
  endJump();
});
bindHoldButton(boostButton, setBoost);

function createAssetStore(manifest) {
  const store = {
    manifest,
    images: new Map()
  };

  const paths = [];
  collectPaths({
    player: manifest.player,
    obstacles: manifest.obstacles,
    items: manifest.items,
    background: manifest.background,
    ui: manifest.ui
  }, paths);
  paths.forEach((path) => {
    const image = new Image();
    const record = { image, loaded: false, failed: false };
    image.onload = () => {
      record.loaded = true;
    };
    image.onerror = () => {
      record.failed = true;
    };
    image.src = path;
    store.images.set(path, record);
  });

  return store;
}

function createAudioStore(manifest) {
  const store = {
    enabled: typeof Audio !== "undefined",
    currentBgm: null,
    sounds: new Map(),
    bgm: new Map()
  };

  if (!store.enabled || !manifest) {
    return store;
  }

  Object.entries(manifest.se || {}).forEach(([key, path]) => {
    if (!path) return;
    const sound = new Audio(path);
    sound.preload = "auto";
    store.sounds.set(key, sound);
  });

  Object.entries(manifest.bgm || {}).forEach(([key, path]) => {
    if (!path) return;
    const music = new Audio(path);
    music.preload = "auto";
    music.loop = true;
    store.bgm.set(key, music);
  });

  return store;
}

function collectPaths(value, paths) {
  if (typeof value === "string") {
    if (!value) return;
    paths.push(value);
    return;
  }

  if (Array.isArray(value)) {
    value.forEach((item) => collectPaths(item, paths));
    return;
  }

  if (value && typeof value === "object") {
    Object.values(value).forEach((item) => collectPaths(item, paths));
  }
}

function getImage(path) {
  const record = assets.images.get(path);
  return record && record.loaded ? record.image : null;
}

function getModeSettings(mode = game.playMode) {
  const normal = {
    key: "normal",
    title: "ESCAPE FROM THIRTIES",
    courseLength: cfg.courseLength,
    baseSpeed: cfg.baseSpeed,
    boostSpeed: cfg.boostSpeed,
    boostScoreMultiplier: cfg.boostScoreMultiplier,
    itemScoreAffectedByBoost: cfg.itemScoreAffectedByBoost,
    gravity: cfg.gravity,
    jumpVelocity: cfg.jumpVelocity,
    jumpCutVelocity: cfg.jumpCutVelocity,
    maxLife: cfg.maxLife,
    lifeCap: cfg.maxLife,
    invincibleMs: cfg.invincibleMs,
    cancelBoostOnDamage: cfg.cancelBoostOnDamage,
    backgroundKey: "normal",
    backgroundFallbackKey: "main",
    titleBgmKey: "title",
    playBgmKey: "play",
    bgmFallback: {
      title: "title",
      play: "play"
    },
    finishLabel: cfg.finishLabel
  };

  if (mode === "secret") {
    return { ...normal, ...cfg.secretMode, key: "secret" };
  }

  return normal;
}

function getCourseData(mode = game.playMode) {
  if (mode === "secret") {
    return {
      obstacles: SECRET_COURSE_OBSTACLES,
      items: SECRET_COURSE_ITEMS
    };
  }

  return {
    obstacles: COURSE_OBSTACLES,
    items: COURSE_ITEMS
  };
}

function syncLayout() {
  syncAppChrome();
  syncAppHeight();
  resizeCanvas();
  syncConsoleArtboard();
}

function syncAppHeight() {
  const viewport = window.visualViewport;
  const height = viewport ? viewport.height : window.innerHeight;
  const width = viewport ? viewport.width : window.innerWidth;
  if (!height) return;
  const controlHeight = clamp(height * 0.2, 96, 144);
  const statusHeight = clamp(height * 0.055, 34, 44);
  const verticalReserve = 32;
  const gameHeight = Math.max(1, height - controlHeight - statusHeight - verticalReserve);
  const maxAppWidth = (cfg.layout && cfg.layout.maxAppWidth) || 900;
  const appWidth = isCanvasAspectPreserved()
    ? Math.min(width || 480, (gameHeight * cfg.canvasWidth / cfg.canvasHeight) + 20, maxAppWidth)
    : Math.min(width || 480, 480);
  document.documentElement.style.setProperty("--app-height", `${Math.floor(height)}px`);
  document.documentElement.style.setProperty("--app-width", `${Math.floor(appWidth)}px`);
}

function syncAppChrome() {
  if (!app) return;
  app.classList.toggle("is-showcase", !isGameplayChromeVisible());
}

function syncConsoleArtboard() {
  if (!consoleDevice || !consoleArtboard || consoleScreen.hidden) return;

  const rect = consoleDevice.getBoundingClientRect();
  if (!rect.width || !rect.height) return;

  const scale = Math.min(rect.width / 360, rect.height / 520);
  const width = Math.floor(360 * scale);
  const height = Math.floor(520 * scale);
  consoleArtboard.style.width = `${width}px`;
  consoleArtboard.style.height = `${height}px`;
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function isCanvasAspectPreserved() {
  return !cfg.layout || cfg.layout.preserveCanvasAspect !== false;
}

function isGameplayChromeVisible() {
  return game.mode === "playing" || game.mode === "intro" || game.mode === "goalExit";
}

function isShowcaseCanvasMode() {
  return !isGameplayChromeVisible();
}

function hideScreens() {
  stopConsoleHints();
  clearConsoleIncorrectFeedback();
  stopConsoleSuccessSequence();
  titleScreen.hidden = true;
  consoleScreen.hidden = true;
  secretTitleScreen.hidden = true;
  storyScreen.hidden = true;
  creditsScreen.hidden = true;
  resultScreen.hidden = true;
}

function resizeCanvas() {
  const rect = canvas.getBoundingClientRect();
  const ratio = Math.max(1, Math.min(window.devicePixelRatio || 1, 3));
  canvas.width = Math.floor(rect.width * ratio);
  canvas.height = Math.floor(rect.height * ratio);
  canvasView.preserveAspect = isCanvasAspectPreserved();

  if (!canvasView.preserveAspect) {
    ctx.setTransform(
      canvas.width / cfg.canvasWidth,
      0,
      0,
      canvas.height / cfg.canvasHeight,
      0,
      0
    );
    return;
  }

  canvasView.scale = Math.min(
    canvas.width / cfg.canvasWidth,
    canvas.height / cfg.canvasHeight
  );
  canvasView.offsetX = Math.floor((canvas.width - cfg.canvasWidth * canvasView.scale) / 2);
  canvasView.offsetY = Math.floor((canvas.height - cfg.canvasHeight * canvasView.scale) / 2);
  ctx.setTransform(
    canvasView.scale,
    0,
    0,
    canvasView.scale,
    canvasView.offsetX,
    canvasView.offsetY
  );
}

function resetGame() {
  const settings = getModeSettings();
  const course = getCourseData();
  game.progress = 0;
  game.score = 0;
  game.itemScore = 0;
  game.runScore = 0;
  game.lifeBonus = 0;
  game.itemsCollected = 0;
  game.life = settings.maxLife;
  game.invincibleTimer = 0;
  game.resultWasClear = false;
  game.introTimer = 0;
  game.goalExitTimer = 0;
  game.goalRenderProgress = 0;
  game.backgroundOffset = 0;
  game.player.x = cfg.playerX;
  game.player.y = cfg.groundY - cfg.player.height;
  game.player.vy = 0;
  game.player.grounded = true;
  game.player.damageFlash = 0;
  game.obstacles = course.obstacles.map((obstacle) => ({ ...obstacle, hit: false }));
  game.items = course.items.map((item) => ({ ...item, collected: false, pop: 0 }));
  setBoost(false);
  updateHud();
}

function showTitle() {
  game.mode = "title";
  game.playMode = "normal";
  setBoost(false);
  hideScreens();
  titleScreen.hidden = false;
  syncLayout();
  playBgm("title");
}

function showConsole() {
  game.mode = "console";
  consoleHistory = [];
  setBoost(false);
  hideScreens();
  clearConsoleIncorrectFeedback();
  consoleDisplay.classList.remove("is-command-input");
  consoleDisplay.textContent = "> COMMAND?";
  consoleScreen.hidden = false;
  syncLayout();
  requestAnimationFrame(syncConsoleArtboard);
  startConsoleHints();
  playBgm("title");
}

function startConsoleHints() {
  if (!consoleHintText) return;
  stopConsoleHints();
  consoleHintIndex = 0;
  consoleHintTimer = window.setTimeout(showConsoleHint, 1900);
}

function stopConsoleHints() {
  if (consoleHintTimer !== null) {
    window.clearTimeout(consoleHintTimer);
    consoleHintTimer = null;
  }
  if (consoleHintText) {
    consoleHintText.classList.remove("is-visible");
    consoleHintText.textContent = "";
  }
}

function showConsoleHint() {
  if (!consoleHintText || game.mode !== "console") {
    consoleHintTimer = null;
    return;
  }

  const hint = CONSOLE_HINTS[consoleHintIndex % CONSOLE_HINTS.length];
  consoleHintIndex += 1;
  const position = hint.positions[Math.floor(Math.random() * hint.positions.length)];
  consoleHintText.classList.remove("is-visible");
  consoleHintText.textContent = hint.text;
  consoleHintText.style.setProperty("--hint-x", `${position.x}%`);
  consoleHintText.style.setProperty("--hint-y", `${position.y}%`);
  void consoleHintText.offsetWidth;
  consoleHintText.classList.add("is-visible");

  const nextDelay = 5000 + Math.random() * 2400;
  consoleHintTimer = window.setTimeout(showConsoleHint, nextDelay);
}

function clearConsoleIncorrectFeedback() {
  if (consoleIncorrectTimer !== null) {
    window.clearTimeout(consoleIncorrectTimer);
    consoleIncorrectTimer = null;
  }
}

function restoreConsolePromptAfterIncorrect() {
  consoleIncorrectTimer = null;
  if (game.mode !== "console" || consoleHistory.length > 0) return;

  consoleDisplay.classList.remove("is-command-input");
  consoleDisplay.textContent = "> COMMAND?";
}

function showConsoleIncorrectFeedback() {
  clearConsoleIncorrectFeedback();
  consoleDisplay.classList.remove("is-command-input");
  consoleDisplay.textContent = "*incorrect*";
  consoleIncorrectTimer = window.setTimeout(restoreConsolePromptAfterIncorrect, 850);
}

function queueConsoleSuccessStep(callback, delay) {
  const timer = window.setTimeout(callback, delay);
  consoleSuccessTimers.push(timer);
}

function stopConsoleSuccessSequence() {
  consoleSuccessTimers.forEach((timer) => window.clearTimeout(timer));
  consoleSuccessTimers = [];

  if (consoleCallLayer) {
    consoleCallLayer.classList.remove("is-active", "is-bdash");
    consoleCallLayer.hidden = true;
  }

  if (consoleDisplay) {
    consoleDisplay.hidden = false;
  }
}

function startConsoleSuccessSequence() {
  stopConsoleHints();
  stopConsoleSuccessSequence();
  consoleHistory = [];
  game.mode = "consoleSuccess";

  consoleDisplay.classList.remove("is-command-input");
  consoleDisplay.textContent = "";
  consoleDisplay.hidden = true;

  if (!consoleCallLayer || !consoleCallMirin || !consoleCallBdash) {
    queueConsoleSuccessStep(showSecretTitle, 650);
    return;
  }

  consoleCallLayer.hidden = false;
  void consoleCallLayer.offsetWidth;
  consoleCallLayer.classList.add("is-active");

  queueConsoleSuccessStep(() => {
    if (game.mode !== "consoleSuccess" || !consoleCallLayer) return;
    consoleCallLayer.classList.add("is-bdash");
  }, CONSOLE_SUCCESS_TIMING.bdashDelay);

  queueConsoleSuccessStep(() => {
    if (game.mode !== "consoleSuccess") return;
    showSecretTitle();
  }, CONSOLE_SUCCESS_TIMING.finishDelay);
}

function showSecretTitle() {
  const settings = getModeSettings("secret");
  game.mode = "secretTitle";
  game.playMode = "secret";
  setBoost(false);
  hideScreens();
  secretTitleScreen.classList.remove("is-secret-bdash-enter");
  secretTitleScreen.hidden = false;
  void secretTitleScreen.offsetWidth;
  secretTitleScreen.classList.add("is-secret-bdash-enter");
  syncLayout();
  playBgm(settings.titleBgmKey, settings.bgmFallback.title);
}

function showStory(storyMode = "normal") {
  game.mode = "story";
  game.storyReturnMode = storyMode;
  storyBody.textContent = storyMode === "secret" ? SECRET_STORY_TEXT : STORY_TEXT;
  hideScreens();
  storyScreen.hidden = false;
  storyBody.scrollTop = 0;
  syncLayout();
  if (storyMode === "secret") {
    const settings = getModeSettings("secret");
    playBgm(settings.titleBgmKey, settings.bgmFallback.title);
    return;
  }
  playBgm("title");
}

function showStoryBack() {
  if (game.storyReturnMode === "secret") {
    showSecretTitle();
    return;
  }

  showTitle();
}

function showCredits() {
  game.mode = "credits";
  setBoost(false);
  hideScreens();
  creditsBody.textContent = CREDITS_TEXT;
  creditsScreen.hidden = false;
  creditsBody.scrollTop = 0;
  syncLayout();
  playBgm("title");
}

function startGame(playMode = "normal") {
  game.playMode = playMode;
  const settings = getModeSettings();
  resetGame();
  game.mode = "intro";
  game.introTimer = 0;
  game.backgroundOffset = game.titleProgress;
  game.player.x = -cfg.player.width - 16;
  game.player.y = cfg.groundY - cfg.player.height;
  game.player.vy = 0;
  game.player.grounded = true;
  game.lastTime = performance.now();
  hideScreens();
  syncLayout();
  playSound("start");
  playBgm(settings.playBgmKey, settings.bgmFallback.play);
}

function startGoalExit() {
  const settings = getModeSettings();
  game.mode = "goalExit";
  game.goalExitTimer = 0;
  game.goalRenderProgress = settings.courseLength + game.backgroundOffset;
  game.progress = settings.courseLength;
  game.player.y = cfg.groundY - cfg.player.height;
  game.player.vy = 0;
  game.player.grounded = true;
  setBoost(false);
  playSound("goal");
  syncLayout();
  updateHud();
}

function showResult(clear) {
  const settings = getModeSettings();
  const isNormalClear = clear && game.playMode === "normal";
  game.mode = "result";
  setBoost(false);
  game.resultWasClear = clear;

  if (clear) {
    game.lifeBonus = cfg.lifeBonus[game.life] || 0;
    game.score += game.lifeBonus;
  }

  resultStatus.textContent = clear ? (game.playMode === "secret" ? "B DASH CLEAR" : "ESCAPED!") : "GAME OVER";
  resultStatus.classList.toggle("is-long", clear && game.playMode === "secret");
  resultStatus.style.color = clear ? "#7cf7c1" : "#ff8da8";
  resultBirthday.hidden = !isNormalClear;
  resultScore.textContent = Math.floor(game.score).toString();
  resultLife.textContent = getRemainingLifeHearts(game.life);
  resultItems.textContent = game.itemsCollected.toString();
  resultHint.hidden = !isNormalClear;
  titleButton.textContent = game.playMode === "secret" ? "SECRET TITLE" : "TITLE";
  hideScreens();
  resultScreen.hidden = false;
  syncLayout();
  playBgm(settings.titleBgmKey, settings.bgmFallback.title);
  updateHud();
}

function showResultTitle() {
  if (game.playMode === "secret") {
    showSecretTitle();
    return;
  }

  showTitle();
}

function loop(time) {
  const delta = Math.min(0.033, (time - game.lastTime) / 1000 || 0);
  game.lastTime = time;

  if (game.mode === "playing") {
    update(delta);
  } else if (game.mode === "intro") {
    updateIntro(delta);
  } else if (game.mode === "goalExit") {
    updateGoalExit(delta);
  } else if (isShowcaseCanvasMode()) {
    updateTitleScene(delta);
  }

  draw(time);
  requestAnimationFrame(loop);
}

function updateTitleScene(delta) {
  const settings = getModeSettings();
  game.titleProgress += settings.baseSpeed * 0.45 * delta;
}

function updateIntro(delta) {
  const settings = getModeSettings();
  const runDuration = 0.85;
  const holdDuration = 0.34;
  const startX = -cfg.player.width - 16;
  game.introTimer += delta;
  game.backgroundOffset += settings.baseSpeed * delta;

  const runRatio = clamp(game.introTimer / runDuration, 0, 1);
  const eased = 1 - Math.pow(1 - runRatio, 3);
  game.player.x = startX + (cfg.playerX - startX) * eased;
  game.player.y = cfg.groundY - cfg.player.height;
  game.player.vy = 0;
  game.player.grounded = true;

  if (game.introTimer >= runDuration + holdDuration) {
    game.player.x = cfg.playerX;
    game.mode = "playing";
    game.lastTime = performance.now();
  }
}

function updateGoalExit(delta) {
  const settings = getModeSettings();
  const exitSpeed = Math.max(settings.baseSpeed, 300);
  game.goalExitTimer += delta;
  game.goalRenderProgress += exitSpeed * delta;
  game.player.x += exitSpeed * 1.15 * delta;
  game.player.y = cfg.groundY - cfg.player.height;
  game.player.vy = 0;
  game.player.grounded = true;

  if (game.player.x > cfg.canvasWidth + cfg.player.width + 8) {
    showResult(true);
  }
}

function update(delta) {
  const settings = getModeSettings();
  const boosted = input.boostHeld;
  const speed = boosted ? settings.boostSpeed : settings.baseSpeed;
  const scoreMultiplier = boosted ? settings.boostScoreMultiplier : 1;
  const advance = speed * delta;

  game.progress += advance;
  game.runScore += advance * cfg.runScoreRate * scoreMultiplier;
  game.score += advance * cfg.runScoreRate * scoreMultiplier;

  updatePlayer(delta);
  updateItems();
  updateCollisions();

  if (game.mode !== "playing") {
    updateHud();
    return;
  }

  if (game.invincibleTimer > 0) {
    game.invincibleTimer = Math.max(0, game.invincibleTimer - delta * 1000);
  }

  if (game.progress >= settings.courseLength) {
    startGoalExit();
  }

  updateHud();
}

function updatePlayer(delta) {
  const settings = getModeSettings();
  const player = game.player;
  player.vy += settings.gravity * delta;
  player.y += player.vy * delta;

  const floorY = cfg.groundY - cfg.player.height;
  if (player.y >= floorY) {
    player.y = floorY;
    player.vy = 0;
    player.grounded = true;
  } else {
    player.grounded = false;
  }

  if (player.damageFlash > 0) {
    player.damageFlash = Math.max(0, player.damageFlash - delta);
  }
}

function updateItems() {
  const settings = getModeSettings();
  game.items.forEach((item) => {
    if (item.collected) {
      if (item.pop > 0) item.pop -= 1;
      return;
    }

    const itemHitbox = getItemHitbox(item);
    if (isOverlapping(getPlayerHitbox(), itemHitbox)) {
      item.collected = true;
      item.pop = 18;
      if (item.effect === "life") {
        const nextLife = Math.min(settings.lifeCap, game.life + 1);
        item.popText = nextLife > game.life ? "+♥" : "";
        game.life = nextLife;
        updateHud();
        return;
      }

      game.itemsCollected += 1;
      const multiplier = input.boostHeld && settings.itemScoreAffectedByBoost ? settings.boostScoreMultiplier : 1;
      const gained = item.scoreValue * multiplier;
      game.itemScore += gained;
      game.score += gained;
      item.popText = `+${gained}`;
    }
  });
}

function updateCollisions() {
  if (game.invincibleTimer > 0) return;

  const playerHitbox = getPlayerHitbox();
  for (const obstacle of game.obstacles) {
    if (obstacle.hit) continue;
    const obstacleRect = getObstacleHitbox(obstacle);
    if (isOverlapping(playerHitbox, obstacleRect)) {
      obstacle.hit = true;
      damagePlayer();
      break;
    }
  }
}

function damagePlayer() {
  const settings = getModeSettings();
  game.life = Math.max(0, game.life - 1);
  game.invincibleTimer = settings.invincibleMs;
  game.player.damageFlash = settings.invincibleMs / 1000;
  if (settings.cancelBoostOnDamage) {
    setBoost(false);
  }

  if (game.life <= 0) {
    showResult(false);
  }
}

function jump() {
  const settings = getModeSettings();
  if (game.mode !== "playing") return;
  if (!game.player.grounded) return;
  game.player.vy = settings.jumpVelocity;
  game.player.grounded = false;
  playSound("jump");
}

function endJump() {
  const settings = getModeSettings();
  if (game.mode !== "playing") return;
  if (game.player.vy < settings.jumpCutVelocity) {
    game.player.vy = settings.jumpCutVelocity;
  }
}

function playSound(key) {
  if (!audio.enabled) return;
  const sound = audio.sounds.get(key);
  if (!sound) return;

  try {
    sound.currentTime = 0;
    const promise = sound.play();
    if (promise) {
      promise.catch(() => {});
    }
  } catch (error) {
    // Missing placeholder audio should never stop gameplay.
  }
}

function playBgm(key, fallbackKey) {
  if (!audio.enabled) return;
  const music = audio.bgm.get(key) || (fallbackKey ? audio.bgm.get(fallbackKey) : null);
  const activeKey = audio.bgm.get(key) ? key : fallbackKey;
  if (!music) return;
  if (audio.currentBgm === activeKey) return;

  audio.bgm.forEach((music, musicKey) => {
    if (musicKey !== activeKey) {
      music.pause();
      music.currentTime = 0;
    }
  });

  audio.currentBgm = activeKey;

  try {
    const promise = music.play();
    if (promise) {
      promise.catch(() => {});
    }
  } catch (error) {
    // Browser autoplay policy or missing files can be ignored in the MVP.
  }
}

function pressConsoleButton(value) {
  if (game.mode !== "console") return;

  clearConsoleIncorrectFeedback();
  consoleHistory.push(value);
  if (consoleHistory.length > SECRET_COMMAND.length) {
    consoleHistory.shift();
  }

  const isPrefix = consoleHistory.every((inputValue, index) => inputValue === SECRET_COMMAND[index]);
  if (!isPrefix) {
    consoleHistory = [];
    showConsoleIncorrectFeedback();
    return;
  }

  consoleDisplay.classList.add("is-command-input");
  consoleDisplay.textContent = consoleHistory.map((inputValue) => SECRET_SYMBOLS[inputValue]).join("");

  if (consoleHistory.length === SECRET_COMMAND.length) {
    startConsoleSuccessSequence();
  }
}

function setBoost(isHeld) {
  input.boostHeld = Boolean(isHeld && game.mode === "playing");
  boostButton.classList.toggle("is-held", input.boostHeld);
  updateHud();
}

function bindHoldButton(button, callback) {
  const holdStart = (event) => {
    event.preventDefault();
    callback(true);
  };
  const holdEnd = (event) => {
    event.preventDefault();
    callback(false);
  };

  button.addEventListener("pointerdown", holdStart);
  button.addEventListener("pointerup", holdEnd);
  button.addEventListener("pointercancel", holdEnd);
  button.addEventListener("pointerleave", holdEnd);
}

function onKeyDown(event) {
  if (game.mode === "console") {
    const keyMap = {
      ArrowUp: "UP",
      ArrowDown: "DOWN",
      ArrowLeft: "LEFT",
      ArrowRight: "RIGHT",
      KeyA: "A",
      KeyB: "B"
    };
    const value = keyMap[event.code];
    if (value) {
      event.preventDefault();
      pressConsoleButton(value);
      return;
    }
  }

  if (event.code === "Space") {
    event.preventDefault();
    if (event.repeat) return;
    jump();
  }

  if (event.code === "ShiftLeft" || event.code === "ShiftRight") {
    event.preventDefault();
    setBoost(true);
  }
}

function onKeyUp(event) {
  if (event.code === "Space") {
    event.preventDefault();
    endJump();
  }

  if (event.code === "ShiftLeft" || event.code === "ShiftRight") {
    event.preventDefault();
    setBoost(false);
  }
}

function updateHud() {
  const settings = getModeSettings();
  scoreLabel.textContent = Math.floor(game.score).toString();
  lifeLabel.textContent = getLifeHearts(game.life, settings.lifeCap);
}

function getLifeHearts(life, maxLife) {
  const total = Math.max(1, maxLife);
  const current = clamp(life, 0, total);
  return "♥".repeat(current) + "♡".repeat(total - current);
}

function getRemainingLifeHearts(life) {
  return "♥".repeat(Math.max(0, life));
}

function getPlayerHitbox() {
  const hb = cfg.player.hitbox;
  return {
    x: game.player.x + hb.offsetX,
    y: game.player.y + hb.offsetY,
    width: hb.width,
    height: hb.height
  };
}

function worldToScreenX(worldX) {
  return cfg.playerX + worldX - game.progress;
}

function getObstacleRect(obstacle) {
  return {
    x: worldToScreenX(obstacle.x),
    y: cfg.groundY - obstacle.height,
    width: obstacle.width,
    height: obstacle.height
  };
}

function getObstacleHitbox(obstacle) {
  const rect = getObstacleRect(obstacle);
  const hb = obstacle.hitbox || { offsetX: 0, offsetY: 0, width: rect.width, height: rect.height };
  return {
    x: rect.x + hb.offsetX,
    y: rect.y + hb.offsetY,
    width: hb.width,
    height: hb.height
  };
}

function getItemRect(item) {
  const width = item.width || cfg.itemSize;
  const height = item.height || cfg.itemSize;
  return {
    x: worldToScreenX(item.x),
    y: item.y,
    width,
    height
  };
}

function getItemHitbox(item) {
  const rect = getItemRect(item);
  const hb = item.hitbox || { offsetX: 0, offsetY: 0, width: rect.width, height: rect.height };
  return {
    x: rect.x + hb.offsetX,
    y: rect.y + hb.offsetY,
    width: hb.width,
    height: hb.height
  };
}

function isOverlapping(a, b) {
  return (
    a.x < b.x + b.width &&
    a.x + a.width > b.x &&
    a.y < b.y + b.height &&
    a.y + a.height > b.y
  );
}

function draw(time) {
  beginCanvasFrame();

  if (isShowcaseCanvasMode()) {
    drawShowcaseScene(time);
    return;
  }

  if (game.mode === "intro") {
    drawIntroScene(time);
    return;
  }

  if (game.mode === "goalExit") {
    drawGoalExitScene(time);
    return;
  }

  drawBackground(time);
  drawCourseProgress();
  drawItems(time);
  drawObstacles();
  drawPlayer(time);
}

function beginCanvasFrame() {
  if (!canvasView.preserveAspect) {
    ctx.clearRect(0, 0, cfg.canvasWidth, cfg.canvasHeight);
    return;
  }

  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "#07101f";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.setTransform(
    canvasView.scale,
    0,
    0,
    canvasView.scale,
    canvasView.offsetX,
    canvasView.offsetY
  );
}

function drawBackground(time) {
  const settings = getModeSettings();
  const progress = getRenderProgress();
  const basePath = ASSET_MANIFEST.background.base;
  const bgPath = ASSET_MANIFEST.background[settings.backgroundKey];
  const fallbackPath = ASSET_MANIFEST.background[settings.backgroundFallbackKey] || ASSET_MANIFEST.background.normal || ASSET_MANIFEST.background.main;
  const base = getImage(basePath);
  const bg = getImage(bgPath) || getImage(fallbackPath);
  const ground = getImage(ASSET_MANIFEST.background.ground);

  if (shouldDrawSecretDigitalBackground(settings)) {
    drawSecretDigitalBackground(time, cfg.canvasHeight, false);
  } else if (base) {
    ctx.drawImage(base, 0, 0, cfg.canvasWidth, cfg.canvasHeight);
  } else if (bg) {
    drawLoopingBackground(bg, cfg.background.scrollFactor);
  } else {
    ctx.fillStyle = "#07101f";
    ctx.fillRect(0, 0, cfg.canvasWidth, cfg.canvasHeight);
    ctx.fillStyle = "#101b34";
    for (let y = 76; y < cfg.groundY; y += 34) {
      ctx.fillRect(0, y, cfg.canvasWidth, 2);
    }
    ctx.fillStyle = "#1d3156";
    for (let x = -((progress * 0.25) % 70); x < cfg.canvasWidth; x += 70) {
      ctx.fillRect(x, 138 + Math.sin((time / 900) + x) * 8, 32, 88);
    }
    ctx.fillStyle = "#203f73";
    for (let x = -((progress * 0.55) % 46); x < cfg.canvasWidth; x += 46) {
      ctx.fillRect(x, cfg.groundY + 16, 24, 10);
    }
  }

  drawParallaxWindows();

  if (ground) {
    drawLoopingStrip(ground, cfg.groundY, ground.height, cfg.background.groundScrollFactor);
  } else {
    ctx.fillStyle = input.boostHeld ? "#dd385f" : "#245dcc";
    ctx.fillRect(0, cfg.groundY, cfg.canvasWidth, 8);
    ctx.fillStyle = "#0b0f1d";
    ctx.fillRect(0, cfg.groundY + 8, cfg.canvasWidth, cfg.canvasHeight - cfg.groundY - 8);
  }
}

function drawShowcaseScene(time) {
  const progress = game.mode === "result" && game.goalRenderProgress
    ? game.goalRenderProgress
    : game.titleProgress;
  const metrics = setShowcaseTransform();
  withRenderProgress(progress, () => {
    drawShowcaseBackground(time, metrics.height);
  });
}

function setShowcaseTransform() {
  const scale = canvas.width / cfg.canvasWidth || 1;
  const height = canvas.height / scale;
  ctx.setTransform(scale, 0, 0, scale, 0, 0);
  return { height };
}

function drawShowcaseBackground(time, height) {
  const settings = getModeSettings();
  const progress = getRenderProgress();
  const basePath = ASSET_MANIFEST.background.base;
  const bgPath = ASSET_MANIFEST.background[settings.backgroundKey];
  const fallbackPath = ASSET_MANIFEST.background[settings.backgroundFallbackKey] || ASSET_MANIFEST.background.normal || ASSET_MANIFEST.background.main;
  const base = getImage(basePath);
  const bg = getImage(bgPath) || getImage(fallbackPath);
  const ground = getImage(ASSET_MANIFEST.background.ground);

  if (shouldDrawSecretDigitalBackground(settings)) {
    drawSecretDigitalBackground(time, height, true);
  } else if (base) {
    ctx.drawImage(base, 0, 0, cfg.canvasWidth, height);
  } else if (bg) {
    ctx.drawImage(bg, 0, 0, cfg.canvasWidth, height);
  } else {
    ctx.fillStyle = "#07101f";
    ctx.fillRect(0, 0, cfg.canvasWidth, height);
    ctx.fillStyle = "#101b34";
    for (let y = 76; y < height; y += 34) {
      ctx.fillRect(0, y, cfg.canvasWidth, 2);
    }
    ctx.fillStyle = "#1d3156";
    for (let x = -((progress * 0.25) % 70); x < cfg.canvasWidth; x += 70) {
      ctx.fillRect(x, Math.min(height - 170, 138 + Math.sin((time / 900) + x) * 8), 32, 88);
    }
  }

  if (ground) {
    const showcaseGroundY = Math.max(0, height - ground.height);
    const showcaseWindowYShift = showcaseGroundY - cfg.groundY;
    drawParallaxWindows(showcaseWindowYShift);
    drawLoopingStrip(ground, showcaseGroundY, ground.height, cfg.background.groundScrollFactor);
  } else {
    const groundY = Math.max(0, height - 58);
    const showcaseWindowYShift = groundY - cfg.groundY;
    drawParallaxWindows(showcaseWindowYShift);
    ctx.fillStyle = "#245dcc";
    ctx.fillRect(0, groundY, cfg.canvasWidth, 8);
    ctx.fillStyle = "#0b0f1d";
    ctx.fillRect(0, groundY + 8, cfg.canvasWidth, height - groundY - 8);
  }
}

function shouldDrawSecretDigitalBackground(settings) {
  return settings.key === "secret"
    && cfg.background.secretDigital
    && cfg.background.secretDigital.enabled;
}

function drawSecretDigitalBackground(time, height, isShowcase) {
  const digital = cfg.background.secretDigital;
  const progress = getRenderProgress();
  const alpha = isShowcase ? digital.titleAlpha : digital.playAlpha;
  const scrollFactor = isShowcase ? digital.titleScrollFactor : digital.playScrollFactor;
  const horizonY = Math.min(height - 90, digital.horizonY);
  const bottomY = height;
  const topY = 0;
  const centerX = cfg.canvasWidth / 2;
  const travel = progress * scrollFactor;
  const perspectiveExtendX = digital.perspectiveExtendX || 0;

  ctx.fillStyle = digital.baseColor;
  ctx.fillRect(0, 0, cfg.canvasWidth, height);

  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.strokeStyle = digital.gridColor;
  ctx.lineWidth = 1;

  drawDigitalHorizontalGrid(horizonY, bottomY, digital.horizontalLines);
  drawDigitalHorizontalGrid(horizonY, topY, Math.max(5, Math.floor(digital.horizontalLines * 0.55)));
  drawDigitalPerspectiveGrid(centerX, horizonY, bottomY, travel, digital.verticalSpacing, perspectiveExtendX);
  drawDigitalPerspectiveGrid(centerX, horizonY, topY, travel * 0.55, digital.verticalSpacing * 1.2, perspectiveExtendX);

  ctx.globalAlpha = alpha * 0.45;
  ctx.strokeStyle = digital.accentColor;
  drawDigitalPerspectiveGrid(centerX + 42, horizonY, bottomY, travel * 0.8, digital.verticalSpacing * 1.65, perspectiveExtendX);

  ctx.globalAlpha = alpha * 0.32;
  ctx.fillStyle = digital.gridColor;
  for (let y = 18 + ((time / 180) % 6); y < height; y += 22) {
    ctx.fillRect(0, y, cfg.canvasWidth, 1);
  }

  drawDigitalCenterFade(centerX, horizonY, digital.centerFade, digital.baseColor);
  drawSecretDigitalParallaxLayers(digital, height, isShowcase);

  ctx.restore();
}

function drawSecretDigitalParallaxLayers(digital, height, isShowcase) {
  if (!digital.parallaxLayers || !digital.parallaxLayers.length) return;

  digital.parallaxLayers.forEach((layer) => {
    const imagePath = ASSET_MANIFEST.background[layer.assetKey];
    const image = getImage(imagePath);
    if (!image) return;

    const scrollFactor = isShowcase
      ? layer.titleScrollFactor
      : layer.playScrollFactor;
    const layerAlpha = isShowcase
      ? layer.titleAlpha ?? layer.alpha ?? 1
      : layer.playAlpha ?? layer.alpha ?? 1;

    ctx.save();
    ctx.globalAlpha = layerAlpha;
    drawLoopingBackgroundLayer(image, height, scrollFactor || 0);
    ctx.restore();
  });
}

function drawDigitalHorizontalGrid(horizonY, edgeY, count) {
  const distance = edgeY - horizonY;
  if (Math.abs(distance) < 1) return;

  ctx.beginPath();
  for (let index = 1; index <= count; index += 1) {
    const ratio = index / count;
    const y = horizonY + distance * ratio * ratio;
    ctx.moveTo(0, y);
    ctx.lineTo(cfg.canvasWidth, y);
  }
  ctx.stroke();
}

function drawDigitalPerspectiveGrid(centerX, horizonY, edgeY, travel, spacing, extendX = 0) {
  const offset = -positiveModulo(travel, spacing);
  const start = -spacing * 2 - extendX + offset;

  ctx.beginPath();
  for (let x = start; x <= cfg.canvasWidth + spacing * 2 + extendX; x += spacing) {
    const horizonX = centerX + (x - centerX) * 0.08;
    ctx.moveTo(horizonX, horizonY);
    ctx.lineTo(x, edgeY);
  }
  ctx.stroke();
}

function drawDigitalCenterFade(centerX, horizonY, fade, baseColor) {
  if (!fade || !fade.enabled) return;

  const height = fade.height || 74;
  const alpha = fade.alpha || 0.55;

  ctx.save();
  ctx.globalAlpha = 1;
  if (fade.mode === "band") {
    const y = horizonY + (fade.yOffset || 0) - (height / 2);
    const feather = Math.max(0, Math.min(height / 2, fade.feather || 0));
    if (feather > 0) {
      const edgeStop = feather / height;
      const gradient = ctx.createLinearGradient(0, y, 0, y + height);
      gradient.addColorStop(0, colorWithAlpha(baseColor, 0));
      gradient.addColorStop(edgeStop, colorWithAlpha(baseColor, alpha));
      gradient.addColorStop(1 - edgeStop, colorWithAlpha(baseColor, alpha));
      gradient.addColorStop(1, colorWithAlpha(baseColor, 0));
      ctx.fillStyle = gradient;
    } else {
      ctx.fillStyle = colorWithAlpha(baseColor, alpha);
    }
    ctx.fillRect(0, y, cfg.canvasWidth, height);
    ctx.restore();
    return;
  }

  const width = fade.width || 120;
  ctx.translate(centerX, horizonY);
  ctx.scale(width / 2, height / 2);
  const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, 1);
  gradient.addColorStop(0, colorWithAlpha(baseColor, alpha));
  gradient.addColorStop(0.6, colorWithAlpha(baseColor, alpha * 0.72));
  gradient.addColorStop(1, colorWithAlpha(baseColor, 0));
  ctx.fillStyle = gradient;
  ctx.fillRect(-1, -1, 2, 2);
  ctx.restore();
}

function colorWithAlpha(hexColor, alpha) {
  const hex = hexColor.replace("#", "");
  if (hex.length !== 6) {
    return `rgba(5, 7, 14, ${alpha})`;
  }

  const red = parseInt(hex.slice(0, 2), 16);
  const green = parseInt(hex.slice(2, 4), 16);
  const blue = parseInt(hex.slice(4, 6), 16);
  return `rgba(${red}, ${green}, ${blue}, ${alpha})`;
}

function positiveModulo(value, modulo) {
  return ((value % modulo) + modulo) % modulo;
}

function drawIntroScene(time) {
  withRenderProgress(game.backgroundOffset, () => {
    drawBackground(time);
  });
  drawPlayer(time);

  if (game.introTimer >= 0.85) {
    drawSceneMessage("START!");
  }
}

function drawGoalExitScene(time) {
  withRenderProgress(game.goalRenderProgress, () => {
    drawBackground(time);
  });
  drawCourseProgress();
  drawPlayer(time);
  drawSceneMessage("GOAL!");
}

function drawSceneMessage(text) {
  ctx.save();
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.font = `28px ${cfg.fontFamily}`;
  ctx.lineWidth = 5;
  ctx.strokeStyle = "#07101f";
  ctx.strokeText(text, cfg.canvasWidth / 2, 168);
  ctx.fillStyle = "#7cf7c1";
  ctx.fillText(text, cfg.canvasWidth / 2, 168);
  ctx.restore();
}

function withRenderProgress(progress, callback) {
  const previous = renderProgressOverride;
  renderProgressOverride = progress;
  callback();
  renderProgressOverride = previous;
}

function getRenderProgress() {
  return renderProgressOverride === null ? game.progress + game.backgroundOffset : renderProgressOverride;
}

function drawParallaxWindows(yShift = 0) {
  const windowConfig = cfg.background.windows;
  if (!windowConfig || !windowConfig.enabled) return;

  const far = getImage(ASSET_MANIFEST.background.windowFar);
  if (!far) return;

  const loopWidth = Math.max(cfg.canvasWidth, windowConfig.loopWidth || cfg.canvasWidth);
  const travel = (getRenderProgress() * windowConfig.scrollFactor) % loopWidth;

  for (let repeat = -1; repeat <= 1; repeat += 1) {
    windowConfig.entries.forEach((entry) => {
      const x = entry.x + repeat * loopWidth - travel;
      if (x + entry.width < -8 || x > cfg.canvasWidth + 8) return;
      drawParallaxWindow(entry, x, far, yShift);
    });
  }
}

function drawParallaxWindow(entry, x, far, yShift = 0) {
  const y = entry.y + yShift;
  const width = entry.width;
  const height = entry.height;
  const mask = getImage(ASSET_MANIFEST.background.windowMask);

  if (mask) {
    drawMaskedWindowInterior(entry, x, y, far, mask, yShift);
  } else {
    drawEllipseWindowInterior(entry, x, y, far, yShift);
  }

  const framePath = ASSET_MANIFEST.background.windowFrames[entry.frame];
  const frame = getImage(framePath);
  if (frame) {
    ctx.drawImage(frame, x, y, width, height);
  } else {
    ctx.strokeStyle = entry.tint;
    ctx.lineWidth = 3;
    ctx.strokeRect(x, y, width, height);
  }
}

function drawMaskedWindowInterior(entry, x, y, far, mask, yShift = 0) {
  const width = entry.width;
  const height = entry.height;
  const scratch = getScratchCanvas(width, height);
  const buffer = scratch.canvas;
  const bufferCtx = scratch.context;

  bufferCtx.setTransform(1, 0, 0, 1, 0, 0);
  bufferCtx.clearRect(0, 0, width, height);
  drawWindowFarLayerInto(bufferCtx, far, x, y, yShift);
  bufferCtx.globalCompositeOperation = "source-over";
  bufferCtx.fillStyle = colorWithAlpha(entry.tint, cfg.background.windows.tintAlpha);
  bufferCtx.fillRect(0, 0, width, height);
  bufferCtx.globalCompositeOperation = "destination-in";
  bufferCtx.drawImage(mask, 0, 0, width, height);
  bufferCtx.globalCompositeOperation = "source-over";
  ctx.drawImage(buffer, x, y, width, height);
}

function getScratchCanvas(width, height) {
  const key = `${width}x${height}`;
  let scratch = scratchCanvases.get(key);

  if (!scratch) {
    const canvasElement = document.createElement("canvas");
    canvasElement.width = width;
    canvasElement.height = height;
    scratch = {
      canvas: canvasElement,
      context: canvasElement.getContext("2d")
    };
    scratchCanvases.set(key, scratch);
  }

  return scratch;
}

function drawEllipseWindowInterior(entry, x, y, far, yShift = 0) {
  const width = entry.width;
  const height = entry.height;
  const insetX = 10;
  const insetY = 7;
  const clipX = x + insetX;
  const clipY = y + insetY;
  const clipW = Math.max(1, width - insetX * 2);
  const clipH = Math.max(1, height - insetY * 2);

  ctx.save();
  ctx.beginPath();
  ctx.ellipse(
    clipX + clipW / 2,
    clipY + clipH / 2,
    clipW / 2,
    clipH / 2,
    0,
    0,
    Math.PI * 2
  );
  ctx.clip();
  drawWindowFarLayer(far, cfg.background.windows.farScrollFactor, yShift);
  ctx.fillStyle = colorWithAlpha(entry.tint, cfg.background.windows.tintAlpha);
  ctx.fillRect(x, y, width, height);
  ctx.restore();
}

function drawWindowFarLayer(image, scrollFactor, yShift = 0) {
  const scale = cfg.canvasHeight / image.height;
  const width = Math.max(1, image.width * scale);
  const offset = -((getRenderProgress() * scrollFactor) % width);

  for (let x = offset - width; x < cfg.canvasWidth + width; x += width) {
    ctx.drawImage(image, x, yShift, width, cfg.canvasHeight);
  }
}

function drawWindowFarLayerInto(targetCtx, image, targetX, targetY, yShift = 0) {
  const scale = cfg.canvasHeight / image.height;
  const width = Math.max(1, image.width * scale);
  const offset = -((getRenderProgress() * cfg.background.windows.farScrollFactor) % width);

  for (let x = offset - width; x < cfg.canvasWidth + width; x += width) {
    targetCtx.drawImage(image, x - targetX, yShift - targetY, width, cfg.canvasHeight);
  }
}

function colorWithAlpha(hex, alpha) {
  const value = hex.replace("#", "");
  if (value.length !== 6) return hex;
  const red = parseInt(value.slice(0, 2), 16);
  const green = parseInt(value.slice(2, 4), 16);
  const blue = parseInt(value.slice(4, 6), 16);
  return `rgba(${red}, ${green}, ${blue}, ${alpha})`;
}

function drawLoopingBackground(bg, scrollFactor) {
  if (!cfg.background.loop) {
    ctx.drawImage(bg, 0, 0, cfg.canvasWidth, cfg.canvasHeight);
    return;
  }

  drawLoopingBackgroundLayer(bg, cfg.canvasHeight, scrollFactor);
}

function drawLoopingBackgroundLayer(bg, height, scrollFactor) {
  const scale = height / bg.height;
  const width = Math.max(1, bg.width * scale);
  const offset = -((getRenderProgress() * scrollFactor) % width);

  for (let x = offset; x < cfg.canvasWidth; x += width) {
    ctx.drawImage(bg, x, 0, width, height);
  }
}

function drawLoopingStrip(image, y, height, scrollFactor) {
  const width = Math.max(1, image.width);
  const offset = -((getRenderProgress() * scrollFactor) % width);

  for (let x = offset; x < cfg.canvasWidth; x += width) {
    ctx.drawImage(image, x, y, width, height);
  }
}

function drawCourseProgress() {
  const settings = getModeSettings();
  const barX = 20;
  const barY = cfg.canvasHeight - 24;
  const barW = cfg.canvasWidth - 40;
  const ratio = Math.min(1, game.progress / settings.courseLength);
  ctx.fillStyle = "#1b2a4d";
  ctx.fillRect(barX, barY, barW, 8);
  ctx.fillStyle = "#7cf7c1";
  ctx.fillRect(barX, barY, barW * ratio, 8);
  ctx.fillStyle = "#f7fbff";
  ctx.font = `10px ${cfg.fontFamily}`;
  ctx.fillText(settings.finishLabel, barX + barW - 48, barY - 4);
}

function drawPlayer(time) {
  const player = game.player;
  const isDamaged = game.invincibleTimer > 0 || player.damageFlash > 0;
  if (isDamaged && Math.floor(time / 90) % 2 === 0) return;

  let path = null;
  if (isDamaged) {
    path = ASSET_MANIFEST.player.damage[0];
  } else if (!player.grounded) {
    path = player.vy < 0 ? ASSET_MANIFEST.player.jumpUp[0] : ASSET_MANIFEST.player.jumpDown[0];
  } else {
    const animationFps = input.boostHeld ? cfg.player.boostAnimationFps : cfg.player.animationFps;
    const frame = Math.floor(time / (1000 / animationFps)) % ASSET_MANIFEST.player.run.length;
    path = ASSET_MANIFEST.player.run[frame];
  }

  const image = path ? getImage(path) : null;
  if (image) {
    ctx.drawImage(image, player.x, player.y, cfg.player.width, cfg.player.height);
  } else {
    drawPlaceholderPlayer(player.x, player.y, cfg.player.width, cfg.player.height, player.grounded, isDamaged);
  }
}

function drawPlaceholderPlayer(x, y, width, height, grounded, damaged) {
  ctx.fillStyle = damaged ? "#ff8da8" : "#d5335c";
  ctx.fillRect(x, y + 8, width, height - 8);
  ctx.fillStyle = "#f7fbff";
  ctx.fillRect(x + 9, y, width - 18, 18);
  ctx.fillStyle = grounded ? "#2466c9" : "#7cf7c1";
  ctx.fillRect(x + 8, y + height - 16, 12, 16);
  ctx.fillRect(x + width - 20, y + height - 16, 12, 16);
  ctx.fillStyle = "#07101f";
  ctx.font = `9px ${cfg.fontFamily}`;
  ctx.fillText(cfg.placeholderLabel, x + 7, y + 34);
}

function drawObstacles() {
  game.obstacles.forEach((obstacle) => {
    const rect = getObstacleRect(obstacle);
    if (rect.x + rect.width < -20 || rect.x > cfg.canvasWidth + 40) return;

    const path = ASSET_MANIFEST.obstacles[obstacle.spriteKey];
    const image = path ? getImage(path) : null;
    if (image) {
      ctx.drawImage(image, rect.x, rect.y, rect.width, rect.height);
    } else {
      drawPlaceholderObstacle(rect, obstacle.type);
    }
  });
}

function drawPlaceholderObstacle(rect, label) {
  ctx.fillStyle = "#343f5f";
  ctx.fillRect(rect.x, rect.y, rect.width, rect.height);
  ctx.strokeStyle = "#ffdde6";
  ctx.lineWidth = 2;
  ctx.strokeRect(rect.x + 1, rect.y + 1, rect.width - 2, rect.height - 2);
  ctx.fillStyle = "#f7fbff";
  ctx.font = `8px ${cfg.fontFamily}`;
  ctx.fillText(label.toUpperCase(), rect.x + 4, rect.y + Math.max(13, rect.height / 2));
}

function drawItems(time) {
  game.items.forEach((item) => {
    const rect = getItemRect(item);
    if (rect.x + rect.width < -20 || rect.x > cfg.canvasWidth + 40) return;

    if (item.collected) {
      if (item.pop > 0 && item.popText) {
        ctx.globalAlpha = item.pop / 18;
        ctx.fillStyle = "#7cf7c1";
        ctx.font = `14px ${cfg.fontFamily}`;
        ctx.fillText(item.popText, rect.x, rect.y - (18 - item.pop));
        ctx.globalAlpha = 1;
      }
      return;
    }

    const path = getItemImagePath(item, time);
    const image = path ? getImage(path) : null;
    if (image) {
      ctx.drawImage(image, rect.x, rect.y, rect.width, rect.height);
    } else {
      drawPlaceholderItem(rect, item.type);
    }
  });
}

function getItemImagePath(item, time) {
  const entry = ASSET_MANIFEST.items[item.spriteKey];
  if (!Array.isArray(entry)) return entry;
  const frame = Math.floor(time / 160) % entry.length;
  return entry[frame];
}

function drawPlaceholderItem(rect, label) {
  ctx.fillStyle = "#7cf7c1";
  ctx.beginPath();
  ctx.moveTo(rect.x + rect.width / 2, rect.y);
  ctx.lineTo(rect.x + rect.width, rect.y + rect.height / 2);
  ctx.lineTo(rect.x + rect.width / 2, rect.y + rect.height);
  ctx.lineTo(rect.x, rect.y + rect.height / 2);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = "#07101f";
  ctx.font = `8px ${cfg.fontFamily}`;
  ctx.fillText(label.slice(0, 4).toUpperCase(), rect.x + 3, rect.y + 16);
}

function drawAttractScene(time) {
  const pulse = 0.5 + Math.sin(time / 350) * 0.5;
  ctx.globalAlpha = 0.25 + pulse * 0.15;
  ctx.fillStyle = "#f7fbff";
  ctx.font = `18px ${cfg.fontFamily}`;
  ctx.fillText("TEMP CANVAS PREVIEW", 68, 252);
  ctx.globalAlpha = 1;
}
