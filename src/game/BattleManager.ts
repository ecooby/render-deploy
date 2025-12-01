import { v4 as uuidv4 } from 'uuid';
import {
  GameState,
  Character,
  Team,
  BattleAction,
  ActionType,
  ActionResult,
  GAME_CONSTANTS,
  CombatType,
  EquipmentSlot,
} from '../../shared/types';
import { GridSystem } from './GridSystem';
import { MovementSystem } from './MovementSystem';
import { CombatSystem } from './CombatSystem';
import { TurnManager } from './TurnManager';

/**
 * Главный менеджер битвы
 */
export class BattleManager {
  private gridSystem: GridSystem;
  private movementSystem: MovementSystem;
  private combatSystem: CombatSystem;
  private turnManager: TurnManager;

  constructor() {
    this.gridSystem = new GridSystem();
    this.movementSystem = new MovementSystem(this.gridSystem);
    this.combatSystem = new CombatSystem(this.gridSystem);
    this.turnManager = new TurnManager();
  }

  /**
   * Создать новую битву
   */
  createBattle(player1Id: string, player2Id: string): GameState {
    const battleId = uuidv4();


    const player1Characters = this.createDefaultCharacters(Team.PLAYER1, [
      { x: 7, y: 1 },
      { x: 7, y: 4 },
      { x: 7, y: 7 },
    ]);


    const player2Characters = this.createDefaultCharacters(Team.PLAYER2, [
      { x: 0, y: 1 },
      { x: 0, y: 4 },
      { x: 0, y: 7 },
    ]);

    const now = Date.now();
    const gameState: GameState = {
      id: battleId,
      player1Id,
      player2Id,
      gridWidth: GAME_CONSTANTS.GRID_WIDTH,
      gridHeight: GAME_CONSTANTS.GRID_HEIGHT,
      characters: [...player1Characters, ...player2Characters],
      currentTurn: Team.PLAYER1,
      turnNumber: 1,
      movementPointsLeft: GAME_CONSTANTS.MOVEMENT_POINTS_PER_TURN,
      status: 'active',
      turnStartTime: now,
      turnTimeLimit: GAME_CONSTANTS.TURN_TIME_LIMIT,
      battleStartTime: now,
      battleTimeLimit: GAME_CONSTANTS.BATTLE_TIME_LIMIT,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    return gameState;
  }

  /**
   * Обработка действия игрока
   */
  processAction(
    action: BattleAction,
    playerId: string,
    gameState: GameState
  ): ActionResult {

    if (!this.turnManager.canAct(playerId, gameState)) {
      return {
        success: false,
        error: 'Not your turn',
      };
    }

    try {
      switch (action.type) {
        case ActionType.MOVE:
          return this.handleMove(action, gameState);
        
        case ActionType.ATTACK:
          return this.handleAttack(action, gameState);
        
        case ActionType.END_TURN:
          return this.handleEndTurn(gameState);
        
        case ActionType.SURRENDER:
          return this.handleSurrender(playerId, gameState);
        
        default:
          return {
            success: false,
            error: 'Unknown action type',
          };
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Обработка перемещения
   */
  private handleMove(action: any, gameState: GameState): ActionResult {
    const character = gameState.characters.find(c => c.id === action.characterId);
    
    if (!character) {
      return { success: false, error: 'Character not found' };
    }


    const canMove = this.movementSystem.canMove(character, action.to, gameState);
    if (!canMove.valid) {
      return { success: false, error: canMove.error };
    }


    this.movementSystem.executeMove(character, action.to, gameState);
    gameState.updatedAt = new Date();

    return {
      success: true,
      newState: gameState,
    };
  }

  /**
   * Обработка атаки
   */
  private handleAttack(action: any, gameState: GameState): ActionResult {
    const attacker = gameState.characters.find(c => c.id === action.attackerId);
    const target = gameState.characters.find(c => c.id === action.targetId);

    if (!attacker || !target) {
      return { success: false, error: 'Character not found' };
    }


    const canAttack = this.combatSystem.canAttack(attacker, target, gameState);
    if (!canAttack.valid) {
      return { success: false, error: canAttack.error };
    }


    const result = this.combatSystem.executeAttack(attacker, target, gameState);
    gameState.updatedAt = new Date();


    const battleEnd = this.combatSystem.checkBattleEnd(gameState);
    if (battleEnd.ended) {
      gameState.status = 'finished';
      gameState.winner = battleEnd.winner === gameState.player1Id ? Team.PLAYER1 : Team.PLAYER2;
    }

    return {
      success: true,
      newState: gameState,
      damage: result.damage,
      killedCharacterId: result.killed ? target.id : undefined,
    };
  }

  /**
   * Обработка завершения хода
   */
  private handleEndTurn(gameState: GameState): ActionResult {
    this.turnManager.endTurn(gameState);
    gameState.updatedAt = new Date();

    return {
      success: true,
      newState: gameState,
    };
  }

  /**
   * Обработка сдачи (Surrender)
   * Инициатор сдачи автоматически проигрывает
   */
  private handleSurrender(playerId: string, gameState: GameState): ActionResult {
    console.log(`Player ${playerId} surrendered in battle ${gameState.id}`);
    

    const loser = playerId === gameState.player1Id ? Team.PLAYER1 : Team.PLAYER2;
    const winner = loser === Team.PLAYER1 ? Team.PLAYER2 : Team.PLAYER1;
    

    gameState.status = 'finished';
    gameState.winner = winner;
    gameState.updatedAt = new Date();
    
    console.log(`Battle ${gameState.id} ended by surrender. Winner: ${winner}, Loser: ${loser}`);

    return {
      success: true,
      newState: gameState,
    };
  }

  /**
   * Создание персонажей по умолчанию
   */
  private createDefaultCharacters(team: Team, positions: { x: number; y: number }[]): Character[] {
    const characters: Character[] = [];


    characters.push({
      id: uuidv4(),
      name: team === Team.PLAYER1 ? 'Warrior P1' : 'Warrior P2',
      level: 1,
      experience: 0,
      position: positions[0],
      maxHp: 100,
      currentHp: 100,
      baseDamage: 20,
      baseArmor: 5,
      combatType: CombatType.MELEE,
      equipment: {},
      unlockedSlots: [EquipmentSlot.WEAPON, EquipmentSlot.ARMOR],
      team,
      isAlive: true,
      hasMoved: false,
      hasAttacked: false,
    });


    characters.push({
      id: uuidv4(),
      name: team === Team.PLAYER1 ? 'Archer P1' : 'Archer P2',
      level: 1,
      experience: 0,
      position: positions[1],
      maxHp: 70,
      currentHp: 70,
      baseDamage: 15,
      baseArmor: 2,
      combatType: CombatType.RANGED,
      equipment: {},
      unlockedSlots: [EquipmentSlot.WEAPON, EquipmentSlot.ARMOR],
      team,
      isAlive: true,
      hasMoved: false,
      hasAttacked: false,
    });


    characters.push({
      id: uuidv4(),
      name: team === Team.PLAYER1 ? 'Knight P1' : 'Knight P2',
      level: 1,
      experience: 0,
      position: positions[2],
      maxHp: 120,
      currentHp: 120,
      baseDamage: 18,
      baseArmor: 8,
      combatType: CombatType.MELEE,
      equipment: {},
      unlockedSlots: [EquipmentSlot.WEAPON, EquipmentSlot.ARMOR],
      team,
      isAlive: true,
      hasMoved: false,
      hasAttacked: false,
    });

    return characters;
  }

  /**
   * Получить доступные действия для персонажа
   */
  getAvailableActions(characterId: string, gameState: GameState) {
    const character = gameState.characters.find(c => c.id === characterId);
    if (!character || !character.isAlive) {
      return null;
    }

    return {
      canMove: !character.hasMoved && gameState.movementPointsLeft > 0,
      availableMoves: !character.hasMoved 
        ? this.movementSystem.getAvailableMoves(character, gameState)
        : [],
      canAttack: !character.hasAttacked,
      availableTargets: !character.hasAttacked
        ? this.combatSystem.getAvailableTargets(character, gameState)
        : [],
    };
  }
}
