document.addEventListener('DOMContentLoaded', function() {
  const canvas = document.getElementById("board");
  const ctx = canvas.getContext("2d");
  const gameInfo = document.getElementById("gameInfo");

  if (!canvas || !ctx) return;

  const BOARD_SIZE = 8;
  const SQUARE_SIZE = canvas.width / BOARD_SIZE;
  

  let board = [];
  let currentPlayer = "W"; 
  let selectedPiece = null;
  let mustJump = false;
  let gameOver = false;

  function checkWinCondition() {
    let whitePieces = 0;
    let blackPieces = 0;
    let whiteCanMove = false;
    let blackCanMove = false;
    
    for (let row = 0; row < BOARD_SIZE; row++) {
      for (let col = 0; col < BOARD_SIZE; col++) {
        const piece = board[row][col];
        if (piece.includes("W")) {
          whitePieces++;
          if (!whiteCanMove && canMove(row, col, piece)) whiteCanMove = true;
        } else if (piece.includes("B")) {
          blackPieces++;
          if (!blackCanMove && canMove(row, col, piece)) blackCanMove = true;
        }
      }
    }
    
    if (whitePieces === 0 || !whiteCanMove) {
      gameOver = true;
      gameInfo.textContent = "🎉 BLACK WINS! 🎉";
      return true;
    }
    if (blackPieces === 0 || !blackCanMove) {
      gameOver = true;
      gameInfo.textContent = "🎉 WHITE WINS! 🎉";
      return true;
    }
    return false;
  }

  function canMove(row, col, piece) {
    const isKing = piece.includes("K");
    const directions = isKing ? 
      [[-1,-1], [-1,1], [1,-1], [1,1]] : 
      piece.includes("W") ? [[1,-1], [1,1]] : [[-1,-1], [-1,1]];
    
    for (const [dr, dc] of directions) {
      const newRow = row + dr;
      const newCol = col + dc;
      if (newRow >= 0 && newRow < BOARD_SIZE && newCol >= 0 && newCol < BOARD_SIZE) {
        if (!board[newRow][newCol]) return true;
        
        const jumpRow = row + dr * 2;
        const jumpCol = col + dc * 2;
        if (jumpRow >= 0 && jumpRow < BOARD_SIZE && jumpCol >= 0 && jumpCol < BOARD_SIZE &&
            !board[newRow][newCol].includes(piece[0]) && !board[jumpRow][jumpCol]) {
          return true;
        }
      }
    }
    return false;
  }

  function canJump(row, col, player) {
    const directions = player.includes("K") ? 
      [[-1,-1], [-1,1], [1,-1], [1,1]] : 
      player.includes("W") ? [[1,-1], [1,1]] : [[-1,-1], [-1,1]];
    
    for (const [dr, dc] of directions) {
      const jumpRow = row + dr * 2;
      const jumpCol = col + dc * 2;
      if (jumpRow >= 0 && jumpRow < BOARD_SIZE && jumpCol >= 0 && jumpCol < BOARD_SIZE &&
          board[row + dr][col + dc] && !board[row + dr][col + dc].includes(player[0]) &&
          !board[jumpRow][jumpCol]) {
        return true;
      }
    }
    return false;
  }

  function makeMove(fromRow, fromCol, toRow, toCol) {
    const piece = board[fromRow][fromCol];
    board[toRow][toCol] = piece;
    board[fromRow][fromCol] = "";
    
    if ((piece.includes("W") && toRow === BOARD_SIZE - 1) || 
        (piece.includes("B") && toRow === 0)) {
      board[toRow][toCol] = piece[0] + "K";
    }
    
    const rowDiff = Math.abs(toRow - fromRow);
    if (rowDiff === 2) {
      const captureRow = fromRow + (toRow - fromRow) / 2;
      const captureCol = fromCol + (toCol - fromCol) / 2;
      board[captureRow][captureCol] = "";
      
      if (canJump(toRow, toCol, board[toRow][toCol])) {
        selectedPiece = { row: toRow, col: toCol };
        mustJump = true;
        return false;
      }
    }
    
    selectedPiece = null;
    mustJump = false;
    currentPlayer = currentPlayer[0] === "W" ? "B" : "W";
    
    if (checkWinCondition()) {
      return true;
    }
    
    return true;
  }

  function setupBoard() {
    board = [];
    for (let row = 0; row < BOARD_SIZE; row++) {
      board[row] = [];
      for (let col = 0; col < BOARD_SIZE; col++) {
        if ((row + col) % 2 === 1) {
          if (row < 3) {
            board[row][col] = "W"; 
          } else if (row > 4) {
            board[row][col] = "B";  
          } else {
            board[row][col] = "";   
          }
        } else {
          board[row][col] = "";     
        }
      }
    }
  }

  function drawBoard() {
    for (let row = 0; row < BOARD_SIZE; row++) {
      for (let col = 0; col < BOARD_SIZE; col++) {
        const x = col * SQUARE_SIZE;
        const y = row * SQUARE_SIZE;
        
        if ((row + col) % 2 === 0) {
          ctx.fillStyle = "#f0f0f0";  
        } else {
          ctx.fillStyle = "#2d2d2d";  // Dark theme
        }
        ctx.fillRect(x, y, SQUARE_SIZE, SQUARE_SIZE);

        if (selectedPiece && selectedPiece.row === row && selectedPiece.col === col) {
          ctx.fillStyle = "rgba(255, 255, 0, 0.7)";
          ctx.fillRect(x + 2, y + 2, SQUARE_SIZE - 4, SQUARE_SIZE - 4);
        }
      }
    }
  }

  function drawPieces() {
    for (let row = 0; row < BOARD_SIZE; row++) {
      for (let col = 0; col < BOARD_SIZE; col++) {
        const piece = board[row][col];
        if (piece) {
          const x = col * SQUARE_SIZE + SQUARE_SIZE / 2;
          const y = row * SQUARE_SIZE + SQUARE_SIZE / 2;
          const radius = SQUARE_SIZE * 0.35;
          
          ctx.beginPath();
          ctx.arc(x, y, radius, 0, Math.PI * 2);
          ctx.fillStyle = piece.includes("W") ? "white" : "#1a1a1a";
          ctx.fill();
          ctx.strokeStyle = piece.includes("W") ? "#333" : "#fff";
          ctx.lineWidth = 3;
          ctx.stroke();

          if (piece.includes("K")) {
            ctx.strokeStyle = "#FFD700";
            ctx.lineWidth = 4;
            ctx.beginPath();
            ctx.arc(x, y, radius * 0.5, 0, Math.PI * 2);
            ctx.stroke();
            ctx.fillStyle = "#FFD700";
            ctx.font = `bold ${SQUARE_SIZE * 0.2}px Arial`;
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            ctx.fillText("♔", x, y);
          }
        }
      }
    }
  }

  function render() {
    drawBoard();
    drawPieces();
    if (!gameOver) {
      gameInfo.textContent = `Current Player: ${currentPlayer.includes("W") ? "White" : "Black"}${mustJump ? " - Must Jump!" : ""}`;
    }
  }

  canvas.addEventListener('click', function(e) {
    if (gameOver) return;
    
    const rect = canvas.getBoundingClientRect();
    const col = Math.floor((e.clientX - rect.left) / SQUARE_SIZE);
    const row = Math.floor((e.clientY - rect.top) / SQUARE_SIZE);
    
    const piece = board[row][col];
    
    if (!mustJump && piece && piece[0] === currentPlayer[0]) {
      selectedPiece = { row, col };
      render();
    }
    else if (selectedPiece && !piece && (row + col) % 2 === 1) {
      const rowDiff = Math.abs(row - selectedPiece.row);
      const colDiff = Math.abs(col - selectedPiece.col);
      const selectedPieceType = board[selectedPiece.row][selectedPiece.col];
      const isKing = selectedPieceType.includes("K");
      const isWhite = selectedPieceType.includes("W");
      const validDirection = isKing || 
        (isWhite && row > selectedPiece.row) || 
        (!isWhite && row < selectedPiece.row);
      
      if (!validDirection) return;
      
      if (rowDiff === 1 && colDiff === 1 && !mustJump) {
        makeMove(selectedPiece.row, selectedPiece.col, row, col);
        render();
      }
      else if (rowDiff === 2 && colDiff === 2) {
        const middleRow = selectedPiece.row + (row - selectedPiece.row) / 2;
        const middleCol = selectedPiece.col + (col - selectedPiece.col) / 2;
        const middlePiece = board[middleRow][middleCol];
        
        if (middlePiece && !middlePiece.includes(currentPlayer[0])) {
          makeMove(selectedPiece.row, selectedPiece.col, row, col);
          render();
        }
      }
    }
    else if (!mustJump) {
      selectedPiece = null;
      render();
    }
  });

  function resetGame() {
    currentPlayer = "W";
    selectedPiece = null;
    mustJump = false;
    gameOver = false;
    setupBoard();
    render();
  }

  const resetBtn = document.getElementById("resetGame");
  if (resetBtn) {
    resetBtn.addEventListener('click', resetGame);
  }

  setupBoard();
  render();

});