#!/bin/bash

###############################################################################
# Color Delta V5 - Frontend Production Startup Script
# Usage: ./start-frontend.sh [dev|prod|build]
###############################################################################

set -e  # Exit on error

MODE="${1:-prod}"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
FRONTEND_DIR="$(dirname "$SCRIPT_DIR")/frontend"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}═══════════════════════════════════════════════${NC}"
echo -e "${GREEN}  Color Delta V5 - Frontend Startup${NC}"
echo -e "${GREEN}═══════════════════════════════════════════════${NC}"

# Check Node.js version
echo -e "\n${YELLOW}[1/4]${NC} Checking Node.js version..."
NODE_VERSION=$(node --version | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
  echo -e "${RED}✗ Node.js version must be >= 18.0.0${NC}"
  echo -e "  Current: $(node --version)"
  exit 1
fi
echo -e "${GREEN}✓ Node.js $(node --version)${NC}"

# Navigate to frontend directory
cd "$FRONTEND_DIR"

# Check dependencies
echo -e "\n${YELLOW}[2/4]${NC} Checking dependencies..."
if [ ! -d "node_modules" ]; then
  echo -e "${YELLOW}  Installing dependencies...${NC}"
  npm install
else
  echo -e "${GREEN}✓ Dependencies installed${NC}"
fi

# Check .env file
echo -e "\n${YELLOW}[3/4]${NC} Checking environment configuration..."
if [ ! -f ".env" ]; then
  if [ -f "../config/.env.frontend.example" ]; then
    echo -e "${YELLOW}  Creating .env from example...${NC}"
    cp ../config/.env.frontend.example .env
    echo -e "${GREEN}✓ .env created - REVIEW AND UPDATE VALUES${NC}"
  else
    echo -e "${YELLOW}⚠ No .env file - using defaults${NC}"
  fi
else
  echo -e "${GREEN}✓ .env exists${NC}"
fi

# Start/Build frontend
echo -e "\n${YELLOW}[4/4]${NC} Starting frontend in ${MODE} mode..."

if [ "$MODE" = "dev" ]; then
  echo -e "${GREEN}→ Development mode with Vite${NC}"
  npm run dev
  
elif [ "$MODE" = "build" ]; then
  echo -e "${GREEN}→ Building production bundle${NC}"
  npm run build
  echo -e "${GREEN}✓ Build completed: ./dist/${NC}"
  echo -e "${YELLOW}  Deploy ./dist/ to your web server${NC}"
  
elif [ "$MODE" = "prod" ]; then
  echo -e "${GREEN}→ Production mode${NC}"
  
  # Build if dist doesn't exist
  if [ ! -d "dist" ]; then
    echo -e "${YELLOW}  Building production bundle first...${NC}"
    npm run build
  fi
  
  # Serve production build
  if command -v serve &> /dev/null; then
    echo -e "${GREEN}  Serving production build with 'serve'${NC}"
    serve -s dist -l 3000
  else
    echo -e "${YELLOW}  'serve' not found - installing...${NC}"
    npm install -g serve
    serve -s dist -l 3000
  fi
  
else
  echo -e "${RED}✗ Invalid mode: $MODE${NC}"
  echo -e "  Usage: ./start-frontend.sh [dev|prod|build]"
  exit 1
fi

echo -e "\n${GREEN}═══════════════════════════════════════════════${NC}"
echo -e "${GREEN}  Frontend started successfully!${NC}"
echo -e "${GREEN}  Access: http://localhost:3000${NC}"
echo -e "${GREEN}═══════════════════════════════════════════════${NC}\n"
