"use strict";

const COURSE_OBSTACLES = [
  { type: "crt", x: 900, width: 44, height: 36, spriteKey: "crt", hitbox: { offsetX: 5, offsetY: 7, width: 34, height: 28 } },
  { type: "speaker", x: 1650, width: 38, height: 54, spriteKey: "speaker", hitbox: { offsetX: 5, offsetY: 6, width: 28, height: 46 } },
  { type: "telephone", x: 2400, width: 46, height: 34, spriteKey: "telephone", hitbox: { offsetX: 6, offsetY: 8, width: 34, height: 24 } },
  { type: "cable", x: 3150, width: 72, height: 22, spriteKey: "cable", hitbox: { offsetX: 5, offsetY: 5, width: 62, height: 15 } },
  { type: "crt", x: 3420, width: 44, height: 36, spriteKey: "crt", hitbox: { offsetX: 5, offsetY: 7, width: 34, height: 28 } },
  { type: "speaker", x: 4050, width: 38, height: 54, spriteKey: "speaker", hitbox: { offsetX: 5, offsetY: 6, width: 28, height: 46 } },
  { type: "telephone", x: 4620, width: 46, height: 34, spriteKey: "telephone", hitbox: { offsetX: 6, offsetY: 8, width: 34, height: 24 } },
  { type: "crt", x: 5210, width: 44, height: 36, spriteKey: "crt", hitbox: { offsetX: 5, offsetY: 7, width: 34, height: 28 } },
  { type: "cable", x: 5800, width: 72, height: 22, spriteKey: "cable", hitbox: { offsetX: 5, offsetY: 5, width: 62, height: 15 } },
  { type: "speaker", x: 6420, width: 38, height: 54, spriteKey: "speaker", hitbox: { offsetX: 5, offsetY: 6, width: 28, height: 46 } },
  { type: "crt", x: 7010, width: 44, height: 36, spriteKey: "crt", hitbox: { offsetX: 5, offsetY: 7, width: 34, height: 28 } },
  { type: "telephone", x: 7590, width: 46, height: 34, spriteKey: "telephone", hitbox: { offsetX: 6, offsetY: 8, width: 34, height: 24 } },
  { type: "cable", x: 8140, width: 72, height: 22, spriteKey: "cable", hitbox: { offsetX: 5, offsetY: 5, width: 62, height: 15 } },
  { type: "speaker", x: 8750, width: 38, height: 54, spriteKey: "speaker", hitbox: { offsetX: 5, offsetY: 6, width: 28, height: 46 } },
  { type: "crt", x: 9360, width: 44, height: 36, spriteKey: "crt", hitbox: { offsetX: 5, offsetY: 7, width: 34, height: 28 } },
  { type: "telephone", x: 9950, width: 46, height: 34, spriteKey: "telephone", hitbox: { offsetX: 6, offsetY: 8, width: 34, height: 24 } },
  { type: "cable", x: 10580, width: 72, height: 22, spriteKey: "cable", hitbox: { offsetX: 5, offsetY: 5, width: 62, height: 15 } },
  { type: "speaker", x: 11300, width: 38, height: 54, spriteKey: "speaker", hitbox: { offsetX: 5, offsetY: 6, width: 28, height: 46 } }
];

const COURSE_ITEMS = [
  { type: "game", x: 480, y: 330, scoreValue: 100, spriteKey: "game" },
  { type: "mic", x: 1180, y: 286, scoreValue: 300, spriteKey: "mic" },
  { type: "zine", x: 1850, y: 300, scoreValue: 300, spriteKey: "zine" },
  { type: "game", x: 2620, y: 314, scoreValue: 100, spriteKey: "game" },
  { type: "mic", x: 3740, y: 282, scoreValue: 300, spriteKey: "mic" },
  { type: "game", x: 4880, y: 306, scoreValue: 100, spriteKey: "game" },
  { type: "zine", x: 5480, y: 282, scoreValue: 500, spriteKey: "zine" },
  { type: "game", x: 6100, y: 318, scoreValue: 100, spriteKey: "game" },
  { type: "mic", x: 6680, y: 286, scoreValue: 300, spriteKey: "mic" },
  { type: "game", x: 7290, y: 310, scoreValue: 100, spriteKey: "game" },
  { type: "zine", x: 8390, y: 326, scoreValue: 100, spriteKey: "zine" },
  { type: "mic", x: 9000, y: 284, scoreValue: 300, spriteKey: "mic" },
  { type: "game", x: 10220, y: 288, scoreValue: 300, spriteKey: "game" },
  { type: "zine", x: 10950, y: 316, scoreValue: 100, spriteKey: "zine" }
];

const SECRET_COURSE_OBSTACLES = [
  { type: "crt", x: 760, width: 44, height: 36, spriteKey: "crt", hitbox: { offsetX: 5, offsetY: 7, width: 34, height: 28 } },
  { type: "telephone", x: 1380, width: 46, height: 34, spriteKey: "telephone", hitbox: { offsetX: 6, offsetY: 8, width: 34, height: 24 } },
  { type: "speaker", x: 2020, width: 38, height: 54, spriteKey: "speaker", hitbox: { offsetX: 5, offsetY: 6, width: 28, height: 46 } },
  { type: "cable", x: 2660, width: 72, height: 22, spriteKey: "cable", hitbox: { offsetX: 5, offsetY: 5, width: 62, height: 15 } },
  { type: "crt", x: 3300, width: 44, height: 36, spriteKey: "crt", hitbox: { offsetX: 5, offsetY: 7, width: 34, height: 28 } },
  { type: "speaker", x: 3920, width: 38, height: 54, spriteKey: "speaker", hitbox: { offsetX: 5, offsetY: 6, width: 28, height: 46 } },
  { type: "telephone", x: 4540, width: 46, height: 34, spriteKey: "telephone", hitbox: { offsetX: 6, offsetY: 8, width: 34, height: 24 } },
  { type: "cable", x: 5160, width: 72, height: 22, spriteKey: "cable", hitbox: { offsetX: 5, offsetY: 5, width: 62, height: 15 } },
  { type: "crt", x: 5780, width: 44, height: 36, spriteKey: "crt", hitbox: { offsetX: 5, offsetY: 7, width: 34, height: 28 } },
  { type: "telephone", x: 6400, width: 46, height: 34, spriteKey: "telephone", hitbox: { offsetX: 6, offsetY: 8, width: 34, height: 24 } },
  { type: "speaker", x: 7020, width: 38, height: 54, spriteKey: "speaker", hitbox: { offsetX: 5, offsetY: 6, width: 28, height: 46 } },
  { type: "crt", x: 7640, width: 44, height: 36, spriteKey: "crt", hitbox: { offsetX: 5, offsetY: 7, width: 34, height: 28 } },
  { type: "cable", x: 8260, width: 72, height: 22, spriteKey: "cable", hitbox: { offsetX: 5, offsetY: 5, width: 62, height: 15 } },
  { type: "telephone", x: 8880, width: 46, height: 34, spriteKey: "telephone", hitbox: { offsetX: 6, offsetY: 8, width: 34, height: 24 } },
  { type: "speaker", x: 9500, width: 38, height: 54, spriteKey: "speaker", hitbox: { offsetX: 5, offsetY: 6, width: 28, height: 46 } },
  { type: "crt", x: 10140, width: 44, height: 36, spriteKey: "crt", hitbox: { offsetX: 5, offsetY: 7, width: 34, height: 28 } },
  { type: "cable", x: 10780, width: 72, height: 22, spriteKey: "cable", hitbox: { offsetX: 5, offsetY: 5, width: 62, height: 15 } },
  { type: "speaker", x: 11420, width: 38, height: 54, spriteKey: "speaker", hitbox: { offsetX: 5, offsetY: 6, width: 28, height: 46 } }
];

const SECRET_COURSE_ITEMS = [
  { type: "game", x: 520, y: 325, scoreValue: 100, spriteKey: "game" },
  { type: "mic", x: 1110, y: 292, scoreValue: 300, spriteKey: "mic" },
  { type: "zine", x: 1740, y: 312, scoreValue: 100, spriteKey: "zine" },
  { type: "game", x: 2920, y: 286, scoreValue: 300, spriteKey: "game" },
  { type: "mic", x: 4020, y: 320, scoreValue: 100, spriteKey: "mic" },
  { type: "zine", x: 5200, y: 282, scoreValue: 500, spriteKey: "zine" },
  { type: "game", x: 6340, y: 310, scoreValue: 100, spriteKey: "game" },
  { type: "mic", x: 7480, y: 286, scoreValue: 300, spriteKey: "mic" },
  { type: "game", x: 8610, y: 318, scoreValue: 100, spriteKey: "game" },
  { type: "zine", x: 9740, y: 292, scoreValue: 300, spriteKey: "zine" },
  { type: "mic", x: 10880, y: 326, scoreValue: 100, spriteKey: "mic" }
];
