import { DirectionalLight, PointerEventTypes, Scene, Sound, SceneLoader, MeshBuilder, FreeCamera, Vector3, Quaternion, Mesh } from "babylonjs"
import { createShape } from "../modules/basictools.js"
import { createOccluderCage } from "../tools/occluders.js"
import { checkARSupport } from "../tools/checkArSupport.js"
import { enableHitTest } from "../features/hitTest.js"
import { enableAnchorSystem } from "../features/anchors.js"
const log = console.log


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
        marker.isVisible = false;


        const { getHitTest } = enableHitTest(fm, marker)
        const anchorSystem = enableAnchorSystem(fm, scene, cam, occluderRoot, chamberPlace, gate)

        let isPlaced = false
        scene.onPointerObservable.add( async (event) => {
            // marker.position = event.pickInfo.pickedPoint
            // marker.isVisible = true;.
            const lastHit = getHitTest()
            if(isPlaced) return

            isPlaced = true
            marker.isVisible = false
            const pickedPoint = marker.position.clone()
            const camPos = cam.position

            if(lastHit) anchorSystem.addAnchorPointUsingHitTestResultAsync(lastHit)

            // const subtractPos = camPos.subtract(pickedPoint)
            
            
            // const model = await SceneLoader.ImportMeshAsync("", false, "./models/skeleton.glb", scene)
            // // const PlaceModel = await SceneLoader.ImportMeshAsync("", false, "./models/smallplace.glb", scene)
            // model.meshes[0].position.z += 5
            // model.meshes[0].position.x -= 1
        
            // const markPos = marker.position
            // const markRot = marker.rotationQuaternion

            // model.meshes[0].position = marker.position
            // // PlaceModel.meshes[0].position = new Vector3(markPos.x, markPos.y,markPos.z)
            // model.meshes[0].rotationQuaternion = marker.rotationQuaternion
            // PlaceModel.meshes[0].rotationQuaternion = new Quaternion(markRot.x,markRot.y,markRot.z,markRot.w)

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