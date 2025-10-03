import express from "express";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname  = path.dirname(__filename);

const app  = express();
const PORT = process.env.PORT || 3000;

app.use(express.static(path.join(__dirname, "public")));

app.use("/nes", express.static(path.join(__dirname, "node_modules", "nes.css")));

app.use("/tone", express.static(path.join(__dirname, "node_modules", "tone", "build")));

app.listen(PORT, () => {
  console.log(`Listening at http://localhost:${PORT}`);
});
