"use strict";

const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const scoreLabel = document.getElementById("scoreLabel");
const lifeLabel = document.getElementById("lifeLabel");
const boostLabel = document.getElementById("boostLabel");
const titleScreen = document.getElementById("titleScreen");
const consoleScreen = document.getElementById("consoleScreen");
const secretTitleScreen = document.getElementById("secretTitleScreen");
const storyScreen = document.getElementById("storyScreen");
const resultScreen = document.getElementById("resultScreen");
const consoleDisplay = document.getElementById("consoleDisplay");
const storyBody = document.getElementById("storyBody");
const resultStatus = document.getElementById("resultStatus");
const resultScore = document.getElementById("resultScore");
const resultLife = document.getElementById("resultLife");
const resultItems = document.getElementById("resultItems");
const startButton = document.getElementById("startButton");
const secretStartButton = document.getElementById("secretStartButton");
const normalModeButton = document.getElementById("normalModeButton");
const consoleButton = document.getElementById("consoleButton");
const consoleBackButton = document.getElementById("consoleBackButton");
const storyButton = document.getElementById("storyButton");
const secretStoryButton = document.getElementById("secretStoryButton");
const storyBackButton = document.getElementById("storyBackButton");
const retryButton = document.getElementById("retryButton");
const titleButton = document.getElementById("titleButton");
const jumpButton = document.getElementById("jumpButton");
const boostButton = document.getElementById("boostButton");

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

const SECRET_COMMAND = ["UP", "UP", "DOWN", "DOWN", "A", "B", "A", "B"];
const SECRET_SYMBOLS = {
  UP: "↑",
  DOWN: "↓",
  LEFT: "←",
  RIGHT: "→",
  A: "A",
  B: "B"
};

const game = {
  mode: "title",
  playMode: "normal",
  storyReturnMode: "normal",
  lastTime: 0,
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

storyBody.textContent = STORY_TEXT;
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
secretStoryButton.addEventListener("click", () => showStory("secret"));
storyBackButton.addEventListener("click", showStoryBack);
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
  syncAppHeight();
  resizeCanvas();
}

function syncAppHeight() {
  const viewport = window.visualViewport;
  const height = viewport ? viewport.height : window.innerHeight;
  const width = viewport ? viewport.width : window.innerWidth;
  if (!height) return;
  const controlHeight = clamp(height * 0.2, 96, 144);
  const gameHeight = Math.max(1, height - controlHeight - 24);
  const maxAppWidth = (cfg.layout && cfg.layout.maxAppWidth) || 900;
  const appWidth = isCanvasAspectPreserved()
    ? Math.min(width || 480, (gameHeight * cfg.canvasWidth / cfg.canvasHeight) + 20, maxAppWidth)
    : Math.min(width || 480, 480);
  document.documentElement.style.setProperty("--app-height", `${Math.floor(height)}px`);
  document.documentElement.style.setProperty("--app-width", `${Math.floor(appWidth)}px`);
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function isCanvasAspectPreserved() {
  return !cfg.layout || cfg.layout.preserveCanvasAspect !== false;
}

function hideScreens() {
  titleScreen.hidden = true;
  consoleScreen.hidden = true;
  secretTitleScreen.hidden = true;
  storyScreen.hidden = true;
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
  playBgm("title");
}

function showConsole() {
  game.mode = "console";
  consoleHistory = [];
  setBoost(false);
  hideScreens();
  consoleDisplay.textContent = "READY";
  consoleScreen.hidden = false;
  playBgm("title");
}

function showSecretTitle() {
  const settings = getModeSettings("secret");
  game.mode = "secretTitle";
  game.playMode = "secret";
  setBoost(false);
  hideScreens();
  secretTitleScreen.hidden = false;
  playBgm(settings.titleBgmKey, settings.bgmFallback.title);
}

function showStory(storyMode = "normal") {
  game.mode = "story";
  game.storyReturnMode = storyMode;
  storyBody.textContent = storyMode === "secret" ? SECRET_STORY_TEXT : STORY_TEXT;
  hideScreens();
  storyScreen.hidden = false;
  storyBody.scrollTop = 0;
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

function startGame(playMode = "normal") {
  game.playMode = playMode;
  const settings = getModeSettings();
  resetGame();
  game.mode = "playing";
  game.lastTime = performance.now();
  hideScreens();
  playSound("start");
  playBgm(settings.playBgmKey, settings.bgmFallback.play);
}

function showResult(clear) {
  const settings = getModeSettings();
  game.mode = "result";
  setBoost(false);
  game.resultWasClear = clear;

  if (clear) {
    game.lifeBonus = cfg.lifeBonus[game.life] || 0;
    game.score += game.lifeBonus;
  }

  resultStatus.textContent = clear ? (game.playMode === "secret" ? "B DASH CLEAR" : "ESCAPED") : "GAME OVER";
  resultStatus.style.color = clear ? "#7cf7c1" : "#ff8da8";
  resultScore.textContent = Math.floor(game.score).toString();
  resultLife.textContent = game.life.toString();
  resultItems.textContent = game.itemsCollected.toString();
  titleButton.textContent = game.playMode === "secret" ? "SECRET TITLE" : "TITLE";
  hideScreens();
  resultScreen.hidden = false;
  if (clear) {
    playSound("goal");
  }
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
  }

  draw(time);
  requestAnimationFrame(loop);
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
    showResult(true);
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

    const itemRect = getItemRect(item);
    if (isOverlapping(getPlayerHitbox(), itemRect)) {
      item.collected = true;
      item.pop = 18;
      game.itemsCollected += 1;
      const multiplier = input.boostHeld && settings.itemScoreAffectedByBoost ? settings.boostScoreMultiplier : 1;
      const gained = item.scoreValue * multiplier;
      game.itemScore += gained;
      game.score += gained;
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

  consoleHistory.push(value);
  if (consoleHistory.length > SECRET_COMMAND.length) {
    consoleHistory.shift();
  }

  const isPrefix = consoleHistory.every((inputValue, index) => inputValue === SECRET_COMMAND[index]);
  if (!isPrefix) {
    consoleHistory = [];
    consoleDisplay.textContent = "....";
    return;
  }

  consoleDisplay.textContent = consoleHistory.map((inputValue) => SECRET_SYMBOLS[inputValue]).join(" ");

  if (consoleHistory.length === SECRET_COMMAND.length) {
    consoleDisplay.textContent = cfg.secretMode.title;
    game.mode = "consoleSuccess";
    window.setTimeout(showSecretTitle, 650);
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
  lifeLabel.textContent = game.life.toString();
  boostLabel.textContent = input.boostHeld ? `x${settings.boostScoreMultiplier.toFixed(1)}` : "x1.0";
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
  return {
    x: worldToScreenX(item.x),
    y: item.y,
    width: cfg.itemSize,
    height: cfg.itemSize
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
  drawBackground(time);
  drawCourseProgress();
  drawItems();
  drawObstacles();
  drawPlayer(time);

  if (game.mode === "title") {
    drawAttractScene(time);
  }
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
  const basePath = ASSET_MANIFEST.background.base;
  const bgPath = ASSET_MANIFEST.background[settings.backgroundKey];
  const fallbackPath = ASSET_MANIFEST.background[settings.backgroundFallbackKey] || ASSET_MANIFEST.background.normal || ASSET_MANIFEST.background.main;
  const base = getImage(basePath);
  const bg = getImage(bgPath) || getImage(fallbackPath);
  const ground = getImage(ASSET_MANIFEST.background.ground);

  if (base) {
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
    for (let x = -((game.progress * 0.25) % 70); x < cfg.canvasWidth; x += 70) {
      ctx.fillRect(x, 138 + Math.sin((time / 900) + x) * 8, 32, 88);
    }
    ctx.fillStyle = "#203f73";
    for (let x = -((game.progress * 0.55) % 46); x < cfg.canvasWidth; x += 46) {
      ctx.fillRect(x, cfg.groundY + 16, 24, 10);
    }
  }

  if (ground) {
    drawLoopingStrip(ground, cfg.groundY, ground.height, cfg.background.groundScrollFactor);
  } else {
    ctx.fillStyle = input.boostHeld ? "#dd385f" : "#245dcc";
    ctx.fillRect(0, cfg.groundY, cfg.canvasWidth, 8);
    ctx.fillStyle = "#0b0f1d";
    ctx.fillRect(0, cfg.groundY + 8, cfg.canvasWidth, cfg.canvasHeight - cfg.groundY - 8);
  }
}

function drawLoopingBackground(bg, scrollFactor) {
  if (!cfg.background.loop) {
    ctx.drawImage(bg, 0, 0, cfg.canvasWidth, cfg.canvasHeight);
    return;
  }

  const scale = cfg.canvasHeight / bg.height;
  const width = Math.max(1, bg.width * scale);
  const offset = -((game.progress * scrollFactor) % width);

  for (let x = offset; x < cfg.canvasWidth; x += width) {
    ctx.drawImage(bg, x, 0, width, cfg.canvasHeight);
  }
}

function drawLoopingStrip(image, y, height, scrollFactor) {
  const width = Math.max(1, image.width);
  const offset = -((game.progress * scrollFactor) % width);

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
  const isDamaged = game.invincibleTimer > 0;
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

function drawItems() {
  game.items.forEach((item) => {
    const rect = getItemRect(item);
    if (rect.x + rect.width < -20 || rect.x > cfg.canvasWidth + 40) return;

    if (item.collected) {
      if (item.pop > 0) {
        ctx.globalAlpha = item.pop / 18;
        ctx.fillStyle = "#7cf7c1";
        ctx.font = `14px ${cfg.fontFamily}`;
        ctx.fillText(`+${item.scoreValue}`, rect.x, rect.y - (18 - item.pop));
        ctx.globalAlpha = 1;
      }
      return;
    }

    const path = ASSET_MANIFEST.items[item.spriteKey];
    const image = path ? getImage(path) : null;
    if (image) {
      ctx.drawImage(image, rect.x, rect.y, rect.width, rect.height);
    } else {
      drawPlaceholderItem(rect, item.type);
    }
  });
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
