export interface Position {
    x: number;
    y: number;
}
export declare enum CombatType {
    MELEE = "MELEE",// Ближний бой
    RANGED = "RANGED"
}
export declare enum Team {
    PLAYER1 = "PLAYER1",
    PLAYER2 = "PLAYER2"
}
export declare enum EquipmentSlot {
    WEAPON = "WEAPON",
    ARMOR = "ARMOR",
    ACCESSORY1 = "ACCESSORY1",
    ACCESSORY2 = "ACCESSORY2"
}
export interface Equipment {
    id: string;
    name: string;
    slot: EquipmentSlot;
    damageBonus?: number;
    armorBonus?: number;
    hpBonus?: number;
    requiredLevel: number;
}
export interface Character {
    id: string;
    name: string;
    level: number;
    experience: number;
    position: Position;
    maxHp: number;
    currentHp: number;
    baseDamage: number;
    baseArmor: number;
    combatType: CombatType;
    equipment: {
        [EquipmentSlot.WEAPON]?: Equipment;
        [EquipmentSlot.ARMOR]?: Equipment;
        [EquipmentSlot.ACCESSORY1]?: Equipment;
        [EquipmentSlot.ACCESSORY2]?: Equipment;
    };
    unlockedSlots: EquipmentSlot[];
    team: Team;
    isAlive: boolean;
    hasMoved: boolean;
    hasAttacked: boolean;
}
export interface Cell {
    position: Position;
    characterId?: string;
    isHighlighted?: boolean;
    highlightType?: 'move' | 'attack';
}
export interface GameState {
    id: string;
    player1Id: string;
    player2Id: string;
    gridWidth: number;
    gridHeight: number;
    characters: Character[];
    currentTurn: Team;
    turnNumber: number;
    movementPointsLeft: number;
    status: 'waiting' | 'active' | 'finished';
    winner?: Team;
    createdAt: Date;
    updatedAt: Date;
}
export declare enum ActionType {
    MOVE = "MOVE",
    ATTACK = "ATTACK",
    END_TURN = "END_TURN",
    EQUIP_ITEM = "EQUIP_ITEM"
}
export interface MoveAction {
    type: ActionType.MOVE;
    characterId: string;
    from: Position;
    to: Position;
}
export interface AttackAction {
    type: ActionType.ATTACK;
    attackerId: string;
    targetId: string;
}
export interface EndTurnAction {
    type: ActionType.END_TURN;
}
export interface EquipItemAction {
    type: ActionType.EQUIP_ITEM;
    characterId: string;
    equipmentId: string;
}
export type BattleAction = MoveAction | AttackAction | EndTurnAction | EquipItemAction;
export interface ActionResult {
    success: boolean;
    error?: string;
    newState?: GameState;
    damage?: number;
    killedCharacterId?: string;
}
export declare enum SocketEvent {
    CONNECT = "connect",
    DISCONNECT = "disconnect",
    MATCHMAKING_JOIN = "matchmaking:join",
    MATCHMAKING_LEAVE = "matchmaking:leave",
    MATCHMAKING_FOUND = "matchmaking:found",
    MATCHMAKING_BOT = "matchmaking:bot",
    BATTLE_JOIN = "battle:join",
    BATTLE_STATE = "battle:state",
    BATTLE_ACTION = "battle:action",
    BATTLE_UPDATE = "battle:update",
    BATTLE_END = "battle:end",
    BATTLE_ERROR = "battle:error",
    PLAYER_DISCONNECTED = "player:disconnected",
    PLAYER_RECONNECTED = "player:reconnected"
}
export interface MatchFound {
    battleId: string;
    opponent: {
        id: string;
        name: string;
    };
    yourTeam: Team;
}
export interface BattleResult {
    winner: Team;
    rewards: {
        experience: number;
        gold: number;
    };
}
export declare const GAME_CONSTANTS: {
    GRID_WIDTH: number;
    GRID_HEIGHT: number;
    MAX_CHARACTERS_PER_TEAM: number;
    MOVEMENT_POINTS_PER_TURN: number;
    MELEE_ATTACK_RANGE: number;
    RANGED_ATTACK_RANGE: number;
    TURN_TIME_LIMIT: number;
    LEVEL_UP_EXP_BASE: number;
    LEVEL_UP_EXP_MULTIPLIER: number;
    SLOT_UNLOCK_LEVELS: {
        WEAPON: number;
        ARMOR: number;
        ACCESSORY1: number;
        ACCESSORY2: number;
    };
    HP_PER_LEVEL: number;
    DAMAGE_PER_LEVEL: number;
    ARMOR_PER_LEVEL: number;
};
//# sourceMappingURL=index.d.ts.map