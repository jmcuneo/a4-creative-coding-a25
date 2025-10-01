Assignment 4 - Creative Coding: Interactive Multimedia Experiences
===
## Falling Bricks Game
A simple 3D browser-based game built with Three.js, where the player controls a cone-shaped character on a square ground plane. Falling blocks/bricks spawn randomly from above, and the player must dodge them to survive. The game tracks score based on survival time (seconds), includes pause and restart functionality, and allows players to adjust settings like ground size, player speed, block speed, and spawn rate via sliders. A leaderboard displays the player names and local session-based high scores dynamically. The game runs in real-time with basic collision detection, lighting, and shadows to enhance the 3D experience.

Render Link: https://a4-shawnpatel.onrender.com/

Baseline Requirements
---

My application (game) has all of the following functionalities:
- A simple Express server that delivers the index.html and static files, acting purely as a frontend host without any backend functionality.
- A client-side interactive experience using Three.js for 3D graphics.
- A user interface for interaction with my game, which exposes four parameters for user control (ground size, player speed, block speed, and spawn rate). There is a slider box that allow these values to be controlled.
- My application displays basic documentation for the user interface when the application first loads. There is a welcome box and enter name prompt to play. In the bottom right there are instructions on how to play the game.


Goal of Application
---
The objective of this application is to create an enjoyable, interactive game that highlights the capabilities of three.js in delivering dynamic 3D graphics and immersive user experiences.

Challenges Faced
---
During development, I encountered several challenges that shaped the way the project came together. One major difficulty was learning and adapting to three.js, as working with 3D graphics required understanding concepts such as scene setup, lighting, and object manipulation. Also, another challenge was handling the collision detection between the falling bricks and the ground or other bricks, ensuring that the stacking logic worked correctly. Another difficulty was keeping the gameplay smooth while multiple objects were rendered and updated in real time. Balancing the speed and difficulty progression of the falling bricks also took some fine-tuning to make the game fun but not impossible.


Instructions
---
- When the game loads, players are greeted with a welcome box where they can enter their name (or any name) to begin. This name is tied to the local leaderboard, which tracks scores only for the current session—meaning it resets whenever the page is refreshed or a new player starts (no database).
- After entering name, the game will start up. The basic instructions are in the bottom left:
    - Use WASD or Arrow Keys to move
    - Press SPACEBAR to pause/resume
    - Avoid the falling blocks!
- The score (tracked in seconds) is displayed in the top left.
- There is a slider in the top right to be able to control the ground size, player speed, block speed, and spawn rate.
- The leaderboard, located in the bottom-right, can be toggled on and off with a click. It ranks all of your attempts from best to worst. The game does not pause automatically when the leaderboard is open, giving players the choice to pause before viewing. To close the leaderboard, simply click anywhere outside of the table or press the leaderboard button again.
