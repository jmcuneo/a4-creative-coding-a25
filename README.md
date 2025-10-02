# Interactive 3D Physics Sandbox

**url:**
https://a4-nathanielschneiders.onrender.com/

## Summary
This project is an interactive 3D physics simulation created with Three.js for Assignment 4.
The goal was to make a way for you to watch a ball bounce using real physics given a random starting speed and direction. You can control different aspects of the simulation.

Users can launch the ball with a random trajectory and watch it obey the laws of gravity, bouncing off the walls and floor. A user interface, built with Tweakpane, allows for real-time control over the simulation's camera and physical properties. The project is built on a simple Express.js server to satisfy the assignment requirements.

**Issues**
For some reason the bounces are less consistent on render than running it locally, not sure why that is but run it a couple times just incase.

## Challenges Faced:
1. Physics Simulation, using the projectile motion formulas, to constantly update the balls position was the least difficult aspect. I also kept confusing the y and z axes, which was a big headache of some strange ball behavior. Getting the physics to look right and have friction and gravity and bouncing correct took a lot of research and soo long to make the formulas work correctly with the code.
2. Making sure that the ball would bounce correctly of the floor and not teleport around or outside of the box, my initial formula was all based on the initial formula and I tried to reset the initial bounce vertical angle as well as the inital vertical velocity vectors using geometry which proved to be incosistent until I found a better way to do it.
3. First frame jump, for a while the ball would teleport around when first launched becuase I didn't understand how the Three.js clock functions fully worked
4. Setting the hard coded variables. This was the easiest and somewhat fun to figure out a good initial velocity range and trying different box sizes and ball sizes that I found worked best.
5. Getting the camera to rotate around the box took being able to convert took some math with cartesian and sphereical coordinate system translations.