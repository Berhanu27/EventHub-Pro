/**
 * ADMIN - PASSWORD RESET REQUESTS PAGE
 * Path: /admin/password-resets
 * Review and approve/reject password reset requests
 */
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import api from '@/services/api';
import { showSuccess, showError } from '@/utils/toast';

export default function AdminPasswordResetsPage() {
  const router = useRouter();
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<number | null>(null);

  useEffect(() => {
    document.title = 'Password Reset Requests - Admin - EventHub Pro';
    
    const userData = localStorage.getItem('user');
    if (!userData || JSON.parse(userData).role !== 'ADMIN') {
      router.push('/');
      return;
    }
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      console.log('Fetching password reset requests...');
      const response = await api.get('/password-reset-requests/pending');
      console.log('Received requests:', response.data);
      setRequests(response.data);
    } catch (error: any) {
      console.error('Error fetching requests:', error);
      console.error('Error response:', error.response?.data);
      showError('Failed to load password reset requests');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id: number) => {
    if (!confirm('Approve this password reset request? User will be able to set a new password.')) return;
    
    setProcessingId(id);
    try {
      await api.post(`/password-reset-requests/${id}/approve`);
      showSuccess('Request approved! User can now set a new password.');
      fetchRequests();
    } catch (error: any) {
      showError(error.response?.data?.error || 'Failed to approve');
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (id: number) => {
    if (!confirm('Reject this password reset request?')) return;
    
    setProcessingId(id);
    try {
      await api.post(`/password-reset-requests/${id}/reject`);
      showSuccess('Request rejected');
      fetchRequests();
    } catch (error: any) {
      showError(error.response?.data?.error || 'Failed to reject');
    } finally {
      setProcessingId(null);
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
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white">Password Reset Requests</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">Review and process user password reset requests</p>
        </div>

        {requests.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-12 text-center">
            <div className="text-6xl mb-4">✅</div>
            <h2 className="text-2xl font-bold text-gray-700 dark:text-gray-300 mb-2">All caught up!</h2>
            <p className="text-gray-500 dark:text-gray-400">No pending password reset requests</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            {requests.map((request) => (
              <div key={request.id} className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h3 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">{request.userName}</h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-1">📧 {request.userEmail}</p>
                    <p className="text-gray-600 dark:text-gray-400 mb-3">🕐 {new Date(request.requestedAt).toLocaleString()}</p>
                    
                    <div className="bg-blue-50 dark:bg-blue-900/30 rounded-xl p-4">
                      <p className="font-semibold text-gray-700 dark:text-gray-300 mb-1">Reason:</p>
                      <p className="text-gray-600 dark:text-gray-400">{request.reason}</p>
                    </div>
                  </div>

                  <div className="ml-6 space-y-2">
                    <button
                      onClick={() => handleApprove(request.id)}
                      disabled={processingId === request.id}
                      className="w-48 bg-green-500 text-white py-3 px-4 rounded-xl hover:bg-green-600 disabled:bg-gray-400 font-semibold"
                    >
                      ✓ Approve Request
                    </button>
                    <button
                      onClick={() => handleReject(request.id)}
                      disabled={processingId === request.id}
                      className="w-48 bg-red-500 text-white py-3 px-4 rounded-xl hover:bg-red-600 disabled:bg-gray-400 font-semibold"
                    >
                      ✗ Reject
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
