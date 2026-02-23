package com.eventhub.service;

import com.eventhub.entity.PasswordReset;
import com.eventhub.entity.User;
import com.eventhub.repository.PasswordResetRepository;
import com.eventhub.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.util.Optional;
import java.util.regex.Pattern;

@Service
@RequiredArgsConstructor
public class PasswordResetService {
    private final UserRepository userRepository;
    private final PasswordResetRepository passwordResetRepository;
    private final EmailService emailService;
    private final PasswordHashingService passwordHashingService;
    private final TokenGenerationService tokenGenerationService;
    private final RateLimitService rateLimitService;
    
    private static final int TOKEN_EXPIRATION_MINUTES = 15;
    private static final String PASSWORD_REGEX = "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]{8,}$";
    private static final Pattern PASSWORD_PATTERN = Pattern.compile(PASSWORD_REGEX);
    
    public void requestPasswordReset(String registeredEmail, String recoveryEmail, String ipAddress) {
        if (rateLimitService.isRateLimited(registeredEmail, ipAddress)) {
            rateLimitService.incrementRateLimitCounter(registeredEmail, ipAddress);
            throw new RuntimeException("Too many reset requests. Please try again in 1 hour");
        }
        
        Optional<User> userOpt = userRepository.findByEmail(registeredEmail);
        rateLimitService.incrementRateLimitCounter(registeredEmail, ipAddress);
        
        if (userOpt.isPresent()) {
            User user = userOpt.get();
            
            if (user.getRecoveryEmail() == null || !user.getRecoveryEmail().equals(recoveryEmail)) {
                return;
            }
            
            String token = tokenGenerationService.generateSecureToken();
            LocalDateTime expiresAt = LocalDateTime.now().plusMinutes(TOKEN_EXPIRATION_MINUTES);
            
            PasswordReset passwordReset = new PasswordReset();
            passwordReset.setUser(user);
            passwordReset.setToken(token);
            passwordReset.setExpiresAt(expiresAt);
            passwordReset.setUsed(false);
            passwordReset.setCreatedAt(LocalDateTime.now());
            
            passwordResetRepository.save(passwordReset);
            
            String resetLink = "http://localhost:3000/reset-password?token=" + token;
            emailService.sendPasswordResetEmail(user.getRecoveryEmail(), resetLink);
        }
    }
    
    public PasswordResetValidation validateToken(String token) {
        Optional<PasswordReset> resetOpt = passwordResetRepository.findByToken(token);
        
        if (resetOpt.isEmpty()) {
            return new PasswordResetValidation(false, "Invalid or expired link", null);
        }
        
        PasswordReset reset = resetOpt.get();
        
        if (reset.getUsed()) {
            return new PasswordResetValidation(false, "Invalid or expired link", null);
        }
        
        if (LocalDateTime.now().isAfter(reset.getExpiresAt())) {
            return new PasswordResetValidation(false, "Invalid or expired link", null);
        }
        
        return new PasswordResetValidation(true, "Token is valid", reset.getExpiresAt());
    }
    
    public void resetPassword(String token, String newPassword) {
        if (!isValidPassword(newPassword)) {
            throw new RuntimeException("Password does not meet strength requirements");
        }
        
        Optional<PasswordReset> resetOpt = passwordResetRepository.findByToken(token);
        
        if (resetOpt.isEmpty() || resetOpt.get().getUsed() || 
            LocalDateTime.now().isAfter(resetOpt.get().getExpiresAt())) {
            throw new RuntimeException("Invalid or expired link");
        }
        
        PasswordReset reset = resetOpt.get();
        User user = reset.getUser();
        
        user.setPassword(passwordHashingService.hashPassword(newPassword));
        user.setUpdatedAt(LocalDateTime.now());
        userRepository.save(user);
        
        reset.setUsed(true);
        passwordResetRepository.save(reset);
        
        emailService.sendPasswordChangedNotification(user.getEmail(), user.getRecoveryEmail());
    }
    
    public void setRecoveryEmail(Long userId, String recoveryEmail, String password) {
        Optional<User> userOpt = userRepository.findById(userId);
        
        if (userOpt.isEmpty()) {
            throw new RuntimeException("User not found");
        }
        
        User user = userOpt.get();
        
        if (!passwordHashingService.verifyPassword(password, user.getPassword())) {
            throw new RuntimeException("Incorrect password");
        }
        
        user.setRecoveryEmail(recoveryEmail);
        user.setUpdatedAt(LocalDateTime.now());
        userRepository.save(user);
    }
    
    private boolean isValidPassword(String password) {
        return PASSWORD_PATTERN.matcher(password).matches();
    }
    
    public static class PasswordResetValidation {
        public boolean valid;
        public String message;
        public LocalDateTime expiresAt;
        
        public PasswordResetValidation(boolean valid, String message, LocalDateTime expiresAt) {
            this.valid = valid;
            this.message = message;
            this.expiresAt = expiresAt;
        }
    }
}
