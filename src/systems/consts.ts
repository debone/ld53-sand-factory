export const UP = 0;
export const RIGHT = 1;
export const DOWN = 3;
export const LEFT = 4;

export const directions = [UP, RIGHT, DOWN, LEFT] as const;
export type Direction = (typeof directions)[number];

export const ADD_SAND_EVENT = "add-sand";
export const ADD_MACHINE_EVENT = "add-machine";
