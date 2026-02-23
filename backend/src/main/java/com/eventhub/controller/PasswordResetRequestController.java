package com.eventhub.controller;

import com.eventhub.dto.ApprovePasswordResetRequest;
import com.eventhub.dto.CreatePasswordResetRequest;
import com.eventhub.dto.PasswordResetRequestDto;
import com.eventhub.service.PasswordResetRequestService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/password-reset-requests")
@RequiredArgsConstructor
public class PasswordResetRequestController {
    
    private final PasswordResetRequestService service;
    
    @PostMapping
    public ResponseEntity<PasswordResetRequestDto> createRequest(@RequestBody CreatePasswordResetRequest request) {
        return ResponseEntity.ok(service.createRequest(request));
    }
    
    @GetMapping("/my-requests")
    public ResponseEntity<List<PasswordResetRequestDto>> getMyRequests() {
        return ResponseEntity.ok(service.getMyRequests());
    }
    
    @GetMapping("/pending")
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<?> getPendingRequests() {
        try {
            List<PasswordResetRequestDto> requests = service.getPendingRequests();
            return ResponseEntity.ok(requests);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
    
    @PostMapping("/{id}/approve")
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<PasswordResetRequestDto> approveRequest(@PathVariable Long id) {
        return ResponseEntity.ok(service.approveRequest(id));
    }
    
    @PostMapping("/{id}/reject")
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<PasswordResetRequestDto> rejectRequest(@PathVariable Long id) {
        return ResponseEntity.ok(service.rejectRequest(id));
    }
}
