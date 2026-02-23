/**
 * ADMIN - ANALYTICS DASHBOARD
 * Path: /admin/analytics
 * Display event statistics and category distribution
 */
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import api from '@/services/api';
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer
} from 'recharts';

interface EventStats {
  id: number;
  title: string;
  registrations: number;
  checkedIn: number;
  revenue: number;
  date: string;
  category: string;
}

interface CategoryData {
  name: string;
  value: number;
}

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4', '#f97316'];

export default function AnalyticsDashboard() {
  const router = useRouter();
  const [events, setEvents] = useState<EventStats[]>([]);
  const [categoryData, setCategoryData] = useState<CategoryData[]>([]);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);
  const [totalRegistrations, setTotalRegistrations] = useState(0);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [totalCheckIns, setTotalCheckIns] = useState(0);
  const [checkInRate, setCheckInRate] = useState(0);

  useEffect(() => {
    setMounted(true);
    document.title = 'Analytics - Admin - EventHub Pro';
    
    const userData = localStorage.getItem('user');
    if (!userData || JSON.parse(userData).role !== 'ADMIN') {
      router.push('/');
      return;
    }
    
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      // Fetch all events
      const eventsResponse = await api.get('/events?page=0&size=100');
      const eventsList = eventsResponse.data.content || eventsResponse.data;

      // Fetch registrations for each event
      const eventStatsPromises = eventsList.map(async (event: any) => {
        try {
          const regsResponse = await api.get(`/registrations/event/${event.id}`);
          const registrations = regsResponse.data || [];
          
          const checkedInCount = registrations.filter((r: any) => r.checkedIn).length;
          
          return {
            id: event.id,
            title: event.title,
            registrations: registrations.length,
            checkedIn: checkedInCount,
            revenue: (event.price || 0) * registrations.length,
            date: new Date(event.date).toLocaleDateString(),
            category: event.category || 'Other'
          };
        } catch (error) {
          return {
            id: event.id,
            title: event.title,
            registrations: 0,
            checkedIn: 0,
            revenue: 0,
            date: new Date(event.date).toLocaleDateString(),
            category: event.category || 'Other'
          };
        }
      });

      const eventStats = await Promise.all(eventStatsPromises);
      setEvents(eventStats);

      // Calculate totals
      const totalRegs = eventStats.reduce((sum, e) => sum + e.registrations, 0);
      const totalRev = eventStats.reduce((sum, e) => sum + e.revenue, 0);
      const totalChecked = eventStats.reduce((sum, e) => sum + e.checkedIn, 0);
      
      setTotalRegistrations(totalRegs);
      setTotalRevenue(totalRev);
      setTotalCheckIns(totalChecked);
      setCheckInRate(totalRegs > 0 ? Math.round((totalChecked / totalRegs) * 100) : 0);

      // Generate category distribution
      const categoryCount: { [key: string]: number } = {};
      eventStats.forEach(event => {
        const cat = event.category || 'Other';
        categoryCount[cat] = (categoryCount[cat] || 0) + 1;
      });

      const categoryDistribution = Object.entries(categoryCount).map(([name, value]) => ({
        name,
        value
      }));
      setCategoryData(categoryDistribution);

      setLoading(false);
    } catch (error) {
      console.error('Error fetching analytics:', error);
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Loading analytics...</div>
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
          <button
            onClick={() => router.push('/admin')}
            className="text-blue-500 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 mb-4"
          >
            ← Back to Admin Panel
          </button>
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white">📊 Analytics Dashboard</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">Event statistics and performance metrics</p>
        </div>

        {/* Category Distribution - Donut Chart */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 mb-8">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">🎯 Event Categories</h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={categoryData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={2}
                dataKey="value"
              >
                {categoryData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#1f2937', 
                  border: '2px solid #8b5cf6', 
                  borderRadius: '8px', 
                  color: '#fff'
                }}
                formatter={(value) => `${value} events`}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="mt-4 grid grid-cols-2 gap-2">
            {categoryData.map((cat, idx) => (
              <div key={cat.name} className="flex items-center gap-2">
                <div 
                  className="w-3 h-3 rounded-full" 
                  style={{ backgroundColor: COLORS[idx % COLORS.length] }}
                ></div>
                <span className="text-sm text-gray-600 dark:text-gray-400">{cat.name}</span>
              </div>
            ))}
          </div>
        </div>


      </div>
    </div>
  );
}
