# Brute Forcer Pro - API Documentation

## Base URL
```
http://localhost:3000/api/v1
```

## Authentication
Most endpoints require JWT authentication. Include the token in the `Authorization` header:
```
Authorization: Bearer <your_jwt_token>
```

---

## 🔐 Authentication Endpoints

### Register User
**POST** `/auth/register`

Create a new user account.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securePassword123"
}
```

**Response (201):**
```json
{
  "success": true,
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "is_active": true,
    "created_at": "2024-09-26T10:00:00Z"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

---

### Login User
**POST** `/auth/login`

Authenticate and get JWT tokens.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securePassword123"
}
```

**Response (200):**
```json
{
  "success": true,
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "api_key": "sk-xxxxx"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

---

### Refresh Token
**POST** `/auth/refresh`

Get a new access token using refresh token.

**Request Body:**
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Response (200):**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

---

### Get Current User Profile
**GET** `/auth/profile`

Get authenticated user information.

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "success": true,
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "api_key": "sk-xxxxx",
    "is_active": true,
    "is_admin": false,
    "created_at": "2024-09-26T10:00:00Z",
    "updated_at": "2024-09-26T10:00:00Z"
  }
}
```

---

## 🎯 Operations Endpoints

### Create Brute Force Operation
**POST** `/operations`

Start a new brute force attack.

**Request Body:**
```json
{
  "name": "SSH Server Attack",
  "description": "Testing SSH credentials",
  "target": {
    "protocol": "ssh",
    "host": "target.example.com",
    "port": 22
  },
  "attack_type": "dictionary",
  "wordlist_id": "uuid",
  "username": "admin",
  "max_threads": 10,
  "timeout": 5000,
  "delay": 100
}
```

**Response (201):**
```json
{
  "success": true,
  "operation": {
    "id": "uuid",
    "name": "SSH Server Attack",
    "status": "pending",
    "progress": 0,
    "created_at": "2024-09-26T10:00:00Z"
  }
}
```

---

### List Operations
**GET** `/operations?page=1&pageSize=10`

Get paginated list of user's operations.

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `pageSize` (optional): Items per page (default: 10)

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "name": "SSH Server Attack",
      "status": "running",
      "progress": 45,
      "created_at": "2024-09-26T10:00:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "pageSize": 10,
    "total": 5
  }
}
```

---

### Get Operation Details
**GET** `/operations/{operationId}`

Get detailed information about a specific operation.

**Response (200):**
```json
{
  "success": true,
  "operation": {
    "id": "uuid",
    "name": "SSH Server Attack",
    "status": "running",
    "progress": 45,
    "target": {
      "protocol": "ssh",
      "host": "target.example.com",
      "port": 22
    },
    "created_at": "2024-09-26T10:00:00Z",
    "started_at": "2024-09-26T10:05:00Z"
  }
}
```

---

### Update Operation Status
**PATCH** `/operations/{operationId}/status`

Start, pause, or stop an operation.

**Request Body:**
```json
{
  "action": "pause"
}
```

**Valid Actions:**
- `start`: Start the operation
- `pause`: Pause the operation
- `resume`: Resume paused operation
- `stop`: Stop the operation

**Response (200):**
```json
{
  "success": true,
  "operation": {
    "id": "uuid",
    "status": "paused"
  }
}
```

---

### Delete Operation
**DELETE** `/operations/{operationId}`

Delete an operation and its results.

**Response (200):**
```json
{
  "success": true,
  "message": "Operation deleted"
}
```

---

## 📊 Results Endpoints

### Get Operation Results
**GET** `/operations/{operationId}/results?limit=50&offset=0`

Get discovered credentials from an operation.

**Query Parameters:**
- `limit` (optional): Max results (default: 50, max: 1000)
- `offset` (optional): Skip first N results (default: 0)

**Response (200):**
```json
{
  "success": true,
  "results": [
    {
      "id": "uuid",
      "operation_id": "uuid",
      "username": "admin",
      "password": "password123",
      "status": "success",
      "timestamp": "2024-09-26T10:05:30Z"
    }
  ],
  "total": 5,
  "limit": 50,
  "offset": 0
}
```

---

### Export Results
**GET** `/operations/{operationId}/results/export?format=csv`

Export results in different formats.

**Query Parameters:**
- `format`: `csv`, `json`, or `xlsx`

**Response:**
CSV, JSON, or Excel file download

---

## 📝 Logs Endpoints

### Get Operation Logs
**GET** `/operations/{operationId}/logs?page=1&pageSize=50`

Get event logs from an operation.

**Response (200):**
```json
{
  "success": true,
  "logs": [
    {
      "id": "uuid",
      "operation_id": "uuid",
      "level": "info",
      "message": "Starting dictionary attack",
      "timestamp": "2024-09-26T10:05:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "pageSize": 50,
    "total": 145
  }
}
```

---

## 🎯 Targets Endpoints

### Create Target
**POST** `/targets`

Add a new target for brute force attacks.

**Request Body:**
```json
{
  "name": "Production SSH",
  "protocol": "ssh",
  "host": "ssh.example.com",
  "port": 22,
  "description": "Main SSH server"
}
```

**Response (201):**
```json
{
  "success": true,
  "target": {
    "id": "uuid",
    "name": "Production SSH",
    "protocol": "ssh",
    "host": "ssh.example.com",
    "port": 22
  }
}
```

---

### List Targets
**GET** `/targets?page=1&pageSize=10`

Get user's saved targets.

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "name": "Production SSH",
      "protocol": "ssh",
      "host": "ssh.example.com",
      "port": 22
    }
  ],
  "pagination": {
    "page": 1,
    "pageSize": 10,
    "total": 3
  }
}
```

---

### Update Target
**PUT** `/targets/{targetId}`

Update target information.

**Response (200):**
```json
{
  "success": true,
  "target": { /* updated target */ }
}
```

---

### Delete Target
**DELETE** `/targets/{targetId}`

Remove a target.

**Response (200):**
```json
{
  "success": true,
  "message": "Target deleted"
}
```

---

## 📚 Wordlists Endpoints

### Upload Wordlist
**POST** `/wordlists/upload`

Upload a custom wordlist file.

**Request:**
- Content-Type: `multipart/form-data`
- File field: `file`
- Name field: `name`

**Response (201):**
```json
{
  "success": true,
  "wordlist": {
    "id": "uuid",
    "name": "common-passwords.txt",
    "line_count": 10000,
    "file_size": 45230,
    "created_at": "2024-09-26T10:00:00Z"
  }
}
```

---

### List Wordlists
**GET** `/wordlists?page=1&pageSize=10`

Get user's wordlists.

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "name": "common-passwords.txt",
      "line_count": 10000,
      "file_size": 45230
    }
  ],
  "pagination": {
    "page": 1,
    "pageSize": 10,
    "total": 5
  }
}
```

---

### Get Wordlist Content
**GET** `/wordlists/{wordlistId}/content?limit=1000&offset=0`

Get lines from a wordlist.

**Response (200):**
```json
{
  "success": true,
  "words": ["password123", "admin", "letmein", ...],
  "total": 10000,
  "limit": 1000,
  "offset": 0
}
```

---

### Download Wordlist
**GET** `/wordlists/{wordlistId}/download`

Download wordlist as text file.

**Response:** Text file download

---

### Delete Wordlist
**DELETE** `/wordlists/{wordlistId}`

Delete a wordlist.

**Response (200):**
```json
{
  "success": true,
  "message": "Wordlist deleted"
}
```

---

## 🔔 Notifications Endpoints

### Subscribe to Push Notifications
**POST** `/notifications/subscribe`

Register device for push notifications.

**Request Body:**
```json
{
  "fcmToken": "firebase-cloud-messaging-token"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Device subscribed to push notifications"
}
```

---

### Get Notification Preferences
**GET** `/notifications/preferences`

Get user's notification settings.

**Response (200):**
```json
{
  "success": true,
  "preferences": {
    "operationCompleted": true,
    "operationFailed": true,
    "operationStarted": false,
    "newResults": true,
    "dailySummary": false
  }
}
```

---

### Update Notification Preferences
**POST** `/notifications/preferences`

Update notification settings.

**Request Body:**
```json
{
  "operationCompleted": true,
  "operationFailed": true,
  "operationStarted": true,
  "newResults": true,
  "dailySummary": true
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Notification preferences updated"
}
```

---

## ⚙️ System Endpoints

### System Health Check
**GET** `/health`

Check API server status.

**Response (200):**
```json
{
  "status": "ok",
  "timestamp": "2024-09-26T10:00:00Z",
  "version": "1.0.0"
}
```

---

### System Status
**GET** `/system/status`

Get real-time system metrics.

**Response (200):**
```json
{
  "success": true,
  "status": {
    "cpu_usage": 45.2,
    "memory_usage": 60.5,
    "active_operations": 3,
    "total_results": 1250
  }
}
```

---

## ⚠️ Error Responses

All endpoints may return errors in this format:

**Response (4xx/5xx):**
```json
{
  "success": false,
  "error": "Error message",
  "code": "ERROR_CODE"
}
```

**Common Error Codes:**
- `UNAUTHORIZED`: Missing or invalid token
- `FORBIDDEN`: User doesn't have permission
- `NOT_FOUND`: Resource not found
- `VALIDATION_ERROR`: Invalid request data
- `INTERNAL_ERROR`: Server error

---

## 🔑 API Key Authentication (Alternative)

Instead of JWT, you can use API keys for some endpoints:

**Headers:**
```
X-API-Key: <your_api_key>
```

Get your API key from your profile settings.

---

## 📖 Rate Limiting

- **Rate Limit**: 1000 requests per hour per user
- **Response Headers**:
  - `X-RateLimit-Limit`: 1000
  - `X-RateLimit-Remaining`: 999
  - `X-RateLimit-Reset`: 1695735600

---

## 🔐 Security Notes

1. **HTTPS Required**: Use HTTPS in production
2. **Token Expiration**: Access tokens expire in 24 hours
3. **Refresh Tokens**: Refresh tokens expire in 7 days
4. **Secrets**: Change JWT_SECRET and other secrets in production
5. **CORS**: Configure CORS appropriately for your frontend

---

## 📝 Request/Response Examples

### cURL Examples

**Register:**
```bash
curl -X POST http://localhost:3000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "securePassword123"
  }'
```

**Login:**
```bash
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "securePassword123"
  }'
```

**Create Operation:**
```bash
curl -X POST http://localhost:3000/api/v1/operations \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "SSH Attack",
    "target": {
      "protocol": "ssh",
      "host": "target.com",
      "port": 22
    },
    "attack_type": "dictionary",
    "wordlist_id": "<wordlist_uuid>"
  }'
```

---

## 📞 Support

For issues or questions:
1. Check the logs: `docker-compose logs -f api`
2. Review DATABASE schema: `backend/src/config/schema.sql`
3. Check configuration: `backend/.env`
