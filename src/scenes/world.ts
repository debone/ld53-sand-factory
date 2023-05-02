import Phaser from "phaser";
import PhaserGamebus from "../gamebus";
import RexUIPlugin from "phaser3-rex-plugins/templates/ui/ui-plugin.js";

import SandFallSystem from "../systems/SandFallSystem/system";
import { sandWorldHeight, sandWorldWidth, tileSize } from "../consts";
import MachineSystem from "../systems/MachineSystem";
import { MINIMAP_TOOL_EVENT } from "../systems/consts";

export let largeZoom = false;

export const cameraTilesWidth = 30;
export const cameraTilesHeight = 30;

export const randomCacheSize = 8096;
export let randomCacheCurr = 0;

export const randomCache = new Uint8Array(randomCacheSize);

// sorry
export const random = () =>
  randomCache[
    randomCacheCurr === randomCacheSize
      ? (randomCacheCurr = 0)
      : randomCacheCurr++
  ];

export class SceneWorld extends Phaser.Scene {
  declare rexUI: RexUIPlugin;
  declare bus: Phaser.Events.EventEmitter;
  declare gamebus: PhaserGamebus;

  declare cursors: Phaser.Types.Input.Keyboard.CursorKeys;
  declare keyW: Phaser.Input.Keyboard.Key;
  declare keyA: Phaser.Input.Keyboard.Key;
  declare keyS: Phaser.Input.Keyboard.Key;
  declare keyD: Phaser.Input.Keyboard.Key;

  declare machineSystem: MachineSystem;
  declare sandFallSystem: SandFallSystem;

  declare mapCamera: Phaser.Cameras.Scene2D.Camera;
  declare controls: Phaser.Cameras.Controls.SmoothedKeyControl;

  constructor() {
    super({ key: "SceneWorld" });
  }

  preload() {}

  create() {
    this.bus = this.gamebus.getBus();

    for (let i = 0; i < randomCacheSize; i++) {
      randomCache[i] = Math.floor(Math.random() * 100);
    }

    this.add.text(100, 100, "Main", {
      font: "15vw verdana",
      color: "white",
    });

    this.cursors = this.input.keyboard!.createCursorKeys();

    this.keyW = this.input.keyboard?.addKey(Phaser.Input.Keyboard.KeyCodes.W)!;
    this.keyA = this.input.keyboard?.addKey(Phaser.Input.Keyboard.KeyCodes.A)!;
    this.keyS = this.input.keyboard?.addKey(Phaser.Input.Keyboard.KeyCodes.S)!;
    this.keyD = this.input.keyboard?.addKey(Phaser.Input.Keyboard.KeyCodes.D)!;

    this.mapCamera = this.cameras
      .add(
        tileSize,
        tileSize,
        cameraTilesWidth * tileSize,
        cameraTilesHeight * tileSize
      )
      .setOrigin(0, 0)
      .setName("map");

    this.mapCamera.setBounds(
      0,
      0,
      sandWorldWidth * tileSize,
      sandWorldHeight * tileSize
    );

    const controlConfig = {
      camera: this.mapCamera,
      left: this.keyA,
      right: this.keyD,
      up: this.keyW,
      down: this.keyS,
      acceleration: 0.03,
      drag: 0.0005,
      maxSpeed: 0.5,
    };

    this.controls = new Phaser.Cameras.Controls.SmoothedKeyControl(
      controlConfig
    );

    this.machineSystem = new MachineSystem(this);
    this.sandFallSystem = new SandFallSystem(this);

    this.cameras.main.ignore(this.sandFallSystem.rt);

    const zoomChange = () => {
      if (largeZoom === false) {
        this.mapCamera.setScroll((sandWorldWidth * tileSize) / 2, 0);
        this.controls.stop();
        largeZoom = true;
      } else {
        this.controls.start();
        largeZoom = false;
      }
    };
    this.cursors.space.on("up", zoomChange);
    this.bus.on(MINIMAP_TOOL_EVENT, zoomChange);

    //  const rt = this.add.renderTexture(32, 32, 64, 64);

    //rt2.draw(RESOURCES.WARNING_TILE);
    // rt.draw(RESOURCES.WARNING_TILE, 0, 16);
    //    const rt = this.add.renderTexture(0, 0, 64, 64).setOrigin(0);

    //  rt.draw(RESOURCES.WARNING_TILE, 0, 0);

    //    this.scene.run("SceneDebug", { sceneWorld: this });
    this.scene.run("SceneUI", { sceneWorld: this });

    this.mapCamera.setScroll((sandWorldWidth * tileSize) / 2, 0);

    this.timestep = this.time.addEvent({
      delay: 250,
      callback: () => this.worldStep(),
      loop: true,
    });

    this.maxAnim = 80;
    this.currAnim = 0;
  }

  declare maxAnim: number;
  declare currAnim: number;

  declare timestep: Phaser.Time.TimerEvent;

  worldStep() {
    this.sandFallSystem.update();
    this.bus.emit("mapTick");
  }

  update(_time: number, delta: number) {
    this.currAnim += delta;
    if (this.currAnim > this.maxAnim) {
      this.sandFallSystem.render(largeZoom);
      this.currAnim = 0;
    }
    this.controls.update(delta);
  }
}
