"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BotAI = void 0;
const types_1 = require("../../../shared/types");
class BotAI {
    constructor(battleManager) {
        this.battleManager = battleManager;
    }
    calculateMove(gameState, botTeam) {
        // 1. Check if we can attack anyone
        const myCharacters = gameState.characters.filter(c => c.team === botTeam && c.isAlive);
        for (const char of myCharacters) {
            if (char.hasAttacked)
                continue;
            const availableActions = this.battleManager.getAvailableActions(char.id, gameState);
            if (availableActions && availableActions.canAttack && availableActions.availableTargets.length > 0) {
                // Attack the first available target (or weakest)
                const target = availableActions.availableTargets[0]; // Simple AI: attack first valid target
                return {
                    type: types_1.ActionType.ATTACK,
                    attackerId: char.id,
                    targetId: target.id
                };
            }
        }
        // 2. If no attacks, try to move closer to enemies
        for (const char of myCharacters) {
            if (char.hasMoved || gameState.movementPointsLeft <= 0)
                continue;
            const availableActions = this.battleManager.getAvailableActions(char.id, gameState);
            if (availableActions && availableActions.canMove && availableActions.availableMoves.length > 0) {
                // Find move closest to an enemy
                const enemies = gameState.characters.filter(c => c.team !== botTeam && c.isAlive);
                let bestMove = availableActions.availableMoves[0];
                let minDist = Infinity;
                for (const move of availableActions.availableMoves) {
                    // Find closest enemy to this move position
                    for (const enemy of enemies) {
                        const dist = Math.abs(move.x - enemy.position.x) + Math.abs(move.y - enemy.position.y);
                        if (dist < minDist) {
                            minDist = dist;
                            bestMove = move;
                        }
                    }
                }
                return {
                    type: types_1.ActionType.MOVE,
                    characterId: char.id,
                    from: char.position,
                    to: bestMove
                };
            }
        }
        // 3. If nothing else to do, end turn
        return {
            type: types_1.ActionType.END_TURN
        };
    }
}
exports.BotAI = BotAI;
//# sourceMappingURL=BotAI.js.map