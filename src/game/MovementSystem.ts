import { Position, Character, GameState, GAME_CONSTANTS } from '../../shared/types';
import { GridSystem } from './GridSystem';

/**
 * Simplified and robust movement system
 */
export class MovementSystem {
  private gridSystem: GridSystem;

  constructor(gridSystem: GridSystem) {
    this.gridSystem = gridSystem;
  }

  /**
   * Check if character can move to position
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

    // Check if target is occupied by another character
    const targetOccupiedByOther = gameState.characters.some(
      char => char.isAlive && 
              char.id !== character.id && 
              this.gridSystem.positionsEqual(char.position, to)
    );
    
    if (targetOccupiedByOther) {
      return { valid: false, error: 'Cell is occupied by another character' };
    }
    
    // Check distance - only allow 1 cell movement
    const distance = this.gridSystem.calculateDistance(character.position, to);
    if (distance > GAME_CONSTANTS.MAX_MOVE_DISTANCE_PER_ACTION) {
      return { valid: false, error: 'Can only move 1 cell at a time' };
    }

    // Initialize movement points if undefined
    if (character.movementPointsLeft === undefined) {
      character.movementPointsLeft = GAME_CONSTANTS.MOVEMENT_POINTS_PER_TURN;
    }
    const characterMovement = character.movementPointsLeft;
    
    // Check if character has movement points left
    if (characterMovement <= 0) {
      return { valid: false, error: 'No movement points left' };
    }

    return { valid: true };
  }

  /**
   * Execute move
   */
  executeMove(
    character: Character,
    to: Position,
    gameState: GameState
  ): GameState {
    // Update character position
    character.position = to;
    
    // Deduct 1 movement point from the character
    if (character.movementPointsLeft === undefined) {
      character.movementPointsLeft = GAME_CONSTANTS.MOVEMENT_POINTS_PER_TURN;
    }
    character.movementPointsLeft -= 1;
    
    // Also update team's global movement points
    gameState.movementPointsLeft -= 1;

    console.log(`✅ Character ${character.name} moved! Remaining MP: ${character.movementPointsLeft}`);
    
    // Check if all movement points are used
    const allCharactersUsedMovement = gameState.characters
      .filter(c => c.team === gameState.currentTurn && c.isAlive)
      .every(c => (c.movementPointsLeft ?? 0) <= 0);
    
    if (allCharactersUsedMovement || gameState.movementPointsLeft <= 0) {
      console.log('🔄 All movement points used - Auto ending turn');
      gameState.autoEndTurn = true;
    }

    return gameState;
  }

  /**
   * Get available moves for a character
   */
  getAvailableMoves(character: Character, gameState: GameState): Position[] {
    const available: Position[] = [];
    
    // Only check adjacent cells (1 cell movement)
    const adjacentCells = this.gridSystem.getAdjacentCells(character.position);
    
    for (const cell of adjacentCells) {
      const canMove = this.canMove(character, cell, gameState);
      if (canMove.valid) {
        available.push(cell);
      }
    }

    return available;
  }

  /**
   * Simple BFS pathfinding - more reliable than A* for small grids
   */
  private findPathBFS(
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
      return null;
    }

    const queue: { pos: Position; path: Position[] }[] = [{ pos: start, path: [start] }];
    const visited = new Set<string>();
    const posKey = (pos: Position) => `${pos.x},${pos.y}`;
    
    visited.add(posKey(start));
    
    while (queue.length > 0) {
      const current = queue.shift()!;
      
      // Check if we reached the goal
      if (this.gridSystem.positionsEqual(current.pos, goal)) {
        return current.path;
      }
      
      // Get neighbors (4-directional)
      const neighbors = this.gridSystem.getAdjacentCells(current.pos);
      
      for (const neighbor of neighbors) {
        const key = posKey(neighbor);
        
        // Skip if already visited
        if (visited.has(key)) {
          continue;
        }
        
        // Skip if occupied by another character (unless it's the goal)
        if (!this.gridSystem.positionsEqual(neighbor, goal)) {
          const occupied = characters.some(
            char => char.isAlive && 
                    char.id !== movingCharacterId && 
                    this.gridSystem.positionsEqual(char.position, neighbor)
          );
          if (occupied) {
            continue;
          }
        }
        
        // Mark as visited and add to queue
        visited.add(key);
        queue.push({
          pos: neighbor,
          path: [...current.path, neighbor]
        });
      }
    }
    
    return null; // No path found
  }

  /**
   * Check if cell is occupied
   */
  private isCellOccupied(pos: Position, characters: Character[]): boolean {
    return characters.some(
      char => char.isAlive && this.gridSystem.positionsEqual(char.position, pos)
    );
  }
}
