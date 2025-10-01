const express = require('express');
const path = require('path');
const app = express();
const PORT = 3000;

app.use( express.static( path.join(__dirname, "public" )));

// Define a basic route
app.use('/three', express.static(path.join(__dirname, 'node_modules/three/build')));
app.use('/jsm', express.static(path.join(__dirname, 'node_modules/three/examples/jsm')));
app.get('/', (req, res) => {
  // res.send('The basic Express server is running!');
  res.sendFile("public", "index.html")
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server listening at http://localhost:${PORT}`);
});