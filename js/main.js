
import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.118/build/three.module.js';

import {GLTFLoader} from 'https://cdn.jsdelivr.net/npm/three@0.118.1/examples/jsm/loaders/GLTFLoader.js';
import {FBXLoader} from 'https://cdn.jsdelivr.net/npm/three@0.118.1/examples/jsm/loaders/FBXLoader.js';
import {OrbitControls} from 'https://cdn.jsdelivr.net/npm/three@0.118/examples/jsm/controls/OrbitControls.js';


class BasicCharacterControllerProxy {
  constructor(animations) {
    this._animations = animations;
  }

  get animations() {
    return this._animations;
  }
};

//-------------------------------------------------------------- Listen for input -------------------------------------------------------------------------------------------------
class BasicCharacterControllerInput {
  constructor() {
    this._Init();    
  }

  _Init() {
    this._keys = {
      forward1: false,
      backward1: false,
      left1: false,
      right1: false,
      space: false,
      m: false,
      forward2: false,
      backward2: false,
      left2: false,
      right2: false,
      shift: false,
      enter: false,
    };
    document.addEventListener('keydown', (e) => this._onKeyDown(e), false);
    document.addEventListener('keyup', (e) => this._onKeyUp(e), false);
  }

  _onKeyDown(event) {
    switch (event.keyCode) {
      case 87: // w
        this._keys.forward1 = true;
        break;
      case 65: // a
        this._keys.left1 = true;
        break;
      case 83: // s
        this._keys.backward1 = true;
        break;
      case 68: // d
        this._keys.right1 = true;
        break;
      case 32: // SPACE
        this._keys.space = true;
        break;
      case 77: // m
        this._keys.m = true;
        break;
        case 87: // up arrow
        this._keys.forward2 = true;
        break;
      case 65: // left arrow
        this._keys.left2 = true;
        break;
      case 83: // down arrow
        this._keys.backward2 = true;
        break;
      case 68: // right arrow
        this._keys.right2 = true;
        break;
      case 32: // shift
        this._keys.shift = true;
        break;
      case 77: // enter
        this._keys.enter = true;
        break;
    }
  }

  _onKeyUp(event) {
    switch(event.keyCode) {
      case 87: // w
        this._keys.forward1 = false;
        break;
      case 65: // a
        this._keys.left1 = false;
        break;
      case 83: // s
        this._keys.backward1 = false;
        break;
      case 68: // d
        this._keys.right1 = false;
        break;
      case 32: // SPACE
        this._keys.space = false;
        break;
      case 77: // m
        this._keys.m = false;
        break;
        case 87: // up arrow
        this._keys.forward2 = false;
        break;
      case 65: // left arrow
        this._keys.left2 = false;
        break;
      case 83: // down arrow
        this._keys.backward2 = false;
        break;
      case 68: // right arrow
        this._keys.right2 = false;
        break;
      case 32: // shift
        this._keys.shift = false;
        break;
      case 77: // enter
        this._keys.enter = false;
        break;
    }
  }
};



//---------------------------------------------------------------Finite State Machine for controls -------------------------------------------------------------------------------
class FiniteStateMachine {
  constructor() {
    this._states = {};
    this._currentState = null;
  }

  _AddState(name, type) {
    this._states[name] = type;
  }

  SetState(name) {
    const prevState = this._currentState;
    
    if (prevState) {
      if (prevState.Name == name) {
        return;
      }
      prevState.Exit();
    }

    const state = new this._states[name](this);

    this._currentState = state;
    state.Enter(prevState);
  }

  Update(timeElapsed, input) {
    if (this._currentState) {
      this._currentState.Update(timeElapsed, input);
    }
  }
};


class CharacterFSM extends FiniteStateMachine {
  constructor(proxy) {
    super();
    this._proxy = proxy;
    this._Init();
  }

  _Init() {
    this._AddState('Idle', IdleState);
    this._AddState('Punch', PunchState);
    this._AddState('Run', RunState);
    this._AddState('Jump', JumpState);
  }
};


class State {
  constructor(parent) {
    this._parent = parent;
  }

  Enter() {}
  Exit() {}
  Update() {}
};


class JumpState extends State {
  constructor(parent) {
    super(parent);

    this._FinishedCallback = () => {
      this._Finished();
    }
  }

  get Name() {
    return 'Jump';
  }

  Enter(prevState) {
    const curAction = this._parent._proxy._animations['Jump'].action;
    const mixer = curAction.getMixer();
    mixer.addEventListener('finished', this._FinishedCallback);

    if (prevState) {
      const prevAction = this._parent._proxy._animations[prevState.Name].action;

      curAction.reset();  
      curAction.setLoop(THREE.LoopOnce, 1);
      curAction.clampWhenFinished = true;
      curAction.crossFadeFrom(prevAction, 0.2, true);
      curAction.play();
    } else {
      curAction.play();
    }
  }

  _Finished() {
    this._Cleanup();
    this._parent.SetState('Idle');
  }

  _Cleanup() {
    const action = this._parent._proxy._animations['Jump'].action;
    
    action.getMixer().removeEventListener('finished', this._CleanupCallback);
  }

  Exit() {
    this._Cleanup();
  }

  Update(_) {
  }
};


class RunState extends State {
  constructor(parent) {
    super(parent);
  }

  get Name() {
    return 'Run';
  }

  Enter(prevState) {
    const curAction = this._parent._proxy._animations['Run'].action;
    if (prevState) {
      const prevAction = this._parent._proxy._animations[prevState.Name].action;

      curAction.enabled = true;
      const ratio = curAction.getClip().duration / prevAction.getClip().duration;
      curAction.time = prevAction.time * ratio;
      curAction.crossFadeFrom(prevAction, 0.5, true);
      curAction.play();
    }
  }

  Exit() {
  }

  Update(timeElapsed, input) {
    if (input._keys.forward1 || input._keys.backward1) {
      if (input._keys.space) {
        this._parent.SetState('Jump');
      }
      if (input._keys.m) {
        this._parent.SetState('Punch');
      }
      return;
    }

    this._parent.SetState('Idle');
  }
};


class PunchState extends State {
  constructor(parent) {
    super(parent);
  }

  get Name() {
    return 'Punch';
  }

  Enter(prevState) {
    const curAction = this._parent._proxy._animations['Punch'].action;
    if (prevState) {
      const prevAction = this._parent._proxy._animations[prevState.Name].action;
      curAction.enabled = true;
      const ratio = curAction.getClip().duration / prevAction.getClip().duration;
      curAction.time = 60;
      curAction.crossFadeFrom(prevAction, 0.001  , true);
      curAction.play();
    }
    
  }

  Exit() {
  }

  Update(timeElapsed, input) {
      

    this._parent.SetState('Idle');
  }
};


class IdleState extends State {
  constructor(parent) {
    super(parent);
  }

  get Name() {
    return 'Idle';
  }

  Enter(prevState) {
    const idleAction = this._parent._proxy._animations['Idle'].action;
    if (prevState) {
      const prevAction = this._parent._proxy._animations[prevState.Name].action;
      idleAction.time = 0.0;
      idleAction.enabled = true;
      idleAction.setEffectiveTimeScale(1.0);
      idleAction.setEffectiveWeight(1.0);
      idleAction.crossFadeFrom(prevAction, 0.5, true);
      idleAction.play();
    } else {
      idleAction.play();
    }
  }

  Exit() {
  }

  Update(_, input) {
    if (input._keys.forward1 || input._keys.backward1) {
      this._parent.SetState('Run');
    } else if (input._keys.m) {
      this._parent.SetState('Punch');
    }
  }
};


//--------------------------------------------------------------- Character Control -----------------------------------------------------------------------------------------------
export default class BasicCharacterController {
  constructor(params) {
    this._Init(params);
  }

  //test commit2
  //Make movements false 
  _Init(params) {
    this._params = params;
   
    //Set up the physics of the model moving
    this._decceleration = new THREE.Vector3(-0.0005, -0.0001, -5.0);
    this._acceleration = new THREE.Vector3(4, 1, 200.0);
    this._velocity = new THREE.Vector3(0, 0, 0);

    this._animations = {};
    this._input = new BasicCharacterControllerInput();
    this._stateMachine = new CharacterFSM(
      new BasicCharacterControllerProxy(this._animations));
    
    this._LoadModels();
  }

  _LoadModels() {
    const loader = new FBXLoader();
    loader.setPath('./resources/Characters/');
    loader.load('Ninja.fbx', (fbx) => {
      fbx.scale.setScalar(0.1);
      fbx.position.set(-25, 0, -27);
      fbx.rotation.set(0, Math.PI / 2, 0)
      fbx.traverse(c => {
        c.castShadow = true;
      });

    
      this._target = fbx;
      this._params.scene.add(this._target);

      this._mixer = new THREE.AnimationMixer(this._target);

      this._manager = new THREE.LoadingManager();
      this._manager.onLoad = () => {
        this._stateMachine.SetState('Idle');
      };

      const _OnLoad = (animName, anim) => {
        const clip = anim.animations[0];
        const action = this._mixer.clipAction(clip);
  
        this._animations[animName] = {
          clip: clip,
          action: action,
        };
      };

      const loader = new FBXLoader(this._manager);
      loader.setPath('./resources/Movements/');
      loader.load('Run.fbx', (a) => { _OnLoad('Run', a); });
      loader.load('Punch.fbx', (a) => { _OnLoad('Punch', a); });
      loader.load('Idle.fbx', (a) => { _OnLoad('Idle', a); });
      loader.load('Jump.fbx', (a) => { _OnLoad('Jump', a); });
    });

    loader.load('The Boss.fbx', (fbx) => {
      fbx.scale.setScalar(0.1);
      fbx.position.set(30, 0, 27);
      fbx.rotation.set(0, -Math.PI / 1.5, 0)
      fbx.traverse(c => {
        c.castShadow = true;
      });

      this._target = fbx;
      this._params.scene.add(this._target);

      this._mixer = new THREE.AnimationMixer(this._target);

      this._manager = new THREE.LoadingManager();
      this._manager.onLoad = () => {
        this._stateMachine.SetState('Idle');
      };

      const _OnLoad = (animName, anim) => {
        const clip = anim.animations[0];
        const action = this._mixer.clipAction(clip);

        this._animations[animName] = {
          clip: clip,
          action: action,
        };
      };

      const loader = new FBXLoader(this._manager);
      loader.setPath('./resources/Movements/');
      loader.load('Run.fbx', (a) => { _OnLoad('Run', a); });
      loader.load('Punch.fbx', (a) => { _OnLoad('Punch', a); });
      loader.load('Idle.fbx', (a) => { _OnLoad('Idle', a); });
      loader.load('Jump.fbx', (a) => { _OnLoad('Jump', a); });
    });
    
  }


  

  //Functions for the physics of the movements
  Update(timeInSeconds) {
    if (!this._target) {
      return;
    }

    this._stateMachine.Update(timeInSeconds, this._input);

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

    const controlObject = this._target;
    const _Q = new THREE.Quaternion();
    const _A = new THREE.Vector3();
    const _R = controlObject.quaternion.clone();

    const acc = this._acceleration.clone();
    if (this._input._keys.shift) {
      acc.multiplyScalar(2.0);
    }

    if (this._input._keys.forward1) {
      velocity.z += acc.z * timeInSeconds;
    }
    if (this._input._keys.backward1) {
      velocity.z -= acc.z * timeInSeconds;
    }
    if (this._input._keys.left1) {
      _A.set(0, 1, 0);
      _Q.setFromAxisAngle(_A, 2.0 * Math.PI * timeInSeconds * this._acceleration.y);
      _R.multiply(_Q);
    }
    if (this._input._keys.right1) {
      _A.set(0, 1, 0);
      _Q.setFromAxisAngle(_A, 2.0 * -Math.PI * timeInSeconds * this._acceleration.y);
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

    if (this._mixer) {
      this._mixer.update(timeInSeconds);
    }
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
        this._threejs.outputEncoding = THREE.sRGBEncoding;
        this._threejs.shadowMap.enabled = true; 
        this._threejs.shadowMap.type = THREE.PCFSoftShadowMap; //make them soft

        //tell threejs about the screen size
        this._threejs.setPixelRatio(window.devicePixelRatio);
        this._threejs.setSize(window.innerWidth, window.innerHeight);

        //***************************** donno */
        document.getElementById('container').appendChild(this._threejs.domElement);
        //document.body.appendChild(this._threejs.domElement);

        //if the size of the window is changed we perform a function to correct the scene
        window.addEventListener('resize', () => {
            this._OnWindowResize();
        }, false);

        //Creating a perspective Camera
        const fov = 60;
        const aspect = 1920/ 1080;
        const near = 1.0;
        const far = 1000.0;
        this._camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
        this._camera.position.set(25, 10, 25);

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

        light = new THREE.AmbientLight(0xFFFFFF, 0.25);
        this._scene.add(light);






        //Get the world textures for the skybox
        const controls = new OrbitControls(
            this._camera, this._threejs.domElement);
        controls.target.set(0, 10, 0); // set the position
        controls.update();

        const loader = new THREE.CubeTextureLoader(); //load the images
        const texture = loader.load([
            './resources/px.png',
            './resources/nx.png',
            './resources/py.png',
            './resources/ny.png',
            './resources/pz.png',
            './resources/nz.png',
        ])
        texture.encoding = THREE.sRGBEncoding;
        this._scene.background = texture; // set it as the background

        

        //Load the model
        this._mixers = [];
        this._previousRAF = null;
        
        const glloader = new GLTFLoader();
    
        glloader.load( './resources/scene.gltf', ( gltf ) => {
          gltf.scene.scale.setScalar(0.1);
          gltf.scene.position.y = -10;  
          gltf.scene.traverse(c =>{
                c.castShadow = true;
            });
          this._scene.add( gltf.scene ); //add arena to scene
        });

        this.Arena();
        this._LoadAnimatedModel();
        

        //Calls the request for annimation frame, this is the render function
        this._RAF();
    }
    Arena()
    {
        const loader = new GLTFLoader();
    
    loader.load( 'resources/boxing_area_3d_model_2/scene.gltf', ( gltf ) => {
      gltf.scene.scale.setScalar(0.1);
      gltf.scene.position.y = -10;  
      gltf.scene.traverse(c =>{
            c.castShadow = true;
        });
      this._scene.add( gltf.scene ); //add arena to scene
    });
    }

    //Function to load the model
    _LoadAnimatedModel(){
        const params = {
          camera: this._camera,
          scene: this._scene,
        }
        this._controls = new BasicCharacterController(params);
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
          
          //let num = document.getElementById("mybar").clientWidth -1
          //document.getElementById("mybar").style.width = num+"px";
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