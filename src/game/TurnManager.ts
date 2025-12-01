import { GameState, Team, GAME_CONSTANTS, Character } from '../../shared/types';

/**
 * Менеджер ходов
 */
export class TurnManager {
  /**
   * Начать новый ход
   */
  startTurn(gameState: GameState): GameState {
    const currentTeam = gameState.currentTurn;
    
    // Reset character states and movement points for current team
    gameState.characters.forEach(char => {
      if (char.team === currentTeam && char.isAlive) {
        char.hasAttacked = false;
        char.movementPointsLeft = GAME_CONSTANTS.MOVEMENT_POINTS_PER_TURN;
      }
    });

    // Set global movement points
    gameState.movementPointsLeft = GAME_CONSTANTS.MOVEMENT_POINTS_PER_TURN;

    // Set turn start time
    gameState.turnStartTime = Date.now();

    return gameState;
  }

  /**
   * Завершить текущий ход и передать ход противнику
   */
  endTurn(gameState: GameState): GameState {

    gameState.currentTurn = gameState.currentTurn === Team.PLAYER1 
      ? Team.PLAYER2 
      : Team.PLAYER1;


    if (gameState.currentTurn === Team.PLAYER1) {
      gameState.turnNumber++;
    }


    return this.startTurn(gameState);
  }

  /**
   * Проверка, может ли игрок совершать действия
   */
  canAct(playerId: string, gameState: GameState): boolean {
    const playerTeam = this.getPlayerTeam(playerId, gameState);
    return playerTeam === gameState.currentTurn;
  }

  /**
   * Получить команду игрока
   */
  getPlayerTeam(playerId: string, gameState: GameState): Team | null {
    if (playerId === gameState.player1Id) return Team.PLAYER1;
    if (playerId === gameState.player2Id) return Team.PLAYER2;
    return null;
  }

  /**
   * Проверка, остались ли доступные действия
   */
  hasActionsLeft(gameState: GameState): boolean {
    const currentTeam = gameState.currentTurn;
    const teamCharacters = gameState.characters.filter(
      c => c.team === currentTeam && c.isAlive
    );

    // Check if any character has movement points left
    const canMove = teamCharacters.some(c => 
      (c.movementPointsLeft ?? 0) > 0
    );
    if (canMove) return true;

    // Check if any character can attack
    const canAttack = teamCharacters.some(c => !c.hasAttacked);
    if (canAttack) return true;

    return false;
  }

  /**
   * Автоматическое завершение хода, если нет доступных действий
   */
  autoEndTurnIfNeeded(gameState: GameState): GameState {
    if (!this.hasActionsLeft(gameState)) {
      return this.endTurn(gameState);
    }
    return gameState;
  }

  /**
   * Получить информацию о текущем ходе
   */
  getTurnInfo(gameState: GameState) {
    return {
      currentTeam: gameState.currentTurn,
      turnNumber: gameState.turnNumber,
      movementPointsLeft: gameState.movementPointsLeft,
      hasActionsLeft: this.hasActionsLeft(gameState),
    };
  }
}
