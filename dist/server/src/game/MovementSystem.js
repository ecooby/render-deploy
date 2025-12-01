"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MovementSystem = void 0;
/**
 * Система передвижения персонажей
 */
class MovementSystem {
    constructor(gridSystem) {
        this.gridSystem = gridSystem;
    }
    /**
     * Проверка возможности перемещения
     */
    canMove(character, to, gameState) {
        // Проверка, что персонаж еще не двигался
        if (character.hasMoved) {
            return { valid: false, error: 'Character has already moved this turn' };
        }
        // Проверка валидности позиции
        if (!this.gridSystem.isValidPosition(to)) {
            return { valid: false, error: 'Invalid position' };
        }
        // Проверка, что клетка не занята
        if (this.isCellOccupied(to, gameState.characters)) {
            return { valid: false, error: 'Cell is occupied' };
        }
        // Проверка дистанции
        const distance = this.gridSystem.calculateDistance(character.position, to);
        if (distance > gameState.movementPointsLeft) {
            return { valid: false, error: 'Not enough movement points' };
        }
        // Проверка пути (A* pathfinding)
        const path = this.findPath(character.position, to, gameState.characters);
        if (!path || path.length - 1 > gameState.movementPointsLeft) {
            return { valid: false, error: 'No valid path to destination' };
        }
        return { valid: true };
    }
    /**
     * Выполнить перемещение
     */
    executeMove(character, to, gameState) {
        const distance = this.gridSystem.calculateDistance(character.position, to);
        // Обновляем позицию персонажа
        character.position = to;
        character.hasMoved = true;
        // Уменьшаем очки передвижения
        gameState.movementPointsLeft -= distance;
        return gameState;
    }
    /**
     * Получить все доступные клетки для перемещения
     */
    getAvailableMoves(character, gameState) {
        const available = [];
        const range = gameState.movementPointsLeft;
        // Проверяем все клетки в радиусе
        const cellsInRange = this.gridSystem.getCellsInRange(character.position, range);
        for (const cell of cellsInRange) {
            // Пропускаем текущую позицию
            if (this.gridSystem.positionsEqual(cell, character.position)) {
                continue;
            }
            // Проверяем, можно ли туда переместиться
            const canMove = this.canMove(character, cell, gameState);
            if (canMove.valid) {
                available.push(cell);
            }
        }
        return available;
    }
    /**
     * Проверка занятости клетки
     */
    isCellOccupied(pos, characters) {
        return characters.some(char => char.isAlive && this.gridSystem.positionsEqual(char.position, pos));
    }
    /**
     * A* pathfinding для поиска пути
     */
    findPath(start, goal, characters) {
        // Упрощенная версия A* для демонстрации
        // В production версии можно использовать библиотеку pathfinding.js
        const openSet = [start];
        const cameFrom = new Map();
        const gScore = new Map();
        const fScore = new Map();
        const posKey = (pos) => `${pos.x},${pos.y}`;
        gScore.set(posKey(start), 0);
        fScore.set(posKey(start), this.gridSystem.calculateDistance(start, goal));
        while (openSet.length > 0) {
            // Находим узел с минимальным fScore
            let current = openSet[0];
            let currentIndex = 0;
            for (let i = 1; i < openSet.length; i++) {
                if ((fScore.get(posKey(openSet[i])) || Infinity) < (fScore.get(posKey(current)) || Infinity)) {
                    current = openSet[i];
                    currentIndex = i;
                }
            }
            // Достигли цели
            if (this.gridSystem.positionsEqual(current, goal)) {
                return this.reconstructPath(cameFrom, current);
            }
            openSet.splice(currentIndex, 1);
            // Проверяем соседей
            const neighbors = this.gridSystem.getAdjacentCells(current);
            for (const neighbor of neighbors) {
                // Пропускаем занятые клетки (кроме цели)
                if (!this.gridSystem.positionsEqual(neighbor, goal) &&
                    this.isCellOccupied(neighbor, characters)) {
                    continue;
                }
                const tentativeGScore = (gScore.get(posKey(current)) || Infinity) + 1;
                if (tentativeGScore < (gScore.get(posKey(neighbor)) || Infinity)) {
                    cameFrom.set(posKey(neighbor), current);
                    gScore.set(posKey(neighbor), tentativeGScore);
                    fScore.set(posKey(neighbor), tentativeGScore + this.gridSystem.calculateDistance(neighbor, goal));
                    if (!openSet.some(pos => this.gridSystem.positionsEqual(pos, neighbor))) {
                        openSet.push(neighbor);
                    }
                }
            }
        }
        return null; // Путь не найден
    }
    /**
     * Восстановление пути из карты cameFrom
     */
    reconstructPath(cameFrom, current) {
        const path = [current];
        const posKey = (pos) => `${pos.x},${pos.y}`;
        while (cameFrom.has(posKey(current))) {
            current = cameFrom.get(posKey(current));
            path.unshift(current);
        }
        return path;
    }
}
exports.MovementSystem = MovementSystem;
//# sourceMappingURL=MovementSystem.js.map