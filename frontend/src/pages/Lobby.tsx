import React, { useState, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { socketService } from '../services/socket';
import { useGameStore } from '../store/gameStore';
import { SocketEvents, GameType } from '@shared/types';

const Lobby: React.FC = () => {
  const navigate = useNavigate();
  const { setPlayerId, setPlayerName, setCurrentRoom, setMyHand } = useGameStore();
  const [name, setName] = useState('');
  const [roomCode, setRoomCode] = useState('');
  const [selectedGame, setSelectedGame] = useState<GameType>(GameType.EASY_PEASY);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleQuickPlay = async (e: FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Please enter your name');
      return;
    }

    setIsLoading(true);
    setError('');
    
    const socket = socketService.connect();
    
    // Listen for room events
    socket.once(SocketEvents.ROOM_JOINED, ({ room, playerId }) => {
      setPlayerId(playerId);
      setPlayerName(name);
      setCurrentRoom(room);
      navigate('/game');
    });

    socket.once(SocketEvents.CARDS_DEALT, ({ hand }) => {
      setMyHand(hand);
    });

    socket.once(SocketEvents.ERROR, ({ message }) => {
      setError(message);
      setIsLoading(false);
    });

    // Join public room
    socketService.joinRoom({ playerName: name, gameType: selectedGame });
  };

  const handleCreatePrivateRoom = (e: FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Please enter your name');
      return;
    }

    setIsLoading(true);
    setError('');
    
    const socket = socketService.connect();
    
    socket.once(SocketEvents.ROOM_CREATED, ({ room, playerId }) => {
      setPlayerId(playerId);
      setPlayerName(name);
      setCurrentRoom(room);
      navigate('/game');
    });

    socket.once(SocketEvents.ERROR, ({ message }) => {
      setError(message);
      setIsLoading(false);
    });

    socketService.createRoom({ playerName: name, isPublic: false, gameType: selectedGame });
  };

  const handleJoinPrivateRoom = (e: FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Please enter your name');
      return;
    }
    if (!roomCode.trim()) {
      setError('Please enter room code');
      return;
    }

    setIsLoading(true);
    setError('');
    
    const socket = socketService.connect();
    
    socket.once(SocketEvents.ROOM_JOINED, ({ room, playerId }) => {
      setPlayerId(playerId);
      setPlayerName(name);
      setCurrentRoom(room);
      navigate('/game');
    });

    socket.once(SocketEvents.ROOM_NOT_FOUND, () => {
      setError('Room not found');
      setIsLoading(false);
    });

    socket.once(SocketEvents.ROOM_FULL, () => {
      setError('Room is full');
      setIsLoading(false);
    });

    socket.once(SocketEvents.CARDS_DEALT, ({ hand }) => {
      setMyHand(hand);
    });

    socket.once(SocketEvents.ERROR, ({ message }) => {
      setError(message);
      setIsLoading(false);
    });

    socketService.joinRoom({ playerName: name, roomCode: roomCode.toUpperCase() });
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-purple-50 to-pink-50">
      <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">🃏 Multi-Game Card Platform</h1>
          <p className="text-gray-600">Choose your game and play with 4 players online</p>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <div className="space-y-4">
          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Your Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="Enter your name"
              disabled={isLoading}
              maxLength={20}
            />
          </div>

          {/* Game Selection */}
          <div>
            <label className="block text-gray-700 text-sm font-bold mb-3">
              Select Game
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setSelectedGame(GameType.EASY_PEASY)}
                disabled={isLoading}
                className={`p-4 rounded-lg border-2 transition-all ${
                  selectedGame === GameType.EASY_PEASY
                    ? 'border-purple-500 bg-purple-50 shadow-md'
                    : 'border-gray-300 hover:border-purple-300'
                } disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                <div className="text-2xl mb-2">🎯</div>
                <div className="font-bold text-sm">Easy-Peasy</div>
                <div className="text-xs text-gray-600 mt-1">Fixed Trump (♠)</div>
              </button>
              <button
                onClick={() => setSelectedGame(GameType.DEHLA_PAKAD)}
                disabled={isLoading}
                className={`p-4 rounded-lg border-2 transition-all ${
                  selectedGame === GameType.DEHLA_PAKAD
                    ? 'border-blue-500 bg-blue-50 shadow-md'
                    : 'border-gray-300 hover:border-blue-300'
                } disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                <div className="text-2xl mb-2">🎲</div>
                <div className="font-bold text-sm">Dehla-Pakad</div>
                <div className="text-xs text-gray-600 mt-1">Dynamic Trump</div>
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-2 text-center">
              {selectedGame === GameType.EASY_PEASY
                ? '13 hands • Trump: Spades • Simple rules'
                : '5-13 hands • Trump decided during play • Strategic'}
            </p>
          </div>

          <button
            onClick={handleQuickPlay}
            disabled={isLoading}
            className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold py-3 px-4 rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Joining...' : '⚡ Quick Play'}
          </button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">OR</span>
            </div>
          </div>

          <button
            onClick={handleCreatePrivateRoom}
            disabled={isLoading}
            className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-bold py-3 px-4 rounded-lg hover:from-blue-600 hover:to-cyan-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Creating...' : '🔒 Create Private Room'}
          </button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">OR</span>
            </div>
          </div>

          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Room Code
            </label>
            <input
              type="text"
              value={roomCode}
              onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 uppercase"
              placeholder="Enter room code"
              disabled={isLoading}
              maxLength={6}
            />
          </div>

          <button
            onClick={handleJoinPrivateRoom}
            disabled={isLoading}
            className="w-full bg-gradient-to-r from-green-500 to-emerald-500 text-white font-bold py-3 px-4 rounded-lg hover:from-green-600 hover:to-emerald-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Joining...' : '🚪 Join Private Room'}
          </button>
        </div>

        <div className="mt-8 p-4 bg-gray-50 rounded-lg">
          <p className="text-center text-sm text-gray-700 font-semibold mb-2">
            🎮 {selectedGame === GameType.EASY_PEASY ? 'Easy-Peasy' : 'Dehla-Pakad'}
          </p>
          <p className="text-center text-xs text-gray-600">
            Waiting for 4 players to start the game
          </p>
        </div>
      </div>
    </div>
  );
};

export default Lobby;
