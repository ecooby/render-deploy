import { Server, Socket } from 'socket.io';
import { SocketEvent, BattleAction, GameState, Team, ActionType } from '../../shared/types';
import { BattleManager } from '../game/BattleManager';
import { MatchmakingService } from '../services/MatchmakingService';
import { BotAI } from '../game/BotAI';
import { TimerManager } from '../game/TimerManager';
import { databaseService } from '../services/DatabaseService';

/**
 * Главный обработчик Socket.io соединений
 */
export class SocketHandler {
  private io: Server;
  private battleManager: BattleManager;
  private matchmakingService: MatchmakingService;
  private botAI: BotAI;
  private timerManager: TimerManager;
  private activeBattles: Map<string, GameState> = new Map();
  private playerSockets: Map<string, string> = new Map(); // playerId -> socketId

  constructor(io: Server) {
    this.io = io;
    this.battleManager = new BattleManager();
    this.botAI = new BotAI(this.battleManager);
    this.timerManager = new TimerManager();
    this.matchmakingService = new MatchmakingService(
      io,
      this.battleManager,
      (gameState: GameState) => {
        this.activeBattles.set(gameState.id, gameState);

        this.startBattleTimers(gameState.id, gameState);
      },
    );
  }

  /**
   * Инициализация обработчиков
   */
  initialize() {
    this.io.on(SocketEvent.CONNECT, (socket: Socket) => {
      console.log(`Client connected: ${socket.id}`);


      const playerId = socket.handshake.auth.playerId || socket.id;
      this.playerSockets.set(playerId, socket.id);


      this.registerMatchmakingHandlers(socket, playerId);
      this.registerBattleHandlers(socket, playerId);
      this.registerDisconnectHandler(socket, playerId);
    });
  }

  /**
   * Обработчики matchmaking
   */
  private registerMatchmakingHandlers(socket: Socket, playerId: string) {

    socket.on(SocketEvent.MATCHMAKING_JOIN, () => {
      console.log(`Player ${playerId} joining matchmaking`);
      this.matchmakingService.addToQueue(socket, playerId);
    });


    socket.on(SocketEvent.MATCHMAKING_BOT, () => {
      console.log(`Player ${playerId} requested Bot game`);
      const battle = this.battleManager.createBattle(playerId, 'AI_BOT');
      this.activeBattles.set(battle.id, battle);
      
      socket.emit(SocketEvent.MATCHMAKING_FOUND, {
        battleId: battle.id,
        opponent: { id: 'AI_BOT', name: 'Bot' },
        yourTeam: Team.PLAYER1
      });
    });


    socket.on(SocketEvent.MATCHMAKING_LEAVE, () => {
      console.log(`Player ${playerId} leaving matchmaking`);
      this.matchmakingService.removeFromQueue(playerId);
    });
  }

  /**
   * Обработчики битвы
   */
  private registerBattleHandlers(socket: Socket, playerId: string) {

    socket.on(SocketEvent.BATTLE_JOIN, (battleId: string) => {
      const gameState = this.activeBattles.get(battleId);
      if (!gameState) {
        socket.emit(SocketEvent.BATTLE_ERROR, { message: 'Battle not found' });
        return;
      }


      const isParticipant = playerId === gameState.player1Id || playerId === gameState.player2Id;
      const role = isParticipant ? 'participant' : 'spectator';
      
      console.log(`Player ${playerId} joining battle ${battleId} as ${role}`);
      socket.join(battleId);


      socket.emit(SocketEvent.BATTLE_STATE, {
        ...gameState,
        spectatorMode: !isParticipant
      });
    });


    socket.on(SocketEvent.BATTLE_ACTION, (data: { battleId: string; action: BattleAction }) => {
      console.log(`Player ${playerId} action in battle ${data.battleId}:`, data.action.type);
      
      this.processBattleAction(data.battleId, data.action, playerId);
    });
  }

  private processBattleAction(battleId: string, action: BattleAction, playerId: string) {
    const gameState = this.activeBattles.get(battleId);
    if (!gameState) {
      return;
    }


    const isParticipant = playerId === gameState.player1Id || playerId === gameState.player2Id;
    if (!isParticipant) {
      console.warn(`⚠️ Spectator ${playerId} attempted to perform action in battle ${battleId}`);
      this.io.to(battleId).emit(SocketEvent.BATTLE_ERROR, {
        message: 'Spectators cannot perform actions'
      });
      return;
    }


      const result = this.battleManager.processAction(action, playerId, gameState);

      if (!result.success) {

        const socketId = this.playerSockets.get(playerId);
        if (socketId) {
           this.io.to(socketId).emit(SocketEvent.BATTLE_ERROR, { message: result.error });
        }
        return;
      }


      if (result.newState) {
        this.activeBattles.set(battleId, result.newState);


        this.io.to(battleId).emit(SocketEvent.BATTLE_UPDATE, {
          gameState: result.newState,
          action: action,
          damage: result.damage,
          killedCharacterId: result.killedCharacterId,
        });


        if (result.newState.status === 'finished') {
          this.timerManager.clearAllTimers(battleId);
          this.handleBattleEnd(battleId, result.newState);
        } else {

           if (action.type === ActionType.END_TURN) {
             this.timerManager.startTurnTimer(battleId, result.newState, (bId) => {
               this.handleTurnTimeout(bId);
             });
           }
           
           // Check if it's bot's turn
           if (result.newState.currentTurn === Team.PLAYER2 && result.newState.player2Id === 'AI_BOT') {
              this.handleBotTurn(battleId, result.newState);
           }
        }
      }
  }

  private async handleBotTurn(battleId: string, gameState: GameState) {
    setTimeout(() => {
       const action = this.botAI.calculateMove(gameState, Team.PLAYER2);
       this.processBattleAction(battleId, action, 'AI_BOT');
    }, 1000);
  }

  /**
   * Обработчик отключения
   */
  private registerDisconnectHandler(socket: Socket, playerId: string) {
    socket.on(SocketEvent.DISCONNECT, () => {
      console.log(`Client disconnected: ${socket.id} (Player: ${playerId})`);


      this.matchmakingService.removeFromQueue(playerId);


      this.playerSockets.delete(playerId);



    });
  }

  /**
   * Запуск таймеров для битвы
   */
  private startBattleTimers(battleId: string, gameState: GameState): void {

    this.timerManager.startTurnTimer(battleId, gameState, (bId) => {
      this.handleTurnTimeout(bId);
    });


    this.timerManager.startBattleTimer(battleId, gameState, (bId) => {
      this.handleBattleTimeout(bId);
    });
  }

  /**
   * Обработка истечения времени хода
   */
  private handleTurnTimeout(battleId: string): void {
    const gameState = this.activeBattles.get(battleId);
    if (!gameState || gameState.status !== 'active') {
      return;
    }

    console.log(`⏰ Turn timeout - auto ending turn for ${gameState.currentTurn}`);


    const action: BattleAction = {
      type: ActionType.END_TURN,
    };

    this.processBattleAction(battleId, action, 'SYSTEM');
  }

  /**
   * Обработка истечения времени битвы
   */
  private handleBattleTimeout(battleId: string): void {
    const gameState = this.activeBattles.get(battleId);
    if (!gameState || gameState.status !== 'active') {
      return;
    }

    console.log(`⏰ Battle timeout - determining winner by remaining forces`);


    gameState.winner = this.timerManager.determineWinnerByTime(gameState);
    gameState.status = 'finished';
    this.activeBattles.set(battleId, gameState);


    this.timerManager.clearAllTimers(battleId);


    this.handleBattleEnd(battleId, gameState);
  }

  /**
   * Обработка окончания битвы
   */
  private async handleBattleEnd(battleId: string, gameState: GameState) {
    console.log(`Battle ${battleId} ended. Winner: ${gameState.winner}`);

    // Update player stats in database
    try {
      const winnerId = gameState.winner === Team.PLAYER1 ? gameState.player1Id : gameState.player2Id;
      const loserId = gameState.winner === Team.PLAYER1 ? gameState.player2Id : gameState.player1Id;

      // Skip stats update for AI bot
      if (winnerId !== 'AI_BOT') {
        await databaseService.updatePlayerStats(winnerId, {
          wins: 1,
          gamesPlayed: 1
        });
      }

      if (loserId !== 'AI_BOT') {
        await databaseService.updatePlayerStats(loserId, {
          losses: 1,
          gamesPlayed: 1
        });
      }

      console.log(`Stats updated for battle ${battleId}`);
    } catch (error) {
      console.error('Error updating stats:', error);
    }


    this.io.to(battleId).emit(SocketEvent.BATTLE_END, {
      winner: gameState.winner,
      rewards: {
        experience: 100,
        gold: 50,
      },
    });


    setTimeout(() => {
      this.activeBattles.delete(battleId);
      this.timerManager.clearAllTimers(battleId);
      console.log(`Battle ${battleId} removed from active battles`);
    }, 30000);
  }

  /**
   * Получить количество онлайн игроков
   */
  getOnlinePlayersCount(): number {
    return this.io.sockets.sockets.size;
  }

  /**
   * Получить количество активных игр
   */
  getActiveGamesCount(): number {
    return this.activeBattles.size;
  }

  /**
   * Получить размер очереди matchmaking
   */
  getQueueSize(): number {
    return this.matchmakingService.getQueueSize();
  }
}
