/**
 * USER DASHBOARD PAGE
 * Path: /dashboard
 * User's personal dashboard showing their registered events
 */
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import api from '@/services/api';

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [stats, setStats] = useState<any>(null);
  const [myEvents, setMyEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    document.title = 'My Dashboard - EventHub Pro';
    
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    
    if (!token) {
      router.push('/login');
      return;
    }

    if (userData) {
      const parsedUser = JSON.parse(userData);
      setUser(parsedUser);
      
      // Redirect admin to admin panel
      if (parsedUser.role === 'ADMIN') {
        router.push('/admin');
        return;
      }
    }

    fetchData();
  }, [router]);

  const fetchData = async () => {
    try {
      const eventsRes = await api.get('/registrations/my-events');
      setMyEvents(eventsRes.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelRegistration = async (id: number, eventDate: string) => {
    const eventDateTime = new Date(eventDate);
    const now = new Date();
    const hoursUntilEvent = (eventDateTime.getTime() - now.getTime()) / (1000 * 60 * 60);
    
    if (hoursUntilEvent < 24) {
      alert('Cannot cancel registration less than 24 hours before the event');
      return;
    }
    
    if (!confirm('Are you sure you want to cancel this registration?')) return;
    
    try {
      await api.delete(`/registrations/${id}`);
      setMyEvents(myEvents.filter(e => e.id !== id));
      alert('Registration cancelled successfully');
    } catch (error: any) {
      alert(error.response?.data?.error || 'Failed to cancel registration');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  if (!mounted) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 transition-colors">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6 dark:text-white">Welcome, {user?.name}!</h1>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 transition-colors">
          <h2 className="text-2xl font-bold mb-4 dark:text-white">My Registered Events</h2>
          
          {myEvents.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500 dark:text-gray-400 mb-4">You haven't registered for any events yet.</p>
              <button
                onClick={() => router.push('/events')}
                className="bg-blue-500 text-white px-6 py-2 rounded hover:bg-blue-600"
              >
                Browse Events
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {myEvents.map((registration) => {
                const eventDateTime = new Date(registration.eventDate);
                const now = new Date();
                const hoursUntilEvent = (eventDateTime.getTime() - now.getTime()) / (1000 * 60 * 60);
                const canCancel = hoursUntilEvent >= 24 && registration.status === 'PENDING';
                
                return (
                <div key={registration.id} className="border dark:border-gray-700 rounded-lg p-4 flex justify-between items-center hover:shadow-md transition bg-white dark:bg-gray-800">
                  <div className="flex-1">
                    <h3 className="font-bold text-lg dark:text-white">{registration.eventTitle}</h3>
                    <p className="text-gray-600 dark:text-gray-400">
                      📅 {new Date(registration.eventDate).toLocaleString()}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-500">
                      Registered: {new Date(registration.registeredAt).toLocaleDateString()}
                    </p>
                    <span className={`inline-block mt-2 px-3 py-1 rounded-full text-xs font-semibold ${
                      registration.status === 'APPROVED' ? 'bg-green-100 text-green-800' :
                      registration.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {registration.status}
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => router.push(`/events/${registration.eventId}`)}
                      className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                    >
                      View Details
                    </button>
                    {canCancel ? (
                      <button
                        onClick={() => handleCancelRegistration(registration.id, registration.eventDate)}
                        className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
                      >
                        Cancel
                      </button>
                    ) : (
                      <button
                        disabled
                        className="bg-gray-300 text-gray-500 px-4 py-2 rounded cursor-not-allowed"
                        title={hoursUntilEvent < 24 ? 'Cannot cancel within 24 hours of event' : 'Cannot cancel approved registration'}
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                </div>
              )})}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
