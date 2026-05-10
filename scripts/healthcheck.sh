#!/bin/bash

###############################################################################
# Color Delta V5 - Health Check Script
# Vérifie que backend + frontend sont opérationnels
# Usage: ./healthcheck.sh
# Exit codes: 0=OK, 1=ERROR
###############################################################################

set -e

# Configuration
BACKEND_URL="${BACKEND_URL:-http://localhost:5000}"
FRONTEND_URL="${FRONTEND_URL:-http://localhost:3000}"
TIMEOUT=5

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${YELLOW}Color Delta V5 - Health Check${NC}\n"

# Function: Check HTTP endpoint
check_endpoint() {
  local NAME=$1
  local URL=$2
  local EXPECTED=$3
  
  echo -n "  Checking ${NAME}... "
  
  RESPONSE=$(curl -s -w "\n%{http_code}" --max-time $TIMEOUT "$URL" || echo "000")
  HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
  BODY=$(echo "$RESPONSE" | head -n-1)
  
  if [ "$HTTP_CODE" = "200" ]; then
    if [ -n "$EXPECTED" ]; then
      if echo "$BODY" | grep -q "$EXPECTED"; then
        echo -e "${GREEN}✓ OK${NC}"
        return 0
      else
        echo -e "${RED}✗ FAIL (unexpected response)${NC}"
        return 1
      fi
    else
      echo -e "${GREEN}✓ OK${NC}"
      return 0
    fi
  else
    echo -e "${RED}✗ FAIL (HTTP $HTTP_CODE)${NC}"
    return 1
  fi
}

# Run checks
FAILED=0

echo "Backend:"
check_endpoint "API Health" "${BACKEND_URL}/api/health" "ok" || FAILED=$((FAILED+1))

echo -e "\nFrontend:"
check_endpoint "Frontend" "${FRONTEND_URL}" "" || FAILED=$((FAILED+1))

# Summary
echo -e "\n${YELLOW}═══════════════════════════${NC}"
if [ $FAILED -eq 0 ]; then
  echo -e "${GREEN}✓ All checks passed${NC}"
  exit 0
else
  echo -e "${RED}✗ $FAILED check(s) failed${NC}"
  exit 1
fi
