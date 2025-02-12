import { MeshBuilder, Vector3, Quaternion, ActionManager, StandardMaterial, Texture } from "babylonjs"



export function createShape(scene, opt, pos, name, meshType, _enableActionManager, hasQuaternion){
    let mesh 
    let meshName = name ? name : "shape"
    switch(meshType){
        case "sphere":
            mesh = MeshBuilder.CreateSphere(meshName, opt, scene)
        break
        case "capsule":
            mesh = MeshBuilder.CreateCapsule(meshName, opt, scene)
            // mesh = MeshBuilder.CreateCapsule("asd", { height: 1, tessellation: 16, radius: 0.25})
        break
        case "cylinder":
            mesh = MeshBuilder.CreateCylinder(meshName, opt, scene)
        break
        case "ground":
            mesh = MeshBuilder.CreateGround(meshName, opt, scene)            
        break
        case "torus":
            mesh = MeshBuilder.CreateTorus(meshName, { diameter: 0.15, thickness: 0.05, tessellation: 32 }, scene);
        break
        default:
            mesh = MeshBuilder.CreateBox(meshName, opt, scene)
        break
    }
    // mesh.checkCollisions = true
    if(hasQuaternion) mesh.rotationQuaternion = new Quaternion()
    if(pos) mesh.position = new Vector3(pos.x,pos.y,pos.z)
    if(_enableActionManager) mesh.actionManager = new ActionManager(getScene())
    return mesh
}
export function createMat(scene, matName, _diffTex, _bumpTex, _roughTex){
    const mat = new StandardMaterial(matName ? matName : "material", scene)
    if(_diffTex) mat.diffuseTexture = new Texture(_diffTex,scene, false, false)
    if(_bumpTex) mat.bumpTexture = new Texture(_bumpTex, scene,false, false)
    if(_roughTex) mat.specularTexture = new Texture(_roughTex, scene,false, false)
    // mat.specularColor = new Color3(.1,.1,.1)
    // mat.metallic = 1
    return mat
}
export function parentAMesh(_childMesh, _parentMesh, _chldPos, _chldScaleXYZUnit, _chldRotQuat){
    if(!_childMesh) return log("childMesh undefined")
    if(!_parentMesh) return  log("_parentMesh undefined")
    
    _childMesh.parent = _parentMesh
    _childMesh.scaling = new Vector3(_chldScaleXYZUnit,_chldScaleXYZUnit,_chldScaleXYZUnit)
    _childMesh.position = new Vector3(_chldPos.x, _chldPos.y,_chldPos.z)
    _childMesh.rotationQuaternion = new Quaternion(_chldRotQuat.x,_chldRotQuat.y,_chldRotQuat.z,_chldRotQuat.w)
}
export function setMeshPos(_mesh, _desiredPos){
    _mesh.position.x = _desiredPos.x
    _mesh.position.y = _desiredPos.y
    _mesh.position.z = _desiredPos.z
    return _mesh.position
}
export function setMeshesVisibility(_meshesArray, _isVisible){
    _meshesArray.forEach(mesh => mesh.isVisible = _isVisible)
}

export function setProp(keys, prop, value){
    keys.forEach(keyy=> keyy[prop] = value)
}

// deletion
export function disposeAll(toDispose){
    try {
        if(Array.isArray(toDispose)){
            toDispose.forEach(node => node.dispose())
        }else toDispose.dispose()
        return true
    } catch (error) {
        console.log(error)
        return false
    }    
}