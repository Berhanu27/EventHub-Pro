/**
 * ADMIN DASHBOARD PAGE
 * Path: /admin
 * Main admin panel with statistics, events, and users management
 */
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Pagination from '@/components/Pagination';
import api from '@/services/api';

export default function AdminDashboard() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [stats, setStats] = useState<any>(null);
  const [events, setEvents] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [recentRegistrations, setRecentRegistrations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [mounted, setMounted] = useState(false);
  const [usersPage, setUsersPage] = useState(0);
  const [usersTotalPages, setUsersTotalPages] = useState(0);
  const usersPageSize = 20;

  useEffect(() => {
    setMounted(true);
    document.title = 'Admin Dashboard - EventHub Pro';
    
    const userData = localStorage.getItem('user');
    if (!userData) {
      router.push('/login');
      return;
    }

    const parsedUser = JSON.parse(userData);
    if (parsedUser.role !== 'ADMIN') {
      router.push('/dashboard');
      return;
    }

    setUser(parsedUser);
    fetchData();
  }, [router]);

  const fetchData = async () => {
    try {
      const [statsRes, eventsRes, usersRes] = await Promise.all([
        api.get('/users/stats'),
        api.get('/events'),
        api.get('/users', { params: { page: usersPage, size: usersPageSize } })
      ]);
      
      setStats(statsRes.data);
      setEvents(eventsRes.data.content || eventsRes.data);
      setUsers(usersRes.data.content || usersRes.data);
      setUsersTotalPages(usersRes.data.totalPages || 1);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteEvent = async (id: number) => {
    if (!confirm('Are you sure you want to delete this event?')) return;
    
    try {
      await api.delete(`/events/${id}`);
      fetchData();
      alert('Event deleted successfully!');
    } catch (error: any) {
      alert(error.response?.data?.error || 'Failed to delete event');
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
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-800 dark:text-white">Admin Dashboard</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">Manage your events, users, and view analytics</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white p-6 rounded-xl shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm font-medium">Total Users</p>
                <p className="text-4xl font-bold mt-2">{stats.totalUsers}</p>
              </div>
              <div className="text-5xl opacity-50">👥</div>
            </div>
          </div>
          
          <div className="bg-gradient-to-br from-green-500 to-green-600 text-white p-6 rounded-xl shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm font-medium">Total Events</p>
                <p className="text-4xl font-bold mt-2">{stats.totalEvents}</p>
              </div>
              <div className="text-5xl opacity-50">🎯</div>
            </div>
          </div>
          
          <div className="bg-gradient-to-br from-purple-500 to-purple-600 text-white p-6 rounded-xl shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-sm font-medium">Total Registrations</p>
                <p className="text-4xl font-bold mt-2">{stats.totalRegistrations}</p>
              </div>
              <div className="text-5xl opacity-50">📝</div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-orange-500 to-orange-600 text-white p-6 rounded-xl shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-orange-100 text-sm font-medium">Active Events</p>
                <p className="text-4xl font-bold mt-2">
                  {events.filter(e => e.status === 'UPCOMING' || e.status === 'ONGOING').length}
                </p>
              </div>
              <div className="text-5xl opacity-50">⚡</div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 mb-8 transition-colors">
          <h2 className="text-2xl font-bold mb-4 dark:text-white">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button
              onClick={() => router.push('/admin/create-event')}
              className="bg-blue-500 text-white p-4 rounded-lg hover:bg-blue-600 transition text-left"
            >
              <div className="text-3xl mb-2">➕</div>
              <div className="font-bold text-lg">Create New Event</div>
              <div className="text-sm opacity-90">Add a new event to the platform</div>
            </button>
            
            <button
              onClick={() => setActiveTab('events')}
              className="bg-green-500 text-white p-4 rounded-lg hover:bg-green-600 transition text-left"
            >
              <div className="text-3xl mb-2">📋</div>
              <div className="font-bold text-lg">Manage Events</div>
              <div className="text-sm opacity-90">View, edit, and delete events</div>
            </button>

            <button
              onClick={() => router.push('/admin/registrations')}
              className="bg-purple-500 text-white p-4 rounded-lg hover:bg-purple-600 transition text-left"
            >
              <div className="text-3xl mb-2">📋</div>
              <div className="font-bold text-lg">Pending Registrations</div>
              <div className="text-sm opacity-90">Review payment proofs</div>
            </button>
            
            <button
              onClick={() => router.push('/admin/password-resets')}
              className="bg-orange-500 text-white p-4 rounded-lg hover:bg-orange-600 transition text-left"
            >
              <div className="text-3xl mb-2">🔑</div>
              <div className="font-bold text-lg">Password Reset Requests</div>
              <div className="text-sm opacity-90">Help users reset passwords</div>
            </button>

            <button
              onClick={() => router.push('/admin/check-in')}
              className="bg-red-500 text-white p-4 rounded-lg hover:bg-red-600 transition text-left"
            >
              <div className="text-3xl mb-2">✓</div>
              <div className="font-bold text-lg">Check-in Attendees</div>
              <div className="text-sm opacity-90">Check in event attendees</div>
            </button>

            <button
              onClick={() => router.push('/admin/analytics')}
              className="bg-indigo-500 text-white p-4 rounded-lg hover:bg-indigo-600 transition text-left"
            >
              <div className="text-3xl mb-2">📊</div>
              <div className="font-bold text-lg">Analytics Dashboard</div>
              <div className="text-sm opacity-90">View event statistics</div>
            </button>

            <button
              onClick={() => router.push('/admin/reviews')}
              className="bg-pink-500 text-white p-4 rounded-lg hover:bg-pink-600 transition text-left"
            >
              <div className="text-3xl mb-2">📝</div>
              <div className="font-bold text-lg">Reviews Management</div>
              <div className="text-sm opacity-90">Monitor user reviews</div>
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden transition-colors">
          <div className="flex border-b dark:border-gray-700">
            <button
              onClick={() => setActiveTab('events')}
              className={`flex-1 py-4 px-6 font-semibold transition ${
                activeTab === 'events' 
                  ? 'bg-blue-500 text-white' 
                  : 'bg-gray-50 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600'
              }`}
            >
              📅 Events ({events.length})
            </button>
            <button
              onClick={() => setActiveTab('users')}
              className={`flex-1 py-4 px-6 font-semibold transition ${
                activeTab === 'users' 
                  ? 'bg-blue-500 text-white' 
                  : 'bg-gray-50 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600'
              }`}
            >
              👥 Users ({users.length})
            </button>
          </div>

          <div className="p-6">
            {/* Events Tab */}
            {activeTab === 'events' && (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold">All Events</h2>
                  <button
                    onClick={() => router.push('/admin/create-event')}
                    className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition"
                  >
                    + Create Event
                  </button>
                </div>
                
                {events.length === 0 ? (
                  <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                    <div className="text-6xl mb-4">📭</div>
                    <p className="text-xl">No events yet</p>
                    <button
                      onClick={() => router.push('/admin/create-event')}
                      className="mt-4 bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600"
                    >
                      Create Your First Event
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-4">
                    {events.map((event) => (
                      <div key={event.id} className="border dark:border-gray-700 rounded-lg p-4 hover:shadow-md transition bg-white dark:bg-gray-800">
                        <div className="flex items-start gap-4">
                          {event.imageUrl && (
                            <img 
                              src={event.imageUrl} 
                              alt={event.title}
                              className="w-32 h-32 object-cover rounded-lg"
                              onError={(e) => (e.currentTarget.style.display = 'none')}
                            />
                          )}
                          <div className="flex-1">
                            <div className="flex items-start justify-between">
                              <div>
                                <h3 className="text-xl font-bold">{event.title}</h3>
                                <div className="flex gap-2 mt-2">
                                  {event.category && (
                                    <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                                      {event.category}
                                    </span>
                                  )}
                                  <span className={`text-xs px-2 py-1 rounded ${
                                    event.status === 'UPCOMING' ? 'bg-green-100 text-green-800' :
                                    event.status === 'ONGOING' ? 'bg-blue-100 text-blue-800' :
                                    event.status === 'COMPLETED' ? 'bg-gray-100 text-gray-800' :
                                    'bg-red-100 text-red-800'
                                  }`}>
                                    {event.status}
                                  </span>
                                  {event.isFeatured && (
                                    <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded">
                                      ⭐ Featured
                                    </span>
                                  )}
                                </div>
                              </div>
                              <div className="flex gap-2">
                                <button
                                  onClick={() => router.push(`/events/${event.id}`)}
                                  className="text-blue-500 hover:text-blue-700 px-3 py-1 border border-blue-500 rounded"
                                >
                                  View
                                </button>
                                <button
                                  onClick={() => router.push(`/admin/events/${event.id}/attendees`)}
                                  className="text-green-500 hover:text-green-700 px-3 py-1 border border-green-500 rounded"
                                >
                                  Attendees
                                </button>
                                <button
                                  onClick={() => handleDeleteEvent(event.id)}
                                  className="text-red-500 hover:text-red-700 px-3 py-1 border border-red-500 rounded"
                                >
                                  Delete
                                </button>
                              </div>
                            </div>
                            <p className="text-gray-600 dark:text-gray-400 mt-2 line-clamp-2">{event.description}</p>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-3 text-sm">
                              <div>
                                <span className="text-gray-500">📍 Location:</span>
                                <p className="font-medium">{event.location}</p>
                              </div>
                              <div>
                                <span className="text-gray-500">📅 Date:</span>
                                <p className="font-medium">{new Date(event.date).toLocaleDateString()}</p>
                              </div>
                              <div>
                                <span className="text-gray-500">👥 Attendees:</span>
                                <p className="font-medium">{event.currentAttendees}/{event.maxAttendees}</p>
                              </div>
                              <div>
                                <span className="text-gray-500">💰 Price:</span>
                                <p className="font-medium">{event.price ? `$${event.price}` : 'Free'}</p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Users Tab */}
            {activeTab === 'users' && (
              <div>
                <h2 className="text-2xl font-bold mb-6 dark:text-white">Registered Users</h2>
                
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 dark:bg-gray-700">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">ID</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Name</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Email</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Role</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                      {users.map((user) => (
                        <tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                          <td className="px-6 py-4 whitespace-nowrap text-sm dark:text-gray-300">{user.id}</td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="font-medium text-gray-900 dark:text-white">{user.name}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{user.email}</td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              user.role === 'ADMIN' 
                                ? 'bg-red-100 text-red-800' 
                                : 'bg-green-100 text-green-800'
                            }`}>
                              {user.role}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                {usersTotalPages > 1 && (
                  <Pagination 
                    currentPage={usersPage}
                    totalPages={usersTotalPages}
                    onPageChange={(page) => {
                      setUsersPage(page);
                      setLoading(true);
                      fetchData();
                    }}
                  />
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
