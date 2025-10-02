# Interactive Web Audio Instrument

http://a4-giannirosato-a25.onrender.com

## Overview

This interactive web application combines the Web Audio API with HTML5 Canvas to
create a visual musical instrument. Users can click and drag on the canvas to
play sounds with visual feedback.

Clicking creates a colorful dot that plays sound, while dragging modulates the
sound produced by the dot.

## Features

- Click and drag on the canvas to create sounds
- Each sound generates colorful expanding circles that visualize the audio
- Four adjustable parameters for customizing the sound experience:
  1. Waveform selection (sine, square, sawtooth, triangle)
  2. Volume control
  3. Attack time adjustment
  4. Release time adjustment
- Works on both desktop and mobile devices
- Change sound frequency by moving vertically while dragging

## How to Use

1. Click and drag on the canvas to generate sounds
2. Move vertically to change the pitch (higher pitch at the top)
3. Move horizontally to pan the sound (left/right)
4. Adjust the controls below the canvas to customize your sound:
   - Waveform: Choose the type of sound wave
   - Volume: Control the overall volume
   - Attack: Set how quickly the sound reaches full volume
   - Release: Set how quickly the sound fades out
5. Use the "Clear Canvas" button to reset the visual display

## Technical Details

This application uses:

- **Express.js** for the backend server
- **Web Audio API** for sound synthesis
- **HTML5 Canvas** for visual rendering
- **CSS** for styling
- **JavaScript** for client-side interactivity

## Challenges Faced

- Implementing smooth audio envelope controls (attack and release)
- Synchronizing audio generation with visual feedback
- Creating an intuitive user interface with clear instructions, and making the
  platform seem fun
- Optimizing performance for continuous animation loops
