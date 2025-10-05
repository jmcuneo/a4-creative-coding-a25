// References:
// https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API
// https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API
// https://developer.mozilla.org/en-US/docs/Web/API/requestAnimationFrame
// https://www.w3schools.com/jsref/jsref_obj_array.asp
// https://en.wikipedia.org/wiki/Draughts

document.addEventListener('DOMContentLoaded', function() {
  const canvas = document.getElementById("board");
  const ctx = canvas.getContext("2d");
  const gameInfo = document.getElementById("gameInfo");

  if (!canvas || !ctx) return;

  const BOARD_SIZE = 8;
  const SQUARE_SIZE = canvas.width / BOARD_SIZE;

  // Web
  
  let audioContext;
  let soundEnabled = true;

  // Audio 
  
  function initAudio() {
    try {
      audioContext = new (window.AudioContext || window.webkitAudioContext)();
    } catch (e) {
      console.log('Web Audio API not supported');
      soundEnabled = false;
    }
  }

  function playSound(frequency, duration, type = 'sine') {
    if (!soundEnabled || !audioContext) return;
    
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime);
    oscillator.type = type;
    
    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + duration);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + duration);
  }

  // Sound effectts
  function playMoveSound() {
    playSound(400, 0.1, 'triangle'); 
  }

  function playCaptureSound() {
    playSound(200, 0.2, 'square'); 
  }

  function playKingSound() {
    playSound(500, 0.15, 'sine');
    setTimeout(() => playSound(600, 0.15, 'sine'), 100);
    setTimeout(() => playSound(700, 0.15, 'sine'), 200);
  }

  function playGameOverSound(winner) {
    if (winner === 'W') {
      playSound(523, 0.2, 'sine'); 
      setTimeout(() => playSound(659, 0.2, 'sine'), 200); 
      setTimeout(() => playSound(784, 0.3, 'sine'), 400); 
    } else {
      playSound(440, 0.2, 'sine'); // A
      setTimeout(() => playSound(554, 0.2, 'sine'), 200); 
      setTimeout(() => playSound(659, 0.3, 'sine'), 400); 
    }
  }

  // Audio 
  function enableAudio() {
    if (!audioContext) {
      initAudio();
      document.removeEventListener('click', enableAudio);
      document.removeEventListener('keydown', enableAudio);
    }
  }
  document.addEventListener('click', enableAudio);
  document.addEventListener('keydown', enableAudio);

  // Game 
  let board = [];
  let currentPlayer = "W"; 
  let selectedPiece = null;
  let mustJump = false;
  let gameOver = false;

  // Win 
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
      gameInfo.textContent = "BLACK WINS!";
      playGameOverSound('B');
      return true;
    }
    if (blackPieces === 0 || !blackCanMove) {
      gameOver = true;
      gameInfo.textContent = "WHITE WINS!";
      playGameOverSound('W');
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

  // Movement stuff
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

  // Movement upfdates
  function makeMove(fromRow, fromCol, toRow, toCol) {
    const piece = board[fromRow][fromCol];
    const wasKing = piece.includes("K");
    
    board[toRow][toCol] = piece;
    board[fromRow][fromCol] = "";
    
    let becameKing = false;
    if ((piece.includes("W") && toRow === BOARD_SIZE - 1) || 
        (piece.includes("B") && toRow === 0)) {
      board[toRow][toCol] = piece[0] + "K";
      becameKing = !wasKing;
      if (becameKing) {
        playKingSound();
      }
    }
    
    const rowDiff = Math.abs(toRow - fromRow);
    let wasCaptured = false;
    if (rowDiff === 2) {
      const captureRow = fromRow + (toRow - fromRow) / 2;
      const captureCol = fromCol + (toCol - fromCol) / 2;
      board[captureRow][captureCol] = "";
      wasCaptured = true;
      playCaptureSound();
      
      if (canJump(toRow, toCol, board[toRow][toCol])) {
        selectedPiece = { row: toRow, col: toCol };
        mustJump = true;
        return false;
      }
    } else if (!becameKing) {
      playMoveSound();
    }
    
    selectedPiece = null;
    mustJump = false;
    currentPlayer = currentPlayer[0] === "W" ? "B" : "W";
    
    if (checkWinCondition()) {
      return true;
    }
    
    return true;
  }

  // Board stufdf
  function setupBoard() {
    board = [];
    let whiteCount = 0, blackCount = 0;
    
    for (let row = 0; row < BOARD_SIZE; row++) {
      board[row] = [];
      for (let col = 0; col < BOARD_SIZE; col++) {
        if ((row + col) % 2 === 1) {
          if (row < 3) {
            board[row][col] = "W"; 
            whiteCount++;
          } else if (row > 4) {
            board[row][col] = "B";  
            blackCount++;
          } else {
            board[row][col] = "";   
          }
        } else {
          board[row][col] = "";     
        }
      }
    }
  }

  // Canvas drawing
  function drawBoard() {
    const isLightTheme = document.body.classList.contains('light-theme');
    
    for (let row = 0; row < BOARD_SIZE; row++) {
      for (let col = 0; col < BOARD_SIZE; col++) {
        const x = col * SQUARE_SIZE;
        const y = row * SQUARE_SIZE;
        
        if ((row + col) % 2 === 0) {
          // Light squares
          ctx.fillStyle = isLightTheme ? "#ffffff" : "#f0f0f0";  
        } else {
          // Dark squares
          ctx.fillStyle = isLightTheme ? "#8B4513" : "#2d2d2d";  
        }
        ctx.fillRect(x, y, SQUARE_SIZE, SQUARE_SIZE);

        if (selectedPiece && selectedPiece.row === row && selectedPiece.col === col) {
          ctx.fillStyle = isLightTheme ? "rgba(255, 165, 0, 0.7)" : "rgba(255, 255, 0, 0.7)";
          ctx.fillRect(x + 2, y + 2, SQUARE_SIZE - 4, SQUARE_SIZE - 4);
        }
      }
    }
  }

  // Piece rendering with visual effects
  function drawPieces() {
    let pieceCount = 0;
    const isLightTheme = document.body.classList.contains('light-theme');
    
    for (let row = 0; row < BOARD_SIZE; row++) {
      for (let col = 0; col < BOARD_SIZE; col++) {
        const piece = board[row][col];
        if (piece) {
          pieceCount++;
          
          const x = col * SQUARE_SIZE + SQUARE_SIZE / 2;
          const y = row * SQUARE_SIZE + SQUARE_SIZE / 2;
          const radius = SQUARE_SIZE * 0.35;
          
          ctx.beginPath();
          ctx.arc(x, y, radius, 0, Math.PI * 2);
          
          // Adjust piece colors based on theme
          if (piece.includes("W")) {
            ctx.fillStyle = isLightTheme ? "#f8f8f8" : "white";
            ctx.strokeStyle = isLightTheme ? "#444" : "#333";
          } else {
            ctx.fillStyle = isLightTheme ? "#2c2c2c" : "#1a1a1a";
            ctx.strokeStyle = isLightTheme ? "#ddd" : "#fff";
          }
          
          ctx.fill();
          ctx.lineWidth = 3;
          ctx.stroke();

          if (piece.includes("K")) {
            const time = Date.now() * 0.003; 
            const glowIntensity = 0.5 + 0.5 * Math.sin(time);
            
            ctx.save();
            ctx.shadowColor = '#FFD700';
            ctx.shadowBlur = 15 * glowIntensity;
            ctx.shadowOffsetX = 0;
            ctx.shadowOffsetY = 0;
            
            ctx.strokeStyle = `rgba(255, 215, 0, ${0.8 + 0.2 * glowIntensity})`;
            ctx.lineWidth = 4;
            ctx.beginPath();
            ctx.arc(x, y, radius * 0.7, 0, Math.PI * 2);
            ctx.stroke();
            
            ctx.fillStyle = `rgba(255, 215, 0, ${0.9 + 0.1 * glowIntensity})`;
            ctx.font = `bold ${SQUARE_SIZE * 0.4}px Arial`;
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            ctx.fillText("K", x, y);
            
            ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
            ctx.shadowBlur = 2;
            ctx.shadowOffsetY = 2;
            ctx.fillStyle = piece.includes("W") ? "#B8860B" : "#DAA520";
            ctx.fillText("K", x, y);
            
            ctx.restore();
          }
        }
      }
    }
  }

  function render() {
    drawBoard();
    if (board && board.length > 0) { 
      drawPieces();
    }
    if (!gameOver) {
      gameInfo.textContent = `Current Player: ${currentPlayer.includes("W") ? "White" : "Black"}${mustJump ? " - Must Jump!" : ""}`;
    }
  }

  // Animation
  function animate() {
    render();
    requestAnimationFrame(animate);
  }

  // Game startup
  function initGame() {
    setupBoard();
    animate();
  }

  
  initGame();

  // Click suff
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

  // restert the game
  function resetGame() {
    currentPlayer = "W";
    selectedPiece = null;
    mustJump = false;
    gameOver = false;
    setupBoard();
    render();
  }

  // UI shit
  const resetBtn = document.getElementById("resetGame");
  if (resetBtn) {
    resetBtn.addEventListener('click', resetGame);
  }

  const soundBtn = document.getElementById("toggleSound");
  if (soundBtn) {
    soundBtn.addEventListener('click', function() {
      soundEnabled = !soundEnabled;
      soundBtn.textContent = `Sound: ${soundEnabled ? 'ON' : 'OFF'}`;
      if (soundEnabled && !audioContext) {
        initAudio();
      }
    });
  }

  // Theme toggle functionality
  const themeBtn = document.getElementById("toggleTheme");
  if (themeBtn) {
    themeBtn.addEventListener('click', function() {
      const body = document.body;
      const isLightTheme = body.classList.contains('light-theme');
      
      if (isLightTheme) {
        body.classList.remove('light-theme');
        themeBtn.textContent = '🌞 Light Theme';
      } else {
        body.classList.add('light-theme');
        themeBtn.textContent = '🌙 Dark Theme';
      }
    });
  }

  // Back to menu functionality
  const backBtn = document.getElementById("backToMenu");
  if (backBtn) {
    backBtn.addEventListener('click', function() {
      window.location.href = '/';
    });
  }

});