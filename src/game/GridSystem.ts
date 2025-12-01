import { Position, GAME_CONSTANTS } from '../../shared/types';

/**
 * Система работы с сеткой поля боя
 */
export class GridSystem {
  private width: number;
  private height: number;

  constructor(width = GAME_CONSTANTS.GRID_WIDTH, height = GAME_CONSTANTS.GRID_HEIGHT) {
    this.width = width;
    this.height = height;
  }

  /**
   * Проверка валидности позиции
   */
  isValidPosition(pos: Position): boolean {
    return pos.x >= 0 && pos.x < this.width && pos.y >= 0 && pos.y < this.height;
  }

  /**
   * Расчет Manhattan distance между двумя точками
   */
  calculateDistance(from: Position, to: Position): number {
    return Math.abs(from.x - to.x) + Math.abs(from.y - to.y);
  }

  /**
   * Расчет Euclidean distance (для диагоналей)
   */
  calculateEuclideanDistance(from: Position, to: Position): number {
    return Math.sqrt(Math.pow(to.x - from.x, 2) + Math.pow(to.y - from.y, 2));
  }

  /**
   * Получить все клетки в радиусе
   */
  getCellsInRange(center: Position, range: number): Position[] {
    const cells: Position[] = [];

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
   * Получить соседние клетки (4 направления - без диагоналей для движения)
   */
  getAdjacentCells(pos: Position, includeDiagonals = false): Position[] {
    const directions = includeDiagonals
      ? [
          { x: -1, y: -1 }, { x: 0, y: -1 }, { x: 1, y: -1 },
          { x: -1, y: 0 },                   { x: 1, y: 0 },
          { x: -1, y: 1 },  { x: 0, y: 1 },  { x: 1, y: 1 },
        ]
      : [
          { x: 0, y: -1 },
          { x: -1, y: 0 },
          { x: 1, y: 0 },
          { x: 0, y: 1 },
        ];

    return directions
      .map(dir => ({ x: pos.x + dir.x, y: pos.y + dir.y }))
      .filter(p => this.isValidPosition(p));
  }

  /**
   * Проверка прямой видимости между двумя точками (для дальнего боя)
   */
  hasLineOfSight(from: Position, to: Position, occupiedCells: Position[]): boolean {

    const points = this.getLinePoints(from, to);
    

    for (let i = 1; i < points.length - 1; i++) {
      const point = points[i];
      if (occupiedCells.some(cell => cell.x === point.x && cell.y === point.y)) {
        return false;
      }
    }
    
    return true;
  }

  /**
   * Алгоритм Bresenham для получения точек линии
   */
  private getLinePoints(from: Position, to: Position): Position[] {
    const points: Position[] = [];
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

      if (x0 === x1 && y0 === y1) break;

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
  positionsEqual(pos1: Position, pos2: Position): boolean {
    return pos1.x === pos2.x && pos1.y === pos2.y;
  }
}
