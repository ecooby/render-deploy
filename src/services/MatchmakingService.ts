import { Server, Socket } from 'socket.io';
import { MatchFound, Team, SocketEvent, GameState } from '../../shared/types';
import { BattleManager } from '../game/BattleManager';

interface QueuedPlayer {
  id: string;
  socketId: string;
  rating: number;
  joinedAt: Date;
}

/**
 * Сервис поиска матчей
 */
export class MatchmakingService {
  private queue: Map<string, QueuedPlayer> = new Map();
  private battleManager: BattleManager;
  private io: Server;
  private onBattleCreated?: (gameState: GameState) => void;

  constructor(io: Server, battleManager: BattleManager, onBattleCreated?: (gameState: GameState) => void) {
    this.io = io;
    this.battleManager = battleManager;
    this.onBattleCreated = onBattleCreated;
  }

  /**
   * Добавить игрока в очередь
   */
  addToQueue(socket: Socket, playerId: string, rating = 1000) {

    if (this.queue.has(playerId)) {
      socket.emit(SocketEvent.BATTLE_ERROR, { message: 'Already in queue' });
      return;
    }

    const player: QueuedPlayer = {
      id: playerId,
      socketId: socket.id,
      rating,
      joinedAt: new Date(),
    };

    this.queue.set(playerId, player);
    console.log(`Player ${playerId} joined matchmaking queue`);


    this.tryMatchPlayers(player);
  }

  /**
   * Удалить игрока из очереди
   */
  removeFromQueue(playerId: string) {
    if (this.queue.has(playerId)) {
      this.queue.delete(playerId);
      console.log(`Player ${playerId} left matchmaking queue`);
    }
  }

  /**
   * Попытка найти матч для игрока
   */
  private tryMatchPlayers(player: QueuedPlayer) {

    for (const [opponentId, opponent] of this.queue) {

      if (opponentId === player.id) continue;


      const ratingDiff = Math.abs(player.rating - opponent.rating);
      if (ratingDiff > 200) continue;


      this.createMatch(player, opponent);
      return;
    }


    console.log(`No opponent found for player ${player.id}, waiting...`);
  }

  /**
   * Создать матч между двумя игроками
   */
  private createMatch(player1: QueuedPlayer, player2: QueuedPlayer) {

    this.queue.delete(player1.id);
    this.queue.delete(player2.id);


    const gameState = this.battleManager.createBattle(player1.id, player2.id);


    if (this.onBattleCreated) {
      this.onBattleCreated(gameState);
    }

    console.log(`Match created: ${player1.id} vs ${player2.id}`);


    const player1Socket = this.io.sockets.sockets.get(player1.socketId);
    const player2Socket = this.io.sockets.sockets.get(player2.socketId);

    if (player1Socket && player2Socket) {

      player1Socket.join(gameState.id);
      player2Socket.join(gameState.id);


      const matchFoundPlayer1: MatchFound = {
        battleId: gameState.id,
        opponent: {
          id: player2.id,
          name: `Player ${player2.id.substring(0, 8)}`,
        },
        yourTeam: Team.PLAYER1,
      };

      const matchFoundPlayer2: MatchFound = {
        battleId: gameState.id,
        opponent: {
          id: player1.id,
          name: `Player ${player1.id.substring(0, 8)}`,
        },
        yourTeam: Team.PLAYER2,
      };

      player1Socket.emit(SocketEvent.MATCHMAKING_FOUND, matchFoundPlayer1);
      player2Socket.emit(SocketEvent.MATCHMAKING_FOUND, matchFoundPlayer2);


      this.io.to(gameState.id).emit(SocketEvent.BATTLE_STATE, gameState);
    }
  }

  /**
   * Получить размер очереди
   */
  getQueueSize(): number {
    return this.queue.size;
  }

  /**
   * Очистить очередь (для тестирования)
   */
  clearQueue() {
    this.queue.clear();
  }
}
