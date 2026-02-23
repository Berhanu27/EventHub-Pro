package com.eventhub.repository;

import com.eventhub.entity.Review;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface ReviewRepository extends JpaRepository<Review, Long> {
    List<Review> findByEventId(Long eventId);
    
    Optional<Review> findByEventIdAndUserId(Long eventId, Long userId);
    
    @Query("SELECT AVG(r.rating) FROM Review r WHERE r.event.id = ?1")
    Double getAverageRatingByEventId(Long eventId);
    
    @Query("SELECT COUNT(r) FROM Review r WHERE r.event.id = ?1")
    Long getReviewCountByEventId(Long eventId);
    
    List<Review> findByUserIdOrderByCreatedAtDesc(Long userId);
}
