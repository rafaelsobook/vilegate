import { testScene } from './testscene.js'

export async function manager(engine, sceneName){

    switch(sceneName){
        case "test":
            return await testScene(engine)
        break
        default:
            return await testScene(engine)
        break
    }
}