/**
 * MY TICKETS PAGE
 * Path: /my-tickets
 * View all user's tickets and registration status
 */
'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import api from '@/services/api';
import QRCode from 'qrcode';

export default function MyTicketsPage() {
  const router = useRouter();
  const [registrations, setRegistrations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const qrCanvasRefs = useRef<{ [key: number]: HTMLCanvasElement | null }>({});

  useEffect(() => {
    document.title = 'My Tickets - EventHub Pro';
    
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }
    fetchMyRegistrations();
  }, []);

  useEffect(() => {
    // Generate QR codes for approved tickets
    registrations.forEach((reg) => {
      if (reg.status === 'APPROVED' && reg.ticketCode && qrCanvasRefs.current[reg.id]) {
        const canvas = qrCanvasRefs.current[reg.id];
        if (canvas) {
          QRCode.toCanvas(canvas, reg.ticketCode, {
            width: 200,
            margin: 2,
            color: {
              dark: '#059669',
              light: '#FFFFFF'
            }
          });
        }
      }
    });
  }, [registrations]);

  const fetchMyRegistrations = async () => {
    try {
      const response = await api.get('/registrations/my-events');
      setRegistrations(response.data);
    } catch (error) {
      console.error('Error fetching registrations:', error);
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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 transition-colors">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold mb-8 dark:text-white">My Tickets & Registrations</h1>

        {registrations.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-12 text-center transition-colors">
            <div className="text-6xl mb-4">🎫</div>
            <h2 className="text-2xl font-bold text-gray-700 dark:text-gray-200 mb-2">No registrations yet</h2>
            <p className="text-gray-500 dark:text-gray-400 mb-6">Register for events to see your tickets here</p>
            <button
              onClick={() => router.push('/events')}
              className="bg-blue-500 text-white px-6 py-3 rounded-xl hover:bg-blue-600"
            >
              Browse Events
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            {registrations.map((reg) => (
              <div key={reg.id} className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden transition-colors">
                <div className="bg-gradient-to-r from-blue-500 to-purple-500 p-6 text-white">
                  <div className="flex justify-between items-start">
                    <div>
                      <h2 className="text-2xl font-bold mb-2">{reg.eventTitle}</h2>
                      <p className="text-blue-100">📅 {new Date(reg.eventDate).toLocaleString()}</p>
                    </div>
                    <span className={`px-4 py-2 rounded-full font-semibold ${getStatusBadge(reg.status)}`}>
                      {reg.status}
                    </span>
                  </div>
                </div>

                <div className="p-6">
                  {reg.status === 'PENDING' && (
                    <div className="bg-yellow-50 border-2 border-yellow-200 rounded-xl p-4 mb-4">
                      <p className="font-semibold text-yellow-800">⏳ Awaiting Admin Approval</p>
                      <p className="text-sm text-yellow-700 mt-1">
                        Your payment is being reviewed. You'll receive your ticket once approved.
                      </p>
                    </div>
                  )}

                  {reg.status === 'REJECTED' && (
                    <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4 mb-4">
                      <p className="font-semibold text-red-800">❌ Registration Rejected</p>
                      <p className="text-sm text-red-700 mt-1">
                        Please contact support for more information.
                      </p>
                    </div>
                  )}

                  {reg.status === 'APPROVED' && reg.ticketCode && (
                    <div className="bg-green-50 border-2 border-green-200 rounded-xl p-6 mb-4">
                      <div className="text-center">
                        <p className="text-sm text-green-700 mb-2">✓ Your Ticket - Approved!</p>
                        
                        {/* Registration Order */}
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                          <p className="text-blue-700">
                            🎫 You registered as attendee <span className="font-bold text-2xl">#{reg.registrationOrder || '?'}</span>
                          </p>
                        </div>

                        {/* QR Code */}
                        <div className="bg-white dark:bg-gray-700 rounded-lg p-6 mb-4 inline-block transition-colors">
                          <canvas 
                            ref={(el) => { qrCanvasRefs.current[reg.id] = el; }}
                            className="mx-auto"
                          />
                          <div className="text-2xl font-bold text-green-600 dark:text-green-400 mt-3 font-mono">
                            {reg.ticketCode}
                          </div>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">Scan QR code at event entrance</p>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4 text-left">
                          <div>
                            <p className="text-sm text-gray-600 dark:text-gray-400">Name</p>
                            <p className="font-semibold dark:text-white">{reg.userName}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600 dark:text-gray-400">Email</p>
                            <p className="font-semibold dark:text-white">{reg.userEmail}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600 dark:text-gray-400">Registered</p>
                            <p className="font-semibold dark:text-white">{new Date(reg.registeredAt).toLocaleDateString()}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600 dark:text-gray-400">Approved</p>
                            <p className="font-semibold dark:text-white">{new Date(reg.approvedAt).toLocaleDateString()}</p>
                          </div>
                        </div>

                        <button
                          onClick={() => window.print()}
                          className="mt-4 bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600"
                        >
                          🖨️ Print Ticket
                        </button>
                      </div>
                    </div>
                  )}

                  {reg.paymentMethod && (
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      <p><strong>Payment Method:</strong> {reg.paymentMethod}</p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
