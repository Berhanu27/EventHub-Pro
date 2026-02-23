'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import SocialShare from '@/components/SocialShare';
import ReviewsSection from '@/components/ReviewsSection';
import { getEvent, registerForEvent } from '@/services/api';

export default function EventDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [event, setEvent] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [registering, setRegistering] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<number | undefined>(undefined);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Load user from localStorage
    const userData = localStorage.getItem('user');
    if (userData) {
      try {
        const user = JSON.parse(userData);
        console.log('User loaded:', user);
        setCurrentUserId(user.id);
      } catch (error) {
        console.error('Error parsing user data:', error);
      }
    }
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted) {
      fetchEvent();
    }
  }, [mounted, params.id]);

  const fetchEvent = async () => {
    try {
      setLoading(true);
      const response = await getEvent(Number(params.id));
      setEvent(response.data);
      document.title = `${response.data.title} - EventHub Pro`;
    } catch (error) {
      console.error('Error fetching event:', error);
      document.title = 'Event Details - EventHub Pro';
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async () => {
    router.push(`/events/${event.id}/register`);
  };

  if (!mounted || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Event not found</div>
      </div>
    );
  }

  const isFull = event.currentAttendees >= event.maxAttendees;
  const isPast = new Date(event.date) < new Date();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Event Header */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 mb-8">
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">{event.title}</h1>
            
            <div className="space-y-4 mb-6">
              <p className="text-gray-700 dark:text-gray-300 text-lg">{event.description}</p>
              
              <div className="border-t border-gray-200 dark:border-gray-700 pt-4 space-y-2">
                <p className="text-lg text-gray-900 dark:text-white">📍 <span className="font-semibold">Location:</span> {event.location}</p>
                <p className="text-lg text-gray-900 dark:text-white">📅 <span className="font-semibold">Date:</span> {new Date(event.date).toLocaleString()}</p>
                <p className="text-lg text-gray-900 dark:text-white">👥 <span className="font-semibold">Attendees:</span> {event.currentAttendees} / {event.maxAttendees}</p>
                {event.price && (
                  <p className="text-lg text-gray-900 dark:text-white">💰 <span className="font-semibold">Price:</span> ${event.price}</p>
                )}
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">Created by: {event.createdByName}</p>
              </div>
            </div>

            {isFull && <p className="text-red-500 font-bold text-lg mb-4">This event is full</p>}
            {isPast && <p className="text-gray-500 font-bold text-lg mb-4">This event has ended</p>}

            <div className="flex gap-4">
              <button
                onClick={() => router.back()}
                className="px-6 py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600 dark:bg-gray-700 dark:hover:bg-gray-600 font-semibold"
              >
                Back
              </button>
              
              {!isPast && !isFull && (
                <button
                  onClick={handleRegister}
                  disabled={registering}
                  className="px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:bg-gray-400 font-semibold"
                >
                  Register for Event
                </button>
              )}

              <SocialShare 
                eventId={Number(params.id)}
                eventTitle={event.title}
                eventDescription={event.description}
                eventDate={new Date(event.date).toLocaleDateString()}
              />
            </div>
          </div>

          {/* Reviews Section - Always show */}
          <ReviewsSection eventId={Number(params.id)} currentUserId={currentUserId} />
        </div>
      </div>
    </div>
  );
}
