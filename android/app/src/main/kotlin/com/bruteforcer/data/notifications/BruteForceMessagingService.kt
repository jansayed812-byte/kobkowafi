package com.bruteforcer.data.notifications

import android.app.NotificationManager
import android.app.PendingIntent
import android.content.Context
import android.content.Intent
import android.util.Log
import androidx.core.app.NotificationCompat
import com.google.firebase.messaging.FirebaseMessagingService
import com.google.firebase.messaging.RemoteMessage
import com.bruteforcer.MainActivity
import com.bruteforcer.R
import com.bruteforcer.data.api.ApiClient
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

    // Handle notification payload
    remoteMessage.notification?.let {
      Log.d(TAG, "Message Notification Body: ${it.body}")
      handleNotification(
        title = it.title ?: "Brute Forcer",
        message = it.body ?: "",
        data = remoteMessage.data
      )
    }

    // Handle data payload
    remoteMessage.data.isNotEmpty().let {
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
    sendTokenToServer(token)
  }

  private fun handleNotification(
    title: String,
    message: String,
    data: Map<String, String>
  ) {
    val operationId = data["operationId"]
    val status = data["status"]

    // Show notification
    showNotification(title, message, operationId, status, data)

    // Update local database if needed
    operationId?.let {
      updateLocalDatabase(it, status, data)
    }
  }

  private fun showNotification(
    title: String,
    message: String,
    operationId: String?,
    status: String?,
    data: Map<String, String>
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
        .setSmallIcon(R.drawable.ic_notification)
        .setContentTitle(title)
        .setContentText(message)
        .setAutoCancel(true)
        .setContentIntent(pendingIntent)
        .setPriority(NotificationCompat.PRIORITY_HIGH)

      // Add color based on status
      val color = when (status) {
        "completed" -> 0xFF4CAF50.toInt() // Green
        "running" -> 0xFF2196F3.toInt()   // Blue
        "paused" -> 0xFFFFC107.toInt()    // Amber
        "failed" -> 0xFFF44336.toInt()    // Red
        else -> 0xFF9C27B0.toInt()        // Purple
      }
      notificationBuilder.setColor(color)

      // Add big text style for longer messages
      if (message.length > 50) {
        notificationBuilder.setStyle(
          NotificationCompat.BigTextStyle()
            .bigText(message)
        )
      }

      val notificationManager = getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
      notificationManager.notify(operationId?.hashCode() ?: 1, notificationBuilder.build())

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
        // This could update Room database with the latest operation status
        // For now, we just log it
        Log.d(TAG, "Updated local database for operation: $operationId with status: $status")
      } catch (e: Exception) {
        Log.e(TAG, "Error updating local database", e)
      }
    }
  }

  private fun sendTokenToServer(token: String) {
    CoroutineScope(Dispatchers.IO).launch {
      try {
        val apiClient = ApiClient()
        // Send token to backend notification subscription endpoint
        apiClient.httpClient.post("/notifications/subscribe") {
          setBody(mapOf("fcmToken" to token))
        }
        Log.d(TAG, "FCM token sent to server")
      } catch (e: Exception) {
        Log.e(TAG, "Error sending FCM token to server", e)
      }
    }
  }
}
