'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import { getEvent } from '@/services/api';
import api from '@/services/api';
import { showSuccess, showError, showWarning } from '@/utils/toast';

export default function RegisterEventPage() {
  const params = useParams();
  const router = useRouter();
  const [event, setEvent] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('');
  const [paymentProof, setPaymentProof] = useState('');

  const paymentAccounts = {
    telebirr: '0921348555',
    cbe: '1000307857026'
  };

  useEffect(() => {
    fetchEvent();
  }, [params.id]);

  const fetchEvent = async () => {
    try {
      const response = await getEvent(Number(params.id));
      setEvent(response.data);
      document.title = `Register - ${response.data.title} - EventHub Pro`;
    } catch (error) {
      console.error('Error fetching event:', error);
      document.title = 'Register for Event - EventHub Pro';
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPaymentProof(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!paymentMethod) {
      showWarning('Please select a payment method');
      return;
    }
    
    if (!paymentProof) {
      showWarning('Please upload payment proof screenshot');
      return;
    }

    setSubmitting(true);
    try {
      await api.post('/registrations', {
        eventId: event.id,
        paymentMethod,
        paymentProof
      });
      
      showSuccess('Registration submitted successfully! Awaiting admin approval.');
      setTimeout(() => router.push('/my-tickets'), 1500);
    } catch (error: any) {
      showError(error.response?.data?.error || 'Failed to register. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  const isFree = !event.price || event.price === 0;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto">
          <button
            onClick={() => router.back()}
            className="mb-6 text-blue-500 hover:text-blue-700 flex items-center"
          >
            ← Back to Event
          </button>

          <div className="bg-white rounded-2xl shadow-xl p-8">
            <h1 className="text-3xl font-bold mb-6">Register for Event</h1>
            
            {/* Event Info */}
            <div className="bg-blue-50 rounded-xl p-6 mb-8">
              <h2 className="text-2xl font-bold text-blue-900 mb-2">{event.title}</h2>
              <p className="text-blue-700">📅 {new Date(event.date).toLocaleString()}</p>
              <p className="text-blue-700">📍 {event.location}</p>
              <p className="text-2xl font-bold text-green-600 mt-4">
                {isFree ? 'FREE EVENT' : `Price: $${event.price}`}
              </p>
            </div>

            {isFree ? (
              <div className="text-center py-8">
                <p className="text-xl mb-6">This is a free event. Click below to register!</p>
                <button
                  onClick={async () => {
                    try {
                      await api.post('/registrations', { eventId: event.id });
                      alert('Successfully registered!');
                      router.push('/dashboard');
                    } catch (error: any) {
                      alert(error.response?.data?.error || 'Failed to register');
                    }
                  }}
                  className="bg-green-500 text-white px-8 py-3 rounded-xl hover:bg-green-600 text-lg font-semibold"
                >
                  Register Now
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit}>
                {/* Payment Instructions */}
                <div className="mb-8">
                  <h3 className="text-xl font-bold mb-4">💳 Payment Instructions</h3>
                  <div className="bg-yellow-50 border-2 border-yellow-200 rounded-xl p-6">
                    <p className="font-semibold mb-4">Please transfer ${event.price} to one of the following accounts:</p>
                    
                    <div className="space-y-4">
                      <div className="bg-white p-4 rounded-lg">
                        <p className="font-bold text-lg">📱 Telebirr</p>
                        <p className="text-2xl font-mono text-blue-600">{paymentAccounts.telebirr}</p>
                      </div>
                      
                      <div className="bg-white p-4 rounded-lg">
                        <p className="font-bold text-lg">🏦 CBE Bank</p>
                        <p className="text-2xl font-mono text-blue-600">{paymentAccounts.cbe}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Payment Method Selection */}
                <div className="mb-6">
                  <label className="block text-lg font-bold mb-3">Select Payment Method *</label>
                  <div className="grid grid-cols-2 gap-4">
                    <button
                      type="button"
                      onClick={() => setPaymentMethod('Telebirr')}
                      className={`p-4 rounded-xl border-2 transition ${
                        paymentMethod === 'Telebirr'
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-blue-300'
                      }`}
                    >
                      <p className="text-2xl mb-2">📱</p>
                      <p className="font-bold">Telebirr</p>
                    </button>
                    
                    <button
                      type="button"
                      onClick={() => setPaymentMethod('CBE')}
                      className={`p-4 rounded-xl border-2 transition ${
                        paymentMethod === 'CBE'
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-blue-300'
                      }`}
                    >
                      <p className="text-2xl mb-2">🏦</p>
                      <p className="font-bold">CBE Bank</p>
                    </button>
                  </div>
                </div>

                {/* Screenshot Upload */}
                <div className="mb-8">
                  <label className="block text-lg font-bold mb-3">Upload Payment Screenshot *</label>
                  <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                      id="payment-proof"
                    />
                    <label htmlFor="payment-proof" className="cursor-pointer">
                      {paymentProof ? (
                        <div>
                          <img src={paymentProof} alt="Payment proof" className="max-h-64 mx-auto rounded-lg mb-4" />
                          <p className="text-green-600 font-semibold">✓ Screenshot uploaded</p>
                          <p className="text-sm text-gray-500 mt-2">Click to change</p>
                        </div>
                      ) : (
                        <div>
                          <div className="text-6xl mb-4">📸</div>
                          <p className="text-lg font-semibold mb-2">Click to upload screenshot</p>
                          <p className="text-sm text-gray-500">Upload a clear screenshot of your payment confirmation</p>
                        </div>
                      )}
                    </label>
                  </div>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={submitting || !paymentMethod || !paymentProof}
                  className="w-full bg-gradient-to-r from-green-500 to-green-600 text-white py-4 rounded-xl hover:from-green-600 hover:to-green-700 disabled:from-gray-400 disabled:to-gray-400 transition font-bold text-lg shadow-lg"
                >
                  {submitting ? 'Submitting...' : 'Submit Registration'}
                </button>

                <p className="text-center text-sm text-gray-500 mt-4">
                  Your registration will be reviewed by an admin. You'll receive your ticket once approved.
                </p>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
