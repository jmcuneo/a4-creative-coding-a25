import * as THREE from "https://unpkg.com/three/build/three.module.js";


class Agent {
    constructor(scene, position, color){
        this.scene = scene;
        this.position = position;

        this.basePosition = position;
        this.color = color;

        this.mesh;
        this.baseRotation;

        this.behavior;
        this.tick = 0;
    }

    init(){
        const geometry = new THREE.BoxGeometry(1, 1, 1);
        const material = new THREE.MeshStandardMaterial({color: this.color});
        
        this.mesh = new THREE.Mesh( geometry, material );

        
        this.mesh.rotation.set(
            Math.random() * 360,
            Math.random() * 360,
            Math.random() * 360
        )
        this.baseRotation = this.mesh.rotation;
        
        this.mesh.position.set(this.basePosition.x, this.basePosition.y, this.basePosition.z);
        
        this.scene.add( this.mesh );
    }

    setColor( color ){
        this.mesh.material.color = new THREE.Color( color );
    }
    
    resetPos(){
        this.mesh.position.set(this.basePosition.x, this.basePosition.y, this.basePosition.z);
        this.mesh.rotation.set(this.baseRotation.x, this.baseRotation.y, this.baseRotation.z);
    }

    changeBehavior(behavior){
        this.resetPos();
        this.behavior = behavior.toLowerCase();
        console.log(this.behavior);
    }

    update(){
        if(this.behavior === "wave"){
            this.mesh.position.y += Math.sin(this.tick) / 100;
            this.tick += 0.01;
        } else if(this.behavior === "superspin"){
            this.mesh.rotation.x += 0.055;
            this.mesh.rotation.y += 0.05;
            this.mesh.rotation.z += 0.05;
        }

        this.mesh.rotation.y += 0.005;
        this.mesh.rotation.z += 0.005;

    }
}


export default Agent;