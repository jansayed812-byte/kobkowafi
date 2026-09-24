# Phase 8 Setup Guide - Mobile Enhancement Features

## Overview

This guide covers the setup and implementation of Phase 8 features:
- Push Notifications (Firebase Cloud Messaging)
- Offline Operation Queuing
- Background Job Processing (WorkManager)
- Deep Linking
- App Shortcuts
- Home Screen Widget

---

## Phase 8a: Push Notifications Setup

### Backend Configuration

**1. Firebase Project Setup**

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create or select your project
3. Enable Cloud Messaging service
4. Download service account key (JSON file)
5. Set environment variable:

```bash
export FIREBASE_SERVICE_ACCOUNT_PATH=/path/to/firebase-service-account.json
```

**2. Update User Model**

The `User` model needs FCM token storage. Add to User model:

```typescript
@Column
fcmToken: string | null;

@Column
notifyOnCompletion: boolean = true;

@Column
notifyOnFailure: boolean = true;

@Column
notifyOnStart: boolean = false;

@Column
notifyOnNewResults: boolean = true;

@Column
notifyDailySummary: boolean = false;

@Column
lastNotificationTime: Date | null;
```

**3. Register Notification Routes**

In `backend/src/app.ts`:

```typescript
import notificationRoutes from './routes/notifications';

app.use('/api/v1/notifications', notificationRoutes);
```

**4. Install Firebase Admin SDK**

```bash
cd backend
npm install firebase-admin
```

### Android Configuration

**1. Create Google Services JSON**

1. Download `google-services.json` from Firebase Console
2. Place it in `android/app/` directory

**2. Build Configuration**

Already added to `android/app/build.gradle.kts`:
- `com.google.gms.google-services` plugin
- Firebase BOM 32.7.0
- Firebase Cloud Messaging library

**3. Request Notification Permission (Android 13+)**

In `MainActivity.kt`:

```kotlin
override fun onCreate(savedInstanceState: Bundle?) {
    super.onCreate(savedInstanceState)
    
    // Request notification permission for Android 13+
    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
        requestPermissions(
            arrayOf(Manifest.permission.POST_NOTIFICATIONS),
            NOTIFICATION_PERMISSION_REQUEST_CODE
        )
    }
    
    // Initialize notification manager
    val notificationManager = NotificationManager(this)
    
    // Request FCM token and send to backend
    FirebaseMessaging.getInstance().token.addOnCompleteListener { task ->
        if (task.isSuccessful) {
            val token = task.result
            sendTokenToBackend(token)
        }
    }
}
```

**4. Initialize in Compose**

```kotlin
setContent {
    val notificationManager = remember { NotificationManager(this@MainActivity) }
    
    LaunchedEffect(Unit) {
        notificationManager.enableFCMTokenTracking()
    }
    
    BruteForceApp()
}
```

### Testing Push Notifications

**Backend Test**:

```bash
curl -X POST http://localhost:3000/api/v1/notifications/subscribe \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"fcmToken": "test_token_123"}'
```

**Firebase Console Test**:

1. Go to Cloud Messaging section
2. Create test message
3. Select your app and FCM token
4. Send test notification

---

## Phase 8b: Offline Operation Queuing

### Room Database Expansion

**1. Create Database Entities**

Already implemented in files:
- `android/app/src/main/kotlin/com/bruteforcer/data/database/OfflineOperation.kt`
- `android/app/src/main/kotlin/com/bruteforcer/data/database/SyncQueueItem.kt`

**2. Add to AppDatabase**

```kotlin
@Database(
  entities = [
    OperationEntity::class,
    ResultEntity::class,
    OfflineOperation::class,
    SyncQueueItem::class
  ],
  version = 2,
  exportSchema = true
)
abstract class BruteForceDatabase : RoomDatabase() {
  abstract fun operationDao(): OperationDao
  abstract fun resultDao(): ResultDao
  abstract fun offlineOperationDao(): OfflineOperationDao
  abstract fun syncQueueDao(): SyncQueueDao
}
```

**3. Database Migration (if upgrading from v1)**

```kotlin
val MIGRATION_1_2 = object : Migration(1, 2) {
  override fun migrate(database: SupportSQLiteDatabase) {
    database.execSQL("""
      CREATE TABLE IF NOT EXISTS offline_operations (
        id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
        operationName TEXT NOT NULL,
        targetId TEXT NOT NULL,
        attackType TEXT NOT NULL,
        wordlistId TEXT,
        threadCount INTEGER NOT NULL DEFAULT 4,
        created_at INTEGER NOT NULL,
        synced INTEGER NOT NULL DEFAULT 0,
        syncedOperationId TEXT,
        error TEXT
      )
    """)
    
    database.execSQL("""
      CREATE TABLE IF NOT EXISTS sync_queue (
        id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
        operationId TEXT NOT NULL,
        action TEXT NOT NULL,
        payload TEXT NOT NULL,
        timestamp INTEGER NOT NULL,
        retryCount INTEGER NOT NULL DEFAULT 0,
        maxRetries INTEGER NOT NULL DEFAULT 3
      )
    """)
  }
}

// Add to Room.databaseBuilder
.addMigrations(MIGRATION_1_2)
```

### Network State Monitoring

Create `utils/NetworkManager.kt`:

```kotlin
class NetworkManager(context: Context) {
  private val connectivityManager = context.getSystemService(Context.CONNECTIVITY_SERVICE) as ConnectivityManager
  private val _networkState = MutableStateFlow(isConnected())
  val networkState = _networkState.asStateFlow()
  
  init {
    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.N) {
      connectivityManager.registerDefaultNetworkCallback(
        object : ConnectivityManager.NetworkCallback() {
          override fun onAvailable(network: Network) {
            _networkState.value = true
          }
          
          override fun onLost(network: Network) {
            _networkState.value = false
          }
        }
      )
    }
  }
  
  fun isConnected(): Boolean = connectivityManager.activeNetwork != null
}
```

### UI Integration

```kotlin
@Composable
fun OfflineQueueStatus(
  pendingCount: Int,
  networkState: Boolean
) {
  if (pendingCount > 0) {
    Surface(
      modifier = Modifier
        .fillMaxWidth()
        .background(MaterialTheme.colorScheme.warningContainer),
      color = MaterialTheme.colorScheme.warningContainer
    ) {
      Row(
        modifier = Modifier.padding(16.dp),
        verticalAlignment = Alignment.CenterVertically
      ) {
        Icon(Icons.Default.Sync, contentDescription = null)
        Spacer(modifier = Modifier.width(8.dp))
        Text(
          if (networkState)
            "$pendingCount pending (syncing...)"
          else
            "$pendingCount pending (offline)"
        )
      }
    }
  }
}
```

---

## Phase 8c: Background Job Processing (WorkManager)

### Add WorkManager Dependency

Already added to `build.gradle.kts`

### Create Worker Classes

**1. Operation Sync Worker** (`work/OperationSyncWorker.kt`):

```kotlin
class OperationSyncWorker(
  context: Context,
  params: WorkerParameters,
  private val apiService: ApiService,
  private val database: BruteForceDatabase
) : CoroutineWorker(context, params) {
  
  override suspend fun doWork(): Result {
    return try {
      val operations = apiService.listOperations()
      // Update database with latest operations
      Result.success()
    } catch (e: Exception) {
      if (runAttemptCount < 5) Result.retry() else Result.failure()
    }
  }
}
```

**2. Notification Worker** (`work/NotificationWorker.kt`):

Polls for operation completion and shows notification

### Schedule Workers

In `MainActivity`:

```kotlin
val scheduler = BackgroundJobScheduler(WorkManager.getInstance(this), this)
scheduler.scheduleOperationSync()
scheduler.scheduleOperationNotification(operationId)
```

### Constraints for Workers

```kotlin
val constraints = Constraints.Builder()
  .setRequiredNetworkType(NetworkType.CONNECTED)
  .setRequiresBatteryNotLow(true)
  .build()

val workRequest = PeriodicWorkRequestBuilder<OperationSyncWorker>(
  15, TimeUnit.MINUTES
)
  .setConstraints(constraints)
  .build()

WorkManager.getInstance(context).enqueueUniquePeriodicWork(
  "operation_sync",
  ExistingPeriodicWorkPolicy.KEEP,
  workRequest
)
```

---

## Phase 8d: Deep Linking

### Configure Intent Filters

Already added to `AndroidManifest.xml`:

```xml
<intent-filter android:autoVerify="true">
  <action android:name="android.intent.action.VIEW" />
  <category android:name="android.intent.category.DEFAULT" />
  <category android:name="android.intent.category.BROWSABLE" />
  
  <data
    android:scheme="bruteforcer"
    android:host="operation"
    android:pathPattern="/.*" />
</intent-filter>

<intent-filter android:autoVerify="true">
  <action android:name="android.intent.action.VIEW" />
  <category android:name="android.intent.category.DEFAULT" />
  <category android:name="android.intent.category.BROWSABLE" />
  
  <data
    android:scheme="https"
    android:host="bruteforcer.com"
    android:pathPattern="/op/.*" />
</intent-filter>
```

### Handle Deep Links in MainActivity

```kotlin
override fun onCreate(savedInstanceState: Bundle?) {
  super.onCreate(savedInstanceState)
  
  setContent {
    val navController = rememberNavController()
    
    LaunchedEffect(intent) {
      handleDeepLink(intent, navController)
    }
    
    BruteForceApp(navController)
  }
}

private fun handleDeepLink(intent: Intent, navController: NavController) {
  intent.data?.let { data ->
    when {
      data.scheme == "bruteforcer" && data.host == "operation" -> {
        val operationId = data.lastPathSegment
        navController.navigate("operation_detail/$operationId")
      }
      data.scheme == "https" && data.host == "bruteforcer.com" -> {
        val operationId = data.pathSegments.getOrNull(1)
        navController.navigate("operation_detail/$operationId")
      }
    }
  }
}
```

### Testing Deep Links

```bash
# Test app scheme
adb shell am start -a android.intent.action.VIEW -d "bruteforcer://operation/123"

# Test web URL
adb shell am start -a android.intent.action.VIEW -d "https://bruteforcer.com/op/123"
```

---

## Phase 8e: App Shortcuts & Widget

### Static Shortcuts

Create `res/xml/shortcuts.xml`:

```xml
<?xml version="1.0" encoding="utf-8"?>
<shortcuts xmlns:android="http://schemas.android.com/apk/res/android">
  <shortcut
    android:shortcutId="create_operation"
    android:icon="@drawable/ic_shortcut_create"
    android:shortcutShortLabel="@string/new_operation">
    <intent android:action="android.intent.action.VIEW"
      android:data="bruteforcer://create_operation" />
  </shortcut>
</shortcuts>
```

Add to manifest:

```xml
<meta-data
  android:name="android.app.shortcuts"
  android:resource="@xml/shortcuts" />
```

### Dynamic Shortcuts

```kotlin
class DynamicShortcutManager(private val context: Context) {
  fun updateRecentOperationShortcuts(operations: List<OperationData>) {
    val shortcutManager = context.getSystemService(android.content.pm.ShortcutManager::class.java)
    
    val shortcuts = operations.take(3).mapIndexed { index, op ->
      ShortcutInfo.Builder(context, "recent_op_${index}")
        .setShortLabel(op.name)
        .setIntent(Intent(Intent.ACTION_VIEW).apply {
          data = Uri.parse("bruteforcer://operation/${op.id}")
        })
        .build()
    }
    
    shortcutManager?.dynamicShortcuts = shortcuts
  }
}
```

### Widget Setup

Create widget layouts in `res/layout/`:
- `widget_operations.xml` - Main widget layout
- `widget_operation_item.xml` - Individual operation item

Create widget metadata `res/xml/operation_widget_info.xml`

---

## Testing Checklist

- [ ] Firebase project created and configured
- [ ] Push notifications sent and received
- [ ] Offline queue creates and stores operations
- [ ] Sync triggers when network returns
- [ ] Background tasks run on schedule
- [ ] WorkManager constraints respected
- [ ] Deep links resolve correctly
- [ ] App shortcuts appear on launcher
- [ ] Widget displays and updates
- [ ] Notification permissions requested

---

## Troubleshooting

### Firebase Initialization Issues

```bash
# Check if google-services.json is in correct location
ls -la android/app/google-services.json

# Check Firebase plugin version
grep "google-services" android/app/build.gradle.kts
```

### Notifications Not Received

1. Verify FCM token is sent to backend
2. Check Firebase Cloud Messaging is enabled
3. Ensure notification channel is created
4. Check notification permissions granted

### WorkManager Not Executing

1. Verify constraints are met (network, battery)
2. Check logcat for WorkManager logs
3. Ensure battery optimization is disabled for app
4. Test with `adb shell dumpsys jobscheduler`

### Deep Links Not Working

```bash
# Verify intent filters
adb shell cmd package resolve-activity -a android.intent.action.VIEW \
  -d "bruteforcer://operation/123"

# Check app links
adb shell pm get-app-links com.bruteforcer
```

---

## Performance Considerations

1. **Notification Throttling**: Limit to 1 per minute per operation
2. **Database Cleanup**: Archive old offline operations weekly
3. **WorkManager Batching**: Combine multiple syncs into single job
4. **Widget Updates**: Limit to 30-minute intervals
5. **Memory**: Monitor database size, clean old sync queue entries

---

## Security Considerations

1. FCM tokens are sensitive - never log or expose
2. Encrypt offline operation data at rest
3. Validate deep link parameters
4. Restrict widget data to non-sensitive fields
5. Sign APK before production distribution

---

## Version & Status

**Phase**: 8 (Mobile Enhancement)  
**Section**: 8a-8e Setup Guide  
**Version**: 1.0.0  
**Last Updated**: 2026-09-24

Next: Implement Phase 8a (Push Notifications) in 2 weeks
