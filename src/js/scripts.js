import * as THREE from "three";
import { GUI } from "lil-gui";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass.js";
import { OutputPass } from "three/examples/jsm/postprocessing/OutputPass.js";

// Renderer
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.outputColorSpace = THREE.SRGBColorSpace;
document.body.appendChild(renderer.domElement);

// Scene & camera
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
  45,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
camera.position.set(0, -2, 14);
camera.lookAt(0, 0, 0);

// Postprocessing
const params = {
  red: 1,
  green: 1,
  blue: 1,
  threshold: 0.5,
  strength: 0.5,
  radius: 0.8,
};
const renderPass = new RenderPass(scene, camera);
const bloomPass = new UnrealBloomPass(
  new THREE.Vector2(window.innerWidth, window.innerHeight)
);
bloomPass.threshold = params.threshold;
bloomPass.strength = params.strength;
bloomPass.radius = params.radius;

const composer = new EffectComposer(renderer);
composer.addPass(renderPass);
composer.addPass(bloomPass);
composer.addPass(new OutputPass());

// Shader material
const uniforms = {
  u_time: { value: 0.0 },
  u_frequency: { value: 0.0 },
  u_red: { value: 1.0 },
  u_green: { value: 1.0 },
  u_blue: { value: 1.0 },
};

const vsrc = document.getElementById("vertexshader").textContent;
const fsrc = document.getElementById("fragmentshader").textContent;

const mat = new THREE.ShaderMaterial({
  uniforms,
  vertexShader: vsrc,
  fragmentShader: fsrc,
});

const geo = new THREE.IcosahedronGeometry(4, 30);
const mesh = new THREE.Mesh(geo, mat);
mesh.material.wireframe = true;
scene.add(mesh);
// --- Play/Pause UI ---
const playPauseBtn = document.getElementById("playPauseBtn");
let isReady = false;

function setBtn(label, disabled = false) {
  playPauseBtn.textContent = label;
  playPauseBtn.disabled = disabled;
}

// Toggles playback; resumes AudioContext if needed
async function togglePlayback() {
  if (!isReady || !sound.buffer) return;

  const ctx = listener.context;
  if (ctx.state === "suspended") {
    try {
      await ctx.resume();
    } catch (_) {}
  }

  if (!sound.isPlaying) {
    sound.play();
    setBtn("Pause");
  } else {
    // three.js r160 supports pause(); if you prefer stop() then replace with sound.stop()
    sound.pause();
    setBtn("Play");
  }
}

playPauseBtn.addEventListener("click", togglePlayback);

// Optional: Spacebar toggles too
window.addEventListener("keydown", (e) => {
  // avoid typing into GUI text fields, etc.
  const tag = (document.activeElement && document.activeElement.tagName) || "";
  if (tag === "INPUT" || tag === "TEXTAREA") return;

  if (e.code === "Space") {
    e.preventDefault();
    togglePlayback();
  }
});

// If the page is hidden, you can auto-pause (nice to have)
document.addEventListener("visibilitychange", () => {
  if (document.hidden && sound.isPlaying) {
    sound.pause();
    setBtn("Play");
  }
});

// Audio
const listener = new THREE.AudioListener();
camera.add(listener);
const sound = new THREE.Audio(listener);
const audioLoader = new THREE.AudioLoader();

// Important: must be served via http(s) due to browser security.
// Also, some browsers require a user gesture to start/resume the AudioContext.
audioLoader.load(
  "./music/kitchenSza.mp3",
  (buffer) => {
    sound.setBuffer(buffer);
    sound.setLoop(true);
    sound.setVolume(0.8);

    // Enable the UI now that the buffer is ready
    isReady = true;
    setBtn("Play");

    const resumeOnce = async () => {
      const ctx = listener.context;
      if (ctx.state === "suspended") await ctx.resume();
      window.removeEventListener("pointerdown", resumeOnce);
    };
    window.addEventListener("pointerdown", resumeOnce, { once: true });
  },
  undefined,
  (err) => {
    console.error("Audio load error:", err);
    setBtn("Audio Error", true);
  }
);

const analyser = new THREE.AudioAnalyser(sound, 32);

// GUI
const gui = new GUI();
const colorsFolder = gui.addFolder("Colors");
colorsFolder
  .add(params, "red", 0, 1)
  .onChange((v) => (uniforms.u_red.value = Number(v)));
colorsFolder
  .add(params, "green", 0, 1)
  .onChange((v) => (uniforms.u_green.value = Number(v)));
colorsFolder
  .add(params, "blue", 0, 1)
  .onChange((v) => (uniforms.u_blue.value = Number(v)));

const bloomFolder = gui.addFolder("Bloom");
bloomFolder
  .add(params, "threshold", 0, 1)
  .onChange((v) => (bloomPass.threshold = Number(v)));
bloomFolder
  .add(params, "strength", 0, 3)
  .onChange((v) => (bloomPass.strength = Number(v)));
bloomFolder
  .add(params, "radius", 0, 1)
  .onChange((v) => (bloomPass.radius = Number(v)));

let mouseX = 0,
  mouseY = 0;
document.addEventListener("mousemove", (e) => {
  const hx = window.innerWidth / 2;
  const hy = window.innerHeight / 2;
  mouseX = (e.clientX - hx) / 100;
  mouseY = (e.clientY - hy) / 100;
});

// Animate
const clock = new THREE.Clock();
function animate() {
  // camera parallax
  camera.position.x += (mouseX - camera.position.x) * 0.05;
  camera.position.y += (-mouseY - camera.position.y) * 0.5;
  camera.lookAt(scene.position);

  uniforms.u_time.value = clock.getElapsedTime();

  const avg = sound.isPlaying ? analyser.getAverageFrequency() : 0;
  uniforms.u_frequency.value = avg;

  composer.render();
  requestAnimationFrame(animate);
}
animate();

// Resize
window.addEventListener("resize", () => {
  const w = window.innerWidth,
    h = window.innerHeight;
  camera.aspect = w / h;
  camera.updateProjectionMatrix();
  renderer.setSize(w, h);
  composer.setSize(w, h);
});
