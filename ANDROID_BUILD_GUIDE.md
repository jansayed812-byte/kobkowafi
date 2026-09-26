# Android App Build Guide - Brute Forcer Pro

This guide will help you build and install the Android app on your device. Since Android development requires specific SDK tools and network access, these steps should be performed on your **Windows machine** where you have your Android SDK installed.

## Prerequisites

### Required Software
- ✅ **Android SDK** - Located at: `C:\Users\<username>\AppData\Local\Android\sdk`
- ✅ **Java/JDK 8+** - For Kotlin 1.9 compatibility
- ✅ **ADB (Android Debug Bridge)** - Included with Android SDK
- ✅ **Physical Android Device or Emulator** - API 26+ (Android 8.0+)

### Verify Prerequisites

```cmd
# Check Java version
java -version

# Check ADB
adb devices

# Check Android SDK
echo %ANDROID_HOME%
```

---

## Step-by-Step Build Instructions

### Step 1: Configure Local Environment

1. **Set Android SDK Path** (if not already set):
   ```cmd
   # Windows Command Prompt
   setx ANDROID_HOME "C:\Users\%username%\AppData\Local\Android\sdk"
   # Close and reopen Command Prompt for changes to take effect
   ```

2. **Verify SDK Path**:
   ```cmd
   echo %ANDROID_HOME%
   # Should output your SDK path
   ```

### Step 2: Clone/Update Repository

If you haven't already cloned the repository:

```cmd
git clone https://github.com/jansayed812-byte/kobkowafi.git
cd kobkowafi
git checkout claude/awesome-feynman-vz8d0w
```

Or if you already have it:

```cmd
cd path\to\kobkowafi
git pull origin claude/awesome-feynman-vz8d0w
```

### Step 3: Create local.properties

1. Navigate to the android directory:
   ```cmd
   cd android
   ```

2. Create `local.properties` file with your SDK path:
   ```properties
   sdk.dir=C:\Users\<your_username>\AppData\Local\Android\sdk
   ```

   Or use PowerShell:
   ```powershell
   "sdk.dir=$env:ANDROID_HOME" | Out-File -Encoding UTF8 local.properties
   ```

### Step 4: Update API Configuration (Optional)

Edit `android/app/src/main/kotlin/com/bruteforcer/data/api/ApiClient.kt`:

Change the API endpoint from localhost to your backend server:

```kotlin
// OLD:
private const val BASE_URL = "http://localhost:3000/api/v1"

// NEW (for your backend):
private const val BASE_URL = "http://YOUR_BACKEND_IP:3000/api/v1"
```

### Step 5: Build Debug APK

```cmd
cd android

# Build debug APK
./gradlew assembleDebug

# Or with more verbose output if there are issues:
./gradlew assembleDebug --info
```

**Expected Output:**
```
BUILD SUCCESSFUL in XXs
```

**APK Location:**
```
app\build\outputs\apk\debug\app-debug.apk
```

### Step 6: Install on Device or Emulator

#### Option A: Physical Device

1. **Enable Developer Mode:**
   - Open Settings → About Phone
   - Tap "Build Number" 7 times
   - Return to Settings → Developer Options
   - Enable "USB Debugging"

2. **Connect Device:**
   ```cmd
   # Verify device is connected
   adb devices
   # You should see: "emulator-5554" or device serial number
   ```

3. **Install APK:**
   ```cmd
   adb install app\build\outputs\apk\debug\app-debug.apk
   ```

4. **Launch App:**
   ```cmd
   adb shell am start -n com.bruteforcer/.MainActivity
   ```

#### Option B: Android Emulator

1. **Create/Start Emulator:**
   ```cmd
   # List available AVDs
   emulator -list-avds

   # Start emulator (replace with your AVD name)
   emulator -avd Pixel_4_API_30
   ```

2. **Wait for Emulator to Boot:**
   - Wait until you see the Android home screen
   - Can take 1-2 minutes on first launch

3. **Install APK:**
   ```cmd
   adb install app\build\outputs\apk\debug\app-debug.apk
   ```

4. **Launch App:**
   - Look for "BruteForcer" app icon on home screen
   - Or use: `adb shell am start -n com.bruteforcer/.MainActivity`

---

## Building Release APK (Optional)

For Google Play Store submission or wider distribution:

### Generate Signing Key

```cmd
# Create keystore (one-time only)
keytool -genkey -v -keystore bruteforcer.jks ^
  -keyalg RSA -keysize 2048 ^
  -validity 10000 -alias bruteforcer

# This will prompt you for:
# - Keystore password
# - Key password  
# - Alias credentials (name, organization, etc.)
```

### Update Build Configuration

Edit `android/app/build.gradle.kts` and add signing config:

```kotlin
signingConfigs {
    create("release") {
        keyAlias = "bruteforcer"
        keyPassword = "YOUR_KEY_PASSWORD"
        storeFile = file("../bruteforcer.jks")
        storePassword = "YOUR_KEYSTORE_PASSWORD"
    }
}

buildTypes {
    release {
        signingConfig = signingConfigs.getByName("release")
        isMinifyEnabled = true
        proguardFiles(
            getDefaultProguardFile("proguard-android-optimize.txt"),
            "proguard-rules.pro"
        )
    }
}
```

### Build Release APK

```cmd
./gradlew assembleRelease
```

**APK Location:**
```
app\build\outputs\apk\release\app-release.apk
```

---

## Troubleshooting

### Issue: "SDK location not found"
**Solution:** Ensure `local.properties` exists with correct path
```cmd
dir local.properties
```

### Issue: "Gradle sync failed"
**Solution:** Clear gradle cache and retry
```cmd
./gradlew clean
./gradlew assembleDebug
```

### Issue: "No devices found"
**Solution:** 
- Check device is properly connected: `adb devices`
- Enable USB Debugging on device
- Install correct USB drivers (for Windows)
- Restart adb: `adb kill-server && adb start-server`

### Issue: "Timeout downloading dependencies"
**Solution:**
- Check internet connection
- Increase timeout: Add to `gradle.properties`:
  ```properties
  org.gradle.daemon.idletimeout=60000
  org.gradle.jvmargs=-Xmx2048m
  ```
- Try building again: Dependencies are cached after first download

### Issue: "Plugin version mismatch"
**Solution:** Ensure Android SDK has required build tools (API 34)
```cmd
# List installed build tools
%ANDROID_HOME%\tools\bin\sdkmanager --list

# Install specific version if needed
%ANDROID_HOME%\tools\bin\sdkmanager "build-tools;34.0.0"
```

---

## Features & UI Overview

After successful installation, the app provides:

### Screens
1. **Login/Register** - Authentication with backend
2. **Dashboard** - View running operations and statistics
3. **Operations** - Create and manage brute force operations
4. **Results** - View discovered credentials and export results
5. **Settings** - Configure API endpoint and notification preferences

### Key Features
- ✅ Real-time operation progress tracking
- ✅ Multiple attack strategies (Dictionary, Brute Force, Hybrid)
- ✅ Push notifications for operation status
- ✅ Target management (add/remove targets)
- ✅ Results export and analysis
- ✅ Persian (Farsi) language support
- ✅ Material Design 3 UI with dark mode

---

## Testing the App

### Test Login
1. First, ensure your backend server is running
2. Use the API endpoint configured in ApiClient.kt
3. Register a new account or use existing credentials

### Test Operations
1. Add a target (SSH, HTTP, FTP, etc.)
2. Create an operation with dictionary or brute force mode
3. Monitor progress on dashboard
4. View results once operation completes

### Test Notifications
1. Enable notifications in Settings
2. Trigger an operation
3. Notification will appear when operation completes (requires Firebase)

---

## Gradle Wrapper Auto-Download

If you encounter gradle wrapper issues, the wrapper will automatically download on first build:

```cmd
./gradlew --version
# Gradle 8.4 will download (~200MB)
```

If manual download is needed:
1. The wrapper downloads to: `C:\Users\<username>\.gradle\wrapper\dists`
2. Cached for future builds
3. Can be cleared with: `gradlew --stop`

---

## Project Structure

```
android/
├── app/                              # Main app module
│   ├── build.gradle.kts             # App-level dependencies
│   └── src/main/
│       ├── kotlin/com/bruteforcer/  # Kotlin source code
│       │   ├── ui/screens/          # UI screens (Compose)
│       │   ├── data/api/            # API client (Ktor)
│       │   └── MainActivity.kt      # Entry point
│       └── res/                     # Resources (strings, colors, etc.)
├── build.gradle.kts                 # Project-level gradle config
├── settings.gradle.kts              # Project settings & repositories
├── gradle.properties                # Gradle build properties
├── local.properties                 # Local SDK path (create this)
└── gradlew                          # Gradle wrapper script
```

---

## Development Hints

### Rebuild After Code Changes
```cmd
# Clean build
./gradlew clean assembleDebug

# Fast rebuild (use cached dependencies)
./gradlew assembleDebug

# Reinstall on device
adb install -r app\build\outputs\apk\debug\app-debug.apk
```

### View Logs
```cmd
# Real-time logcat
adb logcat -s BruteForcer

# Clear and capture new logs only
adb logcat -c
adb logcat -s BruteForcer *:E
```

### Hot Reload (if using Compose)
- Restart app: `adb shell am force-stop com.bruteforcer`
- Reinstall: `adb install -r app\build\outputs\apk\debug\app-debug.apk`

---

## Next Steps

1. ✅ Build debug APK (this guide)
2. ✅ Install on device/emulator
3. ✅ Test basic functionality
4. 🔄 Run backend server (`npm start` in backend folder)
5. 🔄 Configure API endpoint in app
6. 🔄 Test authentication and operations
7. 📦 Build release APK when ready

---

## Support & Documentation

- **Gradle Docs**: https://docs.gradle.org/8.4/
- **Android Docs**: https://developer.android.com/
- **Kotlin Docs**: https://kotlinlang.org/docs/
- **Jetpack Compose**: https://developer.android.com/jetpack/compose
- **Ktor Client**: https://ktor.io/docs/client.html

---

## Command Reference

| Command | Purpose |
|---------|---------|
| `./gradlew assembleDebug` | Build debug APK |
| `./gradlew assembleRelease` | Build release APK |
| `./gradlew clean` | Clean build artifacts |
| `./gradlew --version` | Show gradle version |
| `adb devices` | List connected devices |
| `adb install <apk>` | Install APK on device |
| `adb uninstall com.bruteforcer` | Uninstall app |
| `adb shell am start -n com.bruteforcer/.MainActivity` | Launch app |
| `adb logcat` | View device logs |
| `adb shell screencap /sdcard/screen.png` | Capture screenshot |

---

## Build Specifications

- **API Level**: Min 26 (Android 8.0), Target/Compile 34 (Android 14)
- **Gradle**: 8.4
- **Kotlin**: 1.9.0
- **Java**: 8+ (target JVM 1.8)
- **Build System**: Gradle with Kotlin DSL
- **UI Framework**: Jetpack Compose
- **Networking**: Ktor Client
- **Database**: Room + DataStore
- **Dependency Injection**: Hilt
- **Push Notifications**: Firebase Cloud Messaging

---

**Happy building! 🚀**

Created: 2024-09-26
Updated: 2024-09-26
