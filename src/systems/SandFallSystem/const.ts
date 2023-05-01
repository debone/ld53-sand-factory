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
export const SAND_TYPE_NORMAL = 0b1000_0010;

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
export const SAND_TYPES = [SAND_TYPE_NORMAL] as const;

export const SAND_TYPE_MINIMAP_COLORS = [0xe6904e];

export const SAND_TYPE_RENDER_CALL = [
  (x: number, y: number, rt: Phaser.GameObjects.RenderTexture) => {
    rt.batchDraw(RESOURCES.SAND_NORMAL, x * 16, y * 16);
  },
];

export const SAND_TYPE_ACTION_CALL = [() => {}];

assert(
  SAND_TYPES.length === SAND_TYPE_MINIMAP_COLORS.length &&
    SAND_TYPES.length === SAND_TYPE_RENDER_CALL.length &&
    SAND_TYPES.length === SAND_TYPE_ACTION_CALL.length,
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

//export const DUPLICATER_MACHINE = "duplicater-machine";

export const TileTypes = [
  PIXEL_TYPE_TILE_WOOD,
  PIXEL_TYPE_TILE_STEEL,
  PIXEL_TYPE_TILE_LOCK,
] as const;

export type TileType = (typeof TileTypes)[number];

export const TILES = {
  [PIXEL_TYPE_TILE_WOOD]: {
    name: "Wood tile",
    width: 1,
    height: 1,
    texture: RESOURCES.TILE_WOOD,
    pixelType: PIXEL_TYPE_TILE_WOOD,
  },
  [PIXEL_TYPE_TILE_STEEL]: {
    name: "Steel tile",
    width: 1,
    height: 1,
    texture: RESOURCES.TILE_STEEL,
    pixelType: PIXEL_TYPE_TILE_STEEL,
  },
  [PIXEL_TYPE_TILE_LOCK]: {
    name: "Lock tile",
    width: 1,
    height: 1,
    texture: RESOURCES.TILE_WARNING,
    pixelType: PIXEL_TYPE_TILE_LOCK,
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
