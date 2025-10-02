const canvas = document.getElementById('grid');
const ctx = canvas.getContext('2d');

// Config
const rows = 25;
const cols = 40;
const cellSize = 15;

canvas.width = cols * cellSize;
canvas.height = rows * cellSize;

const MAX_DELAY = 1000;
const MIN_DELAY = 50;

// Create empty grid with 0s
function createEmptyGrid() {
    return Array.from({ length: rows }, () =>
        Array.from({ length: cols }, () => 0)
    );
}

function resetGen() {
    gen = 0;
    document.getElementById('generation').innerText = "Generation: " + gen;
}

// Initialize grid
let grid = createEmptyGrid();
let running = false;
let timer = null;
let speed = 300; // ms
let gen = 0;

let painting = false;

// Mouse events for painting cells
canvas.addEventListener('mousedown', () => painting = true);
canvas.addEventListener('mouseup', () => painting = false);

window.onmousemove = (e) => {
    if (!painting)  return;
    paint(e, true); // paint cells alive
};

canvas.onclick = (e) => {
    paint(e, false); // toggle cell state
}

function paint(e, paint=true) {
    const rect = canvas.getBoundingClientRect();
    const x = Math.floor((e.clientX - rect.left) / cellSize);
    const y = Math.floor((e.clientY - rect.top) / cellSize);

    // check coords are in bounds
    if (x >= 0 && x < cols && y >= 0 && y < rows) {
        grid[y][x] = paint ? 1 : grid[y][x] ? 0 : 1;
        drawGrid();
        resetGen();
    }   
}

function randomizeGrid() {
    grid = grid.map(row => row.map(() => Math.random() > 0.7 ? 1 : 0));
}

function drawGrid() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
        if (grid[r][c] === 1) {
            ctx.fillStyle = 'black';
            ctx.fillRect(c * cellSize, r * cellSize, cellSize, cellSize);
        } else {
            ctx.strokeStyle = '#ddd';
            ctx.strokeRect(c * cellSize, r * cellSize, cellSize, cellSize);
        }
        }
    }
}

// Simulation rules
function nextGeneration() {
    const newGrid = createEmptyGrid();

    for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
            // TODO: replace with Conway or custom rules
            if (r+1 < rows && c+1 < cols) newGrid[r][c] = grid[r+1][c+1];
            else newGrid[r][c] = 0;
        }
    }
    grid = newGrid;

    // Update generation count
    gen++;
    document.getElementById('generation').innerText = "Generation: " + gen;
}

// Controls
document.getElementById('startBtn').onclick = () => {
    console.log('start');
    if (!running) {
        running = true;
        timer = setInterval(() => {
        nextGeneration();
        drawGrid();
        }, speed);
    }
};

document.getElementById('stopBtn').onclick = () => {
    running = false;
    clearInterval(timer);
    console.log('stop');
};

document.getElementById('stepBtn').onclick = () => {
    nextGeneration();
    drawGrid();
    console.log('step');
};

document.getElementById('randomBtn').onclick = () => {
    document.getElementById('stopBtn').click(); // stop if running
    randomizeGrid();
    drawGrid();
    resetGen();
};

document.getElementById('clearBtn').onclick = () => {
    document.getElementById('stopBtn').click(); // stop if running
    grid = createEmptyGrid();
    drawGrid();
    resetGen();
};

document.getElementById('speed').oninput = (e) => {
    value = e.target.value;
    speed = MAX_DELAY - value + MIN_DELAY;
    if (running) {
        clearInterval(timer);
        timer = setInterval(() => {
        nextGeneration();
        drawGrid();
        }, speed);
    }
    console.log('speed', e.target.value);
};

// Initial draw
drawGrid();