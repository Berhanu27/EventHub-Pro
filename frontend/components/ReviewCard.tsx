'use client';

import { useState } from 'react';
import api from '@/services/api';

interface Review {
  id: number;
  userName: string;
  rating: number;
  comment: string;
  createdAt: string;
  helpfulCount: number;
  userId: number;
}

interface ReviewCardProps {
  review: Review;
  currentUserId?: number;
  onDelete?: (id: number) => void;
  onEdit?: (review: Review) => void;
}

export default function ReviewCard({ review, currentUserId, onDelete, onEdit }: ReviewCardProps) {
  const [helpful, setHelpful] = useState(review.helpfulCount);
  const [isMarking, setIsMarking] = useState(false);

  const handleMarkHelpful = async () => {
    try {
      setIsMarking(true);
      await api.post(`/reviews/${review.id}/helpful`);
      setHelpful(helpful + 1);
    } catch (error) {
      console.error('Error marking helpful:', error);
    } finally {
      setIsMarking(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this review?')) return;
    try {
      await api.delete(`/reviews/${review.id}`);
      onDelete?.(review.id);
    } catch (error) {
      console.error('Error deleting review:', error);
    }
  };

  const isOwner = currentUserId === review.userId;
  const createdDate = new Date(review.createdAt).toLocaleDateString();

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
      <div className="flex justify-between items-start mb-3">
        <div>
          <p className="font-semibold text-gray-900 dark:text-white">{review.userName}</p>
          <p className="text-sm text-gray-500 dark:text-gray-400">{createdDate}</p>
        </div>
        {isOwner && (
          <div className="flex gap-2">
            <button
              onClick={() => onEdit?.(review)}
              className="text-blue-500 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 text-sm"
            >
              Edit
            </button>
            <button
              onClick={handleDelete}
              className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 text-sm"
            >
              Delete
            </button>
          </div>
        )}
      </div>

      {/* Rating Stars */}
      <div className="flex items-center gap-2 mb-2">
        <div className="flex gap-1">
          {[...Array(5)].map((_, i) => (
            <span key={i} className={i < review.rating ? 'text-yellow-400' : 'text-gray-300'}>
              ★
            </span>
          ))}
        </div>
        <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
          {review.rating}/5
        </span>
      </div>

      {/* Comment */}
      {review.comment && (
        <p className="text-gray-700 dark:text-gray-300 mb-3">{review.comment}</p>
      )}

      {/* Helpful Button */}
      <button
        onClick={handleMarkHelpful}
        disabled={isMarking}
        className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 disabled:opacity-50"
      >
        👍 Helpful ({helpful})
      </button>
    </div>
  );
}
