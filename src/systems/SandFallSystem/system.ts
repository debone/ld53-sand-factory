import {
  GAME_CONFIG,
  sandWorldHeight,
  sandWorldWidth,
  tileSize,
} from "../../consts";
import PhaserGamebus from "../../gamebus";
import { RESOURCES } from "../../scenes/preload";
import { SceneWorld } from "../../scenes/world";
import { MachineType } from "../MachineSystem";
import { ADD_MACHINE_EVENT, ADD_SAND_EVENT } from "../consts";
import {
  GetPixelType,
  IsSand,
  IsSandType,
  PIXEL_TYPE_AIR_SHIFTED,
  SAND_TYPE_NORMAL_SHIFTED,
  PIXEL_TYPE_AIR,
  PIXEL_TYPE_DUPLICATOR,
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
} from "./const";
import { core, sandWorld } from "./core";

class SandFallSystem {
  scene: SceneWorld;
  graphics: Phaser.GameObjects.Graphics;

  declare rt: Phaser.GameObjects.RenderTexture;

  constructor(scene: SceneWorld) {
    this.scene = scene;
    this.graphics = scene.add.graphics();

    this.graphics.setVisible(false).setScale(2);

    sandWorld[10 + 10 * sandWorldWidth] = SAND_TYPE_NORMAL | SAND_CHECK_MASK;
    sandWorld[10 + 11 * sandWorldWidth] = SAND_TYPE_NORMAL | SAND_CHECK_MASK;
    sandWorld[10 + 12 * sandWorldWidth] = SAND_TYPE_NORMAL | SAND_CHECK_MASK;

    sandWorld[20 + 10 * sandWorldWidth] = PIXEL_TYPE_DUPLICATOR;

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
      sandWorld[x + y * sandWorldWidth] = SAND_TYPE_NORMAL | SAND_CHECK_MASK;
    });
    bus.on(
      ADD_MACHINE_EVENT,
      (type: MachineType, x: number, y: number, direction: number) => {}
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

      for (let x = 0; x !== sandWorldWidth; x++) {
        for (let y = 0; y !== sandWorldHeight; y++) {
          if (
            GetPixelType(sandWorld[x + sandWorldWidth * y]) ===
            PIXEL_TYPE_AIR_SHIFTED
          ) {
            continue;
          }

          if (IsSand(sandWorld[x + sandWorldWidth * y])) {
            SAND_TYPE_RENDER_CALL[
              GetSandType(sandWorld[x + sandWorldWidth * y]) - 1
            ](x, y, this.rt);
            continue;
          }

          PIXEL_TYPE_RENDER_CALL[
            GetPixelType(sandWorld[x + sandWorldWidth * y]) - 1
          ](x, y, this.rt);
        }
      }

      for (let x = 0; x !== sandWorldWidth; x++) {
        this.rt.batchDraw(RESOURCES.WARNING_TILE, x * 16, 0);
        this.rt.batchDraw(
          RESOURCES.WARNING_TILE,
          x * 16,
          16 * (sandWorldHeight - 1)
        );
      }

      for (let y = 0; y !== sandWorldHeight; y++) {
        this.rt.batchDraw(RESOURCES.WARNING_TILE, 0, y * 16);
        this.rt.batchDraw(
          RESOURCES.WARNING_TILE,
          16 * (sandWorldWidth - 1),
          y * 16
        );
      }
    }

    this.rt.endDraw();
  }
}

export default SandFallSystem;
