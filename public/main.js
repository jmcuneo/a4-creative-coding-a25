const canvas = document.getElementById('scene');
const ctx = canvas.getContext('2d', { alpha: true });

function hideOverlay() {
  const overlay = document.getElementById('overlay');
  if (overlay) overlay.style.display = 'none';
}
(function attachOverlayHandlers() {
  const overlay = document.getElementById('overlay');
  const startBtn = document.getElementById('startBtn');

  if (startBtn) startBtn.addEventListener('click', hideOverlay);
  if (overlay) overlay.addEventListener('click', (e) => {
    if (e.target.id === 'overlay') hideOverlay();
  });
  window.addEventListener('keydown', (e) => {
    if ((e.key === 'Enter' || e.key === ' ') && overlay && overlay.style.display !== 'none') {
      e.preventDefault();
      hideOverlay();
    }
  });
})();

function resize() {
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  canvas.width = Math.floor(window.innerWidth * dpr);
  canvas.height = Math.floor(window.innerHeight * dpr);
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}
window.addEventListener('resize', resize);
resize();

function clearAll() {
  ctx.fillStyle = '#0b0f14';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
}
clearAll();

const PARAMS = {
  segments: 8,
  strokeWidth: 4,
  jitter: 0.6,
  fade: 0.06,
  colorMode: 'rainbow', 
  hueSpeed: 0.6,
};

(function initUI() {
  try {
    const tp = window.Tweakpane || window.tp;
    if (!tp || !tp.Pane) throw new Error('Tweakpane not found');

    const pane = new tp.Pane({ title: 'Controls' });
    pane.addBinding(PARAMS, 'segments', { min: 3, max: 24, step: 1 });
    pane.addBinding(PARAMS, 'strokeWidth', { min: 1, max: 20, step: 1 });
    pane.addBinding(PARAMS, 'jitter', { min: 0, max: 4, step: 0.1 });
    pane.addBinding(PARAMS, 'fade', { min: 0, max: 0.2, step: 0.01, label: 'trail fade' });
    pane.addBinding(PARAMS, 'colorMode', { options: { rainbow: 'rainbow', mono: 'mono' } });
    pane.addBinding(PARAMS, 'hueSpeed', { min: 0, max: 2, step: 0.05 });
  } catch {
    createFallbackUI();
  }
})();

function createFallbackUI() {
  const panel = document.createElement('div');
  panel.className = 'fallback-ui';
  panel.innerHTML = `
    <div class="title">Controls (fallback)</div>
    <label>Segments
      <input id="fp-segments" type="range" min="3" max="24" step="1" value="${PARAMS.segments}">
    </label>
    <label>Stroke width
      <input id="fp-stroke" type="range" min="1" max="20" step="1" value="${PARAMS.strokeWidth}">
    </label>
    <label>Jitter
      <input id="fp-jitter" type="range" min="0" max="4" step="0.1" value="${PARAMS.jitter}">
    </label>
    <label>Trail fade
      <input id="fp-fade" type="range" min="0" max="0.2" step="0.01" value="${PARAMS.fade}">
    </label>
    <label>Color mode
      <select id="fp-color">
        <option value="rainbow"${PARAMS.colorMode==='rainbow'?' selected':''}>rainbow</option>
        <option value="mono"${PARAMS.colorMode==='mono'?' selected':''}>mono</option>
      </select>
    </label>
    <label>Hue speed
      <input id="fp-hue" type="range" min="0" max="2" step="0.05" value="${PARAMS.hueSpeed}">
    </label>
  `;
  document.body.appendChild(panel);

  const get = id => document.getElementById(id);
  get('fp-segments').addEventListener('input', e => PARAMS.segments = +e.target.value);
  get('fp-stroke').addEventListener('input', e => PARAMS.strokeWidth = +e.target.value);
  get('fp-jitter').addEventListener('input', e => PARAMS.jitter = +e.target.value);
  get('fp-fade').addEventListener('input', e => PARAMS.fade = +e.target.value);
  get('fp-color').addEventListener('change', e => PARAMS.colorMode = e.target.value);
  get('fp-hue').addEventListener('input', e => PARAMS.hueSpeed = +e.target.value);
}


function rotatePoint(cx, cy, x, y, angle) {
  const s = Math.sin(angle), c = Math.cos(angle);
  const dx = x - cx, dy = y - cy;
  return [cx + dx * c - dy * s, cy + dx * s + dy * c];
}


let drawing = false;
let last = null; // [x, y]
let hue = 180;
const center = () => [canvas.width / 2, canvas.height / 2];


canvas.addEventListener('pointerdown', (e) => {
  const overlay = document.getElementById('overlay');
  if (overlay && overlay.style.display !== 'none') return;

  drawing = true;
  const rect = canvas.getBoundingClientRect();
  last = [e.clientX - rect.left, e.clientY - rect.top];
});

canvas.addEventListener('pointerup', () => { drawing = false; last = null; });
canvas.addEventListener('pointerleave', () => { drawing = false; last = null; });

canvas.addEventListener('pointermove', (e) => {
  if (!drawing) return;
  const rect = canvas.getBoundingClientRect();
  const x = e.clientX - rect.left + (Math.random() - 0.5) * PARAMS.jitter;
  const y = e.clientY - rect.top + (Math.random() - 0.5) * PARAMS.jitter;
  if (!last) { last = [x, y]; return; }

  const [cx, cy] = center();
  const segs = Math.max(3, PARAMS.segments);
  const angleStep = (Math.PI * 2) / segs;

  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.lineWidth = PARAMS.strokeWidth;
  ctx.globalCompositeOperation = 'lighter';

  
  if (PARAMS.colorMode === 'rainbow') {
    hue = (hue + PARAMS.hueSpeed) % 360;
    ctx.strokeStyle = `hsl(${hue}, 85%, 60%)`;
  } else {
    ctx.strokeStyle = 'rgba(230,240,255,0.9)';
  }

  for (let i = 0; i < segs; i++) {
    const theta = angleStep * i;
    const [lx, ly] = rotatePoint(cx, cy, last[0], last[1], theta);
    const [nx, ny] = rotatePoint(cx, cy, x, y, theta);

    ctx.beginPath();
    ctx.moveTo(lx, ly);
    ctx.lineTo(nx, ny);
    ctx.stroke();

    
    const [mlx, mly] = rotatePoint(cx, cy, last[0], 2 * cy - last[1], theta);
    const [mnx, mny] = rotatePoint(cx, cy, x, 2 * cy - y, theta);
    ctx.beginPath();
    ctx.moveTo(mlx, mly);
    ctx.lineTo(mnx, mny);
    ctx.stroke();
  }

  last = [x, y];
});

window.addEventListener('keydown', (e) => {
  if (e.key.toLowerCase() === 'c') clearAll();
});

function loop() {
  if (PARAMS.fade > 0) {
    ctx.fillStyle = `rgba(11, 15, 20, ${PARAMS.fade})`;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }
  requestAnimationFrame(loop);
}
requestAnimationFrame(loop);
