const canvas = document.getElementById('viz');
const ctx = canvas.getContext('2d', { alpha: false });

const state = {
    running: true,
    pointer: { x: 0, y: 0 },
    angleBase: 0,
    audioReady: false,
    useMic: false
};

const params = {
    barCount: 96,
    sensitivity: 2.0,
    smoothing: 0.75,
    colorScheme: 'neon',
    lineWidth: 2,
    mirror: true
};

let audioCtx, analyser, dataArray, sourceNode, micStream, preGain;

function resize() {
    const dpr = Math.max(1, Math.floor(window.devicePixelRatio || 1));
    const w = Math.max(1, Math.floor(window.innerWidth));
    const h = Math.max(1, Math.floor(window.innerHeight - 120));
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    canvas.style.width = `${w}px`;
    canvas.style.height = `${h}px`;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}
window.addEventListener('resize', resize);
resize();

// Pointer / touch
function setPointer(e) {
    if (e.touches?.length) {
        state.pointer.x = e.touches[0].clientX;
        state.pointer.y = e.touches[0].clientY;
    } else {
        state.pointer.x = e.clientX ?? state.pointer.x;
        state.pointer.y = e.clientY ?? state.pointer.y;
    }
}
window.addEventListener('pointermove', setPointer, { passive: true });
window.addEventListener('touchmove', setPointer, { passive: true });

// UI elements
const helpOverlay = document.getElementById('helpOverlay');
const closeHelp = document.getElementById('closeHelp');
const helpBtn = document.getElementById('helpBtn');
const fileInput = document.getElementById('fileInput');
const micBtn = document.getElementById('micBtn');
const playBtn = document.getElementById('playBtn');
const pauseBtn = document.getElementById('pauseBtn');

if (closeHelp) closeHelp.addEventListener('click', () => helpOverlay.style.display = 'none');
if (helpBtn) helpBtn.addEventListener('click', () => helpOverlay.style.display = 'grid');

window.addEventListener('keydown', (e) => {
    if (e.key?.toLowerCase() === 'h') {
        helpOverlay.style.display = (helpOverlay.style.display === 'none') ? 'grid' : 'none';
    }
    if (e.code === 'Space') {
        state.running = !state.running;
    }
});

if (playBtn) playBtn.addEventListener('click', async () => {
    state.running = true;
    if (audioCtx && audioCtx.state === 'suspended') {
        await audioCtx.resume();
    }
});
if (pauseBtn) pauseBtn.addEventListener('click', () => {
    state.running = false;
});

// File input + mic
fileInput.addEventListener('change', async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
        stopAudio();
        await initAudio('file');
        const arr = await file.arrayBuffer();
        const buf = await audioCtx.decodeAudioData(arr);
        const src = audioCtx.createBufferSource();
        src.buffer = buf;
        connectSource(src, { toOutput: true }); // play through speakers
        await audioCtx.resume();
        src.start(0);
        console.log('[A4] File playback started. ctx=', audioCtx.state);
    } catch (err) {
        console.error('[A4] File error:', err);
    }
});

micBtn.addEventListener('click', async () => {
    try {
        stopAudio();
        if (location.protocol !== 'https:' && location.hostname !== 'localhost') {
            alert('Microphone requires HTTPS or localhost.');
            return;
        }
        await initAudio('mic');
        micStream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
        const mediaSrc = audioCtx.createMediaStreamSource(micStream);
        connectSource(mediaSrc, { toOutput: false }); // avoid feedback
        await audioCtx.resume();
        state.useMic = true;
        micBtn.setAttribute('aria-pressed', 'true');
        console.log('[A4] Mic started. ctx=', audioCtx.state);
    } catch (err) {
        console.error('[A4] Mic error:', err);
        micBtn.setAttribute('aria-pressed', 'false');
    }
});

function stopAudio() {
    state.useMic = false;
    if (sourceNode?.stop) { try { sourceNode.stop(); } catch {} }
    if (micStream) {
        micStream.getTracks().forEach(t => t.stop());
        micStream = null;
    }
    sourceNode = null;
    console.log('[A4] Stopped any previous audio source');
}

async function initAudio(mode = 'file') {
    if (!audioCtx) {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (audioCtx.state === 'suspended') {
        await audioCtx.resume();
    }

    analyser = audioCtx.createAnalyser();
    analyser.fftSize = 2048;
    analyser.smoothingTimeConstant = params.smoothing;
    analyser.minDecibels = -90;
    analyser.maxDecibels = -10;

    preGain = audioCtx.createGain();
    preGain.gain.value = 1.0;

    dataArray = new Uint8Array(analyser.frequencyBinCount);
    state.audioReady = true;

    console.log(`[A4] initAudio(${mode}) ok. fftSize=${analyser.fftSize} smoothing=${analyser.smoothingTimeConstant}`);
}

function connectSource(src, { toOutput }) {
    sourceNode = src;
    src.connect(preGain);
    preGain.connect(analyser);
    if (toOutput) {
        analyser.connect(audioCtx.destination);
    }
}

// Safe Tweakpane: if CDN fails, skip
function setupPane() {
    try {
        if (typeof Tweakpane === 'undefined') {
            console.warn('[A4] Tweakpane not available; controls panel disabled.');
            return;
        }
        const pane = new Tweakpane.Pane({ container: document.getElementById('controls') });
        const f = pane.addFolder({ title: 'Controls', expanded: true });
        f.addBinding(params, 'barCount', { min: 16, max: 256, step: 1, label: 'Bars' });
        f.addBinding(params, 'sensitivity', { min: 0.5, max: 6.0, step: 0.1, label: 'Sensitivity' });
        f.addBinding(params, 'smoothing', { min: 0.0, max: 0.95, step: 0.01, label: 'Smoothing' })
            .on('change', (ev) => { if (analyser) analyser.smoothingTimeConstant = ev.value; });
        f.addBinding(params, 'lineWidth', { min: 1, max: 6, step: 1, label: 'Line' });
        f.addBinding(params, 'mirror', { label: 'Mirror' });
        f.addBinding(params, 'colorScheme', {
            options: { neon: 'neon', plasma: 'plasma', cool: 'cool', mono: 'mono' },
            label: 'Color'
        });
    } catch (err) {
        console.warn('[A4] Controls init failed:', err);
    }
}
setupPane();

// Color helpers
function lerp(a, b, t) { return a + (b - a) * t; }
function colorFor(i, n) {
    const t = i / Math.max(1, n - 1);
    switch (params.colorScheme) {
        case 'plasma': {
            const r = Math.floor(lerp(50, 255, t));
            const g = Math.floor(lerp(0, 200, t));
            const b = Math.floor(lerp(100, 0, t));
            return `rgb(${r},${g},${b})`;
        }
        case 'cool': {
            const r = Math.floor(lerp(0, 60, t));
            const g = Math.floor(lerp(200, 100, t));
            const b = Math.floor(lerp(180, 255, t));
            return `rgb(${r},${g},${b})`;
        }
        case 'mono': {
            const v = Math.floor(lerp(160, 255, t));
            return `rgb(${v},${v},${v})`;
        }
        case 'neon':
        default: {
            const r = Math.floor(lerp(255, 80, t));
            const g = Math.floor(lerp(60, 255, t));
            const b = Math.floor(lerp(200, 120, t));
            return `rgb(${r},${g},${b})`;
        }
    }
}

function drawBackground(w, h) {
    const g = ctx.createLinearGradient(0, 0, w, h);
    g.addColorStop(0, '#0a0d15');
    g.addColorStop(1, '#0f1320');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, w, h);
}

function render() {
    requestAnimationFrame(render);
    if (!state.running) return;

    const w = canvas.clientWidth;
    const h = canvas.clientHeight;

    drawBackground(w, h);

    // pointer-based rotation
    const cx = w / 2;
    const cy = h / 2;
    const dx = (state.pointer.x - cx) / Math.max(1, w);
    const dy = (state.pointer.y - cy) / Math.max(1, h);
    state.angleBase += (dx + dy) * 0.01;

    let firstBin = 0;

    if (state.audioReady) {
        analyser.getByteFrequencyData(dataArray);
        firstBin = dataArray[0] | 0;

        const N = params.barCount;
        const step = Math.max(1, Math.floor(dataArray.length / N));
        const radius = Math.min(w, h) * 0.28;

        ctx.save();
        ctx.translate(cx, cy);
        ctx.rotate(state.angleBase);
        ctx.lineCap = 'round';
        ctx.lineWidth = params.lineWidth;

        for (let i = 0; i < N; i++) {
            const v = dataArray[i * step] / 255;                     // 0..1
            const amp = Math.max(0.03, Math.pow(v, 1.25) * params.sensitivity); // ensure visible
            const len = radius * (0.20 + amp);                       // base length so it always shows

            const theta = (i / N) * Math.PI * 2;
            const x0 = Math.cos(theta) * radius;
            const y0 = Math.sin(theta) * radius;
            const x1 = Math.cos(theta) * (radius + len);
            const y1 = Math.sin(theta) * (radius + len);

            ctx.strokeStyle = colorFor(i, N);
            ctx.beginPath();
            ctx.moveTo(x0, y0);
            ctx.lineTo(x1, y1);
            ctx.stroke();

            if (params.mirror) {
                ctx.beginPath();
                ctx.moveTo(-x0, -y0);
                ctx.lineTo(-x1, -y1);
                ctx.stroke();
            }
        }
        ctx.restore();
    } else {
        // idle rings if no audio yet
        ctx.save();
        ctx.translate(cx, cy);
        ctx.rotate(state.angleBase);
        ctx.strokeStyle = 'rgba(255,255,255,0.15)';
        ctx.lineWidth = 2;
        for (let i = 0; i < 20; i++) {
            ctx.beginPath();
            ctx.arc(0, 0, 20 + i * 12, 0, Math.PI * 2);
            ctx.stroke();
        }
        ctx.restore();
    }

    // HUD
    ctx.fillStyle = 'rgba(255,255,255,0.85)';
    ctx.font = '12px ui-monospace, Menlo, Consolas, monospace';
    ctx.fillText(`size: ${w}x${h}`, 10, 20);
    ctx.fillText(`audioReady: ${state.audioReady}`, 10, 36);
    ctx.fillText(`ctx: ${audioCtx ? audioCtx.state : 'n/a'}`, 10, 52);
    ctx.fillText(`firstBin: ${firstBin}`, 10, 68);
}
render();
