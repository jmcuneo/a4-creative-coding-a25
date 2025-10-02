import * as THREE from 'https://unpkg.com/three/build/three.module.js';
import { Pane } from 'https://unpkg.com/tweakpane';

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 1000);
camera.position.z = 100;

const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setClearColor(0xCCCCCC);
document.body.appendChild(renderer.domElement);

// const pointLight = new THREE.DirectionalLight(0xcccccc, 2);
// pointLight.position.z = 100;
// scene.add(pointLight);
const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
scene.add(ambientLight);

const pointLight = new THREE.PointLight(0xffffff, 1);
pointLight.position.set(50, 50, 50);
scene.add(pointLight);

const sphereGeo = new THREE.SphereGeometry(1, 64, 64);

const sphereMat = new THREE.MeshStandardMaterial({ color: 0x00FF00, metalness: 0.5, roughness: 0.1});
const sphere = new THREE.Mesh(sphereGeo, sphereMat);
scene.add(sphere);
sphere.position.set(0, 20, 0);

const boxSize = { s: 30}
const boxGeo = new THREE.BoxGeometry( boxSize.s, boxSize.s, boxSize.s );
// const boxMat = new THREE.MeshStandardMaterial({color: 0x111111, transparent: true, opacity: 0.2, side: THREE.DoubleSide});
// const boxTop = new THREE.MeshBasicMaterial({ transparent: true, opacity: 0 });
// const boxSides = [boxMat, boxMat, boxTop, boxMat, boxMat, boxMat];
const boxSides = [
    new THREE.MeshBasicMaterial({color: 0x661111, transparent: true, opacity: 0.1, side: THREE.DoubleSide, depthWrite: false}), // right
    new THREE.MeshBasicMaterial({color: 0x111166, transparent: true, opacity: 0.1, side: THREE.DoubleSide, depthWrite: false}), // left
    new THREE.MeshBasicMaterial({color: 0x111111, transparent: true, opacity: 0.01, side: THREE.DoubleSide, depthWrite: false}),                                        // top (invisible)
    new THREE.MeshBasicMaterial({color: 0x116611, transparent: true, opacity: 0.1, side: THREE.DoubleSide, depthWrite: false}), // bottom
    new THREE.MeshBasicMaterial({color: 0x661111, transparent: true, opacity: 0.1, side: THREE.DoubleSide, depthWrite: false}), // front
    new THREE.MeshBasicMaterial({color: 0x111166, transparent: true, opacity: 0.1, side: THREE.DoubleSide, depthWrite: false})  // back
];
const box = new THREE.Mesh( boxGeo, boxSides );
scene.add( box );

const edges = new THREE.EdgesGeometry(boxGeo);
const lineMat = new THREE.LineBasicMaterial({ color: 0x000000 });
const line = new THREE.LineSegments(edges, lineMat);
box.add(line); 

let isDragging = false;
let previousMouse = { x: 0, y: 0 };
const cameraRotation = { x: 0, y: 0 };

window.addEventListener('mousedown', (event) => {
    isDragging = true;
    previousMouse.x = event.clientX;
    previousMouse.y = event.clientY;
});

window.addEventListener('touchstart', (event) => {
    if (event.touches.length > 0) {
        isDragging = true;
        previousMouse.x = event.touches[0].clientX;
        previousMouse.y = event.touches[0].clientY;
    }
});

window.addEventListener('touchmove', (event) => {
    event.preventDefault();

    if (!isDragging) return;

    if (event.touches.length > 0) {
        const deltaX = event.touches[0].clientX - previousMouse.x;
        const deltaY = event.touches[0].clientY - previousMouse.y;

        cameraRotation.y += deltaX * -0.005;
        cameraRotation.x += deltaY * 0.005;
        cameraRotation.x = Math.max(-Math.PI/2, Math.min(Math.PI/2, cameraRotation.x));

        previousMouse.x = event.touches[0].clientX;
        previousMouse.y = event.touches[0].clientY;
    }
}, { passive: false });

window.addEventListener('touchend', () => {
    isDragging = false;
});




window.addEventListener('mouseup', () => {
    isDragging = false;
});

window.addEventListener('mousemove', (event) => {
    if (!isDragging) return;

    const deltaX = event.clientX - previousMouse.x;
    const deltaY = event.clientY - previousMouse.y;

    cameraRotation.y += deltaX * -0.005;
    cameraRotation.x += deltaY * 0.005;
    cameraRotation.x = Math.max(-Math.PI/2, Math.min(Math.PI/2, cameraRotation.x));

    previousMouse.x = event.clientX;
    previousMouse.y = event.clientY;
});


const radius = { r: 100 };
function updateCamera() {
    camera.position.x = radius.r * Math.sin(cameraRotation.y) * Math.cos(cameraRotation.x);
    camera.position.y = radius.r * Math.sin(cameraRotation.x);
    camera.position.z = radius.r * Math.cos(cameraRotation.y) * Math.cos(cameraRotation.x);
    camera.lookAt(0, 0, 0);
}


const clock = new THREE.Clock();

let launched = false;

let launchVelocity = 0;
let verticalLaunchAngle = 0;
let horizontalLaunchAngle = 0;
let startPosition = new THREE.Vector3(0, 20, 0);
let elapsedTime = 0;
const Gravity = { g: 9.81 };
let gravity = Gravity.g;
let vx = 0;
let vy = 0;
let vz = 0;

let x = 0;
let y = 0;
let z = 0;

function launchSphere() {
    verticalLaunchAngle = Math.random() * 2 * Math.PI;   // radians
    horizontalLaunchAngle = Math.abs(Math.random() * 2 * Math.PI); // radians
    launchVelocity =  Math.random() * 10;
    // console.log("Vertical Angle: " + verticalLaunchAngle * 180 / Math.PI);
    // console.log("Horizontal Angle: " + horizontalLaunchAngle * 180 / Math.PI);
    // console.log("Velocity: " + launchVelocity);

    vx = (Math.sin(horizontalLaunchAngle) * Math.cos(verticalLaunchAngle) * launchVelocity);
    vz = (Math.cos(horizontalLaunchAngle) * Math.cos(verticalLaunchAngle) * launchVelocity);
    vy = (Math.sin(verticalLaunchAngle) * launchVelocity);

    // startPosition.set(0, 20, 0);
    sphere.position.set(0, 20, 0);
    x = 0;
    y = 20;
    z = 0;
    clock.getDelta();
    elapsedTime = 0;
    gravity = Gravity.g;
    launched = true;
}

const trailGeometry = new THREE.BufferGeometry();
const trailPositions = [];
const trailMaterial = new THREE.PointsMaterial({
  color: 0xff0000,
  size: 0.3
});
const trail = new THREE.Points(trailGeometry, trailMaterial);
scene.add(trail);

function updateBall() {
    if (!launched) return;
    const delta = clock.getDelta();
    elapsedTime += delta;
    const cappedDelta = Math.min(delta, 0.1); 
    if (cappedDelta <= 0) return;


    // x = vx * elapsedTime + startPosition.x;
    // z = vz * elapsedTime + startPosition.z;
    // y = vy * elapsedTime - (0.5 * gravity * elapsedTime * elapsedTime) + startPosition.y;
    vy -= gravity * cappedDelta;

    x += vx * cappedDelta;
    y += vy * cappedDelta;
    z += vz * cappedDelta;
    // console.log("x: " + x + " y: " + y + " z: " + z);
    sphere.position.set(x, y, z);

    if (sphere.position.y <= -boxSize.s / 2 + 1) {
        // startPosition.copy(sphere.position);
        // startPosition.y = -boxSize.s / 2 + 1;
        sphere.position.y = -boxSize.s / 2 + 1;
        elapsedTime = 0;
        vy = -0.9 * (vy + 2 - gravity * elapsedTime);
    }

    const friction = 0.04;
    if (sphere.position.y <= -boxSize.s / 2 + 1.01) { 
        vx *= (1 - friction);
        vz *= (1 - friction);
        if (Math.abs(vx) < 0.05) vx = 0;
        if (Math.abs(vz) < 0.05) vz = 0;
    }

    const bounds = boxSize.s / 2 - 1;
    if (x > bounds || x < -bounds) {
        vx *= -1;
    }
    if (z > bounds || z < -bounds) {
        vz *= -1;
    }

    trailPositions.push(sphere.position.x, sphere.position.y, sphere.position.z);
    trailGeometry.setAttribute( 'position', new THREE.Float32BufferAttribute(trailPositions, 3));

}

// Tweakpane UI
const pane = new Pane({ title: 'Camera Parameters' });
pane.addBinding(radius, 'r', { min: 50, max: 150, label: 'Zoom' });
pane.addBinding(Gravity, 'g', { min: 0, max: 20, step: 1, label: 'Gravity' });


window.addEventListener('resize', function () {
     let width = window.innerWidth;
     let height = window.innerHeight;
     renderer.setSize(width,height);
     camera.aspect = width / height;
     camera.updateProjectionMatrix();
});

const launchButton = document.getElementById('launch');
launchButton.addEventListener('click', () => {
    console.log('Launch button clicked');
    launchSphere();
});
const resetButton = document.getElementById('reset');
resetButton.addEventListener('click', () => {
    console.log('Reset button clicked');
    x, y, z = 0, 20, 0;
    launched = false;
    sphere.position.set(0, 20, 0);
    trailPositions.length = 0;
    trailGeometry.setAttribute('position', new THREE.Float32BufferAttribute(trailPositions, 3));
});

function render() {
    updateCamera();
    updateBall();
    renderer.render(scene, camera);
    window.requestAnimationFrame(render);
}

window.onload = () => {
    render()
    const popup = document.getElementById('popup');
    const closeButton = document.getElementById('closePopup');

    popup.style.display = 'block';

    closeButton.addEventListener('click', () => {
        popup.style.display = 'none';
    });
};