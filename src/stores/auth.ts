import { defineStore } from 'pinia';
import { ref } from 'vue';

export interface User {
  id: string;
  email: string;
  name: string;
  subscription: {
    plan: 'free' | 'premium' | 'pro';
    status: 'active' | 'canceled' | 'expired';
    expiresAt: string | null;
  };
  createdAt: string;
}

export const useAuthStore = defineStore('auth', () => {
  // State
  const user = ref<User | null>(null);
  const isAuthenticated = ref(false);
  const isLoading = ref(false);
  const error = ref<string | null>(null);

  // Mock user for development - in production, this would be populated from an API
  const mockUser: User = {
    id: '1',
    email: 'user@example.com',
    name: 'Demo User',
    subscription: {
      plan: 'premium',
      status: 'active',
      expiresAt: null
    },
    createdAt: '2023-01-01T00:00:00.000Z'
  };

  // Actions
  const login = async (email: string, password: string) => {
    isLoading.value = true;
    error.value = null;
    
    try {
      // In production, this would be an API call
      // For development, we'll just set the mock user after a small delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      user.value = mockUser;
      isAuthenticated.value = true;
      
      // Save auth state to localStorage
      localStorage.setItem('auth', JSON.stringify({ 
        isAuthenticated: true,
        userId: mockUser.id
      }));
      
      return true;
    } catch (err) {
      error.value = 'Invalid email or password';
      return false;
    } finally {
      isLoading.value = false;
    }
  };

  const logout = () => {
    user.value = null;
    isAuthenticated.value = false;
    
    // Clear auth state from localStorage
    localStorage.removeItem('auth');
  };

  const checkAuth = async () => {
    isLoading.value = true;
    
    try {
      // Check localStorage for existing auth
      const auth = localStorage.getItem('auth');
      
      if (auth) {
        const parsedAuth = JSON.parse(auth);
        
        if (parsedAuth.isAuthenticated) {
          // In production, validate the token with an API call
          // For development, just set the mock user
          user.value = mockUser;
          isAuthenticated.value = true;
          return true;
        }
      }
      
      return false;
    } catch (err) {
      return false;
    } finally {
      isLoading.value = false;
    }
  };

  // Initialize
  checkAuth();

  return {
    user,
    isAuthenticated,
    isLoading,
    error,
    login,
    logout,
    checkAuth
  };
});