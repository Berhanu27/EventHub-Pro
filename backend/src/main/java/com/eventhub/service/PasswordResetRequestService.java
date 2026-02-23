package com.eventhub.service;

import com.eventhub.dto.ApprovePasswordResetRequest;
import com.eventhub.dto.CreatePasswordResetRequest;
import com.eventhub.dto.PasswordResetRequestDto;
import com.eventhub.entity.PasswordResetRequest;
import com.eventhub.entity.User;
import com.eventhub.repository.PasswordResetRequestRepository;
import com.eventhub.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PasswordResetRequestService {
    
    private final PasswordResetRequestRepository resetRequestRepository;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    
    @Transactional
    public PasswordResetRequestDto createRequest(CreatePasswordResetRequest request) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        if ("ADMIN".equals(user.getRole())) {
            throw new RuntimeException("Admin accounts cannot request password reset");
        }
        
        PasswordResetRequest resetRequest = new PasswordResetRequest();
        resetRequest.setUser(user);
        resetRequest.setReason(request.getReason());
        resetRequest.setStatus(PasswordResetRequest.RequestStatus.PENDING);
        
        PasswordResetRequest saved = resetRequestRepository.save(resetRequest);
        return mapToDto(saved);
    }
    
    public List<PasswordResetRequestDto> getPendingRequests() {
        return resetRequestRepository.findByStatus(PasswordResetRequest.RequestStatus.PENDING)
                .stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }
    
    @Transactional
    public PasswordResetRequestDto approveRequest(Long id) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User admin = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        PasswordResetRequest resetRequest = resetRequestRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Request not found"));
        
        resetRequest.setStatus(PasswordResetRequest.RequestStatus.APPROVED);
        resetRequest.setProcessedAt(LocalDateTime.now());
        resetRequest.setProcessedBy(admin.getId());
        
        PasswordResetRequest updated = resetRequestRepository.save(resetRequest);
        return mapToDto(updated);
    }
    
    @Transactional
    public PasswordResetRequestDto rejectRequest(Long id) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User admin = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        PasswordResetRequest resetRequest = resetRequestRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Request not found"));
        
        resetRequest.setStatus(PasswordResetRequest.RequestStatus.REJECTED);
        resetRequest.setProcessedAt(LocalDateTime.now());
        resetRequest.setProcessedBy(admin.getId());
        
        PasswordResetRequest updated = resetRequestRepository.save(resetRequest);
        return mapToDto(updated);
    }
    
    public List<PasswordResetRequestDto> getMyRequests() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        return resetRequestRepository.findByUserId(user.getId())
                .stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }
    
    @Transactional
    public void setNewPassword(String email, String newPassword) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        // Check if user has an approved reset request that hasn't been used
        List<PasswordResetRequest> approvedRequests = resetRequestRepository.findByUserId(user.getId())
                .stream()
                .filter(r -> r.getStatus() == PasswordResetRequest.RequestStatus.APPROVED)
                .filter(r -> !r.getPasswordChanged())
                .collect(Collectors.toList());
        
        if (approvedRequests.isEmpty()) {
            throw new RuntimeException("No approved password reset request found");
        }
        
        // Update password
        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);
        
        // Mark all approved requests as used
        approvedRequests.forEach(req -> {
            req.setPasswordChanged(true);
            resetRequestRepository.save(req);
        });
    }
    
    public boolean hasApprovedRequest(String email) {
        User user = userRepository.findByEmail(email).orElse(null);
        if (user == null) return false;
        
        return resetRequestRepository.findByUserId(user.getId())
                .stream()
                .anyMatch(r -> r.getStatus() == PasswordResetRequest.RequestStatus.APPROVED 
                            && !r.getPasswordChanged());
    }
    
    private PasswordResetRequestDto mapToDto(PasswordResetRequest request) {
        PasswordResetRequestDto dto = new PasswordResetRequestDto();
        dto.setId(request.getId());
        dto.setUserId(request.getUser().getId());
        dto.setUserName(request.getUser().getName());
        dto.setUserEmail(request.getUser().getEmail());
        dto.setReason(request.getReason());
        dto.setRequestedAt(request.getRequestedAt());
        dto.setStatus(request.getStatus().name());
        return dto;
    }
}
