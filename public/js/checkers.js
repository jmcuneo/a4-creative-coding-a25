const canvas = document.getElementById("board");
const ctx = canvas.getContext("2d");
const size = 8;
const squareSize = canvas.width / size;

let board = [];
let turn = "W";
let selected = null;
let mode = "local";
let gameId = null;

document.getElementById("modeSelect").onchange = e => mode = e.target.value;

document.getElementById("createGame").onclick = async () => {
    const res = await fetch("/api/game/create", {method:"POST"});
    const {gameId: id} = await res.json();
    gameId = id;
    alert("Game created. Share ID: " + gameId);
    pollGame();
};

document.getElementById("joinGame").onclick = async () => {
    const id = document.getElementById("gameId").value.trim();
    const res = await fetch("/api/game/join/" + id, {method:"POST"});
    const {gameId: joinedId} = await res.json();
    gameId = joinedId;
    alert("Joined game " + gameId);
    pollGame();
};

function initBoard() {
    board = Array.from({length: size}, (_, r) =>
        Array.from({length: size}, (_, c) =>
            r < 3 && (r + c) % 2 === 1 ? "W" :
            r > 4 && (r + c) % 2 === 1 ? "B" : ""
        )
    );
}

function drawBoard() {
    for (let r = 0; r < size; r++)
        for (let c = 0; c < size; c++) {
            ctx.fillStyle = (r + c) % 2 ? "#704923" : "#EEE";
            ctx.fillRect(c * squareSize, r * squareSize, squareSize, squareSize);
        }
}

function drawChecker(c, r, color, king = false) {
    ctx.beginPath();
    ctx.arc(c * squareSize + squareSize / 2, r * squareSize + squareSize / 2, squareSize * 0.4, 0, Math.PI * 2);
    ctx.fillStyle = color;
    ctx.fill();
    ctx.stroke();
}

function redraw() {
    drawBoard();
    for (let r = 0; r < size; r++)
        for (let c = 0; c < size; c++)
            if (board[r][c]) {
                const piece = board[r][c];
                drawChecker(c, r, piece[0] === "W" ? "white" : "black", piece.length > 1);
            }
}

canvas.onclick = async e => {
    const rect = canvas.getBoundingClientRect();
    const c = Math.floor((e.clientX - rect.left) / squareSize);
    const r = Math.floor((e.clientY - rect.top) / squareSize);

    if (selected) {
        board[r][c] = board[selected.r][selected.c];
        board[selected.r][selected.c] = "";
        turn = turn === "W" ? "B" : "W";
        redraw();

        if (mode === "online" && gameId) {
            await fetch(`/api/game/${gameId}/move`, {
                method: "POST",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify({from: selected, to: {row: r, col: c}})
            });
        }
        selected = null;
    } else if (board[r][c]) {
        selected = {r, c};
    }
};

function pollGame() {
    setInterval(async () => {
        if (mode === "online" && gameId) {
            const res = await fetch("/api/game/" + gameId);
            const game = await res.json();
            board = game.board;
            turn = game.turn;
            redraw();
        }
    }, 2000);
}

initBoard();
redraw();
