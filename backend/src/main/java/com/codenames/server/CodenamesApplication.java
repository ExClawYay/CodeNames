package com.codenames.server;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.ComponentScan;

@SpringBootApplication
@ComponentScan(basePackages = "com.codenames")
public class CodenamesApplication {

    public static void main(String[] args) {
        SpringApplication.run(CodenamesApplication.class, args);
    }

}
