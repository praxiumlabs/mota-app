/**
 * MOTA API Service v3.4
 * Connects to real backend with graceful error handling
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

// ============================================
// 🔧 API CONFIGURATION - CHANGE MODE BELOW!
// ============================================

// Set to 'local', 'ngrok', or 'production'
const MODE = 'ngrok';  // ← CHANGE THIS

const URLS = {
  local: 'http://192.168.1.100:3001/api',      // Same WiFi - replace with your computer's IP
  ngrok: 'https://unpromotable-manda-sprayfully.ngrok-free.dev/api',  // ← PASTE YOUR NGROK URL
  production: 'https://mota-backend.onrender.com/api',  // Deployed backend
};

const API_BASE_URL = URLS[MODE];

// ============================================
const TOKEN_KEY = 'mota_auth_token';
const USER_KEY = 'mota_user';

// Endpoints that should fail silently (non-critical)
const SILENT_FAIL_ENDPOINTS = [
  '/content/slideshow/homepage',
  '/notifications/unread-count',
  '/notifications/my',
  '/fleet',
  '/nightlife',
  '/events',
  '/activities',
  '/restaurants',
  '/lodging',
];

class ApiService {
  private token: string | null = null;
  private isInitialized = false;

  constructor() {
    this.init();
  }

  private async init() {
    try {
      this.token = await AsyncStorage.getItem(TOKEN_KEY);
      this.isInitialized = true;
    } catch (e) {
      this.isInitialized = true;
    }
  }

  private async ensureInitialized() {
    if (!this.isInitialized) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }
  }

  setToken(token: string | null) {
    this.token = token;
    if (token) {
      AsyncStorage.setItem(TOKEN_KEY, token);
    } else {
      AsyncStorage.removeItem(TOKEN_KEY);
      AsyncStorage.removeItem(USER_KEY);
    }
  }

  private shouldSilentFail(endpoint: string): boolean {
    return SILENT_FAIL_ENDPOINTS.some(e => endpoint.includes(e));
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    await this.ensureInitialized();
    
    const url = `${API_BASE_URL}${endpoint}`;
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'ngrok-skip-browser-warning': 'true',
      ...(options.headers as Record<string, string>),
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    try {
      const response = await fetch(url, { ...options, headers });
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Request failed');
      }
      
      return data;
    } catch (error: any) {
      // Only log errors for critical endpoints
      if (!this.shouldSilentFail(endpoint)) {
        console.error(`API Error [${endpoint}]:`, error.message);
      }
      throw error;
    }
  }

  // ============================================
  // AUTH
  // ============================================
  async login(email: string, password: string) {
    try {
      const data = await this.request<{ token: string; user: any }>('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });
      
      this.setToken(data.token);
      await AsyncStorage.setItem(USER_KEY, JSON.stringify(data.user));
      
      return { token: data.token, user: data.user };
    } catch (error: any) {
      return { error: error.message || 'Login failed' };
    }
  }

  async register(name: string, email: string, password: string) {
    try {
      const data = await this.request<{ token: string; user: any }>('/auth/register', {
        method: 'POST',
        body: JSON.stringify({ name, email, password }),
      });
      
      this.setToken(data.token);
      await AsyncStorage.setItem(USER_KEY, JSON.stringify(data.user));
      
      return { token: data.token, user: data.user };
    } catch (error: any) {
      return { error: error.message || 'Registration failed' };
    }
  }

  async getProfile() {
    try {
      const cached = await AsyncStorage.getItem(USER_KEY);
      if (cached) return JSON.parse(cached);
      
      const user = await this.request<any>('/auth/me');
      await AsyncStorage.setItem(USER_KEY, JSON.stringify(user));
      return user;
    } catch (e) {
      return null;
    }
  }

  async logout() {
    this.setToken(null);
  }

  // ============================================
  // LODGING
  // ============================================
  async getLodging(params?: any) {
    try {
      const query = new URLSearchParams();
      if (params) {
        Object.entries(params).forEach(([key, value]) => {
          if (value !== undefined) query.append(key, String(value));
        });
      }
      const data = await this.request<{ lodging: any[] }>(`/lodging?${query}`);
      return data.lodging || [];
    } catch (e) {
      return [];
    }
  }

  async getFeaturedLodging() {
    try {
      return await this.request<any[]>('/lodging/featured');
    } catch (e) {
      return [];
    }
  }

  async getLodgingById(id: string) {
    return this.request<any>(`/lodging/${id}`);
  }

  // ============================================
  // RESTAURANTS
  // ============================================
  async getRestaurants(params?: { featured?: boolean; limit?: number; cuisine?: string; priceRange?: string }) {
    try {
      const query = new URLSearchParams();
      if (params) {
        Object.entries(params).forEach(([key, value]) => {
          if (value !== undefined) query.append(key, String(value));
        });
      }
      const data = await this.request<{ restaurants: any[] }>(`/restaurants?${query}`);
      return data.restaurants || [];
    } catch (e) {
      return [];
    }
  }

  async getFeaturedRestaurants() {
    try {
      return await this.request<any[]>('/restaurants/featured');
    } catch (e) {
      return [];
    }
  }

  async getRestaurant(id: string) {
    return this.request<any>(`/restaurants/${id}`);
  }

  // ============================================
  // ACTIVITIES
  // ============================================
  async getActivities(params?: { featured?: boolean; category?: string; limit?: number }) {
    try {
      const query = new URLSearchParams();
      if (params) {
        Object.entries(params).forEach(([key, value]) => {
          if (value !== undefined) query.append(key, String(value));
        });
      }
      const data = await this.request<{ activities: any[] }>(`/activities?${query}`);
      return data.activities || [];
    } catch (e) {
      return [];
    }
  }

  async getFeaturedActivities() {
    try {
      return await this.request<any[]>('/activities/featured');
    } catch (e) {
      return [];
    }
  }

  async getActivity(id: string) {
    return this.request<any>(`/activities/${id}`);
  }

  // ============================================
  // EVENTS
  // ============================================
  async getEvents(params?: { featured?: boolean; upcoming?: boolean; limit?: number }) {
    try {
      const query = new URLSearchParams();
      if (params) {
        Object.entries(params).forEach(([key, value]) => {
          if (value !== undefined) query.append(key, String(value));
        });
      }
      const data = await this.request<{ events: any[] }>(`/events?${query}`);
      return data.events || [];
    } catch (e) {
      return [];
    }
  }

  async getUpcomingEvents() {
    try {
      return await this.request<any[]>('/events/upcoming');
    } catch (e) {
      return [];
    }
  }

  async getEvent(id: string) {
    return this.request<any>(`/events/${id}`);
  }

  async rsvpEvent(eventId: string, data: { guests: number; dietaryRequirements?: string; specialRequests?: string }) {
    return this.request<any>(`/events/${eventId}/rsvp`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async cancelRSVP(eventId: string) {
    return this.request<any>(`/events/${eventId}/rsvp`, {
      method: 'DELETE',
    });
  }

  async getMyRSVPs() {
    try {
      return await this.request<any[]>('/events/user/rsvps');
    } catch (e) {
      return [];
    }
  }

  // ============================================
  // RESERVATIONS
  // ============================================
  async createBooking(data: {
    type: 'restaurant' | 'activity' | 'lodging' | 'nightlife';
    itemId: string;
    itemName: string;
    date: string;
    time?: string;
    guests: number;
    specialRequests?: string;
    dietaryRequirements?: string;
    occasion?: string;
  }) {
    return this.request<any>('/reservations', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getMyBookings(params?: { status?: string; type?: string }) {
    try {
      const query = new URLSearchParams();
      if (params) {
        Object.entries(params).forEach(([key, value]) => {
          if (value !== undefined) query.append(key, String(value));
        });
      }
      return await this.request<any[]>(`/reservations/my?${query}`);
    } catch (e) {
      return [];
    }
  }

  async cancelBooking(id: string, reason?: string) {
    return this.request<any>(`/reservations/${id}/cancel`, {
      method: 'PUT',
      body: JSON.stringify({ reason }),
    });
  }

  // ============================================
  // CONCIERGE
  // ============================================
  async submitConciergeRequest(data: {
    serviceCategory: string;
    serviceName: string;
    selectedOption: string;
    preferredDate: string;
    preferredTime?: string;
    guestCount?: number;
    specialRequests?: string;
  }) {
    return this.request<any>('/concierge/request', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async submitVIPConciergeRequest(data: any) {
    return this.request<any>('/concierge/vip-request', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getMyConciergeRequests() {
    try {
      return await this.request<any[]>('/concierge/my-requests');
    } catch (e) {
      return [];
    }
  }

  // ============================================
  // USER / FAVORITES
  // ============================================
  async updateProfile(data: Partial<{ name: string; phone: string; avatar: string }>) {
    const user = await this.request<any>('/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
    await AsyncStorage.setItem(USER_KEY, JSON.stringify(user));
    return user;
  }

  async addFavorite(itemId: string, itemType: string) {
    return this.request<any>('/users/favorites', {
      method: 'POST',
      body: JSON.stringify({ itemId, itemType }),
    });
  }

  async removeFavorite(itemId: string) {
    return this.request<any>(`/users/favorites/${itemId}`, {
      method: 'DELETE',
    });
  }

  async getMyFavorites() {
    try {
      const user = await this.getProfile();
      if (!user) return [];
      return await this.request<any[]>(`/users/${user._id}/favorites`);
    } catch (e) {
      return [];
    }
  }

  // ============================================
  // INVESTOR
  // ============================================
  async getInvestorDashboard() {
    return this.request<any>('/investors/dashboard');
  }

  async getInvestmentHistory() {
    try {
      return await this.request<any[]>('/investors/history');
    } catch (e) {
      return [];
    }
  }

  async getDocuments() {
    try {
      return await this.request<any[]>('/investors/documents');
    } catch (e) {
      return [];
    }
  }

  async getProjectUpdates() {
    try {
      return await this.request<any[]>('/investors/updates');
    } catch (e) {
      return [];
    }
  }

  async getFundingTimeline() {
    try {
      return await this.request<any[]>('/funding/timeline');
    } catch (e) {
      return [];
    }
  }

  // ============================================
  // SUPPORT CHAT
  // ============================================
  async getSupportChat() {
    return this.request<any>('/support/chat');
  }

  async sendSupportMessage(message: string, ticketId?: string) {
    return this.request<any>('/support/message', {
      method: 'POST',
      body: JSON.stringify({ message, ticketId }),
    });
  }

  async getSupportMessages() {
    try {
      const chat = await this.getSupportChat();
      return chat.messages || [];
    } catch (e) {
      return [{ _id: 'msg_001', sender: 'support', content: 'Welcome! How can we help you today?', createdAt: new Date().toISOString() }];
    }
  }

  // ============================================
  // OFFERS
  // ============================================
  async getOffers(params?: { type?: string; tier?: string; category?: string }) {
    try {
      const query = new URLSearchParams();
      if (params) {
        Object.entries(params).forEach(([key, value]) => {
          if (value !== undefined) query.append(key, String(value));
        });
      }
      return await this.request<any[]>(`/offers?${query}`);
    } catch (e) {
      return [];
    }
  }

  async validateOfferCode(code: string) {
    try {
      return await this.request<any>('/offers/validate', {
        method: 'POST',
        body: JSON.stringify({ code }),
      });
    } catch (e) {
      return { valid: false };
    }
  }

  // ============================================
  // NIGHTLIFE
  // ============================================
  async getNightlife(params?: { type?: string; featured?: boolean }) {
    try {
      const query = new URLSearchParams();
      if (params) {
        Object.entries(params).forEach(([key, value]) => {
          if (value !== undefined) query.append(key, String(value));
        });
      }
      const data = await this.request<{ nightlife: any[] }>(`/nightlife?${query}`);
      return data.nightlife || [];
    } catch (e) {
      return [];
    }
  }

  // ============================================
  // NEWSLETTER
  // ============================================
  async subscribe(email: string, name?: string) {
    return this.request<any>('/newsletter/subscribe', {
      method: 'POST',
      body: JSON.stringify({ email, name }),
    });
  }

  // ============================================
  // GENERIC HTTP METHODS
  // ============================================
  async get<T = any>(endpoint: string): Promise<{ data: T }> {
    const data = await this.request<T>(endpoint);
    return { data };
  }

  async post<T = any>(endpoint: string, body?: any): Promise<{ data: T }> {
    const data = await this.request<T>(endpoint, {
      method: 'POST',
      body: body ? JSON.stringify(body) : undefined,
    });
    return { data };
  }

  async put<T = any>(endpoint: string, body?: any): Promise<{ data: T }> {
    const data = await this.request<T>(endpoint, {
      method: 'PUT',
      body: body ? JSON.stringify(body) : undefined,
    });
    return { data };
  }

  async delete<T = any>(endpoint: string): Promise<{ data: T }> {
    const data = await this.request<T>(endpoint, {
      method: 'DELETE',
    });
    return { data };
  }

  // ============================================
  // CONTENT
  // ============================================
  async getSlideshow() {
    try {
      const data = await this.request<{ slides: any[] }>('/content/slideshow/homepage');
      return data.slides || [];
    } catch (e) {
      return [];
    }
  }

  async getContent(key: string) {
    try {
      return await this.request<any>(`/content/${key}`);
    } catch (e) {
      return null;
    }
  }

  // ============================================
  // EXOTIC FLEET (PCH)
  // ============================================
  async getFleet(params?: { type?: string; featured?: boolean }) {
    try {
      const query = new URLSearchParams();
      if (params) {
        Object.entries(params).forEach(([key, value]) => {
          if (value !== undefined) query.append(key, String(value));
        });
      }
      const data = await this.request<{ fleet: any[] }>(`/fleet?${query}`);
      return data.fleet || [];
    } catch (e) {
      return [];
    }
  }

  async getCars() {
    try {
      const data = await this.request<{ cars: any[] }>('/fleet/cars');
      return data.cars || [];
    } catch (e) {
      return [];
    }
  }

  async getYachts() {
    try {
      const data = await this.request<{ yachts: any[] }>('/fleet/yachts');
      return data.yachts || [];
    } catch (e) {
      return [];
    }
  }

  // ============================================
  // FILE UPLOAD
  // ============================================
  async uploadProfileImage(base64Image: string) {
    try {
      return await this.request<{ success: boolean; imageUrl: string }>('/upload/base64/profile', {
        method: 'POST',
        body: JSON.stringify({ image: base64Image }),
      });
    } catch (e) {
      throw e;
    }
  }

  async uploadImage(type: string, itemId: string, base64Image: string) {
    try {
      return await this.request<{ success: boolean; imageUrl: string }>(`/upload/base64/${type}`, {
        method: 'POST',
        body: JSON.stringify({ image: base64Image, itemId }),
      });
    } catch (e) {
      throw e;
    }
  }
}

export default new ApiService();
