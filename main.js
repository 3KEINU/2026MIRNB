"use strict";

const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const scoreLabel = document.getElementById("scoreLabel");
const lifeLabel = document.getElementById("lifeLabel");
const boostLabel = document.getElementById("boostLabel");
const titleScreen = document.getElementById("titleScreen");
const storyScreen = document.getElementById("storyScreen");
const resultScreen = document.getElementById("resultScreen");
const storyBody = document.getElementById("storyBody");
const resultStatus = document.getElementById("resultStatus");
const resultScore = document.getElementById("resultScore");
const resultLife = document.getElementById("resultLife");
const resultItems = document.getElementById("resultItems");
const startButton = document.getElementById("startButton");
const storyButton = document.getElementById("storyButton");
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

const game = {
  mode: "title",
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

storyBody.textContent = STORY_TEXT;
resizeCanvas();
resetGame();
showTitle();
requestAnimationFrame(loop);

window.addEventListener("resize", resizeCanvas);
window.addEventListener("keydown", onKeyDown);
window.addEventListener("keyup", onKeyUp);
window.addEventListener("blur", () => setBoost(false));
document.addEventListener("contextmenu", (event) => event.preventDefault());

startButton.addEventListener("click", startGame);
retryButton.addEventListener("click", startGame);
titleButton.addEventListener("click", showTitle);
storyButton.addEventListener("click", showStory);
storyBackButton.addEventListener("click", showTitle);
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
    const sound = new Audio(path);
    sound.preload = "auto";
    store.sounds.set(key, sound);
  });

  Object.entries(manifest.bgm || {}).forEach(([key, path]) => {
    const music = new Audio(path);
    music.preload = "auto";
    music.loop = true;
    store.bgm.set(key, music);
  });

  return store;
}

function collectPaths(value, paths) {
  if (typeof value === "string") {
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

function resizeCanvas() {
  const rect = canvas.getBoundingClientRect();
  const ratio = Math.max(1, Math.min(window.devicePixelRatio || 1, 3));
  canvas.width = Math.floor(rect.width * ratio);
  canvas.height = Math.floor(rect.height * ratio);
  ctx.setTransform(
    canvas.width / cfg.canvasWidth,
    0,
    0,
    canvas.height / cfg.canvasHeight,
    0,
    0
  );
}

function resetGame() {
  game.progress = 0;
  game.score = 0;
  game.itemScore = 0;
  game.runScore = 0;
  game.lifeBonus = 0;
  game.itemsCollected = 0;
  game.life = cfg.maxLife;
  game.invincibleTimer = 0;
  game.resultWasClear = false;
  game.player.x = cfg.playerX;
  game.player.y = cfg.groundY - cfg.player.height;
  game.player.vy = 0;
  game.player.grounded = true;
  game.player.damageFlash = 0;
  game.obstacles = COURSE_OBSTACLES.map((obstacle) => ({ ...obstacle, hit: false }));
  game.items = COURSE_ITEMS.map((item) => ({ ...item, collected: false, pop: 0 }));
  setBoost(false);
  updateHud();
}

function showTitle() {
  game.mode = "title";
  setBoost(false);
  titleScreen.hidden = false;
  storyScreen.hidden = true;
  resultScreen.hidden = true;
  playBgm("title");
}

function showStory() {
  game.mode = "story";
  titleScreen.hidden = true;
  storyScreen.hidden = false;
  resultScreen.hidden = true;
  storyBody.scrollTop = 0;
  playBgm("title");
}

function startGame() {
  resetGame();
  game.mode = "playing";
  game.lastTime = performance.now();
  titleScreen.hidden = true;
  storyScreen.hidden = true;
  resultScreen.hidden = true;
  playSound("start");
  playBgm("play");
}

function showResult(clear) {
  game.mode = "result";
  setBoost(false);
  game.resultWasClear = clear;

  if (clear) {
    game.lifeBonus = cfg.lifeBonus[game.life] || 0;
    game.score += game.lifeBonus;
  }

  resultStatus.textContent = clear ? "ESCAPED" : "GAME OVER";
  resultStatus.style.color = clear ? "#7cf7c1" : "#ff8da8";
  resultScore.textContent = Math.floor(game.score).toString();
  resultLife.textContent = game.life.toString();
  resultItems.textContent = game.itemsCollected.toString();
  resultScreen.hidden = false;
  titleScreen.hidden = true;
  storyScreen.hidden = true;
  if (clear) {
    playSound("goal");
  }
  playBgm("title");
  updateHud();
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
  const boosted = input.boostHeld;
  const speed = boosted ? cfg.boostSpeed : cfg.baseSpeed;
  const scoreMultiplier = boosted ? cfg.boostScoreMultiplier : 1;
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

  if (game.progress >= cfg.courseLength) {
    showResult(true);
  }

  updateHud();
}

function updatePlayer(delta) {
  const player = game.player;
  player.vy += cfg.gravity * delta;
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
      const multiplier = input.boostHeld && cfg.itemScoreAffectedByBoost ? cfg.boostScoreMultiplier : 1;
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
  game.life = Math.max(0, game.life - 1);
  game.invincibleTimer = cfg.invincibleMs;
  game.player.damageFlash = cfg.invincibleMs / 1000;
  if (cfg.cancelBoostOnDamage) {
    setBoost(false);
  }

  if (game.life <= 0) {
    showResult(false);
  }
}

function jump() {
  if (game.mode !== "playing") return;
  if (!game.player.grounded) return;
  game.player.vy = cfg.jumpVelocity;
  game.player.grounded = false;
  playSound("jump");
}

function endJump() {
  if (game.mode !== "playing") return;
  if (game.player.vy < cfg.jumpCutVelocity) {
    game.player.vy = cfg.jumpCutVelocity;
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

function playBgm(key) {
  if (!audio.enabled) return;
  if (audio.currentBgm === key) return;

  audio.bgm.forEach((music, musicKey) => {
    if (musicKey !== key) {
      music.pause();
      music.currentTime = 0;
    }
  });

  const music = audio.bgm.get(key);
  audio.currentBgm = key;
  if (!music) return;

  try {
    const promise = music.play();
    if (promise) {
      promise.catch(() => {});
    }
  } catch (error) {
    // Browser autoplay policy or missing files can be ignored in the MVP.
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
  scoreLabel.textContent = Math.floor(game.score).toString();
  lifeLabel.textContent = game.life.toString();
  boostLabel.textContent = input.boostHeld ? `x${cfg.boostScoreMultiplier.toFixed(1)}` : "x1.0";
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
  ctx.clearRect(0, 0, cfg.canvasWidth, cfg.canvasHeight);
  drawBackground(time);
  drawCourseProgress();
  drawItems();
  drawObstacles();
  drawPlayer(time);

  if (game.mode === "title") {
    drawAttractScene(time);
  }
}

function drawBackground(time) {
  const bgPath = ASSET_MANIFEST.background.main;
  const bg = getImage(bgPath);
  if (bg) {
    drawLoopingBackground(bg);
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

  ctx.fillStyle = input.boostHeld ? "#dd385f" : "#245dcc";
  ctx.fillRect(0, cfg.groundY, cfg.canvasWidth, 8);
  ctx.fillStyle = "#0b0f1d";
  ctx.fillRect(0, cfg.groundY + 8, cfg.canvasWidth, cfg.canvasHeight - cfg.groundY - 8);
}

function drawLoopingBackground(bg) {
  if (!cfg.background.loop) {
    ctx.drawImage(bg, 0, 0, cfg.canvasWidth, cfg.canvasHeight);
    return;
  }

  const scale = cfg.canvasHeight / bg.height;
  const width = Math.max(1, bg.width * scale);
  const offset = -((game.progress * cfg.background.scrollFactor) % width);

  for (let x = offset; x < cfg.canvasWidth; x += width) {
    ctx.drawImage(bg, x, 0, width, cfg.canvasHeight);
  }
}

function drawCourseProgress() {
  const barX = 20;
  const barY = cfg.canvasHeight - 24;
  const barW = cfg.canvasWidth - 40;
  const ratio = Math.min(1, game.progress / cfg.courseLength);
  ctx.fillStyle = "#1b2a4d";
  ctx.fillRect(barX, barY, barW, 8);
  ctx.fillStyle = "#7cf7c1";
  ctx.fillRect(barX, barY, barW * ratio, 8);
  ctx.fillStyle = "#f7fbff";
  ctx.font = "10px Trebuchet MS";
  ctx.fillText(cfg.finishLabel, barX + barW - 48, barY - 4);
}

function drawPlayer(time) {
  const player = game.player;
  const isDamaged = game.invincibleTimer > 0;
  if (isDamaged && Math.floor(time / 90) % 2 === 0) return;

  let path = null;
  if (isDamaged) {
    path = ASSET_MANIFEST.player.damage[0];
  } else if (!player.grounded) {
    path = ASSET_MANIFEST.player.jump[0];
  } else {
    const frame = Math.floor(time / (1000 / cfg.player.animationFps)) % ASSET_MANIFEST.player.run.length;
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
  ctx.font = "9px Trebuchet MS";
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
  ctx.font = "8px Trebuchet MS";
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
        ctx.font = "14px Trebuchet MS";
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
  ctx.font = "8px Trebuchet MS";
  ctx.fillText(label.slice(0, 4).toUpperCase(), rect.x + 3, rect.y + 16);
}

function drawAttractScene(time) {
  const pulse = 0.5 + Math.sin(time / 350) * 0.5;
  ctx.globalAlpha = 0.25 + pulse * 0.15;
  ctx.fillStyle = "#f7fbff";
  ctx.font = "18px Trebuchet MS";
  ctx.fillText("TEMP CANVAS PREVIEW", 68, 252);
  ctx.globalAlpha = 1;
}
