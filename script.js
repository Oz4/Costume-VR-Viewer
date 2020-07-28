import * as THREE from './three.js-master/build/three.module.js';
import { OBJLoader } from './three.js-master/examples/jsm/loaders/OBJLoader.js';
import { MTLLoader } from './three.js-master/examples/jsm/loaders/MTLLoader.js';
import { OrbitControls } from './three.js-master/examples/jsm/controls/OrbitControls.js';
import { PLYLoader } from './three.js-master/examples/jsm/loaders/PLYLoader.js';
import { VRButton } from './three.js-master/examples/jsm/webxr/VRButton.js';
import { XRControllerModelFactory } from './three.js-master/examples/jsm/webxr/XRControllerModelFactory.js';

let mainScene, camera, renderer, controls, slight;


let Setup = function () {
    mainScene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 6000);
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    let container = document.getElementById('container');
    container.appendChild(renderer.domElement);
    container.appendChild(VRButton.createButton(renderer));
    renderer.xr.enabled = true;
}
let SceneSetup = function () {
    camera.position.z = 20;
    camera.position.x = 5;
    camera.position.y = 5
    mainScene.background = new THREE.Color(0xdddddd);
    //mainScene.add(new THREE.AmbientLight(0X404040, 100));

    var geometry = new THREE.PlaneGeometry(100, 100, 100);
    var material = new THREE.MeshLambertMaterial({ color: 0xdddddd, side: THREE.DoubleSide });
    var planes = new THREE.Mesh(geometry, material);
    planes.rotation.set(Math.PI / 2, 0, 0);
    planes.receiveShadow = true;
    mainScene.add(planes);

    let plane = new THREE.GridHelper(100, 10);
    mainScene.add(plane);
    mainScene.add(THREE.AxisHelper(500));

    let hLight = new THREE.DirectionalLight(0xffffff, 3);
    // hLight.castShadow = true;

    mainScene.add(hLight);

    slight = new THREE.SpotLight(0xffa95c, 4);
    slight.castShadow = true;
    slight.position.set(camera.position.x - 9, camera.position.y - 8, camera.position.z - 9)
    slight.shadow.mapSize.width = 2048;  
    slight.shadow.mapSize.height = 2048; 
    mainScene.add(slight);

    renderer.toneMapping = THREE.ReinhardToneMapping;
    renderer.toneMappingExposure = 2.3;
    renderer.shadowMap.enabled = true;

    controls = new OrbitControls(camera, renderer.domElement);

    let ambientLight = new THREE.AmbientLight(0xffffff  );
    mainScene.add(ambientLight);



}

let AddCubeMesh = function (color, size, currentScene) {
    let cubeGeometry = new THREE.BoxGeometry(size, size, size);
    let cubematerial = new THREE.MeshLambertMaterial(color);
    let cubeMesh = new THREE.Mesh(cubeGeometry, cubematerial);
    cubeMesh.position.y = 1.1;
    cubeMesh.castShadow = true;
    currentScene.add(cubeMesh);
}
let animate = function () {
    renderer.setAnimationLoop(function () {

        renderer.render(mainScene, camera);
        slight.position.set(camera.position.x + 20, camera.position.y + 20, camera.position.z + 20)
        controls.update();

    });
}
let AddOBJModel = function (currentScene, objectName, textureName, posX, posY, posZ, scale, rotX, rotY, rotZ) {



    let textureLoader = new THREE.TextureLoader();
    textureLoader.setPath('./textures/');
    let tmap = textureLoader.load(textureName, function (err) {
        console.error('An error happened.');
    });
    let material = new THREE.MeshPhongMaterial({ map: tmap });

    let objLoader = new OBJLoader();
    objLoader.setPath('./models/');
    objLoader.load(objectName, function (object) {

        // For any meshes in the model, add our material.
        object.traverse(function (node) {

            if (node.isMesh) node.material = material;

        });
        object.position.set(posX, posY, posZ);
        object.scale.set(scale, scale, scale);
        object.rotation.set(rotX, rotY, rotZ);
       // object.receiveShadow = true;
        // Add the model to the scene.
        currentScene.add(object);
    });


}

let AddPointCloudModel = function (currentScene, pcName, posX, posY, posZ, scale, rotX, rotY, rotZ) {
    let loader = new PLYLoader();
    loader.setPath('./models/');
    loader.load(pcName, function (obj) {
        let mesh = new THREE.Points(obj, new THREE.PointsMaterial({ vertexColors: THREE.VertexColors, size: 0.004 }));

        mesh.position.set(posX, posY, posZ);
        mesh.scale.set(scale, scale, scale);
        mesh.rotation.set(rotX, rotY, rotZ);
        mesh.receiveShadow = true;

        currentScene.add(mesh);
    });
}


Setup();
SceneSetup();


AddOBJModel(mainScene, 'Desktop4.obj', 'lq_kiz_texture.png', -6, 6, 0, 1, Math.PI, 0, 0);
AddPointCloudModel(mainScene, 'tower_Dense_reconstruction.0.ply', 12, 6, -12, 1, 180 / 180 * Math.PI, -20 / 180 * Math.PI, 0);
AddCubeMesh({ color: 0xddffff }, 2, mainScene);


animate();













