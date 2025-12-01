"use strict";
// ============================================
// SHARED TYPES - Используются клиентом и сервером
// ============================================
Object.defineProperty(exports, "__esModule", { value: true });
exports.GAME_CONSTANTS = exports.SocketEvent = exports.ActionType = exports.EquipmentSlot = exports.Team = exports.CombatType = void 0;
// Тип боя
var CombatType;
(function (CombatType) {
    CombatType["MELEE"] = "MELEE";
    CombatType["RANGED"] = "RANGED";
})(CombatType || (exports.CombatType = CombatType = {}));
// Команда
var Team;
(function (Team) {
    Team["PLAYER1"] = "PLAYER1";
    Team["PLAYER2"] = "PLAYER2";
})(Team || (exports.Team = Team = {}));
// Слот экипировки
var EquipmentSlot;
(function (EquipmentSlot) {
    EquipmentSlot["WEAPON"] = "WEAPON";
    EquipmentSlot["ARMOR"] = "ARMOR";
    EquipmentSlot["ACCESSORY1"] = "ACCESSORY1";
    EquipmentSlot["ACCESSORY2"] = "ACCESSORY2";
})(EquipmentSlot || (exports.EquipmentSlot = EquipmentSlot = {}));
// Типы действий
var ActionType;
(function (ActionType) {
    ActionType["MOVE"] = "MOVE";
    ActionType["ATTACK"] = "ATTACK";
    ActionType["END_TURN"] = "END_TURN";
    ActionType["EQUIP_ITEM"] = "EQUIP_ITEM";
})(ActionType || (exports.ActionType = ActionType = {}));
// События Socket.io
var SocketEvent;
(function (SocketEvent) {
    // Подключение
    SocketEvent["CONNECT"] = "connect";
    SocketEvent["DISCONNECT"] = "disconnect";
    // Matchmaking
    SocketEvent["MATCHMAKING_JOIN"] = "matchmaking:join";
    SocketEvent["MATCHMAKING_LEAVE"] = "matchmaking:leave";
    SocketEvent["MATCHMAKING_FOUND"] = "matchmaking:found";
    SocketEvent["MATCHMAKING_BOT"] = "matchmaking:bot";
    // Битва
    SocketEvent["BATTLE_JOIN"] = "battle:join";
    SocketEvent["BATTLE_STATE"] = "battle:state";
    SocketEvent["BATTLE_ACTION"] = "battle:action";
    SocketEvent["BATTLE_UPDATE"] = "battle:update";
    SocketEvent["BATTLE_END"] = "battle:end";
    SocketEvent["BATTLE_ERROR"] = "battle:error";
    // Игрок
    SocketEvent["PLAYER_DISCONNECTED"] = "player:disconnected";
    SocketEvent["PLAYER_RECONNECTED"] = "player:reconnected";
})(SocketEvent || (exports.SocketEvent = SocketEvent = {}));
// Константы игры
exports.GAME_CONSTANTS = {
    GRID_WIDTH: 8,
    GRID_HEIGHT: 10,
    MAX_CHARACTERS_PER_TEAM: 3,
    MOVEMENT_POINTS_PER_TURN: 2,
    MELEE_ATTACK_RANGE: 1,
    RANGED_ATTACK_RANGE: 4,
    TURN_TIME_LIMIT: 60, // секунды
    // Прогрессия уровней
    LEVEL_UP_EXP_BASE: 100,
    LEVEL_UP_EXP_MULTIPLIER: 1.5,
    // Открытие слотов
    SLOT_UNLOCK_LEVELS: {
        [EquipmentSlot.WEAPON]: 1,
        [EquipmentSlot.ARMOR]: 1,
        [EquipmentSlot.ACCESSORY1]: 5,
        [EquipmentSlot.ACCESSORY2]: 10,
    },
    // Рост характеристик за уровень
    HP_PER_LEVEL: 10,
    DAMAGE_PER_LEVEL: 2,
    ARMOR_PER_LEVEL: 1,
};
//# sourceMappingURL=index.js.map