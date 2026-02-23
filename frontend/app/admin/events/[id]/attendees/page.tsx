/**
 * ADMIN - EVENT ATTENDEES PAGE
 * Path: /admin/events/[id]/attendees
 * View all attendees for a specific event with export to CSV
 */
'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import api from '@/services/api';

export default function EventAttendeesPage() {
  const params = useParams();
  const router = useRouter();
  const [event, setEvent] = useState<any>(null);
  const [attendees, setAttendees] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (!userData || JSON.parse(userData).role !== 'ADMIN') {
      router.push('/');
      return;
    }
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [eventRes, attendeesRes] = await Promise.all([
        api.get(`/events/${params.id}`),
        api.get(`/registrations/event/${params.id}/attendees`)
      ]);
      
      setEvent(eventRes.data);
      setAttendees(attendeesRes.data);
      document.title = `${eventRes.data.title} - Attendees - EventHub Pro`;
    } catch (error) {
      console.error('Error fetching data:', error);
      document.title = 'Event Attendees - Admin - EventHub Pro';
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      PENDING: 'bg-yellow-100 text-yellow-800',
      APPROVED: 'bg-green-100 text-green-800',
      REJECTED: 'bg-red-100 text-red-800'
    };
    return styles[status as keyof typeof styles] || 'bg-gray-100 text-gray-800';
  };

  const approvedAttendees = attendees.filter(a => a.status === 'APPROVED');
  const pendingAttendees = attendees.filter(a => a.status === 'PENDING');

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8">
        <button
          onClick={() => router.push('/admin')}
          className="text-blue-500 hover:text-blue-700 mb-6"
        >
          ← Back to Admin Panel
        </button>

        {/* Event Header */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
          <h1 className="text-4xl font-bold mb-4">{event.title}</h1>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <p className="text-gray-500 text-sm">📅 Date</p>
              <p className="font-semibold">{new Date(event.date).toLocaleDateString()}</p>
            </div>
            <div>
              <p className="text-gray-500 text-sm">📍 Location</p>
              <p className="font-semibold">{event.location}</p>
            </div>
            <div>
              <p className="text-gray-500 text-sm">👥 Capacity</p>
              <p className="font-semibold">{event.currentAttendees} / {event.maxAttendees}</p>
            </div>
            <div>
              <p className="text-gray-500 text-sm">💰 Price</p>
              <p className="font-semibold">{event.price ? `$${event.price}` : 'Free'}</p>
            </div>
          </div>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-gradient-to-br from-green-500 to-green-600 text-white p-6 rounded-xl shadow-lg">
            <p className="text-green-100 text-sm">✓ Approved Attendees</p>
            <p className="text-4xl font-bold mt-2">{approvedAttendees.length}</p>
          </div>
          <div className="bg-gradient-to-br from-yellow-500 to-yellow-600 text-white p-6 rounded-xl shadow-lg">
            <p className="text-yellow-100 text-sm">⏳ Pending Approval</p>
            <p className="text-4xl font-bold mt-2">{pendingAttendees.length}</p>
          </div>
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white p-6 rounded-xl shadow-lg">
            <p className="text-blue-100 text-sm">📊 Total Registrations</p>
            <p className="text-4xl font-bold mt-2">{attendees.length}</p>
          </div>
        </div>

        {/* Attendees List */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <div className="p-6 border-b">
            <h2 className="text-2xl font-bold">Registered Attendees</h2>
          </div>

          {attendees.length === 0 ? (
            <div className="p-12 text-center text-gray-500">
              <div className="text-6xl mb-4">👥</div>
              <p className="text-xl">No registrations yet</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">#</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Payment</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Registered</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ticket</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {attendees.map((attendee, index) => (
                    <tr key={attendee.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="font-bold text-lg text-gray-700">#{index + 1}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="font-medium text-gray-900">{attendee.userName}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {attendee.userEmail}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        {attendee.paymentMethod || 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(attendee.registeredAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadge(attendee.status)}`}>
                          {attendee.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-mono">
                        {attendee.ticketCode || '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Export Button */}
        {attendees.length > 0 && (
          <div className="mt-6 text-center">
            <button
              onClick={() => {
                const csv = [
                  ['#', 'Name', 'Email', 'Payment Method', 'Registered', 'Status', 'Ticket Code'],
                  ...attendees.map((a, i) => [
                    i + 1,
                    a.userName,
                    a.userEmail,
                    a.paymentMethod || 'N/A',
                    new Date(a.registeredAt).toLocaleDateString(),
                    a.status,
                    a.ticketCode || '-'
                  ])
                ].map(row => row.join(',')).join('\n');
                
                const blob = new Blob([csv], { type: 'text/csv' });
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `${event.title}-attendees.csv`;
                a.click();
              }}
              className="bg-green-500 text-white px-6 py-3 rounded-lg hover:bg-green-600"
            >
              📥 Export to CSV
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
