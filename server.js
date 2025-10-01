const express = require('express');
const path = require('path');

const app = express();

// static
app.use(express.static(path.join(__dirname, 'public')));

// root
app.get('/', (_req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// start
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`A4 running on http://localhost:${PORT}`));