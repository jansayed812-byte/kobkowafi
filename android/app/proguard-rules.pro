# Kotlin
-keep class kotlin.** { *; }
-keep interface kotlin.** { *; }
-keep class kotlinx.** { *; }
-keep interface kotlinx.** { *; }

# Ktor
-keep class io.ktor.** { *; }
-keep interface io.ktor.** { *; }

# Serialization
-keepclassmembers class **$Companion {
    public static ** INSTANCE;
}
-keep class **$serializer { *; }
-keepclassmembers class ** {
    @kotlinx.serialization.Serializable <methods>;
}

# Room
-keep class androidx.room.** { *; }
-keep interface androidx.room.** { *; }

# Jetpack Compose
-keep class androidx.compose.** { *; }
-keep interface androidx.compose.** { *; }

# App
-keep class com.bruteforcer.** { *; }
-keep interface com.bruteforcer.** { *; }
