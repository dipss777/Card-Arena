import { Card, Suit, Rank, Hand, CardPlay } from '../../../shared/types';

/**
 * Game Rules Implementation
 * 
 * Rules:
 * 1. Card values: 2 < 3 < 4 < 5 < 6 < 7 < 8 < 9 < 10 < J < Q < K < A
 * 2. Trump suit: Spades (♠) by default
 * 3. Each hand = 4 cards played (one per player)
 * 4. Winning logic:
 *    a) If any trump cards: highest trump wins
 *    b) If no trump: highest card of leading suit wins
 * 5. Winner of hand plays first in next hand
 * 6. After 13 hands: player with most hands won wins the game
 */
export class GameRules {
  private trumpSuit: Suit;

  constructor(trumpSuit: Suit = Suit.SPADES) {
    this.trumpSuit = trumpSuit;
  }

  /**
   * Get numeric value for card rank
   * 2=2, 3=3, ..., 10=10, J=11, Q=12, K=13, A=14
   */
  private getCardValue(rank: Rank): number {
    const rankValues: { [key in Rank]: number } = {
      [Rank.TWO]: 2,
      [Rank.THREE]: 3,
      [Rank.FOUR]: 4,
      [Rank.FIVE]: 5,
      [Rank.SIX]: 6,
      [Rank.SEVEN]: 7,
      [Rank.EIGHT]: 8,
      [Rank.NINE]: 9,
      [Rank.TEN]: 10,
      [Rank.JACK]: 11,
      [Rank.QUEEN]: 12,
      [Rank.KING]: 13,
      [Rank.ACE]: 14
    };
    return rankValues[rank];
  }

  /**
   * Set trump suit (can be changed during game setup)
   */
  setTrumpSuit(suit: Suit): void {
    this.trumpSuit = suit;
  }

  /**
   * Get current trump suit
   */
  getTrumpSuit(): Suit {
    return this.trumpSuit;
  }

  /**
   * Determine winner of a hand (4 cards played)
   * Returns the position (0-3) of the winning player
   */
  determineHandWinner(hand: Hand): number {
    if (!hand.cards || hand.cards.length !== 4) {
      throw new Error('A hand must have exactly 4 cards');
    }

    const trumpCards: CardPlay[] = [];
    const leadingSuitCards: CardPlay[] = [];

    // Separate trump cards and leading suit cards
    for (const cardPlay of hand.cards) {
      if (cardPlay.card.suit === this.trumpSuit) {
        trumpCards.push(cardPlay);
      } else if (hand.leadingSuit && cardPlay.card.suit === hand.leadingSuit) {
        leadingSuitCards.push(cardPlay);
      }
    }

    // Rule 5(a): If any trump cards exist, highest trump wins
    if (trumpCards.length > 0) {
      return this.findHighestCard(trumpCards);
    }

    // Rule 5(b): No trump cards, highest card of leading suit wins
    if (leadingSuitCards.length > 0) {
      return this.findHighestCard(leadingSuitCards);
    }

    // Fallback: should not reach here in normal gameplay
    // Return first player if somehow no valid cards
    return hand.cards[0].playerPosition;
  }

  /**
   * Find the player position with the highest value card
   */
  private findHighestCard(cardPlays: CardPlay[]): number {
    let highestValue = 0;
    let winnerPosition = 0;

    for (const cardPlay of cardPlays) {
      const value = this.getCardValue(cardPlay.card.rank);
      if (value > highestValue) {
        highestValue = value;
        winnerPosition = cardPlay.playerPosition;
      }
    }

    return winnerPosition;
  }

  /**
   * Get the leading suit (suit of first card played)
   */
  getLeadingSuit(cards: CardPlay[]): Suit | undefined {
    if (cards.length === 0) return undefined;
    return cards[0].card.suit;
  }

  /**
   * Check if game is over (all 13 hands completed)
   */
  isGameOver(completedHands: number, totalHands: number): boolean {
    return completedHands >= totalHands;
  }

  /**
   * Determine game winner (player with most hands won)
   * Returns array of winners (can be tie)
   */
  determineGameWinner(players: Array<{ id: string; name: string; handsWon: number }>): Array<{ id: string; name: string; handsWon: number }> {
    if (players.length === 0) return [];

    // Find maximum hands won
    const maxHandsWon = Math.max(...players.map(p => p.handsWon));

    // Return all players with max hands (handles ties)
    return players.filter(p => p.handsWon === maxHandsWon);
  }

  /**
   * Compare two cards (for sorting or validation)
   * Returns: 1 if card1 > card2, -1 if card1 < card2, 0 if equal
   */
  compareCards(card1: Card, card2: Card, leadingSuit?: Suit): number {
    // Trump cards always beat non-trump cards
    const card1IsTrump = card1.suit === this.trumpSuit;
    const card2IsTrump = card2.suit === this.trumpSuit;

    if (card1IsTrump && !card2IsTrump) return 1;
    if (!card1IsTrump && card2IsTrump) return -1;

    // Both trump or both non-trump: compare by suit relevance and value
    if (leadingSuit) {
      const card1IsLeading = card1.suit === leadingSuit;
      const card2IsLeading = card2.suit === leadingSuit;

      if (card1IsLeading && !card2IsLeading) return 1;
      if (!card1IsLeading && card2IsLeading) return -1;
    }

    // Same suit relevance: compare by value
    const value1 = this.getCardValue(card1.rank);
    const value2 = this.getCardValue(card2.rank);

    if (value1 > value2) return 1;
    if (value1 < value2) return -1;
    return 0;
  }

  /**
   * Get card display name (e.g., "Ace of Spades", "10 of Hearts")
   */
  getCardDisplayName(card: Card): string {
    const rankNames: { [key in Rank]: string } = {
      [Rank.ACE]: 'Ace',
      [Rank.TWO]: '2',
      [Rank.THREE]: '3',
      [Rank.FOUR]: '4',
      [Rank.FIVE]: '5',
      [Rank.SIX]: '6',
      [Rank.SEVEN]: '7',
      [Rank.EIGHT]: '8',
      [Rank.NINE]: '9',
      [Rank.TEN]: '10',
      [Rank.JACK]: 'Jack',
      [Rank.QUEEN]: 'Queen',
      [Rank.KING]: 'King'
    };

    const suitNames: { [key in Suit]: string } = {
      [Suit.HEARTS]: 'Hearts',
      [Suit.DIAMONDS]: 'Diamonds',
      [Suit.CLUBS]: 'Clubs',
      [Suit.SPADES]: 'Spades'
    };

    return `${rankNames[card.rank]} of ${suitNames[card.suit]}`;
  }
}
