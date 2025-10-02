let scene, camera, renderer, particles, particleGeometry, particleMaterial;
let audioContext, analyser, dataArray, audioSource, audioElement;
let isPlaying = false;

let config = {
    particleCount: 2000,
    speed: 1.0,
    sensitivity: 1.5,
    colorScheme: 'rainbow'
};

const colorSchemes = {
    rainbow: [0xff0000, 0xff7f00, 0xffff00, 0x00ff00, 0x0000ff, 0x4b0082, 0x9400d3],
    fire: [0xff0000, 0xff4500, 0xff6347, 0xff7f50, 0xffa500],
    ocean: [0x006994, 0x0099cc, 0x00bfff, 0x1e90ff, 0x4169e1],
    purple: [0x4b0082, 0x8a2be2, 0x9370db, 0xba55d3, 0xda70d6],
    green: [0x00ff00, 0x32cd32, 0x00fa9a, 0x00ff7f, 0x7fff00]
};

window.addEventListener('load', init);

function init() {
    document.getElementById('closeModal').addEventListener('click', () => {
        document.getElementById('instructionsModal').style.display = 'none';
    });
    
    setupScene();
    setupAudio();
    setupControls();
    animate();
    window.addEventListener('resize', onWindowResize);
}

function setupScene() {
    scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x000000, 0.001);
    
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 150;
    
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    document.getElementById('container').appendChild(renderer.domElement);
    
    createParticles();
    scene.add(new THREE.AmbientLight(0x404040));
    setupMouseControls();
}

function createParticles() {
    if (particles) {
        scene.remove(particles);
        particleGeometry.dispose();
        particleMaterial.dispose();
    }
    
    particleGeometry = new THREE.BufferGeometry();
    const positions = [], colors = [], velocities = [];
    
    for (let i = 0; i < config.particleCount; i++) {
        const radius = Math.random() * 100 + 50;
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.random() * Math.PI;
        
        positions.push(
            radius * Math.sin(phi) * Math.cos(theta),
            radius * Math.sin(phi) * Math.sin(theta),
            radius * Math.cos(phi)
        );
        
        velocities.push((Math.random() - 0.5) * 0.5, (Math.random() - 0.5) * 0.5, (Math.random() - 0.5) * 0.5);
        
        const colorScheme = colorSchemes[config.colorScheme];
        const color = new THREE.Color(colorScheme[i % colorScheme.length]);
        colors.push(color.r, color.g, color.b);
    }
    
    particleGeometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    particleGeometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
    particleGeometry.velocities = velocities;
    
    particleMaterial = new THREE.PointsMaterial({
        size: 2,
        vertexColors: true,
        transparent: true,
        opacity: 0.8,
        blending: THREE.AdditiveBlending
    });
    
    particles = new THREE.Points(particleGeometry, particleMaterial);
    scene.add(particles);
}

function setupAudio() {
    audioContext = new (window.AudioContext || window.webkitAudioContext)();
    analyser = audioContext.createAnalyser();
    analyser.fftSize = 256;
    dataArray = new Uint8Array(analyser.frequencyBinCount);
}

function setupControls() {
    document.getElementById('audioFile').addEventListener('change', handleAudioFile);
    document.getElementById('playPause').addEventListener('click', togglePlayPause);
    
    document.getElementById('particleCount').addEventListener('input', (e) => {
        config.particleCount = parseInt(e.target.value);
        document.getElementById('particleCountValue').textContent = config.particleCount;
        createParticles();
    });
    
    document.getElementById('speed').addEventListener('input', (e) => {
        config.speed = parseFloat(e.target.value);
        document.getElementById('speedValue').textContent = config.speed.toFixed(1);
    });
    
    document.getElementById('sensitivity').addEventListener('input', (e) => {
        config.sensitivity = parseFloat(e.target.value);
        document.getElementById('sensitivityValue').textContent = config.sensitivity.toFixed(1);
    });
    
    document.getElementById('colorScheme').addEventListener('change', (e) => {
        config.colorScheme = e.target.value;
        updateParticleColors();
    });
}

function handleAudioFile(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    if (audioElement) audioElement.pause();
    
    audioElement = new Audio();
    audioElement.src = URL.createObjectURL(file);
    
    if (audioSource) audioSource.disconnect();
    audioSource = audioContext.createMediaElementSource(audioElement);
    audioSource.connect(analyser);
    analyser.connect(audioContext.destination);
    
    document.getElementById('playPause').disabled = false;
    isPlaying = false;
    document.getElementById('playPause').textContent = 'Play';
}

function togglePlayPause() {
    if (!audioElement) return;
    
    if (isPlaying) {
        audioElement.pause();
        document.getElementById('playPause').textContent = 'Play';
    } else {
        if (audioContext.state === 'suspended') audioContext.resume();
        audioElement.play();
        document.getElementById('playPause').textContent = 'Pause';
    }
    isPlaying = !isPlaying;
}

function updateParticleColors() {
    const colors = particleGeometry.attributes.color.array;
    const colorScheme = colorSchemes[config.colorScheme];
    
    for (let i = 0; i < config.particleCount; i++) {
        const color = new THREE.Color(colorScheme[i % colorScheme.length]);
        colors[i * 3] = color.r;
        colors[i * 3 + 1] = color.g;
        colors[i * 3 + 2] = color.b;
    }
    
    particleGeometry.attributes.color.needsUpdate = true;
}

function setupMouseControls() {
    let mouseDown = false, mouseX = 0, mouseY = 0;
    
    renderer.domElement.addEventListener('pointerdown', (e) => {
        mouseDown = true;
        mouseX = e.clientX;
        mouseY = e.clientY;
    });
    
    renderer.domElement.addEventListener('pointerup', () => mouseDown = false);
    
    renderer.domElement.addEventListener('pointermove', (e) => {
        if (!mouseDown) return;
        
        const deltaX = e.clientX - mouseX;
        const deltaY = e.clientY - mouseY;
        mouseX = e.clientX;
        mouseY = e.clientY;
        
        particles.rotation.y += deltaX * 0.005;
        particles.rotation.x += deltaY * 0.005;
    });
}

function animate() {
    requestAnimationFrame(animate);
    
    let audioLevel = 0;
    if (analyser && isPlaying) {
        analyser.getByteFrequencyData(dataArray);
        const sum = dataArray.reduce((a, b) => a + b, 0);
        audioLevel = (sum / dataArray.length) / 255;
    }
    
    updateParticles(audioLevel);
    
    if (!isPlaying) particles.rotation.y += 0.001;
    
    renderer.render(scene, camera);
}

function updateParticles(audioLevel) {
    const positions = particleGeometry.attributes.position.array;
    const velocities = particleGeometry.velocities;
    
    for (let i = 0; i < config.particleCount; i++) {
        const i3 = i * 3;
        
        positions[i3] += velocities[i3] * config.speed;
        positions[i3 + 1] += velocities[i3 + 1] * config.speed;
        positions[i3 + 2] += velocities[i3 + 2] * config.speed;
        
        if (audioLevel > 0) {
            const distance = Math.sqrt(positions[i3] ** 2 + positions[i3 + 1] ** 2 + positions[i3 + 2] ** 2);
            if (distance > 0) {
                const force = audioLevel * config.sensitivity * 2;
                positions[i3] += (positions[i3] / distance) * force;
                positions[i3 + 1] += (positions[i3 + 1] / distance) * force;
                positions[i3 + 2] += (positions[i3 + 2] / distance) * force;
            }
        }
        
        const maxDistance = 200;
        const distance = Math.sqrt(positions[i3] ** 2 + positions[i3 + 1] ** 2 + positions[i3 + 2] ** 2);
        
        if (distance > maxDistance) {
            positions[i3] = (Math.random() - 0.5) * 20;
            positions[i3 + 1] = (Math.random() - 0.5) * 20;
            positions[i3 + 2] = (Math.random() - 0.5) * 20;
        }
    }
    
    particleGeometry.attributes.position.needsUpdate = true;
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}