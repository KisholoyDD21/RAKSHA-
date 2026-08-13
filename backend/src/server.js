import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import { createServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';

import { runSeed } from './db/seed.js';
import { notFoundHandler, errorHandler } from './middleware/errorHandler.js';

import incidentsRouter from './routes/incidents.js';
import facilitiesRouter from './routes/facilities.js';
import broadcastsRouter from './routes/broadcasts.js';
import sosRouter from './routes/sos.js';
import familyRouter from './routes/family.js';
import routingRouter from './routes/routing.js';
import aiRouter from './routes/ai.js';
import adminRouter from './routes/admin.js';
import alertRouter from './routes/alert.js';

const PORT = process.env.PORT || 5000;
// Comma-separated list, e.g. "https://raksha.vercel.app,https://raksha-git-main-you.vercel.app"
const CORS_ORIGINS = (process.env.CORS_ORIGIN || 'http://localhost:5173')
  .split(',')
  .map((s) => s.trim())
  .filter(Boolean);

const app = express();
const httpServer = createServer(app);
const io = new SocketIOServer(httpServer, {
  cors: { origin: CORS_ORIGINS, methods: ['GET', 'POST'] },
});

app.set('io', io);

app.use(cors({ origin: CORS_ORIGINS }));
app.use(express.json({ limit: '5mb' })); // accommodates base64 incident photos
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

app.use('/api/incidents', incidentsRouter);
app.use('/api/facilities', facilitiesRouter);
app.use('/api/broadcasts', broadcastsRouter);
app.use('/api/sos', sosRouter);
app.use('/api/family', familyRouter);
app.use('/api/routing', routingRouter);
app.use('/api/ai', aiRouter);
app.use('/api/admin', adminRouter);
app.use('/api/alert', alertRouter);

app.use(notFoundHandler);
app.use(errorHandler);

io.on('connection', (socket) => {
  socket.emit('connected', { message: 'Connected to RAKSHA realtime channel' });
});

async function start() {
  const counts = await runSeed();
  httpServer.listen(PORT, () => {
    console.log(`\n  RAKSHA backend listening on http://localhost:${PORT}`);
    console.log(`  Seed data: ${counts.facilities} facilities, ${counts.incidents} incidents, ${counts.broadcasts} broadcasts`);
    console.log(`  CORS origins: ${CORS_ORIGINS.join(', ')}`);
    console.log(`  AI assistant: ${process.env.ANTHROPIC_API_KEY ? 'live (Anthropic API key found)' : 'rule-based fallback (no ANTHROPIC_API_KEY set)'}\n`);
  });
}

start().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
