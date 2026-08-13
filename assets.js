"use strict";

const ASSET_MANIFEST = {
  player: {
    frameWidth: 48,
    frameHeight: 56,
    run: [
      "assets/player/run_1.png",
      "assets/player/run_2.png",
      "assets/player/run_3.png",
      "assets/player/run_4.png"
    ],
    jump: ["assets/player/jump.png"],
    damage: ["assets/player/damage.png"]
  },
  obstacles: {
    crt: "assets/obstacles/crt.png",
    speaker: "assets/obstacles/speaker.png",
    telephone: "assets/obstacles/telephone.png",
    cable: "assets/obstacles/cable.png"
  },
  items: {
    game: "assets/items/game.png",
    mic: "assets/items/mic.png",
    zine: "assets/items/zine.png"
  },
  background: {
    normal: "assets/background/main.png",
    secret: "",
    main: "assets/background/main.png"
  },
  audio: {
    se: {
      start: "assets/audio/se/start.mp3",
      jump: "assets/audio/se/jump.mp3",
      goal: "assets/audio/se/goal.mp3"
    },
    bgm: {
      title: "assets/audio/bgm/title_loop.mp3",
      play: "assets/audio/bgm/play_loop.mp3",
      titleSecret: "",
      playSecret: ""
    }
  },
  ui: {}
};
