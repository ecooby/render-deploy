"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TurnManager = void 0;
const types_1 = require("../../../shared/types");
/**
 * Менеджер ходов
 */
class TurnManager {
    /**
     * Начать новый ход
     */
    startTurn(gameState) {
        // Сброс флагов персонажей текущей команды
        const currentTeam = gameState.currentTurn;
        gameState.characters.forEach(char => {
            if (char.team === currentTeam && char.isAlive) {
                char.hasMoved = false;
                char.hasAttacked = false;
            }
        });
        // Восстановление очков передвижения
        gameState.movementPointsLeft = types_1.GAME_CONSTANTS.MOVEMENT_POINTS_PER_TURN;
        return gameState;
    }
    /**
     * Завершить текущий ход и передать ход противнику
     */
    endTurn(gameState) {
        // Переключение хода
        gameState.currentTurn = gameState.currentTurn === types_1.Team.PLAYER1
            ? types_1.Team.PLAYER2
            : types_1.Team.PLAYER1;
        // Увеличение номера хода
        if (gameState.currentTurn === types_1.Team.PLAYER1) {
            gameState.turnNumber++;
        }
        // Начало нового хода
        return this.startTurn(gameState);
    }
    /**
     * Проверка, может ли игрок совершать действия
     */
    canAct(playerId, gameState) {
        const playerTeam = this.getPlayerTeam(playerId, gameState);
        return playerTeam === gameState.currentTurn;
    }
    /**
     * Получить команду игрока
     */
    getPlayerTeam(playerId, gameState) {
        if (playerId === gameState.player1Id)
            return types_1.Team.PLAYER1;
        if (playerId === gameState.player2Id)
            return types_1.Team.PLAYER2;
        return null;
    }
    /**
     * Проверка, остались ли доступные действия
     */
    hasActionsLeft(gameState) {
        const currentTeam = gameState.currentTurn;
        const teamCharacters = gameState.characters.filter(c => c.team === currentTeam && c.isAlive);
        // Есть ли очки передвижения
        if (gameState.movementPointsLeft > 0) {
            // Есть ли персонажи, которые могут двигаться
            const canMove = teamCharacters.some(c => !c.hasMoved);
            if (canMove)
                return true;
        }
        // Есть ли персонажи, которые могут атаковать
        const canAttack = teamCharacters.some(c => !c.hasAttacked);
        if (canAttack)
            return true;
        return false;
    }
    /**
     * Автоматическое завершение хода, если нет доступных действий
     */
    autoEndTurnIfNeeded(gameState) {
        if (!this.hasActionsLeft(gameState)) {
            return this.endTurn(gameState);
        }
        return gameState;
    }
    /**
     * Получить информацию о текущем ходе
     */
    getTurnInfo(gameState) {
        return {
            currentTeam: gameState.currentTurn,
            turnNumber: gameState.turnNumber,
            movementPointsLeft: gameState.movementPointsLeft,
            hasActionsLeft: this.hasActionsLeft(gameState),
        };
    }
}
exports.TurnManager = TurnManager;
//# sourceMappingURL=TurnManager.js.map