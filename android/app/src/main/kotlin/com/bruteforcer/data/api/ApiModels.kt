package com.bruteforcer.data.api

import kotlinx.serialization.Serializable

// Auth Models
@Serializable
data class LoginRequest(
    val email: String,
    val password: String
)

@Serializable
data class RegisterRequest(
    val email: String,
    val password: String
)

@Serializable
data class AuthResponse(
    val success: Boolean,
    val data: AuthData? = null,
    val error: String? = null
)

@Serializable
data class AuthData(
    val id: String,
    val email: String,
    val token: String,
    val refreshToken: String
)

@Serializable
data class UserProfile(
    val success: Boolean,
    val data: UserData? = null
)

@Serializable
data class UserData(
    val id: String,
    val email: String,
    val createdAt: String
)

// Operations Models
@Serializable
data class OperationData(
    val id: String,
    val name: String,
    val description: String? = null,
    val target: String,
    val type: String,
    val status: String,
    val progress: Int = 0,
    val successful_attempts: Int = 0,
    val failed_attempts: Int = 0,
    val createdAt: String? = null
)

@Serializable
data class OperationsListResponse(
    val success: Boolean,
    val data: List<OperationData>? = null,
    val pagination: PaginationData? = null
)

@Serializable
data class PaginationData(
    val page: Int,
    val pageSize: Int,
    val total: Int
)

@Serializable
data class CreateOperationRequest(
    val name: String,
    val description: String? = null,
    val target: String,
    val type: String
)

@Serializable
data class StartOperationRequest(
    val wordlist: List<String>? = null,
    val threads: Int = 4,
    val delay: Int = 100
)

@Serializable
data class OperationResponse(
    val success: Boolean,
    val data: OperationData? = null,
    val error: String? = null
)

// Results Models
@Serializable
data class ResultData(
    val id: String,
    val operationId: String,
    val type: String,
    val username: String? = null,
    val password: String? = null,
    val timestamp: String
)

@Serializable
data class ResultsResponse(
    val success: Boolean,
    val data: List<ResultData>? = null,
    val pagination: PaginationData? = null
)

// Targets Models
@Serializable
data class TargetData(
    val id: String,
    val name: String,
    val protocol: String,
    val host: String,
    val port: Int,
    val username: String? = null,
    val createdAt: String? = null
)

@Serializable
data class TargetsResponse(
    val success: Boolean,
    val data: List<TargetData>? = null
)

@Serializable
data class CreateTargetRequest(
    val name: String,
    val protocol: String,
    val host: String,
    val port: Int,
    val username: String? = null
)

// Settings Models
@Serializable
data class SettingsData(
    val theme: String? = null,
    val fontSize: Int? = null,
    val notificationsEnabled: Boolean? = null,
    val maxAttempts: Int? = null,
    val connectionDelay: Int? = null,
    val maxThreads: Int? = null
)

@Serializable
data class SettingsResponse(
    val success: Boolean,
    val data: SettingsData? = null
)

// Generic Response
@Serializable
data class ApiResponse<T>(
    val success: Boolean,
    val data: T? = null,
    val error: String? = null,
    val message: String? = null
)
