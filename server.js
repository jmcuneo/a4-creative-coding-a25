const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

const distDir = path.join(__dirname, 'dist');
const srcDir = path.join(__dirname, 'src');

// Serve built files if present, otherwise serve source files
if (fs.existsSync(distDir)) {
  app.use(express.static(distDir));
  console.log('Serving static files from /dist');
} else {
  app.use(express.static(srcDir));
  console.log('Serving static files from /src');
}

// Also expose the music folder so audio files load correctly
const musicDir = path.join(__dirname, 'music');
if (fs.existsSync(musicDir)) {
  app.use('/music', express.static(musicDir));
}

// Fallback to index.html for SPA routing
app.get('*', (req, res) => {
  const indexPath = fs.existsSync(path.join(distDir, 'index.html'))
    ? path.join(distDir, 'index.html')
    : path.join(srcDir, 'index.html');
  res.sendFile(indexPath);
});

app.listen(PORT, () => {
  console.log(`Server listening at http://localhost:${PORT}`);
});
