# 🚀 Quick Setup Guide

Follow these steps to get your card game running locally:

## Prerequisites
- Node.js 20 or higher
- npm (comes with Node.js)

## Step-by-Step Setup

### 1. Install Backend Dependencies
```bash
cd backend
npm install
```

### 2. Configure Backend
```bash
# Copy the example environment file
cp .env.example .env

# The default values will work for local development
# No need to change anything unless you want to customize
```

### 3. Start Backend Server
```bash
# In the backend directory
npm run dev
```
✅ Backend should now be running on `http://localhost:3001`

### 4. Install Frontend Dependencies
Open a **new terminal window** and run:
```bash
cd frontend
npm install
```

### 5. Start Frontend
```bash
# In the frontend directory
npm run dev
```
✅ Frontend should now be running on `http://localhost:3000`

## 🎮 Test the Game

1. Open `http://localhost:3000` in your browser
2. Enter your name (e.g., "Player 1")
3. Click "⚡ Quick Play" or "🔒 Create Private Room"
4. Open 3 more browser tabs/windows (or use incognito mode)
5. Join with different names
6. When 4 players join, the game automatically starts!

## 🎯 Testing Different Scenarios

### Test Public Room
- Open 4 browser tabs
- Use "Quick Play" in each
- All should join the same room automatically

### Test Private Room
- Tab 1: Create Private Room, copy the room code
- Tabs 2-4: Enter the room code and join
- Game starts when 4th player joins

## 🐛 Troubleshooting

### Port Already in Use
If you see "Port 3001 is already in use":
```bash
# Find and kill the process
# On Mac/Linux:
lsof -ti:3001 | xargs kill -9

# On Windows:
netstat -ano | findstr :3001
taskkill /PID <PID> /F
```

### Dependencies Won't Install
```bash
# Clear npm cache
npm cache clean --force

# Delete node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

### Can't Connect to Backend
- Make sure backend is running (check terminal)
- Check `http://localhost:3001/health` - should return JSON
- Check console for errors

## 🐳 Docker Alternative (Optional)

If you prefer Docker:
```bash
# From the project root directory
docker-compose up -d

# Wait for services to start (30-60 seconds)
# Then open http://localhost:3000
```

To stop:
```bash
docker-compose down
```

## 📁 Project Structure Reminder

```
DEHLA_PAKAD/
├── backend/          ← Backend server (runs on :3001)
├── frontend/         ← React app (runs on :3000)
├── shared/          ← Shared TypeScript types
└── README.md        ← Full documentation
```

## ✅ Verification Checklist

- [ ] Backend terminal shows "🃏 Card Game Server running on port 3001"
- [ ] Frontend terminal shows "Local: http://localhost:3000"
- [ ] Opening `http://localhost:3000` shows the lobby screen
- [ ] Opening `http://localhost:3001/health` returns JSON
- [ ] Multiple browser tabs can join the same game

## 🆘 Still Having Issues?

1. Check both terminal windows for error messages
2. Make sure you're in the correct directory (`backend` or `frontend`)
3. Verify Node.js version: `node --version` (should be 20+)
4. Check the full README.md for detailed documentation

---

**Ready to play! 🎉** Open http://localhost:3000 and start gaming!
