import { Display } from "phaser";
import RexUIPlugin from "phaser3-rex-plugins/templates/ui/ui-plugin.js";

import { GAME_CONFIG, tileSize } from "../consts";
import { RESOURCES } from "./preload";
import { SceneWorld, cameraTilesHeight, cameraTilesWidth } from "./world";
import { params } from "./debug";
import PhaserGamebus from "../gamebus";
import {
  ADD_MACHINE_EVENT,
  ADD_SAND_EVENT,
  ADD_TILE_EVENT,
  UP,
} from "../systems/consts";

import UIbgImg from "../assets/ui/ui-bg.png?url";

import playButtonImg from "../assets/ui/play-button.png?url";
import pauseButtonImg from "../assets/ui/pause-button.png?url";
import stepButtonImg from "../assets/ui/step-button.png?url";
import ffButtonImg from "../assets/ui/ff-button.png?url";

import stepIndicatorImg from "../assets/ui/step-indicator.png?url";

import eraserToolImg from "../assets/ui/eraser-tool.png?url";
import sweepToolImg from "../assets/ui/sweep-tool.png?url";

// @ts-ignore
import type Color = Display.Color;
import { MACHINES } from "../systems/MachineSystem";
import { SANDS, TILES } from "../systems/SandFallSystem/const";
const Color = Display.Color;

export const UITilesWidth = 17;
export const UITilesHeight = 30;

export const TOOLS = ["sand_cleaner", "eraser", "machine"];

export const UI_COLOR_DARK = 0x2e222f;
export const UI_COLOR_SHADOW = 0x3e3546;
export const UI_COLOR_NEUTRAL = 0x625565;
export const UI_COLOR_LIGHT = 0x7f708a;
export const UI_COLOR_HIGHLIGHT = 0xffffff;

export const BASE_TEXT_STYLE = {
  fontFamily: "Silkscreen",
  fontSize: "16px",
  color: "#ffffff",
};

export const SELECTED_TOOL_TILE = "selected-tool-tile";
export const SELECTED_TOOL_MACHINE = "selected-tool-machine";
export const SELECTED_TOOL_SAND = "selected-tool-sand";

export const SELECTED_TOOL_INSPECTOR = "selected-tool-inspect";
export const SELECTED_TOOL_ERASER = "selected-tool-eraser";
export const SELECTED_TOOL_SWEEP = "selected-tool-sweep";

export let totalSand = { count: 0, lastUpdate: 0 };

export class SceneUI extends Phaser.Scene {
  declare rexUI: RexUIPlugin;
  declare bus: Phaser.Events.EventEmitter;
  declare gamebus: PhaserGamebus;

  declare world: SceneWorld;

  declare rt: Phaser.GameObjects.RenderTexture;

  declare marker: Phaser.GameObjects.Graphics;

  tileX = 0;
  tileY = 0;

  prevTileX = 0;
  prevTileY = 0;

  constructor() {
    super({ key: "SceneUI" });
  }

  preload() {
    this.load.image("ui-bg", UIbgImg);

    this.load.spritesheet("play-button", playButtonImg, {
      frameWidth: 32,
      frameHeight: 32,
    });
    this.load.spritesheet("pause-button", pauseButtonImg, {
      frameWidth: 32,
      frameHeight: 32,
    });
    this.load.spritesheet("step-button", stepButtonImg, {
      frameWidth: 32,
      frameHeight: 32,
    });
    this.load.spritesheet("ff-button", ffButtonImg, {
      frameWidth: 32,
      frameHeight: 32,
    });

    this.load.spritesheet("step-indicator", stepIndicatorImg, {
      frameWidth: 80,
      frameHeight: 16,
    });

    this.load.spritesheet("eraser-tool", eraserToolImg, {
      frameWidth: 32,
      frameHeight: 32,
    });
    this.load.spritesheet("sweep-tool", sweepToolImg, {
      frameWidth: 32,
      frameHeight: 32,
    });
  }

  activeTool = SELECTED_TOOL_INSPECTOR;
  activeToolData: any = null;
  activeToolRotation = UP;

  create({ sceneWorld }: { sceneWorld: SceneWorld }) {
    this.world = sceneWorld;

    this.bus = this.gamebus.getBus();

    this.marker = this.add.graphics();

    this.rt = this.add
      .renderTexture(0, 0, GAME_CONFIG.width, GAME_CONFIG.height)
      .setOrigin(0, 0);

    for (let x = 0; x < GAME_CONFIG.width; x += 16) {
      this.rt.draw(RESOURCES.TILE_WARNING, x, 0);
      this.rt.draw(RESOURCES.TILE_WARNING, x, GAME_CONFIG.height - 16);
    }
    for (let y = 0; y < GAME_CONFIG.height; y += 16) {
      this.rt.draw(RESOURCES.TILE_WARNING, 0, y);
      this.rt.draw(RESOURCES.TILE_WARNING, 31 * 16, y);
      this.rt.draw(RESOURCES.TILE_WARNING, GAME_CONFIG.width - 16, y);
    }

    this.rt.draw("ui-bg", tileSize * 32, tileSize * 1);

    this.counterText = this.add.text(
      tileSize * 33,
      tileSize * 2,
      "0",
      BASE_TEXT_STYLE
    );

    let draw = false;

    this.mouseOverlayObject = this.add
      .image(tileSize * 15, tileSize * 10, RESOURCES.MACHINE_DUPLICATER)
      .setAlpha(0)
      .setActive(false);

    this.input.on("pointerdown", (pointer: Phaser.Input.Pointer) => {
      this.emitMouseDown(pointer);
      draw = true;
    });

    this.input.on("pointerup", () => {
      draw = false;
    });

    this.input.on("pointermove", (pointer: Phaser.Input.Pointer) => {
      if (draw && pointer.noButtonDown() === false) {
        this.emitMouseDown(pointer);
      } else {
        this.emitMouseMove(pointer);
      }
    });

    this.keyE = this.input.keyboard!.addKey("E");
    const keyR = this.input.keyboard!.addKey("R");
    const keyEsc = this.input.keyboard!.addKey("ESC");

    keyEsc.on("up", () => {
      this.activeTool = SELECTED_TOOL_INSPECTOR;
      this.activeToolData = null;
      this.mouseOverlayObject.setAlpha(0);
    });

    keyR.on("up", () => {
      this.activeToolRotation = (this.activeToolRotation + 1) % 4;
      this.mouseOverlayObject.setRotation(
        (this.activeToolRotation * Math.PI) / 2
      );
    });

    this.createUIElements();
    this.createTabs();
  }

  declare counterText: Phaser.GameObjects.Text;

  declare keyE: Phaser.Input.Keyboard.Key;

  declare mouseOverlayObject: Phaser.GameObjects.Image;

  emitMouseDown(pointer: Phaser.Input.Pointer) {
    if (
      pointer.x < tileSize ||
      pointer.y < tileSize ||
      pointer.x > cameraTilesWidth * tileSize ||
      pointer.y > cameraTilesHeight * tileSize
    ) {
      return;
    }

    switch (true) {
      case this.activeTool === SELECTED_TOOL_TILE: {
        this.bus.emit(
          ADD_TILE_EVENT,
          this.tileX,
          this.tileY,
          this.activeToolData.pixelType
        );
        break;
      }
      case this.activeTool === SELECTED_TOOL_MACHINE: {
        this.bus.emit(
          ADD_MACHINE_EVENT,
          this.tileX,
          this.tileY,
          this.activeToolData,
          this.activeToolRotation
        );
        break;
      }
      case this.activeTool === SELECTED_TOOL_ERASER: {
        break;
      }
      case this.activeTool === SELECTED_TOOL_SWEEP: {
        break;
      }
    }
  }

  emitMouseMove(pointer: Phaser.Input.Pointer) {
    if (
      pointer.x > tileSize &&
      pointer.y > tileSize &&
      pointer.x < cameraTilesWidth * tileSize &&
      pointer.y < cameraTilesHeight * tileSize
    ) {
      this.mouseOverlayObject.setVisible(true);
      this.mouseOverlayObject.x =
        Math.floor(pointer.worldX / tileSize) * tileSize + tileSize / 2;
      this.mouseOverlayObject.y =
        Math.floor(pointer.worldY / tileSize) * tileSize + tileSize / 2;
    } else {
      this.mouseOverlayObject.setVisible(false);
    }

    switch (true) {
      case this.activeTool === SELECTED_TOOL_TILE: {
        break;
      }
      case this.activeTool === SELECTED_TOOL_MACHINE: {
        break;
      }
      case this.activeTool === SELECTED_TOOL_ERASER: {
        break;
      }
      case this.activeTool === SELECTED_TOOL_SWEEP: {
        break;
      }
    }
  }

  worldVelocity = 1;

  worldPlay() {
    this.worldVelocity = 1;
    this.world.timestep.paused = false;
    // @ts-ignore
    this.world.timestep.delay = 250;
  }

  worldPause() {
    this.worldVelocity = 0;
    this.world.timestep.paused = true;
  }

  worldStep() {
    this.worldVelocity = 0;
    this.world.timestep.paused = true;
    this.world.worldStep();
  }

  worldFF() {
    this.worldVelocity = 2;
    this.world.timestep.paused = false;
    // @ts-ignore
    this.world.timestep.delay = 16;
  }

  createUIElements() {
    const playButtonSprite = this.add
      .sprite(tileSize * 36, tileSize * 7, "play-button", 0)
      .setInteractive();
    const pauseButtonSprite = this.add
      .sprite(tileSize * 39, tileSize * 7, "pause-button", 0)
      .setInteractive();
    const stepButtonSprite = this.add
      .sprite(tileSize * 42, tileSize * 7, "step-button", 0)
      .setInteractive();
    const ffButtonSprite = this.add
      .sprite(tileSize * 45, tileSize * 7, "ff-button", 0)
      .setInteractive();

    const stepIndicatorSprite = this.add
      .sprite(tileSize * 40 + 8, tileSize * 5 + 8, "step-indicator", 0)
      .setInteractive();

    const eraserToolSprite = this.add
      .sprite(tileSize * 34, tileSize * 11, "eraser-tool", 0)
      .setInteractive();
    const sweepToolSprite = this.add
      .sprite(tileSize * 34, tileSize * 14, "sweep-tool", 0)
      .setInteractive();

    const keyOne = this.input.keyboard!.addKey(
      Phaser.Input.Keyboard.KeyCodes.ONE
    );
    const keyTwo = this.input.keyboard!.addKey(
      Phaser.Input.Keyboard.KeyCodes.TWO
    );
    const keyThree = this.input.keyboard!.addKey(
      Phaser.Input.Keyboard.KeyCodes.THREE
    );
    const keyFour = this.input.keyboard!.addKey(
      Phaser.Input.Keyboard.KeyCodes.FOUR
    );

    playButtonSprite.on("pointerout", () => {
      playButtonSprite.setFrame(0);
    });
    playButtonSprite.on("pointerover", () => {
      playButtonSprite.setFrame(1);
    });
    playButtonSprite.on("pointerdown", () => {
      playButtonSprite.setFrame(2);
    });
    keyOne.on("down", () => {
      playButtonSprite.setFrame(2);
    });
    playButtonSprite.on("pointerup", () => {
      playButtonSprite.setFrame(1);
      this.worldPlay();
    });
    keyOne.on("up", () => {
      playButtonSprite.setFrame(0);
      this.worldPlay();
    });

    pauseButtonSprite.on("pointerout", () => {
      pauseButtonSprite.setFrame(0);
    });
    pauseButtonSprite.on("pointerover", () => {
      pauseButtonSprite.setFrame(1);
    });
    pauseButtonSprite.on("pointerdown", () => {
      pauseButtonSprite.setFrame(2);
    });
    keyTwo.on("down", () => {
      pauseButtonSprite.setFrame(2);
    });
    pauseButtonSprite.on("pointerup", () => {
      pauseButtonSprite.setFrame(1);
      if (this.worldVelocity === 2) stepIndicatorSprite.setFrame(frame);
      this.worldPause();
    });
    keyTwo.on("up", () => {
      pauseButtonSprite.setFrame(0);
      if (this.worldVelocity === 2) stepIndicatorSprite.setFrame(frame);
      this.worldPause();
    });

    stepButtonSprite.on("pointerout", () => {
      stepButtonSprite.setFrame(0);
    });
    stepButtonSprite.on("pointerover", () => {
      stepButtonSprite.setFrame(1);
    });
    stepButtonSprite.on("pointerdown", () => {
      stepButtonSprite.setFrame(2);
    });
    keyThree.on("down", () => {
      stepButtonSprite.setFrame(2);
    });
    stepButtonSprite.on("pointerup", () => {
      stepButtonSprite.setFrame(1);
      this.worldStep();
    });
    keyThree.on("up", () => {
      stepButtonSprite.setFrame(0);
      this.worldStep();
    });

    ffButtonSprite.on("pointerout", () => {
      ffButtonSprite.setFrame(0);
    });
    ffButtonSprite.on("pointerover", () => {
      ffButtonSprite.setFrame(1);
    });
    ffButtonSprite.on("pointerdown", () => {
      ffButtonSprite.setFrame(2);
    });
    keyFour.on("down", () => {
      ffButtonSprite.setFrame(2);
    });
    ffButtonSprite.on("pointerup", () => {
      ffButtonSprite.setFrame(1);
      this.worldFF();
    });
    keyFour.on("up", () => {
      ffButtonSprite.setFrame(0);
      this.worldFF();
    });

    eraserToolSprite.on("pointerout", () => {
      eraserToolSprite.setFrame(0);
    });
    eraserToolSprite.on("pointerover", () => {
      eraserToolSprite.setFrame(1);
    });
    eraserToolSprite.on("pointerdown", () => {
      eraserToolSprite.setFrame(2);
    });
    eraserToolSprite.on("pointerup", () => {
      eraserToolSprite.setFrame(1);
    });

    sweepToolSprite.on("pointerout", () => {
      sweepToolSprite.setFrame(0);
    });
    sweepToolSprite.on("pointerover", () => {
      sweepToolSprite.setFrame(1);
    });
    sweepToolSprite.on("pointerdown", () => {
      sweepToolSprite.setFrame(2);
    });
    sweepToolSprite.on("pointerup", () => {
      sweepToolSprite.setFrame(1);
    });

    let frame = 0;
    let maxFrame = 5;
    this.bus.on("mapTick", () => {
      if (this.worldVelocity === 2) {
        stepIndicatorSprite.setFrame(5);
      } else {
        stepIndicatorSprite.setFrame(frame++ % maxFrame);
      }
    });
  }

  createTabs() {
    const tabPages = this.rexUI.add
      .tabPages({
        x: tileSize * 36,
        y: tileSize * 9,
        width: tileSize * 12,
        height: tileSize * 20,

        tabs: {
          space: { item: 3 },
        },
        pages: {
          fadeIn: 300,
        },

        align: {
          tabs: "left",
        },

        space: { left: 5, right: 5, top: 5, bottom: 5, item: 10 },
      })
      .setOrigin(0, 0)
      .on("tab.focus", function (tab: any) {
        tab.getElement("background").setStrokeStyle(2, UI_COLOR_LIGHT);
      })
      .on("tab.blur", function (tab: any) {
        tab.getElement("background").setStrokeStyle();
      });

    tabPages
      .addPage({
        key: "tiles",
        tab: this.rexUI.add.label({
          height: 10,

          background: this.rexUI.add.roundRectangle(
            0,
            0,
            0,
            0,
            0,
            UI_COLOR_DARK
          ),
          text: this.add.text(0, 0, "Tiles", {
            ...BASE_TEXT_STYLE,
            fontSize: 11,
          }),
          space: { left: 6, right: 7, top: 5, bottom: 8 },
        }),
        page: this.createTabUI(TILES, SELECTED_TOOL_TILE),
      })
      .addPage({
        key: "machines",
        tab: this.rexUI.add.label({
          height: 10,

          background: this.rexUI.add.roundRectangle(
            0,
            0,
            0,
            0,
            0,
            UI_COLOR_DARK
          ),
          text: this.add.text(0, 0, "Machines", {
            ...BASE_TEXT_STYLE,
            fontSize: 11,
          }),
          space: { left: 6, right: 6, top: 4, bottom: 8 },
        }),
        page: this.createTabUI(MACHINES, SELECTED_TOOL_MACHINE),
      })
      .addPage({
        key: "sand",
        tab: this.rexUI.add.label({
          height: 10,

          background: this.rexUI.add.roundRectangle(
            0,
            0,
            0,
            0,
            0,
            UI_COLOR_DARK
          ),
          text: this.add.text(0, 0, "Sand", {
            ...BASE_TEXT_STYLE,
            fontSize: 11,
          }),
          space: { left: 6, right: 6, top: 4, bottom: 8 },
        }),
        page: this.createTabUI(SANDS, SELECTED_TOOL_SAND),
      })
      .layout()
      .swapFirstPage();

    return tabPages;
  }

  createTabUI(
    items: { [itemKey: string]: { name: string; texture: string } },
    toolType:
      | typeof SELECTED_TOOL_TILE
      | typeof SELECTED_TOOL_MACHINE
      | typeof SELECTED_TOOL_SAND
  ) {
    const scrollablePanel = this.rexUI.add
      .scrollablePanel({
        scrollMode: 0,
        panel: {
          child: this.createGrid(items),
        },
        slider: {
          thumb: this.rexUI.add.roundRectangle(0, 0, 0, 20, 5, UI_COLOR_LIGHT),
        },
        mouseWheelScroller: {
          focus: false,
          speed: 0.1,
        },
        space: {
          right: 8,
          panel: 0,
          header: 10,
          footer: 10,
        },
      })
      .setOrigin(0, 0)
      .layout();

    scrollablePanel
      .setChildrenInteractive({})
      .on("child.click", (child: any) => {
        this.activeTool = toolType;
        this.activeToolData = child.getData("item");
        this.mouseOverlayObject.setTexture(this.activeToolData.texture);
        this.mouseOverlayObject.setAlpha(0.5);
        this.mouseOverlayObject.setActive(true);
        if (this.activeToolData.origin) {
          this.mouseOverlayObject.setOrigin(
            (this.activeToolData.origin[0] + 0.5) / this.activeToolData.width,
            (this.activeToolData.origin[1] + 0.5) / this.activeToolData.height
          );
        } else {
          this.mouseOverlayObject.setOrigin(0.5, 0.5);
        }
      })
      .on("child.down", (child: any) => {
        child.getElement("background").setFillStyle(UI_COLOR_DARK);
      })
      .on("child.up", (child: any) => {
        child.getElement("background").setFillStyle(UI_COLOR_NEUTRAL);
      })
      .on("child.over", (child: any) => {
        child.getElement("background").setStrokeStyle(2, 0xffffff);
      })
      .on("child.out", (child: any) => {
        child.getElement("background").setStrokeStyle();
      });

    return scrollablePanel;
  }

  createGrid(items: { [itemKey: string]: { name: string; texture: string } }) {
    // Create table body
    var sizer = this.rexUI.add.fixWidthSizer({
      space: {
        left: 0,
        right: 0,
        top: 0,
        bottom: 0,
        item: 8,
        line: 8,
      },
    });

    const itemsKeys = Object.keys(items);

    for (var i = 0; i !== itemsKeys.length; i++) {
      sizer.add(
        this.rexUI.add
          .label({
            width: tileSize * 3,
            height: tileSize * 3,

            background: this.rexUI.add.roundRectangle(
              0,
              0,
              0,
              0,
              14,
              UI_COLOR_NEUTRAL
            ),
            /*
          text: this.add.text(0, 0, `${i}`, {
            ...BASE_TEXT_STYLE,
            fontSize: 18,
          }),*/

            icon: this.add.image(0, 0, items[itemsKeys[i]].texture),
            iconSize: tileSize * 2,

            align: "center",
            space: {
              left: 0,
              right: 0,
              top: 0,
              bottom: 0,
            },
          })
          .setData("item", items[itemsKeys[i]])
      );
    }

    return sizer;
  }

  update() {
    const worldPoint = this.input.activePointer.positionToCamera(
      this.world.mapCamera
    ) as Phaser.Math.Vector2;

    this.prevTileX = this.tileX;
    this.prevTileY = this.tileY;

    this.tileX = Math.floor(worldPoint.x / tileSize);
    this.tileY = Math.floor(worldPoint.y / tileSize);

    if (this.keyE.isDown) {
      this.bus.emit(ADD_SAND_EVENT, this.tileX, this.tileY);
    }

    if (totalSand.count !== totalSand.lastUpdate) {
      this.counterText.setText(totalSand.count.toString());
      totalSand.lastUpdate = totalSand.count;
    }

    this.drawMark(
      this.tileX * tileSize - this.world.mapCamera.scrollX,
      this.tileY * tileSize - this.world.mapCamera.scrollY,
      Color.IntegerToColor(0x9966ff)
    );

    params.worldCoord.x = worldPoint.x;
    params.worldCoord.y = worldPoint.y;
    params.tileCoord.x = this.tileX;
    params.tileCoord.y = this.tileY;
  }

  drawMark(x: number, y: number, color: Color) {
    this.marker.clear();

    this.marker
      .lineStyle(1, color.color, 1)
      .translateCanvas(x + tileSize, y + tileSize)
      .beginPath()
      .moveTo(0, 0)
      .lineTo(0, tileSize)
      .lineTo(tileSize, tileSize)
      .lineTo(tileSize, 0)
      .closePath()
      .strokePath();
  }
}
