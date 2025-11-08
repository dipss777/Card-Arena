import { Card, Suit, Rank, Hand, CardPlay, TrumpDecisionResult } from '../../../shared/types';
import { BaseGameRules } from './BaseGameRules';

/**
 * Dehla-Pakad Game Rules Implementation
 * 
 * Initial Setup:
 * - 5 cards dealt to each player (20 total)
 * - Trump suit not fixed initially
 * - Trump decided dynamically during first few turns (up to 5)
 * 
 * Trump Decision Cases:
 * Case 1: All same suit → No trump yet, play continues
 * Case 2: Two different suits → Trump = suit2 (new suit introduced)
 * Case 3: Three different suits → Trump = suit3 (last new suit)
 * Case 4: Four different suits → Trump = suit4 (last new suit)
 * 
 * After Trump Decided:
 * - Remaining 32 cards distributed (8 per player)
 * - Total cards per player = 8 + (5 - turns_used_to_decide_trump)
 * - Game continues like Easy-Peasy with fixed trump
 */
export class DehlaPakadRules extends BaseGameRules {
  private trumpDecided: boolean = false;
  private turnsUsedToDecideTrump: number = 0;

  constructor() {
    super();
    this.trumpSuit = undefined; // Trump not set initially
  }

  /**
   * Get initial card count per player (5 for Dehla-Pakad)
   */
  getInitialCardCount(): number {
    return 5;
  }

  /**
   * Get cards to distribute after trump is decided
   */
  getAdditionalCardsAfterTrump(): number {
    return 8; // Each player gets 8 more cards
  }

  /**
   * Get total hands for game (13 for Dehla-Pakad)
   */
  getTotalHands(): number {
    return 13;
  }

  /**
   * Get total cards per player after trump decided
   */
  getTotalCardsPerPlayer(): number {
    return 13 - this.turnsUsedToDecideTrump;
  }

  /**
   * Check if trump has been decided
   */
  isTrumpDecided(): boolean {
    return this.trumpDecided;
  }

  /**
   * Get turns used to decide trump
   */
  getTurnsUsedToDecideTrump(): number {
    return this.turnsUsedToDecideTrump;
  }

  /**
   * Analyze a hand to determine if trump should be decided
   * Returns trump decision result
   */
  analyzeTrumpDecision(hand: Hand): TrumpDecisionResult {
    if (this.trumpDecided) {
      return {
        trumpDecided: true,
        trumpSuit: this.trumpSuit,
        case: 1,
        suitsPlayed: []
      };
    }

    if (hand.cards.length !== 4) {
      throw new Error('Hand must have exactly 4 cards for trump decision');
    }

    // Get unique suits in order they were played
    const suitsPlayed: Suit[] = [];
    const uniqueSuits = new Set<Suit>();

    for (const cardPlay of hand.cards) {
      if (!uniqueSuits.has(cardPlay.card.suit)) {
        uniqueSuits.add(cardPlay.card.suit);
        suitsPlayed.push(cardPlay.card.suit);
      }
    }

    const suitCount = suitsPlayed.length;

    // Case 1: All same suit - no trump yet
    if (suitCount === 1) {
      return {
        trumpDecided: false,
        case: 1,
        suitsPlayed
      };
    }

    // Case 2: Two different suits - trump = suit2
    if (suitCount === 2) {
      const trumpSuit = suitsPlayed[1]; // Second suit introduced
      this.trumpSuit = trumpSuit;
      this.trumpDecided = true;
      return {
        trumpDecided: true,
        trumpSuit,
        case: 2,
        suitsPlayed
      };
    }

    // Case 3: Three different suits - trump = suit3
    if (suitCount === 3) {
      const trumpSuit = suitsPlayed[2]; // Third suit introduced
      this.trumpSuit = trumpSuit;
      this.trumpDecided = true;
      return {
        trumpDecided: true,
        trumpSuit,
        case: 3,
        suitsPlayed
      };
    }

    // Case 4: Four different suits - trump = suit4
    if (suitCount === 4) {
      const trumpSuit = suitsPlayed[3]; // Fourth suit introduced
      this.trumpSuit = trumpSuit;
      this.trumpDecided = true;
      return {
        trumpDecided: true,
        trumpSuit,
        case: 4,
        suitsPlayed
      };
    }

    return {
      trumpDecided: false,
      case: 1,
      suitsPlayed
    };
  }

  /**
   * Increment trump decision turn counter
   */
  incrementTrumpDecisionTurns(): void {
    if (!this.trumpDecided) {
      this.turnsUsedToDecideTrump++;
    }
  }

  /**
   * Determine winner of a hand
   * During trump decision phase, uses trump decision logic
   * After trump decided, uses standard trump rules
   */
  determineHandWinner(hand: Hand): number {
    if (!hand.cards || hand.cards.length !== 4) {
      throw new Error('A hand must have exactly 4 cards');
    }

    // During trump decision phase
    if (!this.trumpDecided) {
      const trumpDecision = this.analyzeTrumpDecision(hand);
      
      if (trumpDecision.trumpDecided && trumpDecision.trumpSuit) {
        // Trump just decided - use the new trump to determine winner
        const trumpCards: CardPlay[] = [];
        for (const cardPlay of hand.cards) {
          if (cardPlay.card.suit === trumpDecision.trumpSuit) {
            trumpCards.push(cardPlay);
          }
        }
        
        if (trumpCards.length > 0) {
          return this.findHighestCard(trumpCards);
        }
      }
      
      // Case 1: All same suit - highest card wins
      if (trumpDecision.case === 1) {
        return this.findHighestCard(hand.cards);
      }
      
      // If trump decided but no trump cards played, highest of trump suit wins
      // (shouldn't happen but fallback)
      return this.findHighestCard(hand.cards);
    }

    // After trump is decided, use standard trump rules
    const trumpCards: CardPlay[] = [];
    const leadingSuitCards: CardPlay[] = [];

    for (const cardPlay of hand.cards) {
      if (this.trumpSuit && cardPlay.card.suit === this.trumpSuit) {
        trumpCards.push(cardPlay);
      } else if (hand.leadingSuit && cardPlay.card.suit === hand.leadingSuit) {
        leadingSuitCards.push(cardPlay);
      }
    }

    // If any trump cards: highest trump wins
    if (trumpCards.length > 0) {
      return this.findHighestCard(trumpCards);
    }

    // No trump cards: highest card of leading suit wins
    if (leadingSuitCards.length > 0) {
      return this.findHighestCard(leadingSuitCards);
    }

    // Fallback
    return hand.cards[0].playerPosition;
  }

  /**
   * Check if game is over
   */
  isGameOver(completedHands: number, totalHands: number): boolean {
    // Game ends when all cards are played
    // Total hands = 13 - turnsUsedToDecideTrump
    const actualTotalHands = this.getTotalCardsPerPlayer();
    return completedHands >= actualTotalHands;
  }

  /**
   * Determine game winner (player with most hands won)
   */
  determineGameWinner(
    players: Array<{ id: string; name: string; handsWon: number }>
  ): Array<{ id: string; name: string; handsWon: number }> {
    if (players.length === 0) return [];

    const maxHandsWon = Math.max(...players.map(p => p.handsWon));
    return players.filter(p => p.handsWon === maxHandsWon);
  }

  /**
   * Check if a card is a 10 (special highlight card)
   */
  isTenCard(card: Card): boolean {
    return card.rank === Rank.TEN;
  }

  /**
   * Check if winning hand contains a 10
   */
  hasWinningTen(hand: Hand): boolean {
    if (!hand.winnerId) return false;
    
    for (const cardPlay of hand.cards) {
      if (cardPlay.playerId === hand.winnerId && this.isTenCard(cardPlay.card)) {
        return true;
      }
    }
    return false;
  }
}
