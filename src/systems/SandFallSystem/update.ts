import { sandWorldHeight, sandWorldWidth } from "../../consts";
import { totalSand } from "../../scenes/ui";
import { VARIANT_MACHINE_CORE } from "../MachineSystem";
import { directions } from "../consts";
import {
  CleanIteration,
  GetPixelDirection,
  GetPixelType,
  GetPixelVariant,
  IsSand,
  PIXEL_TYPE_AIR,
  PIXEL_TYPE_AIR_SHIFTED,
  SAND_TYPE_NORMAL,
  STEP_MARKER_EVEN,
  STEP_MARKER_MASK,
  STEP_MARKER_ODD,
} from "./const";

export const sandWorld = new Uint32Array(sandWorldWidth * sandWorldHeight).fill(
  PIXEL_TYPE_AIR
);

export let iteration = STEP_MARKER_EVEN;
export let nextIteration = STEP_MARKER_ODD;

export const core = () => {
  iteration =
    iteration === STEP_MARKER_EVEN ? STEP_MARKER_ODD : STEP_MARKER_EVEN;
  nextIteration =
    iteration === STEP_MARKER_EVEN ? STEP_MARKER_ODD : STEP_MARKER_EVEN;

  let down = 0;
  let downLeft = 0;
  let downRight = 0;
  //let up = 0;
  //let upLeft = 0;
  //let upRight = 0;
  let curr = 0;

  // Loop through this.sandWorld and move the sand down
  for (let loopY = sandWorldHeight - 1; loopY !== -1; loopY--) {
    for (
      let x = iteration > 0 ? 0 : sandWorldWidth - 1;
      (iteration > 0 && x !== sandWorldWidth) || (iteration === 0 && x !== -1);
      x += iteration > 0 ? 1 : -1
    ) {
      let y = sandWorldWidth * loopY;
      curr = x + y;

      //up = x + y - sandWorldWidth;
      //upLeft = up - 1;
      //upRight = up + 1;

      down = x + y + sandWorldWidth;
      downLeft = down - 1;
      downRight = down + 1;

      if (GetPixelType(sandWorld[curr]) === PIXEL_TYPE_AIR_SHIFTED) {
        continue;
      }

      if (IsSand(sandWorld[curr])) {
        if ((sandWorld[curr] & STEP_MARKER_MASK) === iteration) {
          if (GetPixelType(sandWorld[down]) === PIXEL_TYPE_AIR_SHIFTED) {
            sandWorld[down] = ((sandWorld[curr] >> 1) << 1) | nextIteration;
            sandWorld[curr] = PIXEL_TYPE_AIR;
            continue;
          }

          if (GetPixelType(sandWorld[downLeft]) === PIXEL_TYPE_AIR_SHIFTED) {
            sandWorld[downLeft] = ((sandWorld[curr] >> 1) << 1) | nextIteration;
            sandWorld[curr] = PIXEL_TYPE_AIR;
            continue;
          }

          if (GetPixelType(sandWorld[downRight]) === PIXEL_TYPE_AIR_SHIFTED) {
            sandWorld[downRight] =
              ((sandWorld[curr] >> 1) << 1) | nextIteration;
            sandWorld[curr] = PIXEL_TYPE_AIR;
            continue;
          }
          continue;
        }

        continue;
      }

      try {
        PIXEL_TYPE_ACTION_CALL[GetPixelType(sandWorld[curr]) - 1](
          x,
          loopY,
          curr,
          sandWorld,
          iteration,
          nextIteration,
          GetPixelDirection(sandWorld[curr])
        );
      } catch (e) {
        debugger;
      }
    }
  }
};

const DIR_EMITTER = [
  [-sandWorldWidth, -sandWorldWidth],
  [1, 1],
  [sandWorldWidth, sandWorldWidth],
  [-1, -1],
];

const PIXEL_TYPE_NORMAL_EMITTER_ACTIONS = (
  _x: number,
  _y: number,
  curr: number,
  sandWorld: Uint32Array,
  _iteration: number,
  nextIteration: number,
  direction: number
) => {
  if (
    GetPixelType(sandWorld[curr + DIR_EMITTER[direction][0]]) ===
    PIXEL_TYPE_AIR_SHIFTED
  ) {
    sandWorld[curr + DIR_EMITTER[direction][1]] =
      SAND_TYPE_NORMAL | nextIteration;
  }
};

const DIR_COLLECTOR = [
  [-sandWorldWidth, -sandWorldWidth - 1, -sandWorldWidth + 1],
  [1, sandWorldWidth + 1, -sandWorldWidth + 1],
  [sandWorldWidth, sandWorldWidth - 1, sandWorldWidth + 1],
  [-1, sandWorldWidth - 1, -sandWorldWidth - 1],
];

const PIXEL_TYPE_COLLECTOR_ACTIONS = (
  _x: number,
  _y: number,
  curr: number,
  sandWorld: Uint32Array,
  _iteration: number,
  nextIteration: number,
  direction: number
) => {
  if (GetPixelVariant(sandWorld[curr]) === VARIANT_MACHINE_CORE) {
    if (
      IsSand(sandWorld[curr + DIR_COLLECTOR[direction][0]]) &&
      (sandWorld[curr + DIR_COLLECTOR[direction][0]] & STEP_MARKER_MASK) ===
        iteration
    ) {
      sandWorld[curr + DIR_COLLECTOR[direction][0]] = PIXEL_TYPE_AIR;

      totalSand.add(1);
    }

    if (
      IsSand(sandWorld[curr + DIR_COLLECTOR[direction][1]]) &&
      (sandWorld[curr + DIR_COLLECTOR[direction][1]] & STEP_MARKER_MASK) ===
        iteration
    ) {
      sandWorld[curr + DIR_COLLECTOR[direction][1]] = PIXEL_TYPE_AIR;
      totalSand.add(1);
    }

    if (
      IsSand(sandWorld[curr + DIR_COLLECTOR[direction][2]]) &&
      (sandWorld[curr + DIR_COLLECTOR[direction][2]] & STEP_MARKER_MASK) ===
        iteration
    ) {
      sandWorld[curr + DIR_COLLECTOR[direction][2]] = PIXEL_TYPE_AIR;
      totalSand.add(1);
    }
  }
};

let tempSand = 0;

const DIR_DUPLICATER = [
  [-sandWorldWidth, 1 + 1, -1 - 1],
  [1, -sandWorldWidth - sandWorldWidth, sandWorldWidth + sandWorldWidth],
  [sandWorldWidth, 1 + 1, -1 - 1],
  [-1, -sandWorldWidth - sandWorldWidth, sandWorldWidth + sandWorldWidth],
];

const PIXEL_TYPE_DUPLICATER_ACTIONS = (
  _x: number,
  _y: number,
  curr: number,
  sandWorld: Uint32Array,
  iteration: number,
  nextIteration: number,
  direction: number
) => {
  if (GetPixelVariant(sandWorld[curr]) === VARIANT_MACHINE_CORE) {
    if (IsSand(sandWorld[curr + DIR_DUPLICATER[direction][0]])) {
      tempSand = sandWorld[curr + DIR_DUPLICATER[direction][0]];
      sandWorld[curr + DIR_DUPLICATER[direction][0]] = PIXEL_TYPE_AIR;
      sandWorld[curr + DIR_DUPLICATER[direction][1]] =
        CleanIteration(tempSand) | nextIteration;
      sandWorld[curr + DIR_DUPLICATER[direction][2]] =
        CleanIteration(tempSand) | nextIteration;
    }
  }
};

const DIR_CRUSHER = [
  [
    -sandWorldWidth - sandWorldWidth - 1,
    -sandWorldWidth - sandWorldWidth + 1,
    -sandWorldWidth - sandWorldWidth,
    -sandWorldWidth - 1,
    -sandWorldWidth + 1,
    -sandWorldWidth,
    sandWorldWidth,
  ],
  [
    1 + 1 - sandWorldWidth,
    1 + 1 + sandWorldWidth,
    1 + 1,
    1 - sandWorldWidth,
    1 + sandWorldWidth,
    1,
    -1,
  ],
  [
    sandWorldWidth + sandWorldWidth - 1,
    sandWorldWidth + sandWorldWidth + 1,
    sandWorldWidth + sandWorldWidth,
    sandWorldWidth - 1,
    sandWorldWidth + 1,
    sandWorldWidth,
    -sandWorldWidth,
  ],
  [
    -1 - 1 - sandWorldWidth,
    -1 - 1 + sandWorldWidth,
    -1 - 1,
    -1 - sandWorldWidth,
    -1 + sandWorldWidth,
    -1,
    1,
  ],
];

const PIXEL_TYPE_CRUSHER_ACTIONS = (
  _x: number,
  _y: number,
  curr: number,
  sandWorld: Uint32Array,
  _iteration: number,
  _nextIteration: number,
  direction: number
) => {
  if (GetPixelVariant(sandWorld[curr]) === VARIANT_MACHINE_CORE) {
    // TODO check if sandbox is full
    if (
      IsSand(sandWorld[curr + DIR_CRUSHER[direction][0]]) &&
      IsSand(sandWorld[curr + DIR_CRUSHER[direction][1]]) &&
      IsSand(sandWorld[curr + DIR_CRUSHER[direction][2]]) &&
      IsSand(sandWorld[curr + DIR_CRUSHER[direction][3]]) &&
      IsSand(sandWorld[curr + DIR_CRUSHER[direction][4]]) &&
      IsSand(sandWorld[curr + DIR_CRUSHER[direction][5]]) &&
      GetPixelType(sandWorld[curr + DIR_CRUSHER[direction][6]]) ===
        PIXEL_TYPE_AIR_SHIFTED
    ) {
      sandWorld[curr + DIR_CRUSHER[direction][0]] = PIXEL_TYPE_AIR;
      sandWorld[curr + DIR_CRUSHER[direction][1]] = PIXEL_TYPE_AIR;
      sandWorld[curr + DIR_CRUSHER[direction][2]] = PIXEL_TYPE_AIR;
      sandWorld[curr + DIR_CRUSHER[direction][3]] = PIXEL_TYPE_AIR;
      sandWorld[curr + DIR_CRUSHER[direction][4]] = PIXEL_TYPE_AIR;
      sandWorld[curr + DIR_CRUSHER[direction][5]] = PIXEL_TYPE_AIR;
      sandWorld[curr + DIR_CRUSHER[direction][6]] = SAND_TYPE_NORMAL;
    }
  }
};

export const PIXEL_TYPE_ACTION_CALL = [
  //PIXEL_TYPE_AIR
  //[(x: number, _y: number, i: number, sandWorld: Uint32Array) => {}],
  () => {},
  //PIXEL_TYPE_TILE_WOOD
  () => {},
  //PIXEL_TYPE_TILE_STEEL
  () => {},
  //PIXEL_TYPE_TILE_LOCK
  () => {},
  //PIXEL_TYPE_NORMAL_EMITTER
  PIXEL_TYPE_NORMAL_EMITTER_ACTIONS,
  //PIXEL_TYPE_COLLECTOR
  PIXEL_TYPE_COLLECTOR_ACTIONS,
  //PIXEL_TYPE_DUPLICATER
  PIXEL_TYPE_DUPLICATER_ACTIONS,
  //PIXEL_TYPE_CRUSHER
  PIXEL_TYPE_CRUSHER_ACTIONS,
];

export const SAND_TYPE_ACTION_CALL = [() => {}, () => {}];
