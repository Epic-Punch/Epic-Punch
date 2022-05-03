export default class BasicCharacterControls {
    constructor(params) {
      this.initialize(params);
    }
  
    initialize(params) {
      this.params = params;
      this.move = {
        forward: false,
        backward: false,
        left: false,
        right: false,
      };
      this.decceleration = new THREE.Vector3(-0.0005, -0.0001, -5.0);
      this.acceleration = new THREE.Vector3(1, 0.25, 50.0);
      this.velocity = new THREE.Vector3(0, 0, 0);
  
      document.addEventListener('keydown', (e) => this.onKeyDown(e), false);
      document.addEventListener('keyup', (e) => this.onKeyUp(e), false);
    }
  
    onKeyDown(event) {
      switch (event.keyCode) {
        case 87: // w
          this.move.forward = true;
          break;
        case 65: // a
          this.move.left = true;
          break;
        case 83: // s
          this.move.backward = true;
          break;
        case 68: // d
          this.move.right = true;
          break;
        case 38: // up
        case 37: // left
        case 40: // down
        case 39: // right
          break;
      }
    }
  
    onKeyUp(event) {
      switch(event.keyCode) {
        case 87: // w
          this.move.forward = false;
          break;
        case 65: // a
          this.move.left = false;
          break;
        case 83: // s
          this.move.backward = false;
          break;
        case 68: // d
          this.move.right = false;
          break;
        case 38: // up
        case 37: // left
        case 40: // down
        case 39: // right
          break;
      }
    }
  
    Update(timeInSeconds) {
      const velocity = this.velocity;
      const frameDecceleration = new THREE.Vector3(
          velocity.x * this.decceleration.x,
          velocity.y * this.decceleration.y,
          velocity.z * this.decceleration.z
      );
      frameDecceleration.multiplyScalar(timeInSeconds);
      frameDecceleration.z = Math.sign(frameDecceleration.z) * Math.min(
          Math.abs(frameDecceleration.z), Math.abs(velocity.z));
  
      velocity.add(frameDecceleration);
  
      const controlObject = this.params.target;
      const Q = new THREE.Quaternion();
      const A = new THREE.Vector3();
      const R = controlObject.quaternion.clone();
  
      if (this.move.forward) {
        velocity.z += this.acceleration.z * timeInSeconds;
      }
      if (this.move.backward) {
        velocity.z -= this.acceleration.z * timeInSeconds;
      }
      if (this.move.left) {
        A.set(0, 1, 0);
        Q.setFromAxisAngle(A, Math.PI * timeInSeconds * this.acceleration.y);
        R.multiply(Q);
      }
      if (this.move.right) {
        A.set(0, 1, 0);
        Q.setFromAxisAngle(A, -Math.PI * timeInSeconds * this.acceleration.y);
        R.multiply(Q);
      }
  
      controlObject.quaternion.copy(R);
  
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