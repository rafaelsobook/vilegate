import { WebXRHitTest } from "babylonjs"

let hitTest = undefined
export function enableHitTest(fm, marker){
    const xrTest = fm.enableFeature(WebXRHitTest.Name, "latest")
    xrTest.onHitTestResultObservable.add( results => {
        if(results.length){
            // marker.isVisible = true
            hitTest = results[0]
            hitTest.transformationMatrix.decompose(null, marker.rotationQuaternion, marker.position)
        }else hitTest = undefined
    })

    return {
        getHitTest: () => hitTest
    }
}