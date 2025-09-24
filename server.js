const express = require("express");
const path = require("path");
const app = express();
const port = 3000;

// Serve static files
app.use(express.static(path.join(__dirname, "public")));

// Serve Three.js modules directly
app.use(
    "/build/",
    express.static(path.join(__dirname, "node_modules/three/build"))
);
app.use(
    "/jsm/",
    express.static(path.join(__dirname, "node_modules/three/examples/jsm"))
);

app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.listen(port, () => {
    console.log(`Three.js app listening at http://localhost:${port}`);
});
