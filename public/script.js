import {Pane} from 'https://cdn.jsdelivr.net/npm/tweakpane@4.0.5/dist/tweakpane.min.js';

const pane = new Pane();

const PARAMS = {
  sound: 'sine',
  dynamics: 0.2,
  pedal: 1.2,
  attack: 0.001
};

//controls what type of sound is made
const sound = pane.addBinding(
  PARAMS, 'sound',
  {options: {sine: 'sine', triangle: 'triangle', square: 'square'}}
);

//controls the dynamic of the sound
const dynamics = pane.addBinding(
  PARAMS, 'dynamics',
  {options: {pianissimo: 0.05, piano: 0.1, mezzoPiano: 0.2, mezzoForte: 0.3, forte: 0.4, fortissimo: 0.5}}
)

//acts like pressing a sustain pedal on a piano (lengthens note)
const pedal = pane.addBinding(
  PARAMS, 'pedal',
  {options: {true: 3, false: 1.2}}
)

//similar to sustain but holds the note without change in dynamic rather than just sustaining it
const attack = pane.addBinding(
  PARAMS, 'attack',
  {min: 0.001, max: 1, step: 0.001}
)

//Create Piano
const piano = new Nexus.Piano('#piano', {
  size: [600, 125],
  mode: 'button',
  lowNote: 36,
  highNote: 84
});
  // Set up Web Audio Context
  const audioCtx = new (window.AudioContext || window.webkitAudioContext)();

  //Play the notes
  function playNote(midiNote) {
    const freq = 440 * Math.pow(2, (midiNote - 69) / 12); //Convert MIDI to frequency
    const osc = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();

    osc.type = PARAMS.sound;
    osc.frequency.value = freq;
    osc.connect(gainNode);
    gainNode.connect(audioCtx.destination);

    osc.start();
    gainNode.gain.setValueAtTime(PARAMS.dynamics, audioCtx.currentTime + PARAMS.attack);
    gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + PARAMS.pedal);
    osc.stop(audioCtx.currentTime + PARAMS.pedal);
  }

    //Listen for button presses
  piano.on('change', function(evt) {
    if (evt.state) {
      playNote(evt.note);
    }
  });