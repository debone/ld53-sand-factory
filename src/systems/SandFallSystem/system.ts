import {
  GAME_CONFIG,
  sandWorldHeight,
  sandWorldWidth,
  tileSize,
} from "../../consts";
import PhaserGamebus from "../../gamebus";
import { RESOURCES } from "../../scenes/preload";
import { SceneWorld } from "../../scenes/world";
import { MachineMeta, MachineType } from "../MachineSystem";
import {
  ADD_MACHINE_EVENT,
  ADD_SAND_EVENT,
  ADD_TILE_EVENT,
  Direction,
  UP,
  DOWN,
  LEFT,
  RIGHT,
} from "../consts";
import {
  GetPixelType,
  IsSand,
  IsSandType,
  PIXEL_TYPE_AIR_SHIFTED,
  SAND_TYPE_NORMAL_SHIFTED,
  PIXEL_TYPE_AIR,
  PIXEL_TYPE_DUPLICATER,
  SAND_CHECK_SHIFT,
  SAND_TYPE_NORMAL,
  STEP_MARKER_EVEN,
  STEP_MARKER_MASK,
  STEP_MARKER_ODD,
  PIXEL_TYPE_MINIMAP_COLORS,
  PIXEL_TYPE_RENDER_CALL,
  SAND_TYPE_RENDER_CALL,
  SAND_CHECK_MASK,
  SAND_TYPE_MINIMAP_COLORS,
  GetSandType,
  GetPixelVariant,
  GetPixelDirection,
  SetPixelVariant,
  SetPixelDirection,
} from "./const";
import { core, sandWorld } from "./update";

class SandFallSystem {
  scene: SceneWorld;
  graphics: Phaser.GameObjects.Graphics;

  declare rt: Phaser.GameObjects.RenderTexture;

  constructor(scene: SceneWorld) {
    this.scene = scene;
    this.graphics = scene.add.graphics();

    this.graphics.setVisible(false).setScale(2);

    sandWorld[10 + 10 * sandWorldWidth] = SAND_TYPE_NORMAL;
    sandWorld[10 + 11 * sandWorldWidth] = SAND_TYPE_NORMAL;
    sandWorld[10 + 12 * sandWorldWidth] = SAND_TYPE_NORMAL;

    sandWorld[20 + 10 * sandWorldWidth] = PIXEL_TYPE_DUPLICATER;
    sandWorld[17 + 12 * sandWorldWidth] = PIXEL_TYPE_DUPLICATER;
    sandWorld[14 + 15 * sandWorldWidth] = PIXEL_TYPE_DUPLICATER;

    this.rt = scene.add
      .renderTexture(
        0,
        0,
        sandWorldWidth * tileSize,
        sandWorldHeight * tileSize
      )
      .setOrigin(0, 0);

    this.registerEvents(scene.bus);
  }

  registerEvents(bus: Phaser.Events.EventEmitter) {
    bus.on(ADD_SAND_EVENT, (x: number, y: number) => {
      sandWorld[x + y * sandWorldWidth] = SAND_TYPE_NORMAL;
    });
    bus.on(ADD_TILE_EVENT, (x: number, y: number, type: number) => {
      sandWorld[x + y * sandWorldWidth] = type;
    });
    bus.on(
      ADD_MACHINE_EVENT,
      (
        x: number,
        y: number,
        MachineType: MachineMeta,
        direction: Direction
      ) => {
        const { width, height, origin, mask } = MachineType;
        let { pixelType } = MachineType;

        const originX = origin[0];
        const originY = origin[1];

        if (direction === UP) {
          for (let dy = 0; dy !== height; dy++) {
            for (let dx = 0; dx !== width; dx++) {
              if (mask[dy][dx] === 0) continue;

              sandWorld[
                x + dx - originX + (y + dy - originY) * sandWorldWidth
              ] =
                dx === originX && dy === originY
                  ? pixelType
                  : SetPixelVariant(pixelType, 1);
            }
          }
        } else if (direction === DOWN) {
          pixelType = SetPixelDirection(pixelType, DOWN);
          for (let dy = height - 1; dy !== -1; dy--) {
            for (let dx = width - 1; dx !== -1; dx--) {
              if (mask[height - 1 - dy][width - 1 - dx] === 0) continue;

              sandWorld[
                x +
                  width -
                  1 -
                  dx -
                  originX +
                  (y + height - 1 + dy - originY) * sandWorldWidth
              ] =
                width - 1 - dx === originX && height - 1 - dy === originY
                  ? pixelType
                  : SetPixelVariant(pixelType, 1);
            }
          }
        } else if (direction === LEFT) {
          pixelType = SetPixelDirection(pixelType, LEFT);

          for (let dy = width - 1; dy !== -1; dy--) {
            for (let dx = 0; dx !== height; dx++) {
              if (mask[dx][dy] === 0) continue;

              sandWorld[
                x + dx - originY + (y + dy - originX) * sandWorldWidth
              ] =
                dx === originY && dy === originX
                  ? pixelType
                  : SetPixelVariant(pixelType, 1);
            }
          }
        } else if (direction === RIGHT) {
          pixelType = SetPixelDirection(pixelType, RIGHT);

          for (let dy = 0; dy !== width; dy++) {
            for (let dx = height - 1; dx !== -1; dx--) {
              if (mask[height - 1 - dx][dy] === 0) continue;

              sandWorld[
                x +
                  height -
                  1 +
                  dx -
                  originY +
                  (y + dy - originX) * sandWorldWidth
              ] =
                height - 1 - dx === originY && dy === originX
                  ? pixelType
                  : SetPixelVariant(pixelType, 1);
            }
          }
        }
      }
    );
  }

  update() {
    core();
  }

  render(zoom: boolean) {
    this.rt.clear();
    this.rt.fill(0x3e3546);
    this.rt.beginDraw();

    if (zoom) {
      this.graphics.clear();
      this.graphics.fillStyle(0x3e3546, 1);
      this.graphics.fillRect(0, 0, sandWorldWidth, sandWorldHeight);

      this.graphics.fillStyle(0xf9c22b, 1);
      this.graphics.fillRect(0, 0, 1, sandWorldHeight);
      this.graphics.fillRect(sandWorldWidth - 1, 0, 1, sandWorldHeight);

      this.graphics.fillStyle(0xf9c22b, 1);
      this.graphics.fillRect(0, 0, sandWorldWidth, 1);
      this.graphics.fillRect(0, sandWorldHeight - 1, sandWorldWidth, 1);

      for (let x = 0; x !== sandWorldWidth; x++) {
        for (let y = 0; y !== sandWorldHeight; y++) {
          if (
            GetPixelType(sandWorld[x + sandWorldWidth * y]) ===
            PIXEL_TYPE_AIR_SHIFTED
          ) {
            continue;
          }

          if (IsSand(sandWorld[x + sandWorldWidth * y])) {
            this.graphics.fillStyle(
              SAND_TYPE_MINIMAP_COLORS[
                GetSandType(sandWorld[x + sandWorldWidth * y]) - 1
              ],
              1
            );
          } else {
            this.graphics.fillStyle(
              PIXEL_TYPE_MINIMAP_COLORS[
                GetPixelType(sandWorld[x + sandWorldWidth * y]) - 1
              ],
              1
            );
          }

          this.graphics.fillRect(x, y, 1, 1);
        }
      }

      this.rt.batchDraw(this.graphics, 0, 0);
    } else {
      this.rt.fill(0x3e3546);
      let px = 0;
      for (let x = 0; x !== sandWorldWidth; x++) {
        for (let y = 0; y !== sandWorldHeight; y++) {
          // Save a trip to array?
          px = sandWorld[x + sandWorldWidth * y];
          if (GetPixelType(px) === PIXEL_TYPE_AIR_SHIFTED) {
            continue;
          }

          if (IsSand(px)) {
            SAND_TYPE_RENDER_CALL[GetSandType(px) - 1](x, y, this.rt);
            continue;
          }

          PIXEL_TYPE_RENDER_CALL[GetPixelType(px) - 1](
            x,
            y,
            this.rt,
            GetPixelDirection(px),
            GetPixelVariant(px)
          );
        }
      }

      for (let x = 0; x !== sandWorldWidth; x++) {
        this.rt.batchDraw(RESOURCES.TILE_WARNING, x * 16, 0);
        this.rt.batchDraw(
          RESOURCES.TILE_WARNING,
          x * 16,
          16 * (sandWorldHeight - 1)
        );
      }

      for (let y = 0; y !== sandWorldHeight; y++) {
        this.rt.batchDraw(RESOURCES.TILE_WARNING, 0, y * 16);
        this.rt.batchDraw(
          RESOURCES.TILE_WARNING,
          16 * (sandWorldWidth - 1),
          y * 16
        );
      }
    }

    this.rt.endDraw();
  }
}

export default SandFallSystem;
