/**
 * MOTA API Service
 * Production-ready API client with proper error handling
 * 
 * @version 2.1 - Fixed timeout handling
 * @author MOTA Development Team
 */

// ============================================
// CONFIGURATION
// ============================================

// IMPORTANT: Update this to your computer's IP address
// Find it by running 'ipconfig' in PowerShell and look for IPv4 Address
// Example: If your IP is 192.168.1.5, change the line below to:
// const API_BASE_URL = 'http://192.168.1.5:3001/api';

//const API_BASE_URL = 'http://192.168.0.9:3001/api';
const API_BASE_URL = 'https://unpromotable-manda-sprayfully.ngrok-free.dev/api';

// Request timeout in milliseconds (15 seconds)
const TIMEOUT_MS = 15000;

// Store the auth token in memory
let authToken: string | null = null;

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Fetch with timeout - wraps fetch to add timeout functionality
 */
const fetchWithTimeout = async (url: string, options: RequestInit = {}): Promise<Response> => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => {
    controller.abort();
    console.log('API: Request timed out after', TIMEOUT_MS, 'ms');
  }, TIMEOUT_MS);
  
  try {
    console.log('API: Fetching', url);
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    console.log('API: Response received, status:', response.status);
    return response;
  } catch (error: any) {
    clearTimeout(timeoutId);
    
    if (error.name === 'AbortError') {
      console.error('API: Request aborted (timeout)');
      throw new Error('Connection timeout. Please check:\n1. Backend is running (node server.js)\n2. IP address is correct in api.ts\n3. Your phone/emulator is on same network');
    }
    
    // Network error (no connection)
    if (error.message === 'Network request failed') {
      console.error('API: Network request failed');
      throw new Error('Cannot connect to server. Please check:\n1. Backend is running on port 3001\n2. IP address in api.ts matches your computer\n3. Phone and computer are on same WiFi');
    }
    
    console.error('API: Fetch error:', error.message);
    throw error;
  }
};

const getHeaders = (includeAuth: boolean = false): HeadersInit => {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  };
  
  if (includeAuth && authToken) {
    headers['Authorization'] = `Bearer ${authToken}`;
  }
  
  return headers;
};

const handleResponse = async (response: Response) => {
  let data;
  
  try {
    const text = await response.text();
    data = text ? JSON.parse(text) : {};
  } catch (parseError) {
    console.error('API: Failed to parse response');
    throw new Error('Invalid server response');
  }
  
  if (!response.ok) {
    const errorMessage = data.error || data.message || `Request failed with status ${response.status}`;
    console.error('API: Error response:', errorMessage);
    throw new Error(errorMessage);
  }
  
  return data;
};

// ============================================
// API SERVICE
// ============================================

const api = {
  // Token management
  setToken: (token: string | null) => {
    authToken = token;
    console.log('API: Auth token', token ? 'SET' : 'CLEARED');
  },
  
  getToken: () => authToken,

  // ==========================================
  // AUTHENTICATION ENDPOINTS
  // Backend uses /auth/login and /auth/register
  // ==========================================
  
  login: async (email: string, password: string) => {
    console.log('API: Login attempt for:', email);
    
    const response = await fetchWithTimeout(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ email, password }),
    });
    
    const data = await handleResponse(response);
    
    if (data.token) {
      authToken = data.token;
      console.log('API: Login successful');
    }
    
    return data;
  },

  register: async (name: string, email: string, password: string) => {
    console.log('API: Register attempt for:', email);
    
    const response = await fetchWithTimeout(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ name, email, password }),
    });
    
    const data = await handleResponse(response);
    
    if (data.token) {
      authToken = data.token;
      console.log('API: Registration successful');
    }
    
    return data;
  },

  // ==========================================
  // USER PROFILE
  // ==========================================
  
  getProfile: async () => {
    if (!authToken) {
      throw new Error('Not authenticated');
    }
    
    console.log('API: Fetching profile');
    
    const response = await fetchWithTimeout(`${API_BASE_URL}/users/profile`, {
      method: 'GET',
      headers: getHeaders(true),
    });
    
    return handleResponse(response);
  },

  updateProfile: async (updates: any) => {
    if (!authToken) {
      throw new Error('Not authenticated');
    }
    
    const response = await fetchWithTimeout(`${API_BASE_URL}/users/profile`, {
      method: 'PUT',
      headers: getHeaders(true),
      body: JSON.stringify(updates),
    });
    
    return handleResponse(response);
  },

  // ==========================================
  // RESTAURANTS
  // ==========================================
  
  getRestaurants: async (params?: { featured?: boolean; category?: string; limit?: number }) => {
    let url = `${API_BASE_URL}/restaurants`;
    
    if (params) {
      const queryParams = new URLSearchParams();
      if (params.featured) queryParams.append('featured', 'true');
      if (params.category) queryParams.append('category', params.category);
      if (params.limit) queryParams.append('limit', params.limit.toString());
      
      const queryString = queryParams.toString();
      if (queryString) url += `?${queryString}`;
    }
    
    try {
      const response = await fetchWithTimeout(url, { 
        method: 'GET',
        headers: getHeaders() 
      });
      return handleResponse(response);
    } catch (error) {
      console.error('API: Error fetching restaurants:', error);
      return [];
    }
  },

  getRestaurant: async (id: string) => {
    const response = await fetchWithTimeout(`${API_BASE_URL}/restaurants/${id}`, {
      method: 'GET',
      headers: getHeaders(),
    });
    return handleResponse(response);
  },

  // ==========================================
  // ACTIVITIES
  // ==========================================
  
  getActivities: async (params?: { featured?: boolean; category?: string; limit?: number }) => {
    let url = `${API_BASE_URL}/activities`;
    
    if (params) {
      const queryParams = new URLSearchParams();
      if (params.featured) queryParams.append('featured', 'true');
      if (params.category) queryParams.append('category', params.category);
      if (params.limit) queryParams.append('limit', params.limit.toString());
      
      const queryString = queryParams.toString();
      if (queryString) url += `?${queryString}`;
    }
    
    try {
      const response = await fetchWithTimeout(url, { 
        method: 'GET',
        headers: getHeaders() 
      });
      return handleResponse(response);
    } catch (error) {
      console.error('API: Error fetching activities:', error);
      return [];
    }
  },

  getActivity: async (id: string) => {
    const response = await fetchWithTimeout(`${API_BASE_URL}/activities/${id}`, {
      method: 'GET',
      headers: getHeaders(),
    });
    return handleResponse(response);
  },

  // ==========================================
  // EVENTS
  // ==========================================
  
  getEvents: async (params?: { featured?: boolean; upcoming?: boolean; limit?: number }) => {
    let url = `${API_BASE_URL}/events`;
    
    if (params) {
      const queryParams = new URLSearchParams();
      if (params.featured) queryParams.append('featured', 'true');
      if (params.upcoming) queryParams.append('upcoming', 'true');
      if (params.limit) queryParams.append('limit', params.limit.toString());
      
      const queryString = queryParams.toString();
      if (queryString) url += `?${queryString}`;
    }
    
    try {
      const response = await fetchWithTimeout(url, { 
        method: 'GET',
        headers: getHeaders() 
      });
      return handleResponse(response);
    } catch (error) {
      console.error('API: Error fetching events:', error);
      return [];
    }
  },

  getEvent: async (id: string) => {
    const response = await fetchWithTimeout(`${API_BASE_URL}/events/${id}`, {
      method: 'GET',
      headers: getHeaders(),
    });
    return handleResponse(response);
  },

  // ==========================================
  // BOOKINGS
  // ==========================================
  
  createBooking: async (bookingData: {
    type: 'restaurant' | 'activity' | 'event';
    itemId: string;
    itemName: string;
    date: string;
    time?: string;
    guests: number;
    notes?: string;
    totalPrice?: number;
  }) => {
    if (!authToken) {
      throw new Error('Please sign in to make a booking');
    }
    
    const response = await fetchWithTimeout(`${API_BASE_URL}/bookings`, {
      method: 'POST',
      headers: getHeaders(true),
      body: JSON.stringify(bookingData),
    });
    
    return handleResponse(response);
  },

  getMyBookings: async () => {
    if (!authToken) {
      throw new Error('Not authenticated');
    }
    
    try {
      const response = await fetchWithTimeout(`${API_BASE_URL}/bookings`, {
        method: 'GET',
        headers: getHeaders(true),
      });
      return handleResponse(response);
    } catch (error) {
      console.error('API: Error fetching bookings:', error);
      return [];
    }
  },

  cancelBooking: async (bookingId: string) => {
    if (!authToken) {
      throw new Error('Not authenticated');
    }
    
    const response = await fetchWithTimeout(`${API_BASE_URL}/bookings/${bookingId}/cancel`, {
      method: 'PUT',
      headers: getHeaders(true),
    });
    
    return handleResponse(response);
  },

  // ==========================================
  // OFFERS
  // ==========================================
  
  getOffers: async () => {
    try {
      const response = await fetchWithTimeout(`${API_BASE_URL}/offers`, {
        method: 'GET',
        headers: getHeaders(),
      });
      return handleResponse(response);
    } catch (error) {
      console.error('API: Error fetching offers:', error);
      return [];
    }
  },

  validateOfferCode: async (code: string) => {
    if (!authToken) {
      throw new Error('Please sign in to use offer codes');
    }
    
    const response = await fetchWithTimeout(`${API_BASE_URL}/offers/validate`, {
      method: 'POST',
      headers: getHeaders(true),
      body: JSON.stringify({ code }),
    });
    
    return handleResponse(response);
  },

  // ==========================================
  // FAVORITES
  // ==========================================
  
  addFavorite: async (itemId: string, itemType: 'restaurant' | 'activity' | 'event') => {
    if (!authToken) {
      throw new Error('Please sign in to save favorites');
    }
    
    const response = await fetchWithTimeout(`${API_BASE_URL}/users/favorites`, {
      method: 'POST',
      headers: getHeaders(true),
      body: JSON.stringify({ itemId, itemType }),
    });
    
    return handleResponse(response);
  },

  removeFavorite: async (itemId: string) => {
    if (!authToken) {
      throw new Error('Not authenticated');
    }
    
    const response = await fetchWithTimeout(`${API_BASE_URL}/users/favorites/${itemId}`, {
      method: 'DELETE',
      headers: getHeaders(true),
    });
    
    return handleResponse(response);
  },

  getFavorites: async () => {
    if (!authToken) {
      throw new Error('Not authenticated');
    }
    
    try {
      const response = await fetchWithTimeout(`${API_BASE_URL}/users/favorites`, {
        method: 'GET',
        headers: getHeaders(true),
      });
      return handleResponse(response);
    } catch (error) {
      console.error('API: Error fetching favorites:', error);
      return [];
    }
  },

  // ==========================================
  // UTILITY
  // ==========================================
  
  healthCheck: async () => {
    try {
      const response = await fetchWithTimeout(`${API_BASE_URL.replace('/api', '')}`, {
        method: 'GET',
        headers: getHeaders(),
      });
      return { status: 'ok', statusCode: response.status };
    } catch (error: any) {
      console.error('API: Health check failed:', error.message);
      throw error;
    }
  },

  // Test connection - useful for debugging
  testConnection: async () => {
    console.log('API: Testing connection to', API_BASE_URL);
    try {
      const response = await fetchWithTimeout(`${API_BASE_URL.replace('/api', '')}`, {
        method: 'GET',
      });
      console.log('API: Connection test successful, status:', response.status);
      return true;
    } catch (error: any) {
      console.error('API: Connection test failed:', error.message);
      return false;
    }
  },
};

export default api;
