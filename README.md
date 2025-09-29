# 3D Audio Visualizer - Interactive Multimedia Experience

**Live Demo:** 

## Project Overview

This project is a 3D audio visualizer that combines Three.js 3D graphics with the Web Audio API to create an immersive, interactive multimedia experience. The application responds dynamically to audio input, creating beautiful particle-based visualizations that dance and morph in real time with the music.

### Goals of the Application

- Create an engaging 3D audio-reactive visualization using modern web technologies
- Provide intuitive user controls for customizing the visual experience
- Demonstrate the power of combining Three.js with Web Audio API
- Offer both file-based audio input and generated test tones for accessibility

## Features

### Core Technologies Used
- **Three.js**: 3D graphics rendering and particle system
- **Web Audio API**: Real-time audio analysis and processing
- **Express.js**: Simple server for hosting the application

### Interactive Controls (4+ Parameters)
1. **Sensitivity Control**: Adjusts how responsive the visualization is to audio frequency data
2. **Particle Count**: Dynamically changes the number of visual particles (50-500)
3. **Rotation Speed**: Controls the speed of scene rotation (0-2x speed)
4. **Color Scheme**: Color picker to change the primary visualization color
5. **Mouse Interaction**: Move mouse to control camera angle and perspective

### Audio Features
- Load custom audio files (MP3, WAV, etc.)
- Play/pause controls for loaded audio
- Generate test tone for immediate visualization without audio files
- Real-time frequency analysis with 256-point FFT

### Visual Features
- 3D particle system with spherical distribution
- Audio-reactive scaling and movement
- Dynamic color intensity based on frequency data
- Smooth camera controls with mouse interaction
- Ambient and point lighting for enhanced 3D effect

## Technical Implementation

### Challenges Faced

1. **Web Audio API Context Management**: Handling browser autoplay policies and audio context states required careful initialization timing and user interaction triggers.

2. **Performance Optimization**: Managing 100-500 particles with real-time audio analysis while maintaining smooth 60fps required optimized rendering and efficient data structures.

3. **Cross-browser Compatibility**: Ensuring Web Audio API compatibility across different browsers, especially handling webkit prefixes and different audio context implementations.

4. **Real-time Synchronization**: Synchronizing audio analysis with visual updates required careful frame timing and buffer management.

5. **User Experience Design**: Creating intuitive controls that provide meaningful visual changes without overwhelming users with complexity.

## Instructions for Use

### Getting Started
1. Load the application in a modern web browser
2. Review the instruction panel on the right side of the screen
3. Either upload an audio file or generate a test tone to begin

### Controls
- **Load Audio File**: Click to upload MP3, WAV, or other audio files
- **Play/Pause**: Control audio playback
- **Sensitivity**: Adjust how dramatically the visualization responds to audio
- **Particle Count**: Increase/decrease the number of visual elements
- **Rotation Speed**: Control scene rotation speed
- **Color Scheme**: Click the color picker to change visualization colors
- **Generate Test Tone**: Create a sine wave with frequency sweeps for testing
- **Mouse Movement**: Move mouse around the screen to control camera angle

### Tips for Best Experience
- Use audio files with dynamic range (varied volume/frequency) for best visual effects
- Start with default settings and adjust sensitivity based on your audio
- Try different color schemes to match the mood of your music
- The visualization responds differently to different frequency ranges

## Installation and Setup

1. Clone or download the project files
2. Install dependencies: `npm install`
3. Start the server: `npm start`
4. Open browser to `http://localhost:3000`

## Browser Requirements

- Modern browser with Web Audio API support (Chrome, Firefox, Safari, Edge)
- WebGL support for Three.js rendering
- File API support for audio file loading

## Educational Value

This project demonstrates several important web development concepts:
- Client-side multimedia programming
- Real-time data visualization
- 3D graphics programming
- Audio processing and analysis
- User interface design for creative applications
- Performance optimization for real-time applications

## AI Statement

ChatGPT was used as a resource similar to Google, StackOverflow, and other online documentation. Specifically, it was used to ask for

- Clarification of the assignment requirements.
- Examples of how Three.js is used
- Ideas for how to implement the technical and design achievement
- Readme formatting

---

*Developed as part of CS4241 Assignment 4 - Creative Coding: Interactive Multimedia Experiences*