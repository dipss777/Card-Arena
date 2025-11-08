#!/bin/bash

# 🃏 Card Game - Quick Start Script
# This script will set up and start your card game project

set -e  # Exit on error

echo "🃏 Welcome to Card Game Setup!"
echo "================================"
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed!"
    echo "Please install Node.js 20+ from https://nodejs.org/"
    exit 1
fi

NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 20 ]; then
    echo "⚠️  Node.js version 20+ required. Current version: $(node -v)"
    echo "Please upgrade Node.js from https://nodejs.org/"
    exit 1
fi

echo "✅ Node.js $(node -v) detected"
echo ""

# Ask user which setup they prefer
echo "Choose setup method:"
echo "1) Local Development (Recommended for development)"
echo "2) Docker (Recommended for quick demo)"
read -p "Enter choice (1 or 2): " CHOICE

if [ "$CHOICE" = "1" ]; then
    echo ""
    echo "📦 Installing backend dependencies..."
    cd backend
    cp .env.example .env 2>/dev/null || true
    npm install
    cd ..
    
    echo ""
    echo "📦 Installing frontend dependencies..."
    cd frontend
    npm install
    cd ..
    
    echo ""
    echo "✅ Installation complete!"
    echo ""
    echo "🚀 Starting servers..."
    echo ""
    echo "Backend will run on: http://localhost:3001"
    echo "Frontend will run on: http://localhost:3000"
    echo ""
    echo "Press Ctrl+C to stop both servers"
    echo ""
    
    # Start both servers
    trap 'kill $(jobs -p)' EXIT
    
    cd backend && npm run dev &
    BACKEND_PID=$!
    
    cd frontend && npm run dev &
    FRONTEND_PID=$!
    
    wait

elif [ "$CHOICE" = "2" ]; then
    if ! command -v docker &> /dev/null; then
        echo "❌ Docker is not installed!"
        echo "Please install Docker from https://www.docker.com/get-started"
        exit 1
    fi
    
    echo ""
    echo "🐳 Starting Docker containers..."
    docker-compose up -d
    
    echo ""
    echo "⏳ Waiting for services to start..."
    sleep 10
    
    echo ""
    echo "✅ Services started!"
    echo ""
    echo "Frontend: http://localhost:3000"
    echo "Backend API: http://localhost:3001"
    echo ""
    echo "To view logs: docker-compose logs -f"
    echo "To stop: docker-compose down"

else
    echo "Invalid choice. Exiting."
    exit 1
fi

echo ""
echo "🎮 Ready to play! Open http://localhost:3000 in your browser"
echo ""
