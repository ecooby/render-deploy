import { Server } from 'socket.io';
/**
 * Главный обработчик Socket.io соединений
 */
export declare class SocketHandler {
    private io;
    private battleManager;
    private matchmakingService;
    private botAI;
    private activeBattles;
    private playerSockets;
    constructor(io: Server);
    /**
     * Инициализация обработчиков
     */
    initialize(): void;
    /**
     * Обработчики matchmaking
     */
    private registerMatchmakingHandlers;
    /**
     * Обработчики битвы
     */
    private registerBattleHandlers;
    private processBattleAction;
    private handleBotTurn;
    /**
     * Обработчик отключения
     */
    private registerDisconnectHandler;
    /**
     * Обработка окончания битвы
     */
    private handleBattleEnd;
    /**
     * Получить количество онлайн игроков
     */
    getOnlinePlayersCount(): number;
    /**
     * Получить количество активных игр
     */
    getActiveGamesCount(): number;
    /**
     * Получить размер очереди matchmaking
     */
    getQueueSize(): number;
}
//# sourceMappingURL=socket.handler.d.ts.map