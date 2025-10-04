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
  const res = await fetch("/api/game/create", { method: "POST" });
  const { gameId: id } = await res.json();
  gameId = id;
  alert("Game created! Share this ID: " + gameId);
  pollGame();
};

document.getElementById("joinGame").onclick = async () => {
  const id = document.getElementById("gameId").value.trim();
  const res = await fetch("/api/game/join/" + id, { method: "POST" });
  const { gameId: joinedId } = await res.json();
  gameId = joinedId;
  alert("Joined game " + gameId);
  pollGame();
};

function initBoard() {
  board = Array.from({ length: size }, (_, r) =>
    Array.from({ length: size }, (_, c) =>
      r < 3 && (r + c) % 2 === 1 ? "W" :
      r > 4 && (r + c) % 2 === 1 ? "B" : ""
    )
  );
}

function drawBoard() {
  for (let r = 0; r < size; r++)
    for (let c = 0; c < size; c++) {
      ctx.fillStyle = (r + c) % 2 === 0 ? "#f0f0f0" : "#2d2d2d";
      ctx.fillRect(c * squareSize, r * squareSize, squareSize, squareSize);

      if (selected && selected.r === r && selected.c === c) {
        ctx.fillStyle = "rgba(255,255,0,0.6)";
        ctx.fillRect(c * squareSize, r * squareSize, squareSize, squareSize);
        ctx.strokeStyle = "#ffff00";
        ctx.lineWidth = 3;
        ctx.strokeRect(c * squareSize + 3, r * squareSize + 3, squareSize - 6, squareSize - 6);
      }

      if (validMoves.some(move => move.r === r && move.c === c)) {
        ctx.fillStyle = "rgba(0,255,0,0.4)";
        ctx.fillRect(c * squareSize, r * squareSize, squareSize, squareSize);
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

  ctx.strokeStyle = color === "white" ? "#333" : "#ddd";
  ctx.lineWidth = 3;
  ctx.stroke();

  if (king) {
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
  const dirs = isKing ? [[-1,-1],[-1,1],[1,-1],[1,1]] : isWhite ? [[-1,-1],[-1,1]] : [[1,-1],[1,1]];

  for (const [dr, dc] of dirs) {
    const newR = r + dr, newC = c + dc;
    const jumpR = r + dr * 2, jumpC = c + dc * 2;

    if (newR >= 0 && newR < size && newC >= 0 && newC < size && !board[newR][newC]) {
      moves.push({ r: newR, c: newC });
    }
    if (jumpR >= 0 && jumpR < size && jumpC >= 0 && jumpC < size &&
        !board[jumpR][jumpC] && board[newR][newC] && board[newR][newC][0] !== piece[0]) {
      moves.push({ r: jumpR, c: jumpC, jump: { r: newR, c: newC } });
    }
  }

  return moves;
}

function redraw() {
  drawBoard();
  for (let r = 0; r < size; r++)
    for (let c = 0; c < size; c++)
      if (board[r][c]) {
        const piece = board[r][c];
        drawChecker(c, r, piece[0] === "W" ? "white" : "black", piece.length > 1);
      }

  document.getElementById("gameInfo").textContent = `Current Turn: ${turn === "W" ? "White" : "Black"}`;
}

canvas.onclick = async e => {
  const rect = canvas.getBoundingClientRect();
  const c = Math.floor((e.clientX - rect.left) / squareSize);
  const r = Math.floor((e.clientY - rect.top) / squareSize);

  if (selected) {
    if (selected.r === r && selected.c === c) {
      selected = null; validMoves = []; redraw(); return;
    }

    const move = getValidMoves(selected.r, selected.c).find(m => m.r === r && m.c === c);
    if (move) {
      const piece = board[selected.r][selected.c];
      if (move.jump) board[move.jump.r][move.jump.c] = "";
      board[r][c] = piece;
      board[selected.r][selected.c] = "";

      if ((piece[0] === "W" && r === 0) || (piece[0] === "B" && r === 7)) {
        board[r][c] = piece[0] + "K";
      }

      turn = turn === "W" ? "B" : "W";
      selected = null; validMoves = [];
      redraw();
    } else {
      selected = null; validMoves = []; redraw();
    }
  } else if (board[r][c] && board[r][c][0] === turn) {
    selected = { r, c };
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
