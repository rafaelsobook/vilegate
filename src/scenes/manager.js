import { WebXRHitTest, PointerEventTypes, Scene, SceneLoader, MeshBuilder, FreeCamera, Vector3, Quaternion } from "babylonjs"
import { createMat, createShape, disposeAll } from "../modules/basictools.js"
import { createOccluderWall } from "../tools/occluders.js"
const log = console.log

export async function manager(engine){
    const scene = new Scene(engine)

    const cam = new FreeCamera("cam", new Vector3(0,2,-5), scene)
    scene.createDefaultLight()
    scene.activeCamera.attachControl()
  
    // const {occluderRoot, placeOccluder} = createOccluderWall(scene, null, cam)

    try {
        const xr = await scene.createDefaultXRExperienceAsync({
            uiOptions: {
              sessionMode: "immersive-ar"
            },
            optionalFeatures: true
        })
        const fm = xr.baseExperience.featuresManager;
        const xrTest = fm.enableFeature(WebXRHitTest.Name, "latest")
        const xrCam = xr.baseExperience.camera;

        const marker = createShape(scene, false, false, false, "torus", false, true)
        marker.isVisible = false;

        let hitTest
        xrTest.onHitTestResultObservable.add( results => {
            if(results.length){
                marker.isVisible = true
                hitTest = results[0]
                hitTest.transformationMatrix.decompose(null, marker.rotationQuaternion, marker.position)
            }
        })
        let isPlaced = false
        scene.onPointerObservable.add( async () => {
            if(!xrCam) return log("not in XR")
            if(isPlaced) return
            isPlaced = true
            marker.isVisible = false;
            
            const model = await SceneLoader.ImportMeshAsync("", false, "./models/skeleton.glb", scene)
            const PlaceModel = await SceneLoader.ImportMeshAsync("", false, "./models/smallplace.glb", scene)
            model.meshes[0].position.z += 5
            model.meshes[0].position.x -= 1
        
            // scene.meshes.forEach(mesh => {
            //     mesh.renderingGroupId = 1
            // })
            // scene.setRenderingAutoClearDepthStencil(1, false, false, false)
            // scene.setRenderingAutoClearDepthStencil(0, true, true, true)
            // scene.autoClear = true
            log("placed")
            // placeOccluder(marker)
            const markPos = marker.position
            const markRot = marker.rotationQuaternion

            model.meshes[0].position = marker.position
            PlaceModel.meshes[0].position = new Vector3(markPos.x, markPos.y,markPos.z)
            model.meshes[0].rotationQuaternion = marker.rotationQuaternion
            PlaceModel.meshes[0].rotationQuaternion = new Quaternion(markRot.x,markRot.y,markRot.z,markRot.w)
        }, PointerEventTypes.POINTERDOWN )
    } catch (error) {
        log(error)
    }


    
    await scene.whenReadyAsync()
    return scene
}