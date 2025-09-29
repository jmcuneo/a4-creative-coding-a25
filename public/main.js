const start = function() {
  // Hide the initial start button after click
  const startButton = document.querySelector('button');
  startButton.style.display = 'none';
  const header = document.getElementById('header');
  header.style.display = 'none';
  const header2 = document.getElementById('header2');
  header2.style.display = 'inline';

  const canvas = document.createElement('canvas');
  document.getElementById("audio-visualizer").appendChild(canvas);
  var br = document.createElement("br");
  document.getElementById("audio-visualizer").appendChild(br);
  canvas.width = canvas.height = 512;
  const ctx = canvas.getContext('2d');

  // Color state for rectangles; default is 'lime'
  let rectColor = 'lime';

  // Create audio element with black_cow.mp3
  const audioElement = new Audio('black_cow.mp3');
  audioElement.controls = true;
  document.getElementById("audio-visualizer").appendChild(audioElement);

  // audio init
  const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  const source = audioCtx.createMediaElementSource(audioElement);
  
  const analyser = audioCtx.createAnalyser();
  analyser.fftSize = 1024;
  
  source.connect(analyser);
  analyser.connect(audioCtx.destination);

  const results = new Uint8Array(analyser.frequencyBinCount);

  // Button to randomize color
  const colorButton = document.getElementById('color-randomizer');
  colorButton.style.display = 'inline';
  colorButton.addEventListener('click', function() {
    rectColor = getRandomColor();
  });

  // Helper function to generate random color
  function getRandomColor() {
    var letters = '0123456789ABCDEF';
    var color = '#';

    for (var i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
        }

    return color;
    }

  function draw() {
    window.requestAnimationFrame(draw);
    ctx.fillStyle = 'black';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = rectColor;
    analyser.getByteFrequencyData(results);
    for (let i = 0; i < analyser.frequencyBinCount; i++) {
      ctx.fillRect(i, canvas.height - results[i], 1, results[i]);
    }
  }
  draw();

  audioElement.play();
};
window.onload = () => document.querySelector('button').onclick = start;


