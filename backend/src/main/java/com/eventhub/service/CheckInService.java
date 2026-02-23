package com.eventhub.service;

import com.eventhub.dto.BadgeResponse;
import com.eventhub.dto.CheckInRequest;
import com.eventhub.dto.CheckInResponse;
import com.eventhub.entity.*;
import com.eventhub.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CheckInService {
    
    private final CheckInRepository checkInRepository;
    private final BadgeRepository badgeRepository;
    private final CheckInStreakRepository streakRepository;
    private final UserRepository userRepository;
    private final EventRepository eventRepository;
    private final RegistrationRepository registrationRepository;
    
    // GPS verification radius in meters (100 meters)
    private static final double GPS_RADIUS = 100.0;
    
    public CheckInResponse checkIn(CheckInRequest request) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        Event event = eventRepository.findById(request.getEventId())
                .orElseThrow(() -> new RuntimeException("Event not found"));
        
        // Verify user is registered for this event
        Registration registration = registrationRepository.findByUserIdAndEventId(user.getId(), event.getId())
                .orElseThrow(() -> new RuntimeException("Not registered for this event"));
        
        if (registration.getStatus() != Registration.RegistrationStatus.APPROVED) {
            throw new RuntimeException("Registration not approved");
        }
        
        // Check if already checked in for this specific event today
        LocalDateTime startOfDay = LocalDate.now().atStartOfDay();
        List<CheckIn> todayCheckIns = checkInRepository.findCheckInsAfter(user.getId(), startOfDay);
        boolean alreadyCheckedInToday = todayCheckIns.stream()
                .anyMatch(ci -> ci.getEvent().getId().equals(event.getId()));
        if (alreadyCheckedInToday) {
            throw new RuntimeException("Already checked in today for this event");
        }
        
        return performCheckIn(user, event, request);
    }
    
    public CheckInResponse adminCheckIn(Long registrationId, CheckInRequest request) {
        Registration registration = registrationRepository.findById(registrationId)
                .orElseThrow(() -> new RuntimeException("Registration not found"));
        
        User user = registration.getUser();
        Event event = registration.getEvent();
        
        if (registration.getStatus() != Registration.RegistrationStatus.APPROVED) {
            throw new RuntimeException("Registration not approved");
        }
        
        // Check if already checked in for this specific event today
        LocalDateTime startOfDay = LocalDate.now().atStartOfDay();
        List<CheckIn> todayCheckIns = checkInRepository.findCheckInsAfter(user.getId(), startOfDay);
        boolean alreadyCheckedInToday = todayCheckIns.stream()
                .anyMatch(ci -> ci.getEvent().getId().equals(event.getId()));
        if (alreadyCheckedInToday) {
            throw new RuntimeException("Already checked in today for this event");
        }
        
        return performCheckIn(user, event, request);
    }
    
    private CheckInResponse performCheckIn(User user, Event event, CheckInRequest request) {
        // Create check-in
        CheckIn checkIn = new CheckIn();
        checkIn.setUser(user);
        checkIn.setEvent(event);
        checkIn.setLatitude(request.getLatitude());
        checkIn.setLongitude(request.getLongitude());
        checkIn.setDeviceInfo(request.getDeviceInfo());
        checkIn.setVerificationMethod(request.getVerificationMethod());
        
        // Verify location if GPS provided
        if (request.getLatitude() != null && request.getLongitude() != null) {
            boolean isLocationValid = verifyLocation(event, request.getLatitude(), request.getLongitude());
            checkIn.setIsVerified(isLocationValid);
            
            if (!isLocationValid) {
                checkIn.setFlagReason("Location mismatch");
                checkIn.setFraudScore(50.0);
            }
        }
        
        // Fraud detection
        double fraudScore = calculateFraudScore(user, checkIn);
        checkIn.setFraudScore(fraudScore);
        checkIn.setIsFlagged(fraudScore > 70.0);
        
        CheckIn saved = checkInRepository.save(checkIn);
        
        // Update streak
        updateStreak(user);
        
        // Check for badges
        List<BadgeResponse> newBadges = checkForBadges(user);
        
        return mapToResponse(saved, newBadges);
    }
    
    private boolean verifyLocation(Event event, Double latitude, Double longitude) {
        if (event.getLatitude() == null || event.getLongitude() == null) {
            return true; // No location set for event
        }
        
        double distance = calculateDistance(
            event.getLatitude(), event.getLongitude(),
            latitude, longitude
        );
        
        return distance <= GPS_RADIUS;
    }
    
    private double calculateDistance(double lat1, double lon1, double lat2, double lon2) {
        final int R = 6371; // Earth's radius in km
        double latDistance = Math.toRadians(lat2 - lat1);
        double lonDistance = Math.toRadians(lon2 - lon1);
        double a = Math.sin(latDistance / 2) * Math.sin(latDistance / 2)
                + Math.cos(Math.toRadians(lat1)) * Math.cos(Math.toRadians(lat2))
                * Math.sin(lonDistance / 2) * Math.sin(lonDistance / 2);
        double c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c * 1000; // Convert to meters
    }
    
    private double calculateFraudScore(User user, CheckIn checkIn) {
        double score = 0.0;
        
        // Check for multiple check-ins in short time
        LocalDateTime oneHourAgo = LocalDateTime.now().minusHours(1);
        long recentCheckIns = checkInRepository.findCheckInsAfter(user.getId(), oneHourAgo).size();
        if (recentCheckIns > 3) {
            score += 30.0; // Suspicious activity
        }
        
        // Check for impossible travel (multiple events far apart in short time)
        List<CheckIn> lastCheckIns = checkInRepository.findByUserId(user.getId());
        if (!lastCheckIns.isEmpty()) {
            CheckIn lastCheckIn = lastCheckIns.get(lastCheckIns.size() - 1);
            long minutesDiff = java.time.temporal.ChronoUnit.MINUTES.between(lastCheckIn.getCreatedAt(), LocalDateTime.now());
            
            if (lastCheckIn.getLatitude() != null && checkIn.getLatitude() != null) {
                double distance = calculateDistance(
                    lastCheckIn.getLatitude(), lastCheckIn.getLongitude(),
                    checkIn.getLatitude(), checkIn.getLongitude()
                );
                
                // If more than 100km in less than 1 hour
                if (distance > 100000 && minutesDiff < 60) {
                    score += 40.0;
                }
            }
        }
        
        // Location verification
        if (checkIn.getIsVerified() != null && !checkIn.getIsVerified()) {
            score += 20.0;
        }
        
        return Math.min(score, 100.0);
    }
    
    private void updateStreak(User user) {
        CheckInStreak streak = streakRepository.findByUserId(user.getId())
                .orElse(new CheckInStreak());
        
        LocalDate today = LocalDate.now();
        LocalDate lastCheckIn = streak.getLastCheckInDate();
        
        if (lastCheckIn == null) {
            // First check-in
            streak.setCurrentStreak(1);
            streak.setLongestStreak(1);
        } else if (lastCheckIn.equals(today.minusDays(1))) {
            // Consecutive day
            streak.setCurrentStreak(streak.getCurrentStreak() + 1);
            if (streak.getCurrentStreak() > streak.getLongestStreak()) {
                streak.setLongestStreak(streak.getCurrentStreak());
            }
        } else if (!lastCheckIn.equals(today)) {
            // Streak broken
            streak.setCurrentStreak(1);
        }
        
        streak.setLastCheckInDate(today);
        streak.setTotalCheckIns(streak.getTotalCheckIns() + 1);
        streak.setTotalPoints(streak.getTotalPoints() + 10); // 10 points per check-in
        streak.setUser(user);
        
        streakRepository.save(streak);
    }
    
    private List<BadgeResponse> checkForBadges(User user) {
        List<BadgeResponse> newBadges = new ArrayList<>();
        CheckInStreak streak = streakRepository.findByUserId(user.getId()).orElse(null);
        
        if (streak == null) return newBadges;
        
        // First check-in badge
        if (streak.getTotalCheckIns() == 1 && !badgeRepository.existsByUserIdAndBadgeType(user.getId(), "FIRST_CHECKIN")) {
            Badge badge = createBadge(user, "FIRST_CHECKIN", "First Check-in", "You've checked in for the first time!", "🎉", 50);
            newBadges.add(mapBadgeToResponse(badge));
        }
        
        // Streak badges
        if (streak.getCurrentStreak() == 5 && !badgeRepository.existsByUserIdAndBadgeType(user.getId(), "STREAK_5")) {
            Badge badge = createBadge(user, "STREAK_5", "5-Day Streak", "5 consecutive check-ins!", "🔥", 100);
            newBadges.add(mapBadgeToResponse(badge));
        }
        
        if (streak.getCurrentStreak() == 10 && !badgeRepository.existsByUserIdAndBadgeType(user.getId(), "STREAK_10")) {
            Badge badge = createBadge(user, "STREAK_10", "10-Day Streak", "10 consecutive check-ins!", "🌟", 200);
            newBadges.add(mapBadgeToResponse(badge));
        }
        
        if (streak.getCurrentStreak() == 30 && !badgeRepository.existsByUserIdAndBadgeType(user.getId(), "STREAK_30")) {
            Badge badge = createBadge(user, "STREAK_30", "30-Day Streak", "30 consecutive check-ins!", "👑", 500);
            newBadges.add(mapBadgeToResponse(badge));
        }
        
        return newBadges;
    }
    
    private Badge createBadge(User user, String type, String name, String description, String icon, Integer points) {
        Badge badge = new Badge();
        badge.setUser(user);
        badge.setBadgeType(type);
        badge.setBadgeName(name);
        badge.setBadgeDescription(description);
        badge.setBadgeIcon(icon);
        badge.setPoints(points);
        return badgeRepository.save(badge);
    }
    
    private CheckInResponse mapToResponse(CheckIn checkIn, List<BadgeResponse> newBadges) {
        CheckInResponse response = new CheckInResponse();
        response.setId(checkIn.getId());
        response.setUserId(checkIn.getUser().getId());
        response.setEventId(checkIn.getEvent().getId());
        response.setCreatedAt(checkIn.getCreatedAt());
        response.setLatitude(checkIn.getLatitude());
        response.setLongitude(checkIn.getLongitude());
        response.setIsVerified(checkIn.getIsVerified());
        response.setVerificationMethod(checkIn.getVerificationMethod());
        response.setFraudScore(checkIn.getFraudScore());
        response.setIsFlagged(checkIn.getIsFlagged());
        response.setFlagReason(checkIn.getFlagReason());
        response.setNewBadges(newBadges);
        
        CheckInStreak streak = streakRepository.findByUserId(checkIn.getUser().getId()).orElse(null);
        if (streak != null) {
            response.setCurrentStreak(streak.getCurrentStreak());
            response.setTotalCheckIns(streak.getTotalCheckIns());
            response.setTotalPoints(streak.getTotalPoints());
        }
        
        return response;
    }
    
    private BadgeResponse mapBadgeToResponse(Badge badge) {
        BadgeResponse response = new BadgeResponse();
        response.setId(badge.getId());
        response.setBadgeType(badge.getBadgeType());
        response.setBadgeName(badge.getBadgeName());
        response.setBadgeDescription(badge.getBadgeDescription());
        response.setBadgeIcon(badge.getBadgeIcon());
        response.setEarnedAt(badge.getEarnedAt());
        response.setPoints(badge.getPoints());
        return response;
    }

    public Map<String, Object> getUserStats() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        CheckInStreak streak = streakRepository.findByUserId(user.getId()).orElse(null);
        
        Map<String, Object> stats = new HashMap<>();
        if (streak != null) {
            stats.put("totalCheckIns", streak.getTotalCheckIns());
            stats.put("currentStreak", streak.getCurrentStreak());
            stats.put("longestStreak", streak.getLongestStreak());
            stats.put("totalPoints", streak.getTotalPoints());
            stats.put("lastCheckInDate", streak.getLastCheckInDate());
        } else {
            stats.put("totalCheckIns", 0);
            stats.put("currentStreak", 0);
            stats.put("longestStreak", 0);
            stats.put("totalPoints", 0);
            stats.put("lastCheckInDate", null);
        }
        
        return stats;
    }
    
    public List<BadgeResponse> getUserBadges() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        return badgeRepository.findByUserId(user.getId()).stream()
                .map(this::mapBadgeToResponse)
                .collect(Collectors.toList());
    }
    
    public List<Map<String, Object>> getLeaderboard() {
        return streakRepository.findAll().stream()
                .sorted((a, b) -> b.getTotalPoints().compareTo(a.getTotalPoints()))
                .limit(100)
                .map(streak -> {
                    Map<String, Object> entry = new HashMap<>();
                    entry.put("userId", streak.getUser().getId());
                    entry.put("userName", streak.getUser().getName());
                    entry.put("totalPoints", streak.getTotalPoints());
                    entry.put("currentStreak", streak.getCurrentStreak());
                    entry.put("longestStreak", streak.getLongestStreak());
                    entry.put("totalCheckIns", streak.getTotalCheckIns());
                    return entry;
                })
                .collect(Collectors.toList());
    }
    
    public List<CheckInResponse> getEventCheckIns(Long eventId) {
        Event event = eventRepository.findById(eventId)
                .orElseThrow(() -> new RuntimeException("Event not found"));
        
        return checkInRepository.findByEventId(eventId).stream()
                .map(checkIn -> mapToResponse(checkIn, new ArrayList<>()))
                .collect(Collectors.toList());
    }
    
    public List<CheckInResponse> getFlaggedCheckIns() {
        return checkInRepository.findByIsFlaggedTrue().stream()
                .map(checkIn -> mapToResponse(checkIn, new ArrayList<>()))
                .collect(Collectors.toList());
    }
}
