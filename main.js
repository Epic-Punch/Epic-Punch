import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.118/build/three.module.js';

import {FBXLoader} from 'https://cdn.jsdelivr.net/npm/three@0.118.1/examples/jsm/loaders/FBXLoader.js';
import {OrbitControls} from 'https://cdn.jsdelivr.net/npm/three@0.118/examples/jsm/controls/OrbitControls.js';


//--------------------------------------------------------------- Character Control -----------------------------------------------------------------------------------------------
class BasicCharacterControls {
    constructor(params) {
      this._Init(params);
    }
  
    //test commit2
    //Make movements false 
    _Init(params) {
      this._params = params;
      this._move = {
        forward: false,
        backward: false,
        left: false,
        right: false,
      };

      //Set up the physics of the model moving
      this._decceleration = new THREE.Vector3(-0.0005, -0.0001, -5.0);
      this._acceleration = new THREE.Vector3(1, 0.25, 50.0);
      this._velocity = new THREE.Vector3(0, 0, 0);
  
      //Listen for when a key is pressed
      document.addEventListener('keydown', (e) => this._onKeyDown(e), false);
      document.addEventListener('keyup', (e) => this._onKeyUp(e), false);
    }
  

    //In the event that a key was pressed
    _onKeyDown(event) {
      switch (event.keyCode) {
        case 87: // w 
          this._move.forward = true;
          break;
        case 65: // a
          this._move.left = true;
          break;
        case 83: // s
          this._move.backward = true;
          break;
        case 68: // d
          this._move.right = true;
          break;
        case 38: // up
        case 37: // left
        case 40: // down
        case 39: // right
          break;
      }
    }
  
    //In the even that a key was released
    _onKeyUp(event) {
      switch(event.keyCode) {
        case 87: // w
          this._move.forward = false;
          break;
        case 65: // a
          this._move.left = false;
          break;
        case 83: // s
          this._move.backward = false;
          break;
        case 68: // d
          this._move.right = false;
          break;
        case 38: // up
        case 37: // left
        case 40: // down
        case 39: // right
          break;
      }
    }
  
    //Functions for the physics of the movements
    Update(timeInSeconds) {
      const velocity = this._velocity;
      const frameDecceleration = new THREE.Vector3(
          velocity.x * this._decceleration.x,
          velocity.y * this._decceleration.y,
          velocity.z * this._decceleration.z
      );
      frameDecceleration.multiplyScalar(timeInSeconds);
      frameDecceleration.z = Math.sign(frameDecceleration.z) * Math.min(
          Math.abs(frameDecceleration.z), Math.abs(velocity.z));
  
      velocity.add(frameDecceleration);
  
      const controlObject = this._params.target;
      const _Q = new THREE.Quaternion();
      const _A = new THREE.Vector3();
      const _R = controlObject.quaternion.clone();
  
      if (this._move.forward) {
        velocity.z += this._acceleration.z * timeInSeconds;
      }
      if (this._move.backward) {
        velocity.z -= this._acceleration.z * timeInSeconds;
      }
      if (this._move.left) {
        _A.set(0, 1, 0);
        _Q.setFromAxisAngle(_A, Math.PI * timeInSeconds * this._acceleration.y);
        _R.multiply(_Q);
      }
      if (this._move.right) {
        _A.set(0, 1, 0);
        _Q.setFromAxisAngle(_A, -Math.PI * timeInSeconds * this._acceleration.y);
        _R.multiply(_Q);
      }
  
      controlObject.quaternion.copy(_R);
  
      const oldPosition = new THREE.Vector3();
      oldPosition.copy(controlObject.position);
  
      const forward = new THREE.Vector3(0, 0, 1);
      forward.applyQuaternion(controlObject.quaternion);
      forward.normalize();
  
      const sideways = new THREE.Vector3(1, 0, 0);
      sideways.applyQuaternion(controlObject.quaternion);
      sideways.normalize();
  
      sideways.multiplyScalar(velocity.x * timeInSeconds);
      forward.multiplyScalar(velocity.z * timeInSeconds);
  
      controlObject.position.add(forward);
      controlObject.position.add(sideways);
  
      oldPosition.copy(controlObject.position);
    }
  }




//---------------------------------------------------------------- Creating The World ----------------------------------------------------------------------------------------------

class BasicWorldDemo {
    constructor() {
      this._Initialize();
    }

    _Initialize(){
        //set up renderer
        this._threejs = new THREE.WebGLRenderer({
            antialias: true,
        }); 
       
        //get shadows for renderer cuz they look nice
        this._threejs.shadowMap.enabled = true; 
        this._threejs.shadowMap.type = THREE.PCFSoftShadowMap; //make them soft

        //tell threejs about the screen size
        this._threejs.setPixelRatio(window.devicePixelRatio);
        this._threejs.setSize(window.innerWidth, window.innerHeight);

        //***************************** donno */
        document.body.appendChild(this._threejs.domElement);

        //if the size of the window is changed we perform a function to correct the scene
        window.addEventListener('resize', () => {
            this._OnWindowResize();
        })

        //Creating a perspective Camera
        const fov = 60;
        const aspect = 1920/ 1080;
        const near = 1.0;
        const far = 1000.0;
        this._camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
        this._camera.position.set(75, 20, 0);

        //Create Scene which is basically a container for all the objects
        this._scene = new THREE.Scene();

        //Set the lighting for the scene, 1 directional light for shadows and then ambient light for rest of scene
        let light = new THREE.DirectionalLight(0xFFFFFF);
        light.position.set(100, 100, 100);
        light.target.position.set(0, 0, 0);
        light.castShadow = true;
        light.shadow.bias = -0.01;
        light.shadow.mapSize.width = 2048;
        light.shadow.mapSize.height = 2048;
        light.shadow.camera.near = 1.0;
        light.shadow.camera.far = 500;
        light.shadow.camera.left = 200;
        light.shadow.camera.right = -200;
        light.shadow.camera.top = 200;
        light.shadow.camera.bottom = -200;
        this._scene.add(light);

        light = new THREE.AmbientLight(0x404040);
        this._scene.add(light);


        //Get the world textures for the skybox
        const controls = new OrbitControls(
            this._camera, this._threejs.domElement);
        controls.target.set(0, 0, 0); // set the position
        controls.update();

        const loader = new THREE.CubeTextureLoader(); //load the images
        const texture = loader.load([
            './resources/posx.jpg',
            './resources/negx.jpg',
            './resources/posy.jpg',
            './resources/negy.jpg',
            './resources/posz.jpg',
            './resources/negz.jpg',
        ])
        this._scene.background = texture; // set it as the background

        //Adds a plane to the scene can be our ground
        const plane = new THREE.Mesh(
            new THREE.PlaneGeometry(100, 100, 1, 1),
            new THREE.MeshStandardMaterial({
                color: 0xFFFFFF
            }));

        plane.castShadow = false;
        plane.receiveShadow = true;
        plane.rotation.x = -Math.PI /2;
        this._scene.add(plane);

        //Load the model
        this._mixers = [];
        this._previousRAF = null;
        this._LoadAnimatedModel();
        

        //Calls the request for annimation frame, this is the render function
        this._RAF();
    }

    //Function to load the model
    _LoadAnimatedModel(){
            const loader = new FBXLoader();
            loader.setPath('./resources/Boss/');
            loader.load('The Boss.fbx', (fbx) => {
                fbx.scale.setScalar(0.1);
                fbx.traverse(c => {
                    c.castShadow = true;
                });

                const params = {
                    target: fbx,
                    camera: this._camera,
                }
                this._controls = new BasicCharacterControls(params);
        
                const anim = new FBXLoader();
                anim.setPath('./resources/Boss/');
                anim.load('Strut Walking.fbx', (anim) => {
                    const m = new THREE.AnimationMixer(fbx);
                    this._mixers.push(m);
                    const idle = m.clipAction(anim.animations[0]);
                    idle.play();
            });
            this._scene.add(fbx);
        });
    }

    _LoadAnimatedModelAndPlay(path, modelFile, animFile, offset) {
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
            this._mixers.push(m);
            const idle = m.clipAction(anim.animations[0]);
            idle.play();
          });
          this._scene.add(fbx);
        });
      }

    // If the window is resized the aspect ratio and scene will change accordingly
    _OnWindowResize(){
        this._camera.aspect = window.innerWidth/window.innerHeight;
        this._camera.updateProjectionMatrix();
        this._threejs.setSize(window.innerWidth, window.innerHeight);
    }

    //The render function to render the scene and camera each frame
    _RAF() {
        requestAnimationFrame((t) => {
          if (this._previousRAF === null) {
            this._previousRAF = t;
          }
    
          this._RAF();
    
          this._threejs.render(this._scene, this._camera);
          this._Step(t - this._previousRAF);
          this._previousRAF = t;
        });
      }
    
    _Step(timeElapsed) {
        const timeElapsedS = timeElapsed * 0.001;
        if (this._mixers) {
            this._mixers.map(m => m.update(timeElapsedS));
        }
        
        if (this._controls) {
            this._controls.Update(timeElapsedS);
        }
    }
}

    

let _APP = null;

window.addEventListener('DOMContentLoaded', () => {
    _APP = new BasicWorldDemo();
});