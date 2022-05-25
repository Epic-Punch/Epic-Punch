import FiniteStateMachine from './SceneGraph_StateMachine.js'
import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.118/build/three.module.js';

export default class CharacterFSM2 extends FiniteStateMachine {
    constructor(proxy) {
      super();
      this._proxy = proxy;
      this._Init();
    }
  
    _Init() {
      this._AddState('Idle2', IdleState2);
      this._AddState('Punch2', PunchState2);
      this._AddState('Run2', RunState2);
      this._AddState('Jump2', JumpState2);
    }
  };

class State2{
    constructor(parent){
      this._parent = parent;
    }
  
    Enter() {}
    Exit() {}
    Update() {}
  }
  
  class JumpState2 extends State2 {
    constructor(parent) {
      super(parent);
  
      this._FinishedCallback = () => {
        this._Finished();
      }
    }
  
    get Name() {
      return 'Jump2';
    }
  
    Enter(prevState) {
      const curAction = this._parent._proxy._animations['Jump2'].action;
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
      this._parent.SetState('Idle2');
    }
  
    _Cleanup() {
      const action = this._parent._proxy._animations['Jump2'].action;
      
      action.getMixer().removeEventListener('finished', this._CleanupCallback);
    }
  
    Exit() {
      this._Cleanup();
    }
  
    Update(_) {
    }
  };
  
  
  class RunState2 extends State2 {
    constructor(parent) {
      super(parent);
    }
  
    get Name() {
      return 'Run2';
    }
  
    Enter(prevState) {
      const curAction = this._parent._proxy._animations['Run2'].action;
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
      if (input._keys.forward2 || input._keys.backward2) {
        if (input._keys.dodge2) {
          this._parent.SetState('Jump2');
        }
        if (input._keys.punch2) {
          this._parent.SetState('Punch2');
        }
        return;
      }
  
      this._parent.SetState('Idle2');
    }
  };
  
  
  class PunchState2 extends State2 {
    constructor(parent) {
      super(parent);
    }
  
    get Name() {
      return 'Punch2';
    }
  
    Enter(prevState) {
      const curAction = this._parent._proxy._animations['Punch2'].action;
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
  
      this._parent.SetState('Idle2');
    }
  };
  
  
  class IdleState2 extends State2 {
    constructor(parent) {
      super(parent);
    }
  
    get Name() {
      return 'Idle2';
    }
  
    Enter(prevState) {
      const idleAction = this._parent._proxy._animations['Idle2'].action;
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
      if (input._keys.forward2 || input._keys.backward2) {
        this._parent.SetState('Run2');
      } else if (input._keys.punch2) {
        this._parent.SetState('Punch2');
      }
    }
  };