# 🚀 Brute Forcer Pro - API Backend

Enterprise-grade REST API backend for Brute Forcer Pro penetration testing tool.

## 📋 Overview

This is the server-side API built with Node.js, Express, TypeScript, and PostgreSQL. It provides all backend functionality including authentication, operation management, results tracking, and system logging.

## 🔧 Tech Stack

- **Runtime**: Node.js 18+
- **Framework**: Express.js
- **Language**: TypeScript
- **Database**: PostgreSQL 13+
- **Caching**: Redis 7+
- **Authentication**: JWT (JSON Web Tokens)
- **Validation**: express-validator
- **Logging**: Winston
- **Password Hashing**: bcrypt

## 📦 Installation

### Prerequisites
- Node.js 18.0.0+
- npm 9.0.0+
- PostgreSQL 13+
- Redis 7+

### Setup

1. **Clone and Navigate**
```bash
cd backend
```

2. **Install Dependencies**
```bash
npm install
```

3. **Environment Configuration**
```bash
cp .env.example .env
# Edit .env with your configuration
```

4. **Database Setup**
```bash
# Create database
createdb brute_forcer_pro

# Load schema (optional, tables created on first query)
psql brute_forcer_pro < src/config/schema.sql
```

5. **Start Redis** (if not already running)
```bash
redis-server
```

## 🚀 Running

### Development
```bash
npm run dev
```

Server will start at `http://localhost:3000`

### Production
```bash
npm run build
npm start
```

### Testing
```bash
npm test
npm run test:watch
```

## 📁 Project Structure

```
src/
├── config/              # Configuration files
│   ├── env.ts          # Environment variables
│   ├── logger.ts       # Winston logger setup
│   ├── database.ts     # PostgreSQL connection
│   └── schema.sql      # Database schema
├── middleware/         # Express middleware
│   ├── auth.ts        # Authentication middleware
│   └── validation.ts  # Input validation
├── models/            # Database models
│   ├── BaseModel.ts   # Base model class
│   └── User.ts        # User model
├── services/          # Business logic
│   └── AuthService.ts # Authentication service
├── routes/            # API routes
│   └── auth.ts       # Auth endpoints
├── types/            # TypeScript types
│   └── index.ts      # Type definitions
├── utils/            # Utility functions
│   ├── jwt.ts       # JWT utilities
│   ├── password.ts  # Password utilities
│   └── helpers.ts   # Helper functions
├── app.ts           # Express app setup
└── index.ts         # Entry point
```

## 🔐 API Endpoints

### Authentication

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/auth/register` | Register new user |
| POST | `/api/v1/auth/login` | Login user |
| GET | `/api/v1/auth/profile` | Get user profile |
| POST | `/api/v1/auth/change-password` | Change password |
| POST | `/api/v1/auth/api-key` | Generate new API key |
| POST | `/api/v1/auth/refresh` | Refresh JWT token |

### Health Check

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/health` | Server health status |

## 🔑 Authentication

All protected endpoints require a Bearer token in the `Authorization` header:

```
Authorization: Bearer <your_jwt_token>
```

## 📝 API Examples

### Register
```bash
curl -X POST http://localhost:3000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "SecurePassword123!"
  }'
```

### Login
```bash
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "SecurePassword123!"
  }'
```

### Get Profile (Protected)
```bash
curl -X GET http://localhost:3000/api/v1/auth/profile \
  -H "Authorization: Bearer <jwt_token>"
```

## 🗄️ Database Schema

### Tables
- **users**: User accounts and credentials
- **operations**: Brute force operations
- **results**: Operation results (successful/failed attempts)
- **logs**: System event logs
- **targets**: Brute force targets
- **wordlists**: User wordlist files
- **settings**: User preferences and settings

## 🔍 Next Steps (Phase 1 Continued)

The following components are planned for completion:

- [ ] Operations management service & routes
- [ ] Results tracking service & routes
- [ ] Logs management service & routes
- [ ] Settings management service & routes
- [ ] Targets management service & routes
- [ ] Wordlists management service & routes
- [ ] Brute Force Engine (core service)
- [ ] Job Queue (task processing)
- [ ] WebSocket support (real-time updates)
- [ ] Docker configuration
- [ ] API documentation (Swagger/OpenAPI)

## 🛠️ Development

### Code Style
- TypeScript strict mode enabled
- ESLint configured for code quality
- Prettier for code formatting

### Linting
```bash
npm run lint
npm run lint:fix
```

### Build
```bash
npm run build
```

## 📚 Resources

- [Express.js Documentation](https://expressjs.com/)
- [TypeScript Documentation](https://www.typescriptlang.org/)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [JWT Introduction](https://jwt.io/introduction)

## 📄 License

Part of the Brute Forcer Pro project.

---

**Status**: Phase 1 - Backend Foundation ✅
**Version**: 1.0.0-alpha
**Last Updated**: 2026-09-24
