// A4 Visualizer with real Play/Pause audio control (files + mic) and viz sync

const canvas = document.getElementById('viz');
const ctx = canvas.getContext('2d', { alpha: false });

const state = {
    running: true,             // visualization on/off
    pointer: { x: 0, y: 0 },
    angleBase: 0,
    audioReady: false,
    mode: 'none',              // 'none' | 'file' | 'mic'
    isPlaying: false           // audio playing
};

const params = {
    barCount: 128,
    sensitivity: 2.2,
    smoothing: 0.75,
    colorScheme: 'neon',
    lineWidth: 2,
    mirror: true
};

let audioCtx, analyser, dataArray;
let preGain, outGain;        // preGain feeds analyser; outGain feeds speakers (for files)
let sourceNode = null;       // current AudioBufferSourceNode (file) or MediaStreamSource (mic)
let micStream = null;

// File playback state
let currentBuffer = null;    // AudioBuffer for the loaded file
let fileStartTime = 0;       // audioCtx time when (re)started
let pausedAt = 0;            // seconds into buffer where we paused

// ---------- Layout ----------
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

// ---------- Pointer ----------
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

// ---------- UI Elements ----------
const fileInput = document.getElementById('fileInput');
const micBtn = document.getElementById('micBtn');
const playBtn = document.getElementById('playBtn');
const pauseBtn = document.getElementById('pauseBtn');
const helpOverlay = document.getElementById('helpOverlay');
const helpBtn = document.getElementById('helpBtn');
const closeHelp = document.getElementById('closeHelp');

if (helpBtn) helpBtn.addEventListener('click', () => helpOverlay.style.display = 'grid');
if (closeHelp) closeHelp.addEventListener('click', () => helpOverlay.style.display = 'none');

window.addEventListener('keydown', async (e) => {
    if (e.key?.toLowerCase() === 'h') {
        helpOverlay.style.display = (helpOverlay.style.display === 'none') ? 'grid' : 'none';
    }
    if (e.code === 'Space') {
        e.preventDefault();
        if (state.isPlaying) {
            await pauseAll();
        } else {
            await playAll();
        }
    }
});

// ---------- Audio Graph Setup ----------
async function ensureAudioCtx() {
    if (!audioCtx) {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (audioCtx.state === 'suspended') {
        await audioCtx.resume();
    }
    if (!analyser) {
        analyser = audioCtx.createAnalyser();
        analyser.fftSize = 2048;
        analyser.smoothingTimeConstant = params.smoothing;
        analyser.minDecibels = -90;
        analyser.maxDecibels = -10;
        dataArray = new Uint8Array(analyser.frequencyBinCount);
    }
    if (!preGain) {
        preGain = audioCtx.createGain();
        preGain.gain.value = 1.0;
    }
    if (!outGain) {
        outGain = audioCtx.createGain();
        outGain.gain.value = 1.0; // master volume for files
    }
    state.audioReady = true;
}

// Connect chain depending on whether we want audible output
function connectNodes(src, { toOutput }) {
    // src -> preGain -> analyser -> (outGain -> destination?) for files
    src.connect(preGain);
    preGain.connect(analyser);
    if (toOutput) {
        analyser.connect(outGain);
        outGain.connect(audioCtx.destination);
    } else {
        // mic: do not connect to destination (avoid feedback)
        // (analyser is still fed so visualization works)
    }
}

// ---------- File Handling ----------
fileInput.addEventListener('change', async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    await stopAll();

    try {
        await ensureAudioCtx();
        const arr = await file.arrayBuffer();
        currentBuffer = await audioCtx.decodeAudioData(arr);
        pausedAt = 0;
        state.mode = 'file';
        await playAll(); // auto-start after selecting file
        console.log('[A4] File loaded and playing.');
    } catch (err) {
        console.error('[A4] File load error:', err);
    }
});

// Start file playback from pausedAt
async function startFilePlayback() {
    if (!currentBuffer) return;
    if (sourceNode?.stop) { try { sourceNode.stop(); } catch {} }

    const src = audioCtx.createBufferSource();
    src.buffer = currentBuffer;
    sourceNode = src;
    connectNodes(src, { toOutput: true });
    await audioCtx.resume();
    fileStartTime = audioCtx.currentTime - pausedAt;
    src.start(0, pausedAt);
    src.onended = () => {
        // if it naturally ended (not a manual pause), reset state
        if (state.isPlaying) {
            state.isPlaying = false;
            pausedAt = 0;
            state.running = false;
        }
    };
}

// ---------- Mic Handling ----------
micBtn.addEventListener('click', async () => {
    try {
        await stopAll();
        if (location.protocol !== 'https:' && location.hostname !== 'localhost') {
            alert('Microphone requires HTTPS or localhost.');
            return;
        }
        await ensureAudioCtx();
        micStream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
        const mediaSrc = audioCtx.createMediaStreamSource(micStream);
        sourceNode = mediaSrc;
        connectNodes(mediaSrc, { toOutput: false }); // no speakers (no feedback)
        state.mode = 'mic';
        await playAll(); // "play" means unmute + animate
        console.log('[A4] Mic stream started.');
    } catch (err) {
        console.error('[A4] Mic error:', err);
    }
});

// ---------- Play/Pause Control (Audio + Viz) ----------
async function playAll() {
    await ensureAudioCtx();

    // Visualization on
    state.running = true;

    if (state.mode === 'file') {
        // Resume / start buffer source
        await startFilePlayback();
        state.isPlaying = true;
    } else if (state.mode === 'mic') {
        // Unmute mic into analyser
        if (preGain) preGain.gain.value = 1.0;
        state.isPlaying = true;
    } else {
        // No source selected; nothing to play, but keep viz running (idle rings)
        state.isPlaying = false;
    }
}

async function pauseAll() {
    // Visualization off
    state.running = false;

    if (state.mode === 'file') {
        // Stop current BufferSource and remember position
        if (sourceNode?.stop) {
            try { sourceNode.stop(); } catch {}
        }
        if (audioCtx) {
            pausedAt = Math.max(0, audioCtx.currentTime - fileStartTime);
        }
        state.isPlaying = false;
    } else if (state.mode === 'mic') {
        // Mute mic into analyser
        if (preGain) preGain.gain.value = 0.0;
        state.isPlaying = false;
    }
}

async function stopAll() {
    // Stop audio and reset state
    if (sourceNode?.stop) {
        try { sourceNode.stop(); } catch {}
    }
    if (micStream) {
        micStream.getTracks().forEach(t => t.stop());
        micStream = null;
    }
    sourceNode = null;
    currentBuffer = null;
    pausedAt = 0;
    state.mode = 'none';
    state.isPlaying = false;
    // Visualization keeps running; you can set state.running=false if you prefer.
}

// Wire buttons
if (playBtn) playBtn.addEventListener('click', playAll);
if (pauseBtn) pauseBtn.addEventListener('click', pauseAll);

// ---------- Optional Controls via Tweakpane (safe if CDN fails) ----------
(function setupPaneSafe() {
    try {
        if (typeof Tweakpane === 'undefined') {
            console.warn('[A4] Tweakpane not available; skipping control panel.');
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
        console.warn('[A4] Controls error:', err);
    }
})();

// ---------- Drawing ----------
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

    if (!state.audioReady) {
        // idle rings
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
        return;
    }

    analyser.getByteFrequencyData(dataArray);

    const N = params.barCount;
    const step = Math.max(1, Math.floor(dataArray.length / N));
    const radius = Math.min(w, h) * 0.28;

    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(state.angleBase);
    ctx.lineCap = 'round';
    ctx.lineWidth = params.lineWidth;

    for (let i = 0; i < N; i++) {
        const v = dataArray[i * step] / 255; // 0..1
        const amp = Math.max(0.03, Math.pow(v, 1.25) * params.sensitivity);
        const len = radius * (0.20 + amp);

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
}
render();
