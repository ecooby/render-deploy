"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GridSystem = void 0;
const types_1 = require("../../../shared/types");
/**
 * Система работы с сеткой поля боя
 */
class GridSystem {
    constructor(width = types_1.GAME_CONSTANTS.GRID_WIDTH, height = types_1.GAME_CONSTANTS.GRID_HEIGHT) {
        this.width = width;
        this.height = height;
    }
    /**
     * Проверка валидности позиции
     */
    isValidPosition(pos) {
        return pos.x >= 0 && pos.x < this.width && pos.y >= 0 && pos.y < this.height;
    }
    /**
     * Расчет Manhattan distance между двумя точками
     */
    calculateDistance(from, to) {
        return Math.abs(from.x - to.x) + Math.abs(from.y - to.y);
    }
    /**
     * Расчет Euclidean distance (для диагоналей)
     */
    calculateEuclideanDistance(from, to) {
        return Math.sqrt(Math.pow(to.x - from.x, 2) + Math.pow(to.y - from.y, 2));
    }
    /**
     * Получить все клетки в радиусе
     */
    getCellsInRange(center, range) {
        const cells = [];
        for (let x = 0; x < this.width; x++) {
            for (let y = 0; y < this.height; y++) {
                const pos = { x, y };
                if (this.calculateDistance(center, pos) <= range) {
                    cells.push(pos);
                }
            }
        }
        return cells;
    }
    /**
     * Получить соседние клетки (8 направлений)
     */
    getAdjacentCells(pos) {
        const directions = [
            { x: -1, y: -1 }, { x: 0, y: -1 }, { x: 1, y: -1 },
            { x: -1, y: 0 }, { x: 1, y: 0 },
            { x: -1, y: 1 }, { x: 0, y: 1 }, { x: 1, y: 1 },
        ];
        return directions
            .map(dir => ({ x: pos.x + dir.x, y: pos.y + dir.y }))
            .filter(p => this.isValidPosition(p));
    }
    /**
     * Проверка прямой видимости между двумя точками (для дальнего боя)
     */
    hasLineOfSight(from, to, occupiedCells) {
        // Используем алгоритм Bresenham для проверки линии
        const points = this.getLinePoints(from, to);
        // Проверяем, нет ли препятствий на пути (кроме начальной и конечной точки)
        for (let i = 1; i < points.length - 1; i++) {
            const point = points[i];
            if (occupiedCells.some(cell => cell.x === point.x && cell.y === point.y)) {
                return false; // Путь заблокирован
            }
        }
        return true;
    }
    /**
     * Алгоритм Bresenham для получения точек линии
     */
    getLinePoints(from, to) {
        const points = [];
        let x0 = from.x;
        let y0 = from.y;
        const x1 = to.x;
        const y1 = to.y;
        const dx = Math.abs(x1 - x0);
        const dy = Math.abs(y1 - y0);
        const sx = x0 < x1 ? 1 : -1;
        const sy = y0 < y1 ? 1 : -1;
        let err = dx - dy;
        while (true) {
            points.push({ x: x0, y: y0 });
            if (x0 === x1 && y0 === y1)
                break;
            const e2 = 2 * err;
            if (e2 > -dy) {
                err -= dy;
                x0 += sx;
            }
            if (e2 < dx) {
                err += dx;
                y0 += sy;
            }
        }
        return points;
    }
    /**
     * Проверка равенства позиций
     */
    positionsEqual(pos1, pos2) {
        return pos1.x === pos2.x && pos1.y === pos2.y;
    }
}
exports.GridSystem = GridSystem;
//# sourceMappingURL=GridSystem.js.map