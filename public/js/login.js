// Simplified multiplayer game interface - no login required

// Play local game
document.getElementById('playLocal').addEventListener('click', () => {
    window.location.href = '/checkers.html';
});

// Create new online game
document.getElementById('createGame').addEventListener('click', async () => {
    try {
        const response = await fetch('/api/games', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                gameType: 'checkers',
                creator: 'Player1' // Simple placeholder since no login
            })
        });

        if (response.ok) {
            const data = await response.json();
            // Generate a shorter, more user-friendly game code
            const gameCode = data.gameId.substring(0, 6).toUpperCase();
            
            alert(`Game created! Share this code with your friend: ${gameCode}`);
            
            // Redirect to game with the full game ID
            window.location.href = `/checkers.html?gameId=${data.gameId}&player=white`;
        } else {
            const error = await response.json();
            alert('Failed to create game: ' + (error.message || 'Unknown error'));
        }
    } catch (error) {
        console.error('Error creating game:', error);
        alert('Network error. Please try again.');
    }
});

// Join existing game
document.getElementById('joinGame').addEventListener('click', async () => {
    const gameCode = document.getElementById('gameCode').value.trim().toUpperCase();
    
    if (!gameCode) {
        alert('Please enter a game code');
        return;
    }

    try {
        // First, try to find the game by searching for games with matching code
        const response = await fetch(`/api/games/${gameCode}/join`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                player: 'Player2'
            })
        });

        if (response.ok) {
            const data = await response.json();
            // Redirect to game as black player
            window.location.href = `/checkers.html?gameId=${data.gameId}&player=black`;
        } else {
            const error = await response.json();
            alert('Failed to join game: ' + (error.message || 'Game not found'));
        }
    } catch (error) {
        console.error('Error joining game:', error);
        alert('Network error. Please try again.');
    }
});

// Allow Enter key to join game
document.getElementById('gameCode').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        document.getElementById('joinGame').click();
    }
});
