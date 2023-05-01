import { sandWorldHeight, sandWorldWidth } from "../../consts";
import {
  GetPixelType,
  IsSand,
  PIXEL_TYPE_AIR,
  PIXEL_TYPE_AIR_SHIFTED,
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
  let up = 0;
  let upLeft = 0;
  let upRight = 0;
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

      if (
        IsSand(sandWorld[curr]) &&
        (sandWorld[curr] & STEP_MARKER_MASK) === iteration
      ) {
        down = x + y + sandWorldWidth;
        downLeft = x + y + sandWorldWidth - 1;
        downRight = x + y + sandWorldWidth + 1;

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
          sandWorld[downRight] = ((sandWorld[curr] >> 1) << 1) | nextIteration;
          sandWorld[curr] = PIXEL_TYPE_AIR;
          continue;
        }

        continue;
      }
    }
  }
};
