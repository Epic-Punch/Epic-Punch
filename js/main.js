
import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.118/build/three.module.js';

import {GLTFLoader} from 'https://cdn.jsdelivr.net/npm/three@0.118.1/examples/jsm/loaders/GLTFLoader.js';
import {OrbitControls} from 'https://cdn.jsdelivr.net/npm/three@0.118/examples/jsm/controls/OrbitControls.js';


import Player1_Controller from './Player1_Movements.js'
import Player2_Controller from './Player2_Movements.js'

document.getElementById("Enter-Multiplayer").addEventListener("click",()=>{
      document.getElementById("menu").style.display ="none";
      document.getElementById("menu2").style.display ="block";
})

document.getElementById("Home_Screen").addEventListener("click",()=>{
  document.getElementById("menu").style.display ="block";
  document.getElementById("menu2").style.display ="none";
})

document.getElementById("Start").addEventListener("click",()=>{
  document.getElementById("game").style.display ="block";
  //document.getElementById("menu2").style.display ="none";
})

startWorld()
//---------------------------------------------------------------- Creating The World ----------------------------------------------------------------------------------------------
function startWorld(){
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
        this._camera.position.set(-40, 30, 35);
        //camera.position.x = 20;
        //camera.position.y = 14;
        //camera.position.z = 15;
        //: -25, y: 16, z: -25}
        //{ x: 30, y: 0, z: 27 }
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
        this._mixers2 = [];
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
        this._LoadAnimatedModel1();

        this._startTime = new Date();
        this._povCam = false;
        document.getElementById('povcamera').addEventListener('click', () => {
          if (!this._povCam) {
            this._povCam = true;
          }
          else {
            this._povCam = false;
          }
        })

        //Calls the function that updates the health bars
        this._Health()

        //Calls the request for annimation frame, this is the render function
        this._RAF();

    }
    Arena(){
      const loader = new GLTFLoader();
      loader.load( 'resources/boxing_area_3d_model_2/scene.gltf', ( gltf ) => {
      gltf.scene.scale.setScalar(0.1);
      gltf.scene.position.set(0, -10, 0);  
      gltf.scene.traverse(c =>{
            c.castShadow = true;
        });
      this._scene.add( gltf.scene ); //add arena to scene
    });
    }

    //Function to load the controls
    _LoadAnimatedModel1(){
        const params = {
          camera: this._camera,
          scene: this._scene,
        }
        this._player1 = new Player1_Controller(params);
        this._player2 = new Player2_Controller(params);
        //this.p1pos = this._player1.getPosition();
        //this.p2pos = this._player2.getPosition();
        
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

          //Starts the timer when page is rendered
          let endTime = new Date();
          var timeDiff = endTime - this._startTime;
          timeDiff /= 1000;
          var seconds = Math.round(timeDiff);

          //Toggles POV camera
          if (this._povCam) {
           const newpos = this._player1.getPosition()
           this._camera.position.set(newpos.x+1, newpos.y + 16, newpos.z + 2)
            const opppos = this._player2.getPosition()
            this._camera.lookAt(opppos.x, opppos.y+16, opppos.z)
            
          }
          else if (!this._povCam) {
            this._camera.position.set(-40, 30, 35);
            this._camera.lookAt(0,0,0);
            
          }

          //document.getElementById('timer').innerText = seconds.toString()
          this._threejs.render(this._scene, this._camera);
          this._Step(t - this._previousRAF);
          this._previousRAF = t;
        });
      }
    
    _Step(timeElapsed) {
        const timeElapsedS = timeElapsed * 0.001;
        if (this._player2) {
          this._player2.Update(timeElapsedS, this._player1.getPosition());
        }
        if (this._player1) {
            this._player1.Update(timeElapsedS, this._player2.getPosition()); 
        }
        
    }
  
  _Health(){
      //Reduce the health of opponent when nearby
      document.getElementById('wholepage').addEventListener('keydown', (e) => {
        if (e.keyCode === 70) {
          let posa = this._player1.getPosition()
          let posb = this._player2.getPosition()
          if (posb.x - 7 <= posa.x && posa.x <= posb.x + 7) {
            let num = document.getElementById("enemybar").offsetWidth - 30
            document.getElementById("enemybar").style.width = num+"px";
          }
        }
      })
    }
      //NB set health reduction of main character HERE!!!!!!!!!!
      /*document.getElementById('wholepage').addEventListener('keydown', (e) => {
        if (e.keyCode === 70) {     //Enter correct key here
          let posa = this._player1.getPosition()
          let posb = this._player2.getPosition()
          if (posb.x - 7 <= posa.x && posa.x <= posb.x + 7) {
            let num = document.getElementById("mybar").offsetWidth - 30
            document.getElementById("mybar").style.width = num + "px";
          }
        }
      })*/
}



    

let _APP = null;

window.addEventListener('DOMContentLoaded', () => {
    _APP = new BasicWorldDemo();
});

}