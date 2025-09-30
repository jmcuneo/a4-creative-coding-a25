// express sv
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// stat host
app.use(express.static(path.join(__dirname, 'public')));

// health check again, otherwise render gets mad
app.get('/health', (_req, res) => res.status(200).send('ok'));

app.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});
