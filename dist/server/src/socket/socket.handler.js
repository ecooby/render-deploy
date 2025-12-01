"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SocketHandler = void 0;
const types_1 = require("../../../shared/types");
const BattleManager_1 = require("../game/BattleManager");
const MatchmakingService_1 = require("../services/MatchmakingService");
const BotAI_1 = require("../game/BotAI");
const DatabaseService_1 = require("../services/DatabaseService");
/**
 * Главный обработчик Socket.io соединений
 */
class SocketHandler {
    constructor(io) {
        this.activeBattles = new Map();
        this.playerSockets = new Map(); // playerId -> socketId
        this.io = io;
        this.battleManager = new BattleManager_1.BattleManager();
        this.botAI = new BotAI_1.BotAI(this.battleManager);
        this.matchmakingService = new MatchmakingService_1.MatchmakingService(io, this.battleManager, (gameState) => {
            this.activeBattles.set(gameState.id, gameState);
        });
    }
    /**
     * Инициализация обработчиков
     */
    initialize() {
        this.io.on(types_1.SocketEvent.CONNECT, (socket) => {
            console.log(`Client connected: ${socket.id}`);
            // Получаем ID игрока из handshake
            const playerId = socket.handshake.auth.playerId || socket.id;
            this.playerSockets.set(playerId, socket.id);
            // Регистрируем обработчики событий
            this.registerMatchmakingHandlers(socket, playerId);
            this.registerBattleHandlers(socket, playerId);
            this.registerDisconnectHandler(socket, playerId);
        });
    }
    /**
     * Обработчики matchmaking
     */
    registerMatchmakingHandlers(socket, playerId) {
        // Присоединение к очереди
        socket.on(types_1.SocketEvent.MATCHMAKING_JOIN, () => {
            console.log(`Player ${playerId} joining matchmaking`);
            this.matchmakingService.addToQueue(socket, playerId);
        });
        // Игра с ботом
        socket.on(types_1.SocketEvent.MATCHMAKING_BOT, () => {
            console.log(`Player ${playerId} requested Bot game`);
            const battle = this.battleManager.createBattle(playerId, 'AI_BOT');
            this.activeBattles.set(battle.id, battle);
            socket.emit(types_1.SocketEvent.MATCHMAKING_FOUND, {
                battleId: battle.id,
                opponent: { id: 'AI_BOT', name: 'Bot' },
                yourTeam: types_1.Team.PLAYER1
            });
        });
        // Выход из очереди
        socket.on(types_1.SocketEvent.MATCHMAKING_LEAVE, () => {
            console.log(`Player ${playerId} leaving matchmaking`);
            this.matchmakingService.removeFromQueue(playerId);
        });
    }
    /**
     * Обработчики битвы
     */
    registerBattleHandlers(socket, playerId) {
        // Присоединение к битве
        socket.on(types_1.SocketEvent.BATTLE_JOIN, (battleId) => {
            console.log(`Player ${playerId} joining battle ${battleId}`);
            socket.join(battleId);
            // Отправляем текущее состояние
            const gameState = this.activeBattles.get(battleId);
            if (gameState) {
                socket.emit(types_1.SocketEvent.BATTLE_STATE, gameState);
            }
        });
        // Действие в битве
        socket.on(types_1.SocketEvent.BATTLE_ACTION, (data) => {
            console.log(`Player ${playerId} action in battle ${data.battleId}:`, data.action.type);
            this.processBattleAction(data.battleId, data.action, playerId);
        });
    }
    processBattleAction(battleId, action, playerId) {
        const gameState = this.activeBattles.get(battleId);
        if (!gameState) {
            return;
        }
        // Обработка действия
        const result = this.battleManager.processAction(action, playerId, gameState);
        if (!result.success) {
            // Ошибка - отправляем только игроку
            const socketId = this.playerSockets.get(playerId);
            if (socketId) {
                this.io.to(socketId).emit(types_1.SocketEvent.BATTLE_ERROR, { message: result.error });
            }
            return;
        }
        // Успех - обновляем состояние
        if (result.newState) {
            this.activeBattles.set(battleId, result.newState);
            // Отправляем обновление всем игрокам в битве
            this.io.to(battleId).emit(types_1.SocketEvent.BATTLE_UPDATE, {
                gameState: result.newState,
                action: action,
                damage: result.damage,
                killedCharacterId: result.killedCharacterId,
            });
            // Проверка окончания битвы
            if (result.newState.status === 'finished') {
                this.handleBattleEnd(battleId, result.newState);
            }
            else {
                // Check if it's bot's turn
                if (result.newState.currentTurn === types_1.Team.PLAYER2 && result.newState.player2Id === 'AI_BOT') {
                    this.handleBotTurn(battleId, result.newState);
                }
            }
        }
    }
    async handleBotTurn(battleId, gameState) {
        setTimeout(() => {
            const action = this.botAI.calculateMove(gameState, types_1.Team.PLAYER2);
            this.processBattleAction(battleId, action, 'AI_BOT');
        }, 1000);
    }
    /**
     * Обработчик отключения
     */
    registerDisconnectHandler(socket, playerId) {
        socket.on(types_1.SocketEvent.DISCONNECT, () => {
            console.log(`Client disconnected: ${socket.id} (Player: ${playerId})`);
            // Удаляем из очереди matchmaking
            this.matchmakingService.removeFromQueue(playerId);
            // Удаляем из карты сокетов
            this.playerSockets.delete(playerId);
            // TODO: Обработка отключения во время битвы
            // Можно дать игроку время на переподключение
        });
    }
    /**
     * Обработка окончания битвы
     */
    async handleBattleEnd(battleId, gameState) {
        console.log(`Battle ${battleId} ended. Winner: ${gameState.winner}`);
        // Update player stats in database
        try {
            const winnerId = gameState.winner === types_1.Team.PLAYER1 ? gameState.player1Id : gameState.player2Id;
            const loserId = gameState.winner === types_1.Team.PLAYER1 ? gameState.player2Id : gameState.player1Id;
            // Skip stats update for AI bot
            if (winnerId !== 'AI_BOT') {
                await DatabaseService_1.databaseService.updatePlayerStats(winnerId, {
                    wins: 1,
                    gamesPlayed: 1
                });
            }
            if (loserId !== 'AI_BOT') {
                await DatabaseService_1.databaseService.updatePlayerStats(loserId, {
                    losses: 1,
                    gamesPlayed: 1
                });
            }
            console.log(`Stats updated for battle ${battleId}`);
        }
        catch (error) {
            console.error('Error updating stats:', error);
        }
        // Отправляем результаты
        this.io.to(battleId).emit(types_1.SocketEvent.BATTLE_END, {
            winner: gameState.winner,
            rewards: {
                experience: 100,
                gold: 50,
            },
        });
        // Удаляем битву через некоторое время
        setTimeout(() => {
            this.activeBattles.delete(battleId);
            console.log(`Battle ${battleId} removed from active battles`);
        }, 30000); // 30 секунд
    }
    /**
     * Получить количество онлайн игроков
     */
    getOnlinePlayersCount() {
        return this.io.sockets.sockets.size;
    }
    /**
     * Получить количество активных игр
     */
    getActiveGamesCount() {
        return this.activeBattles.size;
    }
    /**
     * Получить размер очереди matchmaking
     */
    getQueueSize() {
        return this.matchmakingService.getQueueSize();
    }
}
exports.SocketHandler = SocketHandler;
//# sourceMappingURL=socket.handler.js.map