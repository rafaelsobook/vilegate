import {WebXRAnchorSystem, TransformNode, Sound, Quaternion, Vector3} from "babylonjs"
import { createAnim, animateCam } from "@lucafly/animtool"
const log = console.log

let enabled = false
export function enableAnchorSystem(fm,scene, cam, occluderRoot, chamberPlace, gate){
    try {
        const anchorSystem = fm.enableFeature(WebXRAnchorSystem, "latest")
        
        anchorSystem.onAnchorAddedObservable.add( anchor => {
            const parentNode = new TransformNode("", scene)

            const camPos = cam.position
            let pickedPoint = new Vector3(0,0,0)
            log(anchor)
            anchor.transformationMatrix.decompose(null, null, pickedPoint)
            const rotY = Math.atan2(camPos.x - pickedPoint.x, camPos.z - pickedPoint.z)

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
            createAnim(occluderRoot, "position.y", "float", -2, pickedPoint.y).play()
            animateCam(scene, gate, false, () => {
                chamberPlace.setEnabled(true)
                chamberPlace.parent = parentNode
                chamberPlace.position = new Vector3(0,-.05,0)
                chamberPlace.rotationQuaternion = Quaternion.FromEulerAngles(0,rotY,0)
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
            // log(anchor.position) this do not exist
        })
        enabled = true

        return anchorSystem
    } catch (error) {
        console.log(error)
        enabled = false
        return error
    }
}