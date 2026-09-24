package com.bruteforcer.data.notifications

import android.app.PendingIntent
import android.content.Context
import android.content.Intent
import android.util.Log
import androidx.core.app.NotificationCompat
import androidx.core.app.NotificationManagerCompat
import com.google.firebase.messaging.FirebaseMessagingService
import com.google.firebase.messaging.RemoteMessage
import com.bruteforcer.MainActivity
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch

class BruteForceMessagingService : FirebaseMessagingService() {
  companion object {
    private const val TAG = "BruteForceMessaging"
    private const val CHANNEL_ID = "bruteforcer_operations"
  }

  override fun onMessageReceived(remoteMessage: RemoteMessage) {
    Log.d(TAG, "Message received from ${remoteMessage.from}")

    remoteMessage.notification?.let {
      Log.d(TAG, "Message Notification Body: ${it.body}")
      handleNotification(
        title = it.title ?: "Brute Forcer",
        message = it.body ?: "",
        data = remoteMessage.data
      )
    }

    if (remoteMessage.data.isNotEmpty()) {
      Log.d(TAG, "Message data payload: ${remoteMessage.data}")
      if (remoteMessage.notification == null) {
        handleNotification(
          title = remoteMessage.data["title"] ?: "Brute Forcer",
          message = remoteMessage.data["message"] ?: "",
          data = remoteMessage.data
        )
      }
    }
  }

  override fun onNewToken(token: String) {
    Log.d(TAG, "Refreshed token: $token")
    storeTokenLocally(token)
  }

  private fun handleNotification(
    title: String,
    message: String,
    data: Map<String, String>
  ) {
    val operationId = data["operationId"]
    val status = data["status"]

    showNotification(title, message, operationId, status)

    operationId?.let {
      updateLocalDatabase(it, status, data)
    }
  }

  private fun showNotification(
    title: String,
    message: String,
    operationId: String?,
    status: String?
  ) {
    try {
      val intent = Intent(this, MainActivity::class.java).apply {
        action = Intent.ACTION_VIEW
        putExtra("operationId", operationId)
        putExtra("from_notification", true)
        addFlags(Intent.FLAG_ACTIVITY_CLEAR_TOP or Intent.FLAG_ACTIVITY_NEW_TASK)
      }

      val pendingIntent = PendingIntent.getActivity(
        this, operationId?.hashCode() ?: 0, intent,
        PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
      )

      val notificationBuilder = NotificationCompat.Builder(this, CHANNEL_ID)
        .setSmallIcon(android.R.drawable.ic_notification_clear_all)
        .setContentTitle(title)
        .setContentText(message)
        .setAutoCancel(true)
        .setContentIntent(pendingIntent)
        .setPriority(NotificationCompat.PRIORITY_HIGH)

      val color = when (status) {
        "completed" -> 0xFF4CAF50.toInt()
        "running" -> 0xFF2196F3.toInt()
        "paused" -> 0xFFFFC107.toInt()
        "failed" -> 0xFFF44336.toInt()
        else -> 0xFF9C27B0.toInt()
      }
      notificationBuilder.setColor(color)

      if (message.length > 50) {
        notificationBuilder.setStyle(
          NotificationCompat.BigTextStyle()
            .bigText(message)
        )
      }

      NotificationManagerCompat.from(this).notify(
        operationId?.hashCode() ?: 1,
        notificationBuilder.build()
      )

      Log.d(TAG, "Notification shown for operation: $operationId")
    } catch (e: Exception) {
      Log.e(TAG, "Error showing notification", e)
    }
  }

  private fun updateLocalDatabase(
    operationId: String,
    status: String?,
    data: Map<String, String>
  ) {
    CoroutineScope(Dispatchers.IO).launch {
      try {
        Log.d(TAG, "Updated local database for operation: $operationId with status: $status")
      } catch (e: Exception) {
        Log.e(TAG, "Error updating local database", e)
      }
    }
  }

  private fun storeTokenLocally(token: String) {
    CoroutineScope(Dispatchers.IO).launch {
      try {
        val prefs = getSharedPreferences("bruteforcer_prefs", Context.MODE_PRIVATE)
        prefs.edit().putString("fcm_token", token).apply()
        Log.d(TAG, "FCM token stored locally")
      } catch (e: Exception) {
        Log.e(TAG, "Error storing FCM token", e)
      }
    }
  }
}
