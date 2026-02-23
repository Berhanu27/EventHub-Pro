package com.eventhub.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api")
public class HealthController {
    
    @GetMapping("/health")
    public Map<String, String> health() {
        Map<String, String> response = new HashMap<>();
        response.put("status", "UP");
        response.put("message", "EventHub Backend is running!");
        response.put("timestamp", java.time.LocalDateTime.now().toString());
        return response;
    }
    
    @GetMapping
    public Map<String, String> root() {
        Map<String, String> response = new HashMap<>();
        response.put("application", "EventHub Pro API");
        response.put("version", "1.0.0");
        response.put("status", "Running");
        return response;
    }
}
