import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';
import { SocketHandler } from './socket/socket.handler';
import { authService } from './services/AuthService';


dotenv.config();

const app = express();
const httpServer = createServer(app);


const rawAllowedOrigins = process.env.ALLOWED_ORIGINS;
const allowedOrigins: string | string[] = !rawAllowedOrigins || rawAllowedOrigins === '*'
  ? '*'
  : rawAllowedOrigins.split(',').map(origin => origin.trim());

console.log('🔒 CORS Configuration:');
console.log('  Raw ALLOWED_ORIGINS:', rawAllowedOrigins);
console.log('  Parsed allowedOrigins:', allowedOrigins);

app.use(cors({
  origin: allowedOrigins,
  credentials: true,
}));

app.use(express.json());


const io = new Server(httpServer, {
  cors: {
    origin: allowedOrigins,
    methods: ['GET', 'POST'],
    credentials: true,
  },
});


const socketHandler = new SocketHandler(io);
socketHandler.initialize();

// Auth endpoints
app.post('/api/auth/register', async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password required' });
    }
    const user = await authService.register(username, password);
    res.json(user);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password required' });
    }
    const user = await authService.login(username, password);
    res.json(user);
  } catch (error: any) {
    res.status(401).json({ error: error.message });
  }
});

app.post('/api/auth/guest', async (req, res) => {
  try {
    const user = await authService.guest();
    res.json(user);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// Player stats endpoint
app.get('/api/player/stats/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const stats = await authService.getPlayerStats(userId);
    if (!stats) {
      return res.status(404).json({ error: 'Player not found' });
    }
    res.json(stats);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// API endpoints
app.get('/api/status', (req, res) => {
  res.json({
    playersOnline: socketHandler.getOnlinePlayersCount(),
    activeGames: socketHandler.getActiveGamesCount(),
    playersInQueue: socketHandler.getQueueSize(),
  });
});

const PORT = process.env.PORT || 3000;

httpServer.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📡 WebSocket ready for connections`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  httpServer.close(() => {
    console.log('HTTP server closed');
  });
});
