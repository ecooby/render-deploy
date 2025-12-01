import { Position, Character, GameState, GAME_CONSTANTS } from '../../shared/types';
import { GridSystem } from './GridSystem';

/**
 * Система передвижения персонажей
 */
export class MovementSystem {
  private gridSystem: GridSystem;

  constructor(gridSystem: GridSystem) {
    this.gridSystem = gridSystem;
  }

  /**
   * Проверка возможности перемещения
   */
  canMove(
    character: Character,
    to: Position,
    gameState: GameState
  ): { valid: boolean; error?: string } {
    // Проверка, что персонаж еще не двигался
    if (character.hasMoved) {
      return { valid: false, error: 'Character has already moved this turn' };
    }

    // Проверка валидности позиции
    if (!this.gridSystem.isValidPosition(to)) {
      return { valid: false, error: 'Invalid position' };
    }

    // Проверка, что целевая клетка не занята ДРУГИМ персонажем
    const targetOccupiedByOther = gameState.characters.some(
      char => char.isAlive && 
              char.id !== character.id && 
              this.gridSystem.positionsEqual(char.position, to)
    );
    
    if (targetOccupiedByOther) {
      return { valid: false, error: 'Cell is occupied by another character' };
    }

    // Проверка пути (A* pathfinding)
    const path = this.findPath(character.position, to, gameState.characters, character.id);
    if (!path) {
      console.log('❌ Path not found:', {
        from: character.position,
        to,
        characterName: character.name,
        reason: 'A* returned null - no valid path exists'
      });
      return { valid: false, error: 'No valid path to destination' };
    }
    
    // Длина пути (без учёта стартовой позиции)
    const pathLength = path.length - 1;
    
    // Проверка очков движения
    if (pathLength > gameState.movementPointsLeft) {
      console.log('⚠️ Path too long:', {
        pathLength,
        movementPointsLeft: gameState.movementPointsLeft,
        from: character.position,
        to,
        characterName: character.name
      });
      return { valid: false, error: `Not enough movement points (need ${pathLength}, have ${gameState.movementPointsLeft})` };
    }

    return { valid: true };
  }

  /**
   * Выполнить перемещение
   */
  executeMove(
    character: Character,
    to: Position,
    gameState: GameState
  ): GameState {
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
  getAvailableMoves(character: Character, gameState: GameState): Position[] {
    const available: Position[] = [];
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
  private isCellOccupied(pos: Position, characters: Character[]): boolean {
    return characters.some(
      char => char.isAlive && this.gridSystem.positionsEqual(char.position, pos)
    );
  }

  /**
   * A* pathfinding для поиска пути
   */
  private findPath(
    start: Position,
    goal: Position,
    characters: Character[],
    movingCharacterId?: string
  ): Position[] | null {
    const openSet: Position[] = [start];
    const closedSet = new Set<string>();
    const cameFrom = new Map<string, Position>();
    const gScore = new Map<string, number>();
    const fScore = new Map<string, number>();

    const posKey = (pos: Position) => `${pos.x},${pos.y}`;

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
      closedSet.add(posKey(current));

      // Проверяем соседей
      const neighbors = this.gridSystem.getAdjacentCells(current);
      for (const neighbor of neighbors) {
        // Пропускаем уже проверенные узлы
        if (closedSet.has(posKey(neighbor))) {
          continue;
        }

        // Пропускаем занятые клетки (кроме цели и своей текущей позиции)
        if (!this.gridSystem.positionsEqual(neighbor, goal)) {
          const occupiedByOther = characters.some(
            char => char.isAlive && 
                    char.id !== movingCharacterId && 
                    this.gridSystem.positionsEqual(char.position, neighbor)
          );
          if (occupiedByOther) {
            continue;
          }
        }

        const tentativeGScore = (gScore.get(posKey(current)) || Infinity) + 1;

        if (tentativeGScore < (gScore.get(posKey(neighbor)) || Infinity)) {
          cameFrom.set(posKey(neighbor), current);
          gScore.set(posKey(neighbor), tentativeGScore);
          fScore.set(
            posKey(neighbor),
            tentativeGScore + this.gridSystem.calculateDistance(neighbor, goal)
          );

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
  private reconstructPath(cameFrom: Map<string, Position>, current: Position): Position[] {
    const path: Position[] = [current];
    const posKey = (pos: Position) => `${pos.x},${pos.y}`;

    while (cameFrom.has(posKey(current))) {
      current = cameFrom.get(posKey(current))!;
      path.unshift(current);
    }

    return path;
  }
}
