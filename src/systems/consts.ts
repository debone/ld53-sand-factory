export const UP = 0;
export const RIGHT = 1;
export const DOWN = 2;
export const LEFT = 3;

export const directions = [UP, RIGHT, DOWN, LEFT] as const;
export type Direction = (typeof directions)[number];

export const ADD_SAND_EVENT = "add-sand";
export const ADD_MACHINE_EVENT = "add-machine";
export const ADD_TILE_EVENT = "add-tile";

export const ERASER_TOOL_EVENT = "eraser-tool";
export const SWEEP_TOOL_EVENT = "sweep-tool";
