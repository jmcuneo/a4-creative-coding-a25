window.addEventListener("error", (e) =>
  console.error("Error", e.message, e.error)
);

const $ = (id) => document.getElementById(id);
const ui = {
  bpm:   $("bpm"),
  bpmOut:$("bpmOut"),
  wave:  $("wave"),
  vol:   $("vol"),
  status:$("status"),

  modeDorian:   $("modeDorian"), 
  modePhrygian: $("modePhrygian"),
  modeLydian:   $("modeLydian"),
  modeMixolydian:$("modeMixolydian"),
  gen:          $("gen"),
  playMel:      $("playMel"),
  melodyOut:    $("melodyOut"),
};

let started = false;
let playing = false;
let synth, reverb, seq;
let master; // master for volume control

let selectedMode = "";
let melody = [];               // array of note names 
let melodySeq;                
const rootMidi = 60;           // Root note C4 (middle C) 

const MODES = {
  Dorian:     [0, 2, 3, 5, 7, 9, 10, 12], // musical modes chosen
  Lydian:     [0, 2, 4, 6, 7, 9, 11, 12],
  Mixolydian: [0, 2, 4, 5, 7, 9, 10, 12],
  Phrygian:   [0, 1, 3, 5, 7, 8, 10, 12],
};

function midiToNote(m) { // convert MIDI number to playable note for e.g. 60 to C4
  return Tone.Frequency(m, "midi").toNote();
}

function randomMelodyInMode(modeName, steps = 8) {
  const intervals = MODES[modeName];
  const out = [];
  for (let i = 0; i < steps; i++) {
    const octaveOffset = Math.random() < 0.5 ? 0 : 12; // randomly jump octave
    const deg = intervals[Math.floor(Math.random() * intervals.length)]; // random degree for mode
    out.push(midiToNote(rootMidi + deg + octaveOffset));
  }
  return out;
}

function setMelodySequence(notesArr) {
  melodySeq?.dispose?.();
  let idx = 0;
  melodySeq = new Tone.Sequence((time) => {
    const n = notesArr[idx % notesArr.length];
    synth.triggerAttackRelease(n, "8n", time, 0.9);
    idx++;                                  // 8th note duration
  }, [...Array(notesArr.length).keys()], "8n"); 
}


function parseVol() {
  const v = Number.parseFloat(ui.vol?.value); 
  return Number.isNaN(v) ? 0.9 : v;
}

function buildAudioGraph() {
  if (synth) return;
  if (!window.Tone) {
    console.error("Tone.js didnt get.");
    return;
  }

  master = new Tone.Gain(parseVol()).toDestination();
  reverb = new Tone.Reverb({ decay: 2.5, wet: 0.15 }).connect(master);

  synth = new Tone.AMSynth({ // instrument
    oscillator: { type: ui.wave?.value || "square" },  // initialize waveform (sqaure) from dropdown 
    envelope: { attack: 0.005, decay: 0.15, sustain: 0.2, release: 0.2 },
  }).connect(reverb);  
}



function applyTransport() {
  Tone.Transport.bpm.rampTo(Number(ui.bpm?.value) || 120, 0.05);
}

function setStatus(msg) { if (ui.status) ui.status.textContent = "Status: " + msg; }

ui.bpm?.addEventListener("input", () => {   // interactive bpm slider
  if (ui.bpmOut) ui.bpmOut.textContent = ui.bpm.value; 
  if (window.Tone) applyTransport();
});

ui.wave?.addEventListener("change", () => {
  if (synth) synth.oscillator.type = ui.wave.value;
});

ui.vol?.addEventListener("input", () => {
  if (master) master.gain.rampTo(parseVol(), 0.05);
});


ui.modePhrygian?.addEventListener("click", () => { // button functionality
  selectedMode = "Phrygian";
  setStatus("mode: Phrygian mode");
});
ui.modeLydian?.addEventListener("click", () => {
  selectedMode = "Lydian";
  setStatus("mode: Lydian mode");
});
ui.modeMixolydian?.addEventListener("click", () => {
  selectedMode = "Mixolydian";
  setStatus("mode: Mixolydian mode");
});

ui.modeDorian?.addEventListener("click", () => { 
  selectedMode = "Dorian";
  setStatus("mode: Dorian mode");
});

ui.gen?.addEventListener("click", async () => {
  if (!window.Tone) { alert("Tone did not load"); return; }
  if (!started) { await Tone.start(); started = true; }
  buildAudioGraph();

  melody = randomMelodyInMode(selectedMode, 8);
  if (ui.melodyOut) ui.melodyOut.textContent = melody.join("  ");
  setMelodySequence(melody);
  setStatus("melody generated (" + selectedMode + ")");
});

ui.playMel?.addEventListener("click", async () => {
  if (!window.Tone) { alert("Tone did not load"); return; }
  if (!started) { await Tone.start(); started = true; }
  buildAudioGraph();

  if (!melody?.length) {
    melody = randomMelodyInMode(selectedMode, 8);
    if (ui.melodyOut) ui.melodyOut.textContent = melody.join("  ");
    setMelodySequence(melody);
  }
  applyTransport();
  melodySeq?.start(0);
  Tone.Transport.start();
  playing = true;
  setStatus("playing melody");
});


if (ui.bpmOut && ui.bpm) ui.bpmOut.textContent = ui.bpm.value;
setStatus("Generate a random melody and press play!");
