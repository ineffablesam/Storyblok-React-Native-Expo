#!/bin/bash

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}============================================${NC}"
echo -e "${BLUE} 🚀 Starting Expo + SSL Proxy ${NC}"
echo -e "${YELLOW}============================================${NC}"

# Start SSL proxy in background
echo -e "${GREEN}🔒 Starting SSL Proxy on https://localhost:8010...${NC}"
local-ssl-proxy --source 8010 --target 8081 --cert localhost.pem --key localhost-key.pem &

# Start Expo
echo -e "${GREEN}📱 Starting Expo...${NC}"
npx expo start
