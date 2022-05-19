
//-------------------------------------------------------------- Listen for input -------------------------------------------------------------------------------------------------

export default class BasicCharacterControllerInput {
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
  