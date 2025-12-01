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
    // Check if it's the character's team turn
    if (character.team !== gameState.currentTurn) {
      return { valid: false, error: 'Not this character\'s turn' };
    }

    // Check if position is valid
    if (!this.gridSystem.isValidPosition(to)) {
      return { valid: false, error: 'Invalid position' };
    }
    
    // Check if trying to move to same position
    if (this.gridSystem.positionsEqual(character.position, to)) {
      return { valid: false, error: 'Already at this position' };
    }


    const targetOccupiedByOther = gameState.characters.some(
      char => char.isAlive && 
              char.id !== character.id && 
              this.gridSystem.positionsEqual(char.position, to)
    );
    
    if (targetOccupiedByOther) {
      return { valid: false, error: 'Cell is occupied by another character' };
    }


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
    

    const pathLength = path.length - 1;
    
    // Get character's remaining movement points (initialize if undefined)
    if (character.movementPointsLeft === undefined) {
      character.movementPointsLeft = GAME_CONSTANTS.MOVEMENT_POINTS_PER_TURN;
    }
    const characterMovement = character.movementPointsLeft;
    
    if (pathLength > characterMovement) {
      console.log('⚠️ Path too long:', {
        pathLength,
        characterMovementLeft: characterMovement,
        from: character.position,
        to,
        characterName: character.name
      });
      return { valid: false, error: `Not enough movement points (need ${pathLength}, have ${characterMovement})` };
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
    const path = this.findPath(character.position, to, gameState.characters, character.id);
    const pathLength = path ? path.length - 1 : this.gridSystem.calculateDistance(character.position, to);
    
    // Update character position
    character.position = to;
    
    // Deduct movement points from the character
    if (character.movementPointsLeft === undefined) {
      character.movementPointsLeft = GAME_CONSTANTS.MOVEMENT_POINTS_PER_TURN;
    }
    character.movementPointsLeft -= pathLength;
    
    // Also update team's global movement points
    gameState.movementPointsLeft -= pathLength;

    console.log(`✅ Character ${character.name} moved! Remaining MP: ${character.movementPointsLeft}`);

    return gameState;
  }

  /**
   * Получить все доступные клетки для перемещения
   */
  getAvailableMoves(character: Character, gameState: GameState): Position[] {
    const available: Position[] = [];
    const range = character.movementPointsLeft ?? 0;


    const cellsInRange = this.gridSystem.getCellsInRange(character.position, range);

    for (const cell of cellsInRange) {

      if (this.gridSystem.positionsEqual(cell, character.position)) {
        continue;
      }


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
    // Quick check for same position
    if (this.gridSystem.positionsEqual(start, goal)) {
      return [start];
    }
    
    // Check if goal is valid
    if (!this.gridSystem.isValidPosition(goal)) {
      console.log('❌ Goal position is invalid:', goal);
      return null;
    }
    
    const openSet: Position[] = [start];
    const closedSet = new Set<string>();
    const cameFrom = new Map<string, Position>();
    const gScore = new Map<string, number>();
    const fScore = new Map<string, number>();

    const posKey = (pos: Position) => `${pos.x},${pos.y}`;

    gScore.set(posKey(start), 0);
    fScore.set(posKey(start), this.gridSystem.calculateDistance(start, goal));

    let iterations = 0;
    const maxIterations = 1000; // Prevent infinite loops
    
    while (openSet.length > 0 && iterations < maxIterations) {
      iterations++;

      let current = openSet[0];
      let currentIndex = 0;
      for (let i = 1; i < openSet.length; i++) {
        if ((fScore.get(posKey(openSet[i])) || Infinity) < (fScore.get(posKey(current)) || Infinity)) {
          current = openSet[i];
          currentIndex = i;
        }
      }


      if (this.gridSystem.positionsEqual(current, goal)) {
        console.log(`✅ Path found in ${iterations} iterations`);
        return this.reconstructPath(cameFrom, current);
      }

      openSet.splice(currentIndex, 1);
      closedSet.add(posKey(current));


      const neighbors = this.gridSystem.getAdjacentCells(current);
      for (const neighbor of neighbors) {

        if (closedSet.has(posKey(neighbor))) {
          continue;
        }

        // Skip invalid positions
        if (!this.gridSystem.isValidPosition(neighbor)) {
          continue;
        }


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

    console.log(`❌ No path found after ${iterations} iterations. Start: (${start.x},${start.y}), Goal: (${goal.x},${goal.y})`);
    return null;
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
