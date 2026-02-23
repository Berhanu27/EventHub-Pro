package com.eventhub.service;

import com.eventhub.dto.RegistrationRequest;
import com.eventhub.dto.RegistrationResponse;
import com.eventhub.entity.Event;
import com.eventhub.entity.Registration;
import com.eventhub.entity.User;
import com.eventhub.repository.EventRepository;
import com.eventhub.repository.RegistrationRepository;
import com.eventhub.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class RegistrationService {
    
    private final RegistrationRepository registrationRepository;
    private final UserRepository userRepository;
    private final EventRepository eventRepository;
    
    public RegistrationResponse registerForEvent(RegistrationRequest request) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        Event event = eventRepository.findById(request.getEventId())
                .orElseThrow(() -> new RuntimeException("Event not found"));
        
        if (registrationRepository.existsByUserIdAndEventId(user.getId(), event.getId())) {
            throw new RuntimeException("Already registered for this event");
        }
        
        long currentAttendees = registrationRepository.countByEventId(event.getId());
        if (event.getMaxAttendees() != null && currentAttendees >= event.getMaxAttendees()) {
            throw new RuntimeException("Event is full");
        }
        
        Registration registration = new Registration();
        registration.setUser(user);
        registration.setEvent(event);
        registration.setPaymentProof(request.getPaymentProof());
        registration.setPaymentMethod(request.getPaymentMethod());
        registration.setStatus(Registration.RegistrationStatus.PENDING);
        
        Registration saved = registrationRepository.save(registration);
        return mapToResponse(saved);
    }
    
    public RegistrationResponse approveRegistration(Long id) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User admin = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        Registration registration = registrationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Registration not found"));
        
        registration.setStatus(Registration.RegistrationStatus.APPROVED);
        registration.setApprovedAt(LocalDateTime.now());
        registration.setApprovedBy(admin.getId());
        registration.setTicketCode(generateTicketCode());
        
        Registration updated = registrationRepository.save(registration);
        return mapToResponse(updated);
    }
    
    public RegistrationResponse rejectRegistration(Long id) {
        Registration registration = registrationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Registration not found"));
        
        registration.setStatus(Registration.RegistrationStatus.REJECTED);
        
        Registration updated = registrationRepository.save(registration);
        return mapToResponse(updated);
    }
    
    public List<RegistrationResponse> getPendingRegistrations() {
        return registrationRepository.findAll().stream()
                .filter(r -> r.getStatus() == Registration.RegistrationStatus.PENDING)
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }
    
    public void cancelRegistration(Long id) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        Registration registration = registrationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Registration not found"));
        
        if (!registration.getUser().getId().equals(user.getId())) {
            throw new RuntimeException("Not authorized to cancel this registration");
        }
        
        registrationRepository.delete(registration);
    }
    
    public List<RegistrationResponse> getMyEvents() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        return registrationRepository.findByUserId(user.getId()).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }
    
    public List<RegistrationResponse> getEventAttendees(Long eventId) {
        return registrationRepository.findByEventId(eventId).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }
    
    public RegistrationResponse checkInAttendee(Long id) {
        Registration registration = registrationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Registration not found"));
        
        if (registration.getStatus() != Registration.RegistrationStatus.APPROVED) {
            throw new RuntimeException("Only approved registrations can check in");
        }
        
        registration.setCheckedIn(true);
        registration.setCheckedInAt(LocalDateTime.now());
        
        Registration updated = registrationRepository.save(registration);
        return mapToResponse(updated);
    }
    
    public List<RegistrationResponse> getCheckedInAttendees(Long eventId) {
        return registrationRepository.findByEventId(eventId).stream()
                .filter(r -> r.getCheckedIn() != null && r.getCheckedIn())
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }
    
    private String generateTicketCode() {
        return "TKT-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
    }
    
    private RegistrationResponse mapToResponse(Registration registration) {
        RegistrationResponse response = new RegistrationResponse();
        response.setId(registration.getId());
        response.setUserId(registration.getUser().getId());
        response.setUserName(registration.getUser().getName());
        response.setUserEmail(registration.getUser().getEmail());
        response.setEventId(registration.getEvent().getId());
        response.setEventTitle(registration.getEvent().getTitle());
        response.setEventDate(registration.getEvent().getDate());
        response.setRegisteredAt(registration.getRegisteredAt());
        response.setStatus(registration.getStatus().name());
        response.setPaymentMethod(registration.getPaymentMethod());
        response.setPaymentProof(registration.getPaymentProof());
        response.setTicketCode(registration.getTicketCode());
        response.setApprovedAt(registration.getApprovedAt());
        response.setCheckedIn(registration.getCheckedIn());
        response.setCheckedInAt(registration.getCheckedInAt());
        
        // Calculate registration order (approved registrations only)
        if (registration.getStatus() == Registration.RegistrationStatus.APPROVED) {
            List<Registration> approvedRegs = registrationRepository.findByEventId(registration.getEvent().getId())
                .stream()
                .filter(r -> r.getStatus() == Registration.RegistrationStatus.APPROVED)
                .sorted((a, b) -> {
                    LocalDateTime timeA = a.getApprovedAt() != null ? a.getApprovedAt() : a.getRegisteredAt();
                    LocalDateTime timeB = b.getApprovedAt() != null ? b.getApprovedAt() : b.getRegisteredAt();
                    return timeA.compareTo(timeB);
                })
                .collect(Collectors.toList());
            
            for (int i = 0; i < approvedRegs.size(); i++) {
                if (approvedRegs.get(i).getId().equals(registration.getId())) {
                    response.setRegistrationOrder(i + 1);
                    break;
                }
            }
            response.setTotalAttendees((long) approvedRegs.size());
        }
        
        return response;
    }
}
