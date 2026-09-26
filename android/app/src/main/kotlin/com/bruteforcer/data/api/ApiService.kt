package com.bruteforcer.data.api

import io.ktor.client.call.body
import io.ktor.client.request.delete
import io.ktor.client.request.get
import io.ktor.client.request.post
import io.ktor.client.request.put
import io.ktor.client.request.setBody
import io.ktor.http.ContentType
import io.ktor.http.contentType

object ApiService {
    private val baseUrl = ApiClient.getBaseUrl()

    // Auth Endpoints
    suspend fun register(email: String, password: String): AuthResponse {
        return try {
            ApiClient.client.post("$baseUrl/auth/register") {
                contentType(ContentType.Application.Json)
                setBody(RegisterRequest(email, password))
            }.body()
        } catch (e: Exception) {
            AuthResponse(false, error = e.message)
        }
    }

    suspend fun login(email: String, password: String): AuthResponse {
        return try {
            ApiClient.client.post("$baseUrl/auth/login") {
                contentType(ContentType.Application.Json)
                setBody(LoginRequest(email, password))
            }.body()
        } catch (e: Exception) {
            AuthResponse(false, error = e.message)
        }
    }

    suspend fun getProfile(): UserProfile {
        return try {
            ApiClient.client.get("$baseUrl/auth/profile").body()
        } catch (e: Exception) {
            UserProfile(false)
        }
    }

    // Operations Endpoints
    suspend fun listOperations(page: Int = 1, pageSize: Int = 10): OperationsListResponse {
        return try {
            ApiClient.client.get("$baseUrl/operations?page=$page&pageSize=$pageSize").body()
        } catch (e: Exception) {
            OperationsListResponse(false)
        }
    }

    suspend fun createOperation(request: CreateOperationRequest): OperationResponse {
        return try {
            ApiClient.client.post("$baseUrl/operations") {
                contentType(ContentType.Application.Json)
                setBody(request)
            }.body()
        } catch (e: Exception) {
            OperationResponse(false, error = e.message)
        }
    }

    suspend fun getOperation(id: String): OperationResponse {
        return try {
            ApiClient.client.get("$baseUrl/operations/$id").body()
        } catch (e: Exception) {
            OperationResponse(false, error = e.message)
        }
    }

    suspend fun startOperation(id: String, request: StartOperationRequest): OperationResponse {
        return try {
            ApiClient.client.post("$baseUrl/operations/$id/start") {
                contentType(ContentType.Application.Json)
                setBody(request)
            }.body()
        } catch (e: Exception) {
            OperationResponse(false, error = e.message)
        }
    }

    suspend fun pauseOperation(id: String): OperationResponse {
        return try {
            ApiClient.client.post("$baseUrl/operations/$id/pause").body()
        } catch (e: Exception) {
            OperationResponse(false, error = e.message)
        }
    }

    suspend fun resumeOperation(id: String): OperationResponse {
        return try {
            ApiClient.client.post("$baseUrl/operations/$id/resume").body()
        } catch (e: Exception) {
            OperationResponse(false, error = e.message)
        }
    }

    suspend fun cancelOperation(id: String): OperationResponse {
        return try {
            ApiClient.client.post("$baseUrl/operations/$id/cancel").body()
        } catch (e: Exception) {
            OperationResponse(false, error = e.message)
        }
    }

    suspend fun deleteOperation(id: String): OperationResponse {
        return try {
            ApiClient.client.delete("$baseUrl/operations/$id").body()
        } catch (e: Exception) {
            OperationResponse(false, error = e.message)
        }
    }

    suspend fun getOperationResults(id: String, page: Int = 1, pageSize: Int = 50): ResultsResponse {
        return try {
            ApiClient.client.get("$baseUrl/operations/$id/results?page=$page&pageSize=$pageSize").body()
        } catch (e: Exception) {
            ResultsResponse(false)
        }
    }

    // Targets Endpoints
    suspend fun listTargets(page: Int = 1, pageSize: Int = 10): TargetsResponse {
        return try {
            ApiClient.client.get("$baseUrl/targets?page=$page&pageSize=$pageSize").body()
        } catch (e: Exception) {
            TargetsResponse(false)
        }
    }

    suspend fun createTarget(request: CreateTargetRequest): OperationResponse {
        return try {
            ApiClient.client.post("$baseUrl/targets") {
                contentType(ContentType.Application.Json)
                setBody(request)
            }.body()
        } catch (e: Exception) {
            OperationResponse(false, error = e.message)
        }
    }

    suspend fun deleteTarget(id: String): OperationResponse {
        return try {
            ApiClient.client.delete("$baseUrl/targets/$id").body()
        } catch (e: Exception) {
            OperationResponse(false, error = e.message)
        }
    }

    // Settings Endpoints
    suspend fun getSettings(): SettingsResponse {
        return try {
            ApiClient.client.get("$baseUrl/settings").body()
        } catch (e: Exception) {
            SettingsResponse(false)
        }
    }

    suspend fun updateSettings(settings: SettingsData): SettingsResponse {
        return try {
            ApiClient.client.put("$baseUrl/settings") {
                contentType(ContentType.Application.Json)
                setBody(settings)
            }.body()
        } catch (e: Exception) {
            SettingsResponse(false, error = e.message)
        }
    }
}
