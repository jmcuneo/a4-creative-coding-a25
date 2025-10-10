// server.js — A4 + Bridge (moves queue + live stream)
import express from "express";
import cors from "cors";
import morgan from "morgan";
import path from "path";
import fs from "fs";
import fse from "fs-extra";
import http from "http";
import { WebSocketServer } from "ws";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(morgan("dev"));
app.use(cors({ origin: true }));
app.use(express.json({ limit: "25mb" }));

// --- static (what you already had) ---
app.use(express.static("./"));
app.use(express.static(path.join(__dirname, "public")));

// ===== Bridge: cloud queue (in-memory + optional file mirror) =====
const QUEUE_FILE = process.env.QUEUE_FILE || path.join(__dirname, "queue.jsonl"); // Cross-platform safe
try {
  fse.ensureFileSync(QUEUE_FILE);
} catch (err) {
  console.warn("Could not create queue file:", err.message);
}

let q = [];     // in-memory queue
let nextId = 1;

function enqueue(item) {
  const rec = { id: nextId++, ts: Date.now(), ...item };
  q.push(rec);
  try {
    fs.appendFileSync(QUEUE_FILE, JSON.stringify(rec) + "\n");
  } catch (err) {
    console.warn("Could not write to queue file:", err.message);
  }
  wakeWaiters();
  return rec;
}

// long-poll waiters for /api/next
const waiters = new Set();
function wakeWaiters() {
  for (const res of Array.from(waiters)) {
    try { res.json({ ok: true, move: q[0] || null }); } catch {}
    waiters.delete(res);
  }
}

// ===== REST endpoints =====

// health
app.get("/api/health", (req, res) => res.json({ ok: true, queueSize: q.length }));

// Browser -> enqueue a move
// body: { from:"E2", to:"E4", meta?:{...} }
app.post("/api/move", (req, res) => {
  const { from, to, meta = {} } = req.body || {};
  if (!from || !to) return res.status(400).json({ error: "from/to required (A1..H8)" });
  const rec = enqueue({ from: String(from).toUpperCase(), to: String(to).toUpperCase(), meta });
  console.log(`Move queued: ${rec.from} -> ${rec.to}`, meta);
  broadcast({ type: "status", text: `Move queued ${rec.from} -> ${rec.to}` });
  res.json({ ok: true, id: rec.id });
});

// MATLAB polls for next move (immediate if available; else long-poll ~20s)
app.get("/api/next", (req, res) => {
  const move = q[0] || null;
  if (move) return res.json({ ok: true, move });
  req.setTimeout(25000);
  waiters.add(res);
});

// MATLAB acknowledges head-of-queue when finished
// body: { id }
app.post("/api/ack", (req, res) => {
  const { id } = req.body || {};
  const head = q[0];
  if (head && head.id === id) {
    q.shift();
    return res.json({ ok: true });
  }
  return res.status(409).json({ ok: false, error: "head mismatch or empty" });
});

// Debug: peek at first few moves
app.get("/api/peek", (req, res) => res.json({ ok: true, queue: q.slice(0, 10) }));

// MATLAB can POST a base64 frame for the /live viewer
// body: { image: "data:image/jpeg;base64,...", status?: "text" }
app.post("/api/frame", (req, res) => {
  const { image, status = null } = req.body || {};
  if (!image || !/^data:image\/(png|jpeg);base64,/.test(image)) {
    return res.status(400).json({ error: "image dataURL required" });
  }
  broadcast({ type: "frame", image, ts: Date.now() });
  if (status) broadcast({ type: "status", text: status });
  res.json({ ok: true });
});

// ===== WebSocket hub for /live =====
const server = http.createServer(app);
const wss = new WebSocketServer({ server, path: "/stream" });
const clients = new Set();
wss.on("connection", (ws) => {
  console.log("WebSocket client connected");
  clients.add(ws);
  ws.on("close", () => {
    console.log("WebSocket client disconnected");
    clients.delete(ws);
  });
});

function broadcast(obj) {
  const msg = JSON.stringify(obj);
  for (const ws of clients) {
    try { ws.send(msg); } catch {}
  }
}

// Render exposes PORT via env; fall back to 3000 locally
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server + Bridge on http://localhost:${PORT}`);
  console.log(`Queue file: ${QUEUE_FILE}`);
  console.log(`Available endpoints:`);
  console.log(`  GET  /                     - Static files`);
  console.log(`  GET  /checkers.html        - Checkers game`);
  console.log(`  GET  /live.html            - Live stream viewer`);
  console.log(`  POST /api/move             - Submit move`);
  console.log(`  GET  /api/next             - Poll for next move`);
  console.log(`  POST /api/ack              - Acknowledge move`);
  console.log(`  GET  /api/peek             - View queue`);
  console.log(`  POST /api/frame            - Submit frame`);
  console.log(`  WS   /stream               - WebSocket live feed`);
});
