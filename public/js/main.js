import * as THREE from 'https://unpkg.com/three/build/three.module.js';
import { OrbitControls } from './three_packages/OrbitControls.js';

import Agent from './objects/agent.js';
/**
 *
 *   [ X ] Lights Setup
 *   [ X ] Block Generation
 *   [ X ] Form input
 *   [ ] Behavior Configuration
 */

const fogFar = 75;

const themes = {
  default: {
    bgclr: "hsl(260, 100%, 0%)",
    fogclr: "hsl(120, 100%, 40%)",
    blockclr: "hsl(250, 100%, 50%)",

    hemiclr: "hsl(0, 100%, 100%)",
    dirclr: "hsl(260, 100%, 90%)",
  },
  blues: {
    bgclr: "hsl(260, 100%, 40%)",
    fogclr: "hsl(260, 100%, 30%)",
    blockclr: "hsl(260, 100%, 50%)",
    
    hemiclr: "hsl(0, 100%, 100%)",
    dirclr: "hsl(260, 100%, 90%)",
  },
  mary: {
    bgclr: "hsl(0, 100%, 40%)",
    fogclr: "hsl(0, 100%, 30%)",
    blockclr: "hsl(0, 100%, 0%)",
    
    hemiclr: "hsla(0, 78%, 53%, 1.00)",
    dirclr: "hsla(0, 95%, 25%, 1.00)",
  },
  blacknwhite: {
    bgclr: "hsl(0, 0%, 90%)",
    fogclr: "hsl(0, 0%, 70%)",
    blockclr: "hsl(0, 0%, 10%)",
    
    hemiclr: "hsla(0, 0%, 53%, 1.00)",
    dirclr: "hsla(0, 0%, 25%, 1.00)",
  }
}


function random_num(min, max) {
  return Math.random() * (max - min) + min;
}


class App {
  constructor() {
    // Sim variables
    this.numBlocks = 100;
    this.backgroundBg = new THREE.Color( themes["default"].bgclr );
    this.fogColor = new THREE.Color( themes["default"].fogclr );

    // Three Setup Variables
    this.scene = new THREE.Scene();
    this.scene.background = this.backgroundBg;
    this.scene.fog = new THREE.Fog(this.fogColor, 1, fogFar);

    this.camera = new THREE.PerspectiveCamera(
      60,
      window.innerWidth / window.innerHeight,
      1,
      1000
    );
    // this.camera = new THREE.OrthographicCamera( window.innerWidth / - 2, window.innerWidth / 2, window.innerHeight / 2, window.innerHeight / - 2, 0.1, 1000 );
    this.camera.position.set(0, 25, 35);

    this.entities = [];

    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(this.renderer.domElement);

    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.05;

    this.controls.enablePan = false;
    this.controls.target.set(0, 0, 0);


    this.dirLight = new THREE.DirectionalLight(new THREE.Color(themes["default"].dirclr), 1);
    this.hemiLight = new THREE.HemisphereLight(new THREE.Color(themes["default"].hemiclr), 0x000000, 0.1);
  }

  setupAgents() {
    const xzSpread = 40;
    const ySpread = 25;
    
    for (let i = 0; i < this.numBlocks; i++) {
      const x = random_num(-xzSpread, xzSpread);
      const y = random_num(4, ySpread);
      const z = random_num(-xzSpread, xzSpread);

      const agent = new Agent(this.scene, { x: x, y: y, z: z }, 'blue');

      this.entities.push(agent);
    }
  }

  initLights() {
    // const hemiLight = new THREE.HemisphereLight(0xffffff, 0xffffff, 0.1);
    // hemiLight.color.setHSL(0.6, 0.6, 0.6);
    // hemiLight.groundColor.setHSL(0.1, 1, 0.4);

    this.hemiLight.position.set(0, 50, 0);
    this.scene.add(this.hemiLight);


    this.dirLight.position.set(0, 70, 0);
    this.dirLight.position.multiplyScalar(100);
    this.dirLight.castShadow = true;

    this.scene.add(this.dirLight);

  }

  createPlane() {
    const plane = new THREE.BoxGeometry(150, 0.5, 150);
    const planeMaterial = new THREE.MeshStandardMaterial({ color: 'gray' });

    const mesh = new THREE.Mesh(plane, planeMaterial);

    mesh.position.set(0, -2, 0);
    this.scene.add(mesh);
  }
  
  changeTheme(theme){
    const themeData = themes[theme];
    
    this.scene.background = new THREE.Color(themeData.bgclr);
    this.scene.fog = new THREE.Fog( new THREE.Color(themeData.fogclr), 1, fogFar );
    
    this.entities.forEach(e => { e.setColor( themeData.blockclr ) });
    
    this.hemiLight.color = new THREE.Color( themeData.hemiclr );
    this.dirLight.color = new THREE.Color( themeData.dirclr );
  }
  
  changeBlockCount(blocks){
    const sceneAgents = this.scene.children.slice(3);
    
    if(blocks > sceneAgents.length){
      // Add agent with the remainder of blocks requested
      const xzSpread = 40;
      const ySpread = 25;

      for(let i = 0; i < (blocks - sceneAgents.length); i++){
        const x = random_num(-xzSpread, xzSpread);
        const y = random_num(4, ySpread);
        const z = random_num(-xzSpread, xzSpread);
        
        const agent = new Agent(this.scene, { x: x, y: y, z: z }, 'blue');
        
        // Then push to the sccene as normal. No need to update or initialized as it will render on update
        agent.init();
        this.entities.push(agent);
      }
    } else if(blocks < sceneAgents.length){
      // Removes the last elements of the remainder of blocks requested
      this.scene.children.splice( (blocks - sceneAgents.length), -(blocks - sceneAgents.length) );
      this.entities.splice( (blocks - sceneAgents.length), -(blocks - sceneAgents.length) );
    }
  }

  changeBehavior(behavior){
    this.entities.forEach(e => e.changeBehavior(behavior));
  }

  changeSim(blocks, theme, behavior){
    this.changeBlockCount(blocks)
    this.changeTheme(theme);
    this.changeBehavior(behavior);
  }
  
  initListeners(){
    const simForm = document.querySelector('.sim--controls');
    simForm.addEventListener('submit', (e) => {
      e.preventDefault();
    
      const blocks = document.getElementById('blocks').value;
      const theme = document.getElementById('theme').value;
      const behavior = document.getElementById('behavior').value;
    
      this.changeSim(blocks, theme, behavior);
    });  
    
    window.addEventListener("resize", (e) => {
      this.camera.aspect = window.innerWidth / window.innerHeight;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(window.innerWidth, window.innerHeight);
    })

  }
  
  init() {
    this.initLights();
    this.createPlane();

    console.log(this.scene);
    
    this.render = this.render.bind(this);
    
    this.setupAgents();
    this.initListeners();
    
    this.entities.forEach((e) => e.init());
    this.controls.update();

    this.render();
  }

  // Animation loop
  render() {
    // Render using the scene and camera specified earlier
    this.controls.update();
    this.entities.forEach((e) => e.update());

    this.renderer.render(this.scene, this.camera);

    window.requestAnimationFrame(this.render);
  }
}


const app = new App();
window.onload = () => app.init();