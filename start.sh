#!/bin/bash

# ============================================
# AI Genealogy Researcher - Start Script
# ============================================

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Project root directory
PROJECT_DIR="$(cd "$(dirname "$0")" && pwd)"

echo -e "${PURPLE}"
echo "╔══════════════════════════════════════════════════╗"
echo "║       🧬 AI Genealogy Researcher                ║"
echo "║       Starting Application...                    ║"
echo "╚══════════════════════════════════════════════════╝"
echo -e "${NC}"

# Load environment variables
if [ -f "$PROJECT_DIR/.env" ]; then
    export $(grep -v '^#' "$PROJECT_DIR/.env" | xargs)
    echo -e "${GREEN}✓ Environment variables loaded${NC}"
else
    echo -e "${RED}✗ .env file not found! Please create one.${NC}"
    exit 1
fi

BACKEND_PORT=${PORT:-3001}
FRONTEND_PORT=${FRONTEND_PORT:-3000}

# ============================================
# Clean up used ports
# ============================================
echo -e "\n${YELLOW}▸ Cleaning up ports...${NC}"

cleanup_port() {
    local port=$1
    local pids=$(lsof -ti :$port 2>/dev/null || true)
    if [ -n "$pids" ]; then
        echo -e "${YELLOW}  Killing processes on port $port: $pids${NC}"
        echo "$pids" | xargs kill -9 2>/dev/null || true
        sleep 1
    fi
    echo -e "${GREEN}  ✓ Port $port is free${NC}"
}

cleanup_port $BACKEND_PORT
cleanup_port $FRONTEND_PORT

# ============================================
# Check PostgreSQL
# ============================================
echo -e "\n${YELLOW}▸ Checking PostgreSQL...${NC}"

if command -v pg_isready &> /dev/null; then
    if pg_isready -h ${DB_HOST:-localhost} -p ${DB_PORT:-5432} &> /dev/null; then
        echo -e "${GREEN}  ✓ PostgreSQL is running${NC}"
    else
        echo -e "${YELLOW}  Starting PostgreSQL...${NC}"
        if [[ "$OSTYPE" == "darwin"* ]]; then
            brew services start postgresql@14 2>/dev/null || brew services start postgresql 2>/dev/null || true
        else
            sudo systemctl start postgresql 2>/dev/null || true
        fi
        sleep 2
        if pg_isready -h ${DB_HOST:-localhost} -p ${DB_PORT:-5432} &> /dev/null; then
            echo -e "${GREEN}  ✓ PostgreSQL started${NC}"
        else
            echo -e "${RED}  ✗ Could not start PostgreSQL. Please start it manually.${NC}"
            exit 1
        fi
    fi
else
    echo -e "${YELLOW}  ⚠ pg_isready not found, assuming PostgreSQL is running${NC}"
fi

# ============================================
# Create database if not exists
# ============================================
echo -e "\n${YELLOW}▸ Setting up database...${NC}"

DB_EXISTS=$(psql -h ${DB_HOST:-localhost} -p ${DB_PORT:-5432} -U ${DB_USER:-postgres} -lqt 2>/dev/null | cut -d \| -f 1 | grep -w "${DB_NAME:-ai_genealogy}" | wc -l | tr -d ' ')

if [ "$DB_EXISTS" = "0" ]; then
    echo -e "${YELLOW}  Creating database '${DB_NAME:-ai_genealogy}'...${NC}"
    createdb -h ${DB_HOST:-localhost} -p ${DB_PORT:-5432} -U ${DB_USER:-postgres} "${DB_NAME:-ai_genealogy}" 2>/dev/null || \
    psql -h ${DB_HOST:-localhost} -p ${DB_PORT:-5432} -U ${DB_USER:-postgres} -c "CREATE DATABASE ${DB_NAME:-ai_genealogy};" 2>/dev/null || true
    echo -e "${GREEN}  ✓ Database created${NC}"
else
    echo -e "${GREEN}  ✓ Database '${DB_NAME:-ai_genealogy}' already exists${NC}"
fi

# ============================================
# Install dependencies
# ============================================
echo -e "\n${YELLOW}▸ Installing dependencies...${NC}"

# Backend dependencies
if [ ! -d "$PROJECT_DIR/backend/node_modules" ]; then
    echo -e "${CYAN}  Installing backend dependencies...${NC}"
    cd "$PROJECT_DIR/backend" && npm install --silent 2>&1 | tail -1
    echo -e "${GREEN}  ✓ Backend dependencies installed${NC}"
else
    echo -e "${GREEN}  ✓ Backend dependencies already installed${NC}"
fi

# Frontend dependencies
if [ ! -d "$PROJECT_DIR/frontend/node_modules" ]; then
    echo -e "${CYAN}  Installing frontend dependencies...${NC}"
    cd "$PROJECT_DIR/frontend" && npm install --silent 2>&1 | tail -1
    echo -e "${GREEN}  ✓ Frontend dependencies installed${NC}"
else
    echo -e "${GREEN}  ✓ Frontend dependencies already installed${NC}"
fi

cd "$PROJECT_DIR"

# ============================================
# Seed database
# ============================================
echo -e "\n${YELLOW}▸ Seeding database...${NC}"
cd "$PROJECT_DIR/backend" && node seed.js
echo -e "${GREEN}  ✓ Database seeded with sample data${NC}"

cd "$PROJECT_DIR"

# ============================================
# Start servers with hot reload
# ============================================
echo -e "\n${YELLOW}▸ Starting servers with hot reload...${NC}"

# Cleanup function for graceful shutdown
cleanup() {
    echo -e "\n${YELLOW}Shutting down...${NC}"
    kill $(jobs -p) 2>/dev/null || true
    cleanup_port $BACKEND_PORT
    cleanup_port $FRONTEND_PORT
    echo -e "${GREEN}✓ All processes stopped${NC}"
    exit 0
}

trap cleanup SIGINT SIGTERM

# Start backend with nodemon (hot reload)
echo -e "${CYAN}  Starting backend on port $BACKEND_PORT with hot reload (nodemon)...${NC}"
cd "$PROJECT_DIR/backend" && npx nodemon server.js &
BACKEND_PID=$!

# Wait for backend to be ready
sleep 3

# Start frontend with React dev server (hot reload built-in)
echo -e "${CYAN}  Starting frontend on port $FRONTEND_PORT with hot reload...${NC}"
cd "$PROJECT_DIR/frontend" && PORT=$FRONTEND_PORT BROWSER=none npm start &
FRONTEND_PID=$!

# Wait for frontend to compile
sleep 5

echo -e "\n${GREEN}"
echo "╔══════════════════════════════════════════════════╗"
echo "║       🧬 AI Genealogy Researcher                ║"
echo "║       Application is running!                    ║"
echo "║                                                  ║"
echo "║  Frontend:  http://localhost:$FRONTEND_PORT          ║"
echo "║  Backend:   http://localhost:$BACKEND_PORT          ║"
echo "║                                                  ║"
echo "║  Login:     admin@genealogy.com / password123    ║"
echo "║                                                  ║"
echo "║  Press Ctrl+C to stop all servers                ║"
echo "╚══════════════════════════════════════════════════╝"
echo -e "${NC}"

# Open browser
if [[ "$OSTYPE" == "darwin"* ]]; then
    sleep 2 && open "http://localhost:$FRONTEND_PORT" &
fi

# Wait for both processes
wait
