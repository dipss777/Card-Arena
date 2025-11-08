#!/bin/bash

# Quick Start Script for Internet Play
# This script starts everything needed for remote play

set -e

echo "🚀 Starting services..."
echo ""

# Clean up any existing processes
pkill -f "ngrok" 2>/dev/null || true
pkill -f "vite" 2>/dev/null || true  
pkill -f "nodemon" 2>/dev/null || true
sleep 2

# Create logs directory
mkdir -p logs

# Remove frontend .env (we want same-origin socket)
rm -f frontend/.env

echo "✅ Cleanup complete"
echo ""

# Start backend
echo "🔧 Starting backend..."
cd backend
npm run dev > ../logs/backend.log 2>&1 &
BACKEND_PID=$!
cd ..
sleep 3

if ! lsof -i :3001 > /dev/null 2>&1; then
    echo "❌ Backend failed to start"
    exit 1
fi
echo "✅ Backend running on http://localhost:3001"
echo ""

# Start frontend
echo "🎨 Starting frontend..."
cd frontend
npm run dev > ../logs/frontend.log 2>&1 &
FRONTEND_PID=$!
cd ..
sleep 4

FRONTEND_PORT=""
if lsof -i :5173 > /dev/null 2>&1; then
    FRONTEND_PORT=5173
elif lsof -i :3000 > /dev/null 2>&1; then
    FRONTEND_PORT=3000
fi

if [ -z "$FRONTEND_PORT" ]; then
    echo "❌ Frontend failed to start"
    kill $BACKEND_PID 2>/dev/null
    exit 1
fi
echo "✅ Frontend running on http://localhost:$FRONTEND_PORT"
echo ""

# Start ngrok
echo "🌐 Starting ngrok tunnel..."
ngrok http $FRONTEND_PORT --log=stdout > logs/ngrok.log 2>&1 &
NGROK_PID=$!
sleep 4

# Get ngrok URL
NGROK_URL=""
for i in {1..15}; do
    NGROK_URL=$(curl -s http://localhost:4040/api/tunnels 2>/dev/null | python3 -c "import sys, json; data=json.load(sys.stdin); print(data['tunnels'][0]['public_url'] if data.get('tunnels') else '')" 2>/dev/null || echo "")
    if [ ! -z "$NGROK_URL" ]; then
        break
    fi
    sleep 1
done

if [ -z "$NGROK_URL" ]; then
    echo "❌ Failed to get ngrok URL"
    echo "Checking ngrok logs..."
    tail -20 logs/ngrok.log
    kill $BACKEND_PID $FRONTEND_PID $NGROK_PID 2>/dev/null
    exit 1
fi

echo "✅ ngrok tunnel: $NGROK_URL"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🎮 ALL SERVICES RUNNING!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📱 Share this URL with friends:"
echo "   $NGROK_URL"
echo ""
echo "💻 Local access:"
echo "   http://localhost:$FRONTEND_PORT"
echo ""
echo "ℹ️  How it works:"
echo "   • Friends connect to: $NGROK_URL"
echo "   • Socket.IO uses same-origin (ngrok URL)"
echo "   • Vite proxy forwards to backend"
echo "   • Backend runs on localhost:3001"
echo ""
echo "⏸️  To stop: pkill -f ngrok; pkill -f vite; pkill -f nodemon"
echo ""

# Save PIDs for cleanup
echo "$BACKEND_PID $FRONTEND_PID $NGROK_PID" > logs/pids.txt

echo "✅ Setup complete! Keep this terminal open."
echo ""
echo "📊 Monitor logs:"
echo "   Backend:  tail -f logs/backend.log"
echo "   Frontend: tail -f logs/frontend.log"
echo "   ngrok:    tail -f logs/ngrok.log"
