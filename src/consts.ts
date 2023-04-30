// https://hue.tools/mix?format=rgb&colors=182243ff%3B8d9524ff&steps=10&view=steps&mode=lch
export const COLORS = [
  "#182243", //dark blue
  "#382850",
  "#582c58",
  "#773058",
  "#933753",
  "#a94448",
  "#b7583a",
  "#bc6f2b",
  "#b7891f",
  "#a9a421", // bright yellow
];

export const GAME_CONFIG = {
  type: Phaser.AUTO,
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
  width: 50 * 16,
  height: 32 * 16,
  pixelArt: true,
  backgroundColor: COLORS[0],
  //"render.transparent": true,
  parent: "game-container",
};

export const tileSize = 16;
export const sandWorldWidth = 240;
export const sandWorldHeight = 240;
