Here is the link I used to download All I do is win by DJ Khaled:
https://www.reverbnation.com/rickrossricktheruler/song/3651360-all-i-do-is-win-ft-dj-khaled-ludacris

# Shift Tracker (A3) + Side Work Party (A4)

(Render):** https://a4-niajunod-a25.onrender.com/  
- A3: Shift Tracker → `/`  
- A4: Side Work Party (Creative Coding demo) → `/a4`

---

## Assignment 4 — Creative Coding: “Side Work Party”

Summary
“Side Work Party” is an interactive **audio visualizer** built with **HTML5 Canvas** and the **Web Audio API**. Users can load an audio file or use their microphone (HTTPS required) and explore a reactive ring of bars that rotate with the pointer. A right-side control panel lets you customize the visuals live. I called it side work party because me and the other servers usually go in the polish and side work room and listen to music anyway. It can get boring at times, but the visualizer would add ambience. 

Goal
- Demonstrate browser multimedia capabilities using at least one approved framework.  
- Provide an interactive visualization with at least four parameters for user control.  
- Display clear documentation when the app first loads.  

Technologies
- **Express** (server)  
- **HTML5 Canvas** (visual rendering)  
- **Web Audio API** (FFT/analyser, mic & file input)  
- **Tweakpane** (control panel for parameters)  

### User Controls (6 total, 4+ required)
- **Bars** (16–256): number of visual bars  
- **Sensitivity** (0.5–6): audio responsiveness  
- **Smoothing** (0–0.95): analyser smoothing constant  
- **Line Width** (1–6): bar stroke thickness  
- **Mirror** (on/off): symmetric visualization  
- **Color Scheme** (neon, plasma, cool, mono)  

Instructions
- On your first visit, a **help overlay** appears explaining usage. Press **H** or click **Help** to show it again.  
- **Load Audio File**: choose an mp3/wav file to visualize.  
- **Use Microphone**: works only on **HTTPS** or `localhost`. Bars react live to mic input.  
- **Play / Pause**: controls both audio playback and the visualization loop.  
- Adjust parameters using the **Tweakpane panel** on the right.  
- Move your **mouse/touch** to rotate the ring of bars.  
- Resize the window to fit the visualization.  

Challenges Faced
- Handling **autoplay restrictions**: AudioContext resumes only after user interaction.  
- Implementing **true pause/resume** for audio file playback (AudioBufferSourceNode recreation + offset tracking).  
- Preventing **feedback** when using microphone input by analysing without routing audio to speakers.  
- Ensuring resilience if the **Tweakpane CDN** is blocked — visualization still runs without controls.  

Notes
- **Microphone input** requires HTTPS (browser security policy).  
- If the **control panel** does not appear, try a different network or refresh — the visualizer itself still works.  

Files (A4)

---

Run Locally

```bash
# install
npm install

# configure environment
# create a .env file (see .env.example)
# .env:
# MONGO_URI=your-mongodb-uri
# PORT=3000

# run
npm start
# open http://localhost:3000  (A3)
# open http://localhost:3000/a4  (A4)

