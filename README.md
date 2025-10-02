# Audio Particles - 3D Visualization

**Live Demo:** https://a4-aanangoyal.onrender.com


## Project Overview

Audio Particles is a 3D audio-reactive particle visualization built with Three.js and the Web Audio API. The application creates a dynamic particle system that responds to uploaded music in real-time, where particles expand and contract based on the audio's frequency and amplitude.

## Goal of the Application

The goal was to create an engaging visual experience that bridges audio and graphics programming. Users can upload any audio file and watch as thousands of particles move through 3D space, reacting to the music's intensity. The application provides interactive controls to customize the visual experience, allowing users to adjust particle behavior, appearance, and audio sensitivity to create their preferred aesthetic.

## Challenges Faced

**Audio Context Initialization**  
Modern browsers block audio contexts until user interaction occurs. This required implementing a suspended state check and manual resumption when the user clicks play, ensuring the audio context properly initializes only after user engagement.

**Performance Optimization**  
Initially, rendering 5000 particles with audio analysis caused noticeable frame drops. The solution involved using BufferGeometry instead of standard geometry, storing velocities as flat arrays, and minimizing calculations within the animation loop. Setting the default to 2000 particles balanced visual impact with smooth performance.

**Audio Reactivity Balance**  
Finding the right balance for audio-driven particle movement was tricky—particles either barely responded or flew off-screen. Adding a sensitivity control and implementing boundary checks that reset particles to the center created a natural "breathing" effect where the system expands with the music while maintaining visual cohesion.

## How to Use

The interface includes controls for:
- **Audio upload** - accepts MP3 and WAV files
- **Particle count** - adjusts density (100-5000 particles)
- **Movement speed** - controls base particle velocity
- **Audio sensitivity** - determines reaction strength to music
- **Color scheme** - five different visual themes

Drag your mouse to rotate the camera and view the particles from different angles. For best results, use music with strong bass and dynamic range.

## Technologies

- Three.js (r128) for 3D rendering
- Web Audio API for frequency analysis
- Express.js for server
- Pointer Events API for mouse/touch interaction

Note: AI (Claude) was used to help understand audio context initialization issues and understand Three.js BufferGeometry documentation. AI assisted with clarifying Web Audio API concepts and suggesting performance optimization approaches for particle rendering. All code was written and implemented independently.
