"use strict";

const COURSE_OBSTACLES = [
  { type: "crt", x: 900, width: 44, height: 37, spriteKey: "crt", hitbox: { offsetX: 5, offsetY: 6, width: 34, height: 29 } },
  { type: "speaker", x: 1650, width: 38, height: 54, spriteKey: "speaker", hitbox: { offsetX: 5, offsetY: 6, width: 28, height: 46 } },
  { type: "telephone", x: 2400, width: 46, height: 34, spriteKey: "telephone", hitbox: { offsetX: 6, offsetY: 8, width: 34, height: 24 } },
  { type: "cable", x: 3150, width: 72, height: 24, spriteKey: "cable", hitbox: { offsetX: 5, offsetY: 5, width: 62, height: 17 } },
  { type: "crt", x: 3420, width: 44, height: 37, spriteKey: "crt", hitbox: { offsetX: 5, offsetY: 6, width: 34, height: 29 } },
  { type: "speaker", x: 4050, width: 38, height: 54, spriteKey: "speaker", hitbox: { offsetX: 5, offsetY: 6, width: 28, height: 46 } },
  { type: "telephone", x: 4620, width: 46, height: 34, spriteKey: "telephone", hitbox: { offsetX: 6, offsetY: 8, width: 34, height: 24 } },
  { type: "crt", x: 5210, width: 44, height: 37, spriteKey: "crt", hitbox: { offsetX: 5, offsetY: 6, width: 34, height: 29 } },
  { type: "cable", x: 5800, width: 72, height: 24, spriteKey: "cable", hitbox: { offsetX: 5, offsetY: 5, width: 62, height: 17 } },
  { type: "speaker", x: 6420, width: 38, height: 54, spriteKey: "speaker", hitbox: { offsetX: 5, offsetY: 6, width: 28, height: 46 } },
  { type: "crt", x: 7010, width: 44, height: 37, spriteKey: "crt", hitbox: { offsetX: 5, offsetY: 6, width: 34, height: 29 } },
  { type: "telephone", x: 7590, width: 46, height: 34, spriteKey: "telephone", hitbox: { offsetX: 6, offsetY: 8, width: 34, height: 24 } },
  { type: "cable", x: 8140, width: 72, height: 24, spriteKey: "cable", hitbox: { offsetX: 5, offsetY: 5, width: 62, height: 17 } },
  { type: "speaker", x: 8750, width: 38, height: 54, spriteKey: "speaker", hitbox: { offsetX: 5, offsetY: 6, width: 28, height: 46 } },
  { type: "crt", x: 9360, width: 44, height: 37, spriteKey: "crt", hitbox: { offsetX: 5, offsetY: 6, width: 34, height: 29 } },
  { type: "telephone", x: 9950, width: 46, height: 34, spriteKey: "telephone", hitbox: { offsetX: 6, offsetY: 8, width: 34, height: 24 } },
  { type: "cable", x: 10580, width: 72, height: 24, spriteKey: "cable", hitbox: { offsetX: 5, offsetY: 5, width: 62, height: 17 } },
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
  { type: "crt", x: 700, width: 44, height: 37, spriteKey: "crt", hitbox: { offsetX: 5, offsetY: 6, width: 34, height: 29 } },
  { type: "cable", x: 1220, width: 72, height: 24, spriteKey: "cable", hitbox: { offsetX: 5, offsetY: 5, width: 62, height: 17 } },
  { type: "telephone", x: 1680, width: 46, height: 34, spriteKey: "telephone", hitbox: { offsetX: 6, offsetY: 8, width: 34, height: 24 } },
  { type: "speaker", x: 2280, width: 38, height: 54, spriteKey: "speaker", hitbox: { offsetX: 5, offsetY: 6, width: 28, height: 46 } },
  { type: "tallSpeaker", x: 2880, width: 29, height: 140, spriteKey: "tallSpeaker", hitbox: { offsetX: 3, offsetY: 6, width: 23, height: 128 } },
  { type: "cable", x: 3600, width: 72, height: 24, spriteKey: "cable", hitbox: { offsetX: 5, offsetY: 5, width: 62, height: 17 } },
  { type: "speaker", x: 4120, width: 38, height: 54, spriteKey: "speaker", hitbox: { offsetX: 5, offsetY: 6, width: 28, height: 46 } },
  { type: "telephone", x: 4660, width: 46, height: 34, spriteKey: "telephone", hitbox: { offsetX: 6, offsetY: 8, width: 34, height: 24 } },
  { type: "crt", x: 5260, width: 44, height: 37, spriteKey: "crt", hitbox: { offsetX: 5, offsetY: 6, width: 34, height: 29 } },
  { type: "tallSpeaker", x: 5880, width: 29, height: 140, spriteKey: "tallSpeaker", hitbox: { offsetX: 3, offsetY: 6, width: 23, height: 128 } },
  { type: "crt", x: 6220, width: 44, height: 37, spriteKey: "crt", hitbox: { offsetX: 5, offsetY: 6, width: 34, height: 29 } },
  { type: "cable", x: 6580, width: 72, height: 24, spriteKey: "cable", hitbox: { offsetX: 5, offsetY: 5, width: 62, height: 17 } },
  { type: "speaker", x: 7100, width: 38, height: 54, spriteKey: "speaker", hitbox: { offsetX: 5, offsetY: 6, width: 28, height: 46 } },
  { type: "telephone", x: 7660, width: 46, height: 34, spriteKey: "telephone", hitbox: { offsetX: 6, offsetY: 8, width: 34, height: 24 } },
  { type: "tallSpeaker", x: 8260, width: 29, height: 140, spriteKey: "tallSpeaker", hitbox: { offsetX: 3, offsetY: 6, width: 23, height: 128 } },
  { type: "cable", x: 8840, width: 72, height: 24, spriteKey: "cable", hitbox: { offsetX: 5, offsetY: 5, width: 62, height: 17 } },
  { type: "crt", x: 9340, width: 44, height: 37, spriteKey: "crt", hitbox: { offsetX: 5, offsetY: 6, width: 34, height: 29 } },
  { type: "speaker", x: 9840, width: 38, height: 54, spriteKey: "speaker", hitbox: { offsetX: 5, offsetY: 6, width: 28, height: 46 } },
  { type: "tallSpeaker", x: 10440, width: 29, height: 140, spriteKey: "tallSpeaker", hitbox: { offsetX: 3, offsetY: 6, width: 23, height: 128 } },
  { type: "telephone", x: 11000, width: 46, height: 34, spriteKey: "telephone", hitbox: { offsetX: 6, offsetY: 8, width: 34, height: 24 } },
  { type: "cable", x: 11500, width: 72, height: 24, spriteKey: "cable", hitbox: { offsetX: 5, offsetY: 5, width: 62, height: 17 } },
  { type: "tallSpeaker", x: 12040, width: 29, height: 140, spriteKey: "tallSpeaker", hitbox: { offsetX: 3, offsetY: 6, width: 23, height: 128 } },
  { type: "speaker", x: 12560, width: 38, height: 54, spriteKey: "speaker", hitbox: { offsetX: 5, offsetY: 6, width: 28, height: 46 } },
  { type: "tallSpeaker", x: 13000, width: 29, height: 140, spriteKey: "tallSpeaker", hitbox: { offsetX: 3, offsetY: 6, width: 23, height: 128 } },
  { type: "cable", x: 13400, width: 72, height: 24, spriteKey: "cable", hitbox: { offsetX: 5, offsetY: 5, width: 62, height: 17 } }
];

const SECRET_COURSE_ITEMS = [
  { type: "game", x: 560, y: 325, scoreValue: 200, spriteKey: "game" },
  { type: "mic", x: 1460, y: 286, scoreValue: 600, spriteKey: "mic" },
  { type: "zine", x: 2460, y: 312, scoreValue: 300, spriteKey: "zine" },
  { type: "heart", x: 2760, y: 252, spriteKey: "heart", effect: "life" },
  { type: "game", x: 3980, y: 286, scoreValue: 600, spriteKey: "game" },
  { type: "mic", x: 5480, y: 318, scoreValue: 300, spriteKey: "mic" },
  { type: "heart", x: 6120, y: 248, spriteKey: "heart", effect: "life" },
  { type: "zine", x: 6900, y: 282, scoreValue: 900, spriteKey: "zine" },
  { type: "game", x: 8060, y: 304, scoreValue: 300, spriteKey: "game" },
  { type: "heart", x: 8800, y: 276, spriteKey: "heart", effect: "life" },
  { type: "mic", x: 9780, y: 286, scoreValue: 600, spriteKey: "mic" },
  { type: "zine", x: 10940, y: 300, scoreValue: 900, spriteKey: "zine" },
  { type: "game", x: 12100, y: 282, scoreValue: 600, spriteKey: "game" },
  { type: "mic", x: 13000, y: 286, scoreValue: 600, spriteKey: "mic" }
];
