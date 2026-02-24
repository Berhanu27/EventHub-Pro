package com.eventhub.controller;

import com.eventhub.service.PasswordResetService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/account")
@RequiredArgsConstructor
@Slf4j
public class AccountController {
    private final PasswordResetService passwordResetService;
    
    @PostMapping("/set-recovery-email")
    public ResponseEntity<Map<String, String>> setRecoveryEmail(
            @RequestBody Map<String, String> request) {
        try {
            Long userId = Long.parseLong(request.get("userId"));
            String recoveryEmail = request.get("recoveryEmail");
            String password = request.get("password");
            
            log.info("Setting recovery email for user: {}", userId);
            
            passwordResetService.setRecoveryEmail(userId, recoveryEmail, password);
            
            Map<String, String> response = new HashMap<>();
            response.put("message", "Recovery email has been set successfully");
            return ResponseEntity.ok(response);
        } catch (NumberFormatException e) {
            log.error("Invalid user ID format", e);
            Map<String, String> response = new HashMap<>();
            response.put("error", "Invalid user ID");
            return ResponseEntity.badRequest().body(response);
        } catch (RuntimeException e) {
            log.error("Error setting recovery email: {}", e.getMessage());
            Map<String, String> response = new HashMap<>();
            response.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        } catch (Exception e) {
            log.error("Unexpected error setting recovery email", e);
            Map<String, String> response = new HashMap<>();
            response.put("error", "An unexpected error occurred");
            return ResponseEntity.status(500).body(response);
        }
    }
}
