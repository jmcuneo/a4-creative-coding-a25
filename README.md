https://a4-nicholasdriscoll.onrender.com/ 

Basic Requirements:
So to start off, I created a Checkers base game that I’m going to be using later for a different assignment in RBE 3001, where I’ll have a robot arm physically moving the checker pieces. I needed a way to manipulate the game board digitally so that I had something functional for that project setup. That’s why I spent extra time structuring this properly. I believe I hit all the requirements: it has an Express server, a complete client-side implementation, and it uses both the Canvas API and the Web Audio API to give a better experience for the user.
I added four UI controls, resetting the game, turning sound on and off, changing between dark and light themes, and returning to the main menu. This project was honestly challenging to make. I used a lot of online resources and examples from existing Checkers and Chess games, which are listed below. Originally, I planned to make this using only web APIs and CSS, but as I began researching how I’d integrate it with the robot arm later, I realized Canvas would make it much more flexible.
I documented where AI was used, mostly for the server-side setup. The HTML didn’t need much AI help, and the CSS was inspired by other Checkers designs I found online.
60/60 hit all base requirements

Technical Achievements:
For my technical achievements, I included several interactive and visual features that make the game more polished and functional.
Audio feedback is implemented through the Web Audio API, giving sound effects for specific events,  capturing pieces, winning the game, and promoting a checker piece to a king. I also added a glowing animation for the king piece using Canvas animations. Another achievement was adding theme changing between light and dark, which helps create visual variety and improves user experience.
Lastly, I implemented a basic multiplayer system. It’s not true online play, but more like a peer-to-peer setup where two players can share the same board state, similar in idea to local multiplayer.
Audio implementation - 10
 Multiplayer - 10
 Using Canvas to build board - 5
 Theme light/dark - 5
30/30
For my CSS rules:
For CSS, I changed my usual style and took inspiration from the Checkers and Chess projects I referenced below. I wanted two themes,  a dark theme and a light theme,  that users can toggle by pressing a button.
A lot of this design work came from looking at other websites’ HTML/CSS structures using browser developer tools and learning from how they built their layouts. I used those as references but customized them to fit my own setup.

Design Achievements:
I think the website looks really good and consistent. It supports both dark and light themes that switch smoothly, and the overall layout stays stable during play. The game highlights selected pieces, gives sound feedback, and provides visual clarity for the player’s current state. It’s responsive, organized, and visually clean.
UI look - 5
 Layout and theme consistency - 10
 Canvas not looking bad - 5
 Informing player of current status - 10
 Animation for King - 5
 Multiple HTML pages - 5
40/40


AI Use and Challenges:
Honestly, I didn’t heavily use or manipulate AI in the Index and Login files. Most of that code was just simple one-liners that I filled in while working on other parts of the project. The main use of AI was in the checker.js file,  especially when setting up the game, handling basic functionality, and programming piece movement. I learned a lot from different websites and YouTube videos, but I started getting lost when it came to writing the movement rules. That’s when I turned to AI for help learning and implementing them.
This was the most complex website I’ve ever built. The API and Android Studio projects I worked on before didn’t require anywhere near this level of logic or structure. To be transparent, a lot of the rule logic came from me trying to replicate what others had done, failing repeatedly, breaking my code, and then using VS Code and AI to troubleshoot. I often used AI to generate debugging functions and modifiers because I ran into so many errors, especially around move validation. Those debugging tools helped me catch and log errors in real time while testing.
I clearly marked where AI was used in my code,  it’s most prominent in checker.js. Honestly, I think I relied on it a bit too much there since I don’t have much experience with JavaScript and underestimated how much work it would take. I’ve been trying to move away from relying on AI and make more of the logic my own, and I plan to revisit and improve this assignment as my skills grow.
Before Dickman’s class, I didn’t have a solid grasp of implementing game rules, so AI was a helpful crutch to get the Checkers logic working. It helped the game recognize valid moves and handle rules like promoting to king. Outside of checker.js, AI was mostly used for boilerplate code, quick function creation, or completing variable and function names when I was working quickly. It usually provided good default suggestions, so I used them as a base to build on.
Aside from what I’ve described in the Checkers functions, there wasn’t much AI involvement elsewhere. The server setup was basically the same as my previous assignments. I reused the same cluster setup and just modified it to fit this project. I want to be upfront that a lot of my setup came from my earlier work, and I think that’s worth noting.
Lastly, Grammarly was used for writing this README. I wrote it in Google Docs, and since I always have Grammarly installed, it helped me polish my writing. 


---

resources used:

https://stackoverflow.com/questions/26432492/chessboard-html5-only?__cf_chl_tk=jsH80_y9FPRXvXkAUVbZMa_RXlpab6eozeXH8pe3S24-1759513109-1.0.1.1-fnm9oxOZQI2YF2tuCqNae.5mO7Ba_f3J44FQlUoI_O0 
https://dev.to/hira_zaira/create-a-chessboard-using-css-grid-3iil 
https://cardgames.io/checkers/ 
https://levelup.gitconnected.com/creating-a-board-game-checkers-with-javascript-ecd562f985c2 - stolle how it should look kinda from here 
https://levelup.gitconnected.com/creating-a-board-game-checkers-with-javascript-ecd562f985c2 
https://www.youtube.com/watch?v=moCWc_p9gig   
