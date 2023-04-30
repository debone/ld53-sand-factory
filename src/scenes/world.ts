import Phaser from "phaser";
import PhaserGamebus from "../gamebus";
import RexUIPlugin from "phaser3-rex-plugins/templates/ui/ui-plugin.js";

import SandFallSystem from "../systems/SandFallSystem/system";
import { sandWorldHeight, sandWorldWidth, tileSize } from "../consts";

export let largeZoom = false;

export const cameraTilesWidth = 30;
export const cameraTilesHeight = 30;

export class SceneWorld extends Phaser.Scene {
  declare rexUI: RexUIPlugin;
  declare bus: Phaser.Events.EventEmitter;
  declare gamebus: PhaserGamebus;

  declare cursors: Phaser.Types.Input.Keyboard.CursorKeys;
  declare keyW: Phaser.Input.Keyboard.Key;
  declare keyA: Phaser.Input.Keyboard.Key;
  declare keyS: Phaser.Input.Keyboard.Key;
  declare keyD: Phaser.Input.Keyboard.Key;

  declare sandFallSystem: SandFallSystem;

  declare mapCamera: Phaser.Cameras.Scene2D.Camera;
  declare controls: Phaser.Cameras.Controls.SmoothedKeyControl;

  constructor() {
    super({ key: "SceneWorld" });
  }

  preload() {}

  create() {
    this.bus = this.gamebus.getBus();

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

    this.sandFallSystem = new SandFallSystem(this);

    this.cameras.main.ignore(this.sandFallSystem.rt);

    this.cursors.space.on("up", () => {
      if (largeZoom === false) {
        this.mapCamera.setScroll(0, 0);
        this.controls.stop();
        largeZoom = true;
      } else {
        this.controls.start();
        largeZoom = false;
      }
    });

    //  const rt = this.add.renderTexture(32, 32, 64, 64);

    //rt2.draw(RESOURCES.WARNING_TILE);
    // rt.draw(RESOURCES.WARNING_TILE, 0, 16);
    //    const rt = this.add.renderTexture(0, 0, 64, 64).setOrigin(0);

    //  rt.draw(RESOURCES.WARNING_TILE, 0, 0);

    this.scene.run("SceneDebug", { sceneWorld: this });
    this.scene.run("SceneUI", { sceneWorld: this });

    this.timestep = this.time.addEvent({
      delay: 250,
      callback: () => this.worldStep(),
      loop: true,
    });
  }

  declare timestep: Phaser.Time.TimerEvent;

  worldStep() {
    this.sandFallSystem.update();
    this.bus.emit("mapTick");
  }

  update(_time: number, delta: number) {
    this.sandFallSystem.render(largeZoom);

    this.controls.update(delta);
  }
}
