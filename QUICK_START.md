# 🚀 Quick Start Guide - Multi-Game Platform

## Step 1: Install Dependencies

```bash
# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

## Step 2: Start the Application

### Option A: Development Mode (Recommended for testing)

```bash
# Terminal 1 - Start Backend
cd backend
npm run dev

# Terminal 2 - Start Frontend
cd frontend
npm run dev
```

The application will be available at:
- Frontend: http://localhost:5173
- Backend: http://localhost:3000

### Option B: Docker (Production-like)

```bash
# From project root
docker-compose up --build
```

## Step 3: Test the Games

### Testing Easy-Peasy (Simple Game)

1. Open 4 browser tabs/windows
2. In each tab:
   - Enter a player name
   - Select **"Easy-Peasy"** game
   - Click **"Quick Play"**
3. After 4 players join → game auto-starts
4. Each player gets 13 cards
5. Trump is **Spades (♠)** - shown in header
6. Play cards in turns
7. Highest trump or leading suit wins each hand
8. Game ends after 13 hands

### Testing Dehla-Pakad (Strategic Game)

1. Open 4 browser tabs/windows
2. In each tab:
   - Enter a player name
   - Select **"Dehla-Pakad"** game
   - Click **"Quick Play"**
3. After 4 players join → game auto-starts
4. Each player gets **5 cards** initially
5. Trump status shows **"Trump undecided"** (orange, pulsing)
6. Play first few hands to determine trump:
   - **Case 1:** All same suit → keep playing
   - **Case 2-4:** Different suits → Trump decided!
7. Big yellow notification appears when trump is decided
8. All players automatically receive **8 more cards**
9. Continue playing with fixed trump
10. Watch for **10 cards** - they're highlighted with yellow ring and star!

## Step 4: Test Concurrent Games

1. Create Room A with **Easy-Peasy**:
   - 4 players select Easy-Peasy
   - Join and play
   
2. Create Room B with **Dehla-Pakad** (same time):
   - 4 different players select Dehla-Pakad
   - Join and play
   
3. Both games run independently! ✅

## Step 5: Test Private Rooms

1. Click **"Create Private Room"**
2. Select your game type
3. Copy the 6-character room code (e.g., `ABC123`)
4. Share code with friends
5. They enter code and click **"Join Private Room"**
6. Game starts when 4 players joined

## 🎮 Game Controls

### Playing Cards
- Click on a card in your hand when it's your turn
- Cards automatically removed after played
- Wait for other players' turns

### Turn Indicators
- Green border = Your turn
- Gray = Waiting
- Player name shown at top

### Chat
- Type message at bottom
- Press Enter or click Send
- Messages visible to all players in room

## 🐛 Troubleshooting

### Backend won't start
```bash
cd backend
npm install
rm -rf node_modules package-lock.json
npm install
npm run dev
```

### Frontend won't start
```bash
cd frontend
npm install
rm -rf node_modules package-lock.json
npm install
npm run dev
```

### Can't connect to game
1. Check backend is running (Terminal 1)
2. Check frontend is running (Terminal 2)
3. Refresh browser
4. Clear browser cache
5. Check console for errors (F12)

### Cards not appearing
- Refresh the page
- Check that 4 players have joined
- Look for errors in browser console

## 📊 Expected Behavior

### Easy-Peasy
- ✅ 13 cards per player initially
- ✅ Trump: Spades (always)
- ✅ 13 total hands
- ✅ Winner = most hands won

### Dehla-Pakad
- ✅ 5 cards initially
- ✅ Trump: Undecided at start
- ✅ Trump decided in 1-5 hands
- ✅ +8 cards after trump decided
- ✅ Total hands = 13 - trump_decision_rounds
- ✅ 10s highlighted in yellow

## 🧪 Test Checklist

- [ ] Create Easy-Peasy room with 4 players
- [ ] Play complete Easy-Peasy game (13 hands)
- [ ] Create Dehla-Pakad room with 4 players
- [ ] Observe trump decision logic
- [ ] Verify additional cards dealt after trump
- [ ] See 10 cards highlighted when won
- [ ] Create private room and join with code
- [ ] Run 2 games simultaneously (different types)
- [ ] Test chat functionality
- [ ] Test leave room functionality

## 🎯 Next Steps

1. **Read Full Documentation:** `MULTI_GAME_ARCHITECTURE.md`
2. **Check Code Structure:** See backend/src and frontend/src
3. **Add New Game:** Follow contributing guide
4. **Deploy:** Use Docker or cloud platform

## 💡 Tips

- Use Chrome/Firefox for best experience
- Open DevTools (F12) to see real-time events
- Use different browser profiles for testing (simulate 4 players)
- Check Network tab for Socket.IO connections
- Backend logs show all game events

---

**Happy Gaming! 🃏🎮**
