# A4 - Simple Audio Visualizer

**Deployment** [Audio Visualizer - A4](https://github.com/jmcuneo/cs4241-guides/blob/master/using.three.md)

## What this is 
A tiny Canvas + Web Audio API visualizer with a clean, minimal UI and a bottom player (play/pause/stop + seek bar). You load an audio file and tweak a few sliders to change the look/feel of the bars.

## Why I built it this way
Goal was to practice client-side multimedia (no frameworks) and keep the UI simple. I stuck to one visual mode (Bars) but gave it enough controls to feel interactive.\

## Challenges I faced
Getting the Web Audio API connected properly to the canvas took a bit of trial and error, especially figuring out FFT sizes and smoothing so the visuals looked good. I also had to debug file loading and make sure drag-and-drop, the progress bar, and the play/pause controls all stayed in sync.

## Default settings
- Mode: Bars
- Bar/Point Count: 150
- Sensitivity: 1
- Smoothing: 0.92
- FFT Size: 2048
- Colors: Rainbow

## Controls (≥4 exposed parameters)
- Bar / Point Count (16–512)  
- Sensitivity (0.5–3)  
- Smoothing (0–0.98)  
- FFT Size (512/1024/2048/4096)  
- Colors (rainbow/mono/cool/warm)  
- Bottom Player: Play • Pause • Stop • Seek (progress bar) • Time readout

## How to use
1. Click Load audio (or drag & drop a file anywhere).  
2. Use the bottom player to Play/Pause/Stop. Drag the progress bar to scrub.  
3. Adjust Bar/Point Count, Sensitivity, Smoothing, FFT Size, and Colors.  
4. Tip: Spacebar toggles play/pause. Bigger FFT = more detail, higher smoothing = calmer motion.

## Tech
- Express server (serves /public, /health route).  
- Canvas 2D for drawing.  
- Web Audio API for frequency analysis.

## Run it locally
```bash
npm install
npm run dev
# open http://localhost:3000
