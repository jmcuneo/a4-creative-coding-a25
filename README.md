A4 – Kaleidoscope Drawer

Live link: http://localhost:3000
Render Link: https://a4-rayyan-syed.onrender.com 
Repo: https://github.com/RayyanSyed21/a4-Rayyan-Syed

Summary
Kaleidoscope Drawer is an interactive HTML5 Canvas sketch. Your strokes are mirrored into multiple radial segments to produce kaleidoscopic patterns in real time. A control panel (Tweakpane) exposes parameters so anyone can explore different looks quickly. If a CDN is blocked, a built-in fallback control panel appears automatically to ensure at least 4 interactive parameters are still available..

Features
6 interactive controls: segments, stroke width, jitter, trail fade, color mode, hue speed.
On-load instructions: overlay explains usage.
Responsive canvas: fits the window; high-DPI aware.
Quick action: press C to clear.
Robust UI: Tweakpane via CDN with automatic fallback; HTML controls if CDN is blocked.

How to Use
Click Start Drawing on the overlay.  
Drag on the canvas to draw.  
Tune parameters in the Controls panel (top-left).  
Press C to clear.

Tech
Express (server)
HTML5 Canvas (rendering)
Tweakpane (UI) with HTML fallback

Run Locally
```bash
npm install
node server.js or npm start
