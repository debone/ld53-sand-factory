import { SceneWorld } from "../scenes/world";
import { ADD_MACHINE_EVENT, UP } from "./consts";

export const DUPLICATER_MACHINE = "duplicater-machine";

export const MachineTypes = [DUPLICATER_MACHINE] as const;
export type MachineType = (typeof MachineTypes)[number];

export const MACHINES = {
  [DUPLICATER_MACHINE]: {
    name: "Duplicater",
    width: 3,
    height: 1,
  },
};

export const MACHINE_ACTIONS = [];

type Machine = {
  type: MachineType;
  x: number;
  y: number;

  width: number;
  height: number;

  direction: number;
};

class MachineSystems {
  scene: SceneWorld;
  declare machines: Machine[];

  constructor(scene: SceneWorld) {
    this.scene = scene;
    this.machines = [];

    this.machines.push({
      type: DUPLICATER_MACHINE,
      x: 0,
      y: 0,
      width: 3,
      height: 1,
      direction: UP,
    });

    this.registerEvents(scene.bus);
  }
  registerEvents(bus: Phaser.Events.EventEmitter) {
    bus.on(ADD_MACHINE_EVENT, (type: MachineType, x: number, y: number) => {
      this.machines.push({
        type,
        x,
        y,
        width: MACHINES[type].width,
        height: MACHINES[type].height,
        direction: UP,
      });
    });
  }
}
