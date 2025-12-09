/**
 * MOTA API Service
 * Handles all API calls to the backend
 */

const API_URL = 'http://192.168.0.101:5001/api'; // Update this to your backend IP

// Store the auth token
let authToken: string | null = null;

const api = {
  setToken: (token: string | null) => {
    authToken = token;
  },

  // Auth endpoints
  login: async (email: string, password: string) => {
    const response = await fetch(`${API_URL}/users/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Login failed');
    if (data.token) authToken = data.token;
    return data;
  },

  register: async (name: string, email: string, password: string) => {
    const response = await fetch(`${API_URL}/users/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password }),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Registration failed');
    if (data.token) authToken = data.token;
    return data;
  },

  getProfile: async () => {
    if (!authToken) throw new Error('Not authenticated');
    const response = await fetch(`${API_URL}/users/profile`, {
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`,
      },
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Failed to get profile');
    return data;
  },

  // Restaurant endpoints
  getRestaurants: async () => {
    const response = await fetch(`${API_URL}/restaurants`);
    if (!response.ok) return [];
    return response.json();
  },

  // Activity endpoints
  getActivities: async () => {
    const response = await fetch(`${API_URL}/activities`);
    if (!response.ok) return [];
    return response.json();
  },

  // Event endpoints
  getEvents: async () => {
    const response = await fetch(`${API_URL}/events`);
    if (!response.ok) return [];
    return response.json();
  },

  // Booking endpoints
  createBooking: async (bookingData: any) => {
    if (!authToken) throw new Error('Not authenticated');
    const response = await fetch(`${API_URL}/bookings`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`,
      },
      body: JSON.stringify(bookingData),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Booking failed');
    return data;
  },

  getMyBookings: async () => {
    if (!authToken) throw new Error('Not authenticated');
    const response = await fetch(`${API_URL}/bookings/my`, {
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`,
      },
    });
    if (!response.ok) return [];
    return response.json();
  },
};

export default api;
