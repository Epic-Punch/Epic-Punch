import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.118/build/three.module.js';

import {FBXLoader} from 'https://cdn.jsdelivr.net/npm/three@0.118.1/examples/jsm/loaders/FBXLoader.js';
import {GLTFLoader} from 'https://cdn.jsdelivr.net/npm/three@0.118.1/examples/jsm/loaders/GLTFLoader.js';
import {OrbitControls} from 'https://cdn.jsdelivr.net/npm/three@0.118/examples/jsm/controls/OrbitControls.js';
import BasicCharacterControls from './basicCharacterControls.js';
 

class LoadModelDemo {
  constructor() {
    this.Initialize();
  }

  Initialize() {
    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
    });
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.setSize(window.innerWidth, window.innerHeight);

    document.body.appendChild(this.renderer.domElement);

    window.addEventListener('resize', () => {
      this._OnWindowResize();
    }, false);

    const fov = 60;
    const aspect = 1920 / 1080;
    const near = 1.0;
    const far = 1000.0;
    this.camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
    this.camera.position.set(75, 20, 0);

    this.scene = new THREE.Scene();

    let light = new THREE.DirectionalLight(0xFFFFFF, 1.0);
    light.position.set(20, 100, 10);
    light.target.position.set(0, 0, 0);
    light.castShadow = true;
    light.shadow.bias = -0.001;
    light.shadow.mapSize.width = 2048;
    light.shadow.mapSize.height = 2048;
    light.shadow.camera.near = 0.1;
    light.shadow.camera.far = 500.0;
    light.shadow.camera.near = 0.5;
    light.shadow.camera.far = 500.0;
    light.shadow.camera.left = 100;
    light.shadow.camera.right = -100;
    light.shadow.camera.top = 100;
    light.shadow.camera.bottom = -100;
    this.scene.add(light);

    light = new THREE.AmbientLight(0xFFFFFF, 4.0);
    this.scene.add(light);

    const controls = new OrbitControls(
      this.camera, this.renderer.domElement);
    controls.target.set(0, 20, 0);
    controls.update();

    const loader = new THREE.CubeTextureLoader();
    const texture = loader.load([
        './resources/posx.jpg',
        './resources/negx.jpg',
        './resources/posy.jpg',
        './resources/negy.jpg',
        './resources/posz.jpg',
        './resources/negz.jpg',
    ]);
    this.scene.background = texture;

    this.mixers = [];
    this.previousRAF = null;

    this.Arena();
    this.LoadAnimatedModel();
    // this._LoadAnimatedModelAndPlay(
    //     './resources/dancer/', 'girl.fbx', 'dance.fbx', new THREE.Vector3(0, -1.5, 5));
    // this._LoadAnimatedModelAndPlay(
    //     './resources/dancer/', 'dancer.fbx', 'Silly Dancing.fbx', new THREE.Vector3(12, 0, -10));
    // this._LoadAnimatedModelAndPlay(
    //     './resources/dancer/', 'dancer.fbx', 'Silly Dancing.fbx', new THREE.Vector3(-12, 0, -10));
    this.RAF();
  }

  Arena()
{
    const loader = new GLTFLoader();

loader.load( 'assets/boxing_area_3d_model_2/scene.gltf', ( gltf ) => {
  gltf.scene.scale.setScalar(0.1);
  gltf.scene.position.y = -10;  
  gltf.scene.traverse(c =>{
        c.castShadow = true;
    });
	this.scene.add( gltf.scene ); //add arena to scene
});
}

  LoadAnimatedModel() {
    const loader = new FBXLoader();
    loader.setPath('./assets/fighters/');//load static model
    loader.load('exo_gray.fbx', (fbx)=>{
      fbx.scale.setScalar(0.1);
      fbx.traverse(c => {
        c.castShadow = true;
      });

      const params = {
        target: fbx,
        camera: this.camera,
      }
      this.controls = new BasicCharacterControls(params);

      const anim = new FBXLoader();
      anim.setPath('./resources/zombie/');//load model animation
      anim.load('walk.fbx', (anim) => {
        const m = new THREE.AnimationMixer(fbx);
        this.mixers.push(m);
        const idle = m.clipAction(anim.animations[0]);
        idle.play();
      });
      this.scene.add(fbx);
    });
  }

  LoadAnimatedModelAndPlay(path, modelFile, animFile, offset) {
    const loader = new FBXLoader();
    loader.setPath(path);
    loader.load(modelFile, (fbx) => {
      fbx.scale.setScalar(0.1);
      fbx.traverse(c => {
        c.castShadow = true;
      });
      fbx.position.copy(offset);

      const anim = new FBXLoader();
      anim.setPath(path);
      anim.load(animFile, (anim) => {
        const m = new THREE.AnimationMixer(fbx);
        this.mixers.push(m);
        const idle = m.clipAction(anim.animations[0]);
        idle.play();
      });
      this.scene.add(fbx);
    });
  }

  LoadModel() {
    const loader = new GLTFLoader();
    loader.load('./resources/thing.glb', (gltf) => {
      gltf.scene.traverse(c => {
        c.castShadow = true;
      });
      this.scene.add(gltf.scene);
    });
  }

  OnWindowResize() {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }

  RAF() {
    requestAnimationFrame((t) => {
      if (this.previousRAF === null) {
        this.previousRAF = t;
      }

      this.RAF();

      this.renderer.render(this.scene, this.camera);
      this.Step(t - this.previousRAF);
      this.previousRAF = t;
    });
  }

  Step(timeElapsed) {
    const timeElapsedS = timeElapsed * 0.001;
    if (this.mixers) {
      this.mixers.map(m => m.update(timeElapsedS));
    }

    if (this.controls) {
      this.controls.Update(timeElapsedS);
    }
  }
}


let _APP = null;

window.addEventListener('DOMContentLoaded', () => {
  _APP = new LoadModelDemo();
});