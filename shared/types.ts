// Shared types between frontend and backend

export enum GameType {
  EASY_PEASY = 'easy_peasy',
  DEHLA_PAKAD = 'dehla_pakad',
  TEEN_DO_PANCH = 'teen_do_panch',
}

export enum Suit {
  HEARTS = 'hearts',
  DIAMONDS = 'diamonds',
  CLUBS = 'clubs',
  SPADES = 'spades'
}

export enum Rank {
  ACE = 'A',
  TWO = '2',
  THREE = '3',
  FOUR = '4',
  FIVE = '5',
  SIX = '6',
  SEVEN = '7',
  EIGHT = '8',
  NINE = '9',
  TEN = '10',
  JACK = 'J',
  QUEEN = 'Q',
  KING = 'K'
}

export interface Card {
  suit: Suit;
  rank: Rank;
  id: string; // unique identifier
}

export interface Player {
  id: string;
  name: string;
  socketId: string;
  hand: Card[];
  isReady: boolean;
  position: number; // 0-3
  handsWon: number; // Number of hands won
  score: number; // Total score/points
}

export enum RoomStatus {
  WAITING = 'waiting',
  IN_PROGRESS = 'in_progress',
  FINISHED = 'finished'
}

export interface Hand {
  handNumber: number; // 1-13
  cards: CardPlay[]; // Cards played in this hand
  leadingSuit?: Suit; // Suit of first card played
  winnerId?: string; // Player who won this hand
  winnerPosition?: number; // Position of winner
}

export interface CardPlay {
  card: Card;
  playerId: string;
  playerName: string;
  playerPosition: number;
}

export interface Room {
  id: string;
  code: string; // 6-char code for private rooms
  isPublic: boolean;
  gameType: GameType; // Type of game being played
  players: Player[];
  maxPlayers: number;
  status: RoomStatus;
  currentTurn: number;
  deck: Card[];
  createdAt: Date;
  startedAt?: Date;
  trumpSuit?: Suit; // Trump suit (optional for Dehla-Pakad until decided)
  trumpDecided: boolean; // Whether trump has been decided (for Dehla-Pakad)
  currentHand: Hand; // Current hand being played
  completedHands: Hand[]; // All completed hands
  totalHands: number; // Total hands in game (13 for 4 players)
  // Dehla-Pakad specific
  trumpDecisionPhase?: boolean; // True during initial trump decision phase
  cardsPerPlayer?: number; // Cards currently with each player
}

export interface GameState {
  roomId: string;
  players: Player[];
  currentTurn: number;
  deck: Card[];
  playedCards: Card[];
  status: RoomStatus;
}

// Socket Events
export enum SocketEvents {
  // Connection
  CONNECT = 'connect',
  DISCONNECT = 'disconnect',
  
  // Room Management
  CREATE_ROOM = 'create_room',
  JOIN_ROOM = 'join_room',
  LEAVE_ROOM = 'leave_room',
  ROOM_CREATED = 'room_created',
  ROOM_JOINED = 'room_joined',
  ROOM_FULL = 'room_full',
  ROOM_NOT_FOUND = 'room_not_found',
  PLAYER_JOINED = 'player_joined',
  PLAYER_LEFT = 'player_left',
  
  // Game Actions
  GAME_START = 'game_start',
  GAME_END = 'game_end',
  CARDS_DEALT = 'cards_dealt',
  PLAY_CARD = 'play_card',
  CARD_PLAYED = 'card_played',
  TURN_CHANGE = 'turn_change',
  HAND_COMPLETE = 'hand_complete',
  HAND_WINNER = 'hand_winner',
  NEW_HAND_START = 'new_hand_start',
  GAME_WINNER = 'game_winner',
  SCORE_UPDATE = 'score_update',
  TRUMP_DECIDED = 'trump_decided', // For Dehla-Pakad
  ADDITIONAL_CARDS_DEALT = 'additional_cards_dealt', // For Dehla-Pakad
  
  // Chat
  SEND_MESSAGE = 'send_message',
  RECEIVE_MESSAGE = 'receive_message',
  
  // Errors
  ERROR = 'error'
}

export interface CreateRoomPayload {
  playerName: string;
  isPublic: boolean;
  gameType: GameType; // Which game to play
}

export interface JoinRoomPayload {
  playerName: string;
  roomCode?: string; // For private rooms
  gameType?: GameType; // For public rooms, specify game preference
}

export interface PlayCardPayload {
  roomId: string;
  playerId: string;
  cardId: string;
}

export interface ChatMessage {
  playerId: string;
  playerName: string;
  message: string;
  timestamp: Date;
}

export interface GameWinner {
  playerId: string;
  playerName: string;
  handsWon: number;
  score: number;
}

export interface HandWinner {
  playerId: string;
  playerName: string;
  playerPosition: number;
  winningCard: Card;
  handNumber: number;
}

export interface TrumpDecisionResult {
  trumpDecided: boolean;
  trumpSuit?: Suit;
  case: 1 | 2 | 3 | 4; // Which case was triggered
  suitsPlayed: Suit[];
}
