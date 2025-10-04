
// UPDATED VERSION - Clear browser cache if you see old behavior!
console.log('Login.js loaded - Version 2.0');

document.getElementById('testConnection').addEventListener('click', async () => {
    try {
        console.log('Testing server connection...');
        const response = await fetch('/api/test?v=' + Date.now()); // Cache busting
        
        if (response.ok) {
            const data = await response.json();
            console.log('Test response:', data);
            alert('Server connection successful!\n' + JSON.stringify(data, null, 2));
        } else {
            console.error('Test failed. Status:', response.status);
            alert('Server test failed. Status: ' + response.status);
        }
    } catch (error) {
        console.error('Test error:', error);
        alert('Network error: ' + error.message);
    }
});

document.getElementById('playLocal').addEventListener('click', () => {
    window.location.href = '/checkers.html';
});

document.getElementById('createGame').addEventListener('click', async () => {
    try {
        console.log('=== CREATING NEW GAME ===');
        console.log('Calling endpoint: /api/games');
        
        const response = await fetch('/api/games', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                gameType: 'checkers',
                creator: 'Player1' 
            })
        });

        console.log('Response status:', response.status); 
        console.log('Response URL:', response.url);

        if (response.ok) {
            const data = await response.json();
            console.log('Game created successfully:', data);
            
            const gameCode = data.gameCode || data.gameId.substring(0, 6).toUpperCase();
            
            alert(`GAME CREATED!\n\nYour game code is: ${gameCode}\n\nShare this code with your friend so they can join your game!`);
            
            window.location.href = `/checkers.html?gameId=${data.gameId}&player=white`;
        } else {
            console.error('Failed to create game. Status:', response.status);
            const errorText = await response.text();
            console.error('Error response:', errorText);
            alert('Failed to create game. Check console for details.');
        }
    } catch (error) {
        console.error('Error creating game:', error);
        alert('Network error. Please try again.');
    }
});

document.getElementById('joinGame').addEventListener('click', async () => {
    const gameCode = document.getElementById('gameCode').value.trim().toUpperCase();
    
    if (!gameCode) {
        alert('Please enter a game code');
        return;
    }

    try {
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

document.getElementById('gameCode').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        document.getElementById('joinGame').click();
    }
});
