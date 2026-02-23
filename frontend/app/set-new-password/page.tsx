/**
 * SET NEW PASSWORD PAGE
 * Path: /set-new-password
 * User sets new password after admin approval
 */
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import axios from 'axios';
import { showSuccess, showError } from '@/utils/toast';

export default function SetNewPasswordPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [checkingApproval, setCheckingApproval] = useState(false);
  const [hasApproval, setHasApproval] = useState<boolean | null>(null);

  const checkApproval = async () => {
    if (!email) {
      showError('Please enter your email');
      return;
    }

    setCheckingApproval(true);
    try {
      const response = await axios.post('http://localhost:8080/api/auth/check-reset-approval', { email });
      setHasApproval(response.data.approved);
      if (!response.data.approved) {
        showError('No approved password reset request found for this email');
      }
    } catch (error: any) {
      showError('Failed to check approval status');
      setHasApproval(false);
    } finally {
      setCheckingApproval(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (newPassword.length < 6) {
      showError('Password must be at least 6 characters');
      return;
    }

    if (newPassword !== confirmPassword) {
      showError('Passwords do not match');
      return;
    }

    setLoading(true);
    try {
      await axios.post('http://localhost:8080/api/auth/set-new-password', {
        email,
        newPassword
      });
      showSuccess('Password updated successfully! You can now login.');
      setTimeout(() => router.push('/login'), 2000);
    } catch (error: any) {
      showError(error.response?.data?.error || 'Failed to update password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full">
        <h1 className="text-3xl font-bold mb-2 text-center">Set New Password</h1>
        <p className="text-gray-600 text-center mb-6">
          Enter your email and new password
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-gray-700 font-semibold mb-2">Email Address</label>
            <div className="flex gap-2">
              <input
                type="email"
                className="flex-1 px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setHasApproval(null);
                }}
                placeholder="your.email@example.com"
                required
              />
              <button
                type="button"
                onClick={checkApproval}
                disabled={checkingApproval}
                className="px-4 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-400"
              >
                {checkingApproval ? '...' : 'Check'}
              </button>
            </div>
            {hasApproval === true && (
              <p className="text-green-600 text-sm mt-1">✓ Approved! You can set a new password.</p>
            )}
            {hasApproval === false && (
              <p className="text-red-600 text-sm mt-1">✗ No approval found. Please request password reset first.</p>
            )}
          </div>

          {hasApproval === true && (
            <>
              <div>
                <label className="block text-gray-700 font-semibold mb-2">New Password</label>
                <input
                  type="password"
                  className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter new password"
                  required
                  minLength={6}
                />
                <p className="text-xs text-gray-500 mt-1">Minimum 6 characters</p>
              </div>

              <div>
                <label className="block text-gray-700 font-semibold mb-2">Confirm Password</label>
                <input
                  type="password"
                  className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm new password"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-green-500 text-white py-3 rounded-lg hover:bg-green-600 disabled:bg-gray-400 font-semibold"
              >
                {loading ? 'Updating...' : 'Update Password'}
              </button>
            </>
          )}
        </form>

        <div className="mt-6 text-center space-y-2">
          <Link href="/login" className="block text-blue-500 hover:text-blue-700">
            ← Back to Login
          </Link>
          <Link href="/forgot-password" className="block text-sm text-gray-500 hover:text-gray-700">
            Request password reset
          </Link>
        </div>
      </div>
    </div>
  );
}
