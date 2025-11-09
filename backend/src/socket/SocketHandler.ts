import { Server as SocketIOServer, Socket } from 'socket.io';
import { 
  SocketEvents, 
  CreateRoomPayload, 
  JoinRoomPayload, 
  PlayCardPayload,
  Player,
  ChatMessage,
  RoomStatus,
  GameType
} from '../../../shared/types';
import { RoomManager } from '../services/RoomManager';
import { v4 as uuidv4 } from 'uuid';
import { log } from 'console';

export class SocketHandler {
  private io: SocketIOServer;
  private roomManager: RoomManager;
  private socketToPlayer: Map<string, { playerId: string; roomId: string }>;

  constructor(io: SocketIOServer, roomManager: RoomManager) {
    this.io = io;
    this.roomManager = roomManager;
    this.socketToPlayer = new Map();
  }

  /**
   * Initialize socket event handlers
   */
  initialize(): void {
    this.io.on(SocketEvents.CONNECT, (socket: Socket) => {
      console.log(`Client connected: ${socket.id}`);

      // Handle room creation
      socket.on(SocketEvents.CREATE_ROOM, (payload: CreateRoomPayload) => {
        this.handleCreateRoom(socket, payload);
      });

      // Handle joining room
      socket.on(SocketEvents.JOIN_ROOM, (payload: JoinRoomPayload) => {
        this.handleJoinRoom(socket, payload);
      });

      // Handle leaving room
      socket.on(SocketEvents.LEAVE_ROOM, () => {
        this.handleLeaveRoom(socket);
      });

      // Handle playing a card
      socket.on(SocketEvents.PLAY_CARD, (payload: PlayCardPayload) => {
        this.handlePlayCard(socket, payload);
      });

      // Handle chat messages
      socket.on(SocketEvents.SEND_MESSAGE, (message: string) => {
        this.handleChatMessage(socket, message);
      });

      // Handle disconnect
      socket.on(SocketEvents.DISCONNECT, () => {
        this.handleDisconnect(socket);
      });
    });
  }

  /**
   * Handle room creation
   */
  private handleCreateRoom(socket: Socket, payload: CreateRoomPayload): void {
    try {
      const room = this.roomManager.createRoom(payload.isPublic, payload.gameType);
      
      const player: Player = {
        id: uuidv4(),
        name: payload.playerName,
        socketId: socket.id,
        hand: [],
        isReady: true,
        position: 0,
        handsWon: 0,
        score: 0
      };

      this.roomManager.addPlayerToRoom(room.id, player);
      socket.join(room.id);
      
      this.socketToPlayer.set(socket.id, {
        playerId: player.id,
        roomId: room.id
      });

      socket.emit(SocketEvents.ROOM_CREATED, {
        room,
        playerId: player.id
      });

      console.log(`Room created: ${room.code} (${room.id}) by ${payload.playerName} for game ${room.gameType}`);
    } catch (error) {
      socket.emit(SocketEvents.ERROR, { message: 'Failed to create room' });
    }
  }

  /**
   * Handle joining a room
   */
  private handleJoinRoom(socket: Socket, payload: JoinRoomPayload): void {
    try {
      let room;
      console.log({payload})
      if (payload.roomCode) {
        // Join private room by code
        room = this.roomManager.getRoomByCode(payload.roomCode);
        console.log({room})
        if (!room) {
          socket.emit(SocketEvents.ROOM_NOT_FOUND);
          return;
        }
      } else {
        // Join or create public room for specified game type
        const gameType = payload.gameType || GameType.EASY_PEASY; // Default to Easy-Peasy
        room = this.roomManager.findOrCreatePublicRoom(gameType);
        console.log({room})
      }
    
      if (room.players.length >= room.maxPlayers) {
        socket.emit(SocketEvents.ROOM_FULL);
        return;
      }

      const player: Player = {
        id: uuidv4(),
        name: payload.playerName,
        socketId: socket.id,
        hand: [],
        isReady: true,
        position: room.players.length,
        handsWon: 0,
        score: 0
      };

      this.roomManager.addPlayerToRoom(room.id, player);
      socket.join(room.id);
      
      this.socketToPlayer.set(socket.id, {
        playerId: player.id,
        roomId: room.id
      });

      // Notify the joining player
      socket.emit(SocketEvents.ROOM_JOINED, {
        room,
        playerId: player.id
      });

      // Notify all players in the room
      this.io.to(room.id).emit(SocketEvents.PLAYER_JOINED, {
        player,
        room
      });

      // If room is full, start the game
      if (room.players.length === room.maxPlayers) {
        this.startGame(room.id);
      }

      console.log(`${payload.playerName} joined room ${room.code} (${room.gameType})`);
    } catch (error) {
      socket.emit(SocketEvents.ERROR, { message: 'Failed to join room' });
    }
  }

  /**
   * Handle leaving a room
   */
  private handleLeaveRoom(socket: Socket): void {
    const playerInfo = this.socketToPlayer.get(socket.id);
    if (!playerInfo) return;

    const { playerId, roomId } = playerInfo;
    const room = this.roomManager.getRoom(roomId);
    const player = this.roomManager.getPlayer(roomId, playerId);

    if (room && player) {
      this.roomManager.removePlayerFromRoom(roomId, playerId);
      socket.leave(roomId);
      this.socketToPlayer.delete(socket.id);

      // Notify remaining players
      this.io.to(roomId).emit(SocketEvents.PLAYER_LEFT, {
        playerId,
        playerName: player.name,
        room
      });

      console.log(`${player.name} left room ${room.code}`);
    }
  }

  /**
   * Handle playing a card
   */
  private handlePlayCard(socket: Socket, payload: PlayCardPayload): void {
    const playerInfo = this.socketToPlayer.get(socket.id);
    if (!playerInfo) return;

    const { roomId } = playerInfo;
    const room = this.roomManager.getRoom(roomId);

    if (!room) {
      socket.emit(SocketEvents.ERROR, { message: 'Room not found' });
      return;
    }

    // Play the card using room manager
    const result = this.roomManager.playCard(roomId, payload.playerId, payload.cardId);

    if (!result.success) {
      socket.emit(SocketEvents.ERROR, { message: result.error });
      return;
    }

    // Get the player and card info
    const player = this.roomManager.getPlayer(roomId, payload.playerId);
    const currentHand = room.currentHand;
    const playedCard = currentHand.cards[currentHand.cards.length - 1];

    // Broadcast card played event
    this.io.to(roomId).emit(SocketEvents.CARD_PLAYED, {
      playerId: player?.id,
      playerName: player?.name,
      playerPosition: player?.position,
      card: playedCard.card,
      cardsInHand: currentHand.cards.length,
      leadingSuit: currentHand.leadingSuit
    });

    console.log(`${player?.name} played ${playedCard.card.rank} of ${playedCard.card.suit}`);

    // Check if hand is complete
    if (this.roomManager.isHandComplete(roomId)) {
      this.handleHandComplete(roomId);
    } else {
      // Move to next turn
      this.roomManager.nextTurn(roomId);
      const updatedRoom = this.roomManager.getRoom(roomId);
      
      if (updatedRoom) {
        this.io.to(roomId).emit(SocketEvents.TURN_CHANGE, {
          currentTurn: updatedRoom.currentTurn,
          nextPlayer: updatedRoom.players[updatedRoom.currentTurn]
        });
      }
    }
  }

  /**
   * Handle hand completion
   */
  private handleHandComplete(roomId: string): void {
    const room = this.roomManager.getRoom(roomId);
    if (!room) return;

    // Complete the hand and get winner
    const result = this.roomManager.completeHand(roomId);
    if (!result) return;

    const { winnerId, winnerPosition, winningCard, trumpDecision } = result;
    const winner = room.players.find(p => p.id === winnerId);

    if (!winner) return;

    // Broadcast hand complete event
    this.io.to(roomId).emit(SocketEvents.HAND_COMPLETE, {
      handNumber: room.completedHands.length,
      cards: room.completedHands[room.completedHands.length - 1].cards
    });

    // Broadcast hand winner
    this.io.to(roomId).emit(SocketEvents.HAND_WINNER, {
      playerId: winnerId,
      playerName: winner.name,
      playerPosition: winnerPosition,
      winningCard,
      handNumber: room.completedHands.length,
      handsWon: winner.handsWon
    });

    // For Dehla-Pakad: Check if trump was just decided
    if (trumpDecision && trumpDecision.trumpDecided && trumpDecision.trumpSuit) {
      this.io.to(roomId).emit(SocketEvents.TRUMP_DECIDED, {
        trumpSuit: trumpDecision.trumpSuit,
        case: trumpDecision.case,
        suitsPlayed: trumpDecision.suitsPlayed
      });

      // Distribute additional cards
      const distributed = this.roomManager.distributeAdditionalCards(roomId);
      if (distributed) {
        // Send new cards to each player privately
        const updatedRoom = this.roomManager.getRoom(roomId);
        updatedRoom?.players.forEach(player => {
          const socket = this.io.sockets.sockets.get(player.socketId);
          if (socket) {
            socket.emit(SocketEvents.ADDITIONAL_CARDS_DEALT, {
              hand: player.hand,
              totalCards: player.hand.length
            });
          }
        });

        console.log(`Trump decided in room ${room.code}: ${trumpDecision.trumpSuit} (Case ${trumpDecision.case})`);
      }
    }

    // Broadcast score update
    const gameState = this.roomManager.getGameState(roomId);
    this.io.to(roomId).emit(SocketEvents.SCORE_UPDATE, {
      scores: gameState?.scores || []
    });

    console.log(`Hand ${room.completedHands.length} won by ${winner.name} with ${winningCard.rank} of ${winningCard.suit}`);

    // Check if game is over
    if (room.status === RoomStatus.FINISHED) {
      this.handleGameEnd(roomId);
    } else {
      // Start new hand
      setTimeout(() => {
        const updatedRoom = this.roomManager.getRoom(roomId);
        if (updatedRoom) {
          this.io.to(roomId).emit(SocketEvents.NEW_HAND_START, {
            handNumber: updatedRoom.currentHand.handNumber,
            startingPlayer: updatedRoom.players[updatedRoom.currentTurn]
          });

          this.io.to(roomId).emit(SocketEvents.TURN_CHANGE, {
            currentTurn: updatedRoom.currentTurn,
            nextPlayer: updatedRoom.players[updatedRoom.currentTurn]
          });
        }
      }, 3000); // 3 second delay before next hand
    }
  }

  /**
   * Handle game end
   */
  private handleGameEnd(roomId: string): void {
    const winners = this.roomManager.getGameWinners(roomId);
    const gameState = this.roomManager.getGameState(roomId);

    if (winners.length > 0) {
      this.io.to(roomId).emit(SocketEvents.GAME_WINNER, {
        winners,
        finalScores: gameState?.scores || [],
        totalHands: gameState?.totalHands || 13
      });

      console.log(`Game ended in room ${roomId}. Winner(s): ${winners.map(w => w.name).join(', ')}`);
    }
  }

  /**
   * Handle chat messages
   */
  private handleChatMessage(socket: Socket, message: string): void {
    const playerInfo = this.socketToPlayer.get(socket.id);
    if (!playerInfo) return;

    const { playerId, roomId } = playerInfo;
    const player = this.roomManager.getPlayer(roomId, playerId);

    if (!player) return;

    const chatMessage: ChatMessage = {
      playerId: player.id,
      playerName: player.name,
      message,
      timestamp: new Date()
    };

    this.io.to(roomId).emit(SocketEvents.RECEIVE_MESSAGE, chatMessage);
  }

  /**
   * Handle client disconnect
   */
  private handleDisconnect(socket: Socket): void {
    console.log(`Client disconnected: ${socket.id}`);
    this.handleLeaveRoom(socket);
  }

  /**
   * Start the game and deal cards
   */
  private startGame(roomId: string): void {
    const room = this.roomManager.getRoom(roomId);
    if (!room) return;

    // Emit game start event
    this.io.to(roomId).emit(SocketEvents.GAME_START, {
      room,
      message: 'Game is starting!'
    });

    // Deal cards to each player (send privately)
    room.players.forEach(player => {
      const socket = this.io.sockets.sockets.get(player.socketId);
      if (socket) {
        socket.emit(SocketEvents.CARDS_DEALT, {
          hand: player.hand
        });
      }
    });

    console.log(`Game started in room ${room.code}`);
  }
}
