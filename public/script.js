
window.onload = () => {
    // 1. DOM ELEMENTS
    const canvas = document.getElementById('visualizerCanvas');
    const ctx = canvas.getContext('2d');
    const audioFileInput = document.getElementById('audioFileInput');

    // UI Control Elements
    const barColorInput = document.getElementById('barColorInput');
    const barCountInput = document.getElementById('barCountInput');
    const barWidthInput = document.getElementById('barWidthInput');
    const smoothingInput = document.getElementById('smoothingInput');

    // 2. WEB AUDIO API SETUP
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    let analyser = audioContext.createAnalyser();
    
    // Default analyser settings
    analyser.fftSize = 2 ** 7;
    analyser.smoothingTimeConstant = 0.8;

    let audioSource = null;
    let dataArray = new Uint8Array(analyser.frequencyBinCount);
    const audio = new Audio(); // Create an audio element to play the sound

    // 3. HANDLE AUDIO FILE INPUT
    audioFileInput.onchange = (event) => {
        if (!audio.paused) {
            audio.pause();
        }
        
        const file = event.target.files[0];
        if (file) {
            audio.src = URL.createObjectURL(file);
            audio.load();
            
            if (!audioSource) {
                audioSource = audioContext.createMediaElementSource(audio);
                audioSource.connect(analyser);
                analyser.connect(audioContext.destination);
            }
        }
    };

    // 4. HANDLE PLAY/PAUSE
    canvas.onclick = () => {
        if (audioContext.state === 'suspended') {
            audioContext.resume();
        }
        
        if (audio.src) {
            if (audio.paused) {
                audio.play();
            } else {
                audio.pause();
            }
        } else {
            alert('Please select an audio file first.');
        }
    };

    // 5. ANIMATION LOOP
    function drawVisualizer() {
        requestAnimationFrame(drawVisualizer);

        // 1. Get current values from UI controls and update the analyser
        const barColor = barColorInput.value;
        const barGap = parseInt(barWidthInput.value, 10);
        analyser.smoothingTimeConstant = parseFloat(smoothingInput.value);
        
        const newFftSize = 2 ** parseInt(barCountInput.value, 10);
        if (analyser.fftSize !== newFftSize) {
            analyser.fftSize = newFftSize;
            dataArray = new Uint8Array(analyser.frequencyBinCount);
        }

        // 2. NOW get the audio data, AFTER settings are updated
        analyser.getByteFrequencyData(dataArray);

        // 3. Clear the canvas
        ctx.fillStyle = '#000';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        const bufferLength = analyser.frequencyBinCount;
        const barWidth = (canvas.width / bufferLength) - barGap;
        let x = 0;

        // 4. Loop through the data (which is now correctly populated) and draw bars
        for (let i = 0; i < bufferLength; i++) {
            const barHeight = dataArray[i];
            
            ctx.fillStyle = barColor;
            ctx.fillRect(x, canvas.height - barHeight, barWidth, barHeight);
            
            x += barWidth + barGap;
        }
    }

    // Start the animation loop
    drawVisualizer();
};