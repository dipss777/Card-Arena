import { create } from 'zustand';
import { Room, Player, Card, ChatMessage } from '@shared/types';

interface GameState {
  // Player state
  playerId: string | null;
  playerName: string | null;
  
  // Room state
  currentRoom: Room | null;
  myHand: Card[];
  
  // Game state
  playedCards: Card[];
  chatMessages: ChatMessage[];
  
  // Actions
  setPlayerId: (id: string) => void;
  setPlayerName: (name: string) => void;
  setCurrentRoom: (room: Room | null) => void;
  setMyHand: (hand: Card[]) => void;
  addPlayedCard: (card: Card) => void;
  clearPlayedCards: () => void;
  addChatMessage: (message: ChatMessage) => void;
  removeCardFromHand: (cardId: string) => void;
  addCardsToHand: (cards: Card[]) => void; // For Dehla-Pakad additional cards
  reset: () => void;
}

export const useGameStore = create<GameState>((set) => ({
  // Initial state
  playerId: null,
  playerName: null,
  currentRoom: null,
  myHand: [],
  playedCards: [],
  chatMessages: [],
  
  // Actions
  setPlayerId: (id) => set({ playerId: id }),
  setPlayerName: (name) => set({ playerName: name }),
  setCurrentRoom: (room) => set({ currentRoom: room }),
  setMyHand: (hand) => set({ myHand: hand }),
  addPlayedCard: (card) => set((state) => ({ 
    playedCards: [...state.playedCards, card] 
  })),
  clearPlayedCards: () => set({ playedCards: [] }),
  addChatMessage: (message) => set((state) => ({ 
    chatMessages: [...state.chatMessages, message] 
  })),
  removeCardFromHand: (cardId) => set((state) => ({
    myHand: state.myHand.filter(card => card.id !== cardId)
  })),
  addCardsToHand: (cards) => set((state) => ({
    myHand: [...state.myHand, ...cards]
  })),
  reset: () => set({
    playerId: null,
    playerName: null,
    currentRoom: null,
    myHand: [],
    playedCards: [],
    chatMessages: []
  })
}));
