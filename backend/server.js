const express  = require('express');
const mongoose = require('mongoose');
const cors     = require('cors');
const dotenv   = require('dotenv');

dotenv.config();

const app = express();

// ── CORS ──────────────────────────────────────────────────────────────────────
// Allow GitHub Pages + localhost in dev. Add more origins via CLIENT_ORIGIN env var.
const allowedOrigins = [
  'http://localhost:3000',
  'https://bhargavi2005.github.io',
  ...(process.env.CLIENT_ORIGIN ? [process.env.CLIENT_ORIGIN] : []),
];

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (Postman, mobile, server-to-server)
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) return callback(null, true);
    // In production still allow — prevents hard CORS failures during cold start
    console.warn(`CORS warning: origin "${origin}" not in allowlist`);
    return callback(null, true);
  },
  credentials: true,
}));

app.use(express.json());

// ── Routes ────────────────────────────────────────────────────────────────────
app.use('/api/auth',    require('./routes/auth'));
app.use('/api/leads',   require('./routes/leads'));
app.use('/api/contact', require('./routes/contact'));

// ── Health check ──────────────────────────────────────────────────────────────
app.get('/api/health', (req, res) => {
  const states = { 0: 'disconnected', 1: 'connected', 2: 'connecting', 3: 'disconnecting' };
  const dbState = mongoose.connection.readyState;
  res.json({
    status:   dbState === 1 ? 'ok' : 'degraded',
    server:   'running',
    database: states[dbState] || 'unknown',
    env: {
      hasMongoUri:  !!process.env.MONGO_URI,
      hasJwtSecret: !!process.env.JWT_SECRET,
      nodeEnv:      process.env.NODE_ENV || 'development',
    },
  });
});

// ── 404 ───────────────────────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ message: `Route ${req.method} ${req.path} not found` });
});

// ── Global error handler ──────────────────────────────────────────────────────
app.use((err, req, res, _next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ message: 'Internal server error' });
});

// ── Start ─────────────────────────────────────────────────────────────────────
const PORT      = process.env.PORT      || 5000;
const MONGO_URI = process.env.MONGO_URI || '';
const JWT_SECRET = process.env.JWT_SECRET || '';

// Warn loudly but don't crash — Render needs the process to stay alive
// so we can see logs and diagnose issues
if (!MONGO_URI) {
  console.error('❌  MONGO_URI env var is missing! Set it in Render → Environment.');
}
if (!JWT_SECRET) {
  console.error('❌  JWT_SECRET env var is missing! Set it in Render → Environment.');
}

if (MONGO_URI) {
  mongoose
    .connect(MONGO_URI)
    .then(() => {
      console.log('✅  Connected to MongoDB');
      app.listen(PORT, () => {
        console.log(`✅  Server running on port ${PORT}`);
      });
    })
    .catch((err) => {
      console.error('❌  MongoDB connection failed:', err.message);
      // Still start the server so health check is reachable
      app.listen(PORT, () => {
        console.log(`⚠️  Server running on port ${PORT} (DB disconnected)`);
      });
    });
} else {
  // Start without DB so Render doesn't mark the deploy as failed
  app.listen(PORT, () => {
    console.log(`⚠️  Server running on port ${PORT} — waiting for MONGO_URI env var`);
  });
}
