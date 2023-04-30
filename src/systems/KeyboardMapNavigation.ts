import { SceneWorld } from "../scenes/world";

function KeyboardMapNavigation(scene: SceneWorld) {
  if (scene.cursors.up.isDown || scene.keyW.isDown) {
    scene.mapCamera.scrollY -= 10;
  }
  if (scene.cursors.down.isDown || scene.keyS.isDown) {
    scene.mapCamera.scrollY += 10;
  }
  if (scene.cursors.left.isDown || scene.keyA.isDown) {
    scene.mapCamera.scrollX -= 10;
  }
  if (scene.cursors.right.isDown || scene.keyD.isDown) {
    scene.mapCamera.scrollX += 10;
  }
}

export default KeyboardMapNavigation;
