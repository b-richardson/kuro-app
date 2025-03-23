import { defineStore } from 'pinia';
import { ref, onMounted, onUnmounted } from 'vue';
import type { User as SupabaseUser } from '@supabase/supabase-js';
import * as supabaseAuth from '@/services/supabase/auth';
import { supabase } from '@/services/supabase';

// Application-specific User type that extends Supabase user data
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
  // State (keeping the same interface for compatibility)
  const user = ref<User | null>(null);
  const isAuthenticated = ref(false);
  const isLoading = ref(false);
  const error = ref<string | null>(null);
  const authSubscription = ref<{ data: any } | null>(null);

  // Helper function to map Supabase user to our application User type
  const mapSupabaseUser = (supabaseUser: SupabaseUser): User => {
    // Extract user metadata or use defaults
    const userMetadata = supabaseUser.user_metadata || {};
    const name = userMetadata.name || supabaseUser.email?.split('@')[0] || 'User';
    
    // Default subscription plan for new users
    const subscription = userMetadata.subscription || {
      plan: 'free',
      status: 'active',
      expiresAt: null
    };

    return {
      id: supabaseUser.id,
      email: supabaseUser.email || '',
      name,
      subscription,
      createdAt: supabaseUser.created_at || new Date().toISOString()
    };
  };

  // Error handling helper
  const handleError = (err: any) => {
    console.error('Auth error:', err);
    const errorMessage = err?.message || err?.error_description || 'An authentication error occurred';
    error.value = errorMessage;
    return false;
  };

  // Login with email and password
  const login = async (email: string, password: string) => {
    isLoading.value = true;
    error.value = null;
    
    try {
      const { data, error: signInError } = await supabaseAuth.signIn(email, password);
      
      if (signInError) {
        throw signInError;
      }
      
      if (data?.user) {
        const mappedUser = mapSupabaseUser(data.user);
        user.value = mappedUser;
        isAuthenticated.value = true;
        return true;
      }
      
      throw new Error('No user returned from sign in');
    } catch (err) {
      return handleError(err);
    } finally {
      isLoading.value = false;
    }
  };

  // Sign up with email and password
  const signUp = async (email: string, password: string) => {
    isLoading.value = true;
    error.value = null;
    
    try {
      const { data, error: signUpError } = await supabaseAuth.signUp(email, password);
      
      if (signUpError) {
        throw signUpError;
      }
      
      // Check if confirmation is required
      if (data?.user?.identities?.length === 0) {
        return { success: true, confirmationRequired: true };
      }
      
      if (data?.user) {
        const mappedUser = mapSupabaseUser(data.user);
        user.value = mappedUser;
        isAuthenticated.value = true;
        return { success: true, confirmationRequired: false };
      }
      
      throw new Error('No user returned from sign up');
    } catch (err) {
      handleError(err);
      return { success: false, confirmationRequired: false };
    } finally {
      isLoading.value = false;
    }
  };

  // Logout the user
  const logout = async () => {
    isLoading.value = true;
    
    try {
      const { error: signOutError } = await supabaseAuth.signOut();
      
      if (signOutError) {
        throw signOutError;
      }
      
      user.value = null;
      isAuthenticated.value = false;
      return true;
    } catch (err) {
      handleError(err);
      // Still clear local state even on API error
      user.value = null;
      isAuthenticated.value = false;
      return false;
    } finally {
      isLoading.value = false;
    }
  };

  // Check authentication status
  const checkAuth = async () => {
    isLoading.value = true;
    
    try {
      const { data: sessionData, error: sessionError } = await supabaseAuth.getSession();
      
      if (sessionError) {
        throw sessionError;
      }
      
      if (sessionData?.session) {
        // Get user details
        const { data: userData, error: userError } = await supabaseAuth.getUser();
        
        if (userError) {
          throw userError;
        }
        
        if (userData?.user) {
          const mappedUser = mapSupabaseUser(userData.user);
          user.value = mappedUser;
          isAuthenticated.value = true;
          return true;
        }
      }
      
      return false;
    } catch (err) {
      handleError(err);
      return false;
    } finally {
      isLoading.value = false;
    }
  };

  // Password reset request
  const resetPassword = async (email: string) => {
    isLoading.value = true;
    error.value = null;
    
    try {
      const { error: resetError } = await supabaseAuth.resetPassword(email);
      
      if (resetError) {
        throw resetError;
      }
      
      return true;
    } catch (err) {
      return handleError(err);
    } finally {
      isLoading.value = false;
    }
  };

  // Update profile data
  const updateProfile = async (profile: Partial<User>) => {
    isLoading.value = true;
    error.value = null;
    
    try {
      // Update user metadata in Supabase
      const { data, error: updateError } = await supabaseAuth.updateUser({
        data: {
          name: profile.name,
          subscription: profile.subscription
        }
      });
      
      if (updateError) {
        throw updateError;
      }
      
      if (data?.user) {
        // Update local user state
        user.value = {
          ...user.value!,
          ...profile
        };
        
        return true;
      }
      
      throw new Error('User update failed');
    } catch (err) {
      return handleError(err);
    } finally {
      isLoading.value = false;
    }
  };

  // Set up auth state change listener
  onMounted(() => {
    // Listen for auth state changes
    const { data } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session) {
        // Get user details and update store
        const { data: userData, error: userError } = await supabaseAuth.getUser();
        
        if (!userError && userData?.user) {
          user.value = mapSupabaseUser(userData.user);
          isAuthenticated.value = true;
        }
      } else if (event === 'SIGNED_OUT' || event === 'USER_DELETED') {
        // Clear user data on sign out
        user.value = null;
        isAuthenticated.value = false;
      } else if (event === 'TOKEN_REFRESHED' && session) {
        // Session refreshed, verify and update if needed
        if (!isAuthenticated.value) {
          const { data: userData, error: userError } = await supabaseAuth.getUser();
          
          if (!userError && userData?.user) {
            user.value = mapSupabaseUser(userData.user);
            isAuthenticated.value = true;
          }
        }
      }
    });
    
    // Store subscription for cleanup
    authSubscription.value = data;
    
    // Initialize auth state
    checkAuth();
  });

  // Clean up subscriptions
  onUnmounted(() => {
    if (authSubscription.value) {
      authSubscription.value.subscription.unsubscribe();
    }
  });

  return {
    // State
    user,
    isAuthenticated,
    isLoading,
    error,
    
    // Actions
    login,           // Maintained for backward compatibility
    signUp,          // New method for registration
    logout,          // Maintained for backward compatibility
    checkAuth,       // Maintained for backward compatibility
    resetPassword,   // Added for password reset
    updateProfile    // Added for profile updates
  };
});