package dev.danielk.startjava17;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.jdbc.DataSourceAutoConfiguration;

@SpringBootApplication(exclude = {DataSourceAutoConfiguration.class})
public class StartJava17Application {
    public static void main(String[] args) {
        SpringApplication.run(StartJava17Application.class, args);
    }
}
