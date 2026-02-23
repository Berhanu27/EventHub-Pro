/**
 * ADMIN - PENDING REGISTRATIONS PAGE
 * Path: /admin/registrations
 * Review and approve/reject event registrations with payment proofs
 */
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import api from '@/services/api';

export default function AdminRegistrationsPage() {
  const router = useRouter();
  const [pendingRegistrations, setPendingRegistrations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProof, setSelectedProof] = useState<string | null>(null);

  useEffect(() => {
    document.title = 'Pending Registrations - Admin - EventHub Pro';
    
    const userData = localStorage.getItem('user');
    if (!userData || JSON.parse(userData).role !== 'ADMIN') {
      router.push('/');
      return;
    }
    fetchPendingRegistrations();
  }, []);

  const fetchPendingRegistrations = async () => {
    try {
      const response = await api.get('/registrations/pending');
      setPendingRegistrations(response.data);
    } catch (error) {
      console.error('Error fetching registrations:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id: number) => {
    if (!confirm('Approve this registration and generate ticket?')) return;
    
    try {
      await api.post(`/registrations/${id}/approve`);
      alert('Registration approved! Ticket generated.');
      fetchPendingRegistrations();
    } catch (error: any) {
      alert(error.response?.data?.error || 'Failed to approve');
    }
  };

  const handleReject = async (id: number) => {
    if (!confirm('Reject this registration?')) return;
    
    try {
      await api.post(`/registrations/${id}/reject`);
      alert('Registration rejected.');
      fetchPendingRegistrations();
    } catch (error: any) {
      alert(error.response?.data?.error || 'Failed to reject');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    );
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
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white">Pending Registrations</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">Review and approve event registrations</p>
        </div>

        {pendingRegistrations.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-12 text-center">
            <div className="text-6xl mb-4">✅</div>
            <h2 className="text-2xl font-bold text-gray-700 dark:text-gray-300 mb-2">All caught up!</h2>
            <p className="text-gray-500 dark:text-gray-400">No pending registrations to review</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            {pendingRegistrations.map((reg) => (
              <div key={reg.id} className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* User & Event Info */}
                  <div className="lg:col-span-2">
                    <div className="mb-4">
                      <h3 className="text-2xl font-bold text-gray-800 dark:text-white">{reg.eventTitle}</h3>
                      <p className="text-gray-600 dark:text-gray-400">📅 {new Date(reg.eventDate).toLocaleString()}</p>
                    </div>
                    
                    <div className="bg-blue-50 dark:bg-blue-900/30 rounded-xl p-4 mb-4">
                      <h4 className="font-bold text-lg mb-2 text-gray-900 dark:text-white">👤 User Information</h4>
                      <p className="text-gray-800 dark:text-gray-300"><strong>Name:</strong> {reg.userName}</p>
                      <p className="text-gray-800 dark:text-gray-300"><strong>Email:</strong> {reg.userEmail}</p>
                      <p className="text-gray-800 dark:text-gray-300"><strong>Registered:</strong> {new Date(reg.registeredAt).toLocaleString()}</p>
                    </div>

                    <div className="bg-green-50 dark:bg-green-900/30 rounded-xl p-4">
                      <h4 className="font-bold text-lg mb-2 text-gray-900 dark:text-white">💳 Payment Information</h4>
                      <p className="text-gray-800 dark:text-gray-300"><strong>Method:</strong> {reg.paymentMethod}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">Click on screenshot to view full size</p>
                    </div>
                  </div>

                  {/* Payment Proof */}
                  <div>
                    <h4 className="font-bold mb-2 text-gray-900 dark:text-white">💳 Payment Screenshot</h4>
                    {reg.paymentProof ? (
                      <div>
                        <img
                          src={reg.paymentProof}
                          alt="Payment proof"
                          className="w-full rounded-lg cursor-pointer hover:opacity-90 transition"
                          onClick={() => setSelectedProof(reg.paymentProof)}
                        />
                      </div>
                    ) : (
                      <div className="bg-gray-100 rounded-lg p-8 text-center text-gray-500">
                        No screenshot provided
                      </div>
                    )}

                    {/* Action Buttons */}
                    <div className="mt-4 space-y-2">
                      <button
                        onClick={() => handleApprove(reg.id)}
                        className="w-full bg-green-500 text-white py-3 rounded-xl hover:bg-green-600 font-semibold"
                      >
                        ✓ Approve & Generate Ticket
                      </button>
                      <button
                        onClick={() => handleReject(reg.id)}
                        className="w-full bg-red-500 text-white py-3 rounded-xl hover:bg-red-600 font-semibold"
                      >
                        ✗ Reject
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Image Modal */}
        {selectedProof && (
          <div
            className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4"
            onClick={() => setSelectedProof(null)}
          >
            <div className="max-w-4xl max-h-full">
              <img
                src={selectedProof}
                alt="Payment proof full size"
                className="max-w-full max-h-screen rounded-lg"
              />
              <p className="text-white text-center mt-4">Click anywhere to close</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
