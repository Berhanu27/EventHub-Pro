'use client';

import { useEffect, useState } from 'react';
import api from '@/services/api';
import ReviewCard from './ReviewCard';
import ReviewForm from './ReviewForm';

interface Review {
  id: number;
  userName: string;
  rating: number;
  comment: string;
  createdAt: string;
  helpfulCount: number;
  userId: number;
}

interface ReviewsSectionProps {
  eventId: number;
  currentUserId?: number;
}

export default function ReviewsSection({ eventId, currentUserId }: ReviewsSectionProps) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [averageRating, setAverageRating] = useState(0);
  const [totalReviews, setTotalReviews] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingReview, setEditingReview] = useState<Review | null>(null);
  const [userReview, setUserReview] = useState<Review | null>(null);

  useEffect(() => {
    fetchReviews();
  }, [eventId]);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const [reviewsRes, ratingRes] = await Promise.all([
        api.get(`/reviews/event/${eventId}`),
        api.get(`/reviews/event/${eventId}/rating`)
      ]);

      setReviews(reviewsRes.data);
      setAverageRating(ratingRes.data.averageRating || 0);
      setTotalReviews(ratingRes.data.totalReviews || 0);

      // Check if current user has already reviewed
      const userReviewData = reviewsRes.data.find((r: Review) => r.userId === currentUserId);
      setUserReview(userReviewData || null);
    } catch (error) {
      console.error('Error fetching reviews:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleReviewSuccess = () => {
    setShowForm(false);
    setEditingReview(null);
    fetchReviews();
  };

  const handleDeleteReview = (id: number) => {
    setReviews(reviews.filter(r => r.id !== id));
    setUserReview(null);
    setTotalReviews(totalReviews - 1);
  };

  const handleEditReview = (review: Review) => {
    setEditingReview(review);
    setShowForm(true);
  };

  if (loading) {
    return <div className="text-center py-8">Loading reviews...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Rating Summary */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Reviews & Ratings</h2>
        
        <div className="flex items-center gap-6 mb-6">
          <div className="text-center">
            <div className="text-5xl font-bold text-yellow-400">{averageRating.toFixed(1)}</div>
            <div className="flex gap-1 justify-center mt-2">
              {[...Array(5)].map((_, i) => (
                <span key={i} className={i < Math.round(averageRating) ? 'text-yellow-400' : 'text-gray-300'}>
                  ★
                </span>
              ))}
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
              Based on {totalReviews} {totalReviews === 1 ? 'review' : 'reviews'}
            </p>
          </div>

          {/* Rating Distribution */}
          <div className="flex-1 space-y-2">
            {[5, 4, 3, 2, 1].map((star) => {
              const count = reviews.filter(r => r.rating === star).length;
              const percentage = totalReviews > 0 ? (count / totalReviews) * 100 : 0;
              return (
                <div key={star} className="flex items-center gap-2">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300 w-8">{star}★</span>
                  <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div
                      className="bg-yellow-400 h-2 rounded-full transition-all"
                      style={{ width: `${percentage}%` }}
                    ></div>
                  </div>
                  <span className="text-sm text-gray-600 dark:text-gray-400 w-8">{count}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Write Review Button */}
        {!userReview && !showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 font-semibold"
          >
            ✍️ Write a Review
          </button>
        )}
      </div>

      {/* Review Form */}
      {showForm && (
        <ReviewForm
          eventId={eventId}
          onSuccess={handleReviewSuccess}
          onCancel={() => {
            setShowForm(false);
            setEditingReview(null);
          }}
          initialReview={editingReview ? {
            id: editingReview.id,
            rating: editingReview.rating,
            comment: editingReview.comment
          } : undefined}
        />
      )}

      {/* Reviews List */}
      <div className="space-y-4">
        {reviews.length === 0 ? (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            <p>No reviews yet. Be the first to review!</p>
          </div>
        ) : (
          reviews.map((review) => (
            <ReviewCard
              key={review.id}
              review={review}
              currentUserId={currentUserId}
              onDelete={handleDeleteReview}
              onEdit={handleEditReview}
            />
          ))
        )}
      </div>
    </div>
  );
}
