"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MatchmakingService = void 0;
const types_1 = require("../../../shared/types");
/**
 * Сервис поиска матчей
 */
class MatchmakingService {
    constructor(io, battleManager, onBattleCreated) {
        this.queue = new Map();
        this.io = io;
        this.battleManager = battleManager;
        this.onBattleCreated = onBattleCreated;
    }
    /**
     * Добавить игрока в очередь
     */
    addToQueue(socket, playerId, rating = 1000) {
        // Проверка, не в очереди ли уже
        if (this.queue.has(playerId)) {
            socket.emit(types_1.SocketEvent.BATTLE_ERROR, { message: 'Already in queue' });
            return;
        }
        const player = {
            id: playerId,
            socketId: socket.id,
            rating,
            joinedAt: new Date(),
        };
        this.queue.set(playerId, player);
        console.log(`Player ${playerId} joined matchmaking queue`);
        // Попытка найти матч
        this.tryMatchPlayers(player);
    }
    /**
     * Удалить игрока из очереди
     */
    removeFromQueue(playerId) {
        if (this.queue.has(playerId)) {
            this.queue.delete(playerId);
            console.log(`Player ${playerId} left matchmaking queue`);
        }
    }
    /**
     * Попытка найти матч для игрока
     */
    tryMatchPlayers(player) {
        // Ищем подходящего противника
        for (const [opponentId, opponent] of this.queue) {
            // Пропускаем самого игрока
            if (opponentId === player.id)
                continue;
            // Проверка разницы в рейтинге (±200)
            const ratingDiff = Math.abs(player.rating - opponent.rating);
            if (ratingDiff > 200)
                continue;
            // Найден подходящий противник!
            this.createMatch(player, opponent);
            return;
        }
        // Противник не найден, ждем в очереди
        console.log(`No opponent found for player ${player.id}, waiting...`);
    }
    /**
     * Создать матч между двумя игроками
     */
    createMatch(player1, player2) {
        // Удаляем игроков из очереди
        this.queue.delete(player1.id);
        this.queue.delete(player2.id);
        // Создаем битву
        const gameState = this.battleManager.createBattle(player1.id, player2.id);
        // Уведомляем внешний код о создании новой битвы (для регистрации в activeBattles)
        if (this.onBattleCreated) {
            this.onBattleCreated(gameState);
        }
        console.log(`Match created: ${player1.id} vs ${player2.id}`);
        // Уведомляем игроков
        const player1Socket = this.io.sockets.sockets.get(player1.socketId);
        const player2Socket = this.io.sockets.sockets.get(player2.socketId);
        if (player1Socket && player2Socket) {
            // Присоединяем к комнате битвы
            player1Socket.join(gameState.id);
            player2Socket.join(gameState.id);
            // Отправляем уведомления
            const matchFoundPlayer1 = {
                battleId: gameState.id,
                opponent: {
                    id: player2.id,
                    name: `Player ${player2.id.substring(0, 8)}`,
                },
                yourTeam: types_1.Team.PLAYER1,
            };
            const matchFoundPlayer2 = {
                battleId: gameState.id,
                opponent: {
                    id: player1.id,
                    name: `Player ${player1.id.substring(0, 8)}`,
                },
                yourTeam: types_1.Team.PLAYER2,
            };
            player1Socket.emit(types_1.SocketEvent.MATCHMAKING_FOUND, matchFoundPlayer1);
            player2Socket.emit(types_1.SocketEvent.MATCHMAKING_FOUND, matchFoundPlayer2);
            // Отправляем начальное состояние игры
            this.io.to(gameState.id).emit(types_1.SocketEvent.BATTLE_STATE, gameState);
        }
    }
    /**
     * Получить размер очереди
     */
    getQueueSize() {
        return this.queue.size;
    }
    /**
     * Очистить очередь (для тестирования)
     */
    clearQueue() {
        this.queue.clear();
    }
}
exports.MatchmakingService = MatchmakingService;
//# sourceMappingURL=MatchmakingService.js.map