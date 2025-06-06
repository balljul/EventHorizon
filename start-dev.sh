#!/bin/bash

# EventHorizon Development Startup Script
# Starts both backend and frontend in performant, lightweight mode

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🚀 Starting EventHorizon Development Environment${NC}"
echo -e "${BLUE}=================================================${NC}"

# Function to kill processes on exit
cleanup() {
    echo -e "\n${YELLOW}🛑 Shutting down services...${NC}"
    pkill -f "nest start" 2>/dev/null || true
    pkill -f "next dev" 2>/dev/null || true
    exit 0
}

# Trap cleanup function on script exit
trap cleanup SIGINT SIGTERM EXIT

# Check if database is running
echo -e "${BLUE}🔍 Checking database connection...${NC}"
if ! docker compose ps | grep -q "postgres.*Up"; then
    echo -e "${YELLOW}⚠️  Database not running. Starting database...${NC}"
    docker compose up -d postgres
    echo -e "${GREEN}✅ Database started${NC}"
    sleep 3
else
    echo -e "${GREEN}✅ Database is running${NC}"
fi

# Start backend in background with optimized settings
echo -e "${BLUE}🔧 Starting backend (NestJS)...${NC}"
cd backend

# Set Node.js performance flags
export NODE_OPTIONS="--max-old-space-size=512 --no-warnings"
export NODE_ENV=development

# Kill any existing backend processes
pkill -f "nest start" 2>/dev/null || true

# Start backend in background
npm run start:dev > ../backend.log 2>&1 &
BACKEND_PID=$!

echo -e "${GREEN}✅ Backend starting (PID: $BACKEND_PID)${NC}"

# Wait for backend to be ready
echo -e "${BLUE}⏳ Waiting for backend to start...${NC}"
for i in {1..30}; do
    if curl -s http://localhost:3000 >/dev/null 2>&1; then
        echo -e "${GREEN}✅ Backend is ready on http://localhost:3000${NC}"
        break
    fi
    if [ $i -eq 30 ]; then
        echo -e "${RED}❌ Backend failed to start${NC}"
        exit 1
    fi
    sleep 1
    echo -n "."
done

# Start frontend in background with optimized settings
echo -e "\n${BLUE}🔧 Starting frontend (Next.js)...${NC}"
cd ../frontend

# Set Next.js performance flags
export NEXT_TELEMETRY_DISABLED=1
export NODE_OPTIONS="--max-old-space-size=512 --no-warnings"

# Kill any existing frontend processes
pkill -f "next dev" 2>/dev/null || true

# Start frontend on port 3001 (backend uses 3000)
npx next dev -p 3001 > ../frontend.log 2>&1 &
FRONTEND_PID=$!

echo -e "${GREEN}✅ Frontend starting (PID: $FRONTEND_PID)${NC}"

# Wait for frontend to be ready
echo -e "${BLUE}⏳ Waiting for frontend to start...${NC}"
for i in {1..30}; do
    if curl -s http://localhost:3001 >/dev/null 2>&1; then
        echo -e "${GREEN}✅ Frontend is ready on http://localhost:3001${NC}"
        break
    fi
    if [ $i -eq 30 ]; then
        echo -e "${RED}❌ Frontend failed to start${NC}"
        exit 1
    fi
    sleep 1
    echo -n "."
done

echo -e "\n${GREEN}🎉 EventHorizon is ready!${NC}"
echo -e "${GREEN}================================${NC}"
echo -e "${GREEN}🌐 Frontend: ${BLUE}http://localhost:3001${NC}"
echo -e "${GREEN}🔧 Backend:  ${BLUE}http://localhost:3000${NC}"
echo -e "${GREEN}📊 Database: ${BLUE}postgresql://localhost:5432${NC}"
echo -e "${GREEN}================================${NC}"
echo -e "${YELLOW}💡 Press Ctrl+C to stop all services${NC}"
echo -e "${YELLOW}📝 Logs: backend.log & frontend.log${NC}"

# Keep script running and show live logs
echo -e "\n${BLUE}📋 Live logs (Ctrl+C to exit):${NC}"
tail -f ../backend.log ../frontend.log