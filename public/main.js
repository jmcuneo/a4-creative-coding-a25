const lifeCanvas = document.getElementById('life-canvas');
const lctx = lifeCanvas.getContext('2d');

const speedEl   = document.getElementById('life-speed');
const speedVal  = document.getElementById('life-speed-val');
const cellEl    = document.getElementById('life-cell');
const cellVal   = document.getElementById('life-cell-val');
const densEl    = document.getElementById('life-density');
const densVal   = document.getElementById('life-density-val');

const playBtn = document.getElementById('life-play');
const stepBtn = document.getElementById('life-step');
const randBtn = document.getElementById('life-rand');
const clearBtn= document.getElementById('life-clear');

let CELL = +cellEl.value;        // px per cell
let W = Math.floor(lifeCanvas.width  / CELL);
let H = Math.floor(lifeCanvas.height / CELL);
let grid = new Uint8Array(W * H);
let running = false;
let rafId = null;
let fps = +speedEl.value;

function idx(x,y){ return y*W + x; }

function randomize() {
  const density = +densEl.value / 100;
  for (let y=0; y<H; y++)
    for (let x=0; x<W; x++)
      grid[idx(x,y)] = Math.random() < density ? 1 : 0;
  draw();
}

function clearGrid(){
  grid.fill(0);
  draw();
}

function neighbors(x,y){
  let n=0;
  for (let dy=-1; dy<=1; dy++)
    for (let dx=-1; dx<=1; dx++){
      if (dx===0 && dy===0) continue;
      const nx = (x+dx+W)%W;
      const ny = (y+dy+H)%H;
      n += grid[idx(nx,ny)];
    }
  return n;
}

function step(){
  const next = new Uint8Array(W*H);
  for (let y=0; y<H; y++)
    for (let x=0; x<W; x++){
      const alive = grid[idx(x,y)] === 1;
      const n = neighbors(x,y);
      next[idx(x,y)] = (alive && (n===2 || n===3)) || (!alive && n===3) ? 1 : 0;
    }
  grid = next;
  draw();
}

function draw(){
  lctx.clearRect(0,0,lifeCanvas.width,lifeCanvas.height);
  lctx.fillStyle = '#37c482ff';
  for (let y=0; y<H; y++)
    for (let x=0; x<W; x++)
      if (grid[idx(x,y)]){
        lctx.fillRect(x*CELL, y*CELL, CELL-1, CELL-1);
      }
}

function loop(){
  step();
  const delay = 1000/Math.max(1,fps);
  rafId = setTimeout(()=> requestAnimationFrame(loop), delay);
}

// UI wiring
speedEl.addEventListener('input', e => { fps = +e.target.value; speedVal.textContent = fps; });
cellEl.addEventListener('input', e => {
  CELL = +e.target.value; cellVal.textContent = CELL;
  W = Math.floor(lifeCanvas.width / CELL);
  H = Math.floor(lifeCanvas.height/ CELL);
  grid = new Uint8Array(W*H);
  randomize();
});
densEl.addEventListener('input', e => { densVal.textContent = e.target.value; });

playBtn.addEventListener('click', () => {
  running = !running;
  playBtn.textContent = running ? 'Pause' : 'Play';
  if (running) loop(); else { clearTimeout(rafId); rafId=null; }
});
stepBtn.addEventListener('click', step);
randBtn.addEventListener('click', randomize);
clearBtn.addEventListener('click', clearGrid);

// initialize
randomize();

/*****************************
 *  B) WEB AUDIO + NEXUSUI   *
 *****************************/
let audioCtx = null;
let masterGain, biquad, convolver, analyser;
let impulseBuf = null;
const viz = document.getElementById('viz');
const vctx = viz.getContext('2d');
const player = document.getElementById('player');
const gainEl = document.getElementById('gain');
const gainVal= document.getElementById('gain-val');
const cutEl  = document.getElementById('cutoff');
const cutVal = document.getElementById('cutoff-val');
const qEl    = document.getElementById('q');
const qVal   = document.getElementById('q-val');
const revEl  = document.getElementById('reverb');
const revVal = document.getElementById('reverb-val');

document.getElementById('audio-start').addEventListener('click', async () => {
  if (audioCtx) return;
  audioCtx = new (window.AudioContext || window.webkitAudioContext)();

  // graph nodes
  masterGain = audioCtx.createGain();
  biquad     = audioCtx.createBiquadFilter();
  biquad.type = 'lowpass';
  convolver  = audioCtx.createConvolver();
  analyser   = audioCtx.createAnalyser();
  analyser.fftSize = 1024;

  // impulse (simple small-room-ish)
  impulseBuf = makeImpulse(audioCtx, 1.5, 2.0);
  convolver.buffer = impulseBuf;

  // set initial params
  masterGain.gain.value = (+gainEl.value)/100;   // 0..1
  biquad.frequency.value = +cutEl.value;
  biquad.Q.value = +qEl.value;

  // wire: (source) -> biquad -> convolver -> masterGain -> analyser -> destination
  biquad.connect(convolver);
  convolver.connect(masterGain);
  masterGain.connect(analyser);
  analyser.connect(audioCtx.destination);

  // connect <audio> element but do not start yet
  const media = audioCtx.createMediaElementSource(player);
  media.connect(biquad);

  // NexusUI Piano
  makePiano();

  // Start viz loop
  drawSpectrum();

  // Update labels
  gainVal.textContent = gainEl.value;
  cutVal.textContent  = cutEl.value;
  qVal.textContent    = qEl.value;
  revVal.textContent  = revEl.value;
});

// impulse response generator (white noise tail)
function makeImpulse(ctx, seconds=1.5, decay=2.0) {
  const rate = ctx.sampleRate;
  const length = rate * seconds;
  const impulse = ctx.createBuffer(2, length, rate);
  for (let ch=0; ch<2; ch++){
    const data = impulse.getChannelData(ch);
    for (let i=0; i<length; i++){
      data[i] = (Math.random()*2-1) * Math.pow(1 - i/length, decay);
    }
  }
  return impulse;
}

// sliders
gainEl.addEventListener('input', e => {
  if (!masterGain) return;
  masterGain.gain.value = (+e.target.value)/100;
  gainVal.textContent = e.target.value;
});
cutEl.addEventListener('input', e => {
  if (!biquad) return;
  biquad.frequency.value = +e.target.value;
  cutVal.textContent = e.target.value;
});
qEl.addEventListener('input', e => {
  if (!biquad) return;
  biquad.Q.value = +e.target.value;
  qVal.textContent = e.target.value;
});
revEl.addEventListener('input', e => {
  revVal.textContent = e.target.value;
  if (!convolver || !masterGain) return;
  // simple crossfade between dry and wet (using an extra gain might be cleaner)
  const mix = (+e.target.value)/100;
  // We’ll treat convolver output as “wet” already in chain; to implement wet/dry,
  // we also route a parallel dry path:
  // biquad -> masterGain (dry)
  // biquad -> convolver -> masterGain (wet)
  // Since our existing chain is biquad->convolver->master->..., we add a parallel:
  if (!biquad.__dry) {
    const dryGain = audioCtx.createGain();
    dryGain.gain.value = 1.0;
    biquad.connect(dryGain);
    dryGain.connect(masterGain);
    biquad.__dry = dryGain;
  }
  // Wet scaled by mix, dry by (1-mix)
  masterGain.gain.setValueAtTime(1.0, audioCtx.currentTime);
  biquad.__dry.gain.value = 1.0 - mix;
  // For a true wet control, we’d place gain after convolver; to keep this basic,
  // we approximate by attenuating dry only.
});

// Spectrum visualizer
function drawSpectrum(){
  if (!analyser) return;
  const bins = analyser.frequencyBinCount;
  const data = new Uint8Array(bins);
  const w = viz.width, h = viz.height;
  const barW = Math.max(1, Math.floor(w/bins));

  function frame(){
    requestAnimationFrame(frame);
    vctx.fillStyle = '#0b0d14';
    vctx.fillRect(0,0,w,h);
    analyser.getByteFrequencyData(data);
    vctx.fillStyle = '#7cc5ff';
    for (let i=0;i<bins;i++){
      const v = data[i];
      vctx.fillRect(i*barW, h - v, barW, v);
    }
  }
  frame();
}

// Nexus Piano → trigger oscillators
function makePiano(){
  const piano = new Nexus.Piano('#piano', { size: [600, 80] });
  // MIDI numbers 48–72 (C3..C5) are typical; Nexus default is 24 keys (C..)
  piano.on('change', ({ note, state }) => {
    if (!audioCtx) return;
    if (state){ startNote(note); } else { stopNote(note); }
  });
}

const activeOsc = new Map(); // note -> {osc, gain}
function midiToHz(m){ return 440 * Math.pow(2, (m - 69)/12); }

function startNote(midi){
  if (activeOsc.has(midi)) return;
  const osc = audioCtx.createOscillator();
  osc.type = 'sawtooth';
  osc.frequency.value = midiToHz(midi);

  const g = audioCtx.createGain();
  g.gain.value = 0.001;

  // osc -> gain -> biquad (then rest of chain)
  osc.connect(g);
  g.connect(biquad);
  osc.start();

  // simple attack
  g.gain.exponentialRampToValueAtTime(0.15, audioCtx.currentTime + 0.05);

  activeOsc.set(midi, { osc, g });
}

function stopNote(midi){
  const node = activeOsc.get(midi);
  if (!node) return;
  const { osc, g } = node;
  // release
  try {
    g.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 0.08);
    osc.stop(audioCtx.currentTime + 0.09);
  } catch(_) {}
  activeOsc.delete(midi);
}

// Song controls (Twenty One Pilots - Stressed Out)
document.getElementById('song-load').addEventListener('click', () => {
  if (!audioCtx) return;
  player.src = './media/stressed_out.mp3'; // <- place your mp3 here
  player.play();
});
document.getElementById('song-stop').addEventListener('click', () => {
  player.pause(); player.currentTime = 0;
});