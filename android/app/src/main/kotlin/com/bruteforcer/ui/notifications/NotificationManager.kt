package com.bruteforcer.ui.notifications

import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.PendingIntent
import android.content.Context
import android.content.Intent
import android.media.RingtoneManager
import android.os.Build
import androidx.core.app.NotificationCompat
import androidx.core.app.NotificationManagerCompat
import com.bruteforcer.MainActivity
import com.bruteforcer.R
import com.google.firebase.messaging.FirebaseMessaging
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch

class NotificationManager(private val context: Context) {
  companion object {
    const val CHANNEL_ID = "bruteforcer_operations"
    const val CHANNEL_NAME = "Operation Notifications"
  }

  init {
    createNotificationChannels()
  }

  fun createNotificationChannels() {
    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
      // Main operations channel
      val operationsChannel = NotificationChannel(
        CHANNEL_ID,
        CHANNEL_NAME,
        NotificationManager.IMPORTANCE_HIGH
      ).apply {
        description = "Notifications for brute force operations"
        enableVibration(true)
        setSound(
          RingtoneManager.getDefaultUri(RingtoneManager.TYPE_NOTIFICATION),
          android.media.AudioAttributes.Builder()
            .setUsage(android.media.AudioAttributes.USAGE_NOTIFICATION)
            .build()
        )
        lightColor = 0xFF9C27B0.toInt() // Purple
        enableLights(true)
      }

      // Sync operations channel
      val syncChannel = NotificationChannel(
        "bruteforcer_sync",
        "Sync Notifications",
        NotificationManager.IMPORTANCE_LOW
      ).apply {
        description = "Notifications for sync operations"
        enableVibration(false)
      }

      // Background jobs channel
      val backgroundChannel = NotificationChannel(
        "bruteforcer_background",
        "Background Tasks",
        NotificationManager.IMPORTANCE_LOW
      ).apply {
        description = "Notifications for background tasks"
        enableVibration(false)
      }

      val notificationManager = context.getSystemService(NotificationManager::class.java)
      notificationManager.createNotificationChannel(operationsChannel)
      notificationManager.createNotificationChannel(syncChannel)
      notificationManager.createNotificationChannel(backgroundChannel)
    }
  }

  fun showOperationNotification(
    operationId: String,
    title: String,
    message: String,
    status: String? = null,
    resultCount: Int = 0
  ) {
    val intent = Intent(context, MainActivity::class.java).apply {
      action = Intent.ACTION_VIEW
      putExtra("operationId", operationId)
      putExtra("from_notification", true)
      addFlags(Intent.FLAG_ACTIVITY_CLEAR_TOP or Intent.FLAG_ACTIVITY_NEW_TASK)
    }

    val pendingIntent = PendingIntent.getActivity(
      context, operationId.hashCode(), intent,
      PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
    )

    val notification = NotificationCompat.Builder(context, CHANNEL_ID)
      .setSmallIcon(android.R.drawable.ic_notification_clear_all)
      .setContentTitle(title)
      .setContentText(message)
      .setAutoCancel(true)
      .setContentIntent(pendingIntent)
      .setPriority(NotificationCompat.PRIORITY_HIGH)
      .setCategory(NotificationCompat.CATEGORY_STATUS)
      .setColor(getStatusColor(status))

    // Add big text for detailed message
    if (message.length > 50) {
      notification.setStyle(
        NotificationCompat.BigTextStyle()
          .bigText(message)
          .setBigContentTitle(title)
      )
    }

    // Add progress if operation is running
    if (status == "running" && resultCount > 0) {
      notification.setSubText("$resultCount results found")
    }

    NotificationManagerCompat.from(context).notify(
      operationId.hashCode(),
      notification.build()
    )
  }

  fun showSyncNotification(
    title: String,
    message: String,
    progress: Int = 0
  ) {
    val notification = NotificationCompat.Builder(context, "bruteforcer_sync")
      .setSmallIcon(android.R.drawable.ic_notification_clear_all)
      .setContentTitle(title)
      .setContentText(message)
      .setPriority(NotificationCompat.PRIORITY_LOW)
      .setOngoing(true)

    if (progress > 0) {
      notification.setProgress(100, progress, false)
    }

    NotificationManagerCompat.from(context).notify(
      "sync".hashCode(),
      notification.build()
    )
  }

  fun showBackgroundTaskNotification(
    taskId: String,
    title: String,
    message: String
  ) {
    val notification = NotificationCompat.Builder(context, "bruteforcer_background")
      .setSmallIcon(android.R.drawable.ic_notification_clear_all)
      .setContentTitle(title)
      .setContentText(message)
      .setPriority(NotificationCompat.PRIORITY_LOW)
      .setOngoing(true)

    NotificationManagerCompat.from(context).notify(
      taskId.hashCode(),
      notification.build()
    )
  }

  fun cancelNotification(operationId: String) {
    NotificationManagerCompat.from(context).cancel(operationId.hashCode())
  }

  fun cancelSyncNotification() {
    NotificationManagerCompat.from(context).cancel("sync".hashCode())
  }

  fun cancelBackgroundNotification(taskId: String) {
    NotificationManagerCompat.from(context).cancel(taskId.hashCode())
  }

  fun requestNotificationPermission(callback: (Boolean) -> Unit) {
    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
      // Android 13+ requires runtime permission
      // This should be called from MainActivity
      callback(true) // Assume granted; actual permission handling in Activity
    } else {
      callback(true) // Pre-Android 13 doesn't require permission
    }
  }

  fun getFCMToken(callback: (String?) -> Unit) {
    try {
      FirebaseMessaging.getInstance().token.addOnCompleteListener { task ->
        if (task.isSuccessful) {
          callback(task.result)
        } else {
          callback(null)
        }
      }
    } catch (e: Exception) {
      callback(null)
    }
  }

  fun subscribeTopic(topic: String) {
    FirebaseMessaging.getInstance().subscribeToTopic(topic)
      .addOnCompleteListener { task ->
        if (task.isSuccessful) {
          // Successfully subscribed to topic
        }
      }
  }

  fun unsubscribeTopic(topic: String) {
    FirebaseMessaging.getInstance().unsubscribeFromTopic(topic)
      .addOnCompleteListener { task ->
        if (task.isSuccessful) {
          // Successfully unsubscribed from topic
        }
      }
  }

  private fun getStatusColor(status: String?): Int {
    return when (status) {
      "completed" -> 0xFF4CAF50.toInt()  // Green
      "running" -> 0xFF2196F3.toInt()    // Blue
      "paused" -> 0xFFFFC107.toInt()     // Amber
      "failed" -> 0xFFF44336.toInt()     // Red
      else -> 0xFF9C27B0.toInt()         // Purple
    }
  }
}
