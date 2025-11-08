import React from 'react';
import { Card as CardType, Suit, Rank } from '@shared/types';

interface CardProps {
  card: CardType;
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
  highlight?: boolean; // For highlighting special cards (10s in Dehla-Pakad)
}

const Card: React.FC<CardProps> = ({ card, onClick, disabled = false, className = '', highlight = false }) => {
  const isRed = card.suit === Suit.HEARTS || card.suit === Suit.DIAMONDS;
  const color = isRed ? 'text-card-red' : 'text-card-black';
  const isTen = card.rank === Rank.TEN;
  
  const suitSymbols = {
    [Suit.HEARTS]: '♥',
    [Suit.DIAMONDS]: '♦',
    [Suit.CLUBS]: '♣',
    [Suit.SPADES]: '♠'
  };

  return (
    <div
      onClick={!disabled ? onClick : undefined}
      className={`
        relative bg-white rounded-lg shadow-lg
        w-20 h-28 sm:w-24 sm:h-32
        flex flex-col items-center justify-between
        p-2 font-card
        ${!disabled && onClick ? 'card-hover' : ''}
        ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
        ${highlight || (isTen && highlight !== false) ? 'ring-4 ring-yellow-400 shadow-yellow-400/50 animate-pulse' : ''}
        ${className}
      `}
    >
      {/* Top left */}
      <div className={`text-left ${color} font-bold text-lg sm:text-xl`}>
        <div>{card.rank}</div>
        <div className="text-2xl sm:text-3xl leading-none">{suitSymbols[card.suit]}</div>
      </div>
      
      {/* Center suit */}
      <div className={`${color} text-4xl sm:text-5xl relative`}>
        {suitSymbols[card.suit]}
        {isTen && highlight !== false && (
          <div className="absolute -top-1 -right-1 w-5 h-5 bg-yellow-400 rounded-full flex items-center justify-center">
            <span className="text-xs font-bold text-black">★</span>
          </div>
        )}
      </div>
      
      {/* Bottom right (rotated) */}
      <div className={`text-right ${color} font-bold text-lg sm:text-xl transform rotate-180`}>
        <div>{card.rank}</div>
        <div className="text-2xl sm:text-3xl leading-none">{suitSymbols[card.suit]}</div>
      </div>
    </div>
  );
};

export default Card;
