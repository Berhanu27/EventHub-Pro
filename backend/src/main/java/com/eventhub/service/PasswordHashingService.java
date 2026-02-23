package com.eventhub.service;

import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class PasswordHashingService {
    private final BCryptPasswordEncoder passwordEncoder;
    
    public PasswordHashingService() {
        this.passwordEncoder = new BCryptPasswordEncoder(10);
    }
    
    public String hashPassword(String password) {
        return passwordEncoder.encode(password);
    }
    
    public boolean verifyPassword(String rawPassword, String hashedPassword) {
        return passwordEncoder.matches(rawPassword, hashedPassword);
    }
}
