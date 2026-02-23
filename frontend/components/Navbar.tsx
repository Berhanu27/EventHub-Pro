'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function Navbar() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    }
    
    const savedTheme = localStorage.getItem('theme') as 'light' | 'dark';
    if (savedTheme) {
      setTheme(savedTheme);
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    router.push('/');
  };

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    document.documentElement.classList.toggle('dark', newTheme === 'dark');
  };

  return (
    <nav className="bg-blue-600 dark:bg-gray-800 text-white shadow-lg transition-colors">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <div className="flex items-center space-x-6">
          <h1 className="text-2xl font-bold cursor-pointer" onClick={() => router.push('/')}>
            🎯 EventHub Pro
          </h1>
          <a href="/events" className="hover:text-blue-200 dark:hover:text-gray-300">Events</a>
          <a href="/leaderboard" className="hover:text-blue-200 dark:hover:text-gray-300">🏆 Leaderboard</a>
          
          {user?.role === 'ADMIN' ? (
            <a href="/admin" className="hover:text-blue-200 dark:hover:text-gray-300">Admin Panel</a>
          ) : (
            <>
              <a href="/dashboard" className="hover:text-blue-200 dark:hover:text-gray-300">Dashboard</a>
              <a href="/my-tickets" className="hover:text-blue-200 dark:hover:text-gray-300">My Tickets</a>
            </>
          )}
        </div>
        
        <div className="flex items-center space-x-4">
          {/* Dark Mode Toggle */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg hover:bg-blue-700 dark:hover:bg-gray-700 transition-colors"
            title={theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
          >
            {theme === 'light' ? '🌙' : '☀️'}
          </button>
          
          {user && (
            <>
              <span className="text-sm">
                {user.name} {user.role === 'ADMIN' && '(Admin)'}
              </span>
              <a
                href="/account-settings"
                className="text-sm hover:text-blue-200 dark:hover:text-gray-300 transition-colors"
                title="Account Settings"
              >
                ⚙️
              </a>
              <button
                onClick={handleLogout}
                className="bg-red-500 px-4 py-2 rounded hover:bg-red-600 dark:bg-red-600 dark:hover:bg-red-700"
              >
                Logout
              </button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
