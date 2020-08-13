import * as THREE from './three.js-master/build/three.module.js';
import { OBJLoader } from './three.js-master/examples/jsm/loaders/OBJLoader.js';
import { OrbitControls } from './three.js-master/examples/jsm/controls/OrbitControls.js';
import { PLYLoader } from './three.js-master/examples/jsm/loaders/PLYLoader.js';
import { Water } from './three.js-master/examples/jsm/objects/Water.js';
import { GUI } from './three.js-master/examples/jsm/libs/dat.gui.module.js'
import { VRButton } from './three.js-master/examples/jsm/webxr/VRButton.js';
let  camera, renderer, controls, water, ground;
let mainScene = new THREE.Scene();

let params = {
    PointCloud: false,
    scenes: "Tower Scene",
    VR: false,
    eyeSeperation: 0.083,
    autorotate:true,
    crosseffect:false
};

let gui = new GUI();
gui.add(params, 'PointCloud').name('Point Cloud');
gui.add(params, 'scenes', ['Tower Scene', 'Mosque Scene']);
gui.add(params, 'VR').name('VR');
gui.add(params, 'eyeSeperation').name('Eye Seperation');
gui.add(params, 'autorotate').name('Rotate Camera');
gui.add(params, 'crosseffect').name('Cross-Effect');


let manager = new THREE.LoadingManager();
manager.onStart = function (url, itemsLoaded, itemsTotal) {
    console.log('Started loading file: ' + url + '.\nLoaded ' + itemsLoaded + ' of ' + itemsTotal + ' files.');
};
manager.onProgress = function (url, itemsLoaded, itemsTotal) {
    console.log('Loading file: ' + url + '.\nLoaded ' + itemsLoaded + ' of ' + itemsTotal + ' files.');
};
manager.onError = function (url) {
    console.log('There was an error loading ' + url);
};
//=========================================

let Setup = function () {

    camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 6000);
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.xr.enabled = true;
    renderer.setSize(window.innerWidth, window.innerHeight);
    let container = document.getElementById('container');
    container.appendChild(renderer.domElement);
    container.appendChild(VRButton.createButton(renderer));

}
let SceneSetup = function (currentScene) {
    camera.position.z = 20;
    camera.position.x = 5;
    camera.position.y = 5
    currentScene.background = new THREE.Color(0xdddddd);

    controls = new OrbitControls(camera, renderer.domElement);
    controls.minDistance = 5;
    controls.maxDistance = 60;
    controls.maxPolarAngle = Math.PI / 2 - 0.1;
    controls.autoRotateSpeed = 2;
    controls.update();

    let ambientLight = new THREE.AmbientLight(0xffffff);
    currentScene.add(ambientLight);
}
function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}
let AddWater = function (currentScene) {

    water = new Water(new THREE.PlaneBufferGeometry(500, 500),
        {
            textureWidth: 512,
            textureHeight: 512,
            waterNormals: new THREE.TextureLoader(manager).load('./textures/waternormals.jpg', function (texture) {

                texture.wrapS = texture.wrapT = THREE.RepeatWrapping;

            }),
            alpha: 1.0,
            sunDirection: new THREE.Vector3(),
            sunColor: 0xffffff,
            waterColor: 0x001e0f,
            distortionScale: 3.7,
            fog: mainScene.fog !== undefined
        }
    );
    water.material.uniforms.size.value = 7;

    water.rotation.x = -1 * Math.PI / 2;
    water.visible = false;
    currentScene.add(water);


}
let AddGround = function (currentScene) {

    let groundtexture = new THREE.TextureLoader(manager).load('./textures/Cobblestone_001_COLOR.jpg');
    let groundNormals = new THREE.TextureLoader(manager).load('./textures/Cobblestone_001_NORM.jpg');
    let groundDisp = new THREE.TextureLoader(manager).load('./textures/Cobblestone_001_DISP.png');
    groundtexture.wrapS = THREE.RepeatWrapping;
    groundtexture.wrapT = THREE.RepeatWrapping;

    groundtexture.repeat.set(60, 60);

    let material = new THREE.MeshPhongMaterial({
        map: groundtexture,
        normalMap: groundNormals,
        displacementMap: groundDisp
    });
    material.displacementScale = 1.05;
    material.displacementBias = 1;
    var geometry = new THREE.PlaneGeometry(500, 500, 100, 100);
    ground = new THREE.Mesh(geometry, material);
    ground.rotation.x = -1 * Math.PI / 2;
    ground.visible = false;
    currentScene.add(ground);

}
let AddCubeMap = function (currentScene) {

    let materials = [];
    let t_up = new THREE.TextureLoader(manager).load('./textures/bluecloud_up.jpg');
    let t_down = new THREE.TextureLoader(manager).load('./textures/bluecloud_dn.jpg');
    let t_front = new THREE.TextureLoader(manager).load('./textures/bluecloud_ft.jpg');
    let t_back = new THREE.TextureLoader(manager).load('./textures/bluecloud_bk.jpg');
    let t_left = new THREE.TextureLoader(manager).load('./textures/bluecloud_lf.jpg');
    let t_right = new THREE.TextureLoader(manager).load('./textures/bluecloud_rt.jpg');

    materials.push(new THREE.MeshBasicMaterial({ map: t_front }));
    materials.push(new THREE.MeshBasicMaterial({ map: t_back }));
    materials.push(new THREE.MeshBasicMaterial({ map: t_up }));
    materials.push(new THREE.MeshBasicMaterial({ map: t_down }));
    materials.push(new THREE.MeshBasicMaterial({ map: t_right }));
    materials.push(new THREE.MeshBasicMaterial({ map: t_left }));


    for (let i = 0; i < materials.length; i++) {
        materials[i].side = THREE.BackSide;
    }

    let G = new THREE.BoxGeometry(500, 500, 500);
    let skyBox = new THREE.Mesh(G, materials);
    skyBox.rotation.x = Math.PI;
    skyBox.name = 'skyBox';
    currentScene.add(skyBox);

}
let AddOBJModel = function (currentScene, objectName, textureName, posX, posY, posZ, scale, rotX, rotY, rotZ, name) {



    let textureLoader = new THREE.TextureLoader(manager);
    textureLoader.setPath('./models/');
    let tmap = textureLoader.load(textureName);
    let material = new THREE.MeshMatcapMaterial({ map: tmap });

    let objLoader = new OBJLoader(manager);
    objLoader.setPath('./models/');
    objLoader.load(objectName, function (object) {

        // For any meshes in the model, add our material.
        object.traverse(function (node) {

            if (node.isMesh) node.material = material;
            if (node.isMesh) node.geometry.computeVertexNormals();

        });
        object.position.set(posX, posY, posZ);
        object.scale.set(scale, scale, scale);
        object.rotation.set(rotX, rotY, rotZ);

        object.name = name;
        object.visible = false;
        currentScene.add(object);
    });
}
let AddPointCloudModel = function (currentScene, pcName, posX, posY, posZ, scale, rotX, rotY, rotZ, pointSize, name) {
    let loader = new PLYLoader(manager);
    loader.setPath('./models/');
    loader.load(pcName, function (obj) {
        let mesh = new THREE.Points(obj, new THREE.PointsMaterial({ vertexColors: THREE.VertexColors, size: pointSize }));

        mesh.position.set(posX, posY, posZ);
        mesh.scale.set(scale, scale, scale);
        mesh.rotation.set(rotX, rotY, rotZ);
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        mesh.name = name;
        mesh.visible = false;
        currentScene.add(mesh);
    });
}
let isMobileDevice = function () {
    if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent))
        return true;
}
let animate = function () {
    renderer.setAnimationLoop(function () {
        if (params['autorotate']) {
            controls.autoRotate = true;
            controls.update();
        }
        else{
            controls.autoRotate = false ;
        }
        

        if (params['VR']) {

            renderVR();
        }
        else {

            render();
        }

        water.material.uniforms.time.value += 0.7 / 60.0;
        if (params['scenes'] == 'Tower Scene') {
            mainScene.getObjectByName("mosquepc").visible = false;
            mainScene.getObjectByName("mosqueOBJ").visible = false;
            ground.visible = false;
            water.visible = true;

            if (params['PointCloud']) {
                mainScene.getObjectByName("towerPC").visible = true;
                mainScene.getObjectByName("towerOBJ").visible = false;
            }
            else {
                mainScene.getObjectByName("towerPC").visible = false;
                mainScene.getObjectByName("towerOBJ").visible = true;
            }
        }
        if (params['scenes'] == 'Mosque Scene') {
            mainScene.getObjectByName("towerPC").visible = false;
            mainScene.getObjectByName("towerOBJ").visible = false;
            water.visible = false;
            ground.visible = true;

            if (params['PointCloud']) {
                mainScene.getObjectByName("mosquepc").visible = true;
                mainScene.getObjectByName("mosqueOBJ").visible = false;
            }
            else {
                mainScene.getObjectByName("mosquepc").visible = false;
                mainScene.getObjectByName("mosqueOBJ").visible = true;
            }
        }

    });
}
let renderVR = function () {


    let rightEye = new THREE.Matrix4();
    let leftEye = new THREE.Matrix4();
    console.log(camera.near / 12);
    let aspect = camera.aspect * 0.5;
    let eyeSeperation = params['eyeSeperation'];
    let leftCamera = new THREE.PerspectiveCamera();
    leftCamera.matrixAutoUpdate = false;

    let rightCamera = new THREE.PerspectiveCamera();
    rightCamera.matrixAutoUpdate = false;
    if (params['crosseffect'])  eyeSeperation *= -1;
    
    camera.updateMatrixWorld();

    let projectionMatrix = camera.projectionMatrix.clone();
    let  halfWidth  = (camera.near * Math.tan(Math.PI / 180 * camera.fov * 0.5));//  camera near * cemera apreture in radian degree
    let left, right;

    // adding the eyeseperation to matrix4 for transformation of the view(world matrix)
    leftEye.elements[12] = - eyeSeperation / 2; 
    rightEye.elements[12] = eyeSeperation / 2;

    //using the halfwidth we can estimate how much seperation depending on the focal lenght
    // the further the object the less seperation(positive parallax) less stressful on the eye
    //================== left eye
    left = - halfWidth * aspect + (eyeSeperation / 2) * camera.near / camera.focus;
    right = halfWidth * aspect + (eyeSeperation / 2) * camera.near / camera.focus;

    // update camera projection matrix 
    projectionMatrix.elements[0] = 2 * camera.near / (right - left);
    projectionMatrix.elements[8] = (right + left) / (right - left);

    leftCamera.projectionMatrix.copy(projectionMatrix);

    //================== right eye

    left = - halfWidth * aspect - (eyeSeperation / 2) * camera.near / camera.focus;
    right = halfWidth * aspect - (eyeSeperation / 2) * camera.near / camera.focus;
    // update camera projection matrix 
    projectionMatrix.elements[0] = 2 * camera.near / (right - left);
    projectionMatrix.elements[8] = (right + left) / (right - left);

    rightCamera.projectionMatrix.copy(projectionMatrix);

    //copy world matrix to both cameras
    leftCamera.matrixWorld.copy(camera.matrixWorld).multiply(leftEye);
    rightCamera.matrixWorld.copy(camera.matrixWorld).multiply(rightEye);

    //rendering the 2 views
    renderer.setScissorTest(true);

    renderer.setScissor(0, 0, window.innerWidth / 2, window.innerHeight);
    renderer.setViewport(0, 0, window.innerWidth / 2, window.innerHeight);
    renderer.render(mainScene,leftCamera);

    renderer.setScissor(window.innerWidth / 2, 0, window.innerWidth / 2, window.innerHeight);
    renderer.setViewport(window.innerWidth / 2, 0, window.innerWidth / 2, window.innerHeight);
    renderer.render(mainScene, rightCamera);

    renderer.setScissorTest(false);

    //-----------------------------------------

}
let render = function () {
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setScissorTest(false);
    renderer.render(mainScene, camera);
}
window.addEventListener('resize', onWindowResize, false);


Setup();
SceneSetup(mainScene);
AddGround(mainScene);
AddWater(mainScene);
if (isMobileDevice()) {

    AddPointCloudModel(mainScene, 'mosquepointcloud.ply', -50, 22, -5, 10, 180 / 180 * Math.PI, -20 / 180 * Math.PI, -0.035, 0.5, 'mosquepc');
    AddOBJModel(mainScene, 'lowqualitymosque2.obj', 'texture2.png', -50, 22, -5, 10, 180 / 180 * Math.PI, -20 / 180 * Math.PI, -0.035, 'mosqueOBJ');

    AddOBJModel(mainScene, 'tower_mobile2.obj', 'lq_kiz_texture.png', 0, 3.6, -3, 1, 0, Math.PI + 0.3, -0.035, 'towerOBJ');
    AddPointCloudModel(mainScene, 'tower_Dense_mobile.ply', 4.1, 5.9, -12, 1, 180 / 180 * Math.PI, -20 / 180 * Math.PI, -0.035, 0.004, 'towerPC');
}
else {
    AddPointCloudModel(mainScene, 'mosquepointcloud.ply', -50, 22, -5, 10, 180 / 180 * Math.PI, -20 / 180 * Math.PI, -0.035, 0.2, 'mosquepc');
    AddOBJModel(mainScene, 'lowqualitymosque2.obj', 'texture2.png', -50, 22, -5, 10, 180 / 180 * Math.PI, -20 / 180 * Math.PI, -0.035, 'mosqueOBJ');

    AddOBJModel(mainScene, 'Desktop6.obj', 'lq_kiz_texture.png', 0, 3.6, -3, 1, 0, Math.PI + 0.3, -0.035, 'towerOBJ');
    AddPointCloudModel(mainScene, 'tower_Dense_reconstruction.0.ply', 4.1, 5.9, -12, 1, 180 / 180 * Math.PI, -20 / 180 * Math.PI, -0.035, 0.004, 'towerPC');
}
AddCubeMap(mainScene);
manager.onLoad = function () {
    console.log('Loading complete!');
    animate();
};