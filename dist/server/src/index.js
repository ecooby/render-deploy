"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const http_1 = require("http");
const socket_io_1 = require("socket.io");
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const socket_handler_1 = require("./socket/socket.handler");
const AuthService_1 = require("./services/AuthService");
// Загрузка переменных окружения
dotenv_1.default.config();
const app = (0, express_1.default)();
const httpServer = (0, http_1.createServer)(app);
// Настройка CORS
const rawAllowedOrigins = process.env.ALLOWED_ORIGINS;
const allowedOrigins = !rawAllowedOrigins || rawAllowedOrigins === '*'
    ? '*'
    : rawAllowedOrigins.split(',');
app.use((0, cors_1.default)({
    origin: allowedOrigins,
    credentials: true,
}));
app.use(express_1.default.json());
// Socket.io с CORS
const io = new socket_io_1.Server(httpServer, {
    cors: {
        origin: allowedOrigins,
        methods: ['GET', 'POST'],
        credentials: true,
    },
});
// Инициализация Socket handler
const socketHandler = new socket_handler_1.SocketHandler(io);
socketHandler.initialize();
// Auth endpoints
app.post('/api/auth/register', async (req, res) => {
    try {
        const { username, password } = req.body;
        if (!username || !password) {
            return res.status(400).json({ error: 'Username and password required' });
        }
        const user = await AuthService_1.authService.register(username, password);
        res.json(user);
    }
    catch (error) {
        res.status(400).json({ error: error.message });
    }
});
app.post('/api/auth/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        if (!username || !password) {
            return res.status(400).json({ error: 'Username and password required' });
        }
        const user = await AuthService_1.authService.login(username, password);
        res.json(user);
    }
    catch (error) {
        res.status(401).json({ error: error.message });
    }
});
app.post('/api/auth/guest', async (req, res) => {
    try {
        const user = await AuthService_1.authService.guest();
        res.json(user);
    }
    catch (error) {
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
        const stats = await AuthService_1.authService.getPlayerStats(userId);
        if (!stats) {
            return res.status(404).json({ error: 'Player not found' });
        }
        res.json(stats);
    }
    catch (error) {
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
//# sourceMappingURL=index.js.map