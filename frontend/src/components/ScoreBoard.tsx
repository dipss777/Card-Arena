import React from 'react';
import { Player } from '@shared/types';

interface ScoreBoardProps {
  players: Player[];
  currentPlayerId: string | null;
  trumpSuit: string;
}

const ScoreBoard: React.FC<ScoreBoardProps> = ({ players, currentPlayerId, trumpSuit }) => {
  // Sort players by hands won (descending)
  const sortedPlayers = [...players].sort((a, b) => b.handsWon - a.handsWon);

  const getSuitSymbol = (suit: string) => {
    const symbols: { [key: string]: string } = {
      'hearts': '♥️',
      'diamonds': '♦️',
      'clubs': '♣️',
      'spades': '♠️'
    };
    return symbols[suit] || suit;
  };

  const getRankMedal = (index: number) => {
    const medals = ['🥇', '🥈', '🥉', ''];
    return medals[index] || '';
  };

  return (
    <div className="bg-white/95 rounded-lg shadow-lg p-4">
      <div className="mb-4">
        <h3 className="text-xl font-bold text-gray-800 mb-2">🏆 Scoreboard</h3>
        <div className="text-sm text-gray-600 bg-purple-100 p-2 rounded">
          <span className="font-semibold">Trump Suit:</span> {getSuitSymbol(trumpSuit)} {trumpSuit.charAt(0).toUpperCase() + trumpSuit.slice(1)}
        </div>
      </div>

      <div className="space-y-2">
        {sortedPlayers.map((player, index) => (
          <div
            key={player.id}
            className={`p-3 rounded-lg transition-all ${
              player.id === currentPlayerId 
                ? 'bg-gradient-to-r from-purple-100 to-pink-100 border-2 border-purple-500' 
                : 'bg-gray-50 hover:bg-gray-100'
            }`}
          >
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <span className="text-xl">{getRankMedal(index)}</span>
                <div>
                  <p className="font-semibold text-gray-800">
                    {player.name}
                    {player.id === currentPlayerId && (
                      <span className="ml-2 text-xs bg-purple-500 text-white px-2 py-1 rounded">You</span>
                    )}
                  </p>
                  <p className="text-xs text-gray-600">Position {player.position + 1}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-purple-600">{player.handsWon}</p>
                <p className="text-xs text-gray-600">hands won</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 p-3 bg-blue-50 rounded-lg text-sm text-gray-700">
        <p className="font-semibold mb-1">Game Rules:</p>
        <ul className="text-xs space-y-1">
          <li>• Trump cards beat all other suits</li>
          <li>• Highest trump card wins the hand</li>
          <li>• If no trump: highest card of leading suit wins</li>
          <li>• Winner starts the next hand</li>
          <li>• Most hands won = Winner! 🎉</li>
        </ul>
      </div>
    </div>
  );
};

export default ScoreBoard;
