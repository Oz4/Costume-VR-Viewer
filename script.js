import * as THREE from './three.js-master/build/three.module.js';
import { OBJLoader } from './three.js-master/examples/jsm/loaders/OBJLoader.js';
import { OrbitControls } from './three.js-master/examples/jsm/controls/OrbitControls.js';
import { PLYLoader } from './three.js-master/examples/jsm/loaders/PLYLoader.js';
import { Water } from './three.js-master/examples/jsm/objects/Water.js';
import { GUI } from './three.js-master/examples/jsm/libs/dat.gui.module.js'
import { VRButton } from './three.js-master/examples/jsm/webxr/VRButton.js';
import { EffectComposer } from './three.js-master/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from './three.js-master/examples/jsm/postprocessing/RenderPass.js';
import { ShaderPass } from './three.js-master/examples/jsm/postprocessing/ShaderPass.js';
import { DeviceOrientationControls } from './three.js-master/examples/jsm/controls/DeviceOrientationControls.js';

let camera, renderer, controls, water, ground, button,motionControls;
let leftCamera, rightCamera;
let composer, effect;

let mainScene = new THREE.Scene();


let params = {
    PointCloud: false,
    scenes: "Tower Scene",
    VR: false,
    eyeSeperation: 0.083,
    distortionstrength: 2,
    autorotate: false,
    crosseffect: false,
    cylindricalRatio: 2,
    fov: 45,
    Motion:false
};


let gui = new GUI();
gui.add(params, 'PointCloud').name('Point Cloud');
gui.add(params, 'scenes', ['Tower Scene', 'Mosque Scene']);
gui.add(params, 'VR').name('VR');
gui.add(params, 'Motion').name('Device Motion');
gui.add(params, 'eyeSeperation').name('Eye Seperation');
gui.add(params, 'distortionstrength').name('Fish Eye Strength');
gui.add(params, 'autorotate').name('Rotate Camera');
gui.add(params, 'crosseffect').name('Cross-Effect');
gui.add(params, 'cylindricalRatio').name('cylindricalRatio');
gui.add(params, 'fov').name('fov');



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
    button = document.getElementById('button');
    container.appendChild(renderer.domElement);
    button.appendChild(VRButton.createButton(renderer));
    console.log(container.getElementsByTagName('a'));
    composer = new EffectComposer(renderer);
    effect = new ShaderPass(getDistortionShaderDefinition());

}
let SceneSetup = function (currentScene) {
    camera.position.z = 10;
    camera.position.x = 5;
    camera.position.y = 5
    currentScene.background = new THREE.Color(0xdddddd);


    
    motionControls = new DeviceOrientationControls( camera ,renderer.domElement);
    motionControls.update();

    controls = new OrbitControls(camera, renderer.domElement);
    controls.minDistance = 0.1;
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
        if(params['Motion']){
            controls.enabled = false;
            motionControls.enabled = true;
            if(isMobileDevice) motionControls.update();
        }
        else{
            controls.enabled = true;
            motionControls.enabled = false;

        }

        if (params['autorotate']) {
            controls.autoRotate = true;
            controls.update();
        }
        else {
            controls.autoRotate = false;
        }


        if (params['VR']) {
            if (!document.fullscreenElement && document.fullscreenEnabled) {
                document.documentElement.requestFullscreen();
            }
            document.getElementById("vr_image").style.visibility = "visible";
            if (button != null) button.remove();
            renderVR();
        }
        else {
            if (document.fullscreenElement) {
                document.exitFullscreen();
            }
            document.getElementById("vr_image").style.visibility = "hidden";
            if (document.getElementById('button') == null) {
                button = document.createElement("div");
                button.id = 'button';
                container.appendChild(button);
                button.appendChild(VRButton.createButton(renderer));
            }

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
                mainScene.getObjectByName("towerOBJ").visible = true;//-----true
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


    const rightEye = new THREE.Matrix4();
    const leftEye = new THREE.Matrix4();
    const aspect = camera.aspect * 0.5;
    let eyeSeperation = params['eyeSeperation'];
    leftCamera = new THREE.PerspectiveCamera();
    leftCamera.matrixAutoUpdate = false;

    rightCamera = new THREE.PerspectiveCamera();
    rightCamera.matrixAutoUpdate = false;
    if (params['crosseffect']) eyeSeperation *= -1;

    camera.updateMatrixWorld();

    const projectionMatrix = camera.projectionMatrix.clone();
    const halfWidth = (camera.near * Math.tan(Math.PI / 180 * camera.fov * 0.5));//  camera near * cemera apreture in radian degree
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

/* 
    projection Matrix = 
    [2n/r-l     0      r+l/r-l     0     ]          
    [  0      2n/t-b   t+b/t-b     0     ]
    [  0        0     -f+n/f-n  -2fn/f-n ]
    [  0        0        -1        0     ]

*/  

    //================== right eye
    left = - halfWidth * aspect - (eyeSeperation / 2) * camera.near / camera.focus;
    right = halfWidth * aspect - (eyeSeperation / 2) * camera.near / camera.focus;
    // update camera projection matrix , indexing is colomn based in three js
    // update r and l in projection matrix
    projectionMatrix.elements[0] = 2 * camera.near / (right - left); //2n/r-l
    projectionMatrix.elements[8] = (right + left) / (right - left);// r+l / r-l

    rightCamera.projectionMatrix.copy(projectionMatrix);

    //copy world matrix to both cameras
    leftCamera.matrixWorld.copy(camera.matrixWorld).multiply(leftEye);
    rightCamera.matrixWorld.copy(camera.matrixWorld).multiply(rightEye);
    //-----------------------------------------


    //rendering the 2 views by splitting with scissor views
    renderer.setScissorTest(true);

    //redner left view
    renderer.setScissor(0, 0, window.innerWidth / 2, window.innerHeight);
    renderer.setViewport(0, 0, window.innerWidth / 2, window.innerHeight);
    composer.addPass(new RenderPass(mainScene, leftCamera));
    composer.addPass(effect);
    fishEyeRender(leftCamera);

    //render right view
    renderer.setScissor(window.innerWidth / 2, 0, window.innerWidth / 2, window.innerHeight);
    renderer.setViewport(window.innerWidth / 2, 0, window.innerWidth / 2, window.innerHeight);
    composer.addPass(new RenderPass(mainScene, rightCamera));
    composer.addPass(effect);
    fishEyeRender(rightCamera);

    renderer.setScissorTest(false);
    composer.clearPasses();//costume function
    //-----------------------------------------

}
let render = function () {
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setScissorTest(false);
    renderer.render(mainScene, camera);
}
let loadSceneObjects = function(){
    if (isMobileDevice()) {

        AddPointCloudModel(mainScene, 'Mosque_PC.ply', -50, 22, -5, 10, 180 / 180 * Math.PI, -20 / 180 * Math.PI, -0.035, 0.5, 'mosquepc');
        AddOBJModel(mainScene, 'Mosque_LQ.obj', 'mosque_Texture.png', -50, 22, -5, 10, 180 / 180 * Math.PI, -20 / 180 * Math.PI, -0.035, 'mosqueOBJ');
    
        AddOBJModel(mainScene, 'Kiz_Kulasi_Mobile.obj', 'lq_kiz_texture.png', 0, 3.6, -3, 1, 0, Math.PI + 0.3, -0.035, 'towerOBJ');
        AddPointCloudModel(mainScene, 'Kiz_Kulasi_PC_Mobile.ply', 4.1, 5.9, -12, 1, 180 / 180 * Math.PI, -20 / 180 * Math.PI, -0.035, 0.004, 'towerPC');
    }
    else {
        AddPointCloudModel(mainScene, 'Mosque_PC.ply', -50, 22, -5, 10, 180 / 180 * Math.PI, -20 / 180 * Math.PI, -0.035, 0.2, 'mosquepc');
        AddOBJModel(mainScene, 'Mosque_LQ.obj', 'mosque_Texture.png', -50, 22, -5, 10, 180 / 180 * Math.PI, -20 / 180 * Math.PI, -0.035, 'mosqueOBJ');
    
        AddOBJModel(mainScene, 'Kiz_kulasi_HQ.obj', 'lq_kiz_texture.png', 0, 3.6, -3, 1, 0, Math.PI + 0.3, -0.035, 'towerOBJ');
        AddPointCloudModel(mainScene, 'Kiz_Kulasi_PC.ply', 4.1, 5.9, -12, 1, 180 / 180 * Math.PI, -20 / 180 * Math.PI, -0.035, 0.004, 'towerPC');
    }
}


window.addEventListener('resize', onWindowResize, false);
Setup();
SceneSetup(mainScene);
AddGround(mainScene);
AddWater(mainScene);
loadSceneObjects();
AddCubeMap(mainScene);


manager.onLoad = function () {
    console.log('Loading complete!');
    animate();
};
//Costume fish eye shader
//the composereffect was edited to clear passes each iteration to release the ram.
function getDistortionShaderDefinition() {
    return {

        uniforms: {
            "tDiffuse": { type: "t", value: null },
            "strength": { type: "f", value: 0 },
            "height": { type: "f", value: 1 },
            "aspectRatio": { type: "f", value: 1 },
            "cylindricalRatio": { type: "f", value: 1 }
        },

        vertexShader: [
            "uniform float strength;",
            "uniform float height;",
            "uniform float aspectRatio;",
            "uniform float cylindricalRatio;",

            "varying vec3 vUV;",
            "varying vec2 vUVDot;",

            "void main() {",
            "gl_Position = projectionMatrix * (modelViewMatrix * vec4(position, 1.0));",

            "float scaledHeight = strength * height;",
            "float cylAspectRatio = aspectRatio * cylindricalRatio;",
            "float aspectDiagSq = aspectRatio * aspectRatio + 1.0;",
            "float diagSq = scaledHeight * scaledHeight * aspectDiagSq;",
            "vec2 signedUV = (2.0 * uv + vec2(-1.0, -1.0));",

            "float z = 0.5 * sqrt(diagSq + 1.0) + 0.5;",
            "float ny = (z - 1.0) / (cylAspectRatio * cylAspectRatio + 1.0);",

            "vUVDot = sqrt(ny) * vec2(cylAspectRatio, 1.0) * signedUV;",
            "vUV = vec3(0.5, 0.5, 1.0) * z + vec3(-0.5, -0.5, 0.0);",
            "vUV.xy += uv;",
            "}"
        ].join("\n"),

        fragmentShader: [
            "uniform sampler2D tDiffuse;",
            "varying vec3 vUV;",
            "varying vec2 vUVDot;",

            "void main() {",
            "vec3 uv = dot(vUVDot, vUVDot) * vec3(-0.5, -0.5, -1.0) + vUV;",
            "gl_FragColor = texture2DProj(tDiffuse, uv);",
            "}"
        ].join("\n")

    };
}
let fishEyeRender = function (cache_camera) {

    let horizontalFOV = params['fov'];
    let strength = params['distortionstrength'];
    let cylindricalRatio = params['cylindricalRatio'];
    let height = Math.tan(THREE.Math.degToRad(horizontalFOV) / 2) / cache_camera.aspect;

    cache_camera.fov = Math.atan(height) * 2 * 180 / Math.PI;
    cache_camera.updateProjectionMatrix();

    effect.uniforms["strength"].value = strength;
    effect.uniforms["height"].value = height;
    effect.uniforms["aspectRatio"].value = cache_camera.aspect;
    effect.uniforms["cylindricalRatio"].value = cylindricalRatio;

    composer.render(mainScene, cache_camera);

}

