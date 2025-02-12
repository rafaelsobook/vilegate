import { TransformNode, CSG, Vector3, Quaternion } from "babylonjs"
import { createShape, disposeAll, createMat } from "../modules/basictools.js"

export function createOccluderWall(scene, pos, camera){
    const occluderRoot = new TransformNode("occluderNode", scene)
    occluderRoot.rotationQuaternion = new Quaternion()
    const wall = createShape(scene,{ width: 100, depth: 100, height: 0.01 })
    const hole = createShape(scene, { width: 1.5, depth: 3, height: 0.05})

    const wallCsg = CSG.FromMesh(wall)
    const holeCsg = CSG.FromMesh(hole)

    disposeAll([wall, hole])

    const booleanCsg = wallCsg.subtract(holeCsg)
    const booleanRCsg = holeCsg.subtract(wallCsg)

    let occluder = booleanCsg.toMesh("occluder", null, scene)
    let occluderHole = booleanRCsg.toMesh("occluder", null, scene)

    // create other occluders
    const tOccluder = createShape(scene, {width: 15, depth: 15, height: .1}, null, "occluder")
    const bOccluder = createShape(scene, {width: 15, depth: 15, height: .1}, null, "occluder")
    const lOccluder = createShape(scene, {width: 15, depth: 15, height: .1}, null, "occluder")
    const rOccluder = createShape(scene, {width: 15, depth: 15, height: .1}, null, "occluder")

    const occluderMat = createMat(scene, "occluderMat")
    occluderMat.forceDepthWrite = true
    occluderMat.disableLighting = true

    occluder.material = occluderMat
    occluderHole.material = occluderMat
    tOccluder.material = occluderMat
    bOccluder.material = occluderMat
    lOccluder.material = occluderMat
    rOccluder.material = occluderMat

    occluder.parent = occluderRoot
    occluderHole.parent = occluderRoot
    tOccluder.parent = occluderRoot
    bOccluder.parent = occluderRoot
    lOccluder.parent = occluderRoot
    rOccluder.parent = occluderRoot

    tOccluder.position = new Vector3(0,0, 3)
    bOccluder.position = new Vector3(0,0,-.1)
    lOccluder.position = new Vector3(-2,0,0)
    rOccluder.position = new Vector3(2,0,0)

    tOccluder.rotation.x = Math.PI/2
    bOccluder.rotation.x = Math.PI/2
    lOccluder.rotation.z = Math.PI/2
    rOccluder.rotation.z = Math.PI/2

    if(pos) occluderRoot.position = new Vector3(pos.x, pos.y, pos.z)

    occluderRoot.rotationQuaternion = Quaternion.RotationAxis(new BABYLON.Vector3(-1, 0, 0), Math.PI / 2);

    occluder.renderingGroupId = 0
    occluderHole.renderingGroupId = 0

    let occluderVisibility = 0.001
    occluder.visibility= occluderVisibility
    occluderHole.visibility= occluderVisibility
    tOccluder.visibility = occluderVisibility
    bOccluder.visibility = occluderVisibility
    lOccluder.visibility = occluderVisibility
    rOccluder.visibility = occluderVisibility
    
    occluderRoot.position.y += 1.5

    occluderHole.isVisible = false
    scene.onBeforeRenderObservable.add(() => {
        if (camera !== undefined){
            if (camera.position.z > 0) {
                occluder.isVisible = false;
                occluderHole.isVisible = true;          
            }
            else {
                occluder.isVisible = true;
                occluderHole.isVisible = false;
            }
        } 
                
    });

    function placeOccluder(marker){
        occluderRoot.position = marker.position
        occluderRoot.rotationQuaternion = marker.rotationQuaternion
    }

    return {occluderRoot, placeOccluder}
}