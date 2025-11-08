#!/bin/bash

# Color codes
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${BLUE}🌍 Setting up Internet Play with ngrok...${NC}"
echo ""

# Check if ngrok is installed
if ! command -v ngrok &> /dev/null; then
    echo -e "${RED}❌ ngrok is not installed${NC}"
    echo ""
    echo "Please install ngrok first:"
    echo "  brew install ngrok"
    echo ""
    echo "Or download from: https://ngrok.com/download"
    exit 1
fi

echo -e "${GREEN}✅ ngrok is installed${NC}"
echo ""

# Check if ngrok is authenticated
if ! ngrok config check &> /dev/null; then
    echo -e "${YELLOW}⚠️  ngrok not authenticated${NC}"
    echo ""
    echo "Please:"
    echo "1. Sign up at: https://ngrok.com/signup"
    echo "2. Get your authtoken from: https://dashboard.ngrok.com/get-started/your-authtoken"
    echo "3. Run: ngrok config add-authtoken YOUR_TOKEN"
    echo ""
    exit 1
fi

echo -e "${GREEN}✅ ngrok is authenticated${NC}"
echo ""

# Create logs directory
mkdir -p logs

echo -e "${YELLOW}🚀 Step 1: Starting backend (local only)...${NC}"
cd backend
npm run dev > ../logs/backend.log 2>&1 &
BACKEND_PID=$!
cd ..
sleep 5
echo -e "${GREEN}✅ Backend started on http://localhost:3001${NC}"
echo ""

echo -e "${YELLOW}⚙️  Step 2: Configuring frontend...${NC}"

# Frontend should NOT have VITE_SOCKET_URL set
# This allows Socket.IO to connect to same origin (ngrok URL)
# Vite proxy will forward /socket.io to local backend
cd frontend
rm -f .env
cd ..

echo -e "${GREEN}✅ Frontend configured (using same-origin socket)${NC}"
echo ""

echo -e "${YELLOW}🚀 Step 3: Starting frontend...${NC}"
cd frontend
npm run dev > ../logs/frontend.log 2>&1 &
FRONTEND_PID=$!
cd ..
sleep 5

# Get the actual port frontend is using
FRONTEND_PORT=""
for i in {1..10}; do
    if lsof -i :5173 > /dev/null 2>&1; then
        FRONTEND_PORT=5173
        break
    elif lsof -i :3000 > /dev/null 2>&1; then
        FRONTEND_PORT=3000
        break
    fi
    sleep 1
done

if [ -z "$FRONTEND_PORT" ]; then
    echo -e "${RED}❌ Frontend failed to start${NC}"
    kill $BACKEND_PID 2>/dev/null
    exit 1
fi

echo -e "${GREEN}✅ Frontend started on port $FRONTEND_PORT${NC}"
echo ""

echo -e "${YELLOW}🌐 Step 4: Creating ngrok tunnel for frontend...${NC}"
ngrok http $FRONTEND_PORT --log=stdout > logs/ngrok-frontend.log 2>&1 &
NGROK_PID=$!
sleep 5

# Get frontend ngrok URL
FRONTEND_URL=""
for i in {1..10}; do
    FRONTEND_URL=$(curl -s http://localhost:4040/api/tunnels 2>/dev/null | grep -o '"public_url":"https://[^"]*' | grep -o 'https://[^"]*' | head -1)
    if [ ! -z "$FRONTEND_URL" ]; then
        break
    fi
    sleep 1
done

if [ -z "$FRONTEND_URL" ]; then
    echo -e "${RED}❌ Failed to get ngrok URL${NC}"
    kill $BACKEND_PID $FRONTEND_PID $NGROK_PID 2>/dev/null
    exit 1
fi

echo -e "${GREEN}✅ Frontend ngrok URL: $FRONTEND_URL${NC}"
echo ""

echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}🎮 Internet Play Setup Complete!${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo -e "${YELLOW}🌍 Share this URL with friends ANYWHERE:${NC}"
echo -e "${GREEN}   $FRONTEND_URL${NC}"
echo ""
echo -e "${YELLOW}💻 Local access:${NC}"
echo -e "${GREEN}   http://localhost:$FRONTEND_PORT${NC}"
echo ""
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo -e "${YELLOW}📝 Important Notes:${NC}"
echo -e "   • This URL works from ANYWHERE (not just your WiFi)"
echo -e "   • Backend runs locally on localhost:3001"
echo -e "   • Frontend tunneled through ngrok with Vite proxy"
echo -e "   • Socket.IO connects via same-origin (proxied to backend)"
echo -e "   • Free tier: URL changes on restart, 2hr session limit"
echo -e "   • Keep this terminal running while playing"
echo ""
echo -e "${YELLOW}💡 Tip: Copy the URL above and send to your friends!${NC}"
echo ""
echo -e "${RED}⚠️  Press Ctrl+C to stop all services${NC}"
echo ""

# Cleanup function
cleanup() {
    echo ""
    echo -e "${YELLOW}🛑 Stopping all services...${NC}"
    kill $BACKEND_PID 2>/dev/null
    kill $FRONTEND_PID 2>/dev/null
    kill $NGROK_PID 2>/dev/null
    pkill -f "ngrok" 2>/dev/null
    echo -e "${GREEN}✅ All services stopped${NC}"
    exit 0
}

trap cleanup INT TERM

# Keep script running
echo -e "${BLUE}📊 Services are running... (Press Ctrl+C to stop)${NC}"
echo ""

# Wait for processes
wait $BACKEND_PID $FRONTEND_PID $NGROK_PID
