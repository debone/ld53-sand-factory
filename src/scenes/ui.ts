import { Display, GameObjects, RIGHT } from "phaser";
import RexUIPlugin from "phaser3-rex-plugins/templates/ui/ui-plugin.js";

import { GAME_CONFIG, tileSize } from "../consts";
import { RESOURCES } from "./preload";
import {
  SceneWorld,
  cameraTilesHeight,
  cameraTilesWidth,
  random,
} from "./world";
import { params } from "./debug";
import PhaserGamebus from "../gamebus";
import {
  ACTIVATE_ITEM_EVENT,
  ADD_MACHINE_EVENT,
  ADD_SAND_EVENT,
  ADD_TILE_EVENT,
  DOWN,
  MINIMAP_TOOL_EVENT,
  UP,
} from "../systems/consts";

import UIbgImg from "../assets/ui/ui-bg.png?url";

import playButtonImg from "../assets/ui/play-button.png?url";
import pauseButtonImg from "../assets/ui/pause-button.png?url";
import stepButtonImg from "../assets/ui/step-button.png?url";
import ffButtonImg from "../assets/ui/ff-button.png?url";

import stepIndicatorImg from "../assets/ui/step-indicator.png?url";

import inspectToolImg from "../assets/ui/inspect-tool.png?url";
import eraserToolImg from "../assets/ui/eraser-tool.png?url";
import sweepToolImg from "../assets/ui/sweep-tool.png?url";
import minimapToolImg from "../assets/ui/minimap-tool.png?url";

// @ts-ignore
import type Color = Display.Color;
import {
  MACHINES,
  MACHINE_BURNER,
  MACHINE_COLLECTOR,
  MACHINE_CRUSHER,
  MACHINE_DUPLICATER,
  MACHINE_NORMAL_EMITTER,
} from "../systems/MachineSystem";
import {
  GetPixelType,
  IsSand,
  PIXEL_TYPE_AIR_SHIFTED,
  PIXEL_TYPE_TILE_LOCK,
  PIXEL_TYPE_TILE_STEEL,
  PIXEL_TYPE_TILE_WOOD,
  SANDS,
  SAND_TYPE_EMERALD,
  SAND_TYPE_GLASS,
  SAND_TYPE_NORMAL,
  SAND_TYPE_SHINY_GLASS,
  SAND_VALUE,
  SandType,
  TILES,
} from "../systems/SandFallSystem/const";
import RoundRectangle from "phaser3-rex-plugins/plugins/roundrectangle";
import { sandWorldWidth } from "../consts";
import { sandWorld } from "../systems/SandFallSystem/update";
import { LEFT } from "../systems/consts";
import TextArea from "phaser3-rex-plugins/templates/ui/textarea/TextArea";
import { t } from "vitest/dist/global-ea084c9f";
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

export const TOASTER_TEXT_STYLE = {
  fontFamily: "Silkscreen",
  fontSize: "14px",
  color: "#ffffff",
};

export const TOASTER_TEXT_STYLE_RED = {
  ...TOASTER_TEXT_STYLE,
  color: "#e83b3b",
};

export const TOASTER_TEXT_STYLE_GREEN = {
  ...TOASTER_TEXT_STYLE,
  color: "#91db69",
};

export const SELECTED_TOOL_TILE = "selected-tool-tile";
export const SELECTED_TOOL_MACHINE = "selected-tool-machine";
export const SELECTED_TOOL_SAND = "selected-tool-sand";

export const SELECTED_TOOL_INSPECTOR = "selected-tool-inspect";
export const SELECTED_TOOL_ERASER = "selected-tool-eraser";
export const SELECTED_TOOL_SWEEPER = "selected-tool-sweep";

/*
  100, // SAND_TYPE_GLASS
  150, // MACHINE_DUPLICATER
  1_000, // PIXEL_TYPE_TILE_STEEL
  5_000, // SAND_TYPE_SHINY_GLASS
  7_500, // MACHINE_CRUSHER
  10_000, // PIXEL_TYPE_TILE_LOCK
  25_000, // SAND_TYPE_EMERALD
  150_000, // MACHINE_COLLECTOR
*/

export const PROGRESSION_COST = [
  SANDS[SAND_TYPE_NORMAL].unlocksAt,
  TILES[PIXEL_TYPE_TILE_WOOD].unlocksAt,
  SANDS[SAND_TYPE_GLASS].unlocksAt,
  MACHINES[MACHINE_DUPLICATER].unlocksAt,
  TILES[PIXEL_TYPE_TILE_STEEL].unlocksAt,
  SANDS[SAND_TYPE_SHINY_GLASS].unlocksAt,
  MACHINES[MACHINE_CRUSHER].unlocksAt,
  MACHINES[MACHINE_BURNER].unlocksAt,
  TILES[PIXEL_TYPE_TILE_LOCK].unlocksAt,
  SANDS[SAND_TYPE_EMERALD].unlocksAt,
  MACHINES[MACHINE_COLLECTOR].unlocksAt,
];

export const PROGRESSION_REFERENCE = [
  SANDS[SAND_TYPE_NORMAL].name,
  TILES[PIXEL_TYPE_TILE_WOOD].name,
  SANDS[SAND_TYPE_GLASS].name,
  MACHINES[MACHINE_DUPLICATER].name,
  TILES[PIXEL_TYPE_TILE_STEEL].name,
  SANDS[SAND_TYPE_SHINY_GLASS].name,
  MACHINES[MACHINE_CRUSHER].name,
  MACHINES[MACHINE_BURNER].name,
  TILES[PIXEL_TYPE_TILE_LOCK].name,
  SANDS[SAND_TYPE_EMERALD].name,
  MACHINES[MACHINE_COLLECTOR].name,
];

export let CURRENT_PROGRESS = 0;
export const MAX_PROGRESS = PROGRESSION_REFERENCE.length;

export let totalSand: {
  bus: any;
  count: number;
  lastUpdate: number;
  addSand: (sandType: number) => void;
  add: (amount: number) => void;
  pay: (amount: number) => void;
} = {
  bus: null,
  count: 0,
  lastUpdate: 0,
  addSand: (sandType: number) => {
    totalSand.add(SAND_VALUE[sandType]);
  },
  add(amount: number) {
    totalSand.count += amount;

    if (
      CURRENT_PROGRESS !== MAX_PROGRESS &&
      PROGRESSION_COST[CURRENT_PROGRESS] <= totalSand.count
    ) {
      totalSand.bus.emit(`${PROGRESSION_REFERENCE[CURRENT_PROGRESS]} label`);

      CURRENT_PROGRESS++;
    }
  },
  pay(amount: number) {
    totalSand.count -= amount;
  },
};

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

    this.load.spritesheet("inspect-tool", inspectToolImg, {
      frameWidth: 32,
      frameHeight: 32,
    });
    this.load.spritesheet("eraser-tool", eraserToolImg, {
      frameWidth: 32,
      frameHeight: 32,
    });
    this.load.spritesheet("sweep-tool", sweepToolImg, {
      frameWidth: 32,
      frameHeight: 32,
    });
    this.load.spritesheet("minimap-tool", minimapToolImg, {
      frameWidth: 32,
      frameHeight: 32,
    });
  }

  activeTool = SELECTED_TOOL_INSPECTOR;
  activeToolData: any = null;
  activeToolRotation = UP;

  declare counterNumberFormatter: Intl.NumberFormat;

  create({ sceneWorld }: { sceneWorld: SceneWorld }) {
    this.world = sceneWorld;

    this.bus = this.gamebus.getBus();
    totalSand.bus = this.bus;

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

    this.counterNumberFormatter = new Intl.NumberFormat();

    this.counterText = this.add.text(
      tileSize * 33,
      tileSize * 2 - 2,
      "0",
      BASE_TEXT_STYLE
    );

    this.toasterText = this.add.text(
      tileSize * 33,
      tileSize * 3 - 2,
      "Welcome to Sand world!",
      TOASTER_TEXT_STYLE
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
        if (this.prevTileX === this.tileX && this.prevTileY === this.tileY) {
          return;
        }
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

    this.bus.emit(
      ADD_MACHINE_EVENT,
      Math.floor(sandWorldWidth / 2 + cameraTilesWidth / 2) - 1,
      3,
      MACHINES[MACHINE_NORMAL_EMITTER],
      DOWN
    );

    this.bus.emit(
      ADD_MACHINE_EVENT,
      Math.floor(sandWorldWidth / 2 + cameraTilesWidth / 2) + 3,
      27,
      MACHINES[MACHINE_COLLECTOR],
      UP
    );

    totalSand.add(50);
    totalSand.add(50);
    totalSand.add(50);
    totalSand.add(50);
    totalSand.add(50);

    // REMOVE ME
    totalSand.add(5000);
    totalSand.add(5000);
    totalSand.add(5000);
    totalSand.add(5000);
    totalSand.add(5000);
    totalSand.add(5000);

    this.bus.emit(
      ADD_MACHINE_EVENT,
      Math.floor(sandWorldWidth / 2 + cameraTilesWidth / 2) + 5,
      22,
      MACHINES[MACHINE_CRUSHER],
      UP
    );

    /*    this.bus.emit(
      ADD_MACHINE_EVENT,
      this.tileX,
      this.tileY,
      this.activeToolData,
      this.activeToolRotation
    );*/
  }

  declare counterText: Phaser.GameObjects.Text;
  declare toasterText: Phaser.GameObjects.Text;

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

    if (this.activeTool === SELECTED_TOOL_INSPECTOR) {
      return;
    }

    if (!this.activeToolData.width || !this.activeToolData.height) {
      throw "Invalid tool data";
    }

    // Can I place the element in the map world?
    if (!this.canBePlaced()) {
      this.toasterText.setText("Can't place here!");
      this.toasterText.setStyle(TOASTER_TEXT_STYLE_RED);
      setTimeout(() => {
        if (this.toasterText.text === "Can't place here!")
          this.toasterText.setText("");
      }, 1000);
      return;
    }

    if (this.activeToolData.cost < totalSand.count) {
      totalSand.pay(this.activeToolData.cost);
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
      case this.activeTool === SELECTED_TOOL_SAND: {
        this.bus.emit(
          ADD_SAND_EVENT,
          this.tileX,
          this.tileY,
          this.activeToolData.pixelType
        );
        break;
      }
      case this.activeTool === SELECTED_TOOL_ERASER: {
        break;
      }
      case this.activeTool === SELECTED_TOOL_SWEEPER: {
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

    if (this.activeToolData?.cost > totalSand.count) {
      this.mouseOverlayObject.setTint(0xff0000);
    } else {
      this.mouseOverlayObject.setTint(0);
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
      case this.activeTool === SELECTED_TOOL_SWEEPER: {
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
    this.world.timestep.delay = 32;
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

    const inspectToolSprite = this.add
      .sprite(tileSize * 34, tileSize * 10, "inspect-tool", 0)
      .setInteractive();
    const eraserToolSprite = this.add
      .sprite(tileSize * 34, tileSize * 13, "eraser-tool", 0)
      .setInteractive();
    const sweepToolSprite = this.add
      .sprite(tileSize * 34, tileSize * 16, "sweep-tool", 0)
      .setInteractive();
    const minimapToolSprite = this.add
      .sprite(tileSize * 34, tileSize * 19, "minimap-tool", 0)
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
      this.toasterText.setText("");
      playButtonSprite.setFrame(0);
    });
    playButtonSprite.on("pointerover", () => {
      this.toasterText.setText(`Play (shortcut "1")`);
      this.toasterText.setStyle(TOASTER_TEXT_STYLE);
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
      this.toasterText.setText("");
      pauseButtonSprite.setFrame(0);
    });
    pauseButtonSprite.on("pointerover", () => {
      this.toasterText.setText(`Pause (shortcut "2")`);
      this.toasterText.setStyle(TOASTER_TEXT_STYLE);
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
      this.toasterText.setText(``);
      stepButtonSprite.setFrame(0);
    });
    stepButtonSprite.on("pointerover", () => {
      this.toasterText.setText(`Step (shortcut "3")`);
      this.toasterText.setStyle(TOASTER_TEXT_STYLE);
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
      this.toasterText.setText(``);
      ffButtonSprite.setFrame(0);
    });
    ffButtonSprite.on("pointerover", () => {
      this.toasterText.setText(`Fast! (shortcut "4")`);
      this.toasterText.setStyle(TOASTER_TEXT_STYLE);
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

    inspectToolSprite.on("pointerout", () => {
      inspectToolSprite.setFrame(0);
    });
    inspectToolSprite.on("pointerover", () => {
      inspectToolSprite.setFrame(1);
    });
    inspectToolSprite.on("pointerdown", () => {
      inspectToolSprite.setFrame(2);
    });
    inspectToolSprite.on("pointerup", () => {
      inspectToolSprite.setFrame(1);

      this.activeTool = SELECTED_TOOL_INSPECTOR;
      this.activeToolData = null;
      this.mouseOverlayObject.setAlpha(0);
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

    minimapToolSprite.on("pointerout", () => {
      this.toasterText.setText(``);
      minimapToolSprite.setFrame(0);
    });
    minimapToolSprite.on("pointerover", () => {
      this.toasterText.setStyle(TOASTER_TEXT_STYLE);
      this.toasterText.setText(`Minimap (space)`);
      minimapToolSprite.setFrame(1);
    });
    minimapToolSprite.on("pointerdown", () => {
      minimapToolSprite.setFrame(2);
    });
    minimapToolSprite.on("pointerup", () => {
      this.bus.emit(MINIMAP_TOOL_EVENT);
      minimapToolSprite.setFrame(1);
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

    this.createInfoPanel();
  }

  declare infoPanelText: TextArea;

  createInfoPanel() {
    this.infoPanelText = this.rexUI.add.textArea({
      // text: this.add.text(),
      text: this.rexUI.add.BBCodeText(0, 0, "", {
        ...TOASTER_TEXT_STYLE,
        fontSize: "10px",
        images: {
          // @ts-ignore
          [RESOURCES.MACHINE_CRUSHER]: { height: 32 },
        },
      }),

      space: {
        text: 10,
      },

      content: "Hover on the menu to see some information",
    });

    this.rexUI.add
      .sizer({
        x: tileSize * 33,
        y: tileSize * 22,
        width: tileSize * 15,
        height: tileSize * 8,
        orientation: "y",
      })
      .setOrigin(0, 0)
      .add(
        this.infoPanelText, //child
        1, // proportion
        "left-top", // align
        5, // paddingConfig
        true // expand
      )
      .layout();
  }

  createTabs() {
    const tabPages = this.rexUI.add
      .tabPages({
        x: tileSize * 36,
        y: tileSize * 9,
        width: tileSize * 12,
        height: tileSize * 12,

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
    items: {
      [itemKey: string]: { name: string; texture: string; hideOnUI: boolean };
    },
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
        if (child.getData("available")) {
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
        } else {
        }
      })
      .on("child.down", (child: any) => {
        if (child.getData("available")) {
          child.getElement("background").setFillStyle(UI_COLOR_DARK, 0.1);
        }
      })
      .on("child.up", (child: any) => {
        if (child.getData("available")) {
          child.getElement("background").setFillStyle(UI_COLOR_HIGHLIGHT, 0.1);
        }
      })
      .on("child.over", (child: any) => {
        const item = child.getData("item");

        this.toasterText.setText(`cost: ${item.cost}`);
        this.toasterText.setStyle(
          !child.getData("available") || item.cost > totalSand.count
            ? TOASTER_TEXT_STYLE_RED
            : TOASTER_TEXT_STYLE_GREEN
        );

        if (item.description) {
          this.infoPanelText.setText(item.description);
        }

        (child.getElement("background") as RoundRectangle).setStrokeStyle(
          2,
          child.getData("available") ? 0xffffff : 0xff0000
        );
      })
      .on("child.out", (child: any) => {
        child.getElement("background").setStrokeStyle();
        this.infoPanelText.setText("");
        this.toasterText.setText("");
      });

    return scrollablePanel;
  }

  createGrid(items: {
    [itemKey: string]: {
      name: string;
      texture: string;
      hideOnUI: boolean;
    };
  }) {
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
      const item = items[itemsKeys[i]];

      // REMOVE ME (UNCOMMENT ME)
      //if (item.hideOnUI) continue;

      const icon = this.add.image(0, 0, items[itemsKeys[i]].texture);

      const background = this.rexUI.add
        .roundRectangle(0, 0, 0, 0, 14)
        .setFillStyle(UI_COLOR_NEUTRAL, 0.9);

      const label = this.rexUI.add.label({
        name: `${item.name} label`,
        width: tileSize * 3,
        height: tileSize * 3,

        background,
        icon,

        /*
      text: this.add.text(0, 0, `${i}`, {
        ...BASE_TEXT_STYLE,
        fontSize: 18,
      }),*/

        iconSize: tileSize * 2,

        align: "center",
        space: {
          left: 0,
          right: 0,
          top: 0,
          bottom: 0,
        },
      });

      label.setData("item", item);
      label.setData("available", false);

      // REMOVE ME
      label.setData("available", true);
      background.setFillStyle(UI_COLOR_HIGHLIGHT, 0.1);

      this.bus.on(`${item.name} label`, () => {
        label.setData("available", true);
        background.setFillStyle(UI_COLOR_HIGHLIGHT, 0.1);
      });

      sizer.add(label);
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
      this.counterText.setText(
        this.counterNumberFormatter.format(totalSand.count)
      );
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

  canBePlaced() {
    const {
      direction: tempDirection,
      width,
      height,
      mask: tempMask,
      origin,
    } = this.activeToolData;

    const direction = tempDirection ? tempDirection : UP;
    const mask = tempMask ? tempMask : [[]];

    const x = this.tileX;
    const y = this.tileY;

    const originX = origin ? origin[0] : 0;
    const originY = origin ? origin[1] : 0;

    if (direction === UP) {
      for (let dy = 0; dy !== height; dy++) {
        for (let dx = 0; dx !== width; dx++) {
          if (mask[dy][dx] === 0) continue;

          if (
            GetPixelType(
              sandWorld[x + dx - originX + (y + dy - originY) * sandWorldWidth]
            ) !== PIXEL_TYPE_AIR_SHIFTED &&
            !IsSand(
              sandWorld[x + dx - originX + (y + dy - originY) * sandWorldWidth]
            )
          ) {
            return false;
          }
        }
      }
    } else if (direction === DOWN) {
      for (let dy = height - 1; dy !== -1; dy--) {
        for (let dx = width - 1; dx !== -1; dx--) {
          if (mask[height - 1 - dy][width - 1 - dx] === 0) continue;

          if (
            GetPixelType(
              sandWorld[
                x +
                  width -
                  1 -
                  dx -
                  originX +
                  (y + height - 1 + dy - originY) * sandWorldWidth
              ]
            ) !== PIXEL_TYPE_AIR_SHIFTED &&
            !IsSand(
              sandWorld[
                x +
                  width -
                  1 -
                  dx -
                  originX +
                  (y + height - 1 + dy - originY) * sandWorldWidth
              ]
            )
          ) {
            return false;
          }
        }
      }
    } else if (direction === LEFT) {
      for (let dy = width - 1; dy !== -1; dy--) {
        for (let dx = 0; dx !== height; dx++) {
          if (mask[dx][dy] === 0) continue;

          if (
            GetPixelType(
              sandWorld[x + dx - originY + (y + dy - originX) * sandWorldWidth]
            ) !== PIXEL_TYPE_AIR_SHIFTED &&
            !IsSand(
              sandWorld[x + dx - originY + (y + dy - originX) * sandWorldWidth]
            )
          ) {
            return false;
          }
        }
      }
    } else if (direction === RIGHT) {
      for (let dy = 0; dy !== width; dy++) {
        for (let dx = height - 1; dx !== -1; dx--) {
          if (mask[height - 1 - dx][dy] === 0) continue;

          if (
            GetPixelType(
              sandWorld[
                x +
                  height -
                  1 +
                  dx -
                  originY +
                  (y + dy - originX) * sandWorldWidth
              ]
            ) !== PIXEL_TYPE_AIR_SHIFTED &&
            !IsSand(
              sandWorld[
                x +
                  height -
                  1 +
                  dx -
                  originY +
                  (y + dy - originX) * sandWorldWidth
              ]
            )
          ) {
            return false;
          }
        }
      }
    }

    return true;
  }
}
