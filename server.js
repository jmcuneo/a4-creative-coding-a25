// References
// https://expressjs.com/en/starter/hello-world.html
// https://github.com/expressjs/session
// https://mongoosejs.com/docs/guide.html
// https://github.com/dcodeIO/bcrypt.js
// https://github.com/motdotla/dotenv#readme
// https://nodejs.org/api/esm.html#esm_no_filename_or_dirname
// https://expressjs.com/en/starter/static-files.html
// https://expressjs.com/en/guide/writing-middleware.html
// https://expressjs.com/en/guide/routing.html#route-handlers
// https://expressjs.com/en/api.html#express.json
// https://expressjs.com/en/api.html#res.sendFile
// https://www.npmjs.com/package/helmet
// https://www.npmjs.com/package/morgan
// https://www.npmjs.com/package/connect-mongo
// https://mongoosejs.com/docs/models.html

import dotenv from "dotenv";
import mongoose from "mongoose";
import express from "express";
import session from "express-session";
import MongoStore from "connect-mongo";
import helmet from "helmet";
import morgan from "morgan";
import path from "path";
import { fileURLToPath } from "url";

dotenv.config();

await mongoose.connect(process.env.MONGO_URI);

const app = express();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
}));
app.use(express.json());
app.use(morgan("dev"));

app.use(session({
  secret: process.env.SESSION_SECRET || "secret",
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({ mongoUrl: process.env.MONGO_URI }),
  cookie: { secure: process.env.NODE_ENV === "production" }
}));

// Static file serving
app.use(express.static(path.join(__dirname, "public")));

// Root route → serve index.html
app.get("/", (_req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// Authenticator 
function requireAuth(req, res, next) {
  if (!req.session.userId) {
    return res.status(401).json({ error: "Authentication required" });
  }
  next();
}

// 
const GameSchema = new mongoose.Schema({
  players: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }], 
  board: { type: [[String]], default: [] }, 
  turn: { type: String, default: "W" }, 
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date }
});
GameSchema.pre("save", function(next) {
  this.updatedAt = Date.now();
  next();
});
const Game = mongoose.model("Game", GameSchema);

// https://expressjs.com/en/guide/routing.html

app.post("/api/game/create", requireAuth, async (req, res) => {

  const emptyBoard = Array.from({ length: 8 }, (_, r) =>
    Array.from({ length: 8 }, (_, c) =>
      r < 3 && (r + c) % 2 === 1 ? "W" :
      r > 4 && (r + c) % 2 === 1 ? "B" : ""
    )
  );

  const game = await Game.create({
    players: [req.session.userId],
    board: emptyBoard,
    turn: "W"
  });

  res.json({ ok: true, gameId: game._id });
});


// joint the game
app.post("/api/game/join/:id", requireAuth, async (req, res) => {
  const game = await Game.findById(req.params.id);
  if (!game) return res.status(404).json({ error: "Game not found" });
  if (game.players.length >= 2) return res.status(400).json({ error: "Game full" });

  if (!game.players.includes(req.session.userId)) {
    game.players.push(req.session.userId);
    await game.save();
  }
  res.json({ ok: true, gameId: game._id });
});


// thisb will return the game state
app.get("/api/game/:id", requireAuth, async (req, res) => {
  const game = await Game.findById(req.params.id);
  if (!game) return res.status(404).json({ error: "Game not found" });
  res.json(game);
});


// makes the movbe on the board
app.post("/api/game/:id/move", requireAuth, async (req, res) => {
  const { from, to } = req.body;
  const game = await Game.findById(req.params.id);
  if (!game) return res.status(404).json({ error: "Game not found" });

  const piece = game.board[from.row][from.col];
  if (!piece) return res.status(400).json({ error: "No piece at start" });

  game.board[to.row][to.col] = piece;
  game.board[from.row][from.col] = "";
  game.turn = game.turn === "W" ? "B" : "W";
  await game.save();

  res.json({ ok: true, game });
});

// Simplified API endpoints without authentication

// Create new game (no auth required)
app.post("/api/games", async (req, res) => {
  try {
    const emptyBoard = Array.from({ length: 8 }, (_, r) =>
      Array.from({ length: 8 }, (_, c) =>
        r < 3 && (r + c) % 2 === 1 ? "W" :
        r > 4 && (r + c) % 2 === 1 ? "B" : ""
      )
    );

    const game = await Game.create({
      players: ['Player1'], // Simple placeholder
      board: emptyBoard,
      turn: "W"
    });

    // Generate a more user-friendly 6-character code using only letters/numbers
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Removed confusing chars like 0, O, I, 1
    let gameCode = '';
    for (let i = 0; i < 6; i++) {
      gameCode += chars.charAt(Math.floor(Math.random() * chars.length));
    }

    res.json({ 
      ok: true, 
      gameId: game._id,
      gameCode: gameCode
    });
  } catch (error) {
    console.error('Error creating game:', error);
    res.status(500).json({ error: "Failed to create game" });
  }
});

// Join game by code (no auth required)
app.post("/api/games/:code/join", async (req, res) => {
  try {
    // Find game where the ID starts with the provided code
    const games = await Game.find({});
    const game = games.find(g => 
      g._id.toString().substring(0, 6).toUpperCase() === req.params.code.toUpperCase()
    );
    
    if (!game) {
      return res.status(404).json({ error: "Game not found" });
    }
    
    if (game.players.length >= 2) {
      return res.status(400).json({ error: "Game is full" });
    }

    if (!game.players.includes('Player2')) {
      game.players.push('Player2');
      await game.save();
    }
    
    res.json({ 
      ok: true, 
      gameId: game._id,
      gameCode: req.params.code.toUpperCase()
    });
  } catch (error) {
    console.error('Error joining game:', error);
    res.status(500).json({ error: "Failed to join game" });
  }
});

// Get game state (no auth required)
app.get("/api/games/:id/state", async (req, res) => {
  try {
    const game = await Game.findById(req.params.id);
    if (!game) {
      return res.status(404).json({ error: "Game not found" });
    }
    res.json(game);
  } catch (error) {
    console.error('Error getting game state:', error);
    res.status(500).json({ error: "Failed to get game state" });
  }
});

// Make move (no auth required)
app.post("/api/games/:id/move", async (req, res) => {
  try {
    const { from, to, player } = req.body;
    const game = await Game.findById(req.params.id);
    
    if (!game) {
      return res.status(404).json({ error: "Game not found" });
    }

    const piece = game.board[from.row][from.col];
    if (!piece) {
      return res.status(400).json({ error: "No piece at start" });
    }

    // Basic validation - check if it's the player's turn
    const isWhiteTurn = game.turn === "W";
    const isWhitePiece = piece.toUpperCase().includes("W");
    
    if ((isWhiteTurn && !isWhitePiece) || (!isWhiteTurn && isWhitePiece)) {
      return res.status(400).json({ error: "Not your turn" });
    }

    game.board[to.row][to.col] = piece;
    game.board[from.row][from.col] = "";
    game.turn = game.turn === "W" ? "B" : "W";
    await game.save();

    res.json({ ok: true, game });
  } catch (error) {
    console.error('Error making move:', error);
    res.status(500).json({ error: "Failed to make move" });
  }
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
