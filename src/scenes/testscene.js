import { DirectionalLight, TransformNode, PointerEventTypes, Scene, Sound, SceneLoader, MeshBuilder, FreeCamera, Vector3, Quaternion, Mesh } from "babylonjs"
import { createShape } from "../modules/basictools.js"
import { createOccluderCage } from "../tools/occluders.js"
import { checkARSupport } from "../tools/checkArSupport.js"
import { enableHitTest } from "../features/hitTest.js"
import { enableAnchorSystem } from "../features/anchors.js"
import { createAnim, animateCam } from "@lucafly/animtool"
const log = console.log

createAnim
let chamberPlace
let occluderRoot
let gate
export async function testScene(engine){
    const scene = new Scene(engine)

    let cam = new FreeCamera("cam", new Vector3(0,2,-5), scene)
    const light = new DirectionalLight("asd", new Vector3(0,-2,1), scene)
    scene.activeCamera.attachControl()
    // const {occluderRoot, placeOccluder} = createOccluderWall(scene, null, cam)

    occluderRoot = await createOccluderCage()

    chamberPlace = (await SceneLoader.ImportMeshAsync("", null, "./models/chamber.glb", scene)).meshes[0]
    chamberPlace.position.y = 100
    chamberPlace.setEnabled(false)

    gate = (await SceneLoader.ImportMeshAsync("", null, "./models/gate.glb", scene)).meshes[0]
    gate.position.y = 100

    // const ground = MeshBuilder.CreateGround("asd", {width:100, height: 100}, scene)
    // ground.position.y -= 0.05
    const state = await checkARSupport()

    try {
        const xr = await scene.createDefaultXRExperienceAsync({
            uiOptions: {
              sessionMode: "immersive-ar",
              onError: async error => {
                log(error)
              }
            },        
            optionalFeatures: true
        })
        const fm = xr.baseExperience.featuresManager;
        cam = xr.baseExperience.camera;

        const marker = createShape(scene, false, false, false, "torus", false, true)
        marker.isVisible = true;


        const { getHitTest } = enableHitTest(fm, marker)
        const anchorSystem = enableAnchorSystem(fm, scene, cam, occluderRoot, chamberPlace, gate)

        let isPlaced = false
        scene.onPointerObservable.add( async (event) => {
            // marker.position = event.pickInfo.pickedPoint
            // marker.isVisible = true;.
            if(isPlaced) return
            isPlaced = true
            const lastHit = getHitTest()

            marker.isVisible = false
            const pickedPoint = marker.position.clone()
            const camPos = cam.position

            if(lastHit) anchorSystem.addAnchorPointUsingHitTestResultAsync(lastHit)
            log(lastHit)
            if(!lastHit){
                const parentNode = new TransformNode("", scene)

                const camPos = cam.position
      
                // anchor.transformationMatrix.decompose(null, null, pickedPoint)
                let rotY = Math.atan2(pickedPoint.x - camPos.x, pickedPoint.z - camPos.z)
    
                // gate.position = pickedPoint.clone()
                gate.parent = parentNode
    
                // the reason why I did not put this after the animation ends is I need the occluder in the beginning so I wont see what's happening on the background and good thing nothing is beyond so we still wont see anything on the box portal
                occluderRoot.parent = parentNode
                // occluderRoot.rotationQuaternion = Quaternion.FromEulerAngles(0,rotY,0)
                occluderRoot.addRotation(Math.PI/2,0,0)
    
                const earthRumS = new Sound("earthRunSound", "./sounds/earthRum.mp3", scene, undefined, {
                    autoplay: true,
                })
                createAnim(gate, "position.y", "float", pickedPoint.y - 1.5, 0)
                // createAnim(occluderRoot, "position.y", "float", -2, pickedPoint.y).play()
                animateCam(scene, gate, false, () => {
                    chamberPlace.setEnabled(true)
                    chamberPlace.parent = parentNode
                    chamberPlace.position = new Vector3(0,-.05,0)
                    // chamberPlace.rotationQuaternion = Quaternion.FromEulerAngles(0,rotY,0)
                    earthRumS.stop()
                    earthRumS.dispose()
                    new Sound("", "./sounds/afterRum.mp3", scene, undefined, {
                        autoplay: true,
                    })
                    new Sound("", "./sounds/background.mp3", scene, undefined, {
                        autoplay: true, loop: true, volume: .6
                    })
                }, -.5)

                parentNode.rotationQuaternion = Quaternion.FromEulerAngles(0,rotY,0)
            }

            scene.meshes.forEach(mesh => {
                if(!mesh.name.includes("root") && !mesh.name.includes("occluder")) mesh.renderingGroupId = 1
            })
            scene.setRenderingAutoClearDepthStencil(1, false, false, false)
            scene.setRenderingAutoClearDepthStencil(0, true, true, true)
        }, PointerEventTypes.POINTERDOWN )
    } catch (error) {
        log(error)
    }


    
    await scene.whenReadyAsync()
    return scene
}