.PHONY: help setup build start stop restart logs clean test

# Colors
RED = \033[0;31m
GREEN = \033[0;32m
YELLOW = \033[1;33m
BLUE = \033[0;34m
NC = \033[0m # No Color

help:
	@echo "$(BLUE)Brute Forcer Pro - Makefile Commands$(NC)"
	@echo ""
	@echo "$(GREEN)Setup & Installation:$(NC)"
	@echo "  make setup          - Full setup (docker build + start)"
	@echo "  make build          - Build docker images"
	@echo "  make env            - Create .env file from template"
	@echo ""
	@echo "$(GREEN)Running Services:$(NC)"
	@echo "  make start          - Start all services"
	@echo "  make stop           - Stop all services"
	@echo "  make restart        - Restart all services"
	@echo "  make logs           - View logs (all services)"
	@echo "  make logs-api       - View API logs"
	@echo "  make logs-db        - View database logs"
	@echo ""
	@echo "$(GREEN)Development:$(NC)"
	@echo "  make test           - Run backend tests"
	@echo "  make lint           - Run linter"
	@echo "  make shell          - Open backend shell"
	@echo "  make db-shell       - Open database shell"
	@echo "  make redis-shell    - Open Redis shell"
	@echo ""
	@echo "$(GREEN)Database:$(NC)"
	@echo "  make db-init        - Initialize database"
	@echo "  make db-reset       - Reset database (deletes all data!)"
	@echo "  make db-backup      - Backup database"
	@echo "  make db-restore     - Restore from backup"
	@echo ""
	@echo "$(GREEN)Cleanup:$(NC)"
	@echo "  make clean          - Stop and remove containers"
	@echo "  make clean-volumes  - Remove all volumes (DATA LOSS!)"
	@echo ""
	@echo "$(GREEN)Status:$(NC)"
	@echo "  make status         - Show service status"
	@echo "  make health         - Check API health"

# Setup
setup: env build start
	@echo "$(GREEN)✓ Setup complete!$(NC)"
	@echo "Visit http://localhost:3000"

env:
	@if [ ! -f backend/.env ]; then \
		cp backend/.env.example backend/.env; \
		echo "$(GREEN)✓ Created backend/.env$(NC)"; \
	else \
		echo "$(YELLOW)✗ backend/.env already exists$(NC)"; \
	fi

build:
	@echo "$(BLUE)Building docker images...$(NC)"
	docker-compose build
	@echo "$(GREEN)✓ Build complete$(NC)"

# Running Services
start:
	@echo "$(BLUE)Starting services...$(NC)"
	docker-compose up -d
	@echo "$(GREEN)✓ Services started$(NC)"
	@echo "  Backend: http://localhost:3000"
	@echo "  Database: localhost:5432"
	@echo "  Redis: localhost:6379"

stop:
	@echo "$(BLUE)Stopping services...$(NC)"
	docker-compose stop
	@echo "$(GREEN)✓ Services stopped$(NC)"

restart:
	@echo "$(BLUE)Restarting services...$(NC)"
	docker-compose restart
	@echo "$(GREEN)✓ Services restarted$(NC)"

logs:
	docker-compose logs -f

logs-api:
	docker-compose logs -f api

logs-db:
	docker-compose logs -f postgres

logs-redis:
	docker-compose logs -f redis

# Development
test:
	@echo "$(BLUE)Running tests...$(NC)"
	docker-compose exec api npm test
	@echo "$(GREEN)✓ Tests complete$(NC)"

lint:
	@echo "$(BLUE)Running linter...$(NC)"
	docker-compose exec api npm run lint
	@echo "$(GREEN)✓ Lint complete$(NC)"

shell:
	@echo "$(BLUE)Opening backend shell...$(NC)"
	docker-compose exec api bash

db-shell:
	@echo "$(BLUE)Opening database shell...$(NC)"
	docker-compose exec postgres psql -U postgres -d brute_forcer_pro

redis-shell:
	@echo "$(BLUE)Opening Redis shell...$(NC)"
	docker-compose exec redis redis-cli

# Database
db-init:
	@echo "$(BLUE)Initializing database...$(NC)"
	docker-compose up -d postgres
	sleep 10
	docker-compose exec -T postgres psql -U postgres -d brute_forcer_pro -f /docker-entrypoint-initdb.d/schema.sql
	@echo "$(GREEN)✓ Database initialized$(NC)"

db-reset:
	@echo "$(RED)⚠️  This will delete all data!$(NC)"
	@read -p "Are you sure? (y/n) " confirm; \
	if [ "$$confirm" = "y" ]; then \
		docker-compose down -v; \
		docker-compose up -d; \
		echo "$(GREEN)✓ Database reset$(NC)"; \
	else \
		echo "$(YELLOW)Cancelled$(NC)"; \
	fi

db-backup:
	@echo "$(BLUE)Backing up database...$(NC)"
	@mkdir -p backups
	docker-compose exec -T postgres pg_dump -U postgres brute_forcer_pro > backups/backup-$$(date +%Y%m%d-%H%M%S).sql
	@echo "$(GREEN)✓ Database backed up$(NC)"

db-restore:
	@echo "$(BLUE)Restoring database...$(NC)"
	@ls -t backups/backup-*.sql | head -1 | xargs -I {} sh -c 'docker-compose exec -T postgres psql -U postgres brute_forcer_pro < {}'
	@echo "$(GREEN)✓ Database restored$(NC)"

# Cleanup
clean:
	@echo "$(RED)Removing containers...$(NC)"
	docker-compose down
	@echo "$(GREEN)✓ Cleanup complete$(NC)"

clean-volumes:
	@echo "$(RED)⚠️  This will delete all volumes and data!$(NC)"
	@read -p "Are you sure? (y/n) " confirm; \
	if [ "$$confirm" = "y" ]; then \
		docker-compose down -v; \
		echo "$(GREEN)✓ Volumes cleaned$(NC)"; \
	else \
		echo "$(YELLOW)Cancelled$(NC)"; \
	fi

# Status
status:
	docker-compose ps

health:
	@echo "$(BLUE)Checking API health...$(NC)"
	@curl -s http://localhost:3000/api/health | jq '.' || echo "API not responding"

# Install dependencies
install:
	@echo "$(BLUE)Installing dependencies...$(NC)"
	cd backend && npm install
	@echo "$(GREEN)✓ Dependencies installed$(NC)"

# Compile TypeScript
compile:
	@echo "$(BLUE)Compiling TypeScript...$(NC)"
	cd backend && npm run build
	@echo "$(GREEN)✓ Compilation complete$(NC)"

.DEFAULT_GOAL := help
