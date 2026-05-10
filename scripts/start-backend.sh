#!/bin/bash

###############################################################################
# Color Delta V5 - Backend Production Startup Script
# Usage: ./start-backend.sh [dev|prod]
###############################################################################

set -e  # Exit on error

MODE="${1:-prod}"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKEND_DIR="$(dirname "$SCRIPT_DIR")/backend"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}═══════════════════════════════════════════════${NC}"
echo -e "${GREEN}  Color Delta V5 - Backend Startup${NC}"
echo -e "${GREEN}═══════════════════════════════════════════════${NC}"

# Check Node.js version
echo -e "\n${YELLOW}[1/5]${NC} Checking Node.js version..."
NODE_VERSION=$(node --version | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
  echo -e "${RED}✗ Node.js version must be >= 18.0.0${NC}"
  echo -e "  Current: $(node --version)"
  exit 1
fi
echo -e "${GREEN}✓ Node.js $(node --version)${NC}"

# Navigate to backend directory
cd "$BACKEND_DIR"

# Check dependencies
echo -e "\n${YELLOW}[2/5]${NC} Checking dependencies..."
if [ ! -d "node_modules" ]; then
  echo -e "${YELLOW}  Installing dependencies...${NC}"
  npm install --production
else
  echo -e "${GREEN}✓ Dependencies installed${NC}"
fi

# Check .env file
echo -e "\n${YELLOW}[3/5]${NC} Checking environment configuration..."
if [ ! -f ".env" ]; then
  if [ -f "../config/.env.example" ]; then
    echo -e "${YELLOW}  Creating .env from example...${NC}"
    cp ../config/.env.example .env
    echo -e "${GREEN}✓ .env created - REVIEW AND UPDATE VALUES${NC}"
  else
    echo -e "${RED}✗ No .env file found${NC}"
    echo -e "  Create .env with required variables"
    exit 1
  fi
else
  echo -e "${GREEN}✓ .env exists${NC}"
fi

# Create uploads directory
echo -e "\n${YELLOW}[4/5]${NC} Preparing directories..."
mkdir -p uploads logs
echo -e "${GREEN}✓ Directories ready${NC}"

# Start server
echo -e "\n${YELLOW}[5/5]${NC} Starting server in ${MODE} mode..."

if [ "$MODE" = "dev" ]; then
  echo -e "${GREEN}→ Development mode with nodemon${NC}"
  npm run dev
elif [ "$MODE" = "prod" ]; then
  echo -e "${GREEN}→ Production mode${NC}"
  export NODE_ENV=production
  
  # Check if PM2 available
  if command -v pm2 &> /dev/null; then
    echo -e "${GREEN}  Using PM2 process manager${NC}"
    pm2 start server.js --name "color-delta-backend" \
      --instances 2 \
      --max-memory-restart 500M \
      --log ./logs/pm2.log
    echo -e "${GREEN}✓ Server started with PM2${NC}"
    pm2 status
  else
    echo -e "${YELLOW}  PM2 not found - starting with node${NC}"
    echo -e "${YELLOW}  Install PM2 for production: npm install -g pm2${NC}"
    node server.js
  fi
else
  echo -e "${RED}✗ Invalid mode: $MODE${NC}"
  echo -e "  Usage: ./start-backend.sh [dev|prod]"
  exit 1
fi

echo -e "\n${GREEN}═══════════════════════════════════════════════${NC}"
echo -e "${GREEN}  Backend started successfully!${NC}"
echo -e "${GREEN}  Health check: http://localhost:5000/api/health${NC}"
echo -e "${GREEN}═══════════════════════════════════════════════${NC}\n"
