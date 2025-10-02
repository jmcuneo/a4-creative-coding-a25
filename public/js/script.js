let audioContext;
let masterGain;
let isAudioInitialized = false;

const canvas = document.getElementById("audioCanvas");
const ctx = canvas.getContext("2d");

let waveform = "sine";
let volume = 0.5;
let attackTime = 0.1;
let releaseTime = 0.5;

const activeSounds = [];

function initAudio() {
  if (isAudioInitialized) return;

  try {
    audioContext = new (window.AudioContext || window.webkitAudioContext)();
    masterGain = audioContext.createGain();
    masterGain.connect(audioContext.destination);
    masterGain.gain.value = volume;
    isAudioInitialized = true;
    console.log("Audio initialized");
  } catch (e) {
    console.error("Web Audio API is not supported in this browser", e);
    alert(
      "Web Audio API is not supported in your browser. Please try Chrome, Firefox, or Safari.",
    );
  }
}

function resizeCanvas() {
  const displayWidth = canvas.clientWidth;
  const displayHeight = canvas.clientHeight;

  if (canvas.width !== displayWidth || canvas.height !== displayHeight) {
    canvas.width = displayWidth;
    canvas.height = displayHeight;
  }
}

function drawCanvas() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  ctx.strokeStyle = "rgba(255, 255, 255, 0.1)";
  ctx.lineWidth = 1;

  for (let x = 0; x <= canvas.width; x += 50) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, canvas.height);
    ctx.stroke();
  }

  for (let y = 0; y <= canvas.height; y += 50) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(canvas.width, y);
    ctx.stroke();
  }

  for (let i = activeSounds.length - 1; i >= 0; i--) {
    const sound = activeSounds[i];
    const age = audioContext.currentTime - sound.startTime;

    if (age > 5) {
      activeSounds.splice(i, 1);
      continue;
    }

    const radius = 20 + age * 20;
    const opacity = Math.max(0, 1 - age / 5);

    ctx.beginPath();
    ctx.arc(sound.x, sound.y, radius, 0, Math.PI * 2);
    ctx.fillStyle =
      `rgba(${sound.color.r}, ${sound.color.g}, ${sound.color.b}, ${
        opacity * 0.3
      })`;
    ctx.fill();

    ctx.beginPath();
    ctx.arc(sound.x, sound.y, radius * 0.3, 0, Math.PI * 2);
    ctx.fillStyle =
      `rgba(${sound.color.r}, ${sound.color.g}, ${sound.color.b}, ${opacity})`;
    ctx.fill();
  }

  requestAnimationFrame(drawCanvas);
}

function playSound(x, y) {
  if (!isAudioInitialized) return;

  const normalizedY = 1 - (y / canvas.height);
  const frequency = 100 + normalizedY * 2000;

  const pan = (x / canvas.width) * 2 - 1;

  const oscillator = audioContext.createOscillator();
  const gainNode = audioContext.createGain();
  const panNode = audioContext.createStereoPanner();

  oscillator.type = waveform;
  oscillator.frequency.value = frequency;

  gainNode.gain.setValueAtTime(0, audioContext.currentTime);
  gainNode.gain.linearRampToValueAtTime(
    volume,
    audioContext.currentTime + attackTime,
  );

  panNode.pan.value = pan;

  oscillator.connect(gainNode);
  gainNode.connect(panNode);
  panNode.connect(masterGain);

  oscillator.start();

  const hue = (normalizedY * 360) % 360;
  const color = hslToRgb(hue / 360, 1, 0.5);

  activeSounds.push({
    oscillator,
    gainNode,
    x,
    y,
    startTime: audioContext.currentTime,
    color,
  });

  return {
    oscillator,
    gainNode,
  };
}

function stopSound(sound) {
  if (!sound || !isAudioInitialized) return;

  sound.gainNode.gain.cancelScheduledValues(audioContext.currentTime);
  sound.gainNode.gain.setValueAtTime(
    sound.gainNode.gain.value,
    audioContext.currentTime,
  );
  sound.gainNode.gain.linearRampToValueAtTime(
    0,
    audioContext.currentTime + releaseTime,
  );

  setTimeout(() => {
    sound.oscillator.stop();
    sound.oscillator.disconnect();
  }, releaseTime * 1000);
}

function hslToRgb(h, s, l) {
  let r, g, b;

  if (s === 0) {
    r = g = b = l;
  } else {
    const hue2rgb = (p, q, t) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1 / 6) return p + (q - p) * 6 * t;
      if (t < 1 / 2) return q;
      if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
      return p;
    };

    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    r = hue2rgb(p, q, h + 1 / 3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1 / 3);
  }

  return {
    r: Math.round(r * 255),
    g: Math.round(g * 255),
    b: Math.round(b * 255),
  };
}

let activeSound = null;

canvas.addEventListener("mousedown", (e) => {
  initAudio();
  const rect = canvas.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;
  activeSound = playSound(x, y);
});

canvas.addEventListener("mousemove", (e) => {
  if (activeSound) {
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const normalizedY = 1 - (y / canvas.height);
    const frequency = 100 + normalizedY * 2000;
    activeSound.oscillator.frequency.value = frequency;
  }
});

canvas.addEventListener("mouseup", () => {
  if (activeSound) {
    stopSound(activeSound);
    activeSound = null;
  }
});

canvas.addEventListener("mouseleave", () => {
  if (activeSound) {
    stopSound(activeSound);
    activeSound = null;
  }
});

canvas.addEventListener("touchstart", (e) => {
  e.preventDefault();
  initAudio();
  const rect = canvas.getBoundingClientRect();
  const touch = e.touches[0];
  const x = touch.clientX - rect.left;
  const y = touch.clientY - rect.top;
  activeSound = playSound(x, y);
});

canvas.addEventListener("touchmove", (e) => {
  e.preventDefault();
  if (activeSound) {
    const rect = canvas.getBoundingClientRect();
    const touch = e.touches[0];
    const x = touch.clientX - rect.left;
    const y = touch.clientY - rect.top;

    const normalizedY = 1 - (y / canvas.height);
    const frequency = 100 + normalizedY * 2000;
    activeSound.oscillator.frequency.value = frequency;
  }
});

canvas.addEventListener("touchend", (e) => {
  e.preventDefault();
  if (activeSound) {
    stopSound(activeSound);
    activeSound = null;
  }
});

document.getElementById("waveform").addEventListener("change", (e) => {
  waveform = e.target.value;
});

document.getElementById("volume").addEventListener("input", (e) => {
  volume = parseFloat(e.target.value);
  document.getElementById("volumeValue").textContent = volume.toFixed(2);
  if (masterGain) {
    masterGain.gain.value = volume;
  }
});

document.getElementById("attack").addEventListener("input", (e) => {
  attackTime = parseFloat(e.target.value);
  document.getElementById("attackValue").textContent = attackTime.toFixed(2);
});

document.getElementById("release").addEventListener("input", (e) => {
  releaseTime = parseFloat(e.target.value);
  document.getElementById("releaseValue").textContent = releaseTime.toFixed(1);
});

document.getElementById("clearBtn").addEventListener("click", () => {
  activeSounds.length = 0;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
});

window.addEventListener("load", () => {
  resizeCanvas();
  drawCanvas();
});

window.addEventListener("resize", () => {
  resizeCanvas();
});

document.getElementById("volumeValue").textContent = volume.toFixed(2);
document.getElementById("attackValue").textContent = attackTime.toFixed(2);
document.getElementById("releaseValue").textContent = releaseTime.toFixed(1);
