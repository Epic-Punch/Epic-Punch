import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.118/build/three.module.js';
import {FBXLoader} from 'https://cdn.jsdelivr.net/npm/three@0.118.1/examples/jsm/loaders/FBXLoader.js';

import BasicCharacterControllerInput from './Keyboard_Input.js'
import CharacterFSM2 from './SceneGraph_StateNode2.js'

class BasicCharacterControllerProxy {
    constructor(animations) {
      this._animations = animations;
    }
  };
  

//--------------------------------------------------------------- Character Control -----------------------------------------------------------------------------------------------

export default class Player2_Controller {
    constructor(params) {
      this._Init(params);
    }
  
    //test commit2
    //Make movements false 
    _Init(params) {
      this._params = params;
     
      //Set up the physics of the model moving
      this._decceleration = new THREE.Vector3(-8, -8, -8);
      this._acceleration = new THREE.Vector3(100, 100, 100.0);
      this._velocity = new THREE.Vector3(0, 0, 0);
  
      this._animations = {};
      this._input = new BasicCharacterControllerInput();
      
      this._stateMachine = new CharacterFSM2(
        new BasicCharacterControllerProxy(this._animations));
    
      this.middle = new THREE.Vector3(0, 0, 0);
      this._LoadModel1();
    }
  
    _LoadModel1() {
      const loader = new FBXLoader();
      loader.setPath('./resources/Characters/');
      loader.load('Ely.fbx', (fbx) => {
        fbx.scale.setScalar(0.1);
        fbx.position.set(30, 0, 27);
        this.position = fbx.position;
        //fbx.rotation.set(0, -Math.PI / 1.5, 0);
        fbx.lookAt(this.middle);
        fbx.traverse(c => {
          c.castShadow = true;
        });
  
      
        this._target = fbx;
        this._params.scene.add(this._target);
  
        this._mixer = new THREE.AnimationMixer(this._target);
  
        this._manager = new THREE.LoadingManager();
        this._manager.onLoad = () => {
          this._stateMachine.SetState('Idle2');
        };
  
        const _OnLoad = (animName, anim) => {
          const clip = anim.animations[0];
          const action = this._mixer.clipAction(clip);
    
          this._animations[animName] = {
            clip: clip,
            action: action,
          };
        };
  
        const loaderM = new FBXLoader(this._manager);
        loaderM.setPath('./resources/Movements/');
        loaderM.load('Run2.fbx', (a) => { _OnLoad('Run2', a); });
        loaderM.load('Punch2.fbx', (a) => { _OnLoad('Punch2', a); });
        loaderM.load('Idle2.fbx', (a) => { _OnLoad('Idle2', a); });
        loaderM.load('Jump2.fbx', (a) => { _OnLoad('Jump2', a); });
      });
    }
  
  
  
  
    
  
    //Functions for the physics of the movements
    Update(timeInSeconds, p1) {
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
      velocity.add(frameDecceleration);
  
      this.controlObject = this._target;
      
      
      const acc = this._acceleration.clone();
  
      if (this._input._keys.forward2) {
        velocity.z += acc.z * timeInSeconds;
      }
      if (this._input._keys.backward2) {
        velocity.z -= acc.z * timeInSeconds;
      }
      if (this._input._keys.left2) {
        velocity.y += acc.y * timeInSeconds;
      }
      if (this._input._keys.right2) {
        velocity.y -= acc.y * timeInSeconds;
      }
      
      
  
      const forward = new THREE.Vector3(0, 0, 1);
      forward.applyQuaternion(this.controlObject.quaternion);
      forward.normalize();
      forward.multiplyScalar(velocity.z * timeInSeconds);

      const sideways = new THREE.Vector3(1, 0, 0);
      sideways.applyQuaternion(this.controlObject.quaternion);
      sideways.normalize();
      sideways.multiplyScalar(velocity.y * timeInSeconds);

      this.controlObject.position.add(forward);
      this.controlObject.position.add(sideways);

      this.controlObject.lookAt(p1);
      
  
      if (this._mixer) {
        this._mixer.update(timeInSeconds);
      }
    }

    getPosition(){
      return this.position;
    }
  }
  

  