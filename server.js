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
const GameSchema = new mongoose.Schema({
  players: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }], // max 2
  board: { type: [[String]], default: [] }, // 2D array ["", "W", "B", "WK", "BK"]
  turn: { type: String, default: "W" }, // "W" or "B"
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date }
});
GameSchema.pre("save", function(next){ this.updatedAt = Date.now(); next(); });
const Game = mongoose.model("Game", GameSchema);


app.post("/api/game/create", requireAuth, async (req, res) => {
  const emptyBoard = Array(8).fill(null).map(()=>Array(8).fill(""));

  for (let r = 0; r < 3; r++) {
    for (let c = 0; c < 8; c++) {
      if ((r+c) % 2 === 1) emptyBoard[r][c] = "W";
    }
  }
  for (let r = 5; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      if ((r+c) % 2 === 1) emptyBoard[r][c] = "B";
    }
  }

  const game = await Game.create({
    players: [req.session.userId],
    board: emptyBoard,
    turn: "W"
  });

  res.json({ ok: true, gameId: game._id });
});

