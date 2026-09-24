# 🔧 Brute Forcer Pro - Backend Setup Guide

Complete setup instructions for the backend API server.

## Quick Start (Docker)

The easiest way to get started is using Docker Compose:

```bash
# Clone and navigate
cd backend

# Start all services (PostgreSQL, Redis, API)
docker-compose up

# In another terminal, initialize the database
docker exec brute-forcer-postgres psql -U postgres -d brute_forcer_pro -f /docker-entrypoint-initdb.d/schema.sql
```

The API will be available at `http://localhost:3000`

## Manual Setup

### 1. Prerequisites

```bash
# macOS
brew install postgresql redis node

# Ubuntu/Debian
sudo apt-get install postgresql postgresql-contrib redis-server nodejs npm

# Windows (using Chocolatey)
choco install postgresql redis nodejs npm
```

### 2. PostgreSQL Setup

```bash
# Start PostgreSQL (if not running)
# macOS
brew services start postgresql

# Ubuntu/Debian
sudo service postgresql start

# Windows
# PostgreSQL typically starts as a service automatically

# Create database and user
createdb brute_forcer_pro

# Load schema
psql brute_forcer_pro < src/config/schema.sql

# Verify tables
psql brute_forcer_pro -c "\dt"
```

### 3. Redis Setup

```bash
# Start Redis
# macOS
brew services start redis

# Ubuntu/Debian
sudo service redis-server start

# Windows
# Use WSL or installed Redis for Windows

# Test Redis connection
redis-cli ping
# Should respond with PONG
```

### 4. Install Node Dependencies

```bash
npm install
```

### 5. Environment Configuration

```bash
# Copy example config
cp .env.example .env

# Edit .env with your settings (mostly defaults work for local dev)
# Key settings to verify:
# - DB_HOST=localhost
# - DB_USER=postgres
# - REDIS_HOST=localhost
# - JWT_SECRET (should be changed in production)
```

### 6. Start Development Server

```bash
npm run dev
```

Server will start at `http://localhost:3000`

## Testing the API

### 1. Register User

```bash
curl -X POST http://localhost:3000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "TestPassword123!"
  }'
```

Response:
```json
{
  "success": true,
  "data": {
    "id": "uuid...",
    "email": "test@example.com",
    "apiKey": "sk_..."
  },
  "message": "User registered successfully",
  "status": 201
}
```

### 2. Login

```bash
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "TestPassword123!"
  }'
```

Response includes `token` and `refreshToken`

### 3. Create Operation

```bash
curl -X POST http://localhost:3000/api/v1/operations \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <your_token>" \
  -d '{
    "name": "Test Operation",
    "target": "http://example.com",
    "type": "dictionary"
  }'
```

### 4. Start Operation

```bash
curl -X POST http://localhost:3000/api/v1/operations/<operation_id>/start \
  -H "Authorization: Bearer <your_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "wordlist": ["admin", "password", "test"],
    "threads": 4,
    "delay": 100
  }'
```

### 5. Check Operation Status

```bash
curl http://localhost:3000/api/v1/operations/<operation_id> \
  -H "Authorization: Bearer <your_token>"
```

### 6. Get System Status

```bash
curl http://localhost:3000/system/health
```

## Database Management

### View Logs

```bash
# PostgreSQL logs
tail -f /var/log/postgresql/postgresql.log

# Application logs (in development)
# Check the logs directory
ls -la logs/
```

### Database Queries

```bash
# Connect to database
psql brute_forcer_pro

# Useful queries
\dt                              # List tables
\d users                         # Describe users table
SELECT * FROM users;             # View users
SELECT * FROM operations;        # View operations
SELECT COUNT(*) FROM results;    # Count results
```

### Reset Database

```bash
# Drop and recreate database
dropdb brute_forcer_pro
createdb brute_forcer_pro
psql brute_forcer_pro < src/config/schema.sql
```

## Development Commands

```bash
# Start development server with hot reload
npm run dev

# Build production bundle
npm run build

# Start production server
npm start

# Run linter
npm run lint

# Fix linter issues
npm run lint:fix

# Run tests
npm test

# Watch mode for tests
npm run test:watch
```

## Troubleshooting

### PostgreSQL Connection Error

```
Error: connect ECONNREFUSED 127.0.0.1:5432
```

**Solution:**
- Check PostgreSQL is running: `brew services list` (macOS)
- Start PostgreSQL: `brew services start postgresql`
- Check connection string in `.env`

### Redis Connection Error

```
Error: Redis connection refused on 6379
```

**Solution:**
- Check Redis is running: `redis-cli ping`
- Start Redis: `brew services start redis`
- Check REDIS_HOST in `.env`

### Port Already in Use

```
Error: listen EADDRINUSE: address already in use :::3000
```

**Solution:**
```bash
# Find process using port 3000
lsof -i :3000

# Kill process
kill -9 <PID>

# Or change port in .env
PORT=3001
```

### Database Schema Error

```
Error: relation "users" does not exist
```

**Solution:**
```bash
# Check if database exists
psql -l

# Load schema
psql brute_forcer_pro < src/config/schema.sql

# Verify tables
psql brute_forcer_pro -c "\dt"
```

## Production Deployment

### Environment Variables (Production)

Create `.env.production`:
```
NODE_ENV=production
PORT=3000
DB_HOST=prod-db-server
DB_USER=prod_user
DB_PASSWORD=secure_password
JWT_SECRET=very_secure_random_string
CORS_ORIGIN=https://yourdomain.com
```

### Build and Run

```bash
npm run build
npm start
```

### Docker Deployment

```bash
# Build image
docker build -t brute-forcer-api .

# Run container
docker run -p 3000:3000 --env-file .env.production brute-forcer-api
```

## API Documentation

See `README.md` for:
- Full API endpoint list
- Request/response examples
- Authentication details
- Error codes

## Next Steps

1. Review API endpoints in `src/routes/`
2. Check database schema in `src/config/schema.sql`
3. Study authentication flow in `src/services/AuthService.ts`
4. Explore Brute Force Engine in `src/services/BruteForceService.ts`

---

**For issues**: Check logs and error messages carefully
**For features**: See roadmap in main README.md
