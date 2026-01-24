package com.nestack

import org.springframework.boot.autoconfigure.SpringBootApplication
import org.springframework.boot.runApplication

@SpringBootApplication
class NestackApplication

fun main(args: Array<String>) {
    runApplication<NestackApplication>(*args)
}
