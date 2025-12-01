"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BattleManager = void 0;
const uuid_1 = require("uuid");
const types_1 = require("../../../shared/types");
const GridSystem_1 = require("./GridSystem");
const MovementSystem_1 = require("./MovementSystem");
const CombatSystem_1 = require("./CombatSystem");
const TurnManager_1 = require("./TurnManager");
/**
 * Главный менеджер битвы
 */
class BattleManager {
    constructor() {
        this.gridSystem = new GridSystem_1.GridSystem();
        this.movementSystem = new MovementSystem_1.MovementSystem(this.gridSystem);
        this.combatSystem = new CombatSystem_1.CombatSystem(this.gridSystem);
        this.turnManager = new TurnManager_1.TurnManager();
    }
    /**
     * Создать новую битву
     */
    createBattle(player1Id, player2Id) {
        const battleId = (0, uuid_1.v4)();
        // Создание персонажей для игрока 1 (правая сторона)
        const player1Characters = this.createDefaultCharacters(types_1.Team.PLAYER1, [
            { x: 7, y: 1 },
            { x: 7, y: 4 },
            { x: 7, y: 7 },
        ]);
        // Создание персонажей для игрока 2 (левая сторона)
        const player2Characters = this.createDefaultCharacters(types_1.Team.PLAYER2, [
            { x: 0, y: 1 },
            { x: 0, y: 4 },
            { x: 0, y: 7 },
        ]);
        const gameState = {
            id: battleId,
            player1Id,
            player2Id,
            gridWidth: types_1.GAME_CONSTANTS.GRID_WIDTH,
            gridHeight: types_1.GAME_CONSTANTS.GRID_HEIGHT,
            characters: [...player1Characters, ...player2Characters],
            currentTurn: types_1.Team.PLAYER1,
            turnNumber: 1,
            movementPointsLeft: types_1.GAME_CONSTANTS.MOVEMENT_POINTS_PER_TURN,
            status: 'active',
            createdAt: new Date(),
            updatedAt: new Date(),
        };
        return gameState;
    }
    /**
     * Обработка действия игрока
     */
    processAction(action, playerId, gameState) {
        // Проверка, что сейчас ход игрока
        if (!this.turnManager.canAct(playerId, gameState)) {
            return {
                success: false,
                error: 'Not your turn',
            };
        }
        try {
            switch (action.type) {
                case types_1.ActionType.MOVE:
                    return this.handleMove(action, gameState);
                case types_1.ActionType.ATTACK:
                    return this.handleAttack(action, gameState);
                case types_1.ActionType.END_TURN:
                    return this.handleEndTurn(gameState);
                default:
                    return {
                        success: false,
                        error: 'Unknown action type',
                    };
            }
        }
        catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error',
            };
        }
    }
    /**
     * Обработка перемещения
     */
    handleMove(action, gameState) {
        const character = gameState.characters.find(c => c.id === action.characterId);
        if (!character) {
            return { success: false, error: 'Character not found' };
        }
        // Проверка возможности перемещения
        const canMove = this.movementSystem.canMove(character, action.to, gameState);
        if (!canMove.valid) {
            return { success: false, error: canMove.error };
        }
        // Выполнение перемещения
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
    handleAttack(action, gameState) {
        const attacker = gameState.characters.find(c => c.id === action.attackerId);
        const target = gameState.characters.find(c => c.id === action.targetId);
        if (!attacker || !target) {
            return { success: false, error: 'Character not found' };
        }
        // Проверка возможности атаки
        const canAttack = this.combatSystem.canAttack(attacker, target, gameState);
        if (!canAttack.valid) {
            return { success: false, error: canAttack.error };
        }
        // Выполнение атаки
        const result = this.combatSystem.executeAttack(attacker, target, gameState);
        gameState.updatedAt = new Date();
        // Проверка окончания боя
        const battleEnd = this.combatSystem.checkBattleEnd(gameState);
        if (battleEnd.ended) {
            gameState.status = 'finished';
            gameState.winner = battleEnd.winner === gameState.player1Id ? types_1.Team.PLAYER1 : types_1.Team.PLAYER2;
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
    handleEndTurn(gameState) {
        this.turnManager.endTurn(gameState);
        gameState.updatedAt = new Date();
        return {
            success: true,
            newState: gameState,
        };
    }
    /**
     * Создание персонажей по умолчанию
     */
    createDefaultCharacters(team, positions) {
        const characters = [];
        // Воин (ближний бой)
        characters.push({
            id: (0, uuid_1.v4)(),
            name: team === types_1.Team.PLAYER1 ? 'Warrior P1' : 'Warrior P2',
            level: 1,
            experience: 0,
            position: positions[0],
            maxHp: 100,
            currentHp: 100,
            baseDamage: 20,
            baseArmor: 5,
            combatType: types_1.CombatType.MELEE,
            equipment: {},
            unlockedSlots: [types_1.EquipmentSlot.WEAPON, types_1.EquipmentSlot.ARMOR],
            team,
            isAlive: true,
            hasMoved: false,
            hasAttacked: false,
        });
        // Лучник (дальний бой)
        characters.push({
            id: (0, uuid_1.v4)(),
            name: team === types_1.Team.PLAYER1 ? 'Archer P1' : 'Archer P2',
            level: 1,
            experience: 0,
            position: positions[1],
            maxHp: 70,
            currentHp: 70,
            baseDamage: 15,
            baseArmor: 2,
            combatType: types_1.CombatType.RANGED,
            equipment: {},
            unlockedSlots: [types_1.EquipmentSlot.WEAPON, types_1.EquipmentSlot.ARMOR],
            team,
            isAlive: true,
            hasMoved: false,
            hasAttacked: false,
        });
        // Рыцарь (ближний бой, танк)
        characters.push({
            id: (0, uuid_1.v4)(),
            name: team === types_1.Team.PLAYER1 ? 'Knight P1' : 'Knight P2',
            level: 1,
            experience: 0,
            position: positions[2],
            maxHp: 120,
            currentHp: 120,
            baseDamage: 18,
            baseArmor: 8,
            combatType: types_1.CombatType.MELEE,
            equipment: {},
            unlockedSlots: [types_1.EquipmentSlot.WEAPON, types_1.EquipmentSlot.ARMOR],
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
    getAvailableActions(characterId, gameState) {
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
exports.BattleManager = BattleManager;
//# sourceMappingURL=BattleManager.js.map