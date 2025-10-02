const audioContext = new (window.AudioContext || window.webkitAudioContext)();

let oscillator = null;

let octave = 4;
let type = "sine";
let keyPressed = false;



function playAudio(hertz){
    oscillator = audioContext.createOscillator();
    oscillator.type = type;
    oscillator.frequency.setValueAtTime(hertz, audioContext.currentTime)
    oscillator.connect(audioContext.destination)
    oscillator.start();
}

function stopAudio(){
    if (oscillator) {
        oscillator.stop();
        oscillator.disconnect();
        oscillator = null;
    }
}

function initializeButtons() {
    document.querySelectorAll(".musicButton").forEach((button) => {
        const baseHertz = Number(button.dataset.baseHertz);
        button.style.backgroundColor = "#dddddd";

        button.onmouseup = () => {
            button.style.backgroundColor = "#dddddd";
            stopAudio();
        };

        window.addEventListener("keyup", (event) => {
            if (event.key === button.dataset.key && keyPressed) {
                keyPressed = false;
                button.style.backgroundColor = "#dddddd";
                stopAudio();
            }
        });

        button.onmousedown = () => {
            const hertz = baseHertz * (2 ** octave);
            playAudio(hertz);
            button.style.backgroundColor = "#008899";
        };

        window.addEventListener("keydown", (event) => {
            if (event.key === button.dataset.key && !keyPressed) {
                keyPressed = true;
                const hertz = baseHertz * (2 ** octave);
                playAudio(hertz);
                button.style.backgroundColor = "#008899";
            }
        });
    });
}

// Initiate app and sound changes
window.onload = initializeButtons;

document.querySelector("#octave").onchange = () => {
    octave = Number(document.querySelector("#octave").value)
    initializeButtons();
}

document.querySelector("#oscType").onchange = () => {
    type = document.querySelector("#oscType").value;
    initializeButtons();
}

// Demo portion

const odeToJoy = [
  ["E", 400], ["E", 400], ["F", 400], ["G", 400],
  ["G", 400], ["F", 400], ["E", 400], ["D", 400],
  ["C", 400], ["C", 400], ["D", 400], ["E", 400],
  ["E", 600], ["D", 200], ["D", 800],

  ["E", 400], ["E", 400], ["F", 400], ["G", 400],
  ["G", 400], ["F", 400], ["E", 400], ["D", 400],
  ["C", 400], ["C", 400], ["D", 400], ["E", 400],
  ["D", 600], ["C", 200], ["C", 800]
];

async function playNote(noteName, duration) {
    const button = document.querySelector(`#note${noteName}`);

    const baseHertz = Number(button.dataset.baseHertz);
    const hertz = baseHertz * (2 ** octave);
    playAudio(hertz);
    button.style.backgroundColor = "#008899";

    await new Promise(resolve => setTimeout(resolve, duration));

    stopAudio();
    button.style.backgroundColor = "#dddddd";
    await new Promise(resolve => setTimeout(resolve, 100));
}

async function playOdeToJoy() {
    document.querySelector("#demoBtn").disabled = true;
    for (let [note, duration] of odeToJoy) {
        await playNote(note, duration);
    }
    document.querySelector("#demoBtn").disabled = false;
}

document.querySelector("#demoBtn").onclick = playOdeToJoy;