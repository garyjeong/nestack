package com.nestack.infrastructure.persistence

import org.springframework.boot.test.context.TestConfiguration
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Primary
import org.springframework.test.context.DynamicPropertyRegistry
import org.springframework.test.context.DynamicPropertySource
import org.testcontainers.containers.PostgreSQLContainer
import org.testcontainers.junit.jupiter.Container
import org.testcontainers.junit.jupiter.Testcontainers
import javax.sql.DataSource

/**
 * Testcontainers configuration for integration tests
 * Uses PostgreSQL container for realistic database testing
 */
@Testcontainers
@TestConfiguration
class TestcontainersConfig {

    companion object {
        @Container
        val postgresContainer = PostgreSQLContainer("postgres:15-alpine")
            .apply {
                withDatabaseName("nestack_test")
                withUsername("test")
                withPassword("test")
            }

        @DynamicPropertySource
        @JvmStatic
        fun configureProperties(registry: DynamicPropertyRegistry) {
            registry.add("spring.datasource.url") { postgresContainer.jdbcUrl }
            registry.add("spring.datasource.username") { postgresContainer.username }
            registry.add("spring.datasource.password") { postgresContainer.password }
        }
    }
}
