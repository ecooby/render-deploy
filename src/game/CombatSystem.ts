import {
  Character,
  GameState,
  CombatType,
  GAME_CONSTANTS,
  Position,
} from '../../shared/types';
import { GridSystem } from './GridSystem';

/**
 * Система боя
 */
export class CombatSystem {
  private gridSystem: GridSystem;

  constructor(gridSystem: GridSystem) {
    this.gridSystem = gridSystem;
  }

  /**
   * Проверка возможности атаки
   */
  canAttack(
    attacker: Character,
    target: Character,
    gameState: GameState
  ): { valid: boolean; error?: string } {

    if (attacker.hasAttacked) {
      return { valid: false, error: 'Character has already attacked this turn' };
    }


    if (!target.isAlive) {
      return { valid: false, error: 'Target is not alive' };
    }


    if (attacker.team === target.team) {
      return { valid: false, error: 'Cannot attack ally' };
    }


    const distance = this.gridSystem.calculateDistance(attacker.position, target.position);

    if (attacker.combatType === CombatType.MELEE) {

      if (distance > GAME_CONSTANTS.MELEE_ATTACK_RANGE) {
        return { valid: false, error: 'Target is out of melee range' };
      }
    } else if (attacker.combatType === CombatType.RANGED) {

      if (distance > GAME_CONSTANTS.RANGED_ATTACK_RANGE) {
        return { valid: false, error: 'Target is out of ranged attack range' };
      }


      const occupiedCells = gameState.characters
        .filter(c => c.isAlive && c.id !== attacker.id && c.id !== target.id)
        .map(c => c.position);

      if (!this.gridSystem.hasLineOfSight(attacker.position, target.position, occupiedCells)) {
        return { valid: false, error: 'No line of sight to target' };
      }
    }

    return { valid: true };
  }

  /**
   * Выполнить атаку
   */
  executeAttack(
    attacker: Character,
    target: Character,
    gameState: GameState
  ): { damage: number; killed: boolean } {

    const damage = this.calculateDamage(attacker, target);


    target.currentHp = Math.max(0, target.currentHp - damage);


    if (target.currentHp === 0) {
      target.isAlive = false;
    }


    attacker.hasAttacked = true;
    
    // Check if all characters of current team have attacked
    const currentTeamCharacters = gameState.characters
      .filter(c => c.team === gameState.currentTurn && c.isAlive);
    
    const allAttacked = currentTeamCharacters.every(c => c.hasAttacked);
    
    if (allAttacked) {
      console.log('🔄 All characters have attacked - Auto ending turn');
      gameState.autoEndTurn = true;
    }

    return {
      damage,
      killed: !target.isAlive,
    };
  }

  /**
   * Расчет урона с учетом брони и экипировки
   */
  private calculateDamage(attacker: Character, target: Character): number {

    let totalDamage = attacker.baseDamage;


    if (attacker.equipment.WEAPON) {
      totalDamage += attacker.equipment.WEAPON.damageBonus || 0;
    }


    let totalArmor = target.baseArmor;


    if (target.equipment.ARMOR) {
      totalArmor += target.equipment.ARMOR.armorBonus || 0;
    }


    const finalDamage = Math.max(1, totalDamage - totalArmor);

    return finalDamage;
  }

  /**
   * Получить доступные цели для атаки
   */
  getAvailableTargets(attacker: Character, gameState: GameState): Character[] {
    const targets: Character[] = [];

    for (const character of gameState.characters) {

      if (character.team === attacker.team || !character.isAlive) {
        continue;
      }


      const canAttack = this.canAttack(attacker, character, gameState);
      if (canAttack.valid) {
        targets.push(character);
      }
    }

    return targets;
  }

  /**
   * Получить позиции доступных целей
   */
  getAvailableTargetPositions(attacker: Character, gameState: GameState): Position[] {
    const targets = this.getAvailableTargets(attacker, gameState);
    return targets.map(t => t.position);
  }

  /**
   * Проверка окончания боя
   */
  checkBattleEnd(gameState: GameState): { ended: boolean; winner?: string } {
    const player1Alive = gameState.characters.filter(
      c => c.team === 'PLAYER1' && c.isAlive
    ).length;

    const player2Alive = gameState.characters.filter(
      c => c.team === 'PLAYER2' && c.isAlive
    ).length;

    if (player1Alive === 0) {
      return { ended: true, winner: gameState.player2Id };
    }

    if (player2Alive === 0) {
      return { ended: true, winner: gameState.player1Id };
    }

    return { ended: false };
  }
}
