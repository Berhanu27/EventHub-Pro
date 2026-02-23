package com.eventhub.repository;

import com.eventhub.entity.PasswordResetRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface PasswordResetRequestRepository extends JpaRepository<PasswordResetRequest, Long> {
    List<PasswordResetRequest> findByStatus(PasswordResetRequest.RequestStatus status);
    List<PasswordResetRequest> findByUserId(Long userId);
}
