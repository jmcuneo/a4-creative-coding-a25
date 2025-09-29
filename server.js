const express = require("express");
const app = express();

// serve everything in /public
app.use(express.static("public"));

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
