'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import EventCard from '@/components/EventCard';
import Pagination from '@/components/Pagination';
import { getEvents } from '@/services/api';

export default function EventsPage() {
  const router = useRouter();
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const pageSize = 12;

  const categories = [
    'All',
    'Technology',
    'Business',
    'Arts & Culture',
    'Sports',
    'Education',
    'Health & Wellness',
    'Music',
    'Food & Drink',
    'Networking',
    'Other'
  ];

  useEffect(() => {
    document.title = 'Browse Events - EventHub Pro';
    fetchEvents(0);
  }, []);

  const fetchEvents = async (page: number) => {
    try {
      setLoading(true);
      const response = await getEvents(page, pageSize);
      setEvents(response.data.content || response.data);
      setTotalPages(response.data.totalPages || 1);
      setCurrentPage(page);
      window.scrollTo(0, 0);
    } catch (error) {
      console.error('Error fetching events:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredEvents = events.filter(event => {
    const matchesSearch = event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         event.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !selectedCategory || selectedCategory === 'All' || event.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Loading events...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 transition-colors">
      <Navbar />
      
      <div className="container mx-auto px-4 py-12">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
            Discover Amazing Events
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300">Find and register for events that inspire you</p>
        </div>

        {/* Search and Filter */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 mb-12 border border-gray-100 dark:border-gray-700 transition-colors">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                🔍 Search Events
              </label>
              <input
                type="text"
                placeholder="Search by title or description..."
                className="w-full px-5 py-3 border-2 border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition bg-white dark:bg-gray-700 dark:text-white"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                🏷️ Filter by Category
              </label>
              <select
                className="w-full px-5 py-3 border-2 border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition appearance-none bg-white dark:bg-gray-700 dark:text-white"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
              >
                {categories.map((cat) => (
                  <option key={cat} value={cat === 'All' ? '' : cat}>{cat}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Events Grid */}
        {filteredEvents.length === 0 ? (
          <div className="text-center py-20 bg-white dark:bg-gray-800 rounded-2xl shadow-lg transition-colors">
            <div className="text-8xl mb-6">🔍</div>
            <h2 className="text-3xl font-bold text-gray-800 dark:text-white mb-3">No events found</h2>
            <p className="text-lg text-gray-500 dark:text-gray-400">
              {searchTerm || selectedCategory 
                ? 'Try adjusting your search or filters' 
                : 'No events available yet. Check back soon!'}
            </p>
          </div>
        ) : (
          <>
            <div className="mb-6 flex items-center justify-between">
              <div className="text-lg font-semibold text-gray-700 dark:text-gray-300">
                <span className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-4 py-2 rounded-full">
                  {filteredEvents.length} {filteredEvents.length === 1 ? 'Event' : 'Events'} Found
                </span>
              </div>
            </div>
            <div className="grid grid-cols-1 gap-6">
              {filteredEvents.map((event) => (
                <EventCard key={event.id} event={event} onUpdate={() => fetchEvents(currentPage)} />
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <Pagination 
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={fetchEvents}
              />
            )}
          </>
        )}
      </div>
    </div>
  );
}
