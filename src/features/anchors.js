import {WebXRAnchorSystem, TransformNode, Sound, Quaternion, Vector3} from "babylonjs"
import { createAnim, animateCam } from "@lucafly/animtool"
const log = console.log

let enabled = false
export function enableAnchorSystem(fm,scene, cam, occluderRoot, chamberPlace, gate){
    try {
        const anchorSystem = fm.enableFeature(WebXRAnchorSystem, "latest")
        let renderer
        anchorSystem.onAnchorAddedObservable.add( anchor => {
            const parentNode = new TransformNode("", scene)

            const camPos = cam.position
            let pickedPoint = new Vector3(0,0,0)
            log(anchor)
            anchor.transformationMatrix.decompose(null, null, pickedPoint)
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

            
            anchor.attachedNode = parentNode
            
            scene.meshes.forEach(mesh => {
                if(!mesh.name.includes("root") && !mesh.name.includes("occluder")) mesh.renderingGroupId = 1
            })
            scene.onBeforeRenderObservable.remove(renderer)
            renderer = scene.onBeforeRenderObservable.add(() => {
                parentNode.rotationQuaternion = Quaternion.FromEulerAngles(0,rotY,0)
                scene.setRenderingAutoClearDepthStencil(1, false, false, false)
                scene.setRenderingAutoClearDepthStencil(0, true, true, true)
                // scene.autoClear = true
            })

            // const targetPosition = new Vector3(camPos.x, 0, camPos.z); // Example target

            // // Compute the direction from the anchor to the target
            // const direction = targetPosition.subtract(anchor.attachedNode.position).normalize();
            // anchor.attachedNode.rotationQuaternion = Quaternion.FromLookDirectionLH(direction, BABYLON.Vector3.Up());
            // Create a rotation quaternion to face the direction
            // parentNode.rotationQuaternion = Quaternion.FromEulerAngles(0,rotY,0)
            // log(anchor.position) this do not exist
            setInterval(() => {
                // anchor.attachedNode.addRotation(0,rotY,0)
                // anchor.attachedNode.rotationQuaternion = Quaternion.FromEulerAngles(0,rotY,0)
            }, 1000)
            
        })
        enabled = true

        return anchorSystem
    } catch (error) {
        console.log(error)
        enabled = false
        return error
    }
}