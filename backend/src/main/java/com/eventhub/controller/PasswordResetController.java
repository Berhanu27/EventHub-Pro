package com.eventhub.controller;

import com.eventhub.service.PasswordResetService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import jakarta.servlet.http.HttpServletRequest;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/password-reset")
@RequiredArgsConstructor
public class PasswordResetController {
    private final PasswordResetService passwordResetService;
    
    @PostMapping("/request")
    public ResponseEntity<Map<String, String>> requestPasswordReset(
            @RequestBody Map<String, String> request,
            HttpServletRequest httpRequest) {
        try {
            String registeredEmail = request.get("registeredEmail");
            String recoveryEmail = request.get("recoveryEmail");
            String ipAddress = getClientIpAddress(httpRequest);
            
            passwordResetService.requestPasswordReset(registeredEmail, recoveryEmail, ipAddress);
            
            Map<String, String> response = new HashMap<>();
            response.put("message", "If the account exists with matching recovery email, a reset link has been sent");
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            if (e.getMessage().contains("Too many reset requests")) {
                Map<String, String> response = new HashMap<>();
                response.put("error", "Too many reset requests. Please try again in 1 hour");
                return ResponseEntity.status(429).body(response);
            }
            throw e;
        }
    }
    
    @GetMapping("/validate/{token}")
    public ResponseEntity<Map<String, Object>> validateToken(@PathVariable String token) {
        PasswordResetService.PasswordResetValidation validation = passwordResetService.validateToken(token);
        
        Map<String, Object> response = new HashMap<>();
        response.put("valid", validation.valid);
        response.put("message", validation.message);
        if (validation.expiresAt != null) {
            response.put("expiresAt", validation.expiresAt);
        }
        
        return ResponseEntity.ok(response);
    }
    
    @PostMapping("/reset")
    public ResponseEntity<Map<String, String>> resetPassword(@RequestBody Map<String, String> request) {
        try {
            String token = request.get("token");
            String newPassword = request.get("newPassword");
            
            passwordResetService.resetPassword(token, newPassword);
            
            Map<String, String> response = new HashMap<>();
            response.put("message", "Password has been successfully reset. Please login with your new password.");
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            Map<String, String> response = new HashMap<>();
            response.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }
    
    private String getClientIpAddress(HttpServletRequest request) {
        String xForwardedFor = request.getHeader("X-Forwarded-For");
        if (xForwardedFor != null && !xForwardedFor.isEmpty()) {
            return xForwardedFor.split(",")[0];
        }
        return request.getRemoteAddr();
    }
}
