Assignment 4 - Creative Coding: Interactive Multimedia Experiences
===

For this assignment we will focus on client-side development using popular audio/graphics/visualization technologies. The goal of this assignment is to refine our JavaScript knowledge while exploring the multimedia capabilities of the browser.

[WebAudio / Canvas Tutorial](https://github.com/jmcuneo/cs4241-guides/blob/main/using.webaudio_and_canvas.md)  
[SVG + D3 tutorial](https://github.com/jmcuneo/cs4241-guides/blob/main/using.svg_and_d3.md)  

Baseline Requirements
---

Your application is required to implement the following functionalities:

- A server created using Express. This server can be as simple as needed.
- A client-side interactive experience using at least one of the following web technologies frameworks.
  - [Three.js](https://threejs.org/): A library for 3D graphics / VR experiences
  - [D3.js](https://d3js.org): A library that is primarily used for interactive data visualizations
  - [Canvas](https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API): A 2D raster drawing API included in all modern browsers
  - [SVG](https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API): A 2D vector drawing framework that enables shapes to be defined via XML.
  - [Web Audio API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API): An API for audio synthesis, analysis, processing, and file playback.
- A user interface for interaction with your project, which must expose at least four parameters for user control. [tweakpane](https://cocopon.github.io/tweakpane/) is highly recommended for this, but you can also use regular HTML `<input>` tags (the `range` type is useful to create sliders). You might also explore interaction by tracking mouse movement via the `window.onmousemove` event handler in tandem with the `event.clientX` and `event.clientY` properties. Consider using the [Pointer Events API](https://developer.mozilla.org/en-US/docs/Web/API/Pointer_events) to ensure that that both mouse and touch events will both be supported in your app.
- Your application should display basic documentation for the user interface when the application first loads.

The interactive experience should possess a reasonable level of complexity. Some examples:
### Three.js
- A generative algorithm creates simple agents that move through a virtual world. Your interface controls the behavior / appearance of these agents.
- A simple 3D game. You really want this to be a simple as possible or it will be outside the scope of this assignment.
- An 3D audio visualization of a song of your choosing. User interaction should control aspects of the visualization. 
### Canvas
- Implement a generative algorithm such as [Conway's Game of Life](https://bitstorm.org/gameoflife/) (or 1D cellular automata) and provide interactive controls. Note that the Game of Life has been created by 100s of people using `<canvas>`; we'll be checking to ensure that your implementation is not a copy of these.
- Design a 2D audio visualizer of a song of your choosing. User interaction should control visual aspects of the experience. 
### Web Audio API
- Create a screen-based musical instrument using the Web Audio API. You can use projects such as [Interface.js](http://charlie-roberts.com/interface/) or [Nexus UI](https://nexus-js.github.io/ui/api/#Piano) to provide common musical interface elements, or use dat.GUI in combination with mouse/touch events (use the Pointer Events API). Your GUI should enable users to control aspects of sound synthesis. If you want to use higher-level instruments instead of the raw WebAudio API sounds, consider trying the instruments provided by [Tone.js]() or [Gibber](https://github.com/charlieroberts/gibber.audio.lib).
### D3.js
- Create visualizations using the datasets found at [Awesome JSON Datasets](https://github.com/jdorfman/Awesome-JSON-Datasets). Experiment with providing different visualizations of the same data set, and providing users interactive control over visualization parameters and/or data filtering. Alternatively, create a single visualization with using one of the more complicated techniques shown at [d3js.org](d3js.org) and provide meaningful points of interaction for users.

Deliverables
---

Do the following to complete this assignment:

1. Implement your project with the above requirements.
3. Test your project to make sure that when someone goes to your main page on Render, etc., it displays correctly.
4. Ensure that your project has the proper naming scheme `a4-firstname-lastname` so we can find it.
5. Fork this repository and modify the README to the specifications below. 
6. Create and submit a Pull Request to the original repo. Name the pull request using the following template: `a4-firstname-lastname`.

Sample Readme (delete the above when you're ready to submit, and modify the below so with your links and descriptions)
---

## Ecosystem Simulator
Arianna Xie
your hosting link e.g. http://a4-charlieroberts.glitch.me

![Start Screen](images/startScreen.png)

The goal of this project is to simulate a simple ecosystem with just predators and prey. Predators (large, pink spheres) chase the prey (small, dark blue spheres) closest to them. Prey move randomly until they come close to a predator. In that case, they run away. Predators gain energy from consuming prey. When they run out of energy, they die. Predators also shrink in size as they "starve." On the other hand, prey can reproduce after a set time.

![Simulation showing "predators" and "prey"](images/sim.png)

The parameters to this simulation are:
- Initial Prey Count: the number of prey initally spawned
- Prey Speed: the speed at which prey move
- Prey Reproduction Rate: how often each prey can reproduce (in seconds)
- Predator Count: the number of predators
- Predator Speed: the speed at which predators move
- Predator Max Energy: the amount of time (in seconds) predators have to find prey
![Tweakpane GUI](images/gui.png)

Note on AI Use: I used ChatGPT to debug problems I faced like the "prey" not moving as anticipated or the "prey" not reproducing according to real time.

Main Challenge: Since there's so much information in Three.js's documentation, I had to Google a lot of what I wanted to do and see if anything came up that could help. 
For example, I had to Google things like how to set a random position for an object, how to move towards another object, how to add random movements to objects, how to integrate a GUI, how to add buttons to the GUI, and a lot more. From there, I would look at the documentation for specific functions that would come up to understand them.
Also, since I had to work a lot with vectors to set the direction and movement of the prey and predators, I had to refresh my mind on concepts like normalization.