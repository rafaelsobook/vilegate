import { Engine, MeshBuilder, Scene, SceneLoader, Vector3 } from "babylonjs"
import "babylonjs-loaders"
import { manager } from "./scenes/manager.js"
const log = console.log

const engine = new Engine(document.querySelector("canvas"), true)

async function main(){

  const scene = await manager(engine, "test")

  engine.runRenderLoop(() => scene.render())
  window.addEventListener("resize", ()=> engine.resize())
}
main()