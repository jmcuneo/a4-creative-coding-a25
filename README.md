Assignment 4 - Creative Coding: Interactive Multimedia Experiences
## Mahoney's Game of Life
https://a4-gracemahoney.onrender.com

Mahoney's Game of Life is an interactive 2d cellular automata that resembles Conway's Game of Life. Each cell is alive (1) or dead (0). At each generation, rules apply based on 8 neighbors:

### Overcrowding Rule
![Overcrowding Example](images/overcrowding.png)  
*Cells with 8 neighbors die due to overcrowding.*

### Loneliness Rule
![Loneliness Example](images/loneliness.png)  
*Cells with fewer than 2 neighbors die due to loneliness.*

### Hysteria Rule
![Hysteria Example](images/hysteria.png)  
*Even number of neighbors increases chance of hysteria (i.e., death).*

### Summoning Rule
![Summoning Example](images/summoning.png)  
*Dead cells with all 4 diagonal neighbors alive are born.*

### Random Revival Rule
![Random Revival Example](images/random_revival.png)  
*Dead cells with exactly 2 neighbors have a 10% chance of coming alive.*

### Conga Rule
![Conga Example](images/conga.png)  
*Cells with 7 neighbors die and rebirth is transferred to the dead neighboring cell.*

## Goal of the Application
The goal was to allow users to randomize the grid, paint alive cells, step through generations, and adjust simulation speed.

## References
https://www.w3schools.com/jsref/jsref_every.asp
https://conwaylife.com/
