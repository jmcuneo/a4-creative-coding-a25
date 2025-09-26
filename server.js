const express = require('express');
const app = express();
const PORT = 3000;

app.use( express.static( "public" ) );

// Define a basic route
app.get('/', (req, res) => {
  // res.send('The basic Express server is running!');
  res.sendFile("public", "index.html")
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server listening at http://localhost:${PORT}`);
});