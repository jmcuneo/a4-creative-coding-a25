document.addEventListener('DOMContentLoaded', function() {
const panel = new Interface.Panel({
    container: document.getElementById('pianoPanel'),
    useRelativeSizesAndPositions: true
});

let vibrato = new Tone.Vibrato(5, 0.1)
let dist = new Tone.Distortion(0.5);
let synth = new Tone.PolySynth(Tone.Synth);
synth.chain(dist, Tone.Destination);
const now = Tone.now();
let octave = 3;
let distortion = 0;
let vib = false

const instrumentSelect = document.getElementById('instrument');
instrumentSelect.addEventListener('change', () => {
    updateValues();
});
document.getElementById("distortion").addEventListener('change', () => {
    updateValues();
});

function updateValues() {
    const instrumentType = instrumentSelect.value;
    synth.dispose();
    dist.dispose();

    const SynthClass = Tone[instrumentType];
    dist = new Tone.Distortion(distortion)
    synth = new Tone.PolySynth(SynthClass);
    if (vib) {
        synth.chain(dist, vibrato, Tone.Destination)
    } else {
        synth.chain(dist, Tone.Destination)
    }
    console.log('Instrument changed to:', instrumentType);
}

let piano = ''
createPiano();
function createPiano() {
    if (piano) {
        panel.remove(piano);
    }

    piano = new Interface.Piano({
        bounds: [0, 0, 1, 1],
        startletter: 'C',
        startoctave: parseInt(octave, 10),
        endletter: 'C',
        endoctave: parseInt(octave, 10)+1,
        noteLabels: true,
        target: synth,

        onvaluechange: function() {
            const freq = new Tone.Frequency(this.frequency, "hz");
            const note = freq.toNote();

            if (this.value == 1) {
                synth.triggerAttack(note, now)
            } else {
                synth.triggerRelease(note, now)
            }
        }
    })
    panel.add(piano);
};

const octaveSlider = document.getElementById('octave');
const octaveValue = document.getElementById('octaveValue');
octaveSlider.addEventListener('input', () => {
    octaveValue.textContent = octaveSlider.value;
changeOctave(octaveSlider.value);
});

const distortionSlider = document.getElementById('distortion');
const distortionValue = document.getElementById('distortionValue');
distortionSlider.addEventListener('input', () => {
    distortionValue.textContent = distortionSlider.value;
distortion = parseFloat(distortionSlider.value)
});

vibratoToggle.addEventListener("change", () => {
    if (vibratoToggle.checked) {
        // enable vibrato in the chain
        vib = true;
        updateValues();
    } else {
        // disable vibrato (just bypass)
        vib = false;
        updateValues();
    }
});

function changeOctave(newOctave) {
    octave = newOctave
    createPiano(parseInt(newOctave, 10))
}

panel.add(piano);
});
