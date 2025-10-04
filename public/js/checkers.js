console.log("Loading checkers game...");

document.addEventListener('DOMContentLoaded', function() {
  console.log("DOM ready, starting game...");

  const canvas = document.getElementById("board");
  const ctx = canvas.getContext("2d");
  const gameInfo = document.getElementById("gameInfo");

  if (!canvas || !ctx) {
    console.error("Canvas not found!");
    return;
  }

  const BOARD_SIZE = 8;
  const SQUARE_SIZE = canvas.width / BOARD_SIZE;
  

  let board = [];
  let currentPlayer = "W"; 
  let selectedPiece = null;

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
    console.log("Board setup complete");
  }

  function drawBoard() {
    for (let row = 0; row < BOARD_SIZE; row++) {
      for (let col = 0; col < BOARD_SIZE; col++) {
        const x = col * SQUARE_SIZE;
        const y = row * SQUARE_SIZE;
        
        if ((row + col) % 2 === 0) {
          ctx.fillStyle = "#f0f0f0";  
        } else {
          ctx.fillStyle = "#8B4513";  
        }
        ctx.fillRect(x, y, SQUARE_SIZE, SQUARE_SIZE);

        if (selectedPiece && selectedPiece.row === row && selectedPiece.col === col) {
          ctx.fillStyle = "yellow";
          ctx.fillRect(x + 5, y + 5, SQUARE_SIZE - 10, SQUARE_SIZE - 10);
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
          const radius = SQUARE_SIZE * 0.3;
          
          ctx.beginPath();
          ctx.arc(x, y, radius, 0, Math.PI * 2);
          ctx.fillStyle = piece === "W" ? "white" : "red";
          ctx.fill();
          ctx.strokeStyle = "black";
          ctx.lineWidth = 2;
          ctx.stroke();
        }
      }
    }
  }

  function render() {
    drawBoard();
    drawPieces();
    gameInfo.textContent = `Current Player: ${currentPlayer === "W" ? "White" : "Black"}`;
  }

  function render() {
    drawBoard();
    drawPieces();
    gameInfo.textContent = `Current Player: ${currentPlayer === "W" ? "White" : "Black"}`;
  }

  canvas.addEventListener('click', function(e) {
    const rect = canvas.getBoundingClientRect();
    const col = Math.floor((e.clientX - rect.left) / SQUARE_SIZE);
    const row = Math.floor((e.clientY - rect.top) / SQUARE_SIZE);
    
    console.log(`Clicked: row ${row}, col ${col}`);
    
    const piece = board[row][col];
    
    if (piece === currentPlayer) {
      selectedPiece = { row, col };
      console.log(`Selected piece at ${row}, ${col}`);
      render();
    }
    else if (selectedPiece && !piece && (row + col) % 2 === 1) {
      const rowDiff = Math.abs(row - selectedPiece.row);
      const colDiff = Math.abs(col - selectedPiece.col);
      
      if (rowDiff === 1 && colDiff === 1) {
        if ((currentPlayer === "W" && row > selectedPiece.row) || 
            (currentPlayer === "B" && row < selectedPiece.row)) {
          
          board[row][col] = board[selectedPiece.row][selectedPiece.col];
          board[selectedPiece.row][selectedPiece.col] = "";
          currentPlayer = currentPlayer === "W" ? "B" : "W";
          selectedPiece = null;
          
          console.log("Regular move successful!");
          render();
        } else {
          console.log("Wrong direction!");
        }
      }
      else if (rowDiff === 2 && colDiff === 2) {
        if ((currentPlayer === "W" && row > selectedPiece.row) || 
            (currentPlayer === "B" && row < selectedPiece.row)) {
          
         const middleRow = selectedPiece.row + (row - selectedPiece.row) / 2;
          const middleCol = selectedPiece.col + (col - selectedPiece.col) / 2;
          const middlePiece = board[middleRow][middleCol];
          
          if (middlePiece && middlePiece !== currentPlayer) {
         board[row][col] = board[selectedPiece.row][selectedPiece.col];  // Move piece
            board[selectedPiece.row][selectedPiece.col] = "";               // Clear origin
            board[middleRow][middleCol] = "";                               // Remove captured piece
            
            currentPlayer = currentPlayer === "W" ? "B" : "W";
            selectedPiece = null;
            
            console.log(`Jump successful! Captured ${middlePiece} at ${middleRow}, ${middleCol}`);
            render();
          } else {
            console.log("No piece to capture or can't capture own piece!");
          }
        } else {
          console.log("Wrong jump direction!");
        }
      }
      else {
        console.log("Invalid move distance! Must be 1 square (move) or 2 squares (jump)");
      }
    }
    else {
      selectedPiece = null;
      render();
    }
  });

  setupBoard();
  render();
  console.log("Simple checkers game ready!");

});