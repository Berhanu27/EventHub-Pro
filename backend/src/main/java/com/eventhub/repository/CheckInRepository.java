package com.eventhub.repository;

import com.eventhub.entity.CheckIn;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface CheckInRepository extends JpaRepository<CheckIn, Long> {
    List<CheckIn> findByUserId(Long userId);
    List<CheckIn> findByEventId(Long eventId);
    List<CheckIn> findByUserIdAndEventId(Long userId, Long eventId);
    
    @Query("SELECT c FROM CheckIn c WHERE c.user.id = ?1 AND c.createdAt >= ?2")
    List<CheckIn> findCheckInsAfter(Long userId, LocalDateTime dateTime);
    
    @Query("SELECT COUNT(c) FROM CheckIn c WHERE c.user.id = ?1 AND c.event.id = ?2")
    long countByUserAndEvent(Long userId, Long eventId);
    
    @Query("SELECT c FROM CheckIn c WHERE c.isFlagged = true ORDER BY c.fraudScore DESC")
    List<CheckIn> findFlaggedCheckIns();
    
    List<CheckIn> findByIsFlaggedTrue();
}
