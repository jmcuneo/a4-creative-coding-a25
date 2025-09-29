const express = require('express');
const path = require('path');
const app = express();

// Serve static files from the public directory
app.use(express.static(path.join(__dirname, 'public')));

// Main route - serve the audio visualizer
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({ 
        status: 'OK', 
        message: '3D Audio Visualizer Server Running',
        timestamp: new Date().toISOString()
    });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
});

// 404 handler
app.use((req, res) => {
    res.status(404).send('Page not found');
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`🎵 3D Audio Visualizer server running on port ${PORT}`);
    console.log(`📱 Open http://localhost:${PORT} to view the application`);
});

module.exports = app;