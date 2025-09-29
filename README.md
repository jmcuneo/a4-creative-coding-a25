Digital Cosmic Audio Art:
Live Demo: http://localhost:3000
 (replace with hosted link if deployed)

Project Summary:
Generative Audio Art is an interactive web application that visualizes music as a dynamic starfield with orbiting, pulsating planets. Users can upload any audio file, and the planets respond to the volume and bass of the music, creating a unique audiovisual experience. The interface also allows users to customize the number of planets, rotation speed, sensitivity to audio, and color palette.

Goal of the Application:
- Transform audio into an engaging visual experience in real-time.
- Combine creative coding techniques with audio analysis for interactive digital art.
- Provide an intuitive interface where users can manipulate visual properties.

Key Features:
- Upload any audio file (MP3, WAV, etc.) and watch planets dance across the stars.
- Adjustable controls for number of planets, rotation speed, sensitivity, and color palette.
- Dynamic night sky that twinkles and reacts subtly to overall audio volume.
- Pulsating planets and rings respond to bass frequencies.

Challenges Faced:
- Ensuring planets remain visible and correctly positioned during rotation and audio-reactive scaling.
- Handling audio file upload and real-time frequency analysis using the Web Audio API.
- Creating smooth animations while keeping performance stable for large numbers of stars and planets.
- Designing gradients and shadows for planets that visually respond to audio without breaking.

How to Use:
- Clone or download the repository.
- Run the server with: node server.js
- Open your browser and navigate to http://localhost:3000.
- Upload an audio file using the file input in the top-left panel.
- Adjust the sliders at the bottom-left panel to customize the experience.
- Enjoy the interactive, music-driven starfield and orbiting planets!

Additional Notes:
- Works best with modern browsers (Chrome, Firefox, Edge).
- High audio volumes and fast rotation speeds may create more intense visual effects.
- The color palette changes dynamically for the planets but the stars remain white for contrast.