#!/bin/bash

# Brute Forcer Pro - Setup Script
# This script sets up the entire project for local development

set -e

echo "🚀 Brute Forcer Pro - Setup Script"
echo "===================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Check prerequisites
echo -e "${BLUE}📋 Checking prerequisites...${NC}"

if ! command -v docker &> /dev/null; then
    echo -e "${RED}✗ Docker is not installed${NC}"
    echo "Please install Docker from https://www.docker.com/products/docker-desktop"
    exit 1
fi
echo -e "${GREEN}✓ Docker installed${NC}"

if ! command -v docker-compose &> /dev/null; then
    echo -e "${RED}✗ Docker Compose is not installed${NC}"
    echo "Please install Docker Compose"
    exit 1
fi
echo -e "${GREEN}✓ Docker Compose installed${NC}"

# Create .env file if it doesn't exist
echo ""
echo -e "${BLUE}🔧 Configuring environment...${NC}"

if [ ! -f backend/.env ]; then
    echo "Creating backend/.env file..."
    cp backend/.env.example backend/.env
    echo -e "${GREEN}✓ backend/.env created${NC}"
else
    echo -e "${GREEN}✓ backend/.env already exists${NC}"
fi

# Build Docker images
echo ""
echo -e "${BLUE}🏗️  Building Docker images...${NC}"
docker-compose build

# Start services
echo ""
echo -e "${BLUE}🚀 Starting services...${NC}"
docker-compose up -d postgres redis

# Wait for postgres to be ready
echo -e "${YELLOW}⏳ Waiting for PostgreSQL to be ready...${NC}"
for i in {1..30}; do
    if docker-compose exec -T postgres pg_isready -U postgres > /dev/null 2>&1; then
        echo -e "${GREEN}✓ PostgreSQL is ready${NC}"
        break
    fi
    echo -n "."
    sleep 1
done

# Start API server
echo ""
echo -e "${BLUE}🚀 Starting API server...${NC}"
docker-compose up -d api

# Wait for API to be ready
echo -e "${YELLOW}⏳ Waiting for API to be ready...${NC}"
for i in {1..30}; do
    if curl -s http://localhost:3000/api/health > /dev/null 2>&1; then
        echo -e "${GREEN}✓ API is ready${NC}"
        break
    fi
    echo -n "."
    sleep 1
done

# Print status
echo ""
echo -e "${GREEN}✅ Setup Complete!${NC}"
echo ""
echo "📊 Services Status:"
docker-compose ps
echo ""
echo "🌐 Access points:"
echo -e "  ${BLUE}Backend API:${NC} http://localhost:3000"
echo -e "  ${BLUE}PostgreSQL:${NC} localhost:5432"
echo -e "  ${BLUE}Redis:${NC} localhost:6379"
echo ""
echo "📝 Next steps:"
echo "  1. Register a new account: POST /api/auth/register"
echo "  2. Check API documentation: GET /api/docs (if available)"
echo "  3. View logs: docker-compose logs -f api"
echo "  4. Stop services: docker-compose down"
echo ""
echo -e "${YELLOW}⚠️  Development Notes:${NC}"
echo "  - JWT_SECRET is set to 'dev-secret-key' (change in production)"
echo "  - Database will persist in docker volumes"
echo "  - Source code changes will hot-reload via npm watch"
echo ""
