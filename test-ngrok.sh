#!/bin/bash

# Test script to verify ngrok setup

echo "🔍 Testing ngrok setup..."
echo ""

# Check if backend is running
echo "1. Checking backend..."
if lsof -i :3001 > /dev/null 2>&1; then
    echo "   ✅ Backend running on port 3001"
else
    echo "   ❌ Backend NOT running on port 3001"
    exit 1
fi

# Check if frontend is running  
echo "2. Checking frontend..."
if lsof -i :3000 > /dev/null 2>&1; then
    echo "   ✅ Frontend running on port 3000"
else
    echo "   ❌ Frontend NOT running on port 3000"
    exit 1
fi

# Check if ngrok is running
echo "3. Checking ngrok..."
if ps aux | grep -v grep | grep "ngrok http 3000" > /dev/null 2>&1; then
    echo "   ✅ ngrok running"
else
    echo "   ❌ ngrok NOT running"
    exit 1
fi

# Get ngrok URL
echo "4. Getting ngrok URL..."
NGROK_URL=$(curl -s http://localhost:4040/api/tunnels 2>/dev/null | grep -o '"public_url":"https://[^"]*' | grep -o 'https://[^"]*' | head -1)

if [ -z "$NGROK_URL" ]; then
    echo "   ❌ Could not get ngrok URL"
    exit 1
fi

echo "   ✅ ngrok URL: $NGROK_URL"
echo ""

# Test backend directly
echo "5. Testing backend directly..."
BACKEND_RESPONSE=$(curl -s http://localhost:3001/health 2>/dev/null)
if [ -n "$BACKEND_RESPONSE" ]; then
    echo "   ✅ Backend responds: $BACKEND_RESPONSE"
else
    echo "   ❌ Backend not responding"
    exit 1
fi

# Test frontend locally
echo "6. Testing frontend locally..."
FRONTEND_RESPONSE=$(curl -s http://localhost:3000 2>/dev/null | head -c 100)
if [ -n "$FRONTEND_RESPONSE" ]; then
    echo "   ✅ Frontend responds"
else
    echo "   ❌ Frontend not responding"
    exit 1
fi

# Test through ngrok
echo "7. Testing through ngrok..."
NGROK_RESPONSE=$(curl -s "$NGROK_URL" 2>/dev/null | head -c 100)
if [ -n "$NGROK_RESPONSE" ]; then
    echo "   ✅ ngrok tunnel working"
else
    echo "   ❌ ngrok tunnel not working"
    exit 1
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ ALL TESTS PASSED!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "🌍 Share this URL: $NGROK_URL"
echo ""
echo "🧪 Next: Test from another device"
echo "   1. Open $NGROK_URL on phone/tablet"
echo "   2. Try creating a room"
echo "   3. Check browser console (F12) for errors"
echo ""
