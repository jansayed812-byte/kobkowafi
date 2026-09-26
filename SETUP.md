# Brute Forcer Pro - Complete Setup Guide

## 🚀 Quick Start (Docker)

The fastest way to get started is using Docker and Docker Compose.

### Prerequisites
- Docker Desktop installed
  - **Windows/Mac**: https://www.docker.com/products/docker-desktop
  - **Linux**: `sudo apt-get install docker.io docker-compose`

### Linux/macOS Setup

```bash
# Clone the repository
git clone https://github.com/jansayed812-byte/kobkowafi.git
cd kobkowafi

# Run setup script
chmod +x setup.sh
./setup.sh
```

### Windows Setup

```cmd
# Clone the repository
git clone https://github.com/jansayed812-byte/kobkowafi.git
cd kobkowafi

# Run setup script
setup.bat
```

### Manual Docker Setup

```bash
# Copy environment configuration
cp backend/.env.example backend/.env

# Build images
docker-compose build

# Start services
docker-compose up -d

# View logs
docker-compose logs -f api
```

---

## 📊 Services Overview

After running the setup, you'll have:

| Service | URL | Purpose |
|---------|-----|---------|
| **Backend API** | http://localhost:3000 | Node.js/Express API server |
| **PostgreSQL** | localhost:5432 | Database (credentials: postgres/postgres) |
| **Redis** | localhost:6379 | Cache & job queue |
| **Frontend** | http://localhost (with nginx) | Web UI (optional) |

---

## 🧪 Testing the Setup

### Check Services Status
```bash
docker-compose ps
```

### Check API Health
```bash
curl http://localhost:3000/api/health
```

### View Logs
```bash
# All services
docker-compose logs

# Specific service
docker-compose logs -f api
docker-compose logs -f postgres
docker-compose logs -f redis
```

---

## 📱 Development Workflow

### Backend Development

```bash
# The backend code automatically reloads on changes
# Edit files in: backend/src/

# View logs while developing
docker-compose logs -f api

# Rebuild if needed
docker-compose build api
docker-compose up -d api
```

### Database Management

```bash
# Connect to PostgreSQL
docker-compose exec postgres psql -U postgres -d brute_forcer_pro

# View tables
\dt

# View schema
\d operations

# Exit
\q
```

### Redis Management

```bash
# Connect to Redis
docker-compose exec redis redis-cli

# View all keys
keys *

# Check database size
dbsize

# Exit
exit
```

---

## 🔧 Environment Configuration

### Backend Environment Variables

Edit `backend/.env`:

```env
# Server
NODE_ENV=development          # development | production | test
PORT=3000                     # API port
HOST=0.0.0.0                 # Listen on all interfaces

# Database
DB_HOST=postgres             # PostgreSQL host
DB_PORT=5432                 # PostgreSQL port
DB_USER=postgres             # Database user
DB_PASSWORD=postgres         # Database password (change in production!)
DB_NAME=brute_forcer_pro    # Database name
DB_SSL=false                 # Use SSL for database connection

# Redis
REDIS_HOST=redis             # Redis host
REDIS_PORT=6379             # Redis port
REDIS_PASSWORD=              # Redis password (if set)
REDIS_DB=0                   # Redis database number

# JWT
JWT_SECRET=dev-secret-key-change-in-production
JWT_EXPIRES_IN=24h           # Access token expiration
JWT_REFRESH_SECRET=dev-refresh-secret-change-in-production
JWT_REFRESH_EXPIRES_IN=7d    # Refresh token expiration

# Logging
LOG_LEVEL=debug              # debug | info | warn | error
```

**⚠️ IMPORTANT**: Change all secrets in production!

---

## 🐳 Docker Commands Reference

### View All Containers
```bash
docker-compose ps
```

### View Logs
```bash
# All services
docker-compose logs

# Follow logs
docker-compose logs -f

# Specific service
docker-compose logs -f api

# Last 100 lines
docker-compose logs -n 100 api
```

### Stop Services
```bash
# Graceful stop
docker-compose stop

# Stop specific service
docker-compose stop api
```

### Remove Services
```bash
# Stop and remove containers
docker-compose down

# Remove volumes (data) as well
docker-compose down -v
```

### Restart Services
```bash
# Restart all
docker-compose restart

# Restart specific service
docker-compose restart api
```

### Execute Commands in Container
```bash
# Execute command
docker-compose exec api npm test

# Connect to shell
docker-compose exec api bash
```

---

## 🔑 Authentication Flow

### 1. Register New User
```bash
curl -X POST http://localhost:3000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "securePassword123"
  }'
```

Response:
```json
{
  "success": true,
  "user": { "id": "...", "email": "..." },
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
}
```

### 2. Save Tokens
Store both `token` and `refreshToken` securely.

### 3. Use Access Token
Add to all subsequent requests:
```bash
curl -H "Authorization: Bearer <your_token>" \
  http://localhost:3000/api/v1/operations
```

### 4. Refresh Token When Expired
```bash
curl -X POST http://localhost:3000/api/v1/auth/refresh \
  -H "Content-Type: application/json" \
  -d '{"refreshToken": "<your_refresh_token>"}'
```

---

## 🔐 Security Checklist

- [ ] Change `JWT_SECRET` to a random string
- [ ] Change `JWT_REFRESH_SECRET` to a random string
- [ ] Change database password in `DB_PASSWORD`
- [ ] Set `NODE_ENV=production` in production
- [ ] Use HTTPS in production
- [ ] Set strong CORS policy
- [ ] Regularly update dependencies: `npm update`
- [ ] Run security audit: `npm audit`
- [ ] Set up database backups
- [ ] Monitor logs for suspicious activity

---

## 📦 Deployment Preparation

### Build Production Images
```bash
# Build without cache
docker-compose build --no-cache

# Verify images
docker images | grep brute-forcer
```

### Create Production .env
```bash
# Copy template
cp backend/.env.example backend/.env.production

# Edit with production values
vi backend/.env.production
```

### Test Production Build
```bash
# Override environment
NODE_ENV=production docker-compose up
```

---

## 🚀 Deployment Options

### Option 1: Docker Compose (Linux Server)
```bash
# On your server
docker-compose -f docker-compose.yml up -d

# With nginx
docker-compose --profile with-nginx up -d
```

### Option 2: Kubernetes
```bash
# Deploy to Kubernetes
kubectl apply -f k8s/
```

### Option 3: Cloud Platforms

**AWS:**
- Use ECS + RDS + ElastiCache
- See: `deployment/aws-ecs.md`

**DigitalOcean:**
- Use App Platform + Managed Database
- See: `deployment/digitalocean-app.md`

**Azure:**
- Use Container Instances + Database
- See: `deployment/azure-container.md`

---

## 🐛 Troubleshooting

### Issue: Port Already in Use
```bash
# Find process using port 3000
lsof -i :3000

# Kill process
kill -9 <PID>

# Or change port in docker-compose.yml
```

### Issue: Database Connection Failed
```bash
# Check if postgres is running
docker-compose logs postgres

# Restart postgres
docker-compose restart postgres

# Wait 10 seconds then restart api
sleep 10 && docker-compose restart api
```

### Issue: Out of Memory
```bash
# Check docker stats
docker stats

# Increase docker memory limits
# In Docker Desktop: Settings > Resources > Memory
```

### Issue: Frontend Not Loading
```bash
# If using nginx, check if running
docker-compose ps nginx

# Start with nginx profile
docker-compose --profile with-nginx up -d
```

### Issue: Slow Brute Force Operations
```bash
# Check redis
docker-compose exec redis redis-cli dbsize

# Check database connections
docker-compose exec postgres psql -U postgres -d brute_forcer_pro -c "\conninfo"
```

---

## 📚 Additional Resources

- **API Documentation**: See `API_DOCUMENTATION.md`
- **Android Build Guide**: See `ANDROID_BUILD_GUIDE.md`
- **Deployment Guide**: See `DEPLOYMENT_GUIDE.md`
- **Project Status**: See `PROJECT_STATUS.md`
- **Implementation Summary**: See `IMPLEMENTATION_SUMMARY.md`

---

## 🤝 Support

### Getting Help

1. **Check Logs**: `docker-compose logs -f`
2. **Test Endpoint**: `curl http://localhost:3000/api/health`
3. **Database Check**: Connect to postgres and verify schema
4. **Check Configuration**: Review `backend/.env`

### Common Questions

**Q: How do I change the API port?**
A: Edit `docker-compose.yml` and change `"3000:3000"` to your desired port.

**Q: How do I add a new environment variable?**
A: Add to `backend/.env` and `docker-compose.yml` environment section.

**Q: How do I backup the database?**
```bash
docker-compose exec postgres pg_dump -U postgres brute_forcer_pro > backup.sql
```

**Q: How do I restore from backup?**
```bash
docker-compose exec -T postgres psql -U postgres brute_forcer_pro < backup.sql
```

---

## 📝 Next Steps

1. ✅ Start services: `docker-compose up -d`
2. ✅ Register user: See Authentication Flow above
3. ✅ Create a target: POST `/api/v1/targets`
4. ✅ Upload wordlist: POST `/api/v1/wordlists/upload`
5. ✅ Start operation: POST `/api/v1/operations`
6. ✅ Monitor progress: GET `/api/v1/operations/{id}`
7. ✅ View results: GET `/api/v1/operations/{id}/results`
8. ✅ Build Android app: See `ANDROID_BUILD_GUIDE.md`

---

**Created**: 2024-09-26  
**Last Updated**: 2024-09-26  
**Version**: 1.0.0
