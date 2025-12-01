import { Position } from '../../../shared/types';
/**
 * Система работы с сеткой поля боя
 */
export declare class GridSystem {
    private width;
    private height;
    constructor(width?: number, height?: number);
    /**
     * Проверка валидности позиции
     */
    isValidPosition(pos: Position): boolean;
    /**
     * Расчет Manhattan distance между двумя точками
     */
    calculateDistance(from: Position, to: Position): number;
    /**
     * Расчет Euclidean distance (для диагоналей)
     */
    calculateEuclideanDistance(from: Position, to: Position): number;
    /**
     * Получить все клетки в радиусе
     */
    getCellsInRange(center: Position, range: number): Position[];
    /**
     * Получить соседние клетки (8 направлений)
     */
    getAdjacentCells(pos: Position): Position[];
    /**
     * Проверка прямой видимости между двумя точками (для дальнего боя)
     */
    hasLineOfSight(from: Position, to: Position, occupiedCells: Position[]): boolean;
    /**
     * Алгоритм Bresenham для получения точек линии
     */
    private getLinePoints;
    /**
     * Проверка равенства позиций
     */
    positionsEqual(pos1: Position, pos2: Position): boolean;
}
//# sourceMappingURL=GridSystem.d.ts.map