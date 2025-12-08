/**
 * MOTA API Service
 * Connects mobile app to backend
 */

// Change this to your backend URL
// For local development: http://localhost:3001
// For production: https://your-domain.com
const API_BASE_URL = 'http://192.168.0.9:3001/api';

// For Android emulator, use: http://10.0.2.2:3001/api
// For iOS simulator, use: http://localhost:3001/api
// For physical device, use your computer's IP: http://192.168.x.x:3001/api

class ApiService {
  private token: string | null = null;

  setToken(token: string | null) {
    this.token = token;
  }

  private async request(endpoint: string, options: RequestInit = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (this.token) {
      (headers as Record<string, string>)['Authorization'] = `Bearer ${this.token}`;
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Request failed');
      }

      return data;
    } catch (error) {
      console.error(`API Error (${endpoint}):`, error);
      throw error;
    }
  }

  // ============================================
  // AUTH
  // ============================================

  async login(email: string, password: string) {
    const data = await this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    this.token = data.token;
    return data;
  }

  async register(name: string, email: string, password: string, phone?: string) {
    const data = await this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ name, email, password, phone }),
    });
    this.token = data.token;
    return data;
  }

  // ============================================
  // RESTAURANTS
  // ============================================

  async getRestaurants(params?: { featured?: boolean; category?: string; limit?: number }) {
    let query = '';
    if (params) {
      const queryParams = new URLSearchParams();
      if (params.featured) queryParams.append('featured', 'true');
      if (params.category) queryParams.append('category', params.category);
      if (params.limit) queryParams.append('limit', params.limit.toString());
      query = `?${queryParams.toString()}`;
    }
    return this.request(`/restaurants${query}`);
  }

  async getRestaurant(id: string) {
    return this.request(`/restaurants/${id}`);
  }

  // ============================================
  // ACTIVITIES
  // ============================================

  async getActivities(params?: { featured?: boolean; category?: string; limit?: number }) {
    let query = '';
    if (params) {
      const queryParams = new URLSearchParams();
      if (params.featured) queryParams.append('featured', 'true');
      if (params.category) queryParams.append('category', params.category);
      if (params.limit) queryParams.append('limit', params.limit.toString());
      query = `?${queryParams.toString()}`;
    }
    return this.request(`/activities${query}`);
  }

  async getActivity(id: string) {
    return this.request(`/activities/${id}`);
  }

  // ============================================
  // EVENTS
  // ============================================

  async getEvents(params?: { featured?: boolean; upcoming?: boolean; limit?: number }) {
    let query = '';
    if (params) {
      const queryParams = new URLSearchParams();
      if (params.featured) queryParams.append('featured', 'true');
      if (params.upcoming) queryParams.append('upcoming', 'true');
      if (params.limit) queryParams.append('limit', params.limit.toString());
      query = `?${queryParams.toString()}`;
    }
    return this.request(`/events${query}`);
  }

  async getEvent(id: string) {
    return this.request(`/events/${id}`);
  }

  async rsvpEvent(eventId: string) {
    return this.request(`/events/${eventId}/rsvp`, {
      method: 'POST',
    });
  }

  // ============================================
  // OFFERS
  // ============================================

  async getOffers(params?: { type?: string }) {
    let query = '';
    if (params?.type) {
      query = `?type=${params.type}`;
    }
    return this.request(`/offers${query}`);
  }

  async validateOfferCode(code: string) {
    return this.request('/offers/validate', {
      method: 'POST',
      body: JSON.stringify({ code }),
    });
  }

  // ============================================
  // BOOKINGS
  // ============================================

  async createBooking(booking: {
    type: 'restaurant' | 'activity' | 'event';
    itemId: string;
    itemName: string;
    date: string;
    time?: string;
    guests?: number;
    specialRequests?: string;
    totalPrice?: number;
    offerCode?: string;
  }) {
    return this.request('/bookings', {
      method: 'POST',
      body: JSON.stringify(booking),
    });
  }

  async getMyBookings() {
    return this.request('/bookings');
  }
}

export const api = new ApiService();
export default api;
