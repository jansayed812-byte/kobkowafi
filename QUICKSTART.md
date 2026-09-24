# Brute Forcer Pro - Quick Start Guide

## System Overview

Brute Forcer Pro is a comprehensive penetration testing platform with:
- **Backend**: Node.js/Express API with PostgreSQL
- **Frontend**: Web UI (HTML/CSS/JS)
- **Mobile**: Native Android app (Kotlin)

## Prerequisites

### System Requirements
- Node.js 18+ (for backend)
- Docker & Docker Compose (for database)
- Android Studio 2023.1+ (for Android development)
- Git

### Accounts & Credentials
- GitHub account (for code repository)
- Email account (for testing login)

---

## 1️⃣ Backend Setup

### 1.1 Navigate to Backend Directory
```bash
cd kobkowafi/backend
```

### 1.2 Install Dependencies
```bash
npm install
```

### 1.3 Configure Environment
```bash
cp .env.example .env
```

Edit `.env` with your configuration:
```env
NODE_ENV=development
PORT=3000

DATABASE_URL=postgresql://bruteforcer:password@localhost:5432/bruteforcer
REDIS_URL=redis://localhost:6379

JWT_SECRET=your_jwt_secret_here
JWT_REFRESH_SECRET=your_refresh_secret_here

CORS_ORIGIN=http://localhost:3000,http://localhost:8080

RATE_LIMIT_WINDOW=15
RATE_LIMIT_MAX_REQUESTS=100
```

### 1.4 Start Database Services
```bash
docker-compose up -d postgres redis
```

Verify:
```bash
docker-compose ps
```

### 1.5 Initialize Database
```bash
npm run db:init
```

### 1.6 Start Backend Server
```bash
npm run dev
```

Expected output:
```
✅ Server running on port 3000
✅ Database connected
✅ Redis connected
```

### 1.7 Test Backend
```bash
curl http://localhost:3000/system/health
# Should return: { "success": true, "message": "System healthy" }
```

---

## 2️⃣ Frontend Setup

### 2.1 Navigate to Frontend Directory
```bash
cd ../frontend
```

### 2.2 Configure API Endpoint
Edit `js/api-client.js`:
```javascript
const API_BASE_URL = 'http://localhost:3000/api/v1';
```

### 2.3 Start Local Server (Optional)
```bash
# Using Python 3
python -m http.server 8000

# Using Node.js
npx http-server
```

### 2.4 Open in Browser
```
http://localhost:8000  (or http://localhost:3000)
```

### 2.5 Test Frontend
1. Click "حساب ندارید؟ ثبت نام کنید" (Don't have account? Sign up)
2. Register with test credentials:
   - Email: test@example.com
   - Password: TestPassword123!
3. You should be redirected to dashboard

---

## 3️⃣ Android App Setup

### 3.1 Open Android Project
```bash
cd ../android
```

Or open Android Studio:
- File → Open → Select `android` folder

### 3.2 Configure API Endpoint
Edit `app/src/main/kotlin/com/bruteforcer/data/api/ApiClient.kt`:
```kotlin
private const val BASE_URL = "http://10.0.2.2:3000/api/v1"  // For emulator
// private const val BASE_URL = "http://192.168.x.x:3000/api/v1"  // For device
```

### 3.3 Build Application
```bash
./gradlew build
```

### 3.4 Run on Emulator
```bash
# Create emulator (if needed)
emulator -avd Pixel_5 -netdelay none -netspeed full

# Install and run
./gradlew installDebug
adb shell am start -n com.bruteforcer/.MainActivity
```

### 3.5 Or Run on Device
1. Connect Android device via USB
2. Enable USB debugging
3. Run: `./gradlew installDebug`

---

## 4️⃣ Testing the Full System

### 4.1 Create User Account
Using web frontend or Android app:
```
Email: test@example.com
Password: SecurePassword123!
```

### 4.2 Create Target
1. Go to "Targets" tab
2. Click "Add Target"
3. Fill in:
   - Name: Example Target
   - Protocol: HTTP
   - Host: example.com
   - Port: 80

### 4.3 Create Operation
1. Go to "Operations" tab
2. Click "Create Operation"
3. Fill in:
   - Name: Test Operation
   - Target: Select from dropdown
   - Attack Type: Dictionary

### 4.4 Start Operation
1. Click "Start" on operation
2. Monitor progress
3. View results as they come in

---

## 5️⃣ Deployment

### Docker Deployment
```bash
docker-compose up -d
```

### Cloud Deployment
See `backend/SETUP.md` for detailed cloud deployment instructions.

---

## Support & Help

### Documentation
- Backend: `backend/README.md` and `backend/SETUP.md`
- Android: `android/README.md`
- Full Implementation: `IMPLEMENTATION_SUMMARY.md`

### Getting Help
- GitHub Issues: Report bugs
- Email: jansayed812@gmail.com
- Check logs: `docker-compose logs -f`

---

**Happy Penetration Testing!** 🚀

Remember: Only perform authorized security testing on systems you own or have explicit permission to test.
