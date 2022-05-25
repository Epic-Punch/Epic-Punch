
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
        dodge1: false,
        punch1: false,
        forward2: false,
        backward2: false,
        left2: false,
        right2: false,
        dodge2: false,
        punch2: false,
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
        case 67: // c
          this._keys.dodge1 = true;
          break;
        case 70: // f
          this._keys.punch1 = true;
          break;
        case 104: // 8
          this._keys.forward2 = true;
          break;
        case 100: // 4
          this._keys.left2 = true;
          break;
        case 101: // 5
          this._keys.backward2 = true;
          break;
        case 102: // 6
          this._keys.right2 = true;
          break;
        case 99: // 3
          this._keys.dodge2 = true;
          break;
        case 107: // +
          this._keys.punch2 = true;
          break;
      }
    }
  
    _onKeyUp(event) {
        switch (event.keyCode) {
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
            case 67: // c
              this._keys.dodge1 = false;
              break;
            case 70: // f
              this._keys.punch1 = false;
              break;
            case 104: // 8
              this._keys.forward2 = false;
              break;
            case 100: // 4
              this._keys.left2 = false;
              break;
            case 101: // 5
              this._keys.backward2 = false;
              break;
            case 102: // 6
              this._keys.right2 = false;
              break;
            case 99: // 3
              this._keys.dodge2 = false;
              break;
            case 107: // +
              this._keys.punch2 = false;
              break;
          }
    }
  };
  