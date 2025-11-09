import { Room, Player, RoomStatus, Suit, Hand, CardPlay, GameType, TrumpDecisionResult } from '../../../shared/types';
import { v4 as uuidv4 } from 'uuid';
import { Deck } from '../models/Deck';
import { BaseGameRules } from './BaseGameRules';
import { GameRulesFactory } from './GameRulesFactory';
import { DehlaPakadRules } from './DehlaPakadRules';

export class RoomManager {
  private rooms: Map<string, Room>;
  private publicRooms: Map<GameType, Set<string>>; // Game type -> Room IDs
  private roomCodeMap: Map<string, string>; // code -> roomId mapping
  private gameRulesMap: Map<string, BaseGameRules>; // roomId -> game rules instance

  constructor() {
    this.rooms = new Map();
    this.publicRooms = new Map([
      [GameType.EASY_PEASY, new Set()],
      [GameType.DEHLA_PAKAD, new Set()],
      [GameType.TEEN_DO_PANCH, new Set()]
    ]);
    this.roomCodeMap = new Map();
    this.gameRulesMap = new Map();
  }

  /**
   * Generate a unique 6-character room code
   */
  private generateRoomCode(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code: string;
    do {
      code = '';
      for (let i = 0; i < 6; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
      }
    } while (this.roomCodeMap.has(code));
    return code;
  }

  /**
   * Create a new room
   */
  createRoom(isPublic: boolean, gameType: GameType): Room {
    const roomId = uuidv4();
    const code = this.generateRoomCode();
    
    // Create game rules instance for this room
    const gameRules = GameRulesFactory.createGameRules(gameType);
    this.gameRulesMap.set(roomId, gameRules);
    
    const room: Room = {
      id: roomId,
      code,
      isPublic,
      gameType,
      players: [],
      maxPlayers: 4,
      status: RoomStatus.WAITING,
      currentTurn: 0,
      deck: [],
      createdAt: new Date(),
      trumpSuit: gameType === GameType.EASY_PEASY ? Suit.SPADES : undefined,
      trumpDecided: gameType === GameType.EASY_PEASY, // Easy-Peasy has fixed trump
      trumpDecisionPhase: (gameType === GameType.DEHLA_PAKAD) || (gameType === GameType.TEEN_DO_PANCH),  // Dehla-Pakad starts in decision phase
      cardsPerPlayer: gameRules.getInitialCardCount(),
      currentHand: {
        handNumber: 1,
        cards: [],
        leadingSuit: undefined,
        winnerId: undefined,
        winnerPosition: undefined
      },
      completedHands: [],
      totalHands: gameRules.getTotalHands()
    };
    console.log({room})
    this.rooms.set(roomId, room);
    this.roomCodeMap.set(code, roomId);
    
    if (isPublic) {
      this.publicRooms.get(gameType)?.add(roomId);
    }

    return room;
  }

  /**
   * Find an available public room or create a new one
   */
  findOrCreatePublicRoom(gameType: GameType): Room {
    // Find an existing public room with space for the specified game type
    const publicRoomsForGame = this.publicRooms.get(gameType);
    console.log({publicRoomsForGame})
    if (publicRoomsForGame) {
      for (const roomId of publicRoomsForGame) {
        const room = this.rooms.get(roomId);
        if (room && room.players.length < room.maxPlayers) {
          return room;
        }
      }
    }

    // No available room found, create a new one
    return this.createRoom(true, gameType);
  }

  /**
   * Get room by ID
   */
  getRoom(roomId: string): Room | undefined {
    return this.rooms.get(roomId);
  }

  /**
   * Get room by code
   */
  getRoomByCode(code: string): Room | undefined {
    const roomId = this.roomCodeMap.get(code);
    return roomId ? this.rooms.get(roomId) : undefined;
  }

  /**
   * Add player to room
   */
  addPlayerToRoom(roomId: string, player: Player): boolean {
    const room = this.rooms.get(roomId);
    if (!room || room.players.length >= room.maxPlayers) {
      return false;
    }

    player.position = room.players.length;
    player.handsWon = 0; // Initialize hands won
    player.score = 0; // Initialize score
    room.players.push(player);

    // If room is full, remove from public rooms and start game
    if (room.players.length === room.maxPlayers) {
      this.publicRooms.get(room.gameType)?.delete(roomId);
      this.startGame(roomId);
    }

    return true;
  }

  /**
   * Remove player from room
   */
  removePlayerFromRoom(roomId: string, playerId: string): boolean {
    const room = this.rooms.get(roomId);
    if (!room) return false;

    const initialLength = room.players.length;
    room.players = room.players.filter(p => p.id !== playerId);

    // Update positions
    room.players.forEach((p, index) => {
      p.position = index;
    });

    // If game was in progress and player left, end the game
    if (room.status === RoomStatus.IN_PROGRESS && room.players.length < room.maxPlayers) {
      room.status = RoomStatus.FINISHED;
      this.publicRooms.get(room.gameType)?.delete(roomId);
    }

    // If room is empty, delete it
    if (room.players.length === 0) {
      this.deleteRoom(roomId);
    }

    return initialLength !== room.players.length;
  }

  /**
   * Start the game in a room
   */
  private startGame(roomId: string): void {
    const room = this.rooms.get(roomId);
    if (!room || room.players.length !== room.maxPlayers) return;

    const gameRules = this.gameRulesMap.get(roomId);
    if (!gameRules) return;

    // Initialize deck
    const deck = new Deck();
    deck.shuffle();

    // Deal cards based on game type
    const initialCardCount = gameRules.getInitialCardCount();
    const hands = deck.deal(4, initialCardCount);
    
    // Assign hands to players
    room.players.forEach((player, index) => {
      player.hand = hands[index];
    });

    // Update room state
    room.deck = deck.getRemainingCards();
    room.status = RoomStatus.IN_PROGRESS;
    room.startedAt = new Date();
    room.currentTurn = room.gameType === GameType.DEHLA_PAKAD 
      ? Math.floor(Math.random() * 4) // Random starting player for Dehla-Pakad
      : 0; // First player for Easy-Peasy
  }

  /**
   * Get player from room
   */
  getPlayer(roomId: string, playerId: string): Player | undefined {
    const room = this.rooms.get(roomId);
    return room?.players.find(p => p.id === playerId);
  }

  /**
   * Update current turn
   */
  nextTurn(roomId: string): void {
    const room = this.rooms.get(roomId);
    if (!room) return;

    room.currentTurn = (room.currentTurn + 1) % room.maxPlayers;
  }

  /**
   * Delete a room
   */
  deleteRoom(roomId: string): void {
    const room = this.rooms.get(roomId);
    if (room) {
      this.roomCodeMap.delete(room.code);
      this.publicRooms.get(room.gameType)?.delete(roomId);
      this.gameRulesMap.delete(roomId); // Clean up game rules instance
      this.rooms.delete(roomId);
    }
  }

  /**
   * Get all active rooms (for admin/debugging)
   */
  getAllRooms(): Room[] {
    return Array.from(this.rooms.values());
  }

  /**
   * Get room count
   */
  getRoomCount(): number {
    return this.rooms.size;
  }

  /**
   * Play a card in the current hand
   */
  playCard(roomId: string, playerId: string, cardId: string): { success: boolean; error?: string } {
    const room = this.rooms.get(roomId);
    if (!room) {
      return { success: false, error: 'Room not found' };
    }

    const gameRules = this.gameRulesMap.get(roomId);
    if (!gameRules) {
      return { success: false, error: 'Game rules not found' };
    }

    const player = room.players.find(p => p.id === playerId);
    if (!player) {
      return { success: false, error: 'Player not found' };
    }

    // Check if it's player's turn
    if (room.currentTurn !== player.position) {
      return { success: false, error: 'Not your turn' };
    }

    // Find and remove card from player's hand
    const cardIndex = player.hand.findIndex(c => c.id === cardId);
    if (cardIndex === -1) {
      return { success: false, error: 'Card not found in hand' };
    }

    const card = player.hand.splice(cardIndex, 1)[0];

    // Add card to current hand
    const cardPlay: CardPlay = {
      card,
      playerId: player.id,
      playerName: player.name,
      playerPosition: player.position
    };

    room.currentHand.cards.push(cardPlay);

    // Set leading suit if this is the first card
    if (room.currentHand.cards.length === 1) {
      room.currentHand.leadingSuit = gameRules.getLeadingSuit(room.currentHand.cards);
    }

    return { success: true };
  }

  /**
   * Check if current hand is complete (all 4 players have played)
   */
  isHandComplete(roomId: string): boolean {
    const room = this.rooms.get(roomId);
    if (!room) return false;
    return room.currentHand.cards.length === 4;
  }

  /**
   * Complete the current hand and determine winner
   */
  completeHand(roomId: string): { winnerId: string; winnerPosition: number; winningCard: any; trumpDecision?: TrumpDecisionResult } | null {
    const room = this.rooms.get(roomId);
    if (!room || !this.isHandComplete(roomId)) return null;

    const gameRules = this.gameRulesMap.get(roomId);
    if (!gameRules) return null;

    // For Dehla-Pakad: Check trump decision
    let trumpDecision: TrumpDecisionResult | undefined;
    if (room.gameType === GameType.DEHLA_PAKAD && !room.trumpDecided) {
      const dehlaPakadRules = gameRules as DehlaPakadRules;
      trumpDecision = dehlaPakadRules.analyzeTrumpDecision(room.currentHand);
      dehlaPakadRules.incrementTrumpDecisionTurns();
      
      if (trumpDecision.trumpDecided && trumpDecision.trumpSuit) {
        room.trumpDecided = true;
        room.trumpSuit = trumpDecision.trumpSuit;
        room.trumpDecisionPhase = false;
      }
    }

    // Determine winner using game rules
    const winnerPosition = gameRules.determineHandWinner(room.currentHand);
    const winnerId = room.currentHand.cards[winnerPosition].playerId;
    const winningCard = room.currentHand.cards[winnerPosition].card;

    // Update hand with winner info
    room.currentHand.winnerId = winnerId;
    room.currentHand.winnerPosition = winnerPosition;

    // Update player's hands won count
    const winner = room.players.find(p => p.id === winnerId);
    if (winner) {
      winner.handsWon++;
      winner.score++; // 1 point per hand won
    }

    // Move completed hand to history
    room.completedHands.push({ ...room.currentHand });

    // Check if game is over
    const isGameOver = gameRules.isGameOver(room.completedHands.length, room.totalHands);
    
    if (isGameOver) {
      room.status = RoomStatus.FINISHED;
    } else {
      // Start new hand
      room.currentHand = {
        handNumber: room.completedHands.length + 1,
        cards: [],
        leadingSuit: undefined,
        winnerId: undefined,
        winnerPosition: undefined
      };

      // Winner of last hand plays first in next hand
      room.currentTurn = winnerPosition;
    }

    return { winnerId, winnerPosition, winningCard, trumpDecision };
  }

  /**
   * Get game winner(s)
   */
  getGameWinners(roomId: string): Array<{ id: string; name: string; handsWon: number }> {
    const room = this.rooms.get(roomId);
    if (!room) return [];

    const gameRules = this.gameRulesMap.get(roomId);
    if (!gameRules) return [];

    const playerStats = room.players.map(p => ({
      id: p.id,
      name: p.name,
      handsWon: p.handsWon
    }));

    return gameRules.determineGameWinner(playerStats);
  }

  /**
   * Get current game state for a room
   */
  getGameState(roomId: string) {
    const room = this.rooms.get(roomId);
    if (!room) return null;

    return {
      currentHand: room.currentHand,
      completedHands: room.completedHands,
      trumpSuit: room.trumpSuit,
      trumpDecided: room.trumpDecided,
      totalHands: room.totalHands,
      handsPlayed: room.completedHands.length,
      gameType: room.gameType,
      scores: room.players.map(p => ({
        playerId: p.id,
        playerName: p.name,
        handsWon: p.handsWon,
        score: p.score
      }))
    };
  }

  /**
   * Distribute additional cards for Dehla-Pakad after trump is decided
   */
  distributeAdditionalCards(roomId: string): boolean {
    const room = this.rooms.get(roomId);
    if (!room || room.gameType !== GameType.DEHLA_PAKAD) return false;

    const gameRules = this.gameRulesMap.get(roomId) as DehlaPakadRules;
    if (!gameRules || !room.trumpDecided) return false;

    // Create new deck with remaining cards
    const deck = new Deck();
    deck.setCards(room.deck);
    deck.shuffle();

    // Deal additional cards (8 per player)
    const additionalCardsPerPlayer = gameRules.getAdditionalCardsAfterTrump();
    const hands = deck.deal(4, additionalCardsPerPlayer);

    // Add cards to each player's hand
    room.players.forEach((player, index) => {
      player.hand.push(...hands[index]);
    });

    // Update room deck
    room.deck = deck.getRemainingCards();
    
    // Update total cards per player
    room.cardsPerPlayer = gameRules.getTotalCardsPerPlayer();
    room.totalHands = room.cardsPerPlayer;

    return true;
  }
}
