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
    // Проверка, что персонаж еще не атаковал
    if (attacker.hasAttacked) {
      return { valid: false, error: 'Character has already attacked this turn' };
    }

    // Проверка, что цель жива
    if (!target.isAlive) {
      return { valid: false, error: 'Target is not alive' };
    }

    // Проверка, что цель - враг
    if (attacker.team === target.team) {
      return { valid: false, error: 'Cannot attack ally' };
    }

    // Проверка дистанции в зависимости от типа боя
    const distance = this.gridSystem.calculateDistance(attacker.position, target.position);

    if (attacker.combatType === CombatType.MELEE) {
      // Ближний бой - только соседние клетки
      if (distance > GAME_CONSTANTS.MELEE_ATTACK_RANGE) {
        return { valid: false, error: 'Target is out of melee range' };
      }
    } else if (attacker.combatType === CombatType.RANGED) {
      // Дальний бой - проверка дистанции и линии видимости
      if (distance > GAME_CONSTANTS.RANGED_ATTACK_RANGE) {
        return { valid: false, error: 'Target is out of ranged attack range' };
      }

      // Проверка прямой видимости
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
    // Расчет урона
    const damage = this.calculateDamage(attacker, target);

    // Применение урона
    target.currentHp = Math.max(0, target.currentHp - damage);

    // Проверка смерти
    if (target.currentHp === 0) {
      target.isAlive = false;
    }

    // Отметка, что персонаж атаковал
    attacker.hasAttacked = true;

    return {
      damage,
      killed: !target.isAlive,
    };
  }

  /**
   * Расчет урона с учетом брони и экипировки
   */
  private calculateDamage(attacker: Character, target: Character): number {
    // Базовый урон атакующего
    let totalDamage = attacker.baseDamage;

    // Бонус от оружия
    if (attacker.equipment.WEAPON) {
      totalDamage += attacker.equipment.WEAPON.damageBonus || 0;
    }

    // Броня цели
    let totalArmor = target.baseArmor;

    // Бонус от брони
    if (target.equipment.ARMOR) {
      totalArmor += target.equipment.ARMOR.armorBonus || 0;
    }

    // Финальный урон = урон - броня (минимум 1)
    const finalDamage = Math.max(1, totalDamage - totalArmor);

    return finalDamage;
  }

  /**
   * Получить доступные цели для атаки
   */
  getAvailableTargets(attacker: Character, gameState: GameState): Character[] {
    const targets: Character[] = [];

    for (const character of gameState.characters) {
      // Пропускаем союзников и мертвых
      if (character.team === attacker.team || !character.isAlive) {
        continue;
      }

      // Проверяем возможность атаки
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
