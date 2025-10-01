Lucas Marble colorful version of Conway's Game of Life

Hosting link: https://a4-lucasmarble-a25.onrender.com/

My project is a simple version of Conway's Game of Life. The game's instructions and rules are displayed on the page at all times for anyone unfamiliar with it. Thegoal of the application is to provide a replica of the famous 0-player game. One can change the colors of the cells at any time by adjusting the red, green, and blue sliders to directly change the rgb values. The cells colors update in real time. You can start or stop the program by clicking on the start or pause buttons. And you can adjust the speed of how frequently the next generation shows up by adjusting the speed slider.

Some challenges I faced.

1. It did take a while to figure out exactly how to make the canvas create squares based off of the mouse's position. What I did was that I basically did a floor function to the nearest ten, so that no matter where you clicked in a spot, the spot would always make the same square at the same position.

2. It did take a bit to figure out exactly how to execute the program to create the next generation. You have to go through every single spot, check all of its valid neighbors while ignoring anything outside of the canvas, and calculate how many of its neighbors are alive.

3. The colors did take a little bit to figure out, but it was a lot of fun to allow complete customization of the colors. I just had to make sure that every time the slider was adjusted, it would update the board to display the new colors.

4. The speed was definitely the hardest part to crack down because I wanted to make it so that it would automatically display the next generation without going to fast and potentially crashing the program. I originally wanted to calculate the new board on the server side, but this ended up causing performance issues, especially considering the fact I was using a free deployment from render, so I ended up doing it on the client side instead.


