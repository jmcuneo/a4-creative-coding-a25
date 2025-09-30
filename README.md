Interactive Audio Visualizer

Live Link: https://a4-guillermowiandt.onrender.com

About The Project
It is an interactive, client-side audio visualizer that utilizes the Web Audio API to process audio and the HTML5 Canvas to display the frequency data in real-time. The goal was to have a responsive multimedia experience controlled by the user. The app is served by a minimal Express.js server.

How to Use
Click "Choose File" to upload an MP3 or another sound file on your desktop.

Click directly on the canvas visualization to play or stop the sound.

Modify bar color, number of bars, spacing, and smoothing on-the-fly using controls at the bottom of the canvas.

Development Challenges
The main work was synchronizing the Web Audio API AnalyserNode with the Canvas rendering loop. Specifically, when the user changes the number of bars (the fftSize), the data array of frequency data needs to be reinitialized with the correct new size. The second hindrance was working around modern browser sound policies, which require that the AudioContext must be resumed through a user gesture (e.g., a click) before it can process sound.