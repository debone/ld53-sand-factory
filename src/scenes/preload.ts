import Phaser from "phaser";

export const imageIso = import.meta.glob<{ default: string }>(
  "../assets/*.png",
  { eager: true }
);

export const RESOURCES = {
  TILE_WARNING: "tile-warning.png",
  TILE_WOOD: "tile-wood.png",
  TILE_STEEL: "tile-steel.png",

  SAND_NORMAL: "sand-normal.png",
  SAND_GLASS: "sand-glass.png",
  SAND_SHINY_GLASS: "sand-shiny-glass.png",
  SAND_CRUSHED_GLASS: "sand-crushed-glass.png",
  SAND_EMERALD: "sand-emerald.png",
  SAND_NORMAL_EMERALD: "sand-normal-emerald.png",
  SAND_CRUSHED_EMERALD: "sand-crushed-emerald.png",
  SAND_AMBER: "sand-amber.png",
  SAND_CRUSHED_AMBER: "sand-crushed-amber.png",
  SAND_COAL: "sand-coal.png",
  SAND_CRUSHED_COAL: "sand-crushed-coal.png",
  SAND_DIAMOND: "sand-diamond.png",
  SAND_CRUSHED_DIAMOND: "sand-crushed-diamond.png",
  SAND_TRASH: "sand-trash.png",

  MACHINE_NORMAL_EMITTER: "machine-emitter.png",
  MACHINE_COLLECTOR: "machine-collector.png",
  MACHINE_DUPLICATER: "machine-duplicater.png",
  MACHINE_CRUSHER: "machine-crusher.png",
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
  }

  create() {
    WebFont.load({
      google: {
        families: ["Silkscreen"],
      },
      active: () => {
        this.add
          .text(260, 320, "Press space to start", {
            fontFamily: "Silkscreen",
            fontSize: "32px",
            color: "#ffffff",
          })
          .setShadow(2, 2, "#333333", 2, false, true);
      },
    });

    this.keySpace = this.input.keyboard!.addKey("SPACE");

    this.scene.transition({
      target: "SceneWorld",
    });
  }

  update(/*time, delta*/) {
    if (Phaser.Input.Keyboard.JustDown(this.keySpace)) {
      this.scene.transition({
        target: "SceneWorld",
        duration: 2000,
      });
    }
  }
}
