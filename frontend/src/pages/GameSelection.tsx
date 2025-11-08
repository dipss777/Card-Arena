import { useNavigate } from 'react-router-dom';
import { GameType } from '../types/shared';

interface GameInfo {
  type: GameType;
  name: string;
  description: string;
  icon: string;
  difficulty: string;
  players: string;
  features: string[];
  color: string;
}

export const GameSelection = () => {
  const navigate = useNavigate();

  const games: GameInfo[] = [
    {
      type: GameType.EASY_PEASY,
      name: 'Easy-Peasy',
      description: 'A simple trump-based card game perfect for beginners',
      icon: '🃏',
      difficulty: 'Easy',
      players: '4 Players',
      features: [
        'Fixed trump suit (Spades)',
        'All cards dealt at start',
        'Simple winning rules',
        '13 hands per game'
      ],
      color: 'from-blue-500 to-blue-600'
    },
    {
      type: GameType.DEHLA_PAKAD,
      name: 'Dehla-Pakad',
      description: 'Strategic game with dynamic trump selection and special card tracking',
      icon: '🎯',
      difficulty: 'Medium',
      players: '4 Players',
      features: [
        'Dynamic trump selection',
        'Initial 5-card deal',
        'Track special 10s cards',
        'Strategic gameplay'
      ],
      color: 'from-purple-500 to-purple-600'
    }
  ];

  const handleGameSelect = (gameType: GameType) => {
    navigate(`/lobby?game=${gameType}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex flex-col items-center justify-center p-6">
      {/* Header */}
      <div className="text-center mb-12 animate-fade-in">
        <h1 className="text-6xl font-bold text-white mb-4 tracking-tight">
          🎴 Card Games Hub
        </h1>
        <p className="text-xl text-gray-300 max-w-2xl mx-auto">
          Choose your game and compete with friends in real-time multiplayer action
        </p>
      </div>

      {/* Game Cards Grid */}
      <div className="grid md:grid-cols-2 gap-8 max-w-5xl w-full">
        {games.map((game, index) => (
          <div
            key={game.type}
            className="group relative bg-gray-800 rounded-2xl overflow-hidden shadow-2xl hover:shadow-purple-500/20 transition-all duration-300 hover:-translate-y-2 animate-slide-up"
            style={{ animationDelay: `${index * 150}ms` }}
          >
            {/* Gradient Header */}
            <div className={`bg-gradient-to-r ${game.color} p-8 relative overflow-hidden`}>
              <div className="absolute top-0 right-0 text-9xl opacity-10 transform rotate-12">
                {game.icon}
              </div>
              <div className="relative z-10">
                <div className="text-6xl mb-4">{game.icon}</div>
                <h2 className="text-3xl font-bold text-white mb-2">{game.name}</h2>
                <p className="text-blue-100 text-sm">{game.description}</p>
              </div>
            </div>

            {/* Card Body */}
            <div className="p-8">
              {/* Info Pills */}
              <div className="flex gap-3 mb-6">
                <span className="px-4 py-2 bg-gray-700 rounded-full text-sm text-gray-200 font-medium">
                  {game.difficulty}
                </span>
                <span className="px-4 py-2 bg-gray-700 rounded-full text-sm text-gray-200 font-medium">
                  {game.players}
                </span>
              </div>

              {/* Features List */}
              <div className="mb-8">
                <h3 className="text-lg font-semibold text-white mb-4">Features:</h3>
                <ul className="space-y-3">
                  {game.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start text-gray-300">
                      <span className="mr-3 text-green-400 mt-1">✓</span>
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Play Button */}
              <button
                onClick={() => handleGameSelect(game.type)}
                className={`w-full py-4 px-6 bg-gradient-to-r ${game.color} text-white font-bold rounded-xl 
                  hover:shadow-lg hover:shadow-purple-500/50 transform hover:scale-105 
                  transition-all duration-200 text-lg flex items-center justify-center gap-3
                  focus:outline-none focus:ring-4 focus:ring-purple-500/50`}
              >
                <span>Play {game.name}</span>
                <span className="text-2xl">→</span>
              </button>
            </div>

            {/* Hover Effect Overlay */}
            <div className="absolute inset-0 border-2 border-transparent group-hover:border-purple-500/50 rounded-2xl transition-all duration-300 pointer-events-none"></div>
          </div>
        ))}
      </div>

      {/* Footer Info */}
      <div className="mt-12 text-center text-gray-400 animate-fade-in" style={{ animationDelay: '300ms' }}>
        <p className="text-sm">
          💡 Both games support 4-player real-time multiplayer
        </p>
      </div>
    </div>
  );
};
