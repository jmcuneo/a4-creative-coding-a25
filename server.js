const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// This line tells Express to serve files from the 'public' folder
app.use(express.static(path.join(__dirname, 'public')));

app.listen(PORT, () => {
  console.log(`🚀 Server is running at http://localhost:${PORT}`);
});