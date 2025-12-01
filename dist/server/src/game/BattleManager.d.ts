import { GameState, Character, BattleAction, ActionResult } from '../../../shared/types';
/**
 * Главный менеджер битвы
 */
export declare class BattleManager {
    private gridSystem;
    private movementSystem;
    private combatSystem;
    private turnManager;
    constructor();
    /**
     * Создать новую битву
     */
    createBattle(player1Id: string, player2Id: string): GameState;
    /**
     * Обработка действия игрока
     */
    processAction(action: BattleAction, playerId: string, gameState: GameState): ActionResult;
    /**
     * Обработка перемещения
     */
    private handleMove;
    /**
     * Обработка атаки
     */
    private handleAttack;
    /**
     * Обработка завершения хода
     */
    private handleEndTurn;
    /**
     * Создание персонажей по умолчанию
     */
    private createDefaultCharacters;
    /**
     * Получить доступные действия для персонажа
     */
    getAvailableActions(characterId: string, gameState: GameState): {
        canMove: boolean;
        availableMoves: import("../../../shared/types").Position[];
        canAttack: boolean;
        availableTargets: Character[];
    } | null;
}
//# sourceMappingURL=BattleManager.d.ts.map