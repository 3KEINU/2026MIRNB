"use strict";

const ASSET_MANIFEST = {
  player: {
    frameWidth: 48,
    frameHeight: 56,
    run: [
      "assets/player/run_1.png",
      "assets/player/run_2.png"
    ],
    jumpUp: ["assets/player/jump_up.png"],
    jumpDown: ["assets/player/jump_down.png"],
    damage: ["assets/player/jump_down.png"]
  },
  obstacles: {
    crt: "assets/obstacles/crt.png",
    speaker: "assets/obstacles/speaker.png",
    tallSpeaker: "assets/obstacles/tallsspeaker.png",
    telephone: "assets/obstacles/black_phone.png",
    cable: "assets/obstacles/ICB-670.png"
  },
  items: {
    game: [
      "assets/items/item_game_blue.png",
      "assets/items/item_game_yellow.png"
    ],
    mic: [
      "assets/items/item_mic_blue.png",
      "assets/items/item_mic_yellow.png"
    ],
    zine: [
      "assets/items/item_biribiri_blue.png",
      "assets/items/item_biribiri_yellow.png"
    ],
    heart: "assets/items/heart.png"
  },
  background: {
    base: "assets/background/background_base.png",
    ground: "assets/background/ground_loop.png",
    windowFar: "assets/background/window_far_loop.png",
    windowMask: "assets/background/window_mask.png",
    windowFrames: {
      blue: "assets/background/window_frame_blue.png",
      pink: "assets/background/window_frame_pink.png"
    },
    secretParallaxMid: "assets/background/secret_parallax_mid.png",
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
  ui: {
    consoleBody: "assets/ui/console_body.png",
    consoleScreenMask: "assets/ui/console_screen_mask.png"
  }
};
