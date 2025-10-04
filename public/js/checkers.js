// Checkers Game Script
// Supports Local play (hotseat) and Online mode via Express API
// Author: Nicholas Driscoll (2025)

document.addEventListener('DOMContentLoaded', function() {
  console.log("DOM loaded, initializing checkers...");

  const canvas = document.getElementById("board");
  const ctx = canvas.getContext("2d");

  if (!canvas || !ctx) {
    console.error("Canvas or context not found!");
    alert("Failed to initialize game canvas");
    return;
  }

  const size = 8;
  const squareSize = canvas.width / size;

let board = [];
let turn = "W";
let selected = null;
let mode = "local";
let gameId = null;
let validMoves = [];

// DOM bindings
const modeSelect = document.getElementById("modeSelect");
const createBtn = document.getElementById("createGame");
const joinBtn = document.getElementById("joinGame");
const gameIdInput = document.getElementById("gameId");
const gameInfo = document.getElementById("gameInfo");

// ========== EVENT HANDLERS ==========

modeSelect.onchange = e => mode = e.target.value;

createBtn.onclick = async () => {
  try {
    const res = await fetch("/api/game/create", { method: "POST" });
    const data = await res.json();
    gameId = data.gameId;
    alert("Game created! Share this Game ID with your opponent:\n\n" + gameId);
    mode = "online";
    pollGame();
  } catch (err) {
    alert("❌ Failed to create game: " + err.message);
  }
};

joinBtn.onclick = async () => {
  try {
    const id = gameIdInput.value.trim();
    if (!id) return alert("Please enter a Game ID to join.");
    const res = await fetch("/api/game/join/" + id, { method: "POST" });
    const data = await res.json();
    gameId = data.gameId;
    mode = "online";
    alert("✅ Joined game " + gameId);
    pollGame();
  } catch (err) {
    alert("❌ Failed to join game: " + err.message);
  }
};

// ========== GAME SETUP ==========

  function initBoard() {
    board = Array.from({ length: size }, (_, r) =>
      Array.from({ length: size }, (_, c) =>
        r < 3 && (r + c) % 2 === 1 ? "W" :
        r > 4 && (r + c) % 2 === 1 ? "B" : ""
      )
    );
    console.log("Board initialized. Current turn:", turn);
    console.log("Sample pieces:", {
      "Top-left white": board[0][1],
      "Bottom-right black": board[7][6],
      "Middle empty": board[3][3]
    });
    redraw();
  }// ========== DRAWING FUNCTIONS ==========

function drawBoard() {
  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      // Dark theme colors to match website
      ctx.fillStyle = (r + c) % 2 === 0 ? "#f0f0f0" : "#2d2d2d";
      ctx.fillRect(c * squareSize, r * squareSize, squareSize, squareSize);

      // Add border for better definition
      ctx.strokeStyle = "#666";
      ctx.lineWidth = 1;
      ctx.strokeRect(c * squareSize, r * squareSize, squareSize, squareSize);

      // highlight selection with yellow glow
      if (selected && selected.r === r && selected.c === c) {
        ctx.fillStyle = "rgba(255, 255, 0, 0.7)";
        ctx.fillRect(c * squareSize, r * squareSize, squareSize, squareSize);
        ctx.strokeStyle = "#ffff00";
        ctx.lineWidth = 4;
        ctx.strokeRect(c * squareSize + 2, r * squareSize + 2, squareSize - 4, squareSize - 4);
      }

      // highlight valid moves with green glow
      if (validMoves.some(m => m.r === r && m.c === c)) {
        ctx.fillStyle = "rgba(0, 255, 0, 0.6)";
        ctx.fillRect(c * squareSize, r * squareSize, squareSize, squareSize);
        ctx.strokeStyle = "#00ff00";
        ctx.lineWidth = 3;
        ctx.strokeRect(c * squareSize + 3, r * squareSize + 3, squareSize - 6, squareSize - 6);
      }
    }
  }
}

function drawChecker(c, r, color, king = false) {
  const x = c * squareSize + squareSize / 2;
  const y = r * squareSize + squareSize / 2;
  const radius = squareSize * 0.35;

  // Main piece
  ctx.beginPath();
  ctx.arc(x, y, radius, 0, Math.PI * 2);
  ctx.fillStyle = color;
  ctx.fill();
  ctx.strokeStyle = color === "white" ? "#333" : "#fff";
  ctx.lineWidth = 3;
  ctx.stroke();

  // Inner circle for depth
  ctx.beginPath();
  ctx.arc(x, y, radius * 0.7, 0, Math.PI * 2);
  ctx.strokeStyle = color === "white" ? "#ddd" : "#444";
  ctx.lineWidth = 2;
  ctx.stroke();

  if (king) {
    // Golden crown for king
    ctx.strokeStyle = "#FFD700";
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.arc(x, y, radius * 0.4, 0, Math.PI * 2);
    ctx.stroke();
    
    ctx.fillStyle = "#FFD700";
    ctx.font = `bold ${squareSize * 0.25}px Arial`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("K", x, y);
  }
}

function redraw() {
  drawBoard();
  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      const piece = board[r][c];
      if (piece) {
        drawChecker(c, r, piece[0] === "W" ? "white" : "black", piece.includes("K"));
      }
    }
  }

  gameInfo.textContent = `Current Turn: ${turn === "W" ? "White" : "Black"}`;
}

// ========== GAME LOGIC ==========

function getValidMoves(r, c) {
  const moves = [];
  const piece = board[r][c];
  if (!piece) return moves;

  const isWhite = piece[0] === "W";
  const isKing = piece.includes("K");
  const dirs = isKing ? [[1,1],[1,-1],[-1,1],[-1,-1]] : (isWhite ? [[-1,1],[-1,-1]] : [[1,1],[1,-1]]);

  for (const [dr, dc] of dirs) {
    const nr = r + dr, nc = c + dc;
    
    // Regular move to empty dark square
    if (nr >= 0 && nr < size && nc >= 0 && nc < size && 
        (nr + nc) % 2 === 1 && !board[nr][nc]) {
      moves.push({ r: nr, c: nc });
    } 
    // Jump over opponent piece
    else if (
      nr + dr >= 0 && nr + dr < size &&
      nc + dc >= 0 && nc + dc < size &&
      (nr + dr + nc + dc) % 2 === 1 &&
      board[nr][nc] && board[nr][nc][0] !== piece[0] &&
      !board[nr + dr][nc + dc]
    ) {
      moves.push({ r: nr + dr, c: nc + dc, jump: { r: nr, c: nc } });
    }
  }
  return moves;
}

// ========== INTERACTION ==========

canvas.addEventListener("click", async e => {
  const rect = canvas.getBoundingClientRect();
  const c = Math.floor((e.clientX - rect.left) / squareSize);
  const r = Math.floor((e.clientY - rect.top) / squareSize);
  
  console.log(`Clicked on square [${r}, ${c}], piece: "${board[r][c]}", turn: "${turn}"`);

  if (selected) {
    console.log(`Selected piece at [${selected.r}, ${selected.c}]`);
    const moves = getValidMoves(selected.r, selected.c);
    console.log(`Valid moves:`, moves);
    const move = moves.find(m => m.r === r && m.c === c);
    
    if (move) {
      console.log("Making move!");
      const piece = board[selected.r][selected.c];
      const fromPos = { row: selected.r, col: selected.c }; // Store before clearing
      
      board[selected.r][selected.c] = "";
      board[r][c] = piece;

      if (move.jump) board[move.jump.r][move.jump.c] = "";

      // King promotion
      if ((piece[0] === "W" && r === 0) || (piece[0] === "B" && r === 7)) {
        board[r][c] = piece[0] + "K";
      }

      turn = turn === "W" ? "B" : "W";
      selected = null;
      validMoves = [];
      redraw();

      // Online sync - use stored position
      if (mode === "online" && gameId) {
        try {
          await fetch(`/api/game/${gameId}/move`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ from: fromPos, to: { row: r, col: c } })
          });
        } catch (err) {
          console.error("Failed to sync move:", err);
        }
      }
    } else {
      console.log("Invalid move or deselecting");
      // Deselect or select new piece
      if (board[r][c] && board[r][c][0] === turn) {
        console.log(`Selecting new piece: ${board[r][c]}`);
        selected = { r, c };
        validMoves = getValidMoves(r, c);
        console.log(`New valid moves:`, validMoves);
        redraw();
      } else {
        console.log("Deselecting piece");
        selected = null;
        validMoves = [];
        redraw();
      }
    }
  } else if (board[r][c] && board[r][c][0] === turn) {
    console.log(`Selecting piece: ${board[r][c]}`);
    selected = { r, c };
    validMoves = getValidMoves(r, c);
    console.log(`Valid moves for selected piece:`, validMoves);
    redraw();
  } else {
    console.log(`Cannot select: piece="${board[r][c]}", turn="${turn}"`);
  }
});

// ========== ONLINE SYNC ==========

function pollGame() {
  setInterval(async () => {
    if (mode === "online" && gameId) {
      try {
        const res = await fetch(`/api/game/${gameId}`);
        const data = await res.json();
        board = data.board;
        turn = data.turn;
        redraw();
      } catch (err) {
        console.error("Failed to poll game:", err);
      }
    }
  }, 2000);
}

  // ========== INITIALIZE ==========
  if (canvas && ctx) {
    initBoard();
    redraw();
    console.log("Checkers game initialized successfully!");
  } else {
    console.error("Failed to initialize checkers game");
  }
});