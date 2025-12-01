import { GameState, Team, GAME_CONSTANTS } from '../../shared/types';

/**
 * Управление таймерами битвы (серверная логика)
 */
export class TimerManager {
  private turnTimers: Map<string, NodeJS.Timeout> = new Map();
  private battleTimers: Map<string, NodeJS.Timeout> = new Map();

  /**
   * Запустить таймер хода
   */
  startTurnTimer(
    battleId: string,
    gameState: GameState,
    onTurnTimeout: (battleId: string) => void
  ): void {

    this.clearTurnTimer(battleId);

    const timeLimit = gameState.turnTimeLimit * 1000;

    const timer = setTimeout(() => {
      console.log(`⏰ Turn timeout for battle ${battleId}`);
      onTurnTimeout(battleId);
    }, timeLimit);

    this.turnTimers.set(battleId, timer);
  }

  /**
   * Запустить таймер битвы
   */
  startBattleTimer(
    battleId: string,
    gameState: GameState,
    onBattleTimeout: (battleId: string) => void
  ): void {

    this.clearBattleTimer(battleId);

    const timeLimit = gameState.battleTimeLimit * 1000;

    const timer = setTimeout(() => {
      console.log(`⏰ Battle timeout for battle ${battleId}`);
      onBattleTimeout(battleId);
    }, timeLimit);

    this.battleTimers.set(battleId, timer);
  }

  /**
   * Очистить таймер хода
   */
  clearTurnTimer(battleId: string): void {
    const timer = this.turnTimers.get(battleId);
    if (timer) {
      clearTimeout(timer);
      this.turnTimers.delete(battleId);
    }
  }

  /**
   * Очистить таймер битвы
   */
  clearBattleTimer(battleId: string): void {
    const timer = this.battleTimers.get(battleId);
    if (timer) {
      clearTimeout(timer);
      this.battleTimers.delete(battleId);
    }
  }

  /**
   * Очистить все таймеры битвы
   */
  clearAllTimers(battleId: string): void {
    this.clearTurnTimer(battleId);
    this.clearBattleTimer(battleId);
  }

  /**
   * Определить победителя по истечении времени битвы
   */
  determineWinnerByTime(gameState: GameState): Team {
    const player1Characters = gameState.characters.filter(
      c => c.team === Team.PLAYER1 && c.isAlive
    );
    const player2Characters = gameState.characters.filter(
      c => c.team === Team.PLAYER2 && c.isAlive
    );


    if (player1Characters.length > player2Characters.length) {
      return Team.PLAYER1;
    }
    if (player2Characters.length > player1Characters.length) {
      return Team.PLAYER2;
    }


    const player1Health = player1Characters.reduce((sum, c) => sum + c.currentHp, 0);
    const player2Health = player2Characters.reduce((sum, c) => sum + c.currentHp, 0);

    if (player1Health > player2Health) {
      return Team.PLAYER1;
    }
    if (player2Health > player1Health) {
      return Team.PLAYER2;
    }


    return Team.PLAYER1;
  }
}
