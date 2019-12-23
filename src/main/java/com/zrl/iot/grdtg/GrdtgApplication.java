package com.zrl.iot.grdtg;

import org.mybatis.spring.annotation.MapperScan;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.builder.SpringApplicationBuilder;
import org.springframework.boot.web.servlet.support.SpringBootServletInitializer;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
@ComponentScan(basePackages = {"com.zrl.iot.*"})
@MapperScan(value = "com.zrl.iot.mapper")
public class GrdtgApplication extends SpringBootServletInitializer {
 
    public static void main(String[] args) {
        SpringApplication.run(GrdtgApplication.class, args);
    }

}
