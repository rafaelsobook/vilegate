let device = "desktop" // mobile // headset
let isARSupported = false


export function getState(){
    return {device, isARSupported}
}
export function setARState(_isARSupported){
    isARSupported = _isARSupported
}
export function setDeviceState(_device){
    device = _device
}