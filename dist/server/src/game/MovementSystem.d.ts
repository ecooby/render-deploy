import { Position, Character, GameState } from '../../../shared/types';
import { GridSystem } from './GridSystem';
/**
 * Система передвижения персонажей
 */
export declare class MovementSystem {
    private gridSystem;
    constructor(gridSystem: GridSystem);
    /**
     * Проверка возможности перемещения
     */
    canMove(character: Character, to: Position, gameState: GameState): {
        valid: boolean;
        error?: string;
    };
    /**
     * Выполнить перемещение
     */
    executeMove(character: Character, to: Position, gameState: GameState): GameState;
    /**
     * Получить все доступные клетки для перемещения
     */
    getAvailableMoves(character: Character, gameState: GameState): Position[];
    /**
     * Проверка занятости клетки
     */
    private isCellOccupied;
    /**
     * A* pathfinding для поиска пути
     */
    private findPath;
    /**
     * Восстановление пути из карты cameFrom
     */
    private reconstructPath;
}
//# sourceMappingURL=MovementSystem.d.ts.map