// ============================================
// SHARED TYPES - Используются клиентом и сервером
// ============================================

// Позиция на поле
export interface Position {
  x: number;
  y: number;
}

// Тип боя
export enum CombatType {
  MELEE = 'MELEE',   // Ближний бой
  RANGED = 'RANGED', // Дальний бой
}

// Команда
export enum Team {
  PLAYER1 = 'PLAYER1',
  PLAYER2 = 'PLAYER2',
}

// Слот экипировки
export enum EquipmentSlot {
  WEAPON = 'WEAPON',
  ARMOR = 'ARMOR',
  ACCESSORY1 = 'ACCESSORY1',
  ACCESSORY2 = 'ACCESSORY2',
}

// Предмет экипировки
export interface Equipment {
  id: string;
  name: string;
  slot: EquipmentSlot;
  damageBonus?: number;
  armorBonus?: number;
  hpBonus?: number;
  requiredLevel: number;
}

// Персонаж
export interface Character {
  id: string;
  name: string;
  level: number;
  experience: number;
  
  // Позиция на поле
  position: Position;
  
  // Характеристики
  maxHp: number;
  currentHp: number;
  baseDamage: number;
  baseArmor: number;
  combatType: CombatType;
  
  // Экипировка
  equipment: {
    [EquipmentSlot.WEAPON]?: Equipment;
    [EquipmentSlot.ARMOR]?: Equipment;
    [EquipmentSlot.ACCESSORY1]?: Equipment;
    [EquipmentSlot.ACCESSORY2]?: Equipment;
  };
  
  // Открытые слоты (по уровням)
  unlockedSlots: EquipmentSlot[];
  
  // Команда
  team: Team;
  
  // Состояние
  isAlive: boolean;
  hasMoved: boolean;
  hasAttacked: boolean;
}

// Клетка на поле
export interface Cell {
  position: Position;
  characterId?: string;
  isHighlighted?: boolean;
  highlightType?: 'move' | 'attack';
}

// Состояние игры
export interface GameState {
  id: string;
  
  // Игроки
  player1Id: string;
  player2Id: string;
  
  // Поле
  gridWidth: number;
  gridHeight: number;
  
  // Персонажи
  characters: Character[];
  
  // Текущий ход
  currentTurn: Team;
  turnNumber: number;
  
  // Оставшиеся очки передвижения за ход
  movementPointsLeft: number;
  
  // Статус игры
  status: 'waiting' | 'active' | 'finished';
  winner?: Team;
  
  // Таймеры
  turnStartTime?: number; // Timestamp начала текущего хода
  turnTimeLimit: number; // Лимит времени на ход в секундах
  battleStartTime?: number; // Timestamp начала битвы
  battleTimeLimit: number; // Лимит времени на всю битву в секундах
  
  // Время
  createdAt: Date;
  updatedAt: Date;
}

// Типы действий
export enum ActionType {
  MOVE = 'MOVE',
  ATTACK = 'ATTACK',
  END_TURN = 'END_TURN',
  EQUIP_ITEM = 'EQUIP_ITEM',
}

// Действие перемещения
export interface MoveAction {
  type: ActionType.MOVE;
  characterId: string;
  from: Position;
  to: Position;
}

// Действие атаки
export interface AttackAction {
  type: ActionType.ATTACK;
  attackerId: string;
  targetId: string;
}

// Действие завершения хода
export interface EndTurnAction {
  type: ActionType.END_TURN;
}

// Действие экипировки
export interface EquipItemAction {
  type: ActionType.EQUIP_ITEM;
  characterId: string;
  equipmentId: string;
}

// Объединенный тип действий
export type BattleAction = MoveAction | AttackAction | EndTurnAction | EquipItemAction;

// Результат действия
export interface ActionResult {
  success: boolean;
  error?: string;
  newState?: GameState;
  damage?: number;
  killedCharacterId?: string;
}

// События Socket.io
export enum SocketEvent {
  // Подключение
  CONNECT = 'connect',
  DISCONNECT = 'disconnect',
  
  // Matchmaking
  MATCHMAKING_JOIN = 'matchmaking:join',
  MATCHMAKING_LEAVE = 'matchmaking:leave',
  MATCHMAKING_FOUND = 'matchmaking:found',
  MATCHMAKING_BOT = 'matchmaking:bot',
  
  // Битва
  BATTLE_JOIN = 'battle:join',
  BATTLE_STATE = 'battle:state',
  BATTLE_ACTION = 'battle:action',
  BATTLE_UPDATE = 'battle:update',
  BATTLE_END = 'battle:end',
  BATTLE_ERROR = 'battle:error',
  
  // Игрок
  PLAYER_DISCONNECTED = 'player:disconnected',
  PLAYER_RECONNECTED = 'player:reconnected',
}

// Данные найденного матча
export interface MatchFound {
  battleId: string;
  opponent: {
    id: string;
    name: string;
  };
  yourTeam: Team;
}

// Результат битвы
export interface BattleResult {
  winner: Team;
  rewards: {
    experience: number;
    gold: number;
  };
}

// Константы игры
export const GAME_CONSTANTS = {
  GRID_WIDTH: 8,
  GRID_HEIGHT: 10,
  MAX_CHARACTERS_PER_TEAM: 3,
  MOVEMENT_POINTS_PER_TURN: 5, // Увеличено с 2 до 5 для лучшего геймплея
  MELEE_ATTACK_RANGE: 1,
  RANGED_ATTACK_RANGE: 4,
  TURN_TIME_LIMIT: 30, // секунды на ход
  BATTLE_TIME_LIMIT: 600, // секунды на всю битву (10 минут)
  
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
