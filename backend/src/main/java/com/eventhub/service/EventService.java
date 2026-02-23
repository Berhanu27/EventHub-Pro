package com.eventhub.service;

import com.eventhub.dto.EventRequest;
import com.eventhub.dto.EventResponse;
import com.eventhub.entity.Event;
import com.eventhub.entity.User;
import com.eventhub.repository.EventRepository;
import com.eventhub.repository.RegistrationRepository;
import com.eventhub.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class EventService {
    
    private final EventRepository eventRepository;
    private final UserRepository userRepository;
    private final RegistrationRepository registrationRepository;
    
    public List<EventResponse> getAllEvents() {
        return eventRepository.findAll().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }
    
    public Page<EventResponse> getAllEventsPaginated(Pageable pageable) {
        return eventRepository.findAll(pageable)
                .map(this::mapToResponse);
    }
    
    public EventResponse getEventById(Long id) {
        Event event = eventRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Event not found"));
        return mapToResponse(event);
    }
    
    public EventResponse createEvent(EventRequest request) {
        try {
            String email = SecurityContextHolder.getContext().getAuthentication().getName();
            User user = userRepository.findByEmail(email)
                    .orElseThrow(() -> new RuntimeException("User not found"));
            
            Event event = new Event();
            event.setTitle(request.getTitle());
            event.setDescription(request.getDescription());
            event.setLocation(request.getLocation());
            event.setDate(request.getDate());
            event.setEndDate(request.getEndDate());
            event.setMaxAttendees(request.getMaxAttendees());
            event.setPrice(request.getPrice());
            event.setCategory(request.getCategory());
            event.setImageUrl(request.getImageUrl());
            event.setIsFeatured(request.getIsFeatured() != null ? request.getIsFeatured() : false);
            
            if (request.getStatus() != null && !request.getStatus().isEmpty()) {
                try {
                    event.setStatus(Event.EventStatus.valueOf(request.getStatus()));
                } catch (IllegalArgumentException e) {
                    event.setStatus(Event.EventStatus.UPCOMING);
                }
            } else {
                event.setStatus(Event.EventStatus.UPCOMING);
            }
            
            event.setCreatedBy(user);
            event.setCreatedAt(java.time.LocalDateTime.now());
            event.setUpdatedAt(java.time.LocalDateTime.now());
            
            Event saved = eventRepository.save(event);
            return mapToResponse(saved);
        } catch (Exception e) {
            throw new RuntimeException("Failed to create event: " + e.getMessage());
        }
    }
    
    public EventResponse updateEvent(Long id, EventRequest request) {
        Event event = eventRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Event not found"));
        
        event.setTitle(request.getTitle());
        event.setDescription(request.getDescription());
        event.setLocation(request.getLocation());
        event.setDate(request.getDate());
        event.setEndDate(request.getEndDate());
        event.setMaxAttendees(request.getMaxAttendees());
        event.setPrice(request.getPrice());
        event.setCategory(request.getCategory());
        event.setImageUrl(request.getImageUrl());
        event.setIsFeatured(request.getIsFeatured() != null ? request.getIsFeatured() : false);
        event.setUpdatedAt(java.time.LocalDateTime.now());
        
        if (request.getStatus() != null) {
            event.setStatus(Event.EventStatus.valueOf(request.getStatus()));
        }
        
        Event updated = eventRepository.save(event);
        return mapToResponse(updated);
    }
    
    public void deleteEvent(Long id) {
        eventRepository.deleteById(id);
    }
    
    private EventResponse mapToResponse(Event event) {
        EventResponse response = new EventResponse();
        response.setId(event.getId());
        response.setTitle(event.getTitle());
        response.setDescription(event.getDescription());
        response.setLocation(event.getLocation());
        response.setDate(event.getDate());
        response.setEndDate(event.getEndDate());
        response.setMaxAttendees(event.getMaxAttendees());
        response.setPrice(event.getPrice());
        response.setCategory(event.getCategory());
        response.setImageUrl(event.getImageUrl());
        response.setStatus(event.getStatus().name());
        response.setIsFeatured(event.getIsFeatured());
        response.setCreatedByName(event.getCreatedBy().getName());
        response.setCreatedById(event.getCreatedBy().getId());
        response.setCreatedAt(event.getCreatedAt());
        response.setUpdatedAt(event.getUpdatedAt());
        response.setCurrentAttendees(registrationRepository.countByEventId(event.getId()));
        return response;
    }
}
