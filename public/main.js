const start = function() {
  // Hide the initial start button after click
  const startButton = document.querySelector('button');
  startButton.style.display = 'none';
  const header = document.getElementById('header');
  header.style.display = 'none';
  const warning = document.getElementById('warning');
  warning.style.display = 'none';
  // Show the name of the song and the artist who wrote it
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

  // Visualization mode UI
  const visualStyleHost = document.getElementById('visual-style');
  visualStyleHost.style.display = 'inline';
  let mode = 'bars'; // mode set to bars by default
  const modeSelect = document.createElement('select');
  // Options map to algorithms implemented below in draw()
  [
    { value: 'bars', label: 'Bars' },
    { value: 'waveform', label: 'Waveform' },
    { value: 'radial', label: 'Radial' }
  ].forEach(function(menu) {
    const option = document.createElement('option');
    option.value = menu.value;
    option.textContent = menu.label;
    modeSelect.appendChild(option);
  });
  modeSelect.value = mode;
  modeSelect.addEventListener('change', function(e) {
    mode = e.target.value;
  });
  
    visualStyleHost.appendChild(modeSelect);
 

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
  // Used for Waveform vizualization
  const timeData = new Uint8Array(analyser.fftSize); 

  // Button to randomize color
  const colorButton = document.getElementById('color-randomizer');
  colorButton.style.display = 'inline';
  colorButton.addEventListener('click', function() {
    rectColor = getRandomColor();
  });

  // Buttons to increase/decrease bar size
  const barControls = document.getElementById('bar-controls');
  barControls.style.display = 'inline';
  var barCountDisplay = document.getElementById('bar-count');
  let barSize = 2.0; // Initial bar width
  const increaseBarsButton = document.getElementById('increase-bars');
  increaseBarsButton.onclick = function() {
    if (barSize < 5.0) {
      barSize += .25;
      barCountDisplay.textContent = `Visual Size: ${barSize}`;
      // console.log("barSize is " + barSize);
    }
  };
  const decreaseBarsButton = document.getElementById('decrease-bars');
  decreaseBarsButton.onclick = function() {
    if (barSize >= 0.25) {
      barSize -= .25;
      barCountDisplay.textContent = `Visual Size: ${barSize}`;
      // console.log("barSize is " + barSize);
    }
  };
  barCountDisplay.textContent = `Visual Size: ${barSize}`;
  

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
    // Set black background
    ctx.fillStyle = 'black';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    if (mode === 'bars') {
      analyser.getByteFrequencyData(results);
      ctx.fillStyle = rectColor;
      for (let i = 0; i < analyser.frequencyBinCount; i++) {
        ctx.fillRect(i*1.5, canvas.height - (barSize*results[i]), 1.5, barSize*results[i]);
      }
    } else if (mode === 'waveform') {
      analyser.getByteTimeDomainData(timeData);
      ctx.strokeStyle = rectColor;
      ctx.lineWidth = 3;
      ctx.beginPath();
      const sliceWidth = canvas.width / timeData.length;
      let x = 0;
      for (let i = 0; i < timeData.length; i++) {
        const v = timeData[i] / 128; // Bytes go from 0 to 255, middle is 128
        const y = (v * canvas.height) / 2;
        if (i === 0) 
            ctx.moveTo(x, y); 
        else 
            ctx.lineTo(x, y);
        x += sliceWidth;
      }
      ctx.stroke();
    } else if (mode === 'radial') { // Personal favorite
      analyser.getByteFrequencyData(results);
      const cx = canvas.width / 2;
      const cy = canvas.height / 2;
      const maxRadius = Math.min(cx, cy) - 4;
      ctx.strokeStyle = rectColor;
      ctx.lineWidth = 1;
      for (let i = 0; i < analyser.frequencyBinCount; i++) {
        const angle = (i / analyser.frequencyBinCount) * Math.PI * (1.52*barSize);
        const magnitude = results[i] / 255;
        const r = magnitude * maxRadius;
        const x = cx + Math.cos(angle) * r;
        const y = cy + Math.sin(angle) * r;
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.lineTo(x, y);
        ctx.stroke();
      }
    }
  }
  draw();

  audioElement.play();
};
window.onload = () => document.querySelector('button').onclick = start;


