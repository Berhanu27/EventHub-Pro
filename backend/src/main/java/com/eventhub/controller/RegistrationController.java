package com.eventhub.controller;

import com.eventhub.dto.RegistrationRequest;
import com.eventhub.dto.RegistrationResponse;
import com.eventhub.service.RegistrationService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/registrations")
@RequiredArgsConstructor
public class RegistrationController {
    
    private final RegistrationService registrationService;
    
    @PostMapping
    public ResponseEntity<RegistrationResponse> registerForEvent(@Valid @RequestBody RegistrationRequest request) {
        return ResponseEntity.ok(registrationService.registerForEvent(request));
    }
    
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> cancelRegistration(@PathVariable Long id) {
        registrationService.cancelRegistration(id);
        return ResponseEntity.noContent().build();
    }
    
    @GetMapping("/my-events")
    public ResponseEntity<List<RegistrationResponse>> getMyEvents() {
        return ResponseEntity.ok(registrationService.getMyEvents());
    }
    
    @GetMapping("/event/{eventId}/attendees")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<RegistrationResponse>> getEventAttendees(@PathVariable Long eventId) {
        return ResponseEntity.ok(registrationService.getEventAttendees(eventId));
    }
    
    @GetMapping("/pending")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<RegistrationResponse>> getPendingRegistrations() {
        return ResponseEntity.ok(registrationService.getPendingRegistrations());
    }
    
    @PostMapping("/{id}/approve")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<RegistrationResponse> approveRegistration(@PathVariable Long id) {
        return ResponseEntity.ok(registrationService.approveRegistration(id));
    }
    
    @PostMapping("/{id}/reject")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<RegistrationResponse> rejectRegistration(@PathVariable Long id) {
        return ResponseEntity.ok(registrationService.rejectRegistration(id));
    }
    
    @PostMapping("/{id}/check-in")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<RegistrationResponse> checkInAttendee(@PathVariable Long id) {
        return ResponseEntity.ok(registrationService.checkInAttendee(id));
    }
    
    @GetMapping("/event/{eventId}/checked-in")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<RegistrationResponse>> getCheckedInAttendees(@PathVariable Long eventId) {
        return ResponseEntity.ok(registrationService.getCheckedInAttendees(eventId));
    }
}
