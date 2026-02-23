package com.eventhub.service;

import com.eventhub.dto.ReviewRequest;
import com.eventhub.dto.ReviewResponse;
import com.eventhub.entity.Event;
import com.eventhub.entity.Review;
import com.eventhub.entity.User;
import com.eventhub.repository.EventRepository;
import com.eventhub.repository.ReviewRepository;
import com.eventhub.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ReviewService {
    
    private final ReviewRepository reviewRepository;
    private final EventRepository eventRepository;
    private final UserRepository userRepository;
    
    public ReviewResponse createReview(ReviewRequest request) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        Event event = eventRepository.findById(request.getEventId())
                .orElseThrow(() -> new RuntimeException("Event not found"));
        
        // Check if user already reviewed this event
        if (reviewRepository.findByEventIdAndUserId(event.getId(), user.getId()).isPresent()) {
            throw new RuntimeException("You have already reviewed this event");
        }
        
        Review review = new Review();
        review.setEvent(event);
        review.setUser(user);
        review.setRating(request.getRating());
        review.setComment(request.getComment());
        review.setCreatedAt(LocalDateTime.now());
        review.setUpdatedAt(LocalDateTime.now());
        
        Review saved = reviewRepository.save(review);
        return mapToResponse(saved);
    }
    
    public ReviewResponse updateReview(Long reviewId, ReviewRequest request) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        Review review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new RuntimeException("Review not found"));
        
        if (!review.getUser().getId().equals(user.getId())) {
            throw new RuntimeException("You can only edit your own reviews");
        }
        
        review.setRating(request.getRating());
        review.setComment(request.getComment());
        review.setUpdatedAt(LocalDateTime.now());
        
        Review updated = reviewRepository.save(review);
        return mapToResponse(updated);
    }
    
    public void deleteReview(Long reviewId) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        Review review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new RuntimeException("Review not found"));
        
        if (!review.getUser().getId().equals(user.getId())) {
            throw new RuntimeException("You can only delete your own reviews");
        }
        
        reviewRepository.delete(review);
    }
    
    public List<ReviewResponse> getEventReviews(Long eventId) {
        List<Review> reviews = reviewRepository.findByEventId(eventId);
        Double avgRating = reviewRepository.getAverageRatingByEventId(eventId);
        Long totalReviews = reviewRepository.getReviewCountByEventId(eventId);
        
        return reviews.stream()
                .map(review -> {
                    ReviewResponse response = mapToResponse(review);
                    response.setAverageRating(avgRating != null ? Math.round(avgRating * 10.0) / 10.0 : 0.0);
                    response.setTotalReviews(totalReviews != null ? totalReviews.intValue() : 0);
                    return response;
                })
                .collect(Collectors.toList());
    }
    
    public ReviewResponse getEventAverageRating(Long eventId) {
        Double avgRating = reviewRepository.getAverageRatingByEventId(eventId);
        Long totalReviews = reviewRepository.getReviewCountByEventId(eventId);
        
        ReviewResponse response = new ReviewResponse();
        response.setEventId(eventId);
        response.setAverageRating(avgRating != null ? Math.round(avgRating * 10.0) / 10.0 : 0.0);
        response.setTotalReviews(totalReviews != null ? totalReviews.intValue() : 0);
        return response;
    }
    
    public List<ReviewResponse> getUserReviews() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        return reviewRepository.findByUserIdOrderByCreatedAtDesc(user.getId()).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }
    
    public void markHelpful(Long reviewId) {
        Review review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new RuntimeException("Review not found"));
        
        review.setHelpfulCount((review.getHelpfulCount() != null ? review.getHelpfulCount() : 0) + 1);
        reviewRepository.save(review);
    }
    
    private ReviewResponse mapToResponse(Review review) {
        ReviewResponse response = new ReviewResponse();
        response.setId(review.getId());
        response.setEventId(review.getEvent().getId());
        response.setUserId(review.getUser().getId());
        response.setUserName(review.getUser().getName());
        response.setRating(review.getRating());
        response.setComment(review.getComment());
        response.setCreatedAt(review.getCreatedAt());
        response.setHelpfulCount(review.getHelpfulCount() != null ? review.getHelpfulCount() : 0);
        return response;
    }
}
