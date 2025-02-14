import { WebXRSessionManager } from "babylonjs";
import { getState, setARState, setDeviceState } from "./state.js";

export async function checkARSupport() {
    if (!navigator.xr) {
        setARState(false)
    }

    const isSupported = await navigator.xr.isSessionSupported("immersive-ar");
    console.log("AR Support: ", isSupported);
    setARState(true)

    const isMobile = /Android|iPhone|iPad/i.test(navigator.userAgent);
    const isDesktop = /Windows|Macintosh|Linux/i.test(navigator.userAgent);

    if (isMobile) {
        console.log("User is on a mobile device.");
        setDeviceState("mobile")
    } else if(isDesktop){
        setDeviceState("desktop")
    } else {
        alert("Using Headset ?")
        setDeviceState("headset")
    }
    
    return getState()
}
