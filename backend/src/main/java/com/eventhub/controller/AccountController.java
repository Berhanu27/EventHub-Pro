package com.eventhub.controller;

import com.eventhub.service.PasswordResetService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/account")
@RequiredArgsConstructor
public class AccountController {
    private final PasswordResetService passwordResetService;
    
    @PostMapping("/set-recovery-email")
    public ResponseEntity<Map<String, String>> setRecoveryEmail(
            @RequestBody Map<String, String> request) {
        try {
            Long userId = Long.parseLong(request.get("userId"));
            String recoveryEmail = request.get("recoveryEmail");
            String password = request.get("password");
            
            passwordResetService.setRecoveryEmail(userId, recoveryEmail, password);
            
            Map<String, String> response = new HashMap<>();
            response.put("message", "Recovery email has been set successfully");
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            Map<String, String> response = new HashMap<>();
            response.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }
}
