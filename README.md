

## Web Audio Visualizer

https://a4-colinlemire.onrender.com/
---

# Project Description

This project is a web application which plays and visualizes an mp3 file using Canvas and Web Audio API. The website will load you to a page with a button to start the visualizer. The webpage will give you a warning as well, but when you click the button the audio will immediately start to play, so you may want to turn your volume down before hitting the button. Once the button is pressed, a black background will be loaded in on which the audio will be visualized. You will also be presented with 4 interactive objects below the image - a bar to control the time in the song and the audio level (turning the audio down will also reduce the size of the audio being visualized), a button to randomize the color of the visualization, a dropdown menu to change how the audio is visualized (bars, waveform, or radially), and two buttons to either increase or decrease the bar size in the visualization without affecting the audio level.

My biggest challenge while making this application was definitely making the different types of visualization forms work. The different types of visualizations are very difficult to make, with a lot of math needed to figure out how to properly display the audio. I used the two websites below to help me with the different types of audio visualization. I followed the guide on the professors Github to make the default 'bars' variation

While the website is easily navigable by itself, I think it is worth saying that if you use this code locally, all you have to do to change the song is swap the mp3 file being used. The audio is loaded in on line 50 in main.js - if you wish to change the song, feel free. I used many different songs before settling on 'Black Cow' by Steely Dan

https://www.hollyland.com/blog/tips/make-audio-visualizer - Radial
https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API/Visualizations_with_Web_Audio_API - Waveform
