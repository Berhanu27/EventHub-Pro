package com.eventhub.repository;

import com.eventhub.entity.Event;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface EventRepository extends JpaRepository<Event, Long> {
    List<Event> findByDateAfter(LocalDateTime date);
    List<Event> findByCreatedById(Long userId);
    List<Event> findByCategory(String category);
    List<Event> findByIsFeaturedTrue();
    List<Event> findByStatus(Event.EventStatus status);
}
