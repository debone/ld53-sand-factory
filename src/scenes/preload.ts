import Phaser from "phaser";

import amberSand from "../assets/sand-amber.png?url";
import machineBurner from "../assets/machine-burner.png?url";
import machineFan from "../assets/machine-fan.png?url";

export const imageIso = import.meta.glob<{ default: string }>(
  "../assets/*.png",
  { eager: true }
);

export const RESOURCES = {
  INTRO: "intro.png",

  TILE_WARNING: "tile-warning.png",
  TILE_WOOD: "tile-wood.png",
  TILE_STEEL: "tile-steel.png",

  SAND_NORMAL: "sand-normal.png",
  SAND_GLASS: "sand-glass.png",
  SAND_CRUSHED_GLASS: "sand-crushed-glass.png",
  SAND_SHINY_GLASS: "sand-shiny-glass.png",
  SAND_CRUSHED_SHINY_GLASS: "sand-crushed-shiny-glass.png",
  SAND_EMERALD: "sand-emerald.png",
  SAND_NORMAL_EMERALD: "sand-normal-emerald.png",
  SAND_CRUSHED_EMERALD: "sand-crushed-emerald.png",
  SAND_AMBER: "sand-amber",
  SAND_COAL: "sand-coal.png",
  SAND_DIAMOND: "sand-diamond.png",
  SAND_TRASH: "sand-trash.png",

  MACHINE_NORMAL_EMITTER: "machine-emitter.png",
  MACHINE_COLLECTOR: "machine-collector.png",
  MACHINE_DUPLICATER: "machine-duplicater.png",
  MACHINE_CRUSHER: "machine-crusher.png",
  MACHINE_BURNER: "machine-burner",
  MACHINE_FAN: "machine-fan",
} as const;

export const RESOURCES_INDEX = Object.keys(RESOURCES).reduce(
  (acc, key, index) => ({ ...acc, [key]: index }),
  {} as Record<keyof typeof RESOURCES, number>
);

export const RESOURCES_LIST = Object.values(RESOURCES);

declare var WebFont: any;

export class ScenePreload extends Phaser.Scene {
  declare keySpace: Phaser.Input.Keyboard.Key;

  constructor() {
    super({ key: "ScenePreload" });
  }

  preload() {
    this.load.script(
      "webfont",
      "https://ajax.googleapis.com/ajax/libs/webfont/1.6.26/webfont.js"
    );
    for (const sprite in imageIso) {
      this.load.image(
        sprite.replace("../assets/", ""),
        imageIso[sprite].default
      );
    }

    this.load.spritesheet("sand-amber", amberSand, {
      frameWidth: 16,
      frameHeight: 16,
    });

    this.load.spritesheet("machine-burner", machineBurner, {
      frameWidth: 16,
      frameHeight: 16,
    });

    this.load.spritesheet("machine-fan", machineFan, {
      frameWidth: 16,
      frameHeight: 16,
    });
  }

  create() {
    this.add.sprite(800, 0, RESOURCES.INTRO).setOrigin(1, 0);
    WebFont.load({
      google: {
        families: ["Silkscreen"],
      },
      active: () => {
        this.add
          .text(80, 320, `Press "z" to start`, {
            fontFamily: "Silkscreen",
            fontSize: "32px",
            color: "#ffffff",
          })
          .setShadow(2, 2, "#333333", 2, false, true);
      },
    });

    this.keySpace = this.input.keyboard!.addKey("Z");
  }

  update(/*time, delta*/) {
    if (Phaser.Input.Keyboard.JustDown(this.keySpace)) {
      this.scene.transition({
        target: "SceneWorld",
        duration: 2000,
        moveAbove: true,
      });
    }
  }
}
