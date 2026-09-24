package com.bruteforcer.data.api

import io.ktor.client.HttpClient
import io.ktor.client.engine.android.Android
import io.ktor.client.plugins.contentnegotiation.ContentNegotiation
import io.ktor.client.plugins.defaultRequest
import io.ktor.client.request.header
import io.ktor.client.statement.HttpResponse
import io.ktor.http.ContentType
import io.ktor.serialization.kotlinx.json.json
import kotlinx.serialization.json.Json

object ApiClient {
    private const val BASE_URL = "http://localhost:3000/api/v1"

    var authToken: String? = null
    var refreshToken: String? = null

    val client = HttpClient(Android) {
        install(ContentNegotiation) {
            json(Json {
                prettyPrint = true
                ignoreUnknownKeys = true
            })
        }

        defaultRequest {
            header("Content-Type", ContentType.Application.Json)
            if (authToken != null) {
                header("Authorization", "Bearer $authToken")
            }
        }
    }

    fun setTokens(token: String, refresh: String) {
        authToken = token
        refreshToken = refresh
    }

    fun clearTokens() {
        authToken = null
        refreshToken = null
    }

    fun getBaseUrl(): String = BASE_URL
}
