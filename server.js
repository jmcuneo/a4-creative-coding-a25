// server.js
const express = require('express');
const path = require("path");
const app = express();
const PORT = process.env.PORT || 3000; // Use environment port or default to 3000

// Middleware to parse JSON request bodies
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public'))); // serve 'public' folder

// Example route
app.get('/', (req, res) => {
    // res.send('Hello from Express server!');
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Example POST route
app.post('/data', (req, res) => {
    const data = req.body;
    res.json({ message: 'Data received', data });
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
