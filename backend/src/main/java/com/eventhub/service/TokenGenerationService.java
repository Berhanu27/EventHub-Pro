package com.eventhub.service;

import org.springframework.stereotype.Service;
import java.security.SecureRandom;
import java.util.Base64;

@Service
public class TokenGenerationService {
    private static final int TOKEN_LENGTH = 64;
    private final SecureRandom secureRandom;
    
    public TokenGenerationService() {
        this.secureRandom = new SecureRandom();
    }
    
    public String generateSecureToken() {
        byte[] randomBytes = new byte[TOKEN_LENGTH];
        secureRandom.nextBytes(randomBytes);
        return Base64.getUrlEncoder().withoutPadding().encodeToString(randomBytes);
    }
}
