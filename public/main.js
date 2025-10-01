// import our three.js reference
import * as THREE from 'https://unpkg.com/three/build/three.module.js'

let scene, camera, renderer, player, ground;
let fallingBlocks = [];
let gameRunning = false;
let gamePaused = false;
let pausedTime = 0;
let totalPausedTime = 0;
let startTime = 0;
let keys = {};
let name;

// Game settings
let GROUND_SIZE = 15;
let PLAYER_SPEED = 0.15;
let BLOCK_FALL_SPEED = .1;
let SPAWN_INTERVAL = 800; // milliseconds
let lastSpawnTime = 0;

export function init(enteredName) {
    // Create scene
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x87CEEB);

    // Create camera
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(0, 8, 8);
    camera.lookAt(0, 0, 0);

    // Create renderer
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    document.getElementById('gameContainer').appendChild(renderer.domElement);

    // Create ground
    createGround();

    // Create player
    const playerGeometry = new THREE.ConeGeometry(0.5, 1, 8);
    const playerMaterial = new THREE.MeshLambertMaterial({ color: 0x0066FF });
    player = new THREE.Mesh(playerGeometry, playerMaterial);
    player.position.set(0, 0.5, 0);
    player.castShadow = true;
    scene.add(player);

    // Add lights
    const ambientLight = new THREE.AmbientLight(0x404040, 0.4);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(10, 20, 5);
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.width = 2048;
    directionalLight.shadow.mapSize.height = 2048;
    directionalLight.shadow.camera.near = 0.5;
    directionalLight.shadow.camera.far = 50;
    directionalLight.shadow.camera.left = -15;
    directionalLight.shadow.camera.right = 15;
    directionalLight.shadow.camera.top = 15;
    directionalLight.shadow.camera.bottom = -15;
    scene.add(directionalLight);

    // Event listeners
    document.addEventListener('keydown', onKeyDown);
    document.addEventListener('keyup', onKeyUp);
    window.addEventListener('resize', onWindowResize);

    name = enteredName;
    startGame();
    animate();
}

function createGround(){
    const groundGeometry = new THREE.PlaneGeometry(GROUND_SIZE, GROUND_SIZE);
    const groundMaterial = new THREE.MeshLambertMaterial({ color: 0x90EE90 });
    ground = new THREE.Mesh(groundGeometry, groundMaterial);
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    scene.add(ground);
}

function startGame() {
    gameRunning = true;
    gamePaused = false;
    startTime = Date.now();
    totalPausedTime = 0;
    lastSpawnTime = 0;
    fallingBlocks = [];
    player.position.set(0, 0.5, 0);
    document.getElementById('gameOver').style.display = 'none';
    document.getElementById('pausegame').style.display = 'none';

    // Clear any existing blocks
    scene.children = scene.children.filter(child => {
        if (child.userData && child.userData.type === 'fallingBlock') {
            return false;
        }
        return true;
    });
}

function togglePause() {
    if (!gameRunning) return;

    gamePaused = !gamePaused;

    if (gamePaused) {
        pausedTime = Date.now();
        document.getElementById('pausegame').style.display = 'block';
    } else {
        totalPausedTime += Date.now() - pausedTime;
        document.getElementById('pausegame').style.display = 'none';
    }
}

function restartGame() {
    startGame();
}

function spawnBlock() {
    const blockGeometry = new THREE.BoxGeometry(1, 1, 1);
    const blockMaterial = new THREE.MeshLambertMaterial({
        color: Math.random() * 0xffffff
    });
    const block = new THREE.Mesh(blockGeometry, blockMaterial);

    // Random position within ground bounds
    block.position.set(
        (Math.random() - 0.5) * (GROUND_SIZE - 2),
        10,
        (Math.random() - 0.5) * (GROUND_SIZE - 2)
    );

    block.castShadow = true;
    block.userData = { type: 'fallingBlock' };
    scene.add(block);
    fallingBlocks.push(block);
}

function updateBlocks() {
    for (let i = fallingBlocks.length - 1; i >= 0; i--) {
        const block = fallingBlocks[i];
        block.position.y -= BLOCK_FALL_SPEED;

        // Remove blocks that hit the ground
        if (block.position.y <= 0.5) {
            scene.remove(block);
            fallingBlocks.splice(i, 1);
            continue;
        }

        // Check collision with player
        const distance = player.position.distanceTo(block.position);
        if (distance < 1) {
            gameOver();
            return;
        }
    }
}

function updatePlayer() {
    const moveDistance = PLAYER_SPEED;

    if (keys['w'] || keys['ArrowUp']) {
        player.position.z -= moveDistance;
    }
    if (keys['s'] || keys['ArrowDown']) {
        player.position.z += moveDistance;
    }
    if (keys['a'] || keys['ArrowLeft']) {
        player.position.x -= moveDistance;
    }
    if (keys['d'] || keys['ArrowRight']) {
        player.position.x += moveDistance;
    }

    // Keep player within bounds
    const bound = GROUND_SIZE / 2 - 1;
    player.position.x = Math.max(-bound, Math.min(bound, player.position.x));
    player.position.z = Math.max(-bound, Math.min(bound, player.position.z));
}

function updateScore() {
    if (gameRunning && !gamePaused) {
        const currentTime = Date.now();
        let score;
        score = Math.floor((currentTime - startTime - totalPausedTime) / 1000);
        document.getElementById('score').textContent = score;
    }
}

function gameOver() {
    gameRunning = false;
    gamePaused = false;
    let finalScore;
    finalScore = Math.floor((Date.now() - startTime - totalPausedTime) / 1000);
    document.getElementById('finalScore').textContent = finalScore;
    document.getElementById('gameOver').style.display = 'block';
    document.getElementById('pausegame').style.display = 'none';
    updateLeaderboard(finalScore);
}

function animate() {
    requestAnimationFrame(animate);

    if (gameRunning && !gamePaused) {
        updatePlayer();
        updateBlocks();
        updateScore();

        // Spawn blocks at intervals
        const currentTime = Date.now();
        const adjustedLastSpawn = lastSpawnTime + totalPausedTime;
        if (currentTime - adjustedLastSpawn > SPAWN_INTERVAL) {
            spawnBlock();
            lastSpawnTime = currentTime - totalPausedTime;
        }
    }

    renderer.render(scene, camera);
}

function onKeyDown(event) {
    keys[event.key.toLowerCase()] = true;
    keys[event.code] = true;

    // Handle pause toggle
    if (event.key === ' ' || event.code === 'Space') {
        event.preventDefault();
        togglePause();
    }
}

function onKeyUp(event) {
    keys[event.key.toLowerCase()] = false;
    keys[event.code] = false;
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

//
// const GROUND_SIZE = 15;
// const PLAYER_SPEED = 0.15;
// const BLOCK_FALL_SPEED = .1;
// const SPAWN_INTERVAL = 800; // milliseconds

function updateGroundSize() {
    if (!ground || !scene) return;

    // Remove old ground
    scene.remove(ground);

    // Create new ground with updated size
    createGround();
}

export function initializeSliders() {
    const groundSizeSlider = document.getElementById('groundSizeSlider');
    const playerSpeedSlider = document.getElementById('playerSpeedSlider');
    const blockSpeedSlider = document.getElementById('blockSpeedSlider');
    const spawnRateSlider = document.getElementById('spawnRateSlider');

    groundSizeSlider.addEventListener('input', (e) => {
        GROUND_SIZE = parseFloat(e.target.value);
        document.getElementById('groundSizeValue').textContent = GROUND_SIZE;
        if (ground) updateGroundSize();
    });

    playerSpeedSlider.addEventListener('input', (e) => {
        PLAYER_SPEED = parseFloat(e.target.value);
        document.getElementById('playerSpeedValue').textContent = PLAYER_SPEED.toFixed(2);
    });

    blockSpeedSlider.addEventListener('input', (e) => {
        BLOCK_FALL_SPEED = parseFloat(e.target.value);
        document.getElementById('blockSpeedValue').textContent = BLOCK_FALL_SPEED.toFixed(2);
    });

    spawnRateSlider.addEventListener('input', (e) => {
        SPAWN_INTERVAL = parseFloat(e.target.value);
        document.getElementById('spawnRateValue').textContent = SPAWN_INTERVAL + 'ms';
    });
    animate();
}

function sortLeaderboard() {
    const container = document.getElementById('leaderboard-container');
    const entries = Array.from(container.querySelectorAll('.leaderboard-entry'));

    // Sort entries by the numeric value of .entry-score
    entries.sort((a, b) => {
        const scoreA = Number(a.querySelector('.entry-score').textContent);
        const scoreB = Number(b.querySelector('.entry-score').textContent);
        return scoreB - scoreA; // descending order
    });

    // Re-append sorted entries and update ranks
    entries.forEach((entry, index) => {
        container.appendChild(entry); // moves element to correct position
        entry.querySelector('.entry-rank').textContent = index + 1;
    });
}


function updateLeaderboard(finalScore) {
    // const leaderboard = document.getElementById('leaderboard');
    //
    // leaderboard.addEventListener('click', function() {
        const container = document.getElementById('leaderboard-container');

        const entry = document.createElement('div');
        entry.classList.add("leaderboard-entry");
        const rank = document.createElement('div');
        rank.classList.add("entry-rank");
        rank.textContent = 1;
        const nameDiv = document.createElement('div');
        nameDiv.classList.add("entry-name");
        nameDiv.textContent = name;
        const score = document.createElement('div');
        score.classList.add("entry-score");
        score.textContent = finalScore;
        entry.appendChild(rank);
        entry.appendChild(nameDiv);
        entry.appendChild(score);
        container.appendChild(entry);
        sortLeaderboard();
    // });



    // groundSizeSlider.addEventListener('input', (e) => {
    //     GROUND_SIZE = parseFloat(e.target.value);
    //     document.getElementById('groundSizeValue').textContent = GROUND_SIZE;
    //     if (ground) updateGroundSize();
    // });
    //
    // playerSpeedSlider.addEventListener('input', (e) => {
    //     PLAYER_SPEED = parseFloat(e.target.value);
    //     document.getElementById('playerSpeedValue').textContent = PLAYER_SPEED.toFixed(2);
    // });
    //
    // blockSpeedSlider.addEventListener('input', (e) => {
    //     BLOCK_FALL_SPEED = parseFloat(e.target.value);
    //     document.getElementById('blockSpeedValue').textContent = BLOCK_FALL_SPEED.toFixed(2);
    // });
    //
    // spawnRateSlider.addEventListener('input', (e) => {
    //     SPAWN_INTERVAL = parseFloat(e.target.value);
    //     document.getElementById('spawnRateValue').textContent = SPAWN_INTERVAL + 'ms';
    // });
    // animate();
}

// Start the game
// init();
// initializeSliders();
window.restartGame = restartGame;