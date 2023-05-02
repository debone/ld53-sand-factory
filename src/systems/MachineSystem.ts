import { RESOURCES } from "../scenes/preload";
import { SceneWorld } from "../scenes/world";
import {
  MACHINE_ASSETS,
  PIXEL_TYPE_BURNER,
  PIXEL_TYPE_COLLECTOR,
  PIXEL_TYPE_CRUSHER,
  PIXEL_TYPE_DUPLICATER as PIXEL_TYPE_DUPLICATER,
  PIXEL_TYPE_FAN,
  PIXEL_TYPE_NORMAL_EMITTER,
} from "./SandFallSystem/const";
import { ADD_MACHINE_EVENT, Direction, UP } from "./consts";

export const VARIANT_MACHINE_CORE = 0;
export const VARIANT_MACHINE_PART = 1;

export const MACHINE_DUPLICATER = "machine-duplicater";
export const MACHINE_CRUSHER = "machine-crusher";
export const MACHINE_NORMAL_EMITTER = "machine-normal-emitter";
export const MACHINE_COLLECTOR = "machine-collector";
export const MACHINE_BURNER = "machine-burner";
export const MACHINE_FAN = "machine-fan";

export type MachineMeta = {
  name: string;
  width: number;
  height: number;
  texture: string;
  pixelType: number;
  origin: [number, number];
  mask: number[][];
};

export const MachineTypes = [
  MACHINE_DUPLICATER,
  MACHINE_CRUSHER,
  MACHINE_NORMAL_EMITTER,
  MACHINE_COLLECTOR,
  MACHINE_BURNER,
  MACHINE_FAN,
] as const;
export type MachineType = (typeof MachineTypes)[number];

export const PixelTypeMachineMap: { [key: number]: MachineType } = {
  [PIXEL_TYPE_DUPLICATER]: MACHINE_DUPLICATER,
  [PIXEL_TYPE_CRUSHER]: MACHINE_CRUSHER,
  [PIXEL_TYPE_NORMAL_EMITTER]: MACHINE_NORMAL_EMITTER,
  [PIXEL_TYPE_COLLECTOR]: MACHINE_COLLECTOR,
  [PIXEL_TYPE_BURNER]: MACHINE_BURNER,
  [PIXEL_TYPE_FAN]: MACHINE_FAN,
};

// Remember to add the ASSETS on the `SandFallSystem/const.ts` file
export const MACHINES = Object.freeze({
  [MACHINE_DUPLICATER]: {
    name: "Duplicater",
    width: 3,
    height: 1,
    texture: RESOURCES.MACHINE_DUPLICATER,
    pixelType: PIXEL_TYPE_DUPLICATER,
    origin: [1, 0],
    mask: [[1, 1, 1]],
    unlocksAt: 1_500,
    cost: 250,
    hideOnUI: false,
    description: `
[img=${RESOURCES.MACHINE_DUPLICATER}]

[i]Duplicater[/i]
[i]Cost:[/i] 250
[i]Unlocks at:[/i] 1,500
The basic machine required to break the laws of physics and duplicate sand.`,
  },
  [MACHINE_CRUSHER]: {
    name: "Crusher",
    width: 5,
    height: 3,
    texture: RESOURCES.MACHINE_CRUSHER,
    pixelType: PIXEL_TYPE_CRUSHER,
    origin: [2, 2],
    mask: [
      [1, 0, 0, 0, 1],
      [1, 0, 0, 0, 1],
      [1, 1, 1, 1, 1],
    ],
    unlocksAt: 75_000,
    cost: 2500,
    hideOnUI: false,
    description: `
[img=${RESOURCES.MACHINE_CRUSHER}]


[i]Crusher[/i]
[i]Cost:[/i] 2,500
[i]Unlocks at:[/i] 75,000
A machine that crushes sand into glass, and everything else.`,
  },
  [MACHINE_NORMAL_EMITTER]: {
    name: "Emitter",
    width: 1,
    height: 1,
    texture: RESOURCES.MACHINE_NORMAL_EMITTER,
    pixelType: PIXEL_TYPE_NORMAL_EMITTER,
    origin: [0, 0],
    mask: [[1]],
    hideOnUI: true,
  },
  [MACHINE_COLLECTOR]: {
    name: "Collector",
    width: 5,
    height: 2,
    texture: RESOURCES.MACHINE_COLLECTOR,
    pixelType: PIXEL_TYPE_COLLECTOR,
    origin: [2, 1],
    mask: [
      [1, 0, 0, 0, 1],
      [1, 1, 1, 1, 1],
    ],
    unlocksAt: 500_000,
    cost: 50_000,
    hideOnUI: false,
    description: `
[img=${RESOURCES.MACHINE_COLLECTOR}]


[i]Collector[/i]
[i]Cost:[/i] 50,000
[i]Unlocks at:[/i] 500,000
Ain't nobody got time for that. GG.
`,
  },
  [MACHINE_BURNER]: {
    name: "Burner",
    width: 1,
    height: 1,
    texture: RESOURCES.MACHINE_BURNER,
    pixelType: PIXEL_TYPE_BURNER,
    origin: [0, 0],
    mask: [[1]],
    unlocksAt: 80_000,
    cost: 10_000,
    hideOnUI: false,
    description: `
[img=${RESOURCES.MACHINE_BURNER}]

[i]Burner[/i]
[i]Cost:[/i] 10,000
[i]Unlocks at:[/i] 80,000
`,
  },
  [MACHINE_FAN]: {
    name: "Fan",
    width: 1,
    height: 1,
    texture: RESOURCES.MACHINE_FAN,
    pixelType: PIXEL_TYPE_FAN,
    origin: [0, 0],
    mask: [[1]],
    unlocksAt: 20_000,
    cost: 1_000,
    hideOnUI: false,
    description: `
[img=${RESOURCES.MACHINE_FAN}]

[i]Fan[/i]
[i]Cost:[/i] 1,000
[i]Unlocks at:[/i] 20,000
`,
  },
});

export const MACHINE_ACTIONS = [];

type Machine = {
  type: MachineType;
  x: number;
  y: number;

  width: number;
  height: number;

  direction: number;
};

class MachineSystem {
  scene: SceneWorld;
  declare machines: Machine[];

  constructor(scene: SceneWorld) {
    this.scene = scene;
    this.machines = [];

    // MACHINE_ASSETS
    const machines = Object.values(MACHINES);
    for (let i = 0; i < machines.length; i++) {
      const machine = machines[i];

      const images = [
        scene.add.image(0, 0, machine.texture),
        scene.add.image(0, 0, machine.texture),
        scene.add.image(0, 0, machine.texture),
        scene.add.image(0, 0, machine.texture),
      ].map((image, i) =>
        image
          .setOrigin(
            (machine.origin[0] + 0.5) / machine.width,
            (machine.origin[1] + 0.5) / machine.height
          )
          .setRotation((i * Math.PI) / 2)
      );

      MACHINE_ASSETS.push(images as any);
    }

    this.registerEvents(scene.bus);
  }
  registerEvents(bus: Phaser.Events.EventEmitter) {
    bus.on(
      ADD_MACHINE_EVENT,
      (
        x: number,
        y: number,
        machineType: MachineMeta,
        direction: Direction
      ) => {
        console.log({
          type: PixelTypeMachineMap[machineType.pixelType],
          x,
          y,
          width: machineType.width,
          height: machineType.height,
          direction,
        });
        this.machines.push({
          type: PixelTypeMachineMap[machineType.pixelType],
          x,
          y,
          width: machineType.width,
          height: machineType.height,
          direction,
        });
      }
    );
  }
}

export default MachineSystem;
