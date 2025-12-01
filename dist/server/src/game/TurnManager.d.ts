import { GameState, Team } from '../../../shared/types';
/**
 * Менеджер ходов
 */
export declare class TurnManager {
    /**
     * Начать новый ход
     */
    startTurn(gameState: GameState): GameState;
    /**
     * Завершить текущий ход и передать ход противнику
     */
    endTurn(gameState: GameState): GameState;
    /**
     * Проверка, может ли игрок совершать действия
     */
    canAct(playerId: string, gameState: GameState): boolean;
    /**
     * Получить команду игрока
     */
    getPlayerTeam(playerId: string, gameState: GameState): Team | null;
    /**
     * Проверка, остались ли доступные действия
     */
    hasActionsLeft(gameState: GameState): boolean;
    /**
     * Автоматическое завершение хода, если нет доступных действий
     */
    autoEndTurnIfNeeded(gameState: GameState): GameState;
    /**
     * Получить информацию о текущем ходе
     */
    getTurnInfo(gameState: GameState): {
        currentTeam: Team;
        turnNumber: number;
        movementPointsLeft: number;
        hasActionsLeft: boolean;
    };
}
//# sourceMappingURL=TurnManager.d.ts.map