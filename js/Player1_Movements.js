import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.118/build/three.module.js';
import {FBXLoader} from 'https://cdn.jsdelivr.net/npm/three@0.118.1/examples/jsm/loaders/FBXLoader.js';

import BasicCharacterControllerInput from './Keyboard_Input.js'
import CharacterFSM from './SceneGraph_StateNode.js'

class BasicCharacterControllerProxy {
    constructor(animations) {
      this._animations = animations;
    }
  };
  

//--------------------------------------------------------------- Character Control -----------------------------------------------------------------------------------------------
export default class Player1_Controller {
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
      
      this._stateMachine = new CharacterFSM(
        new BasicCharacterControllerProxy(this._animations));
    
      this._LoadModel1();
    }
  
    _LoadModel1() {
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
  
        const loaderM = new FBXLoader(this._manager);
        loaderM.setPath('./resources/Movements/');
        loaderM.load('Run.fbx', (a) => { _OnLoad('Run', a); });
        loaderM.load('Punch.fbx', (a) => { _OnLoad('Punch', a); });
        loaderM.load('Idle.fbx', (a) => { _OnLoad('Idle', a); });
        loaderM.load('Jump.fbx', (a) => { _OnLoad('Jump', a); });
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
      velocity.add(frameDecceleration);
  
      const controlObject = this._target;
  
      const acc = this._acceleration.clone();
  
      if (this._input._keys.forward1) {
        velocity.z += acc.z * timeInSeconds;
      }
      if (this._input._keys.backward1) {
        velocity.z -= acc.z * timeInSeconds;
      }
      if (this._input._keys.left1) {
        velocity.y += acc.y * timeInSeconds;
      }
      if (this._input._keys.right1) {
        velocity.y -= acc.y * timeInSeconds;
      }
  
  
      const forward = new THREE.Vector3(0, 0, 1);
      forward.applyQuaternion(controlObject.quaternion);
      forward.normalize();
      forward.multiplyScalar(velocity.z * timeInSeconds);

      const sideways = new THREE.Vector3(1, 0, 0);
      sideways.applyQuaternion(controlObject.quaternion);
      sideways.normalize();
      sideways.multiplyScalar(velocity.y * timeInSeconds);

      controlObject.position.add(forward);
      controlObject.position.add(sideways);
      
      //const controlObject = this.target;
      //const _Q - new THREE.Quaternion();
      //const _A = new THREE.Vector3();
      //const _R = controlObject.quaternion.clone();
      //
      //_A.set(0, 1, 0);
      //_Q.setFromAxisAngle(_A, 2 * - Math.PI * timeInSeconds * this._acceleration.y);
      //_R.multiply(_Q);
      //
      //control.Object.quaternion.copy(_R)
      //
      //const sideways = new THREE.Vector3(1, 0, 0);
      //sideways.applyQuaternion(controlObject.quaternion);
      //sideways.normalize();
      //sideways.multiplyScalar(velocity.x * timeInSeconds);
      //controlObject.position.add(sideways)
  
      if (this._mixer) {
        this._mixer.update(timeInSeconds);
      }
    }
  }
  

  