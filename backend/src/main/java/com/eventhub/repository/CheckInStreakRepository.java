package com.eventhub.repository;

import com.eventhub.entity.CheckInStreak;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface CheckInStreakRepository extends JpaRepository<CheckInStreak, Long> {
    Optional<CheckInStreak> findByUserId(Long userId);
}
