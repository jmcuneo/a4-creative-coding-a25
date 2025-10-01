const lifeCanvas = document.getElementById('life-canvas');
const lctx = lifeCanvas.getContext('2d');

const speedEl   = document.getElementById('life-speed');
const speedVal  = document.getElementById('life-speed-val');
const cellEl    = document.getElementById('life-cell');
const cellVal   = document.getElementById('life-cell-val');
const densEl    = document.getElementById('life-density');
const densVal   = document.getElementById('life-density-val');

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