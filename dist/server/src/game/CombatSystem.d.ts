import { Character, GameState, Position } from '../../../shared/types';
import { GridSystem } from './GridSystem';
/**
 * Система боя
 */
export declare class CombatSystem {
    private gridSystem;
    constructor(gridSystem: GridSystem);
    /**
     * Проверка возможности атаки
     */
    canAttack(attacker: Character, target: Character, gameState: GameState): {
        valid: boolean;
        error?: string;
    };
    /**
     * Выполнить атаку
     */
    executeAttack(attacker: Character, target: Character, gameState: GameState): {
        damage: number;
        killed: boolean;
    };
    /**
     * Расчет урона с учетом брони и экипировки
     */
    private calculateDamage;
    /**
     * Получить доступные цели для атаки
     */
    getAvailableTargets(attacker: Character, gameState: GameState): Character[];
    /**
     * Получить позиции доступных целей
     */
    getAvailableTargetPositions(attacker: Character, gameState: GameState): Position[];
    /**
     * Проверка окончания боя
     */
    checkBattleEnd(gameState: GameState): {
        ended: boolean;
        winner?: string;
    };
}
//# sourceMappingURL=CombatSystem.d.ts.map