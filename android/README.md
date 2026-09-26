# Brute Forcer Pro - Android App

Native Android application for penetration testing and brute force operations.

## Features

- ✅ User authentication (login/register)
- ✅ Real-time operation management
- ✅ Brute force operation monitoring
- ✅ Target management
- ✅ Settings synchronization
- ✅ Material Design 3 UI
- ✅ Offline support with local database

## Technology Stack

- **Language**: Kotlin
- **UI Framework**: Jetpack Compose
- **Architecture**: MVVM + Clean Architecture
- **Database**: Room
- **Networking**: Ktor Client
- **Serialization**: Kotlinx Serialization
- **Dependency Injection**: Hilt

## Requirements

- Android 8.0+ (API 26)
- Android Studio 2023.1+
- Gradle 8.1+
- Kotlin 1.9+

## Project Structure

```
app/
├── src/
│   ├── main/
│   │   ├── kotlin/com/bruteforcer/
│   │   │   ├── MainActivity.kt
│   │   │   ├── data/
│   │   │   │   └── api/
│   │   │   │       ├── ApiClient.kt
│   │   │   │       ├── ApiModels.kt
│   │   │   │       └── ApiService.kt
│   │   │   └── ui/
│   │   │       ├── theme/
│   │   │       │   ├── Theme.kt
│   │   │       │   └── Type.kt
│   │   │       └── screens/
│   │   │           ├── auth/
│   │   │           │   ├── LoginScreen.kt
│   │   │           │   └── RegisterScreen.kt
│   │   │           └── dashboard/
│   │   │               └── DashboardScreen.kt
│   │   ├── AndroidManifest.xml
│   │   └── res/
│   │       └── values/
│   │           ├── strings.xml
│   │           ├── colors.xml
│   │           └── styles.xml
│   └── test/
```

## Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/jansayed812-byte/kobkowafi.git
cd kobkowafi/android
```

### 2. Configure API Endpoint

Edit `app/src/main/kotlin/com/bruteforcer/data/api/ApiClient.kt`:

```kotlin
private const val BASE_URL = "http://YOUR_BACKEND_URL/api/v1"
```

### 3. Build the Application

```bash
./gradlew build
```

### 4. Run on Emulator/Device

```bash
./gradlew installDebug
adb shell am start -n com.bruteforcer/.MainActivity
```

## Architecture Overview

### MVVM Pattern

- **Model**: Data classes and repository layer
- **ViewModel**: Manages UI state and business logic
- **View**: Jetpack Compose UI components

### Clean Architecture Layers

1. **Data Layer**: API client, local database, repositories
2. **Domain Layer**: Entities, use cases, business rules
3. **Presentation Layer**: ViewModels, UI screens, navigation

## API Integration

The app connects to the backend API for:

- User authentication
- Operation management (CRUD)
- Target management
- Settings synchronization
- Real-time progress updates

## Database Schema

Local Room database for offline support:

- Operations (cached)
- Results (cached)
- Settings (user preferences)

## Security Features

- ✅ HTTPS enforcement
- ✅ Token-based authentication
- ✅ Secure storage of credentials
- ✅ Input validation
- ✅ Error handling

## Testing

### Unit Tests

```bash
./gradlew test
```

### Instrumented Tests

```bash
./gradlew connectedAndroidTest
```

## Troubleshooting

### API Connection Issues

1. Verify backend is running on configured URL
2. Check network permissions in AndroidManifest.xml
3. For local development, ensure device can reach host machine

### Build Errors

1. Clear Gradle cache: `./gradlew clean`
2. Invalidate IDE cache: File → Invalidate Caches
3. Update dependencies: `./gradlew dependencyUpdates`

### Runtime Issues

1. Check logcat for detailed error messages
2. Ensure all required permissions are granted
3. Verify API responses match expected format

## Contributing

1. Create feature branch: `git checkout -b feature/your-feature`
2. Commit changes: `git commit -m 'Add your feature'`
3. Push to branch: `git push origin feature/your-feature`
4. Create Pull Request

## License

Proprietary - All rights reserved

## Support

For issues and questions, contact: jansayed812@gmail.com

---

**Version**: 1.0.0  
**Last Updated**: 2026-09-25
