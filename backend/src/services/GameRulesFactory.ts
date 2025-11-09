import { GameType, Suit } from '../../../shared/types';
import { BaseGameRules } from './BaseGameRules';
import { EasyPeasyRules } from './EasyPeasyRules';
import { DehlaPakadRules } from './DehlaPakadRules';
import { TeenDoPanchRules } from './TeenDoPanchRules';

/**
 * Factory class for creating game rules instances
 * Returns the appropriate game rules based on game type
 */
export class GameRulesFactory {
  /**
   * Create game rules instance based on game type
   */
  static createGameRules(gameType: GameType, trumpSuit?: Suit): BaseGameRules {
    switch (gameType) {
      case GameType.EASY_PEASY:
        return new EasyPeasyRules(trumpSuit || Suit.SPADES);
      
      case GameType.DEHLA_PAKAD:
        return new DehlaPakadRules();

      case GameType.TEEN_DO_PANCH:
        return new TeenDoPanchRules();
      
      default:
        throw new Error(`Unknown game type: ${gameType}`);
    }
  }

  /**
   * Get game display name
   */
  static getGameDisplayName(gameType: GameType): string {
    switch (gameType) {
      case GameType.EASY_PEASY:
        return 'Easy-Peasy';
      case GameType.DEHLA_PAKAD:
        return 'Dehla-Pakad';
      default:
        return 'Unknown Game';
    }
  }

  /**
   * Get game description
   */
  static getGameDescription(gameType: GameType): string {
    switch (gameType) {
      case GameType.EASY_PEASY:
        return 'A simple trump-based card game with fixed trump suit (Spades). Play 13 hands, highest trump or leading suit wins each hand.';
      case GameType.DEHLA_PAKAD:
        return 'A strategic game with dynamic trump selection. Trump is decided during gameplay based on suits played. Highlight special 10 cards!';
      default:
        return '';
    }
  }
}
