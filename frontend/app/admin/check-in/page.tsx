/**
 * ADMIN - CHECK-IN PAGE
 * Path: /admin/check-in
 * Advanced check-in system with GPS verification, badges, and fraud detection
 */
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import api from '@/services/api';

interface CheckInResult {
  id: number;
  userId: number;
  eventId: number;
  createdAt: string;
  isVerified: boolean;
  verificationMethod: string;
  fraudScore: number;
  isFlagged: boolean;
  flagReason?: string;
  currentStreak: number;
  totalCheckIns: number;
  totalPoints: number;
  newBadges: Badge[];
}

interface Badge {
  id: number;
  badgeType: string;
  badgeName: string;
  badgeDescription: string;
  badgeIcon: string;
  earnedAt: string;
  points: number;
}

export default function CheckInPage() {
  const router = useRouter();
  const [events, setEvents] = useState<any[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<string>('');
  const [attendees, setAttendees] = useState<any[]>([]);
  const [checkedInCount, setCheckedInCount] = useState(0);
  const [searchCode, setSearchCode] = useState('');
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);
  const [lastCheckInResult, setLastCheckInResult] = useState<CheckInResult | null>(null);
  const [lastCheckedInAttendee, setLastCheckedInAttendee] = useState<any>(null);
  const [showCheckInModal, setShowCheckInModal] = useState(false);

  useEffect(() => {
    setMounted(true);
    document.title = 'Check-in - Admin - EventHub Pro';
    
    const userData = localStorage.getItem('user');
    if (!userData || JSON.parse(userData).role !== 'ADMIN') {
      router.push('/');
      return;
    }
    
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const response = await api.get('/events');
      setEvents(response.data.content || response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching events:', error);
      setLoading(false);
    }
  };

  const handleEventSelect = async (eventId: string) => {
    setSelectedEvent(eventId);
    setSearchCode('');
    
    try {
      // Fetch registrations for the event
      const response = await api.get(`/registrations/event/${eventId}/attendees`);
      const attendeesList = response.data;
      
      // Fetch check-ins for the event to get advanced check-in data
      try {
        const checkInsResponse = await api.get(`/check-in/event/${eventId}/check-ins`);
        const checkIns = checkInsResponse.data;
        
        // Map check-in data to attendees
        const attendeesWithCheckInData = attendeesList.map((attendee: any) => {
          const checkInData = checkIns.find((ci: any) => ci.userId === attendee.userId);
          return {
            ...attendee,
            checkInData: checkInData || null,
            isAdvancedCheckIn: !!checkInData
          };
        });
        
        setAttendees(attendeesWithCheckInData);
        const checked = attendeesWithCheckInData.filter((a: any) => a.isAdvancedCheckIn).length;
        setCheckedInCount(checked);
      } catch (error) {
        // Fallback to basic check-in data if advanced check-in endpoint fails
        setAttendees(attendeesList);
        const checked = attendeesList.filter((a: any) => a.checkedIn).length;
        setCheckedInCount(checked);
      }
    } catch (error) {
      console.error('Error fetching attendees:', error);
    }
  };

  const handleCheckIn = async (registrationId: number) => {
    try {
      // Find the attendee being checked in
      const attendee = attendees.find(a => a.id === registrationId);
      if (!attendee) {
        alert('Attendee not found');
        return;
      }

      // Get user's current location if available
      let latitude: number | undefined;
      let longitude: number | undefined;

      if (navigator.geolocation) {
        try {
          const position = await new Promise<GeolocationPosition>((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(resolve, reject);
          });
          latitude = position.coords.latitude;
          longitude = position.coords.longitude;
        } catch (error) {
          console.log('GPS not available, proceeding without location');
        }
      }

      const checkInRequest = {
        eventId: parseInt(selectedEvent),
        latitude,
        longitude,
        deviceInfo: navigator.userAgent,
        verificationMethod: 'MANUAL'
      };

      // Use admin check-in endpoint with registration ID
      const response = await api.post(`/check-in/admin/${registrationId}`, checkInRequest);
      const result: CheckInResult = response.data;
      
      setLastCheckInResult(result);
      setLastCheckedInAttendee(attendee);
      setShowCheckInModal(true);

      // Refresh the attendee list to show updated check-in status
      const updatedResponse = await api.get(`/check-in/event/${selectedEvent}/check-ins`);
      const checkIns = updatedResponse.data;
      
      setAttendees(prevAttendees => 
        prevAttendees.map(a => {
          const checkInData = checkIns.find((ci: any) => ci.userId === a.userId);
          return {
            ...a,
            checkInData: checkInData || a.checkInData,
            isAdvancedCheckIn: !!checkInData
          };
        })
      );
      
      setCheckedInCount(prev => prev + 1);
      setSearchCode('');

      // Auto-close modal after 3 seconds
      setTimeout(() => setShowCheckInModal(false), 3000);
    } catch (error: any) {
      alert(error.response?.data?.error || 'Failed to check in attendee');
    }
  };

  const handleSearchAndCheckIn = () => {
    if (!searchCode.trim()) return;
    
    const attendee = attendees.find(a => 
      a.ticketCode === searchCode.toUpperCase() || 
      a.ticketCode === `TKT-${searchCode.toUpperCase()}`
    );
    
    if (!attendee) {
      alert('Ticket code not found');
      return;
    }
    
    if (attendee.checkedIn) {
      alert('This attendee has already checked in');
      return;
    }
    
    handleCheckIn(attendee.id);
  };

  const filteredAttendees = attendees.filter(a => 
    a.userName.toLowerCase().includes(searchCode.toLowerCase()) ||
    a.userEmail.toLowerCase().includes(searchCode.toLowerCase()) ||
    a.ticketCode?.includes(searchCode.toUpperCase())
  );

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
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white">Event Check-in</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">Advanced check-in with GPS verification, badges & streaks</p>
        </div>

        {/* Event Selection */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 mb-8">
          <label className="block text-lg font-bold text-gray-900 dark:text-white mb-4">
            Select Event
          </label>
          <select
            value={selectedEvent}
            onChange={(e) => handleEventSelect(e.target.value)}
            className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 dark:text-white"
          >
            <option value="">-- Choose an event --</option>
            {events.map((event) => (
              <option key={event.id} value={event.id}>
                {event.title} - {new Date(event.date).toLocaleDateString()}
              </option>
            ))}
          </select>
        </div>

        {selectedEvent && (
          <>
            {/* Check-in Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white p-6 rounded-xl shadow-lg">
                <p className="text-blue-100 text-sm font-medium">Total Attendees</p>
                <p className="text-4xl font-bold mt-2">{attendees.length}</p>
              </div>
              
              <div className="bg-gradient-to-br from-green-500 to-green-600 text-white p-6 rounded-xl shadow-lg">
                <p className="text-green-100 text-sm font-medium">Checked In</p>
                <p className="text-4xl font-bold mt-2">{checkedInCount}</p>
              </div>
              
              <div className="bg-gradient-to-br from-orange-500 to-orange-600 text-white p-6 rounded-xl shadow-lg">
                <p className="text-orange-100 text-sm font-medium">Remaining</p>
                <p className="text-4xl font-bold mt-2">{attendees.length - checkedInCount}</p>
              </div>
            </div>

            {/* Search/Check-in */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 mb-8">
              <label className="block text-lg font-bold text-gray-900 dark:text-white mb-4">
                🔍 Search by Name, Email, or Ticket Code
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Enter ticket code, name, or email..."
                  value={searchCode}
                  onChange={(e) => setSearchCode(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearchAndCheckIn()}
                  className="flex-1 px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 dark:text-white"
                />
                <button
                  onClick={handleSearchAndCheckIn}
                  className="bg-blue-500 text-white px-6 py-3 rounded-xl hover:bg-blue-600 font-semibold"
                >
                  Search
                </button>
              </div>
            </div>

            {/* Attendees List */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 dark:bg-gray-700">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Name</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Email</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Ticket Code</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                    {filteredAttendees.map((attendee) => (
                      <tr key={attendee.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="font-medium text-gray-900 dark:text-white">{attendee.userName}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                          {attendee.userEmail}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-900 dark:text-white">
                          {attendee.ticketCode}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {attendee.isAdvancedCheckIn ? (
                            <span className="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                              ✓ Checked In
                            </span>
                          ) : attendee.checkedIn ? (
                            <span className="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                              ✓ Checked In
                            </span>
                          ) : (
                            <span className="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
                              Pending
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {!attendee.isAdvancedCheckIn && !attendee.checkedIn ? (
                            <button
                              onClick={() => handleCheckIn(attendee.id)}
                              className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 font-semibold"
                            >
                              Check In
                            </button>
                          ) : (
                            <span className="text-gray-500 dark:text-gray-400 text-sm">
                              {attendee.checkInData?.createdAt 
                                ? new Date(attendee.checkInData.createdAt).toLocaleTimeString()
                                : attendee.checkedInAt
                                ? new Date(attendee.checkedInAt).toLocaleTimeString()
                                : 'Checked In'}
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {filteredAttendees.length === 0 && (
                <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                  <p className="text-lg">No attendees found</p>
                </div>
              )}
            </div>
          </>
        )}
      </div>

      {/* Check-in Result Modal */}
      {showCheckInModal && lastCheckInResult && lastCheckedInAttendee && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8 max-w-md w-full mx-4">
            <div className="text-center">
              {lastCheckInResult.isFlagged ? (
                <div className="text-5xl mb-4">⚠️</div>
              ) : (
                <div className="text-5xl mb-4">✅</div>
              )}
              
              {/* Attendee Name - Main Focus */}
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                {lastCheckedInAttendee.userName}
              </h2>
              
              <p className="text-lg font-semibold text-green-600 dark:text-green-400 mb-4">
                Checked In Successfully!
              </p>

              {lastCheckInResult.isFlagged && (
                <p className="text-red-600 dark:text-red-400 mb-4 text-sm">
                  ⚠️ Fraud Score: {lastCheckInResult.fraudScore.toFixed(1)}/100
                  {lastCheckInResult.flagReason && ` - ${lastCheckInResult.flagReason}`}
                </p>
              )}

              {lastCheckInResult.isVerified && (
                <p className="text-green-600 dark:text-green-400 mb-4 text-sm">
                  ✓ Location verified
                </p>
              )}

              {/* Streak Info */}
              <div className="bg-blue-50 dark:bg-blue-900 rounded-lg p-4 mb-4">
                <p className="text-sm text-gray-600 dark:text-gray-300">Current Streak</p>
                <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                  🔥 {lastCheckInResult.currentStreak} days
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                  Total Check-ins: {lastCheckInResult.totalCheckIns} | Points: {lastCheckInResult.totalPoints}
                </p>
              </div>

              {/* New Badges */}
              {lastCheckInResult.newBadges.length > 0 && (
                <div className="bg-yellow-50 dark:bg-yellow-900 rounded-lg p-4 mb-4">
                  <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">🎉 New Badges Earned!</p>
                  <div className="space-y-2">
                    {lastCheckInResult.newBadges.map((badge) => (
                      <div key={badge.id} className="text-left">
                        <p className="font-semibold text-gray-900 dark:text-white">
                          {badge.badgeIcon} {badge.badgeName}
                        </p>
                        <p className="text-xs text-gray-600 dark:text-gray-400">
                          {badge.badgeDescription} (+{badge.points} pts)
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <button
                onClick={() => setShowCheckInModal(false)}
                className="w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 font-semibold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
