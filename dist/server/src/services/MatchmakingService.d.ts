import { Server, Socket } from 'socket.io';
import { GameState } from '../../../shared/types';
import { BattleManager } from '../game/BattleManager';
/**
 * Сервис поиска матчей
 */
export declare class MatchmakingService {
    private queue;
    private battleManager;
    private io;
    private onBattleCreated?;
    constructor(io: Server, battleManager: BattleManager, onBattleCreated?: (gameState: GameState) => void);
    /**
     * Добавить игрока в очередь
     */
    addToQueue(socket: Socket, playerId: string, rating?: number): void;
    /**
     * Удалить игрока из очереди
     */
    removeFromQueue(playerId: string): void;
    /**
     * Попытка найти матч для игрока
     */
    private tryMatchPlayers;
    /**
     * Создать матч между двумя игроками
     */
    private createMatch;
    /**
     * Получить размер очереди
     */
    getQueueSize(): number;
    /**
     * Очистить очередь (для тестирования)
     */
    clearQueue(): void;
}
//# sourceMappingURL=MatchmakingService.d.ts.map