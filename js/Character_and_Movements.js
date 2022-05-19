import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.118/build/three.module.js';
import {FBXLoader} from 'https://cdn.jsdelivr.net/npm/three@0.118.1/examples/jsm/loaders/FBXLoader.js';

import BasicCharacterControllerInput from './Keyboard_Input.js'
import CharacterFSM from './SceneGraph_StateNode.js'

class BasicCharacterControllerProxy {
    constructor(animations) {
      this._animations = animations;
    }
  
    get animations() {
      return this._animations;
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
  
        this._target2 = fbx;
        this._params.scene.add(this._target2);
  
        this._mixer2 = new THREE.AnimationMixer(this._target2);
  
        this._manager2 = new THREE.LoadingManager();
        this._manager2.onLoad2 = () => {
          this._stateMachine2.SetState('Idle');
        };
  
        const _OnLoad2 = (animName, anim) => {
          const clip = anim.animations[0];
          const action = this._mixer2.clipAction(clip);
  
          this._animations[animName] = {
            clip: clip,
            action: action,
          };
        };
  
        const loader2 = new FBXLoader(this._manager2);
        loader2.setPath('./resources/Movements/');
        loader2.load('Run.fbx', (a) => { _OnLoad2('Run', a); });
        loader2.load('Punch.fbx', (a) => { _OnLoad2('Punch', a); });
        loader2.load('Idle.fbx', (a) => { _OnLoad2('Idle', a); });
        loader2.load('Jump.fbx', (a) => { _OnLoad2('Jump', a); });
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
  
  