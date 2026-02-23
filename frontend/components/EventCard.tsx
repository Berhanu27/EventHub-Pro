'use client';

import { useState } from 'react';
import { registerForEvent, deleteEvent } from '@/services/api';

interface EventCardProps {
  event: any;
  onUpdate: () => void;
}

export default function EventCard({ event, onUpdate }: EventCardProps) {
  const [loading, setLoading] = useState(false);
  const user = typeof window !== 'undefined' 
    ? JSON.parse(localStorage.getItem('user') || '{}') 
    : {};

  const handleRegister = async () => {
    setLoading(true);
    try {
      await registerForEvent(event.id);
      alert('Successfully registered for event!');
      onUpdate();
    } catch (error: any) {
      alert(error.response?.data?.error || 'Failed to register');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this event?')) return;
    
    setLoading(true);
    try {
      await deleteEvent(event.id);
      alert('Event deleted successfully!');
      onUpdate();
    } catch (error: any) {
      alert(error.response?.data?.error || 'Failed to delete event');
    } finally {
      setLoading(false);
    }
  };

  const isFull = event.currentAttendees >= event.maxAttendees;
  const isPast = new Date(event.date) < new Date();
  const isFree = !event.price || event.price === 0;

  return (
    <div className="bg-white rounded-2xl shadow-xl overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
      <div className="lg:flex">
        {/* Image Section */}
        {event.imageUrl && (
          <div className="relative lg:w-2/5 h-64 lg:h-auto overflow-hidden">
            <img 
              src={event.imageUrl} 
              alt={event.title} 
              className="w-full h-full object-cover transition-transform duration-300 hover:scale-110"
              onError={(e) => {
                e.currentTarget.src = 'https://via.placeholder.com/400x300?text=Event+Image';
              }}
            />
            {event.isFeatured && (
              <div className="absolute top-4 right-4 bg-yellow-400 text-yellow-900 px-3 py-1 rounded-full text-sm font-bold shadow-lg">
                ⭐ Featured
              </div>
            )}
            {isFull && (
              <div className="absolute top-4 left-4 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-bold shadow-lg">
                🔒 Full
              </div>
            )}
          </div>
        )}
        
        {/* Content Section */}
        <div className="p-6 lg:w-3/5 flex flex-col">
          <div className="flex-1">
            <div className="flex justify-between items-start mb-3">
              <h3 className="text-2xl font-bold text-gray-800 line-clamp-1">{event.title}</h3>
            </div>
            
            {event.category && (
              <span className="inline-block bg-gradient-to-r from-blue-500 to-purple-500 text-white text-xs px-3 py-1 rounded-full mb-3 font-semibold">
                {event.category}
              </span>
            )}
            
            <p className="text-gray-600 mb-4 line-clamp-2">{event.description}</p>
            
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="flex items-center text-gray-700">
                <span className="text-xl mr-2">📍</span>
                <span className="text-sm font-medium truncate">{event.location}</span>
              </div>
              <div className="flex items-center text-gray-700">
                <span className="text-xl mr-2">👥</span>
                <span className="text-sm font-medium">
                  {event.currentAttendees} / {event.maxAttendees}
                </span>
              </div>
              <div className="flex items-center text-gray-700 col-span-2">
                <span className="text-xl mr-2">📅</span>
                <span className="text-sm font-medium">{new Date(event.date).toLocaleDateString('en-US', { 
                  weekday: 'short', 
                  year: 'numeric', 
                  month: 'short', 
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}</span>
              </div>
              <div className="flex items-center col-span-2">
                <span className="text-xl mr-2">💰</span>
                <span className="text-2xl font-bold text-green-600">
                  {isFree ? 'FREE' : `$${event.price}`}
                </span>
              </div>
            </div>
          </div>

          {isPast && (
            <div className="bg-gray-100 text-gray-600 text-center py-2 rounded-lg mb-3 font-semibold">
              Event Ended
            </div>
          )}

          <div className="flex gap-2 mt-auto">
            <button
              onClick={() => window.location.href = `/events/${event.id}`}
              className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 text-white py-3 rounded-xl hover:from-blue-600 hover:to-blue-700 transition font-semibold shadow-md"
            >
              View Details
            </button>
            
            {user.role === 'ADMIN' && (
              <button
                onClick={handleDelete}
                disabled={loading}
                className="px-4 bg-red-500 text-white py-3 rounded-xl hover:bg-red-600 disabled:bg-gray-400 transition font-semibold shadow-md"
              >
                🗑️
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
