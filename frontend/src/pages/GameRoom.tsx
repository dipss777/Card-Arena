import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { socketService } from '../services/socket';
import { useGameStore } from '../store/gameStore';
import { SocketEvents, RoomStatus } from '@shared/types';
import Card from '../components/Card';
import ScoreBoard from '../components/ScoreBoard';

const GameRoom: React.FC = () => {
  const navigate = useNavigate();
  const { 
    playerId, 
    currentRoom, 
    myHand, 
    setCurrentRoom,
    setMyHand,
    removeCardFromHand,
    chatMessages,
    addChatMessage,
    reset
  } = useGameStore();
  
  const [chatInput, setChatInput] = useState('');
  const [currentTurn, setCurrentTurn] = useState(0);
  const [lastHandWinner, setLastHandWinner] = useState<any>(null);
  const [currentHandCards, setCurrentHandCards] = useState<any[]>([]);
  const [gameWinner, setGameWinner] = useState<any>(null);
  const [showHandWinner, setShowHandWinner] = useState(false);
  const [trumpDecision, setTrumpDecision] = useState<any>(null);
  const [showTrumpDecision, setShowTrumpDecision] = useState(false);

  useEffect(() => {
    if (!playerId || !currentRoom) {
      navigate('/');
      return;
    }

    const socket = socketService.getSocket();
    if (!socket) {
      navigate('/');
      return;
    }

    // Listen for game events
    socket.on(SocketEvents.PLAYER_JOINED, ({ room }) => {
      setCurrentRoom(room);
    });

    socket.on(SocketEvents.PLAYER_LEFT, ({ room }) => {
      setCurrentRoom(room);
    });

    socket.on(SocketEvents.GAME_START, ({ room }) => {
      setCurrentRoom(room);
    });

    socket.on(SocketEvents.CARD_PLAYED, ({ playerId: cardPlayerId, card, playerPosition }) => {
      // Update the current hand display
      setCurrentHandCards(prev => [...prev, { card, playerPosition }]);
      
      // Remove the card from current player's hand if it's their card
      if (cardPlayerId === playerId) {
        removeCardFromHand(card.id);
      }
    });

    socket.on(SocketEvents.TURN_CHANGE, ({ currentTurn: turn }) => {
      setCurrentTurn(turn);
    });

    socket.on(SocketEvents.HAND_WINNER, (data) => {
      setLastHandWinner(data);
      setShowHandWinner(true);
      
      // Hide winner notification after 3 seconds
      setTimeout(() => {
        setShowHandWinner(false);
      }, 3000);
    });

    socket.on(SocketEvents.HAND_COMPLETE, () => {
      // Clear current hand cards
      setTimeout(() => {
        setCurrentHandCards([]);
      }, 3000);
    });

    socket.on(SocketEvents.NEW_HAND_START, ({ handNumber, startingPlayer }) => {
      console.log(`Starting hand ${handNumber}, ${startingPlayer.name} leads`);
      setCurrentHandCards([]);
      setShowHandWinner(false);
    });

    socket.on(SocketEvents.SCORE_UPDATE, ({ scores }) => {
      // Update room with new scores
      if (currentRoom) {
        const updatedPlayers = currentRoom.players.map(player => {
          const scoreInfo = scores.find((s: any) => s.playerId === player.id);
          if (scoreInfo) {
            return { ...player, handsWon: scoreInfo.handsWon, score: scoreInfo.score };
          }
          return player;
        });
        setCurrentRoom({ ...currentRoom, players: updatedPlayers });
      }
    });

    socket.on(SocketEvents.GAME_WINNER, ({ winners, finalScores }) => {
      setGameWinner({ winners, finalScores });
    });

    socket.on(SocketEvents.RECEIVE_MESSAGE, (message) => {
      addChatMessage(message);
    });

    // Dehla-Pakad specific events
    socket.on(SocketEvents.TRUMP_DECIDED, (data) => {
      setTrumpDecision(data);
      setShowTrumpDecision(true);
      
      // Update room with trump suit
      if (currentRoom) {
        setCurrentRoom({ ...currentRoom, trumpSuit: data.trumpSuit, trumpDecided: true });
      }
      
      // Hide notification after 5 seconds
      setTimeout(() => {
        setShowTrumpDecision(false);
      }, 5000);
    });

    socket.on(SocketEvents.ADDITIONAL_CARDS_DEALT, ({ hand }) => {
      // Replace entire hand with new cards (includes old cards + new cards)
      setMyHand(hand);
    });

    return () => {
      socket.off(SocketEvents.PLAYER_JOINED);
      socket.off(SocketEvents.PLAYER_LEFT);
      socket.off(SocketEvents.GAME_START);
      socket.off(SocketEvents.CARD_PLAYED);
      socket.off(SocketEvents.TURN_CHANGE);
      socket.off(SocketEvents.HAND_WINNER);
      socket.off(SocketEvents.HAND_COMPLETE);
      socket.off(SocketEvents.NEW_HAND_START);
      socket.off(SocketEvents.SCORE_UPDATE);
      socket.off(SocketEvents.GAME_WINNER);
      socket.off(SocketEvents.RECEIVE_MESSAGE);
      socket.off(SocketEvents.TRUMP_DECIDED);
      socket.off(SocketEvents.ADDITIONAL_CARDS_DEALT);
    };
  }, [playerId, currentRoom, navigate]);

  const handlePlayCard = (cardId: string) => {
    if (!playerId || !currentRoom) return;
    
    const myPlayer = currentRoom.players.find(p => p.id === playerId);
    if (!myPlayer || myPlayer.position !== currentTurn) {
      alert("It's not your turn!");
      return;
    }

    socketService.playCard({
      roomId: currentRoom.id,
      playerId,
      cardId
    });
  };

  const handleSendMessage = () => {
    if (chatInput.trim()) {
      socketService.sendMessage(chatInput);
      setChatInput('');
    }
  };

  const handleLeaveRoom = () => {
    socketService.leaveRoom();
    reset();
    navigate('/');
  };

  const copyRoomCode = () => {
    if (currentRoom) {
      navigator.clipboard.writeText(currentRoom.code);
      alert('Room code copied to clipboard!');
    }
  };

  if (!currentRoom) return null;

  const myPlayer = currentRoom.players.find(p => p.id === playerId);
  const isMyTurn = myPlayer?.position === currentTurn;
  const isWaiting = currentRoom.status === RoomStatus.WAITING;

  return (
    <div className="min-h-screen bg-gradient-to-br from-table-green to-table-felt p-4">
      {/* Game Winner Modal */}
      {gameWinner && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full mx-4 shadow-2xl">
            <h2 className="text-3xl font-bold text-center mb-6">🎉 Game Over! 🎉</h2>
            <div className="space-y-4">
              {gameWinner.winners.map((winner: any, index: number) => (
                <div key={winner.id} className="bg-gradient-to-r from-yellow-100 to-orange-100 p-4 rounded-lg">
                  <p className="text-2xl font-bold text-center">
                    {index === 0 && '🥇'} {winner.name}
                  </p>
                  <p className="text-center text-gray-600">
                    {winner.handsWon} hands won
                  </p>
                </div>
              ))}
            </div>
            <div className="mt-6">
              <h3 className="font-semibold mb-2">Final Scores:</h3>
              <div className="space-y-1">
                {gameWinner.finalScores?.map((score: any) => (
                  <div key={score.playerId} className="flex justify-between text-sm">
                    <span>{score.playerName}</span>
                    <span className="font-bold">{score.handsWon} hands</span>
                  </div>
                ))}
              </div>
            </div>
            <button
              onClick={handleLeaveRoom}
              className="w-full mt-6 bg-purple-500 hover:bg-purple-600 text-white font-bold py-3 rounded-lg transition-colors"
            >
              Back to Lobby
            </button>
          </div>
        </div>
      )}

      {/* Hand Winner Notification */}
      {showHandWinner && lastHandWinner && (
        <div className="fixed top-20 left-1/2 transform -translate-x-1/2 z-40 animate-bounce">
          <div className="bg-gradient-to-r from-green-400 to-blue-500 text-white px-8 py-4 rounded-full shadow-2xl">
            <p className="text-xl font-bold">
              🎯 {lastHandWinner.playerName} wins hand #{lastHandWinner.handNumber}!
            </p>
            <p className="text-sm text-center">
              with {lastHandWinner.winningCard?.rank} of {lastHandWinner.winningCard?.suit}
            </p>
          </div>
        </div>
      )}

      {/* Trump Decision Notification (Dehla-Pakad) */}
      {showTrumpDecision && trumpDecision && (
        <div className="fixed top-20 left-1/2 transform -translate-x-1/2 z-40">
          <div className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-8 py-6 rounded-xl shadow-2xl animate-pulse">
            <p className="text-2xl font-bold text-center mb-2">
              🎺 Trump Suit Decided!
            </p>
            <p className="text-xl text-center font-semibold">
              {trumpDecision.trumpSuit === 'hearts' && '♥ Hearts'}
              {trumpDecision.trumpSuit === 'diamonds' && '♦ Diamonds'}
              {trumpDecision.trumpSuit === 'clubs' && '♣ Clubs'}
              {trumpDecision.trumpSuit === 'spades' && '♠ Spades'}
            </p>
            <p className="text-sm text-center mt-2 opacity-90">
              Case {trumpDecision.case} - {trumpDecision.suitsPlayed.length} different suits played
            </p>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="max-w-7xl mx-auto mb-4">
        <div className="bg-white/90 rounded-lg shadow-lg p-4 flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">
              {isWaiting ? '⏳ Waiting for Players...' : '🎮 Game In Progress'}
            </h2>
            <p className="text-sm text-purple-600 font-semibold">
              {currentRoom.gameType === 'easy_peasy' ? '🎯 Easy-Peasy' : '🎲 Dehla-Pakad'}
            </p>
            <p className="text-gray-600">
              Room Code: <span className="font-mono font-bold">{currentRoom.code}</span>
              <button
                onClick={copyRoomCode}
                className="ml-2 text-blue-500 hover:text-blue-700 text-sm"
              >
                📋 Copy
              </button>
            </p>
            {!isWaiting && (
              <>
                <p className="text-sm text-gray-600 mt-1">
                  Hand: {currentRoom.completedHands?.length || 0} / {currentRoom.totalHands || 13}
                </p>
                {currentRoom.trumpSuit && currentRoom.trumpDecided && (
                  <p className="text-sm font-semibold mt-1">
                    Trump: {currentRoom.trumpSuit === 'hearts' && '♥ Hearts'}
                    {currentRoom.trumpSuit === 'diamonds' && '♦ Diamonds'}
                    {currentRoom.trumpSuit === 'clubs' && '♣ Clubs'}
                    {currentRoom.trumpSuit === 'spades' && '♠ Spades'}
                  </p>
                )}
                {currentRoom.gameType === 'dehla_pakad' && !currentRoom.trumpDecided && (
                  <p className="text-sm text-orange-600 font-semibold mt-1 animate-pulse">
                    🎺 Trump undecided - playing to determine...
                  </p>
                )}
              </>
            )}
          </div>
          <div className="text-right">
            <p className="text-gray-600">Players: {currentRoom.players.length}/4</p>
            <button
              onClick={handleLeaveRoom}
              className="mt-2 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition-colors"
            >
              Leave Room
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-4 gap-4">
        {/* ScoreBoard */}
        <div className="lg:col-span-1">
          <ScoreBoard 
            players={currentRoom.players} 
            currentPlayerId={playerId}
            trumpSuit={currentRoom.trumpSuit || 'spades'}
          />

          {/* Chat */}
          <div className="bg-white rounded-lg shadow-lg p-4 mt-4">
            <h3 className="text-xl font-bold mb-4 text-gray-800">Chat</h3>
            <div className="h-48 overflow-y-auto mb-2 space-y-2 bg-gray-50 rounded-lg p-3 border border-gray-200">
              {chatMessages.map((msg, index) => (
                <div key={index} className="text-sm text-gray-800">
                  <span className="font-bold text-purple-600">{msg.playerName}: </span>
                  <span className="text-gray-700">{msg.message}</span>
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white text-gray-800"
                placeholder="Type a message..."
              />
              <button
                onClick={handleSendMessage}
                className="bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded-lg transition-colors font-medium"
              >
                Send
              </button>
            </div>
          </div>
        </div>

        {/* Game Table */}
        <div className="lg:col-span-3">
          <div className="bg-table-green/80 rounded-lg shadow-lg p-8 min-h-[500px]">
            <div className="text-center mb-8">
              {isWaiting ? (
                <div className="text-white text-xl">
                  Waiting for {4 - currentRoom.players.length} more player(s)...
                </div>
              ) : (
                <div className="text-white text-xl">
                  {isMyTurn ? (
                    <span className="text-yellow-300 font-bold">🎯 Your Turn! Play a card</span>
                  ) : (
                    <span>Waiting for {currentRoom.players[currentTurn]?.name}'s turn...</span>
                  )}
                </div>
              )}
            </div>

            {/* Center playing area - show current hand cards */}
            <div className="flex justify-center items-center mb-8">
              {currentHandCards.length > 0 ? (
                <div className="grid grid-cols-2 gap-4">
                  {currentHandCards.map((cardPlay, index) => (
                    <div key={index} className="text-center">
                      <Card card={cardPlay.card} />
                      <p className="text-white text-sm mt-2">
                        {currentRoom.players[cardPlay.playerPosition]?.name}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="h-64 flex items-center">
                  <div className="text-white text-6xl opacity-20">🃏</div>
                </div>
              )}
            </div>

            {/* My Hand */}
            <div className="mt-8">
              <h3 className="text-white text-xl font-bold mb-4 text-center">
                Your Hand ({myHand.length} cards)
              </h3>
              <div className="flex flex-wrap justify-center gap-2">
                {myHand.map((card) => (
                  <Card
                    key={card.id}
                    card={card}
                    onClick={() => handlePlayCard(card.id)}
                    disabled={!isMyTurn || isWaiting}
                  />
                ))}
              </div>
              {myHand.length === 0 && !isWaiting && (
                <p className="text-white text-center mt-4 text-lg">
                  ✨ All cards played! Waiting for game results...
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GameRoom;
