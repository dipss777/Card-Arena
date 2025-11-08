# 🃏 Online 4-Player Card Game

A real-time multiplayer card game platform built with Node.js, React, and Socket.IO that supports 4-player matches using a standard 52-card deck. Multiple games can run simultaneously with public and private room options.

![Tech Stack](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)
![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![Socket.io](https://img.shields.io/badge/Socket.io-010101?style=for-the-badge&logo=socketdotio&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-47A248?style=for-the-badge&logo=mongodb&logoColor=white)
![Redis](https://img.shields.io/badge/Redis-DC382D?style=for-the-badge&logo=redis&logoColor=white)

## 🎯 Features

### Core Features
- **4-Player Game Rooms** - Exactly 4 players per match
- **Public & Private Rooms** - Auto-join public rooms or create private rooms with unique codes
- **Real-time Gameplay** - Instant card dealing, turns, and updates via WebSockets
- **Multiple Concurrent Matches** - Scalable architecture supporting many simultaneous games
- **Live Chat** - In-game chat for player communication
- **Beautiful UI** - Modern, responsive design with card animations

### Technical Features
- Full TypeScript support (Frontend & Backend)
- Real-time bi-directional communication with Socket.IO
- State management with Zustand
- Responsive design with Tailwind CSS
- Docker containerization
- MongoDB for persistent data
- Redis for active session management

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        FRONTEND                              │
│  React + TypeScript + Tailwind CSS + Socket.IO Client       │
│  (Lobby, Game Room, Card Display, Chat)                     │
└────────────────────────┬────────────────────────────────────┘
                         │ WebSocket (Socket.IO)
                         │ HTTP/REST API
┌────────────────────────┴────────────────────────────────────┐
│                        BACKEND                               │
│  Node.js + Express + TypeScript + Socket.IO Server          │
│  (Room Manager, Game Logic, WebSocket Handlers)             │
└────────────┬───────────────────────────┬────────────────────┘
             │                           │
     ┌───────┴──────┐           ┌────────┴────────┐
     │   MongoDB    │           │     Redis       │
     │ (Persistent) │           │  (Active State) │
     └──────────────┘           └─────────────────┘
```

## 📦 Project Structure

```
Card-Arena/
├── backend/              # Node.js + Express backend
│   ├── src/
│   │   ├── config/       # Configuration files
│   │   ├── models/       # Deck, Card models
│   │   ├── services/     # Game Rules, RoomManager service
│   │   ├── socket/       # Socket.IO handlers
│   │   └── server.ts     # Main server entry point
│   ├── package.json
│   ├── tsconfig.json
│   └── Dockerfile
│
├── frontend/             # React + TypeScript frontend
│   ├── src/
│   │   ├── components/   # Card, GameTypeSelector, ScoreBoard components
│   │   ├── pages/        # Lobby, GameRoom, GameSelection pages
│   │   ├── services/     # Socket service
│   │   ├── store/        # Zustand state management
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── package.json
│   ├── tsconfig.json
│   ├── vite.config.ts
│   └── Dockerfile
│
├── shared/               # Shared TypeScript types
│   ├── types.ts          # Common types between frontend/backend
│   ├── gameMetadata.ts   # Game metadata and configurations
│   └── index.ts          # Shared exports
│
├── md_files/             # Documentation
│   └── *.md              # Various documentation files
│
├── logs/                 # Log files
│
├── docker-compose.yml    # Docker orchestration
└── package.json          # Monorepo scripts
```

## 🚀 Quick Start

### Prerequisites
- Node.js 20+ 
- npm or yarn
- Docker & Docker Compose (optional, for containerized deployment)

### Option 1: Local Development (Same Computer)

#### 1. Install Backend Dependencies
```bash
cd backend
npm install
```

#### 2. Configure Backend Environment
```bash
cp .env.example .env
# Edit .env with your configuration
```

#### 3. Start Backend
```bash
# Development mode with hot reload
npm run dev

# Or build and run production
npm run build
npm start
```

Backend will run on `http://localhost:3001`

#### 4. Install Frontend Dependencies
```bash
cd ../frontend
npm install
```

#### 5. Start Frontend
```bash
npm run dev
```

Frontend will run on `http://localhost:3000`

### Option 2: Play with Friends (Network/Internet)

#### 🏠 Same WiFi Network (Easiest)
Perfect for playing with friends at home or in the same location:
```bash
./start-network.sh
```
Share the URL that appears with friends on the same WiFi!

#### 🌍 Internet Play (Anywhere in the World)
Perfect for playing with remote friends:

1. **Install ngrok** (one-time):
   ```bash
   brew install ngrok
   # Sign up at https://ngrok.com and authenticate
   ngrok config add-authtoken YOUR_TOKEN
   ```

2. **Start the game**:
   ```bash
   ./start-ngrok.sh
   ```
   Share the public URL with friends anywhere!

📖 **Full guide:** See [NETWORK_REMOTE_PLAY_COMPLETE.md](./md_files/NETWORK_REMOTE_PLAY_COMPLETE.md) for detailed instructions and troubleshooting.

### Option 3: Docker Deployment

```bash
# Build and start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop all services
docker-compose down
```

Services:
- Frontend: `http://localhost:3000`
- Backend: `http://localhost:3001`
- MongoDB: `localhost:27017`
- Redis: `localhost:6379`

## 🎮 How to Play

### Joining a Game

#### Quick Play (Public Room)
1. Open the app at `http://localhost:3000`
2. Enter your name
3. Click "⚡ Quick Play"
4. You'll be automatically matched with other players or placed in a waiting room

#### Create Private Room
1. Enter your name
2. Click "🔒 Create Private Room"
3. Share the 6-character room code with 3 friends
4. Game starts automatically when all 4 players join

#### Join Private Room
1. Get a room code from a friend
2. Enter your name
3. Enter the room code
4. Click "🚪 Join Private Room"

### During the Game
- **Cards are dealt automatically** when 4 players join
- Each player receives 13 cards (52 cards total)
- **Turn-based gameplay** - wait for your turn (indicated by yellow highlight)
- Click a card in your hand to play it
- Use the chat to communicate with other players
- Room code is displayed at the top - copy and share it

### Game Flow
```
1. Player joins lobby → 2. Enters public/private room → 
3. Waits for 4 players → 4. Cards dealt automatically → 
5. Turn-based play → 6. Chat & interact → 7. Game ends
```

## 🔌 API Reference

### REST Endpoints

#### GET `/health`
Health check endpoint
```json
{
  "status": "ok",
  "timestamp": "2025-11-08T10:30:00.000Z",
  "rooms": 5
}
```

#### GET `/api/rooms`
Get all active rooms (admin/debugging)
```json
{
  "rooms": [
    {
      "id": "uuid",
      "code": "ABC123",
      "isPublic": true,
      "playerCount": 3,
      "maxPlayers": 4,
      "status": "waiting",
      "createdAt": "2025-11-08T10:00:00.000Z"
    }
  ]
}
```

#### GET `/api/rooms/:code`
Get room by code
```json
{
  "room": {
    "id": "uuid",
    "code": "ABC123",
    "isPublic": false,
    "playerCount": 4,
    "maxPlayers": 4,
    "status": "in_progress"
  }
}
```

### Socket.IO Events

#### Client → Server

| Event | Payload | Description |
|-------|---------|-------------|
| `create_room` | `{ playerName: string, isPublic: boolean }` | Create a new room |
| `join_room` | `{ playerName: string, roomCode?: string }` | Join a room (public or by code) |
| `leave_room` | - | Leave current room |
| `play_card` | `{ roomId: string, playerId: string, cardId: string }` | Play a card |
| `send_message` | `string` | Send chat message |

#### Server → Client

| Event | Payload | Description |
|-------|---------|-------------|
| `room_created` | `{ room: Room, playerId: string }` | Room created successfully |
| `room_joined` | `{ room: Room, playerId: string }` | Joined room successfully |
| `player_joined` | `{ player: Player, room: Room }` | Another player joined |
| `player_left` | `{ playerId: string, playerName: string, room: Room }` | Player left room |
| `game_start` | `{ room: Room, message: string }` | Game is starting |
| `cards_dealt` | `{ hand: Card[] }` | Your cards (private) |
| `card_played` | `{ playerId: string, playerName: string, card: Card, position: number }` | Card played by someone |
| `turn_change` | `{ currentTurn: number, nextPlayer: Player }` | Turn changed |
| `receive_message` | `{ playerId: string, playerName: string, message: string, timestamp: Date }` | Chat message |
| `room_not_found` | - | Room code invalid |
| `room_full` | - | Room already has 4 players |
| `error` | `{ message: string }` | Error occurred |

## 🧩 Game Logic Extension

The project now supports **multiple card games**! Currently implemented:
- **Dehla Pakad** - Traditional Pakistani 4-player card game
- **Easy Peasy** - Simplified variant for casual play

Additional games can be easily added by extending the game rules framework.

### Backend
- **`backend/src/services/IGameRules.ts`** - Interface for game rules
- **`backend/src/services/BaseGameRules.ts`** - Base implementation
- **`backend/src/services/GameRulesFactory.ts`** - Factory for creating game instances
- **`backend/src/services/DehlaPakadRules.ts`** - Dehla Pakad implementation
- **`backend/src/services/EasyPeasyRules.ts`** - Easy Peasy implementation
- **`backend/src/services/RoomManager.ts`** - Manages rooms with game-specific logic

### Frontend
- **`frontend/src/components/GameTypeSelector.tsx`** - Game selection UI
- **`frontend/src/components/ScoreBoard.tsx`** - Score display
- **`frontend/src/components/TrumpDecisionIndicator.tsx`** - Trump selection UI
- **`frontend/src/pages/GameSelection.tsx`** - Game selection page
- **`frontend/src/pages/GameRoom.tsx`** - Game room with game-specific UI

Example rule implementation:
```typescript
// backend/src/services/DehlaPakadRules.ts
export class DehlaPakadRules extends BaseGameRules {
  validateCardPlay(card: Card, hand: Card[], currentTrick: PlayedCard[]): boolean {
    // Implement suit following rules
    // Check for valid plays
    return true;
  }
  
  calculateTrickWinner(trick: PlayedCard[]): number {
    // Determine trick winner based on trump and suit
    return winnerIndex;
  }
  
  calculateScore(gameState: any): any {
    // Calculate points for 10s (Dehlas)
    // Calculate penalty for hearts
    return scores;
  }
}
```

## 🔧 Configuration

### Backend Environment Variables
```bash
NODE_ENV=development          # development | production
PORT=3001                     # Server port
MONGODB_URI=mongodb://...     # MongoDB connection string
REDIS_HOST=localhost          # Redis host
REDIS_PORT=6379              # Redis port
JWT_SECRET=your_secret       # JWT secret key
CORS_ORIGIN=http://...       # Frontend URL
MAX_PLAYERS_PER_ROOM=4       # Players per room
```

### Frontend Environment Variables
```bash
VITE_SOCKET_URL=http://localhost:3001  # Backend WebSocket URL
```

## 🐳 Docker Commands

```bash
# Build images
docker-compose build

# Start services
docker-compose up -d

# View logs
docker-compose logs -f backend
docker-compose logs -f frontend

# Stop services
docker-compose stop

# Remove containers
docker-compose down

# Remove containers and volumes
docker-compose down -v
```

## 🧪 Testing

```bash
# Backend tests
cd backend
npm test

# Frontend tests
cd frontend
npm test
```

## 📊 Monitoring

- **Backend Health**: `http://localhost:3001/health`
- **Active Rooms**: `http://localhost:3001/api/rooms`
- **MongoDB**: Use MongoDB Compass on `localhost:27017`
- **Redis**: Use Redis CLI `redis-cli -p 6379`

## 🚢 Deployment

### AWS / GCP / Azure

1. **Build Docker images**
```bash
docker build -t cardgame-backend -f backend/Dockerfile .
docker build -t cardgame-frontend -f frontend/Dockerfile .
```

2. **Push to container registry**
```bash
docker tag cardgame-backend your-registry/cardgame-backend
docker push your-registry/cardgame-backend
```

3. **Deploy with Kubernetes** (example)
```yaml
# See deployment/kubernetes/ for full examples
apiVersion: apps/v1
kind: Deployment
metadata:
  name: cardgame-backend
spec:
  replicas: 3
  ...
```

### Heroku
```bash
# Backend
heroku create cardgame-backend
git subtree push --prefix backend heroku main

# Frontend (with nginx buildpack)
heroku create cardgame-frontend
heroku buildpacks:set heroku/nodejs
git subtree push --prefix frontend heroku main
```

## 🛠️ Technology Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Frontend** | React 18 | UI framework |
| | TypeScript | Type safety |
| | Tailwind CSS | Styling |
| | Zustand | State management |
| | Socket.IO Client | Real-time communication |
| | Vite | Build tool |
| **Backend** | Node.js 20 | Runtime |
| | Express | Web framework |
| | TypeScript | Type safety |
| | Socket.IO | WebSocket server |
| | Mongoose | MongoDB ODM |
| | Redis | Session management |
| **Database** | MongoDB | Persistent storage |
| | Redis | Active game state cache |
| **DevOps** | Docker | Containerization |
| | Docker Compose | Local orchestration |

## 📝 License

MIT License - feel free to use this project for your own card game!

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 🐛 Known Issues & Roadmap

### Current Features ✅
- ✅ Two game modes implemented (Dehla Pakad, Easy Peasy)
- ✅ Full game rules with scoring
- ✅ Trump selection mechanism
- ✅ Network and internet play support
- ✅ Comprehensive documentation

### Planned Features
- [ ] Additional game rule sets (Hearts, Spades, etc.)
- [ ] User registration and authentication
- [ ] Player statistics and leaderboards
- [ ] Game replay functionality
- [ ] Spectator mode
- [ ] Mobile app (React Native)
- [ ] Voice chat integration
- [ ] Tournament mode

## 📚 Additional Documentation

Detailed documentation is available in the `md_files/` directory:
- Architecture & implementation details
- Network play guides
- Troubleshooting & fixes
- Testing guides
- Quick references

See [md_files/DOCUMENTATION_INDEX.md](md_files/DOCUMENTATION_INDEX.md) for the complete documentation index.

## 💡 Support

For issues, questions, or contributions:
- Open an issue on GitHub
- Check existing documentation in `md_files/`
- Review the code comments

## 🎉 Acknowledgments

Built with modern web technologies for a scalable, real-time multiplayer gaming experience!

---

**Made with ❤️ for card game enthusiasts | Card Arena - Multi-Game Platform**
