// ============================================

// ============================================


export interface Position {
  x: number;
  y: number;
}


export enum CombatType {
  MELEE = 'MELEE',
  RANGED = 'RANGED',
}


export enum Team {
  PLAYER1 = 'PLAYER1',
  PLAYER2 = 'PLAYER2',
}


export enum EquipmentSlot {
  WEAPON = 'WEAPON',
  ARMOR = 'ARMOR',
  ACCESSORY1 = 'ACCESSORY1',
  ACCESSORY2 = 'ACCESSORY2',
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
  movementPointsLeft?: number;
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
  

  turnStartTime?: number;
  turnTimeLimit: number;
  battleStartTime?: number;
  battleTimeLimit: number;
  

  createdAt: Date;
  updatedAt: Date;
}


export enum ActionType {
  MOVE = 'MOVE',
  ATTACK = 'ATTACK',
  END_TURN = 'END_TURN',
  EQUIP_ITEM = 'EQUIP_ITEM',
  SURRENDER = 'SURRENDER',
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


export interface SurrenderAction {
  type: ActionType.SURRENDER;
}


export type BattleAction = MoveAction | AttackAction | EndTurnAction | EquipItemAction | SurrenderAction;


export interface ActionResult {
  success: boolean;
  error?: string;
  newState?: GameState;
  damage?: number;
  killedCharacterId?: string;
}


export enum SocketEvent {

  CONNECT = 'connect',
  DISCONNECT = 'disconnect',
  
  // Matchmaking
  MATCHMAKING_JOIN = 'matchmaking:join',
  MATCHMAKING_LEAVE = 'matchmaking:leave',
  MATCHMAKING_FOUND = 'matchmaking:found',
  MATCHMAKING_BOT = 'matchmaking:bot',
  

  BATTLE_JOIN = 'battle:join',
  BATTLE_STATE = 'battle:state',
  BATTLE_ACTION = 'battle:action',
  BATTLE_UPDATE = 'battle:update',
  BATTLE_END = 'battle:end',
  BATTLE_ERROR = 'battle:error',
  

  PLAYER_DISCONNECTED = 'player:disconnected',
  PLAYER_RECONNECTED = 'player:reconnected',
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


export const GAME_CONSTANTS = {
  GRID_WIDTH: 8,
  GRID_HEIGHT: 10,
  MAX_CHARACTERS_PER_TEAM: 3,
  MOVEMENT_POINTS_PER_TURN: 15,
  MELEE_ATTACK_RANGE: 1,
  RANGED_ATTACK_RANGE: 4,
  TURN_TIME_LIMIT: 15,
  BATTLE_TIME_LIMIT: 900,
  

  LEVEL_UP_EXP_BASE: 100,
  LEVEL_UP_EXP_MULTIPLIER: 1.5,
  

  SLOT_UNLOCK_LEVELS: {
    [EquipmentSlot.WEAPON]: 1,
    [EquipmentSlot.ARMOR]: 1,
    [EquipmentSlot.ACCESSORY1]: 5,
    [EquipmentSlot.ACCESSORY2]: 10,
  },
  

  HP_PER_LEVEL: 10,
  DAMAGE_PER_LEVEL: 2,
  ARMOR_PER_LEVEL: 1,
};
