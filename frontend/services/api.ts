import axios from 'axios';

const api = axios.create({
  baseURL: `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth
export const register = (data: { name: string; email: string; password: string }) =>
  api.post('/auth/register', data);

export const login = (data: { email: string; password: string }) =>
  api.post('/auth/login', data);

// Events
export const getEvents = (page: number = 0, size: number = 12) => 
  api.get('/events', { params: { page, size } });
export const getEvent = (id: number) => api.get(`/events/${id}`);
export const createEvent = (data: any) => api.post('/events', data);
export const updateEvent = (id: number, data: any) => api.put(`/events/${id}`, data);
export const deleteEvent = (id: number) => api.delete(`/events/${id}`);
export const getFeaturedEvents = () => api.get('/events/featured');
export const getEventsByCategory = (category: string) => api.get(`/events/category/${category}`);

// Categories
export const getCategories = () => api.get('/categories');

// Registrations
export const registerForEvent = (eventId: number) => 
  api.post('/registrations', { eventId });
export const cancelRegistration = (id: number) => 
  api.delete(`/registrations/${id}`);
export const getMyEvents = () => api.get('/registrations/my-events');

export default api;
