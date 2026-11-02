package br.com.prumo;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.ConfigurationPropertiesScan;

@SpringBootApplication
@ConfigurationPropertiesScan
public class PrumoApplication {
    public static void main(String[] args) {
        SpringApplication.run(PrumoApplication.class, args);
    }
}
