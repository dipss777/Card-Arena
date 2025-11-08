import { Card, Suit, Rank } from '../../../shared/types';
import { v4 as uuidv4 } from 'uuid';

export class Deck {
  private cards: Card[];

  constructor() {
    this.cards = this.createDeck();
  }

  /**
   * Create a standard 52-card deck
   */
  private createDeck(): Card[] {
    const suits = Object.values(Suit);
    const ranks = Object.values(Rank);
    const deck: Card[] = [];

    for (const suit of suits) {
      for (const rank of ranks) {
        deck.push({
          suit,
          rank,
          id: uuidv4()
        });
      }
    }

    return deck;
  }

  /**
   * Shuffle the deck using Fisher-Yates algorithm
   */
  shuffle(): void {
    for (let i = this.cards.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [this.cards[i], this.cards[j]] = [this.cards[j], this.cards[i]];
    }
  }

  /**
   * Deal cards to players
   * @param numPlayers Number of players
   * @param cardsPerPlayer Cards to deal to each player
   * @returns Array of hands for each player
   */
  deal(numPlayers: number, cardsPerPlayer: number): Card[][] {
    const hands: Card[][] = Array.from({ length: numPlayers }, () => []);
    
    for (let i = 0; i < cardsPerPlayer; i++) {
      for (let playerIndex = 0; playerIndex < numPlayers; playerIndex++) {
        const card = this.cards.pop();
        if (card) {
          hands[playerIndex].push(card);
        }
      }
    }

    return hands;
  }

  /**
   * Get remaining cards in deck
   */
  getRemainingCards(): Card[] {
    return [...this.cards];
  }

  /**
   * Set cards in deck (useful for Dehla-Pakad additional card distribution)
   */
  setCards(cards: Card[]): void {
    this.cards = [...cards];
  }

  /**
   * Get number of remaining cards
   */
  getCount(): number {
    return this.cards.length;
  }

  /**
   * Reset and shuffle the deck
   */
  reset(): void {
    this.cards = this.createDeck();
    this.shuffle();
  }
}
