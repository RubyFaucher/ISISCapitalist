package com.example.demo;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class DemoApplication {

	public static void main(String[] args) {
		SpringApplication.run(DemoApplication.class, args);
                Services s1=new Services();
                s1.readWorldFromXml();
                s1.saveWorldToXml(s1.readWorldFromXml());
                s1.getWorld();
	}

}
