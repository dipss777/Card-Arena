#!/bin/bash

# Color codes for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}🌍 Setting up network play...${NC}"
echo ""

# Get local IP address
IP=""
if command -v ipconfig &> /dev/null; then
    # Try en0 (Ethernet)
    IP=$(ipconfig getifaddr en0 2>/dev/null)
    
    # If en0 failed, try en1 (WiFi)
    if [ -z "$IP" ]; then
        IP=$(ipconfig getifaddr en1 2>/dev/null)
    fi
fi

# Fallback to ifconfig if ipconfig didn't work
if [ -z "$IP" ]; then
    IP=$(ifconfig | grep "inet " | grep -v 127.0.0.1 | awk '{print $2}' | head -1)
fi

if [ -z "$IP" ]; then
    echo -e "${RED}❌ Could not detect your local IP address${NC}"
    echo "Please enter your IP manually:"
    read IP
fi

echo -e "${GREEN}✅ Your Local IP: $IP${NC}"
echo ""

# Update backend .env
echo -e "${YELLOW}⚙️  Configuring backend...${NC}"
cd backend

# Backup existing .env
if [ -f .env ]; then
    cp .env .env.backup
fi

# Update CORS_ORIGIN
if grep -q "CORS_ORIGIN=" .env; then
    # Update existing line
    sed -i.bak "s|CORS_ORIGIN=.*|CORS_ORIGIN=http://$IP:5173,http://localhost:5173|" .env
    rm .env.bak
else
    # Add new line
    echo "CORS_ORIGIN=http://$IP:5173,http://localhost:5173" >> .env
fi

echo -e "${GREEN}✅ Backend configured${NC}"
cd ..

# Update frontend .env
echo -e "${YELLOW}⚙️  Configuring frontend...${NC}"
cd frontend

# Create/update frontend .env
echo "VITE_SOCKET_URL=http://$IP:3001" > .env

echo -e "${GREEN}✅ Frontend configured${NC}"
cd ..

echo ""
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}🎮 Network Play Setup Complete!${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo -e "${YELLOW}📱 Share this URL with friends on the same WiFi:${NC}"
echo -e "${GREEN}   http://$IP:5173${NC}"
echo ""
echo -e "${YELLOW}💻 You can also access locally at:${NC}"
echo -e "${GREEN}   http://localhost:5173${NC}"
echo ""
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo -e "${YELLOW}🚀 Starting servers...${NC}"
echo ""

# Start backend in background
echo -e "${BLUE}Starting backend on http://$IP:3001...${NC}"
cd backend
npm run dev > ../logs/backend.log 2>&1 &
BACKEND_PID=$!
cd ..

# Wait for backend to start
sleep 3

# Start frontend in background with --host flag
echo -e "${BLUE}Starting frontend on http://$IP:5173...${NC}"
cd frontend
npm run dev -- --host > ../logs/frontend.log 2>&1 &
FRONTEND_PID=$!
cd ..

# Wait for frontend to start
sleep 3

echo ""
echo -e "${GREEN}✅ Servers are running!${NC}"
echo ""
echo -e "${YELLOW}📋 Quick Info:${NC}"
echo -e "   Backend:  http://$IP:3001"
echo -e "   Frontend: http://$IP:5173"
echo ""
echo -e "${YELLOW}📝 Important:${NC}"
echo -e "   • Make sure your firewall allows connections on ports 3001 and 5173"
echo -e "   • All players must be on the same WiFi network"
echo -e "   • Share the frontend URL with your friends"
echo ""
echo -e "${RED}⚠️  Press Ctrl+C to stop both servers${NC}"
echo ""

# Create logs directory if it doesn't exist
mkdir -p logs

# Handle Ctrl+C gracefully
cleanup() {
    echo ""
    echo -e "${YELLOW}🛑 Stopping servers...${NC}"
    kill $BACKEND_PID 2>/dev/null
    kill $FRONTEND_PID 2>/dev/null
    echo -e "${GREEN}✅ Servers stopped${NC}"
    exit 0
}

trap cleanup INT TERM

# Keep script running and show logs
echo -e "${BLUE}📊 Watching logs (Ctrl+C to stop):${NC}"
echo ""
tail -f logs/backend.log logs/frontend.log 2>/dev/null &
TAIL_PID=$!

# Wait for user interrupt
wait $BACKEND_PID $FRONTEND_PID
