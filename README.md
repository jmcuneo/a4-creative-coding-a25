Interactive Audio Visualizer
Live Link: https://a4-guillermowiandt.onrender.com

About The Project
This is an interactive, client-side audio visualizer that uses the Web Audio API to analyze sound and the HTML5 Canvas to render the frequency data in real-time. The goal was to create a responsive multimedia experience controlled by the user. The application is served by a minimal Express.js server.

How to Use
Click "Choose File" to load an MP3 or other audio file from your computer.

Click directly on the canvas visualization to play or pause the audio.

Use the controls below the canvas to change the bar color, number of bars, spacing, and smoothing on the fly.

Development Challenges
The main challenge was synchronizing the Web Audio API's AnalyserNode with the Canvas rendering loop. Specifically, when the user changes the number of bars (the fftSize), the data array holding the frequency information must be recreated with the correct new size. Another hurdle was handling modern browser audio policies, which require the AudioContext to be resumed by a user gesture (like a click) before sound can be processed.