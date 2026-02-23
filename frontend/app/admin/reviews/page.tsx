/**
 * ADMIN - REVIEWS MANAGEMENT PAGE
 * Path: /admin/reviews
 * Manage all reviews across all events
 */
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import api from '@/services/api';

interface Review {
  id: number;
  userName: string;
  eventId: number;
  eventTitle?: string;
  rating: number;
  comment: string;
  createdAt: string;
  helpfulCount: number;
}

export default function AdminReviewsPage() {
  const router = useRouter();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);
  const [filterRating, setFilterRating] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    setMounted(true);
    document.title = 'Reviews Management - Admin - EventHub Pro';
    
    const userData = localStorage.getItem('user');
    if (!userData || JSON.parse(userData).role !== 'ADMIN') {
      router.push('/');
      return;
    }
    
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      // Fetch all events first
      const eventsRes = await api.get('/events?page=0&size=100');
      const events = eventsRes.data.content || eventsRes.data;

      // Fetch reviews for each event
      const allReviews: Review[] = [];
      for (const event of events) {
        try {
          const reviewsRes = await api.get(`/reviews/event/${event.id}`);
          const eventReviews = reviewsRes.data.map((review: any) => ({
            ...review,
            eventTitle: event.title
          }));
          allReviews.push(...eventReviews);
        } catch (error) {
          console.error(`Error fetching reviews for event ${event.id}:`, error);
        }
      }

      // Sort by newest first
      allReviews.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      setReviews(allReviews);
    } catch (error) {
      console.error('Error fetching reviews:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteReview = async (reviewId: number) => {
    if (!confirm('Are you sure you want to delete this review?')) return;

    try {
      await api.delete(`/reviews/${reviewId}`);
      setReviews(reviews.filter(r => r.id !== reviewId));
      alert('Review deleted successfully');
    } catch (error: any) {
      alert(error.response?.data?.error || 'Failed to delete review');
    }
  };

  const filteredReviews = reviews.filter(review => {
    const matchesRating = filterRating === null || review.rating === filterRating;
    const matchesSearch = 
      review.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      review.eventTitle?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      review.comment.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesRating && matchesSearch;
  });

  const stats = {
    total: reviews.length,
    average: reviews.length > 0 
      ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
      : 0,
    fiveStars: reviews.filter(r => r.rating === 5).length,
    fourStars: reviews.filter(r => r.rating === 4).length,
    threeStars: reviews.filter(r => r.rating === 3).length,
    twoStars: reviews.filter(r => r.rating === 2).length,
    oneStar: reviews.filter(r => r.rating === 1).length,
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Loading reviews...</div>
      </div>
    );
  }

  if (!mounted) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navbar />

      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <button
            onClick={() => router.push('/admin')}
            className="text-blue-500 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 mb-4"
          >
            ← Back to Admin Panel
          </button>
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white">📝 Reviews Management</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">Monitor and manage all user reviews</p>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-6 gap-4 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow">
            <p className="text-gray-600 dark:text-gray-400 text-sm">Total Reviews</p>
            <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">{stats.total}</p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow">
            <p className="text-gray-600 dark:text-gray-400 text-sm">Average Rating</p>
            <p className="text-3xl font-bold text-yellow-500">{stats.average}⭐</p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow">
            <p className="text-gray-600 dark:text-gray-400 text-sm">5 Stars</p>
            <p className="text-3xl font-bold text-green-600 dark:text-green-400">{stats.fiveStars}</p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow">
            <p className="text-gray-600 dark:text-gray-400 text-sm">4 Stars</p>
            <p className="text-3xl font-bold text-green-500">{stats.fourStars}</p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow">
            <p className="text-gray-600 dark:text-gray-400 text-sm">3 Stars</p>
            <p className="text-3xl font-bold text-yellow-600 dark:text-yellow-400">{stats.threeStars}</p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow">
            <p className="text-gray-600 dark:text-gray-400 text-sm">Low Ratings</p>
            <p className="text-3xl font-bold text-red-600 dark:text-red-400">{stats.twoStars + stats.oneStar}</p>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Search
              </label>
              <input
                type="text"
                placeholder="Search by user, event, or comment..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Filter by Rating
              </label>
              <select
                value={filterRating === null ? '' : filterRating}
                onChange={(e) => setFilterRating(e.target.value === '' ? null : parseInt(e.target.value))}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="">All Ratings</option>
                <option value="5">5 Stars</option>
                <option value="4">4 Stars</option>
                <option value="3">3 Stars</option>
                <option value="2">2 Stars</option>
                <option value="1">1 Star</option>
              </select>
            </div>
          </div>
        </div>

        {/* Reviews List */}
        <div className="space-y-4">
          {filteredReviews.length === 0 ? (
            <div className="bg-white dark:bg-gray-800 rounded-lg p-8 text-center">
              <p className="text-gray-500 dark:text-gray-400">No reviews found</p>
            </div>
          ) : (
            filteredReviews.map((review) => (
              <div key={review.id} className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="font-bold text-gray-900 dark:text-white">{review.userName}</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Event: {review.eventTitle}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-500">
                      {new Date(review.createdAt).toLocaleString()}
                    </p>
                  </div>
                  <button
                    onClick={() => handleDeleteReview(review.id)}
                    className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 font-semibold text-sm"
                  >
                    Delete
                  </button>
                </div>

                {/* Rating */}
                <div className="flex items-center gap-2 mb-3">
                  <div className="flex gap-1">
                    {[...Array(5)].map((_, i) => (
                      <span key={i} className={i < review.rating ? 'text-yellow-400' : 'text-gray-300'}>
                        ★
                      </span>
                    ))}
                  </div>
                  <span className="font-semibold text-gray-700 dark:text-gray-300">
                    {review.rating}/5
                  </span>
                </div>

                {/* Comment */}
                {review.comment && (
                  <p className="text-gray-700 dark:text-gray-300 mb-3">{review.comment}</p>
                )}

                {/* Helpful Count */}
                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                  <span>👍 {review.helpfulCount} people found this helpful</span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
