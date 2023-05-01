/* eslint key-spacing: ["error", { "align": "value" }] */

// 0000_0000_0000_0000_0000_0000_0000_0000

import { assert } from "../../lib/assert";
import { RESOURCES } from "../../scenes/preload";
import { VARIANT_MACHINE_CORE } from "../MachineSystem";
import { Direction } from "../consts";

export const STEP_MARKER_MASK = 0b0001;
export const STEP_MARKER_EVEN = 0b0000;
export const STEP_MARKER_ODD = 0b0001;

export const PIXEL_TYPE_MASK = 0b1111_1110;
export const PIXEL_TYPE_SHIFT = 1;

export const PIXEL_TYPE_AIR = 0b0000_0010;

export const PIXEL_TYPE_TILE_WOOD = 0b0000_0100;
export const PIXEL_TYPE_TILE_STEEL = 0b0000_0110;
export const PIXEL_TYPE_TILE_LOCK = 0b0000_1000;

export const PIXEL_TYPE_NORMAL_EMITTER = 0b0000_1010;
export const PIXEL_TYPE_COLLECTOR = 0b0000_1100;

export const PIXEL_TYPE_DUPLICATER = 0b0000_1110;
export const PIXEL_TYPE_CRUSHER = 0b0001_0000;

export const SAND_CHECK_MASK = 0b1000_0000;
export const SAND_CHECK_SHIFT = 7;

// prettier-ignore
export const SAND_TYPE_NORMAL =               0b1000_0010;
// prettier-ignore
export const SAND_TYPE_GLASS =                0b1000_0100;
// prettier-ignore
export const SAND_TYPE_CRUSHED_GLASS =        0b1000_0110;
// prettier-ignore
export const SAND_TYPE_SHINY_GLASS =          0b1000_1000;
// prettier-ignore
export const SAND_TYPE_CRUSHED_SHINY_GLASS =  0b1000_1010;
// prettier-ignore
export const SAND_TYPE_EMERALD =              0b1000_1100;
// prettier-ignore
export const SAND_TYPE_NORMAL_EMERALD =       0b1000_1110;
// prettier-ignore
export const SAND_TYPE_CRUSHED_EMERALD =      0b1001_0000;
// prettier-ignore
export const SAND_TYPE_AMBER =                0b1001_0010;
// prettier-ignore
export const SAND_TYPE_COAL =                 0b1001_0100;
// prettier-ignore
export const SAND_TYPE_DIAMOND =              0b1001_0110;
// prettier-ignore
export const SAND_TYPE_TRASH =                0b1001_1000;

export const VARIANT_MASK = 0b0011_1111_0000_0000;
export const VARIANT_SHIFT = 8;

export const DIRECTION_MASK = 0b1100_0000_0000_0000;
export const DIRECTION_SHIFT = 14;

export const TICK_MASK = 0b0000_0000_0000_1111_0000_0000_0000_0000;
export const TICK_SHIFT = 16;

// Pixel types

export const PIXEL_TYPES = [
  PIXEL_TYPE_AIR,
  PIXEL_TYPE_TILE_WOOD,
  PIXEL_TYPE_TILE_STEEL,
  PIXEL_TYPE_TILE_LOCK,
  PIXEL_TYPE_NORMAL_EMITTER,
  PIXEL_TYPE_COLLECTOR,
  PIXEL_TYPE_DUPLICATER,
  PIXEL_TYPE_CRUSHER,
] as const;

export const PIXEL_TYPE_MINIMAP_COLORS = [
  0x000000, 0x9e4539, 0x7f708a, 0xf9c22b, 0x625565, 0x625565, 0x625565,
  0x625565,
];

export const PIXEL_TYPE_RENDER_CALL = [
  //(x: number, y: number, rt: Phaser.GameObjects.RenderTexture) => {
  () => {
    throw "Please never call me";
  },
  (x: number, y: number, rt: Phaser.GameObjects.RenderTexture) => {
    rt.batchDraw(RESOURCES.TILE_WOOD, x * 16, y * 16);
  },
  (x: number, y: number, rt: Phaser.GameObjects.RenderTexture) => {
    rt.batchDraw(RESOURCES.TILE_STEEL, x * 16, y * 16);
  },
  (x: number, y: number, rt: Phaser.GameObjects.RenderTexture) => {
    rt.batchDraw(RESOURCES.TILE_WARNING, x * 16, y * 16);
  },
  (
    x: number,
    y: number,
    rt: Phaser.GameObjects.RenderTexture,
    direction: Direction,
    variant: number
  ) => {
    if (variant === VARIANT_MACHINE_CORE) {
      rt.batchDraw(
        MACHINE_ASSETS[MACHINE_NORMAL_EMITTER_ASSET_POS][direction],
        x * 16 + 8,
        y * 16 + 8
      );
    }
  },
  (
    x: number,
    y: number,
    rt: Phaser.GameObjects.RenderTexture,
    direction: Direction,
    variant: number
  ) => {
    if (variant === VARIANT_MACHINE_CORE) {
      rt.batchDraw(
        MACHINE_ASSETS[MACHINE_COLLECTOR_ASSET_POS][direction],
        x * 16 + 8,
        y * 16 + 8
      );
    }
  },
  (
    x: number,
    y: number,
    rt: Phaser.GameObjects.RenderTexture,
    direction: Direction,
    variant: number
  ) => {
    if (variant === VARIANT_MACHINE_CORE) {
      rt.batchDraw(
        MACHINE_ASSETS[MACHINE_DUPLICATER_ASSET_POS][direction],
        x * 16 + 8,
        y * 16 + 8
      );
    }
  },
  (
    x: number,
    y: number,
    rt: Phaser.GameObjects.RenderTexture,
    direction: Direction,
    variant: number
  ) => {
    if (variant === VARIANT_MACHINE_CORE) {
      rt.batchDraw(
        MACHINE_ASSETS[MACHINE_CRUSHER_ASSET_POS][direction],
        x * 16 + 8,
        y * 16 + 8
      );
    }
  },
];

assert(
  PIXEL_TYPES.length === PIXEL_TYPE_MINIMAP_COLORS.length &&
    PIXEL_TYPES.length === PIXEL_TYPE_RENDER_CALL.length,
  "PIXEL_TYPES, PIXEL_TYPE_MINIMAP_COLORS, PIXEL_TYPE_RENDER_CALL, PIXEL_TYPE_ACTION_CALL must have the same length"
);

// Sand types
export const SAND_TYPES = [
  SAND_TYPE_NORMAL,
  SAND_TYPE_GLASS,
  SAND_TYPE_CRUSHED_GLASS,
  SAND_TYPE_SHINY_GLASS,
  SAND_TYPE_CRUSHED_SHINY_GLASS,
  SAND_TYPE_EMERALD,
  SAND_TYPE_NORMAL_EMERALD,
  SAND_TYPE_CRUSHED_EMERALD,
  SAND_TYPE_AMBER,
  SAND_TYPE_COAL,
  SAND_TYPE_DIAMOND,
  SAND_TYPE_TRASH,
] as const;

export const SAND_TYPE_MINIMAP_COLORS = [
  0xfbb954, 0xc7dcd0, 0x9babb2, 0xa884f3, 0x905ea9, 0x30e1b9, 0x0eaf9b,
  0x0b8a8f, 0xfb6b1d, 0x625565, 0xffffff, 0xe6904e,
];

export const SAND_TYPE_RENDER_CALL = [
  (x: number, y: number, rt: Phaser.GameObjects.RenderTexture) => {
    rt.batchDraw(RESOURCES.SAND_NORMAL, x * 16, y * 16);
  },
  // SAND_TYPE_GLASS
  (x: number, y: number, rt: Phaser.GameObjects.RenderTexture) => {
    throw `No render for this sand type yet`;
  },
  // SAND_TYPE_CRUSHED_GLASS
  (x: number, y: number, rt: Phaser.GameObjects.RenderTexture) => {
    throw `No render for this sand type yet`;
  },
  // SAND_TYPE_SHINY_GLASS
  (x: number, y: number, rt: Phaser.GameObjects.RenderTexture) => {
    throw `No render for this sand type yet`;
  },
  // SAND_TYPE_CRUSHED_SHINY_GLASS
  (x: number, y: number, rt: Phaser.GameObjects.RenderTexture) => {
    throw `No render for this sand type yet`;
  },
  // SAND_TYPE_EMERALD
  (x: number, y: number, rt: Phaser.GameObjects.RenderTexture) => {
    throw `No render for this sand type yet`;
  },
  // SAND_TYPE_NORMAL_EMERALD
  (x: number, y: number, rt: Phaser.GameObjects.RenderTexture) => {
    throw `No render for this sand type yet`;
  },
  // SAND_TYPE_CRUSHED_EMERALD
  (x: number, y: number, rt: Phaser.GameObjects.RenderTexture) => {
    throw `No render for this sand type yet`;
  },
  // SAND_TYPE_AMBER
  (x: number, y: number, rt: Phaser.GameObjects.RenderTexture) => {
    throw `No render for this sand type yet`;
  },
  // SAND_TYPE_COAL
  (x: number, y: number, rt: Phaser.GameObjects.RenderTexture) => {
    throw `No render for this sand type yet`;
  },
  // SAND_TYPE_DIAMOND
  (x: number, y: number, rt: Phaser.GameObjects.RenderTexture) => {
    throw `No render for this sand type yet`;
  },
  // SAND_TYPE_TRASH
  (x: number, y: number, rt: Phaser.GameObjects.RenderTexture) => {
    throw `No render for this sand type yet`;
  },
];

assert(
  SAND_TYPES.length === SAND_TYPE_MINIMAP_COLORS.length &&
    SAND_TYPES.length === SAND_TYPE_RENDER_CALL.length,
  "SAND_TYPES, SAND_TYPE_MINIMAP_COLORS, SAND_TYPE_RENDER_CALL, SAND_TYPE_ACTION_CALL must have the same length"
);

// HELPERS
export const GetPixelType = (PIXEL_TYPE: number) =>
  (PIXEL_TYPE & PIXEL_TYPE_MASK) >> PIXEL_TYPE_SHIFT;

export const GetSandType = (SAND_TYPE: number) =>
  ((SAND_TYPE ^ SAND_CHECK_MASK) & PIXEL_TYPE_MASK) >> PIXEL_TYPE_SHIFT;

export const IsSand = (PIXEL: number) =>
  (PIXEL & SAND_CHECK_MASK) >> SAND_CHECK_SHIFT;

export const CleanIteration = (PIXEL: number) => (PIXEL >> 1) << 1;

export const IsSandType = (PIXEL: number, SAND_TYPE: number) =>
  IsSand(PIXEL) && GetPixelType(PIXEL) === SAND_TYPE;

export const GetPixelVariant = (PIXEL: number) =>
  (PIXEL & VARIANT_MASK) >> VARIANT_SHIFT;

export const SetPixelVariant = (PIXEL: number, variant: number) => {
  if (variant > 0b0011_1111) throw new Error("Variant must be 6 bits");
  return (PIXEL & ~VARIANT_MASK) | (variant << VARIANT_SHIFT);
};

export const GetPixelDirection = (PIXEL: number): Direction =>
  ((PIXEL & DIRECTION_MASK) >> DIRECTION_SHIFT) as Direction;

export const SetPixelDirection = (PIXEL: number, direction: Direction) =>
  (PIXEL & ~DIRECTION_MASK) | (direction << DIRECTION_SHIFT);

// CACHED VALUES

export const PIXEL_TYPE_AIR_SHIFTED = GetPixelType(PIXEL_TYPE_AIR);
export const PIXEL_TYPE_TILE_WOOD_SHIFTED = GetPixelType(PIXEL_TYPE_TILE_WOOD);
export const PIXEL_TYPE_TILE_STEEL_SHIFTED = GetPixelType(
  PIXEL_TYPE_TILE_STEEL
);
export const PIXEL_TYPE_TILE_LOCK_SHIFTED = GetPixelType(PIXEL_TYPE_TILE_LOCK);

export const PIXEL_TYPE_NORMAL_EMITTER_SHIFTED = GetPixelType(
  PIXEL_TYPE_NORMAL_EMITTER
);
export const PIXEL_TYPE_COLLECTOR_SHIFTED = GetPixelType(PIXEL_TYPE_COLLECTOR);

export const PIXEL_TYPE_DUPLICATOR_SHIFTED = GetPixelType(
  PIXEL_TYPE_DUPLICATER
);
export const PIXEL_TYPE_CRUSHER_SHIFTED = GetPixelType(PIXEL_TYPE_CRUSHER);

export const SAND_TYPE_NORMAL_SHIFTED = GetPixelType(SAND_TYPE_NORMAL);

export const SAND_TYPE_GLASS_SHIFTED = GetPixelType(SAND_TYPE_GLASS);
export const SAND_TYPE_CRUSHED_GLASS_SHIFTED = GetPixelType(
  SAND_TYPE_CRUSHED_GLASS
);

export const SAND_TYPE_SHINY_GLASS_SHIFTED = GetPixelType(
  SAND_TYPE_SHINY_GLASS
);
export const SAND_TYPE_CRUSHED_SHINY_GLASS_SHIFTED = GetPixelType(
  SAND_TYPE_CRUSHED_SHINY_GLASS
);

export const SAND_TYPE_EMERALD_SHIFTED = GetPixelType(SAND_TYPE_EMERALD);
export const SAND_TYPE_NORMAL_EMERALD_SHIFTED = GetPixelType(
  SAND_TYPE_NORMAL_EMERALD
);
export const SAND_TYPE_CRUSHED_EMERALD_SHIFTED = GetPixelType(
  SAND_TYPE_CRUSHED_EMERALD
);

export const SAND_TYPE_AMBER_SHIFTED = GetPixelType(SAND_TYPE_AMBER);

export const SAND_TYPE_COAL_SHIFTED = GetPixelType(SAND_TYPE_COAL);

export const SAND_TYPE_DIAMOND_SHIFTED = GetPixelType(SAND_TYPE_DIAMOND);

export const SAND_TYPE_TRASH_SHIFTED = GetPixelType(SAND_TYPE_TRASH);

//export const DUPLICATER_MACHINE = "duplicater-machine";

export const UITileTypes = [
  PIXEL_TYPE_TILE_WOOD,
  PIXEL_TYPE_TILE_STEEL,
  PIXEL_TYPE_TILE_LOCK,
] as const;

export type TileType = (typeof UITileTypes)[number];

export const TILES = {
  [PIXEL_TYPE_TILE_WOOD]: {
    name: "Wood tile",
    width: 1,
    height: 1,
    texture: RESOURCES.TILE_WOOD,
    pixelType: PIXEL_TYPE_TILE_WOOD,
    cost: 15,
    unlocksAt: 0,
    hideOnUI: false,
  },
  [PIXEL_TYPE_TILE_STEEL]: {
    name: "Steel tile",
    width: 1,
    height: 1,
    texture: RESOURCES.TILE_STEEL,
    pixelType: PIXEL_TYPE_TILE_STEEL,
    cost: 100,
    unlocksAt: 1000,
    hideOnUI: false,
  },
  [PIXEL_TYPE_TILE_LOCK]: {
    name: "Lock tile",
    width: 1,
    height: 1,
    texture: RESOURCES.TILE_WARNING,
    pixelType: PIXEL_TYPE_TILE_LOCK,
    cost: 250,
    unlocksAt: 5000,
    hideOnUI: false,
  },
};

export const UISandTypes = [
  SAND_TYPE_NORMAL,
  SAND_TYPE_GLASS,
  SAND_TYPE_CRUSHED_GLASS,
  SAND_TYPE_SHINY_GLASS,
  SAND_TYPE_CRUSHED_SHINY_GLASS,
  SAND_TYPE_EMERALD,
  SAND_TYPE_NORMAL_EMERALD,
  SAND_TYPE_CRUSHED_EMERALD,
  SAND_TYPE_AMBER,
  SAND_TYPE_COAL,
  SAND_TYPE_DIAMOND,
  SAND_TYPE_TRASH,
] as const;

export type SandType = (typeof UISandTypes)[number];

export const SAND_VALUE = [
  1, // SAND_TYPE_NORMAL
  10, // SAND_TYPE_GLASS,
  100, // SAND_TYPE_CRUSHED_GLASS,
  250, // SAND_TYPE_SHINY_GLASS,
  1500, // SAND_TYPE_CRUSHED_SHINY_GLASS,
  10_000, // SAND_TYPE_EMERALD,
  15_000, // SAND_TYPE_NORMAL_EMERALD,
  50_000, // SAND_TYPE_CRUSHED_EMERALD,
  50, // SAND_TYPE_AMBER,
  250, // SAND_TYPE_COAL,
  50_000, //SAND_TYPE_DIAMOND,
  1, // SAND_TYPE_TRASH
];

export const SAND_UNLOCK = [
  0, // SAND_TYPE_NORMAL
  100, // SAND_TYPE_GLASS,
  -1, // SAND_TYPE_CRUSHED_GLASS,
  5000, // SAND_TYPE_SHINY_GLASS,
  -1, // SAND_TYPE_CRUSHED_SHINY_GLASS,
  25_000, // SAND_TYPE_EMERALD,
  -1, // SAND_TYPE_NORMAL_EMERALD,
  -1, // SAND_TYPE_CRUSHED_EMERALD,
  -1, // SAND_TYPE_AMBER,
  -1, // SAND_TYPE_COAL,
  -1, //SAND_TYPE_DIAMOND,
  -11, // SAND_TYPE_TRASH
];

export const HAS_SEEN = [
  true, // SAND_TYPE_NORMAL
  false, // SAND_TYPE_GLASS
  false, // SAND_TYPE_CRUSHED_GLASS
  false, // SAND_TYPE_SHINY_GLASS
  false, // SAND_TYPE_CRUSHED_SHINY_GLASS
  false, // SAND_TYPE_EMERALD
  false, // SAND_TYPE_NORMAL_EMERALD
  false, // SAND_TYPE_CRUSHED_EMERALD
  false, // SAND_TYPE_AMBER
  false, // SAND_TYPE_COAL
  false, // SAND_TYPE_DIAMOND
  false,
];

export const SANDS = {
  [SAND_TYPE_NORMAL]: {
    name: "Common sand",
    width: 1,
    height: 1,
    texture: RESOURCES.SAND_NORMAL,
    pixelType: SAND_TYPE_NORMAL,
    value: SAND_VALUE[GetSandType(SAND_TYPE_NORMAL)],
    cost: SAND_VALUE[GetSandType(SAND_TYPE_NORMAL)],
    unlocksAt: 0,
    hideOnUI: false,
  },
  [SAND_TYPE_GLASS]: {
    name: "Glass",
    width: 1,
    height: 1,
    texture: RESOURCES.SAND_GLASS,
    pixelType: SAND_TYPE_GLASS,
    value: SAND_VALUE[GetSandType(SAND_TYPE_GLASS)],
    cost: SAND_VALUE[GetSandType(SAND_TYPE_GLASS)],
    unlocksAt: 100,
    hideOnUI: false,
  },
  [SAND_TYPE_CRUSHED_GLASS]: {
    name: "Crushed glass",
    width: 1,
    height: 1,
    texture: RESOURCES.SAND_CRUSHED_GLASS,
    pixelType: SAND_TYPE_CRUSHED_GLASS,
    value: SAND_VALUE[GetSandType(SAND_TYPE_CRUSHED_GLASS)],
    hideOnUI: true,
  },
  [SAND_TYPE_SHINY_GLASS]: {
    name: "Shiny glass",
    width: 1,
    height: 1,
    texture: RESOURCES.SAND_SHINY_GLASS,
    pixelType: SAND_TYPE_SHINY_GLASS,
    unlocksAt: 5000,
    value: SAND_VALUE[GetSandType(SAND_TYPE_SHINY_GLASS)],
    cost: SAND_VALUE[GetSandType(SAND_TYPE_SHINY_GLASS)],
    hideOnUI: false,
  },
  [SAND_TYPE_CRUSHED_SHINY_GLASS]: {
    name: "Crushed shiny glass",
    width: 1,
    height: 1,
    texture: RESOURCES.SAND_CRUSHED_SHINY_GLASS,
    pixelType: SAND_TYPE_CRUSHED_SHINY_GLASS,
    value: SAND_VALUE[GetSandType(SAND_TYPE_CRUSHED_SHINY_GLASS)],
    hideOnUI: true,
  },
  [SAND_TYPE_EMERALD]: {
    name: "Emerald",
    width: 1,
    height: 1,
    texture: RESOURCES.SAND_EMERALD,
    pixelType: SAND_TYPE_EMERALD,
    unlocksAt: 25000,
    value: SAND_VALUE[GetSandType(SAND_TYPE_EMERALD)],
    cost: SAND_VALUE[GetSandType(SAND_TYPE_EMERALD)],
    hideOnUI: false,
  },
  [SAND_TYPE_NORMAL_EMERALD]: {
    name: "Normal sand with emerald",
    width: 1,
    height: 1,
    texture: RESOURCES.SAND_NORMAL_EMERALD,
    pixelType: SAND_TYPE_NORMAL_EMERALD,
    value: SAND_VALUE[GetSandType(SAND_TYPE_NORMAL_EMERALD)],
    hideOnUI: true,
  },
  [SAND_TYPE_CRUSHED_EMERALD]: {
    name: "Crushed emerald",
    width: 1,
    height: 1,
    texture: RESOURCES.SAND_CRUSHED_EMERALD,
    pixelType: SAND_TYPE_CRUSHED_EMERALD,
    value: SAND_VALUE[GetSandType(SAND_TYPE_CRUSHED_EMERALD)],
    hideOnUI: true,
  },
  [SAND_TYPE_AMBER]: {
    name: "Amber",
    width: 1,
    height: 1,
    texture: RESOURCES.SAND_AMBER,
    pixelType: SAND_TYPE_AMBER,
    value: SAND_VALUE[GetSandType(SAND_TYPE_AMBER)],
    hideOnUI: true,
  },
  [SAND_TYPE_COAL]: {
    name: "Coal",
    width: 1,
    height: 1,
    texture: RESOURCES.SAND_COAL,
    pixelType: SAND_TYPE_COAL,
    value: SAND_VALUE[GetSandType(SAND_TYPE_COAL)],
    hideOnUI: true,
  },
  [SAND_TYPE_DIAMOND]: {
    name: "Diamond",
    width: 1,
    height: 1,
    texture: RESOURCES.SAND_DIAMOND,
    pixelType: SAND_TYPE_DIAMOND,
    value: SAND_VALUE[GetSandType(SAND_TYPE_DIAMOND)],
    hideOnUI: true,
  },
  [SAND_TYPE_TRASH]: {
    name: "Trash",
    width: 1,
    height: 1,
    texture: RESOURCES.SAND_TRASH,
    pixelType: SAND_TYPE_TRASH,
    value: SAND_VALUE[GetSandType(SAND_TYPE_TRASH)],
    hideOnUI: true,
  },
};

// RIP organizing this
export const MACHINE_ASSETS: [
  Phaser.GameObjects.Image,
  Phaser.GameObjects.Image,
  Phaser.GameObjects.Image,
  Phaser.GameObjects.Image
][] = [];

// Cross fingers you do update this
export const MACHINE_DUPLICATER_ASSET_POS = 0;
export const MACHINE_CRUSHER_ASSET_POS = 1;
export const MACHINE_NORMAL_EMITTER_ASSET_POS = 2;
export const MACHINE_COLLECTOR_ASSET_POS = 3;
