/**
 * LEADERBOARD PAGE
 * Path: /leaderboard
 * Display top check-in users with streaks and points
 */
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import api from '@/services/api';

interface LeaderboardEntry {
  userId: number;
  userName: string;
  totalPoints: number;
  currentStreak: number;
  longestStreak: number;
  totalCheckIns: number;
}

export default function LeaderboardPage() {
  const router = useRouter();
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);
  const [userStats, setUserStats] = useState<any>(null);

  useEffect(() => {
    setMounted(true);
    document.title = 'Leaderboard - EventHub Pro';
    fetchLeaderboard();
    fetchUserStats();
  }, []);

  const fetchLeaderboard = async () => {
    try {
      const response = await api.get('/check-in/leaderboard');
      setLeaderboard(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
      setLoading(false);
    }
  };

  const fetchUserStats = async () => {
    try {
      const response = await api.get('/check-in/my-stats');
      setUserStats(response.data);
    } catch (error) {
      console.error('Error fetching user stats:', error);
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
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navbar />

      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white">🏆 Leaderboard</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">Top check-in champions</p>
        </div>

        {/* Your Stats */}
        {userStats && (
          <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-2xl shadow-lg p-6 mb-8">
            <h2 className="text-2xl font-bold mb-4">Your Stats</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <p className="text-blue-100 text-sm">Total Check-ins</p>
                <p className="text-3xl font-bold">{userStats.totalCheckIns}</p>
              </div>
              <div>
                <p className="text-blue-100 text-sm">Current Streak</p>
                <p className="text-3xl font-bold">🔥 {userStats.currentStreak}</p>
              </div>
              <div>
                <p className="text-blue-100 text-sm">Longest Streak</p>
                <p className="text-3xl font-bold">⭐ {userStats.longestStreak}</p>
              </div>
              <div>
                <p className="text-blue-100 text-sm">Total Points</p>
                <p className="text-3xl font-bold">⚡ {userStats.totalPoints}</p>
              </div>
            </div>
          </div>
        )}

        {/* Leaderboard Table */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 dark:text-gray-300 uppercase">Rank</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 dark:text-gray-300 uppercase">User</th>
                  <th className="px-6 py-4 text-center text-xs font-bold text-gray-500 dark:text-gray-300 uppercase">Points</th>
                  <th className="px-6 py-4 text-center text-xs font-bold text-gray-500 dark:text-gray-300 uppercase">Current Streak</th>
                  <th className="px-6 py-4 text-center text-xs font-bold text-gray-500 dark:text-gray-300 uppercase">Longest Streak</th>
                  <th className="px-6 py-4 text-center text-xs font-bold text-gray-500 dark:text-gray-300 uppercase">Check-ins</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {leaderboard.map((entry, index) => (
                  <tr key={entry.userId} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {index === 0 && <span className="text-2xl mr-2">🥇</span>}
                        {index === 1 && <span className="text-2xl mr-2">🥈</span>}
                        {index === 2 && <span className="text-2xl mr-2">🥉</span>}
                        {index > 2 && <span className="text-lg font-bold text-gray-500 dark:text-gray-400 mr-2">#{index + 1}</span>}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-semibold text-gray-900 dark:text-white">{entry.userName}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-bold bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200">
                        ⚡ {entry.totalPoints}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-bold bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200">
                        🔥 {entry.currentStreak}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-bold bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200">
                        ⭐ {entry.longestStreak}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <span className="text-gray-900 dark:text-white font-semibold">{entry.totalCheckIns}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {leaderboard.length === 0 && (
            <div className="text-center py-12 text-gray-500 dark:text-gray-400">
              <p className="text-lg">No check-ins yet. Be the first!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
