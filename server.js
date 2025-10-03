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

// Reference: https://expressjs.com/en/guide/routing.html

app.post("/api/game/create", requireAuth, async (req, res) => {
  // Create ther  board
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
