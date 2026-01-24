package com.nestack.config

import io.swagger.v3.oas.models.Components
import io.swagger.v3.oas.models.OpenAPI
import io.swagger.v3.oas.models.info.Info
import io.swagger.v3.oas.models.security.SecurityScheme
import io.swagger.v3.oas.models.servers.Server
import org.springframework.beans.factory.annotation.Value
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration

@Configuration
class SwaggerConfig {

    @Value("\${springdoc.swagger-ui.enabled:true}")
    private val swaggerEnabled: Boolean = true

    @Bean
    fun openAPI(): OpenAPI {
        return OpenAPI()
            .info(
                Info()
                    .title("Nestack API")
                    .description("Nestack - Life-Cycle Mission SaaS for Couples")
                    .version("1.0")
            )
            .servers(
                listOf(
                    Server().url("http://localhost:3000").description("Local Server")
                )
            )
            .components(
                Components()
                    .addSecuritySchemes(
                        "JWT-auth",
                        SecurityScheme()
                            .type(SecurityScheme.Type.HTTP)
                            .scheme("bearer")
                            .bearerFormat("JWT")
                            .`in`(SecurityScheme.In.HEADER)
                            .name("Authorization")
                            .description("Enter JWT token")
                    )
            )
    }
}
