// 0000_0000_0000_0000_0000_0000_0000_0000

import { assert } from "../../lib/assert";
import { RESOURCES } from "../../scenes/preload";

export const STEP_MARKER_MASK = 0b0001;
export const STEP_MARKER_EVEN = 0b0000;
export const STEP_MARKER_ODD = 0b0001;

export const PIXEL_TYPE_MASK = 0b1111_1110;
export const PIXEL_TYPE_SHIFT = 1;

export const PIXEL_TYPE_AIR = 0b0000_0010;

export const PIXEL_TYPE_TILE_WOOD = 0b0000_0100;
export const PIXEL_TYPE_TILE_STEEL = 0b0000_0110;
export const PIXEL_TYPE_TILE_LOCK = 0b0000_1000;

export const PIXEL_TYPE_DUPLICATOR = 0b0000_1010;

export const SAND_CHECK_MASK = 0b1000_0000;
export const SAND_CHECK_SHIFT = 7;
export const SAND_TYPE_NORMAL = 0b1000_0010;

export const VARIANT_MASK = 0b0011_1111_0000_0000;
export const VARIANT_SHIFT = 8;

export const DIRECTION_MASK = 0b1100_0000_0000_0000;
export const DIRECTION_SHIFT = 14;

// Pixel types

export const PIXEL_TYPES = [
  PIXEL_TYPE_AIR,
  PIXEL_TYPE_TILE_WOOD,
  PIXEL_TYPE_TILE_STEEL,
  PIXEL_TYPE_TILE_LOCK,
  PIXEL_TYPE_DUPLICATOR,
] as const;

export const PIXEL_TYPE_MINIMAP_COLORS = [
  0x000000, 0x9e4539, 0x7f708a, 0xf9c22b, 0x625565,
];

export const PIXEL_TYPE_RENDER_CALL = [
  (x: number, y: number, rt: Phaser.GameObjects.RenderTexture) => {},
  (x: number, y: number, rt: Phaser.GameObjects.RenderTexture) => {
    rt.batchDraw(RESOURCES.WARNING_TILE, x * 16, y * 16);
  },
  (x: number, y: number, rt: Phaser.GameObjects.RenderTexture) => {},
  (x: number, y: number, rt: Phaser.GameObjects.RenderTexture) => {},
  (x: number, y: number, rt: Phaser.GameObjects.RenderTexture) => {
    rt.batchDraw(RESOURCES.WARNING_TILE, x * 16, y * 16);
  },
];

export const PIXEL_TYPE_ACTION_CALL = [
  () => {},
  () => {},
  () => {},
  () => {},
  () => {},
];

assert(
  PIXEL_TYPES.length === PIXEL_TYPE_MINIMAP_COLORS.length &&
    PIXEL_TYPES.length === PIXEL_TYPE_RENDER_CALL.length &&
    PIXEL_TYPES.length === PIXEL_TYPE_ACTION_CALL.length,
  "PIXEL_TYPES, PIXEL_TYPE_MINIMAP_COLORS, PIXEL_TYPE_RENDER_CALL, PIXEL_TYPE_ACTION_CALL must have the same length"
);

// Sand types
export const SAND_TYPES = [SAND_TYPE_NORMAL] as const;

export const SAND_TYPE_MINIMAP_COLORS = [0xe6904e];

export const SAND_TYPE_RENDER_CALL = [
  (x: number, y: number, rt: Phaser.GameObjects.RenderTexture) => {
    rt.batchDraw(RESOURCES.WARNING_TILE, x * 16, y * 16);
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

export const IsSandType = (PIXEL: number, SAND_TYPE: number) =>
  IsSand(PIXEL) && GetPixelType(PIXEL) === SAND_TYPE;

// CACHED VALUES

export const PIXEL_TYPE_AIR_SHIFTED = GetPixelType(PIXEL_TYPE_AIR);
export const PIXEL_TYPE_TILE_WOOD_SHIFTED = GetPixelType(PIXEL_TYPE_TILE_WOOD);
export const PIXEL_TYPE_TILE_STEEL_SHIFTED = GetPixelType(
  PIXEL_TYPE_TILE_STEEL
);
export const PIXEL_TYPE_TILE_LOCK_SHIFTED = GetPixelType(PIXEL_TYPE_TILE_LOCK);
export const PIXEL_TYPE_DUPLICATOR_SHIFTED = GetPixelType(
  PIXEL_TYPE_DUPLICATOR
);

export const SAND_TYPE_NORMAL_SHIFTED = GetPixelType(SAND_TYPE_NORMAL);
