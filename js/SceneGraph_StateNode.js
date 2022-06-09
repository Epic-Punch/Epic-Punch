import FiniteStateMachine from './SceneGraph_StateMachine.js'
import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.118/build/three.module.js';


export default class CharacterFSM extends FiniteStateMachine {
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
      this._AddState('Die', DieState);
    }
  };

class State{
    constructor(parent){
      this._parent = parent;
    }
    
    Enter() {}
    Exit() {}
    Update() {}
  }
  
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
        if (input._keys.dodge1) {
          this._parent.SetState('Jump');
        }
        if (input._keys.punch1) {
          this._parent.SetState('Punch');
        }
        return;
      }
      if (input._keys.forward2 || input._keys.backward2) {
        if (input._keys.dodge2) {
          this._parent.SetState('Jump');
        }
        if (input._keys.punch2) {
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

      this._FinishedCallback = () =>{
        this._Finished();
      }
    }
  
    get Name() {
      return 'Punch';
    }
  
    Enter(prevState) {
      const curAction = this._parent._proxy._animations['Punch'].action;
      const mixer = curAction.getMixer();
      mixer.addEventListener('finished', this._FinishedCallback);

      if (prevState) {
        const prevAction = this._parent._proxy._animations[prevState.Name].action;
        
        curAction.reset();
        curAction.setLoop(THREE.LoopOnce, 1);
        curAction.clampWhenFinished = true;
        curAction.crossFadeFrom(prevAction, 0.0001  , true);
        curAction.play();
      }
      else{
        curAction.crossFadeFrom(prevAction, 0.0001  , true);
        curAction.play();
      }
    }

    _Finished(){
      this._Cleanup();
      this._parent.SetState('Idle')
    }

    _Cleanup(){
      const action = this._parent._proxy._animations['Punch'].action;

      action.getMixer().removeEventListener('finished', this._CleanupCallback);
    }
  
    Exit() {
      this._Cleanup
    }
  
    Update(timeElapsed, input) { 
    }
  };

  class DieState extends State {
    constructor(parent) {
      super(parent);

      this._FinishedCallback = () =>{
        this._Finished();
      }
    }
  
    get Name() {
      return 'Die';
    }
  
    Enter(prevState) {
      const curAction = this._parent._proxy._animations['Die'].action;

      if (prevState) {
        const prevAction = this._parent._proxy._animations[prevState.Name].action;
        
        curAction.setLoop(THREE.LoopOnce, 1);
        curAction.clampWhenFinished = true;
        curAction.crossFadeFrom(prevAction, 0.0001  , true);
        curAction.play();
      }
      else{
        curAction.crossFadeFrom(prevAction, 0.0001  , true);
        curAction.play();
      }
    }
  
    Exit() {
    }
  
    Update(timeElapsed, input) { 
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
      let num = document.getElementById("mybar").offsetWidth
      if (input._keys.forward1 || input._keys.backward1) {
        this._parent.SetState('Run');
      } else if (num == 10){
        this._parent.SetState('Die')}
     else if (input._keys.punch1) {
        this._parent.SetState('Punch');
      }
      if (input._keys.forward1 || input._keys.backward1) {
        this._parent.SetState('Run');
      } else if (input._keys.punch1) {
        this._parent.SetState('Punch');
      }
    }
  };