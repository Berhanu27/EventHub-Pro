package com.eventhub.controller;

import com.eventhub.dto.CheckInRequest;
import com.eventhub.dto.CheckInResponse;
import com.eventhub.service.CheckInService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/check-in")
@RequiredArgsConstructor
public class CheckInController {
    
    private final CheckInService checkInService;
    
    @PostMapping
    public ResponseEntity<CheckInResponse> checkIn(@Valid @RequestBody CheckInRequest request) {
        return ResponseEntity.ok(checkInService.checkIn(request));
    }
    
    @PostMapping("/admin/{registrationId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<CheckInResponse> adminCheckIn(
            @PathVariable Long registrationId,
            @Valid @RequestBody CheckInRequest request) {
        return ResponseEntity.ok(checkInService.adminCheckIn(registrationId, request));
    }
    
    @GetMapping("/my-stats")
    public ResponseEntity<?> getMyStats() {
        return ResponseEntity.ok(checkInService.getUserStats());
    }
    
    @GetMapping("/my-badges")
    public ResponseEntity<?> getMyBadges() {
        return ResponseEntity.ok(checkInService.getUserBadges());
    }
    
    @GetMapping("/leaderboard")
    public ResponseEntity<?> getLeaderboard() {
        return ResponseEntity.ok(checkInService.getLeaderboard());
    }
    
    @GetMapping("/event/{eventId}/check-ins")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> getEventCheckIns(@PathVariable Long eventId) {
        return ResponseEntity.ok(checkInService.getEventCheckIns(eventId));
    }
    
    @GetMapping("/flagged")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> getFlaggedCheckIns() {
        return ResponseEntity.ok(checkInService.getFlaggedCheckIns());
    }
}
