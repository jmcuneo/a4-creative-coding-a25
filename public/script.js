const canvas = document.getElementById('stage');
const ctx = canvas.getContext('2d', { alpha: false });
const dpr = Math.max(1, window.devicePixelRatio || 1);

function resize() {
  const rect = canvas.getBoundingClientRect();
  canvas.width = Math.floor(rect.width * dpr);
  canvas.height = Math.floor(rect.height * dpr);
}
resize();
addEventListener('resize', resize);

// UI elements
const fileInput = document.getElementById('file');
const barsInput = document.getElementById('bars');
const barsVal = document.getElementById('barsVal');
const sensInput = document.getElementById('sensitivity');
const sensVal = document.getElementById('sensVal');
const smoothingInput = document.getElementById('smoothing');
const smoothVal = document.getElementById('smoothVal');
const fftSelect = document.getElementById('fft');
const colorSelect = document.getElementById('color');
const playBtn = document.getElementById('play');
const pauseBtn = document.getElementById('pause');
const stopBtn = document.getElementById('stop');
const progress = document.getElementById('progress');
const curTimeEl = document.getElementById('curTime');
const durTimeEl = document.getElementById('durTime');
const drop = document.getElementById('drop');

// UI values I found to work the best, so they are the defaults
barsVal.textContent = barsInput.value;       // 150
sensVal.textContent = sensInput.value;       // 1
smoothVal.textContent = smoothingInput.value; // 0.92

// Audio
const audio = new Audio();
audio.crossOrigin = 'anonymous';
audio.preload = 'auto';
audio.loop = false;

let audioCtx;
let analyser;
let srcNode; 
let freqData = new Uint8Array(1024); 
let timeData = new Uint8Array(1024);

function ensureContext() {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    analyser = audioCtx.createAnalyser();
    analyser.fftSize = parseInt(fftSelect.value, 10);
    analyser.smoothingTimeConstant = parseFloat(smoothingInput.value); 
    freqData = new Uint8Array(analyser.frequencyBinCount);
    timeData = new Uint8Array(analyser.frequencyBinCount);
  }
}

function connectGraph() {
  // wire audio element to the analyser
  if (srcNode) try { srcNode.disconnect(); } catch {}
  srcNode = audioCtx.createMediaElementSource(audio);
  srcNode.connect(analyser);
  analyser.connect(audioCtx.destination);
}

function setFFT(size) {
  analyser.fftSize = size;
  freqData = new Uint8Array(analyser.frequencyBinCount);
  timeData = new Uint8Array(analyser.frequencyBinCount);
}

// load the files
fileInput.addEventListener('change', async (e) => {
  const file = e.target.files?.[0];
  if (file) await loadFile(file);
});

async function loadFile(file) {
  if (audio.src && audio.src.startsWith('blob:')) URL.revokeObjectURL(audio.src);
  const url = URL.createObjectURL(file);
  audio.src = url;
  await audio.load();
  // progress bar
}

// drag and drop files
document.addEventListener('dragover', (e) => {
  e.preventDefault();
  drop.style.display = 'flex';
});
document.addEventListener('dragleave', () => {
  drop.style.display = 'none';
});
document.addEventListener('drop', async (e) => {
  e.preventDefault();
  drop.style.display = 'none';
  const file = e.dataTransfer?.files?.[0];
  if (file) await loadFile(file);
});

// song player controls
playBtn.addEventListener('click', async () => {
  ensureContext();
  connectGraph();
  if (audioCtx.state === 'suspended') await audioCtx.resume();
  try {
    await audio.play();
  } catch (err) {
    console.error('Play failed:', err);
  }
});

pauseBtn.addEventListener('click', () => {
  audio.pause();
});

stopBtn.addEventListener('click', () => {
  audio.pause();
  audio.currentTime = 0;
});

// spacebar start stop
document.addEventListener('keydown', (e) => {
  if (e.code === 'Space') {
    e.preventDefault();
    if (audio.paused) playBtn.click();
    else pauseBtn.click();
  }
});

// Progress bar and duration
function fmtTime(sec) {
  if (!isFinite(sec)) return '0:00';
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}
audio.addEventListener('loadedmetadata', () => {
  durTimeEl.textContent = fmtTime(audio.duration);
});

// update progress bar as audio plays
audio.addEventListener('timeupdate', () => {
  const d = audio.duration || 0;
  const t = audio.currentTime || 0;
  curTimeEl.textContent = fmtTime(t);
  durTimeEl.textContent = fmtTime(d);
  const val = d ? Math.floor((t / d) * 1000) : 0;
  if (!progressDragging) progress.value = val;
});

let progressDragging = false;

progress.addEventListener('input', () => {
  progressDragging = true;
});

// when done dragging, go to that spot
progress.addEventListener('change', () => {
  const d = audio.duration || 0;
  const ratio = parseInt(progress.value, 10) / 1000;
  audio.currentTime = d * ratio;
  progressDragging = false;
});

audio.addEventListener('ended', () => {
  progress.value = 0;
  curTimeEl.textContent = '0:00';
});

// parameters
barsInput.addEventListener('input', () => (barsVal.textContent = barsInput.value));
sensInput.addEventListener('input', () => (sensVal.textContent = sensInput.value));
smoothingInput.addEventListener('input', () => {
  smoothVal.textContent = smoothingInput.value;
  if (analyser) analyser.smoothingTimeConstant = parseFloat(smoothingInput.value);
});
fftSelect.addEventListener('change', () => {
  if (analyser) setFFT(parseInt(fftSelect.value, 10));
});

// colors
function hsl(h, s, l) {
  return `hsl(${h}deg ${s}% ${l}%)`;
}

function colorFor(index, total) {
  const scheme = colorSelect.value; 
  if (scheme === 'mono') return hsl(200, 10, 85);
  if (scheme === 'cool') return hsl(200 + (index / total) * 40, 80, 60);
  if (scheme === 'warm') return hsl(10 + (index / total) * 40, 85, 60);
  const hue = (index / total) * 300; 
  return hsl(hue, 85, 60);
}

// drawing the bars
function drawBars() {
  const w = canvas.width;
  const h = canvas.height;
  const count = parseInt(barsInput.value, 10);
  const spacing = 1.2;
  const barW = Math.max(1, Math.floor((w / count) / spacing));
  const maxBarH = h * 0.92;
  const gain = parseFloat(sensInput.value);

  // background
  ctx.fillStyle = '#0b0f14';
  ctx.fillRect(0, 0, w, h);

  const step = Math.max(1, Math.floor(freqData.length / count));

  for (let i = 0; i < count; i++) {
    const v = freqData[i * step] / 255;
    const bh = Math.min(maxBarH, Math.pow(v * gain, 1.08) * maxBarH);
    const x = Math.floor(i * (w / count));
    const y = h - bh;

    ctx.fillStyle = colorFor(i, count);
    ctx.fillRect(x, y, barW, bh);
  }
}

// animation loop
function tick() {
  requestAnimationFrame(tick);
  if (!analyser) return;

  analyser.getByteFrequencyData(freqData);
  drawBars();
}
tick();
