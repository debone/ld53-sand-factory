import { RESOURCES } from "../scenes/preload";
import { SceneWorld } from "../scenes/world";
import {
  MACHINE_ASSETS,
  PIXEL_TYPE_COLLECTOR,
  PIXEL_TYPE_CRUSHER,
  PIXEL_TYPE_DUPLICATER as PIXEL_TYPE_DUPLICATER,
  PIXEL_TYPE_NORMAL_EMITTER,
} from "./SandFallSystem/const";
import { ADD_MACHINE_EVENT, Direction, UP } from "./consts";

export const MACHINE_DUPLICATER = "machine-duplicater";
export const MACHINE_CRUSHER = "machine-crusher";
export const MACHINE_NORMAL_EMITTER = "machine-normal-emitter";
export const MACHINE_COLLECTOR = "machine-collector";

export type MachineMeta = {
  name: string;
  width: number;
  height: number;
  texture: string;
  pixelType: number;
  origin: [number, number];
};

export const MachineTypes = [
  MACHINE_DUPLICATER,
  MACHINE_CRUSHER,
  MACHINE_NORMAL_EMITTER,
  MACHINE_COLLECTOR,
] as const;
export type MachineType = (typeof MachineTypes)[number];

export const PixelTypeMachineMap: { [key: number]: MachineType } = {
  [PIXEL_TYPE_DUPLICATER]: MACHINE_DUPLICATER,
  [PIXEL_TYPE_CRUSHER]: MACHINE_CRUSHER,
  [PIXEL_TYPE_NORMAL_EMITTER]: MACHINE_NORMAL_EMITTER,
  [PIXEL_TYPE_COLLECTOR]: MACHINE_COLLECTOR,
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
    canUserAdd: true,
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
    canUserAdd: true,
  },
  [MACHINE_NORMAL_EMITTER]: {
    name: "Emitter",
    width: 1,
    height: 1,
    texture: RESOURCES.MACHINE_NORMAL_EMITTER,
    pixelType: PIXEL_TYPE_NORMAL_EMITTER,
    origin: [0, 0],
    mask: [[1]],
    canUserAdd: false,
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
    canUserAdd: false,
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

    this.machines.push({
      type: MACHINE_DUPLICATER,
      x: 0,
      y: 0,
      width: 3,
      height: 1,
      direction: UP,
    });

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
