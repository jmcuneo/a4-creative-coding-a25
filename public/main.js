const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

let stars = []; // declared early
let audioCtx, analyser, source;
let dataArray, bufferLength;

const controls = {
  depth: 7,
  speed: 0.05,
  sensitivity: 6,
  palette: "warm"
};

// Hook up UI
document.getElementById("depth").oninput = e => controls.depth = +e.target.value;
document.getElementById("speed").oninput = e => controls.speed = +e.target.value;
document.getElementById("sensitivity").oninput = e => controls.sensitivity = +e.target.value;
document.getElementById("palette").oninput = e => controls.palette = e.target.value;
document.getElementById("audioFile").addEventListener("change", handleFile);

//  Planets 
const planets = [
  { name: "Mercury", baseSize: 20, color: "#b5b5b5", ring: false },
  { name: "Venus", baseSize: 28, color: "#f5e0b7", ring: false },
  { name: "Earth", baseSize: 30, color: "#3a8fd0", ring: false },
  { name: "Mars", baseSize: 25, color: "#d14c32", ring: false },
  { name: "Jupiter", baseSize: 50, color: "#f0a94b", ring: false },
  { name: "Saturn", baseSize: 45, color: "#f5e3a7", ring: true },
  { name: "Uranus", baseSize: 35, color: "#7fdbff", ring: true },
  { name: "Neptune", baseSize: 35, color: "#4060ff", ring: false }
];

// Canvas & Starfield 
function createStars() {
  const count = Math.floor((canvas.width * canvas.height) / 1500);
  stars = Array.from({ length: count }, () => ({
    x: Math.random() * canvas.width,
    y: Math.random() * canvas.height,
    baseSize: Math.random() * 1.5 + 0.5,
    twinkleOffset: Math.random() * Math.PI * 2
  }));
}

function resizeCanvas() {
  const oldWidth = canvas.width;
  const oldHeight = canvas.height;

  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  if (stars.length) {
    stars.forEach(star => {
      star.x = (star.x / oldWidth) * canvas.width;
      star.y = (star.y / oldHeight) * canvas.height;
    });
  } else {
    createStars();
  }
}

window.addEventListener("resize", resizeCanvas);
resizeCanvas();

// Draw Stars 
function drawBackground(avgVolume = 0) {
  ctx.fillStyle = "black";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  const time = performance.now() / 500;

  stars.forEach(star => {
    const pulse = star.baseSize + (avgVolume / 256) * 2;
    const twinkle = Math.sin(time + star.twinkleOffset) * 0.5;

    ctx.beginPath();
    ctx.arc(star.x, star.y, Math.max(pulse + twinkle, 0.5), 0, Math.PI * 2);
    ctx.fillStyle = "white";
    ctx.fill();
  });
}

// Audio Handling 
function handleFile(event) {
  const file = event.target.files[0];
  if (!file) return;

  const audio = new Audio();
  audio.src = URL.createObjectURL(file);
  audio.crossOrigin = "anonymous";
  audio.loop = true;
  audio.play();

  audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  source = audioCtx.createMediaElementSource(audio);
  analyser = audioCtx.createAnalyser();
  source.connect(analyser);
  analyser.connect(audioCtx.destination);

  analyser.fftSize = 512;
  bufferLength = analyser.frequencyBinCount;
  dataArray = new Uint8Array(bufferLength);

  animate();
}

// Color Palettes
function getColors() {
  const palettes = {
    warm: ["#ff6b6b", "#feca57", "#ff9f43", "#ee5253"],
    cool: ["#54a0ff", "#5f27cd", "#48dbfb", "#2e86de"],
    neon: ["#f368e0", "#48dbfb", "#1dd1a1", "#ff9ff3"],
    pastel: ["#a29bfe", "#fab1a0", "#ffeaa7", "#81ecec"]
  };
  return palettes[controls.palette];
}

// Main Animation
let angle = 0;
function animate() {
  requestAnimationFrame(animate);

  // Get audio data
  let avg = 0;
  if (analyser) {
    analyser.getByteFrequencyData(dataArray);
    avg = dataArray.reduce((a, b) => a + b) / dataArray.length;
  }

  drawBackground(avg);

  if (!analyser) return;

  const bass = dataArray.slice(0, 30).reduce((a, b) => a + b) / 30;
  const size = (avg / 256) * controls.sensitivity * 40;
  const bassBoost = (bass / 256) * controls.sensitivity * 80;

  angle += controls.speed;
  const colors = getColors();

  ctx.save();
  ctx.translate(canvas.width / 2, canvas.height / 2);
  ctx.rotate(angle);

  for (let i = 0; i < controls.depth; i++) {
    ctx.rotate((Math.PI * 2) / controls.depth);

    const radius = 120 + size + bassBoost;
    const basePlanetSize = 40 + size;

    // Make planet pulse with bass
    const planetSize = basePlanetSize + (bass / 256) * 20;

    // Create radial gradient for planet glow
    const gradient = ctx.createRadialGradient(radius, 0, planetSize * 0.2, radius, 0, planetSize);
    gradient.addColorStop(0, "white"); // core
    gradient.addColorStop(1, colors[i % colors.length]); // edge

    ctx.beginPath();
    ctx.arc(radius, 0, planetSize, 0, Math.PI * 2);
    ctx.fillStyle = gradient;
    ctx.shadowColor = colors[i % colors.length];
    ctx.shadowBlur = 25 + (bass / 256) * 30; // glow also reacts to bass
    ctx.fill();

    // Emphasized rings
    ctx.beginPath();
    const ringWidth = planetSize + 15;
    const ringHeight = planetSize * 0.5;
    ctx.ellipse(radius, 0, ringWidth, ringHeight, Math.PI / 6, 0, Math.PI * 2);
    ctx.strokeStyle = `rgba(255,255,255,${0.5 + (bass / 256) * 0.5})`; // brighter with bass
    ctx.lineWidth = 3 + (bass / 256) * 5; // thicker with bass
    ctx.stroke();
  }

  ctx.restore();
}
