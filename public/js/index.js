const $ = id => document.getElementById(id);

console.log("Index.js loaded - Version 2.0, setting up handlers...");

document.addEventListener('DOMContentLoaded', function() {
    
    const playLocalBtn = $("playLocal");
    if (playLocalBtn) {
        console.log("Play Local button found, attaching click handler");
        playLocalBtn.onclick = () => {
            console.log("Play Local button clicked - navigating to checkers.html");
            window.location.href = "checkers.html";
        };
    }

    const createBtn = $("createGame");
    if (createBtn) {
        console.log("Create Game button found, attaching NEW click handler");
        createBtn.onclick = async () => {
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
        };
    } else {
        console.error("Create Game button NOT found!");
    }

    const joinBtn = $("joinGame");
    if (joinBtn) {
        console.log("Join Game button found, attaching NEW click handler");
        joinBtn.onclick = async () => {
            const gameCode = $("gameCode").value.trim().toUpperCase();
            
            if (!gameCode) {
                alert('Please enter a game code');
                return;
            }

            try {
                console.log('=== JOINING GAME ===');
                console.log('Game code:', gameCode);
                
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
                    console.log('Joined game successfully:', data);
                    
                    alert(`JOINED GAME!\n\nGame code: ${gameCode}`);
                    
                    window.location.href = `/checkers.html?gameId=${data.gameId}&player=black`;
                } else {
                    const error = await response.json();
                    console.error('Failed to join game:', error);
                    alert('Failed to join game: ' + (error.error || 'Game not found'));
                }
            } catch (error) {
                console.error('Error joining game:', error);
                alert('Network error. Please try again.');
            }
        };
    } else {
        console.error("Join Game button NOT found!");
    }
});