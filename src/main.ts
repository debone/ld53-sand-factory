import "./style.css";

import Phaser from "phaser";
import RexUIPlugin from "phaser3-rex-plugins/templates/ui/ui-plugin.js";

import { GAME_CONFIG } from "./consts";
import PhaserGamebus from "./gamebus";

import { SceneWorld } from "./scenes/world";
import { ScenePreload } from "./scenes/preload";
import { SceneDebug } from "./scenes/debug";
import { SceneUI } from "./scenes/ui";

export const config = {
  ...GAME_CONFIG,
  plugins: {
    global: [
      {
        key: "PhaserGamebus",
        plugin: PhaserGamebus,
        start: true,
        mapping: "gamebus",
      },
    ],
    scene: [
      {
        key: "rexUI",
        plugin: RexUIPlugin,
        mapping: "rexUI",
      },
    ],
  },
  scene: [ScenePreload, SceneWorld, SceneDebug, SceneUI],
};

new Phaser.Game(config);
