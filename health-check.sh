#!/bin/bash

# Brute Forcer Pro - Health Check Script
# Verifies that all services are running and healthy

set -e

echo "🏥 Brute Forcer Pro - Health Check"
echo "===================================="
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Check docker is running
echo -e "${BLUE}Checking Docker...${NC}"
if ! docker info > /dev/null 2>&1; then
    echo -e "${RED}✗ Docker is not running${NC}"
    exit 1
fi
echo -e "${GREEN}✓ Docker is running${NC}"

# Check services
echo ""
echo -e "${BLUE}Checking Services...${NC}"

# API
if docker-compose ps api | grep -q "Up"; then
    echo -e "${GREEN}✓ API Service${NC} (http://localhost:3000)"
else
    echo -e "${RED}✗ API Service${NC}"
fi

# PostgreSQL
if docker-compose ps postgres | grep -q "Up"; then
    echo -e "${GREEN}✓ PostgreSQL${NC} (localhost:5432)"
else
    echo -e "${RED}✗ PostgreSQL${NC}"
fi

# Redis
if docker-compose ps redis | grep -q "Up"; then
    echo -e "${GREEN}✓ Redis${NC} (localhost:6379)"
else
    echo -e "${RED}✗ Redis${NC}"
fi

# API Health Endpoint
echo ""
echo -e "${BLUE}Checking API Health...${NC}"
if curl -s http://localhost:3000/api/health > /dev/null; then
    echo -e "${GREEN}✓ API is responding${NC}"
else
    echo -e "${RED}✗ API is not responding${NC}"
fi

# Database Connection
echo ""
echo -e "${BLUE}Checking Database Connection...${NC}"
if docker-compose exec -T postgres pg_isready -U postgres > /dev/null 2>&1; then
    echo -e "${GREEN}✓ Database is accessible${NC}"
else
    echo -e "${RED}✗ Database is not accessible${NC}"
fi

# Redis Connection
echo ""
echo -e "${BLUE}Checking Redis Connection...${NC}"
if docker-compose exec -T redis redis-cli ping > /dev/null 2>&1; then
    echo -e "${GREEN}✓ Redis is accessible${NC}"
else
    echo -e "${RED}✗ Redis is not accessible${NC}"
fi

# Port Check
echo ""
echo -e "${BLUE}Checking Ports...${NC}"
for port in 3000 5432 6379; do
    if nc -z localhost $port 2>/dev/null; then
        echo -e "${GREEN}✓ Port $port is open${NC}"
    else
        echo -e "${RED}✗ Port $port is closed${NC}"
    fi
done

# Environment
echo ""
echo -e "${BLUE}Checking Configuration...${NC}"
if [ -f backend/.env ]; then
    echo -e "${GREEN}✓ backend/.env exists${NC}"
else
    echo -e "${RED}✗ backend/.env not found${NC}"
fi

# Summary
echo ""
echo -e "${BLUE}Summary:${NC}"
docker-compose ps
echo ""

# Storage
echo -e "${BLUE}Storage Usage:${NC}"
docker system df | tail -1

echo ""
echo -e "${GREEN}✅ Health check complete!${NC}"
