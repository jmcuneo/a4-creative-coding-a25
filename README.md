## A4 — Game of Life + Web Audio (NexusUI)

-**Live site**: https://a4-creative-coding-a25.onrender.com
-**Local dev**: http://localhost:3000/

### Summary ###

A single-page creative coding app with two interactive parts:

-**Canvas**: Conway’s Game of Life (play/pause, step, speed, cell size, seed density).

-**Web Audio**: a small synth you can play from a NexusUI Piano, with sliders for volume, filter cutoff/Q, and reverb mix; a spectrum visualizer; plus a button to play a local MP3 (e.g., Twenty One Pilots — Stressed Out). The site documents controls at the top on load.

### How to run locally ###

**npm install**
**npm run start**

### Tech & Architecture ###

-**Server**: Minimal Express app serving static files and the SPA entry (/public/index.html). Scripts: start, dev. 
-**Client**: HTML/CSS layout & styles in index.html / style.css (two panels, responsive grid). 
-**Canvas** for Conway’s Game of Life (cells drawn each tick; controls wired to update FPS, cell size, density). 
-**Web Audio API** graph built on user gesture: sources (Oscillator or MediaElementSource) → BiquadFilter → Convolver → Master Gain → Analyser → destination; NexusUI Piano events start/stop oscillators; sliders update node params; analyser drives the spectrum canvas. 
-**Libraries**: NexusUI (Piano) loaded via CDN; D3 is not used by design.

### Challenges: ###
-**Web Audio:**
-Autoplay policy & user gesture: Audio must start only after a user action, so the graph initializes on -Start Audio.
-Signal routing & wet/dry: A simple parallel dry branch was added to approximate reverb mix (convolver as wet). Deciding where to place gains (pre/post convolver) took iteration.
-Oscillator lifecycle: Avoiding clicks required short attack/release envelopes and stopping oscillators after note-off.
-Filter behavior: Low-pass with adjustable Q; balancing musical sweeps vs. resonance spikes required 

**Canvas**:
-Grid sizing vs. canvas size: Recomputing grid dimensions when cell size changes
-Rules correctness: Verifying toroidal wraparound and neighbor counting to match expected Life behavior.