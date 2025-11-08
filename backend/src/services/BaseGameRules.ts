import { Card, Suit, Rank, Hand, CardPlay } from '../../../shared/types';

/**
 * Abstract base class for all game rules
 * Each game type (Easy-Peasy, Dehla-Pakad) extends this class
 */
export abstract class BaseGameRules {
  protected trumpSuit?: Suit;

  /**
   * Get numeric value for card rank
   * 2=2, 3=3, ..., 10=10, J=11, Q=12, K=13, A=14
   */
  protected getCardValue(rank: Rank): number {
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
   * Set trump suit
   */
  setTrumpSuit(suit: Suit): void {
    this.trumpSuit = suit;
  }

  /**
   * Get current trump suit
   */
  getTrumpSuit(): Suit | undefined {
    return this.trumpSuit;
  }

  /**
   * Get the leading suit (suit of first card played)
   */
  getLeadingSuit(cards: CardPlay[]): Suit | undefined {
    if (cards.length === 0) return undefined;
    return cards[0].card.suit;
  }

  /**
   * Find the player position with the highest value card
   */
  protected findHighestCard(cardPlays: CardPlay[]): number {
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

  /**
   * Abstract method: Determine winner of a hand
   * Must be implemented by each game type
   */
  abstract determineHandWinner(hand: Hand): number;

  /**
   * Abstract method: Check if game is over
   * Must be implemented by each game type
   */
  abstract isGameOver(completedHands: number, totalHands: number): boolean;

  /**
   * Abstract method: Determine game winner(s)
   * Must be implemented by each game type
   */
  abstract determineGameWinner(
    players: Array<{ id: string; name: string; handsWon: number }>
  ): Array<{ id: string; name: string; handsWon: number }>;

  /**
   * Abstract method: Get initial card count per player
   * Must be implemented by each game type
   */
  abstract getInitialCardCount(): number;

  /**
   * Abstract method: Get total hands for game
   * Must be implemented by each game type
   */
  abstract getTotalHands(): number;
}
