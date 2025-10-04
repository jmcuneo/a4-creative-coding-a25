const $ = id => document.getElementById(id);

// Play Checkers button - redirect to checkers.html
document.addEventListener('DOMContentLoaded', function() {
    const playBtn = $("playCheckersBtn");
    const loginForm = $("loginForm");
    const createBtn = $("createGame");
    const joinBtn = $("joinGame");

    if (playBtn) {
        playBtn.onclick = () => {
            window.location.href = "checkers.html";
        };
    }

    if (loginForm) {
        loginForm.onsubmit = async e => {
            e.preventDefault();
            const username = $("username").value;
            const password = $("password").value;
            try {
                const res = await fetch("/auth/login", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ username, password })
                });
                const data = await res.json();
                $("loginMessage").textContent = res.ok ? "Login successful! Redirecting to checkers..." : (data.error || "Login failed");
                if (res.ok) {
                    setTimeout(() => {
                        window.location.href = "checkers.html";
                    }, 1500);
                }
            } catch {
                $("loginMessage").textContent = "Server error";
            }
        };
    }

    if (createBtn) {
        createBtn.onclick = async () => {
            const res = await fetch("/api/game/create", { method: "POST" });
            const data = await res.json();
            $("gameStatus").textContent = "Game created. ID: " + data.gameId;
        };
    }

    if (joinBtn) {
        joinBtn.onclick = async () => {
            const id = $("joinGameId").value;
            const res = await fetch("/api/game/join/" + id, { method: "POST" });
            const data = await res.json();
            $("gameStatus").textContent = res.ok ? "Joined game: " + data.gameId : (data.error || "Error joining game");
        };
    }
});