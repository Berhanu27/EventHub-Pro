package com.eventhub.controller;

import com.eventhub.dto.AuthRequest;
import com.eventhub.dto.AuthResponse;
import com.eventhub.dto.RegisterRequest;
import com.eventhub.entity.User;
import com.eventhub.repository.UserRepository;
import com.eventhub.security.JwtUtil;
import com.eventhub.service.PasswordHashingService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {
    
    private final UserRepository userRepository;
    private final PasswordHashingService passwordHashingService;
    private final JwtUtil jwtUtil;
    
    @PostMapping("/register")
    public ResponseEntity<?> register(@Valid @RequestBody RegisterRequest request) {
        try {
            // Check if user already exists
            if (userRepository.existsByEmail(request.getEmail())) {
                Map<String, String> response = new HashMap<>();
                response.put("error", "Email already registered");
                return ResponseEntity.badRequest().body(response);
            }
            
            // Create new user
            User user = new User();
            user.setName(request.getName());
            user.setEmail(request.getEmail());
            user.setPassword(passwordHashingService.hashPassword(request.getPassword()));
            user.setCreatedAt(LocalDateTime.now());
            user.setUpdatedAt(LocalDateTime.now());
            user.setRole(User.Role.USER);
            
            User savedUser = userRepository.save(user);
            
            // Generate JWT token
            String token = jwtUtil.generateToken(savedUser.getEmail(), savedUser.getRole().name());
            
            AuthResponse response = new AuthResponse(
                token,
                savedUser.getEmail(),
                savedUser.getName(),
                savedUser.getRole().name()
            );
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, String> response = new HashMap<>();
            response.put("error", "Registration failed: " + e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }
    
    @PostMapping("/login")
    public ResponseEntity<?> login(@Valid @RequestBody AuthRequest request) {
        try {
            User user = userRepository.findByEmail(request.getEmail())
                    .orElse(null);
            
            if (user == null || !passwordHashingService.verifyPassword(request.getPassword(), user.getPassword())) {
                Map<String, String> response = new HashMap<>();
                response.put("error", "Invalid email or password");
                return ResponseEntity.badRequest().body(response);
            }
            
            // Generate JWT token
            String token = jwtUtil.generateToken(user.getEmail(), user.getRole().name());
            
            AuthResponse response = new AuthResponse(
                token,
                user.getEmail(),
                user.getName(),
                user.getRole().name()
            );
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, String> response = new HashMap<>();
            response.put("error", "Login failed: " + e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }
}
