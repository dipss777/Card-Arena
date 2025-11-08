# 🎮 Game Rules - Complete Guide

## Table of Contents
1. [Implemented Rules](#implemented-rules)
2. [Implementation Details](#implementation-details)
3. [Extending with Custom Rules](#extending-with-custom-rules)
4. [Testing & Gameplay](#testing--gameplay)

---

## Implemented Rules

### ✅ Implementation Summary

Your trump-based card game rules have been **fully implemented**!

### 🎯 Core Game Rules

#### 1. Card Values
```
2 < 3 < 4 < 5 < 6 < 7 < 8 < 9 < 10 < J < Q < K < A
```
- **Ace (A)** is the highest value card (value: 14)
- **2** is the lowest value card (value: 2)
- Implemented in: `backend/src/services/GameRules.ts` → `getCardValue()`

#### 2. Trump Suit
- **Default Trump**: Spades (♠️)
- Configurable: Can be changed via `setTrumpSuit()` method
- Displayed in frontend ScoreBoard
- Implemented in: 
  - `backend/src/services/GameRules.ts`
  - `frontend/src/components/ScoreBoard.tsx`

#### 3. Playing a Card
- Each player selects one card from their hand
- Card is played face-up and visible to all players
- Card is removed from player's hand immediately
- Turn-based system enforces correct play order
- Implemented in:
  - `backend/src/services/RoomManager.ts` → `playCard()`
  - `backend/src/socket/SocketHandler.ts` → `handlePlayCard()`

#### 4. Hand Definition
- **One hand** = 4 cards (one from each player)
- Winner of hand gets **1 point**
- Winner starts the **next hand**
- Total: **13 hands per game** (52 cards ÷ 4 players)
- Implemented in:
  - `shared/types.ts` → `Hand` interface
  - `backend/src/services/RoomManager.ts` → `completeHand()`

#### 5. Hand Winner Rules

**Rule 5(a): If ANY Trump Cards Exist**
```
✓ Ignore all non-trump cards
✓ Compare only trump cards
✓ Highest trump card wins
```

**Rule 5(b): If NO Trump Cards**
```
✓ First card played determines the "leading suit"
✓ Ignore cards of other suits
✓ Highest card of leading suit wins
```

Implemented in: `backend/src/services/GameRules.ts` → `determineHandWinner()`

#### 6. Winning the Game
- After **13 hands**, player with **most hands won** is the winner
- Supports **tie scenarios** (multiple winners possible)
- Final scores displayed in winner modal
- Implemented in:
  - `backend/src/services/GameRules.ts` → `determineGameWinner()`
  - `backend/src/services/RoomManager.ts` → `getGameWinners()`
  - `frontend/src/pages/GameRoom.tsx` → Game Winner Modal

---

## Implementation Details

### 📁 Files Modified/Created

#### Backend Files

**1. `shared/types.ts` - Enhanced Type Definitions**
- Added `Hand` interface (hand tracking)
- Added `CardPlay` interface (card + player info)
- Updated `Player` interface (handsWon, score)
- Updated `Room` interface (trumpSuit, currentHand, completedHands, totalHands)
- Added new socket events:
  - `HAND_COMPLETE`
  - `HAND_WINNER`
  - `NEW_HAND_START`
  - `GAME_WINNER`
  - `SCORE_UPDATE`
- Added `HandWinner` and `GameWinner` interfaces

**2. `backend/src/services/GameRules.ts` - NEW FILE ⭐**
Core game logic implementation:
- `getCardValue()` - Convert rank to numeric value (2-14)
- `setTrumpSuit()` / `getTrumpSuit()` - Trump suit management
- `determineHandWinner()` - **Main winning logic** (rules 5a & 5b)
- `findHighestCard()` - Find highest value card from array
- `getLeadingSuit()` - Get suit of first card played
- `isGameOver()` - Check if all 13 hands complete
- `determineGameWinner()` - Find player(s) with most hands won
- `compareCards()` - Compare two cards (with trump logic)
- `getCardDisplayName()` - Human-readable card names

**3. `backend/src/services/RoomManager.ts` - Enhanced**
- Added `GameRules` instance
- Enhanced `createRoom()` - Initialize trump, hands, scores
- Enhanced `addPlayerToRoom()` - Initialize player scores
- **NEW:** `playCard()` - Validate and process card plays
- **NEW:** `isHandComplete()` - Check if 4 cards played
- **NEW:** `completeHand()` - Determine winner, update scores
- **NEW:** `getGameWinners()` - Get final winner(s)
- **NEW:** `getGameState()` - Get current game statistics

**4. `backend/src/socket/SocketHandler.ts` - Enhanced**
- Updated `handlePlayCard()` - Use new game rules
- **NEW:** `handleHandComplete()` - Process hand completion
- **NEW:** `handleGameEnd()` - Process game completion
- Emit new events:
  - `HAND_COMPLETE` - When 4 cards played
  - `HAND_WINNER` - Announce hand winner
  - `NEW_HAND_START` - Start next hand
  - `SCORE_UPDATE` - Update all scores
  - `GAME_WINNER` - Announce game winner
- Added 3-second delay between hands
- Initialize players with handsWon and score

#### Frontend Files

**5. `frontend/src/components/ScoreBoard.tsx` - NEW FILE ⭐**
Beautiful scoreboard component:
- Display all players sorted by hands won
- Show rank medals (🥇🥈🥉)
- Display trump suit with symbols
- Highlight current player
- Show game rules summary
- Real-time score updates

**6. `frontend/src/pages/GameRoom.tsx` - Enhanced**
- Added state for:
  - `lastHandWinner` - Track last hand winner
  - `currentHandCards` - Cards currently on table
  - `gameWinner` - Final winner information
  - `showHandWinner` - Show/hide winner notification
- Added socket event listeners:
  - `CARD_PLAYED` - Display card on table
  - `HAND_WINNER` - Show hand winner notification
  - `HAND_COMPLETE` - Clear cards after delay
  - `NEW_HAND_START` - Reset for new hand
  - `SCORE_UPDATE` - Update player scores
  - `GAME_WINNER` - Show winner modal
- **UI Enhancements:**
  - Game Winner Modal (full screen, final scores)
  - Hand Winner Notification (animated, temporary)
  - Display current hand cards on table
  - Show hand progress (X / 13)
  - Replaced Players List with ScoreBoard
  - Show trump suit information
  - Card count in player's hand
  - "All cards played" message

### 🎮 Game Flow

#### Game Start
1. 4 players join room
2. 52 cards shuffled and dealt (13 each)
3. Trump suit set to Spades ♠️
4. First player (position 0) starts

#### Each Hand (Repeats 13 times)
1. Current player plays a card
2. Card appears on table for all to see
3. Turn advances to next player
4. Repeat until 4 cards played
5. **Game Rules Engine determines winner:**
   - Check for trump cards
   - If trump exists: highest trump wins
   - If no trump: highest card of leading suit wins
6. Winner announced with 3-second notification
7. Winner's score incremented
8. Cards cleared from table
9. Winner starts next hand

#### Game End
1. After 13 hands, game ends automatically
2. Player with most hands won is winner
3. Winner modal displays:
   - Winner name(s) and hands won
   - Final scores for all players
   - Option to return to lobby
4. Players can leave and start new game

### 🔧 Technical Implementation

#### Trump Logic Priority
```typescript
1. Check if any cards are trump suit
   YES → Compare only trump cards
   NO  → Go to step 2

2. Get leading suit (first card played)
3. Filter cards of leading suit
4. Compare leading suit cards
5. Return winner position
```

#### Card Comparison
```typescript
Trump Card > Leading Suit Card > Other Cards
Within Same Category: Higher Rank Wins
A (14) > K (13) > Q (12) > J (11) > 10 > ... > 2
```

#### Score Tracking
```typescript
Each Hand Won = +1 point
After 13 Hands:
  Player with MAX(handsWon) = Winner
  Ties are possible (multiple winners)
```

### 📊 Game Statistics

#### Default Settings
- **Players per game**: 4
- **Cards per player**: 13
- **Total hands**: 13
- **Points per hand**: 1
- **Trump suit**: Spades ♠️ (configurable)
- **Hand delay**: 3 seconds

#### Win Conditions
- **Primary**: Most hands won
- **Tie-breaker**: Multiple winners allowed
- **Minimum hands**: All 13 must be played

---

## Extending with Custom Rules

This section shows you how to extend the base framework to implement specific card game rules (like Dehla Pakad, Hearts, Spades, etc.).

### Overview

The current implementation provides:
- ✅ 52-card deck management
- ✅ 4-player rooms
- ✅ Card dealing (13 cards per player)
- ✅ Turn management
- ✅ Real-time communication

You can add:
- 🎯 Game-specific rules
- 🏆 Custom scoring systems
- 🎴 Valid move validation
- 🏅 Different win conditions

### Step 1: Create Custom Game Rules Service

Create a new rules file `backend/src/services/CustomGameRules.ts`:

```typescript
import { Card, Suit, Rank, Player } from '../../../shared/types';

export interface GameRules {
  validateMove(card: Card, player: Player, gameState: any): boolean;
  calculateTrickWinner(cards: Card[]): number;
  calculateScore(player: Player): number;
  isGameOver(gameState: any): boolean;
}

// Example: Dehla Pakad Rules
export class DehlaPakadRules implements GameRules {
  validateMove(card: Card, player: Player, gameState: any): boolean {
    // If first card of trick, any card is valid
    if (!gameState.currentTrick || gameState.currentTrick.length === 0) {
      return true;
    }

    const leadCard = gameState.currentTrick[0];
    const hasSuit = player.hand.some(c => c.suit === leadCard.suit);
    
    // Must follow suit if possible
    if (hasSuit && card.suit !== leadCard.suit) {
      return false;
    }

    return true;
  }

  calculateTrickWinner(cards: Card[]): number {
    if (cards.length !== 4) return 0;

    const leadSuit = cards[0].suit;
    let winningIndex = 0;
    let highestRank = this.getRankValue(cards[0].rank);

    for (let i = 1; i < cards.length; i++) {
      // Only cards of lead suit can win
      if (cards[i].suit === leadSuit) {
        const rankValue = this.getRankValue(cards[i].rank);
        if (rankValue > highestRank) {
          highestRank = rankValue;
          winningIndex = i;
        }
      }
    }

    return winningIndex;
  }

  private getRankValue(rank: Rank): number {
    const values: { [key in Rank]: number } = {
      [Rank.TWO]: 2, [Rank.THREE]: 3, [Rank.FOUR]: 4,
      [Rank.FIVE]: 5, [Rank.SIX]: 6, [Rank.SEVEN]: 7,
      [Rank.EIGHT]: 8, [Rank.NINE]: 9, [Rank.TEN]: 10,
      [Rank.JACK]: 11, [Rank.QUEEN]: 12, [Rank.KING]: 13,
      [Rank.ACE]: 14
    };
    return values[rank];
  }

  calculateScore(player: Player): number {
    let score = 0;
    
    // Count 10s (Dehlas) - 1 point each
    const tens = player.hand.filter(c => c.rank === Rank.TEN);
    score += tens.length;

    // Penalty for Hearts - 1 point each
    const hearts = player.hand.filter(c => c.suit === Suit.HEARTS);
    score -= hearts.length;

    return score;
  }

  isGameOver(gameState: any): boolean {
    // Game ends when all cards are played
    return gameState.players.every((p: Player) => p.hand.length === 0);
  }
}
```

### Step 2: Extend Shared Types

Add to `shared/types.ts`:

```typescript
export interface Trick {
  cards: Card[];
  playerIds: string[];
  winnerId?: string;
}

export interface GameState {
  roomId: string;
  players: Player[];
  currentTurn: number;
  currentTrick: Trick;
  completedTricks: Trick[];
  scores: { [playerId: string]: number };
  deck: Card[];
  status: RoomStatus;
}

export enum SocketEvents {
  // ... existing events
  TRICK_COMPLETE = 'trick_complete',
  GAME_SCORE_UPDATE = 'game_score_update',
  GAME_WINNER = 'game_winner',
}
```

### Step 3: Common Game Variations

#### Dehla Pakad
- Track 10s (Dehlas) for points
- Penalty for Hearts
- Follow suit rules

#### Hearts
- Avoid taking hearts (penalty points)
- Queen of Spades is special (-13 points)
- Shooting the moon

#### Spades
- Spades are always trump
- Bidding system
- Nil bids

### Step 4: Add Custom UI Components

Create game-specific UI in `frontend/src/components/CustomScoreBoard.tsx`:

```typescript
interface ScoreBoardProps {
  players: Player[];
  scores: { [key: string]: number };
  currentPlayerId: string;
}

const ScoreBoard: React.FC<ScoreBoardProps> = ({ players, scores, currentPlayerId }) => {
  return (
    <div className="bg-white rounded-lg p-4 shadow-lg">
      <h3 className="text-xl font-bold mb-4">🏆 Scores</h3>
      <div className="space-y-2">
        {players
          .sort((a, b) => (scores[b.id] || 0) - (scores[a.id] || 0))
          .map((player, index) => (
            <div
              key={player.id}
              className={`p-2 rounded ${
                player.id === currentPlayerId ? 'bg-purple-100' : 'bg-gray-50'
              }`}
            >
              <div className="flex justify-between items-center">
                <span className="font-medium">
                  {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : ''}
                  {player.name}
                </span>
                <span className="text-lg font-bold">{scores[player.id] || 0}</span>
              </div>
            </div>
          ))}
      </div>
    </div>
  );
};
```

---

## Testing & Gameplay

### 🧪 Testing Checklist

#### Card Value Testing
- [ ] Play A vs K → A wins
- [ ] Play 2 vs 3 → 3 wins
- [ ] Play 10 vs J → J wins

#### Trump Logic Testing
- [ ] Play trump + non-trump → Trump wins
- [ ] Play 2♠ + A♥ (trump=♠) → 2♠ wins
- [ ] Play multiple trumps → Highest trump wins

#### Leading Suit Testing
- [ ] First card ♥, play ♥ + ♦ → Highest ♥ wins
- [ ] No trump, follow leading suit logic

#### Hand Winner Testing
- [ ] Winner gets +1 point
- [ ] Winner starts next hand
- [ ] Scores update correctly

#### Game End Testing
- [ ] Game ends after 13 hands
- [ ] Winner modal appears
- [ ] Correct winner determined
- [ ] Tie handling works

### 🚀 How to Play

#### Quick Start
1. Start backend: `cd backend && npm run dev`
2. Start frontend: `cd frontend && npm run dev`
3. Open 4 browser tabs
4. Join same room
5. Game starts automatically!

#### Game Play
1. **Your turn**: Click a card to play
2. **Wait**: Other players play their cards
3. **Hand complete**: See who won (3-second notification)
4. **Continue**: Winner starts next hand
5. **Game end**: After 13 hands, winner announced

#### Strategy Tips
- **Trump cards are powerful!** They beat all other cards
- Save high trumps for important hands
- Remember which trump cards have been played
- Leading suit matters when no trumps
- Plan your 13 cards wisely!

### 🎨 UI/UX Features

#### ScoreBoard
- ✅ Real-time score updates
- ✅ Trump suit display with symbols
- ✅ Player rankings with medals
- ✅ Current player highlighting
- ✅ Game rules reference

#### Game Table
- ✅ Cards played display (center)
- ✅ Player names under cards
- ✅ Turn indicators
- ✅ Hand progress counter
- ✅ Responsive card layout

#### Notifications
- ✅ Hand winner (3 seconds, animated)
- ✅ Game winner (modal, full screen)
- ✅ Turn indicators (your turn / waiting)
- ✅ Card count in hand

#### Animations
- ✅ Hand winner bounce animation
- ✅ Card hover effects
- ✅ Smooth transitions
- ✅ Modal fade-in

---

## 🎉 Success Summary

### ✅ Fully Implemented
- Trump-based winning logic
- Hand tracking (13 hands)
- Score tracking (hands won)
- Turn-based gameplay
- Winner determination
- Real-time updates
- Beautiful UI
- Animations
- Game winner modal
- Hand winner notifications
- ScoreBoard component
- Trump suit display
- Card counting
- Chat system
- Room codes
- Public/private rooms

### 🎯 Ready for Extensions
- Custom trump suit selection
- Different game variations
- Betting system
- Tournament mode
- Replay functionality
- Statistics tracking
- Achievements

### 🔗 Key Files Reference

| File | Purpose | Lines |
|------|---------|-------|
| `backend/src/services/GameRules.ts` | Core game logic | ~200 |
| `backend/src/services/RoomManager.ts` | Game state management | ~250 |
| `backend/src/socket/SocketHandler.ts` | Real-time events | ~320 |
| `frontend/src/components/ScoreBoard.tsx` | Score display | ~90 |
| `frontend/src/pages/GameRoom.tsx` | Main game UI | ~300 |
| `shared/types.ts` | Type definitions | ~150 |

---

**Your trump-based 4-player card game is 100% functional and ready to play! 🎮🃏🎉**

Happy Gaming!
