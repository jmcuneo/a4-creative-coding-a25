// Checkers Game - Enhanced with dark theme, larger squares, and visual feedback
// Canvas API: https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API
// Checkers rules: https://en.wikipedia.org/wiki/Checkers

const canvas = document.getElementById("board");
const ctx = canvas.getContext("2d");
const size = 8;
const squareSize = canvas.width / size;

let board = [];
let turn = "W";
let selected = null;
let mode = "local";
let gameId = null;
let validMoves = [];

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
            if ((r + c) % 2 === 0) {
                ctx.fillStyle = "#f0f0f0";
            } else {
                ctx.fillStyle = "#2d2d2d";
            }
            ctx.fillRect(c * squareSize, r * squareSize, squareSize, squareSize);
            
            ctx.strokeStyle = "#666";
            ctx.lineWidth = 1;
            ctx.strokeRect(c * squareSize, r * squareSize, squareSize, squareSize);
            
            // Yellow glow for selected piece
            if (selected && selected.r === r && selected.c === c) {
                ctx.fillStyle = "rgba(255, 255, 0, 0.7)";
                ctx.fillRect(c * squareSize, r * squareSize, squareSize, squareSize);
                
                ctx.strokeStyle = "#ffff00";
                ctx.lineWidth = 4;
                ctx.strokeRect(c * squareSize + 2, r * squareSize + 2, squareSize - 4, squareSize - 4);
            }
            
            // Green glow for valid moves

        
            if (validMoves.some(move => move.r === r && move.c === c)) {
                ctx.fillStyle = "rgba(0, 255, 0, 0.6)";
                ctx.fillRect(c * squareSize, r * squareSize, squareSize, squareSize);
                
                ctx.strokeStyle = "#00ff00";
                ctx.lineWidth = 3;
                ctx.strokeRect(c * squareSize + 3, r * squareSize + 3, squareSize - 6, squareSize - 6);
            }
        }
}

function drawChecker(c, r, color, king = false) {
    const centerX = c * squareSize + squareSize / 2;
    const centerY = r * squareSize + squareSize / 2;
    const radius = squareSize * 0.35;
    
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
    ctx.fillStyle = color;
    ctx.fill();
    
    ctx.strokeStyle = color === "white" ? "#333" : "#fff";
    ctx.lineWidth = 3;
    ctx.stroke();
    
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius * 0.7, 0, Math.PI * 2);
    ctx.strokeStyle = color === "white" ? "#ddd" : "#444";
    ctx.lineWidth = 2;
    ctx.stroke();
    
    if (king) {
        ctx.strokeStyle = "#FFD700";
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius * 0.4, 0, Math.PI * 2);
        ctx.stroke();
        
        ctx.fillStyle = "#FFD700";
        ctx.font = `bold ${squareSize * 0.25}px Arial`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText("K", centerX, centerY);
    }
}

function getValidMoves(r, c) {
    const moves = [];
    const piece = board[r][c];
    if (!piece) return moves;
    
    const isKing = piece.length > 1;
    const isWhite = piece[0] === "W";
    
    const directions = isKing ? [[-1,-1], [-1,1], [1,-1], [1,1]] : 
                      isWhite ? [[-1,-1], [-1,1]] : [[1,-1], [1,1]];
    
    for (const [dr, dc] of directions) {
        const newR = r + dr;
        const newC = c + dc;
        
        if (newR >= 0 && newR < size && newC >= 0 && newC < size && 
            (newR + newC) % 2 === 1 && !board[newR][newC]) {
            moves.push({r: newR, c: newC});
        }
        
        const jumpR = r + dr * 2;
        const jumpC = c + dc * 2;
        
        if (jumpR >= 0 && jumpR < size && jumpC >= 0 && jumpC < size &&
            (jumpR + jumpC) % 2 === 1 && !board[jumpR][jumpC] &&
            board[newR][newC] && board[newR][newC][0] !== piece[0]) {
            moves.push({r: jumpR, c: jumpC, jump: {r: newR, c: newC}});
        }
    }
    
    return moves;
}

function isValidMove(fromR, fromC, toR, toC) {
    const moves = getValidMoves(fromR, fromC);
    return moves.some(move => move.r === toR && move.c === toC);
}

function redraw() {
    drawBoard();
    for (let r = 0; r < size; r++)
        for (let c = 0; c < size; c++)
            if (board[r][c]) {
                const piece = board[r][c];
                drawChecker(c, r, piece[0] === "W" ? "white" : "black", piece.length > 1);
            }
    
    const gameInfo = document.getElementById("gameInfo");
    if (gameInfo) {
        gameInfo.textContent = `Current Turn: ${turn === "W" ? "White" : "Black"}`;
        gameInfo.style.color = turn === "W" ? "#333" : "#333";
    }
}

canvas.onclick = async e => {
    const rect = canvas.getBoundingClientRect();
    const c = Math.floor((e.clientX - rect.left) / squareSize);
    const r = Math.floor((e.clientY - rect.top) / squareSize);

    if (selected) {
        if (selected.r === r && selected.c === c) {
            selected = null;
            validMoves = [];
            redraw();
            return;
        }
        
        if (isValidMove(selected.r, selected.c, r, c)) {
            const piece = board[selected.r][selected.c];
            const fromPos = {row: selected.r, col: selected.c};
            
            const move = getValidMoves(selected.r, selected.c).find(m => m.r === r && m.c === c);
            if (move && move.jump) {
                board[move.jump.r][move.jump.c] = "";
            }
            
            board[r][c] = piece;
            board[selected.r][selected.c] = "";
            
            if ((piece[0] === "W" && r === 0) || (piece[0] === "B" && r === 7)) {
                board[r][c] = piece[0] + "K";
            }
            
            turn = turn === "W" ? "B" : "W";
            selected = null;
            validMoves = [];
            redraw();

            if (mode === "online" && gameId) {
                await fetch(`/api/game/${gameId}/move`, {
                    method: "POST",
                    headers: {"Content-Type": "application/json"},
                    body: JSON.stringify({from: fromPos, to: {row: r, col: c}})
                });
            }
        } else {
            if (board[r][c] && board[r][c][0] === turn) {
                selected = {r, c};
                validMoves = getValidMoves(r, c);
                redraw();
            } else {
                selected = null;
                validMoves = [];
                redraw();
            }
        }
    } else if (board[r][c] && board[r][c][0] === turn) {
        selected = {r, c};
        validMoves = getValidMoves(r, c);
        redraw();
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
